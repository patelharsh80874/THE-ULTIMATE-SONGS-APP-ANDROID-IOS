import CryptoJS from "crypto-js";

const KEY = "38346591";

/* ------------------------------
   1. Create download URLs
-------------------------------- */
export function createDownloadLinks(encrypted) {
  if (!encrypted) return [];

  try {
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encrypted) },
      CryptoJS.enc.Utf8.parse(KEY),
      { mode: CryptoJS.mode.ECB }
    );

    const decryptedUrl = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedUrl || !decryptedUrl.includes("_")) return [];

    const qualities = [
      { id: "_12", quality: "12kbps" },
      { id: "_48", quality: "48kbps" },
      { id: "_96", quality: "96kbps" },
      { id: "_160", quality: "160kbps" },
      { id: "_320", quality: "320kbps" },
    ];

    const original = qualities.find(q => decryptedUrl.includes(q.id));
    if (!original) return [];

    return qualities.map(q => ({
      quality: q.quality,
      url: decryptedUrl.replace(original.id, q.id),
    }));
  } catch {
    return [];
  }
}

/* ------------------------------
   2. Create 3 image sizes
-------------------------------- */
function createImageQualities(url) {
  if (!url) return [];

  // extract base without size
  const base = url.replace(/-\d+x\d+\.jpg$/, "");

  return [
    { quality: "50x50", url: `${base}-50x50.jpg` },
    { quality: "150x150", url: `${base}-150x150.jpg` },
    { quality: "500x500", url: `${base}-500x500.jpg` },
  ];
}


/* ------------------------------
   3. FIX SONG FORMAT
-------------------------------- */
export function fixSongFormat(song) {
  const fixed = { ...song };

  //-----------------------------------------
  // FIX IMAGE FORMAT
  //-----------------------------------------
  if (Array.isArray(fixed.image)) {
    // If 3 images but same → regenerate
    if (fixed.image.length === 3) {
      const first = fixed.image[0].url;
      const allSame = fixed.image.every(i => i.url === first);
      if (allSame) fixed.image = createImageQualities(first);
    }
  } else if (typeof fixed.image === "string") {
    fixed.image = createImageQualities(fixed.image);
  }

  //-----------------------------------------
  // FIX DOWNLOAD URL 
  //-----------------------------------------
  if (!fixed.downloadUrl || fixed.downloadUrl.length === 0) {
    const encrypted =
      fixed.raw?.more_info?.encrypted_media_url ||
      fixed.more_info?.encrypted_media_url;

    if (encrypted) {
      fixed.downloadUrl = createDownloadLinks(encrypted);
    }
  }

  // Guarantee proper structure
  if (!fixed.downloadUrl) fixed.downloadUrl = [];
  if (!fixed.image) fixed.image = [];

  return fixed;
}
