/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

jest.mock('react-native', () => ({
  NativeModules: {},
  Platform: { OS: 'harmony' },
  TurboModuleRegistry: {
    get: jest.fn(),
    getEnforcing: jest.fn(),
  },
}));

function loadSpec(nativeModule) {
  jest.resetModules();
  const rn = require('react-native');
  rn.TurboModuleRegistry.getEnforcing.mockReturnValue(nativeModule);
  const spec = require('../../src/specs/v1/NativeStripeSdkModule').default;
  return { spec, TurboModuleRegistry: rn.TurboModuleRegistry };
}

describe('src/specs/v1/NativeStripeSdkModule（StripeSdk TurboModule spec）', () => {
  it('通过 TurboModuleRegistry.getEnforcing 获取名为 StripeSdk 的模块', () => {
    const nativeModule = { initialise: jest.fn() };
    const { spec, TurboModuleRegistry } = loadSpec(nativeModule);
    expect(TurboModuleRegistry.getEnforcing).toHaveBeenCalledWith('StripeSdk');
    expect(spec).toBe(nativeModule);
  });

  it('默认导出注册表返回的原生模块（包含 Spec 声明的核心方法）', () => {
    const methods = [
      'initialise',
      'createPaymentMethod',
      'createToken',
      'handleNextAction',
      'handleNextActionForSetup',
      'confirmPayment',
      'confirmSetupIntent',
      'retrievePaymentIntent',
      'retrieveSetupIntent',
      'initPaymentSheet',
      'presentPaymentSheet',
      'confirmPaymentSheetPayment',
      'createTokenForCVCUpdate',
      'handleURLCallback',
      'verifyMicrodeposits',
      'collectBankAccount',
      'getConstants',
      'canAddCardToWallet',
      'isCardInWallet',
      'collectBankAccountToken',
      'collectFinancialConnectionsAccounts',
      'resetPaymentSheetCustomer',
      'isPlatformPaySupported',
      'createPlatformPayPaymentMethod',
      'dismissPlatformPay',
      'updatePlatformPaySheet',
      'confirmPlatformPay',
      'configureOrderTracking',
      'initCustomerSheet',
      'presentCustomerSheet',
      'createRadarSession',
      'setFinancialConnectionsForceNativeFlow',
      'initLinkController',
      'presentLinkController',
      'confirmLinkControllerSetupIntent',
      'addListener',
      'removeListeners',
    ];
    const nativeModule = {};
    methods.forEach((method) => {
      nativeModule[method] = jest.fn();
    });
    const { spec } = loadSpec(nativeModule);
    expect(spec).toBe(nativeModule);
    methods.forEach((method) => {
      expect(typeof spec[method]).toBe('function');
    });
  });

  it('在原生模块不可用时默认导出为 undefined（由上层处理）', () => {
    const { spec } = loadSpec(undefined);
    expect(spec).toBeUndefined();
  });
});
