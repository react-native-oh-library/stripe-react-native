/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// src/helpers.ts 白盒单元测试
//
// helpers.ts 依赖 react-native 的 Platform / NativeModules 以及 RN 内部的
// TextInputState，这里全部 mock：
//   - Platform.OS 按用例切换，覆盖 isiOS / isAndroid / isHarmony 分支；
//   - TextInputState 方法存在 / 缺失两种情况，覆盖 focusInput 等四个包装函数
//     的转发与 __DEV__ 降级告警分支。

jest.mock('react-native', () => ({
  NativeModules: {},
  Platform: { OS: 'harmony' },
}));

jest.mock(
  'react-native/Libraries/Components/TextInput/TextInputState',
  () => ({
    focusInput: jest.fn(),
    registerInput: jest.fn(),
    unregisterInput: jest.fn(),
    currentlyFocusedInput: jest.fn(),
  }),
);

function loadHelpers(platformOS) {
  jest.resetModules();
  const rn = require('react-native');
  rn.Platform.OS = platformOS;
  const TextInputState = require('react-native/Libraries/Components/TextInput/TextInputState');
  return { helpers: require('../../src/helpers'), rn, TextInputState };
}

function loadHelpersWithout(methods) {
  jest.resetModules();
  const rn = require('react-native');
  const TextInputState = require('react-native/Libraries/Components/TextInput/TextInputState');
  methods.forEach((method) => delete TextInputState[method]);
  return { helpers: require('../../src/helpers'), rn, TextInputState };
}

describe('src/helpers.ts', () => {
  describe('createError', () => {
    it('拷贝 6 个标准字段，丢弃多余字段', () => {
      const { helpers } = loadHelpers('harmony');
      const error = helpers.createError({
        code: 'Failed',
        message: 'boom',
        localizedMessage: 'translated boom',
        declineCode: 'card_declined',
        stripeErrorCode: 'code_invalid',
        type: 'CardError',
        extraField: 'dropped',
      });
      expect(error).toEqual({
        code: 'Failed',
        message: 'boom',
        localizedMessage: 'translated boom',
        declineCode: 'card_declined',
        stripeErrorCode: 'code_invalid',
        type: 'CardError',
      });
    });

    it('缺失字段输出为 undefined', () => {
      const { helpers } = loadHelpers('harmony');
      expect(helpers.createError({ code: 'Failed' })).toEqual({
        code: 'Failed',
        message: undefined,
        localizedMessage: undefined,
        declineCode: undefined,
        stripeErrorCode: undefined,
        type: undefined,
      });
    });
  });

  describe('unsupportedMethodMessage', () => {
    it('包含方法名与升级提示', () => {
      const { helpers } = loadHelpers('harmony');
      expect(helpers.unsupportedMethodMessage('focusInput')).toBe(
        'focusInput method is not supported. Consider to upgrade react-native version to 0.63.x or higher',
      );
    });
  });

  describe('shouldAttributeExpo', () => {
    it('默认（无 Expo 基础设施）返回 false', () => {
      const { helpers } = loadHelpers('harmony');
      expect(helpers.shouldAttributeExpo()).toBe(false);
    });

    it('存在 NativeUnimoduleProxy 时返回 true', () => {
      jest.resetModules();
      const rn = require('react-native');
      rn.NativeModules.NativeUnimoduleProxy = {};
      const helpers = require('../../src/helpers');
      expect(helpers.shouldAttributeExpo()).toBe(true);
    });

    it('NativeModules 访问抛异常时返回 false', () => {
      jest.resetModules();
      const rn = require('react-native');
      Object.defineProperty(rn.NativeModules, 'NativeUnimoduleProxy', {
        configurable: true,
        get() {
          throw new Error('boom');
        },
      });
      const helpers = require('../../src/helpers');
      expect(helpers.shouldAttributeExpo()).toBe(false);
    });
  });

  describe('平台常量', () => {
    it('harmony：isHarmony=true，isiOS=isAndroid=false', () => {
      const { helpers } = loadHelpers('harmony');
      expect(helpers.isHarmony).toBe(true);
      expect(helpers.isiOS).toBe(false);
      expect(helpers.isAndroid).toBe(false);
    });

    it('ios：isiOS=true，isHarmony=isAndroid=false', () => {
      const { helpers } = loadHelpers('ios');
      expect(helpers.isiOS).toBe(true);
      expect(helpers.isHarmony).toBe(false);
      expect(helpers.isAndroid).toBe(false);
    });

    it('android：isAndroid=true，isHarmony=isiOS=false', () => {
      const { helpers } = loadHelpers('android');
      expect(helpers.isAndroid).toBe(true);
      expect(helpers.isHarmony).toBe(false);
      expect(helpers.isiOS).toBe(false);
    });
  });

  describe('TextInputState 包装函数', () => {
    it('方法存在时转发到 TextInputState', () => {
      const { helpers, TextInputState } = loadHelpers('harmony');
      const ref = { current: {} };
      TextInputState.currentlyFocusedInput.mockReturnValueOnce(ref);

      helpers.focusInput(ref);
      helpers.registerInput(ref);
      helpers.unregisterInput(ref);
      expect(TextInputState.focusInput).toHaveBeenCalledWith(ref);
      expect(TextInputState.registerInput).toHaveBeenCalledWith(ref);
      expect(TextInputState.unregisterInput).toHaveBeenCalledWith(ref);
      expect(helpers.currentlyFocusedInput()).toBe(ref);
      expect(TextInputState.currentlyFocusedInput).toHaveBeenCalledTimes(1);
    });

    it('方法缺失时在 __DEV__ 下打印告警且不抛错', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const { helpers } = loadHelpersWithout([
        'focusInput',
        'registerInput',
        'unregisterInput',
        'currentlyFocusedInput',
      ]);
      const ref = { current: {} };

      expect(() => helpers.focusInput(ref)).not.toThrow();
      expect(() => helpers.registerInput(ref)).not.toThrow();
      expect(() => helpers.unregisterInput(ref)).not.toThrow();
      expect(() => helpers.currentlyFocusedInput()).not.toThrow();
      expect(logSpy).toHaveBeenCalledTimes(4);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('focusInput method is not supported'),
      );
      logSpy.mockRestore();
    });
  });
});
