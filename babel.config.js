module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@app': './src/app',
            '@shared': './src/shared',
            '@features': './src/features',
            '@ui': './src/shared/ui',
            '@lib': './src/shared/lib',
            '@types': './src/shared/types',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
