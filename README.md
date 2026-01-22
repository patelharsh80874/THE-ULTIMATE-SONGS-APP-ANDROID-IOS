# 🎵 The Ultimate Songs App Android/Ios

![Platform](https://img.shields.io/badge/Platform-Android-green?style=for-the-badge&logo=android)
![React Native](https://img.shields.io/badge/Made%20with-React%20Native-61DAFB?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

A modern cross-platform music streaming app built with React Native CLI! This app provides extensive music player features, offline download, and artist/playlist browsing.

---

## ⚠️ Notice & Disclaimer

> **THE ULTIMATE SONGS** is **not affiliated** with JioSaavn, Spotify, or any other music platform.  
> All trademarks, copyrights, logos, images, and audio assets belong to their respective owners.  
> **This project is made strictly for educational and non-commercial purposes.**

---

## 📱 App Preview

<img width="160" height="750" alt="Screenshot_1769072676" src="https://github.com/user-attachments/assets/adc08b71-cd63-4146-a947-8a88b9097d0c" />
<img width="160" height="750" alt="Screenshot_1769072856" src="https://github.com/user-attachments/assets/b49ec9fc-3b2c-4214-a5ca-78317d6de6dd" />
<img width="160" height="750" alt="Screenshot_1761898042" src="https://github.com/user-attachments/assets/8aaf2c4a-c960-446c-8196-ac86d99347f0" />
<img width="160" height="750" alt="Screenshot_1769072907" src="https://github.com/user-attachments/assets/3404a620-d903-4d90-95b7-2e5837fb22ec" />
<img width="160" height="750" alt="Screenshot_1769072941" src="https://github.com/user-attachments/assets/7b05ff9a-d8c8-4c36-b313-eb5046256cd1" />
<img width="160" height="750" alt="Screenshot_1769072953" src="https://github.com/user-attachments/assets/cdb10991-d0e1-467d-ae64-3ec14911b8f0" />

---

## 🚀 Features (Updated – New Version)

* 🎧 **Advanced Music Player**

  * Mini & fullscreen playback
  * Seek, skip, pause/play
  * Add to playlist & queue
  * Background playback with system controls (lock screen / notification)

* 📜 **Smart Queue System (NEW ✨)**

  * Dedicated **Queue feature**
  * **Reorder songs using drag & drop**
  * Smooth real-time queue updates

* 🔍 **Powerful Search**

  * Search **songs, albums, playlists, artists**
  * Search inside **custom playlists**
  * Fast & optimized results

* ❤️ **Like & Save Songs**

  * Store favorite tracks locally
  * Persistent data using MMKV (High-performance local storage) 🚀

* 📋 **Custom Playlists (Enhanced ✨)**

  * Create, edit & delete playlists
  * **Dedicated playlist page**
  * **Reorder playlist songs using drag & drop**
  * **Search songs inside a playlist**

* 📥 **Import Custom Playlists (NEW ✨)**

  * Import your own custom playlists
  * Seamless integration with existing data

* 📻 **Radio Stations (NEW ✨)**

  * Category-based radio stations:

    * 🎶 Hindi And Others
    * 🎤 Artists
    * 🎬 Actors
  * Continuous playback experience

* ⬇️ **Offline Downloads**

  * Download songs for offline listening

* 🔄 **Background Playback**

  * Works even when app is minimized
  * Integrated with Android system media controls

* 📱 **Platform Support**

  * ✅ Android fully supported
  * 🍎 iOS version **coming soon**

---

## 🆕 What’s New in Latest Update

✨ **New & Improved Features**

* ✅ Queue system with **drag & drop reordering**
* ✅ Dedicated custom playlist page
* ✅ Playlist song reorder with drag & drop
* ✅ Search inside custom playlists
* ✅ Import custom playlists
* ✅ Radio stations (Hindi And Others, Artists, Actors)
* 🚀 **Storage upgraded from AsyncStorage to MMKV**

  * Faster data access
  * Better performance for large playlists
  * Improved app responsiveness
  
🚀 This update focuses on **better music control, personalization, and smoother user experience**.

## ⬇️ Download

[<img src="https://github.com/gokadzev/Musify/raw/master/repository_files/get-it-on-github.png" alt="Get it on Github" height="80">](https://github.com/patelharsh80874/THE-ULTIMATE-SONGS-APP-ANDROID-IOS/releases/latest)


---

## 💻 Tech Stack

| Category      | Technologies                        |
| ------------- | ----------------------------------- |
| Framework     | React Native                        |
| UI Styling    | NativeWind                          |
| HTTP Client   | Axios                               |
| Storage       | MMKV (High-performance local storage) 🚀                        |
| API           | [Unofficial JioSaavn API](https://saavn.sumit.co) |
| Platform      | Android (iOS coming soon)           |

---

## 🧩 Project Setup & Installation

### 1️⃣ Prerequisites

- [Node.js](https://nodejs.org/en/) (LTS)
- React Native CLI ([setup guide](https://reactnative.dev/docs/environment-setup))
- Android Studio (for emulator/device)
- npm or yarn

---

### 2️⃣ Clone & Install

```
git clone https://github.com/patelharsh80874/THE-ULTIMATE-SONGS-APP-ANDROID-IOS.git
cd TheUltimateSongsApp
npm install       # or yarn install
```

---

### 3️⃣ Running the App

```
npx react-native start         # Start the Metro Bundler
npx react-native run-android   # Launch on Android device/emulator
```

If you encounter issues, clear the cache:
```
npx react-native start --reset-cache
```

---

### 4️⃣ Generating a Signed APK

```
cd android
./gradlew assembleRelease
```
The release APK will be generated at:  
`android/app/build/outputs/apk/release/app-release.apk`  

Upload your APK to the GitHub **Releases** section for distribution.




## 🧠 Known Limitations

- ❌ iOS version is **under development** (Coming Soon)
- ⚠️ The public API may experience downtime

---

## 🤝 Contributing

Bug reports, feature requests, ideas, and PRs are always welcome!  
Please open an issue or submit a pull request with details.

---

## 🪪 License

MIT License  
Use, modify, and distribute freely — with credit to the original author.

---

## 📞 Contact

👨‍💻 Developed with ❤️ by HARSH PATEL 

🌐 GitHub: [patelharsh80874](https://github.com/patelharsh80874)  
📧 Email: [patelharsh80874@yahoo.com](mailto:patelharsh80874@yahoo.com)   
🌐 Instagram: [patelharsh.in](https://www.instagram.com/patelharsh.in)

---

## 🌟 Acknowledgements

- 🎵 [JioSaavn API (Unofficial)](https://saavn.sumit.co) for music data
- 💻 React Native Community

---









