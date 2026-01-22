// import React, {useState} from 'react';
// import {View, Text, TouchableOpacity, Modal, FlatList} from 'react-native';
// import {LanguageIcon, ArrowDownIcon, CheckIcon, MusicIcon} from './icons';
// import {BlurView} from '@react-native-community/blur';

// const LANGUAGES = [
//   {label: 'Hindi', value: 'hindi', emoji: '🇮🇳'},
//   {label: 'English', value: 'english', emoji: '🇬🇧'},
//   {label: 'Gujarati', value: 'gujarati', emoji: '🪔'},
//   {label: 'Punjabi', value: 'punjabi', emoji: '🎵'},
//   {label: 'Rajasthani', value: 'rajasthani', emoji: '🏜️'},
// ];

// export default function LanguageDropdown({selected, onSelect}) {
//   const [visible, setVisible] = useState(false);
//   const selectedLang = LANGUAGES.find(l => l.value === selected);

//   return (
//     <View className="mb-4">
//       <TouchableOpacity
//         onPress={() => setVisible(true)}
//         activeOpacity={0.8}
//         className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl p-4 flex-row justify-between items-center">
//         <View className="flex-row items-center gap-3">
//           <View className="w-10 h-10 bg-emerald-500/10 rounded-xl items-center justify-center">
//             <Text className="text-2xl">{selectedLang?.emoji}</Text>
//           </View>
//           <View>
//             <Text className="text-gray-400 text-xs font-semibold">
//               Language
//             </Text>
//             <Text className="text-white text-base font-bold capitalize">
//               {selected}
//             </Text>
//           </View>
//         </View>
//         <View className="bg-emerald-500/10 p-2 rounded-lg">
//           <ArrowDownIcon size={18} color="#10b981" />
//         </View>
//       </TouchableOpacity>

//       <Modal
//         visible={visible}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setVisible(false)}>
//         <TouchableOpacity
//           activeOpacity={1}
//           onPress={() => setVisible(false)}
//           className="flex-1 bg-black/80 justify-center items-center px-6">
//           <View className="w-full bg-slate-900 rounded-3xl overflow-hidden border border-gray-800">
//             {/* Header */}
//             <View className="p-6 border-b border-gray-800 bg-slate-950">
//               <Text className="text-white text-2xl font-bold mb-1">
//                 Choose Language
//               </Text>
//               <Text className="text-gray-400 text-sm">
//                 Select your preferred music language
//               </Text>
//             </View>

//             {/* Languages List */}
//             <FlatList
//               data={LANGUAGES}
//               keyExtractor={item => item.value}
//               renderItem={({item, index}) => {
//                 const isSelected = selected === item.value;
//                 return (
//                   <TouchableOpacity
//                     onPress={() => {
//                       onSelect(item.value);
//                       setVisible(false);
//                     }}
//                     activeOpacity={0.7}
//                     className={`p-5 border-b border-gray-800 ${
//                       isSelected ? 'bg-emerald-500/10' : ''
//                     }`}>
//                     <View className="flex-row items-center justify-between">
//                       <View className="flex-row items-center gap-4">
//                         <View
//                           className={`w-12 h-12 rounded-xl items-center justify-center ${
//                             isSelected ? 'bg-emerald-500' : 'bg-gray-800'
//                           }`}>
//                           <Text className="text-2xl">{item.emoji}</Text>
//                         </View>
//                         <View>
//                           <Text
//                             className={`text-lg font-bold ${
//                               isSelected ? 'text-emerald-400' : 'text-white'
//                             }`}>
//                             {item.label}
//                           </Text>
//                           <Text className="text-gray-500 text-xs mt-0.5">
//                             {item.value} music
//                           </Text>
//                         </View>
//                       </View>
//                       {isSelected && (
//                         <View className="bg-emerald-500 w-8 h-8 rounded-full items-center justify-center">
//                           <CheckIcon size={16} color="#fff" />
//                         </View>
//                       )}
//                     </View>
//                   </TouchableOpacity>
//                 );
//               }}
//             />
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </View>
//   );
// }




























import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import {LanguageIcon, ArrowDownIcon, CheckIcon} from './icons';
import {BlurView} from '@react-native-community/blur';

const LANGUAGES = [
  {label: 'Hindi', value: 'hindi', emoji: '🎵'},
  {label: 'English', value: 'english', emoji: '🎵'},
  {label: 'Gujarati', value: 'gujarati', emoji: '🎵'},
  {label: 'Punjabi', value: 'punjabi', emoji: '🎵'},
  {label: 'Rajasthani', value: 'rajasthani', emoji: '🎵'},
  {label: 'Tamil', value: 'tamil', emoji: '🎵'},
  {label: 'Telugu', value: 'telugu', emoji: '🎵'},
  {label: 'Marathi', value: 'marathi', emoji: '🎵'},
  {label: 'Kannada', value: 'kannada', emoji: '🎵'},
];

export default function LanguageDropdown({selected, onSelect}) {
  const [visible, setVisible] = useState(false);
  const selectedLang = LANGUAGES.find(l => l.value === selected);

  return (
    <View style={{marginBottom: 16}}>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
        style={{
          backgroundColor: 'rgba(31, 41, 55, 0.6)',
          backgroundColor: '#1e293b',
          borderRadius: 10,
          borderWidth: 1,
          borderColor: '#1f2937',
          paddingHorizontal: 10,
          paddingVertical: 7,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <View
            style={{
              width: 40,
              height: 40,
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              borderRadius: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{fontSize: 20}}>{selectedLang?.emoji}</Text>
          </View>
          <View>
            <Text style={{color: '#d1d5db', fontWeight: '600', fontSize: 12}}>
              Language
            </Text>
            <Text
              style={{color: '#fff', fontWeight: '700', fontSize: 16, textTransform: 'capitalize'}}>
              {selectedLang?.label}
            </Text>
          </View>
        </View>
        <View
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            padding: 6,
            borderRadius: 7,
          }}>
          <ArrowDownIcon size={18} color="#10b981" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType={Platform.OS === 'ios' ? 'fade' : 'slide'}
        onRequestClose={() => setVisible(false)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setVisible(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            justifyContent: 'center',
            paddingHorizontal: 30,
          }}>
          <View
            style={{
              backgroundColor: '#1e293b',
              borderRadius: 10,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: '#374151',
            }}>
            {/* Header */}
            <View
              style={{
                padding: 24,
                borderBottomWidth: 1,
                borderBottomColor: '#374151',
                backgroundColor: '#273549',
              }}>
              <Text
                style={{color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4}}>
                Choose Language
              </Text>
              <Text style={{color: '#94a3b8', fontSize: 14}}>
                Select your preferred music language
              </Text>
            </View>

            {/* Languages List */}
            <FlatList
              data={LANGUAGES}
              keyExtractor={item => item.value}
              renderItem={({item}) => {
                const isSelected = selected === item.value;
                return (
                  <TouchableOpacity
                    onPress={() => {
                      onSelect(item.value);
                      setVisible(false);
                    }}
                    activeOpacity={0.7}
                    style={{
                      paddingVertical: 18,
                      paddingHorizontal: 24,
                      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.3)' : 'transparent',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 16}}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 7,
                          backgroundColor: isSelected ? '#10b981' : '#1f2937',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <Text style={{fontSize: 20}}>{item.emoji}</Text>
                      </View>
                      <View>
                        <Text
                          style={{
                            color: isSelected ? '#a7f3d0' : '#e0e7ff',
                            fontSize: 17,
                            fontWeight: '700',
                          }}>
                          {item.label}
                        </Text>
                        <Text
                          style={{
                            color: isSelected ? '#a7f3d0' : '#94a3b8',
                            fontSize: 12,
                          }}>
                          {item.value} music
                        </Text>
                      </View>
                    </View>
                    {isSelected && (
                      <View
                        style={{
                          backgroundColor: '#10b981',
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <CheckIcon size={20} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
