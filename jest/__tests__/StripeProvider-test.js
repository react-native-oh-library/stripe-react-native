/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// src/components/StripeProvider.tsx（initStripe 初始化）白盒单元测试
//
// initStripe 的平台分支：
//   - android：注册一次 StripeKeepJsAwakeTask headless task（保持 JS 运行时），
//     并初始化 Onramp 模块；
//   - ios / harmony：仅调用 NativeStripeSdk.initialise。
// appInfo 在模块加载时根据 NativeModules.NativeUnimoduleProxy（Expo 基础设施）
// 是否存在决定归因字段。

jest.mock('react-native', () => ({
  NativeModules: {},
  Platform: { OS: 'harmony' },
  TurboModuleRegistry: {
    get: jest.fn(),
    getEnforcing: jest.fn(),
  },
  AppRegistry: {
    registerHeadlessTask: jest.fn(),
  },
}));

// helpers.ts 深依赖 RN 内部 TextInputState（进而拉入整条平台分支文件链），
// 与主包 react-native mock 一样需要拦截。
jest.mock(
  'react-native/Libraries/Components/TextInput/TextInputState',
  () => ({
    focusInput: jest.fn(),
    registerInput: jest.fn(),
    unregisterInput: jest.fn(),
    currentlyFocusedInput: jest.fn(),
  }),
);

function loadProvider(platformOS, nativeSdk, onrampSdk = null, options = {}) {
  jest.resetModules();
  const rn = require('react-native');
  rn.Platform.OS = platformOS;
  if (options.expo) {
    rn.NativeModules.NativeUnimoduleProxy = {};
  }
  rn.TurboModuleRegistry.getEnforcing.mockImplementation(() => nativeSdk);
  rn.TurboModuleRegistry.get.mockImplementation(
    (name) => (name === 'OnrampSdk' ? onrampSdk : null),
  );
  const mod = require('../../src/components/StripeProvider');
  return { mod, rn };
}

function createNativeSdk() {
  return { initialise: jest.fn(async () => undefined) };
}

describe('src/components/StripeProvider.tsx（initStripe）', () => {
  it('harmony 上调用 NativeStripeSdk.initialise 并携带 appInfo，不注册 headless task', async () => {
    const nativeSdk = createNativeSdk();
    const { mod, rn } = loadProvider('harmony', nativeSdk);
    await mod.initStripe({ publishableKey: 'pk_test' });
    expect(nativeSdk.initialise).toHaveBeenCalledTimes(1);
    expect(nativeSdk.initialise).toHaveBeenCalledWith({
      publishableKey: 'pk_test',
      appInfo: {
        name: '@oh-rn/stripe-react-native',
        url: 'https://github.com/stripe/stripe-react-native',
        version: '0.77.0',
        partnerId: undefined,
      },
    });
    expect(rn.AppRegistry.registerHeadlessTask).not.toHaveBeenCalled();
  });

  it('ios 上仅调用 NativeStripeSdk.initialise', async () => {
    const nativeSdk = createNativeSdk();
    const { mod } = loadProvider('ios', nativeSdk);
    await mod.initStripe({ publishableKey: 'pk_test' });
    expect(nativeSdk.initialise).toHaveBeenCalledWith(
      expect.objectContaining({ publishableKey: 'pk_test' }),
    );
  });

  it('android 上注册一次 StripeKeepJsAwakeTask 并初始化 Onramp 模块', async () => {
    const nativeSdk = createNativeSdk();
    const onrampSdk = createNativeSdk();
    const { mod, rn } = loadProvider('android', nativeSdk, onrampSdk);
    await mod.initStripe({ publishableKey: 'pk_test' });
    expect(rn.AppRegistry.registerHeadlessTask).toHaveBeenCalledWith(
      'StripeKeepJsAwakeTask',
      expect.any(Function),
    );
    expect(onrampSdk.initialise).toHaveBeenCalledTimes(1);
    // 再次初始化时 headless task 不会重复注册，原生 initialise 正常重复调用
    await mod.initStripe({ publishableKey: 'pk_test' });
    expect(rn.AppRegistry.registerHeadlessTask).toHaveBeenCalledTimes(1);
    expect(nativeSdk.initialise).toHaveBeenCalledTimes(2);
    expect(onrampSdk.initialise).toHaveBeenCalledTimes(2);
  });

  it('android 上 Onramp 模块缺失时不抛错', async () => {
    const nativeSdk = createNativeSdk();
    const { mod } = loadProvider('android', nativeSdk, null);
    await expect(
      mod.initStripe({ publishableKey: 'pk_test' }),
    ).resolves.toBeUndefined();
    expect(nativeSdk.initialise).toHaveBeenCalledTimes(1);
  });

  it('Expo 环境下 appInfo 归因为 /expo 并附带 partnerId', async () => {
    const nativeSdk = createNativeSdk();
    const { mod } = loadProvider('harmony', nativeSdk, null, { expo: true });
    await mod.initStripe({ publishableKey: 'pk_test' });
    expect(nativeSdk.initialise).toHaveBeenCalledWith({
      publishableKey: 'pk_test',
      appInfo: {
        name: '@oh-rn/stripe-react-native/expo',
        url: 'https://github.com/stripe/stripe-react-native',
        version: '0.77.0',
        partnerId: 'pp_partner_JBN7LkABco2yUu',
      },
    });
  });

  it('StripeProvider 作为 React 组件导出', () => {
    const { mod } = loadProvider('harmony', createNativeSdk());
    expect(typeof mod.StripeProvider).toBe('function');
  });
});
