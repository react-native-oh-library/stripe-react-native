/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// src/events.ts（新架构事件兼容层）白盒单元测试
//
// events.ts 在模块加载时按平台选择发射器：
//   - ios            -> new NativeEventEmitter(NativeStripeSdkModule)
//   - android/harmony -> DeviceEventEmitter
// Onramp 事件发射器依赖 TurboModuleRegistry.get('OnrampSdk')，模块不可用时
// addOnrampListener 返回空操作订阅。

jest.mock('react-native', () => ({
  NativeModules: {},
  Platform: { OS: 'harmony' },
  TurboModuleRegistry: {
    get: jest.fn(),
    getEnforcing: jest.fn(),
  },
  DeviceEventEmitter: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
  NativeEventEmitter: class NativeEventEmitter {
    static instances = [];
    constructor(nativeModule) {
      this.nativeModule = nativeModule;
      NativeEventEmitter.instances.push(this);
    }
    addListener = jest.fn(() => ({ remove: jest.fn() }));
  },
}));

function loadEvents(platformOS, stripeSdk, onrampSdk = null) {
  jest.resetModules();
  const rn = require('react-native');
  rn.Platform.OS = platformOS;
  rn.TurboModuleRegistry.getEnforcing.mockImplementation(() => stripeSdk);
  rn.TurboModuleRegistry.get.mockImplementation(
    (name) => (name === 'OnrampSdk' ? onrampSdk : null),
  );
  const events = require('../../src/events');
  return { events, rn };
}

describe('src/events.ts（事件兼容层）', () => {
  describe('addListener', () => {
    it('harmony 上注册到 DeviceEventEmitter 并返回订阅', () => {
      const stripeSdk = { addListener: jest.fn(), removeListeners: jest.fn() };
      const { events, rn } = loadEvents('harmony', stripeSdk);
      const handler = () => {};
      const subscription = events.addListener(
        'onConfirmHandlerCallback',
        handler,
      );
      expect(rn.DeviceEventEmitter.addListener).toHaveBeenCalledWith(
        'onConfirmHandlerCallback',
        handler,
      );
      expect(typeof subscription.remove).toBe('function');
    });

    it('android 上同样注册到 DeviceEventEmitter', () => {
      const { events, rn } = loadEvents('android', {});
      events.addListener('embeddedPaymentElementWillPresent', () => {});
      expect(rn.DeviceEventEmitter.addListener).toHaveBeenCalledWith(
        'embeddedPaymentElementWillPresent',
        expect.any(Function),
      );
    });

    it('ios 上通过 NativeEventEmitter(NativeStripeSdkModule) 注册', () => {
      const stripeSdk = { addListener: jest.fn(), removeListeners: jest.fn() };
      const { events, rn } = loadEvents('ios', stripeSdk);
      const handler = () => {};
      events.addListener('onOrderTrackingCallback', handler);

      const emitter = rn.NativeEventEmitter.instances.at(-1);
      expect(emitter).toBeDefined();
      expect(emitter.nativeModule).toBe(stripeSdk);
      expect(emitter.addListener).toHaveBeenCalledWith(
        'onOrderTrackingCallback',
        handler,
      );
      // ios 上不应走 DeviceEventEmitter
      expect(rn.DeviceEventEmitter.addListener).not.toHaveBeenCalled();
    });
  });

  describe('addOnrampListener', () => {
    it('OnrampSdk 模块不可用时返回空操作订阅', () => {
      const { events, rn } = loadEvents('harmony', {}, null);
      const subscription = events.addOnrampListener(
        'onCheckoutClientSecretRequested',
        () => {},
      );
      expect(typeof subscription.remove).toBe('function');
      expect(() => subscription.remove()).not.toThrow();
      expect(rn.DeviceEventEmitter.addListener).not.toHaveBeenCalled();
    });

    it('模块可用时（harmony）注册到 DeviceEventEmitter', () => {
      const onrampSdk = { initialise: jest.fn() };
      const { events, rn } = loadEvents('harmony', {}, onrampSdk);
      const handler = () => {};
      events.addOnrampListener('onCheckoutClientSecretRequested', handler);
      expect(rn.DeviceEventEmitter.addListener).toHaveBeenCalledWith(
        'onCheckoutClientSecretRequested',
        handler,
      );
    });

    it('模块可用时（ios）通过 NativeEventEmitter(OnrampSdk) 注册', () => {
      const onrampSdk = { initialise: jest.fn() };
      const { events, rn } = loadEvents('ios', {}, onrampSdk);
      const handler = () => {};
      events.addOnrampListener('onCheckoutClientSecretRequested', handler);

      // 第一个实例是 StripeSdk 发射器，第二个是 Onramp 发射器
      const instances = rn.NativeEventEmitter.instances;
      expect(instances).toHaveLength(2);
      expect(instances[1].nativeModule).toBe(onrampSdk);
      expect(instances[1].addListener).toHaveBeenCalledWith(
        'onCheckoutClientSecretRequested',
        handler,
      );
    });
  });
});
