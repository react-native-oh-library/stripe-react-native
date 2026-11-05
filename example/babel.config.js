// 兼容 RN 0.72 与 0.84 两套依赖切换:
// - 0.73+(@react-native-oh 0.84 环境依赖里带 @react-native/babel-preset)
// - 0.72 及更早(使用 metro-react-native-babel-preset)
let preset = '@react-native/babel-preset';
try {
  require.resolve(preset);
} catch {
  preset = 'metro-react-native-babel-preset';
}

module.exports = {
  presets: [`module:${preset}`],
};
