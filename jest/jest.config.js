/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// RNOH JS 白盒测试配置
// 运行方式：npm run test
// 覆盖方式：npm run test:coverage
module.exports = {
  // rootDir 指向工程根目录（jest/ 的上一级），使 testMatch / setupFiles / coverage
  // 都基于工程根目录解析。
  rootDir: '..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/jest/__tests__/*-test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFiles: ['<rootDir>/jest/jest.setup.js'],
  globals: {
    __DEV__: true,
  },
  transform: {
    // 纯 JS 测试文件：babel-jest + preset-env（ESM -> CJS）
    // configFile/babelrc 显式关闭，避免加载工程根目录的 metro babel 预设
    // （module:@react-native/babel-preset，测试环境未安装）。
    '^.+\\.jsx?$': [
      'babel-jest',
      {
        configFile: false,
        babelrc: false,
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
          '@babel/preset-flow',
        ],
      },
    ],
    // src/**/*.ts、*.tsx 源文件：babel-jest + preset-typescript 剥离类型
    '^.+\\.tsx?$': [
      'babel-jest',
      {
        configFile: false,
        babelrc: false,
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }],
          ['@babel/preset-typescript', { allowDeclareFields: true }],
        ],
        plugins: ['@babel/plugin-transform-react-jsx'],
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!react-native|@react-native|react)'],
  // 覆盖率统计范围 = 本套白盒测试覆盖的 JS 层文件（API 转发 / 工具 / 事件 / Spec）。
  // components/ 等视图层文件依赖渲染环境，不在白盒范围内，不纳入统计。
  collectCoverageFrom: [
    'src/functions.ts',
    'src/helpers.ts',
    'src/events.ts',
    'src/components/StripeProvider.tsx',
    'src/specs/v1/NativeStripeSdkModule.ts',
  ],
  // 使用 v8 覆盖率采集（基于真实执行而非 istanbul 插桩）：
  // TurboModule spec 文件只有一条 `export default getEnforcing<Spec>(...)`
  // 语句，babel commonjs 转换后该语句丢失源码位置信息，istanbul 插桩会得到
  // 空 coverage（0%）；v8 provider 按实际执行统计，无此问题。
  coverageProvider: 'v8',
  coverageThreshold: {
    global: { branches: 60 },
  },
};
