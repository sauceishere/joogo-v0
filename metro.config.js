module.exports = {
    transformer: {
        babelTransformerPath: require.resolve(
            'react-native-typescript-transformer',
        ),
    },
};

// Change 1 (import the blacklist utility)
// const blacklist = require('metro-config/src/defaults/blacklist');
 
// module.exports = {
//   transformer: {
//     getTransformOptions: async () => ({
//       transform: {
//         experimentalImportSupport: false,
//         inlineRequires: false,
//       },
//     }),
//   },
//   resolver: {
//     // Change 2 (add 'bin' to assetExts)
//     assetExts: ['bin', 'txt', 'jpg', 'png', 'ttf'], // added 'png' and 'ttf' 2020425
//     sourceExts: ['js', 'json', 'ts', 'tsx', 'jsx', 'ttf'], // added 'ttf' 2020425
//     // Change 3 (add platform_node to blacklist)
//     blacklistRE: blacklist([/platform_node/])
//   },
// };