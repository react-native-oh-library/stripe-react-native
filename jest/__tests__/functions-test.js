/**
 * Copyright (c) 2026 Huawei Technologies Co., Ltd.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// src/functions.ts（JS 层 API -> NativeStripeSdk 转发）白盒单元测试
//
// functions.ts 在模块加载时通过 TurboModuleRegistry 获取 NativeStripeSdk 并读取
// getConstants()，事件回调通过 events.ts 的 addListener 注册到 DeviceEventEmitter
// （非 iOS）/ NativeEventEmitter（iOS）。因此每个用例通过 jest.resetModules() 重新
// require，注入 mock 的原生模块，并按需控制 Platform.OS（默认 harmony）。

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

const CONSTANTS_FIXTURE = {
  API_VERSIONS: { CORE: '1.0.0', ISSUING: '1.0.0' },
  SYSTEM_INFO: {
    sdkVersion: '1.0.0',
    osVersion: '5.0.0',
    deviceType: 'phone',
    appName: 'demo',
    appVersion: '1.0.0',
    isNewArchitecture: true,
    reactNativeVersion: '0.72.5',
  },
};

function createNativeSdk() {
  return {
    initialise: jest.fn(async () => undefined),
    createPaymentMethod: jest.fn(),
    createToken: jest.fn(),
    retrievePaymentIntent: jest.fn(),
    retrieveSetupIntent: jest.fn(),
    confirmPayment: jest.fn(),
    confirmSetupIntent: jest.fn(),
    handleNextAction: jest.fn(),
    handleNextActionForSetup: jest.fn(),
    createTokenForCVCUpdate: jest.fn(),
    handleURLCallback: jest.fn(async () => true),
    verifyMicrodeposits: jest.fn(),
    collectBankAccount: jest.fn(),
    collectBankAccountToken: jest.fn(),
    collectFinancialConnectionsAccounts: jest.fn(),
    initPaymentSheet: jest.fn(async () => ({})),
    presentPaymentSheet: jest.fn(),
    confirmPaymentSheetPayment: jest.fn(),
    resetPaymentSheetCustomer: jest.fn(async () => null),
    canAddCardToWallet: jest.fn(),
    isCardInWallet: jest.fn(),
    getConstants: jest.fn(() => CONSTANTS_FIXTURE),
    isPlatformPaySupported: jest.fn(async () => true),
    createPlatformPayPaymentMethod: jest.fn(),
    dismissPlatformPay: jest.fn(async () => true),
    updatePlatformPaySheet: jest.fn(async () => undefined),
    confirmPlatformPay: jest.fn(),
    configureOrderTracking: jest.fn(),
    intentCreationCallback: jest.fn(),
    confirmationTokenCreationCallback: jest.fn(),
    customPaymentMethodResultCallback: jest.fn(),
    openApplePaySetup: jest.fn(),
    createRadarSession: jest.fn(),
    setFinancialConnectionsForceNativeFlow: jest.fn(),
    initLinkController: jest.fn(),
    presentLinkController: jest.fn(),
    confirmLinkControllerSetupIntent: jest.fn(),
  };
}

function loadFunctions(platformOS, nativeSdk, onrampSdk = null) {
  jest.resetModules();
  const rn = require('react-native');
  rn.Platform.OS = platformOS;
  rn.TurboModuleRegistry.getEnforcing.mockImplementation(() => nativeSdk);
  rn.TurboModuleRegistry.get.mockImplementation(
    (name) => (name === 'OnrampSdk' ? onrampSdk : null),
  );
  const functions = require('../../src/functions');
  return { functions, rn, nativeSdk };
}

function captureListener(rn, eventName) {
  const call = rn.DeviceEventEmitter.addListener.mock.calls.find(
    ([event]) => event === eventName,
  );
  return call ? call[1] : undefined;
}

describe('src/functions.ts（JS 层 API -> NativeStripeSdk 转发）', () => {
  let nativeSdk;
  let functions;
  let rn;

  beforeEach(() => {
    nativeSdk = createNativeSdk();
    ({ functions, rn } = loadFunctions('harmony', nativeSdk));
  });

  describe('createPaymentMethod', () => {
    it('成功时返回 paymentMethod，options 缺省为空对象', async () => {
      const paymentMethod = { id: 'pm_123' };
      nativeSdk.createPaymentMethod.mockResolvedValueOnce({ paymentMethod });
      const result = await functions.createPaymentMethod({ type: 'Card' });
      expect(nativeSdk.createPaymentMethod).toHaveBeenCalledWith(
        { type: 'Card' },
        {},
      );
      expect(result).toEqual({ paymentMethod });
    });

    it('原生返回 error 时透传 error', async () => {
      const error = { code: 'Failed', message: 'boom' };
      nativeSdk.createPaymentMethod.mockResolvedValueOnce({ error });
      expect(await functions.createPaymentMethod({ type: 'Card' })).toEqual({
        error,
      });
    });

    it('原生抛出异常时返回该异常作为 error', async () => {
      const boom = new Error('native crashed');
      nativeSdk.createPaymentMethod.mockRejectedValueOnce(boom);
      expect(await functions.createPaymentMethod({ type: 'Card' })).toEqual({
        error: boom,
      });
    });
  });

  describe('createToken', () => {
    it('美国银行账户缺少 routingNumber 时不调用原生，返回 MissingRoutingNumber', async () => {
      const { MissingRoutingNumber } = require('../../src/types/Errors');
      const result = await functions.createToken({
        type: 'BankAccount',
        country: 'US',
      });
      expect(result).toEqual({ error: MissingRoutingNumber });
      expect(nativeSdk.createToken).not.toHaveBeenCalled();
    });

    it('country 小写 us 同样命中 routingNumber 校验分支', async () => {
      const result = await functions.createToken({
        type: 'BankAccount',
        country: 'us',
      });
      expect(result.error.message).toContain('routing number');
    });

    it('非美国或已提供 routingNumber 时正常转发原生', async () => {
      const token = { id: 'tok_123' };
      nativeSdk.createToken.mockResolvedValueOnce({ token });
      await functions.createToken({
        type: 'BankAccount',
        country: 'GB',
      });
      await functions.createToken({
        type: 'BankAccount',
        country: 'US',
        routingNumber: '110000000',
      });
      expect(nativeSdk.createToken).toHaveBeenCalledTimes(2);
    });

    it('成功 / error / 异常三条路径', async () => {
      const token = { id: 'tok_123' };
      nativeSdk.createToken.mockResolvedValueOnce({ token });
      expect(await functions.createToken({ type: 'Card' })).toEqual({ token });

      const error = { code: 'Failed' };
      nativeSdk.createToken.mockResolvedValueOnce({ error });
      expect(await functions.createToken({ type: 'Card' })).toEqual({ error });

      const boom = new Error('native crashed');
      nativeSdk.createToken.mockRejectedValueOnce(boom);
      expect(await functions.createToken({ type: 'Card' })).toEqual({
        error: boom,
      });
    });
  });

  describe('retrievePaymentIntent / retrieveSetupIntent', () => {
    it('retrievePaymentIntent 三条路径', async () => {
      const paymentIntent = { id: 'pi_123' };
      nativeSdk.retrievePaymentIntent.mockResolvedValueOnce({ paymentIntent });
      expect(await functions.retrievePaymentIntent('secret_pi')).toEqual({
        paymentIntent,
      });
      expect(nativeSdk.retrievePaymentIntent).toHaveBeenCalledWith('secret_pi');

      const error = { code: 'Failed' };
      nativeSdk.retrievePaymentIntent.mockResolvedValueOnce({ error });
      expect(await functions.retrievePaymentIntent('secret_pi')).toEqual({
        error,
      });

      const boom = new Error('native crashed');
      nativeSdk.retrievePaymentIntent.mockRejectedValueOnce(boom);
      expect(await functions.retrievePaymentIntent('secret_pi')).toEqual({
        error: boom,
      });
    });

    it('retrieveSetupIntent 三条路径', async () => {
      const setupIntent = { id: 'si_123' };
      nativeSdk.retrieveSetupIntent.mockResolvedValueOnce({ setupIntent });
      expect(await functions.retrieveSetupIntent('secret_si')).toEqual({
        setupIntent,
      });
      expect(nativeSdk.retrieveSetupIntent).toHaveBeenCalledWith('secret_si');

      const error = { code: 'Failed' };
      nativeSdk.retrieveSetupIntent.mockResolvedValueOnce({ error });
      expect(await functions.retrieveSetupIntent('secret_si')).toEqual({
        error,
      });

      const boom = new Error('native crashed');
      nativeSdk.retrieveSetupIntent.mockRejectedValueOnce(boom);
      expect(await functions.retrieveSetupIntent('secret_si')).toEqual({
        error: boom,
      });
    });
  });

  describe('confirmPayment / confirmSetupIntent', () => {
    it('confirmPayment 未传 params 时以 null 转发，options 缺省为空对象', async () => {
      const paymentIntent = { id: 'pi_123' };
      nativeSdk.confirmPayment.mockResolvedValueOnce({ paymentIntent });
      const result = await functions.confirmPayment('secret_pi');
      expect(nativeSdk.confirmPayment).toHaveBeenCalledWith(
        'secret_pi',
        null,
        {},
      );
      expect(result).toEqual({ paymentIntent });
    });

    it('confirmPayment 透传 params 与 options，error / 异常路径返回 error', async () => {
      const params = { paymentMethodType: 'Card' };
      const options = { force3DSecure: true };
      nativeSdk.confirmPayment.mockResolvedValueOnce({ paymentIntent: { id: 'pi' } });
      await functions.confirmPayment('secret_pi', params, options);
      expect(nativeSdk.confirmPayment).toHaveBeenLastCalledWith(
        'secret_pi',
        params,
        options,
      );

      const error = { code: 'Failed' };
      nativeSdk.confirmPayment.mockResolvedValueOnce({ error });
      expect(await functions.confirmPayment('secret_pi', params)).toEqual({
        error,
      });

      const boom = new Error('native crashed');
      nativeSdk.confirmPayment.mockRejectedValueOnce(boom);
      expect(await functions.confirmPayment('secret_pi', params)).toEqual({
        error: boom,
      });
    });

    it('confirmSetupIntent 三条路径', async () => {
      const setupIntent = { id: 'si_123' };
      nativeSdk.confirmSetupIntent.mockResolvedValueOnce({ setupIntent });
      expect(
        await functions.confirmSetupIntent('secret_si', { paymentMethodType: 'Card' }),
      ).toEqual({ setupIntent });
      expect(nativeSdk.confirmSetupIntent).toHaveBeenCalledWith(
        'secret_si',
        { paymentMethodType: 'Card' },
        {},
      );

      const error = { code: 'Failed' };
      nativeSdk.confirmSetupIntent.mockResolvedValueOnce({ error });
      expect(await functions.confirmSetupIntent('secret_si', {})).toEqual({
        error,
      });

      const boom = new Error('native crashed');
      nativeSdk.confirmSetupIntent.mockRejectedValueOnce(boom);
      expect(await functions.confirmSetupIntent('secret_si', {})).toEqual({
        error: boom,
      });
    });
  });

  describe('handleNextAction / handleNextActionForSetup', () => {
    it('returnURL 缺省时以 null 转发', async () => {
      const paymentIntent = { id: 'pi_123' };
      nativeSdk.handleNextAction.mockResolvedValueOnce({ paymentIntent });
      await functions.handleNextAction('secret_pi');
      expect(nativeSdk.handleNextAction).toHaveBeenCalledWith(
        'secret_pi',
        null,
      );
    });

    it('handleNextAction 成功 / error 路径', async () => {
      const paymentIntent = { id: 'pi_123' };
      nativeSdk.handleNextAction.mockResolvedValueOnce({ paymentIntent });
      expect(
        await functions.handleNextAction('secret_pi', 'stripe://return'),
      ).toEqual({ paymentIntent });
      expect(nativeSdk.handleNextAction).toHaveBeenLastCalledWith(
        'secret_pi',
        'stripe://return',
      );

      const error = { code: 'Failed' };
      nativeSdk.handleNextAction.mockResolvedValueOnce({ error });
      expect(await functions.handleNextAction('secret_pi')).toEqual({ error });
    });

    it('handleNextAction 异常时经 createError 规范化为 6 个字段', async () => {
      const rawError = {
        code: 'Failed',
        message: 'boom',
        localizedMessage: 'boom',
        declineCode: 'card_declined',
        stripeErrorCode: 'code_invalid',
        type: 'CardError',
        extraField: 'dropped',
      };
      nativeSdk.handleNextAction.mockRejectedValueOnce(rawError);
      const result = await functions.handleNextAction('secret_pi');
      expect(result).toEqual({
        error: {
          code: 'Failed',
          message: 'boom',
          localizedMessage: 'boom',
          declineCode: 'card_declined',
          stripeErrorCode: 'code_invalid',
          type: 'CardError',
        },
      });
    });

    it('handleNextActionForSetup 成功路径与 createError 异常路径', async () => {
      const setupIntent = { id: 'si_123' };
      nativeSdk.handleNextActionForSetup.mockResolvedValueOnce({ setupIntent });
      expect(
        await functions.handleNextActionForSetup('secret_si', 'stripe://return'),
      ).toEqual({ setupIntent });
      expect(nativeSdk.handleNextActionForSetup).toHaveBeenCalledWith(
        'secret_si',
        'stripe://return',
      );

      const rawError = { code: 'Failed', message: 'boom' };
      nativeSdk.handleNextActionForSetup.mockRejectedValueOnce(rawError);
      expect(await functions.handleNextActionForSetup('secret_si')).toEqual({
        error: {
          code: 'Failed',
          message: 'boom',
          localizedMessage: undefined,
          declineCode: undefined,
          stripeErrorCode: undefined,
          type: undefined,
        },
      });
    });
  });

  describe('createTokenForCVCUpdate', () => {
    it('成功 / error / 异常三条路径', async () => {
      nativeSdk.createTokenForCVCUpdate.mockResolvedValueOnce({
        tokenId: 'tok_cvc',
      });
      expect(await functions.createTokenForCVCUpdate('123')).toEqual({
        tokenId: 'tok_cvc',
      });
      expect(nativeSdk.createTokenForCVCUpdate).toHaveBeenCalledWith('123');

      const error = { code: 'Failed' };
      nativeSdk.createTokenForCVCUpdate.mockResolvedValueOnce({ error });
      expect(await functions.createTokenForCVCUpdate('123')).toEqual({ error });

      const boom = new Error('native crashed');
      nativeSdk.createTokenForCVCUpdate.mockRejectedValueOnce(boom);
      expect(await functions.createTokenForCVCUpdate('123')).toEqual({
        error: boom,
      });
    });
  });

  describe('handleURLCallback（平台分支）', () => {
    it('harmony 上转发到原生模块', async () => {
      expect(await functions.handleURLCallback('stripe://callback')).toBe(true);
      expect(nativeSdk.handleURLCallback).toHaveBeenCalledWith(
        'stripe://callback',
      );
    });

    it('ios 上转发到原生模块', async () => {
      const { functions: iosFunctions, nativeSdk: iosSdk } = loadFunctions(
        'ios',
        createNativeSdk(),
      );
      expect(await iosFunctions.handleURLCallback('stripe://callback')).toBe(
        true,
      );
      expect(iosSdk.handleURLCallback).toHaveBeenCalledWith('stripe://callback');
    });

    it('android 上恒为 false 且不调用原生模块', async () => {
      const { functions: androidFunctions, nativeSdk: androidSdk } =
        loadFunctions('android', createNativeSdk());
      expect(await androidFunctions.handleURLCallback('stripe://callback')).toBe(
        false,
      );
      expect(androidSdk.handleURLCallback).not.toHaveBeenCalled();
    });
  });

  describe('verifyMicrodepositsForPayment / verifyMicrodepositsForSetup', () => {
    it('ForPayment 以 isPaymentIntent=true 转发', async () => {
      const paymentIntent = { id: 'pi_123' };
      nativeSdk.verifyMicrodeposits.mockResolvedValueOnce({ paymentIntent });
      const params = { amounts: [32, 45] };
      expect(
        await functions.verifyMicrodepositsForPayment('secret_pi', params),
      ).toEqual({ paymentIntent });
      expect(nativeSdk.verifyMicrodeposits).toHaveBeenCalledWith(
        true,
        'secret_pi',
        params,
      );
    });

    it('ForSetup 以 isPaymentIntent=false 转发', async () => {
      const setupIntent = { id: 'si_123' };
      nativeSdk.verifyMicrodeposits.mockResolvedValueOnce({ setupIntent });
      const params = { descriptorCode: 'SM11AA' };
      expect(
        await functions.verifyMicrodepositsForSetup('secret_si', params),
      ).toEqual({ setupIntent });
      expect(nativeSdk.verifyMicrodeposits).toHaveBeenCalledWith(
        false,
        'secret_si',
        params,
      );
    });

    it('error 与异常路径（异常经 createError 规范化）', async () => {
      const error = { code: 'Failed' };
      nativeSdk.verifyMicrodeposits.mockResolvedValueOnce({ error });
      expect(await functions.verifyMicrodepositsForPayment('s', {})).toEqual({
        error,
      });

      nativeSdk.verifyMicrodeposits.mockRejectedValueOnce({
        code: 'Failed',
        message: 'boom',
      });
      const result = await functions.verifyMicrodepositsForSetup('s', {});
      expect(result.error).toEqual(
        expect.objectContaining({ code: 'Failed', message: 'boom' }),
      );
    });
  });

  describe('initPaymentSheet', () => {
    it('无回调配置时不注册任何监听，成功返回 paymentOption', async () => {
      const paymentOption = { label: 'Card', imageURL: 'https://x' };
      nativeSdk.initPaymentSheet.mockResolvedValueOnce({ paymentOption });
      const params = { merchantDisplayName: 'Demo' };
      expect(await functions.initPaymentSheet(params)).toEqual({ paymentOption });
      expect(nativeSdk.initPaymentSheet).toHaveBeenCalledWith(params);
      expect(rn.DeviceEventEmitter.addListener).not.toHaveBeenCalled();
    });

    it('error / 异常路径返回 error', async () => {
      const error = { code: 'Failed' };
      nativeSdk.initPaymentSheet.mockResolvedValueOnce({ error });
      expect(await functions.initPaymentSheet({})).toEqual({ error });

      const boom = new Error('native crashed');
      nativeSdk.initPaymentSheet.mockRejectedValueOnce(boom);
      expect(await functions.initPaymentSheet({})).toEqual({ error: boom });
    });

    it('注册 onConfirmHandlerCallback，把原生回调句柄透传给 confirmHandler', async () => {
      const confirmHandler = jest.fn();
      await functions.initPaymentSheet({
        intentConfiguration: { confirmHandler },
      });
      expect(rn.DeviceEventEmitter.addListener).toHaveBeenCalledWith(
        'onConfirmHandlerCallback',
        expect.any(Function),
      );
      const paymentMethod = { id: 'pm_123' };
      captureListener(rn, 'onConfirmHandlerCallback')({
        paymentMethod,
        shouldSavePaymentMethod: true,
      });
      expect(confirmHandler).toHaveBeenCalledWith(
        paymentMethod,
        true,
        nativeSdk.intentCreationCallback,
      );
    });

    it('重复 initPaymentSheet 时先移除旧的 confirmHandler 监听', async () => {
      const firstSubscription = { remove: jest.fn() };
      rn.DeviceEventEmitter.addListener.mockReturnValueOnce(firstSubscription);
      await functions.initPaymentSheet({
        intentConfiguration: { confirmHandler: jest.fn() },
      });
      await functions.initPaymentSheet({
        intentConfiguration: { confirmHandler: jest.fn() },
      });
      expect(firstSubscription.remove).toHaveBeenCalled();
    });

    it('注册 onConfirmationTokenHandlerCallback 并透传 confirmationTokenCreationCallback', async () => {
      const confirmationTokenConfirmHandler = jest.fn();
      await functions.initPaymentSheet({
        intentConfiguration: { confirmationTokenConfirmHandler },
      });
      const confirmationToken = { id: 'ctoken_123' };
      captureListener(rn, 'onConfirmationTokenHandlerCallback')({
        confirmationToken,
      });
      expect(confirmationTokenConfirmHandler).toHaveBeenCalledWith(
        confirmationToken,
        nativeSdk.confirmationTokenCreationCallback,
      );
    });

    it('注册 onCustomPaymentMethodConfirmHandlerCallback，结果回调转发回原生', async () => {
      const customPaymentMethodConfirmCallback = jest.fn();
      await functions.initPaymentSheet({
        customPaymentMethodConfiguration: {
          confirmCustomPaymentMethodCallback: customPaymentMethodConfirmCallback,
        },
      });
      const customPaymentMethod = { identifier: 'x', label: 'X' };
      const billingDetails = { email: 'a@b.c' };
      captureListener(rn, 'onCustomPaymentMethodConfirmHandlerCallback')({
        customPaymentMethod,
        billingDetails,
      });
      expect(customPaymentMethodConfirmCallback).toHaveBeenCalledWith(
        customPaymentMethod,
        billingDetails,
        expect.any(Function),
      );
      const resultHandler = customPaymentMethodConfirmCallback.mock.calls[0][2];
      resultHandler({ confirmationComplete: true });
      expect(nativeSdk.customPaymentMethodResultCallback).toHaveBeenCalledWith({
        confirmationComplete: true,
      });
    });

    it('注册 onOrderTrackingCallback 并把 configureOrderTracking 交给回调', async () => {
      const setOrderTracking = jest.fn();
      await functions.initPaymentSheet({
        applePay: { setOrderTracking },
      });
      captureListener(rn, 'onOrderTrackingCallback')();
      expect(setOrderTracking).toHaveBeenCalledWith(
        nativeSdk.configureOrderTracking,
      );
    });

    it('iOS 未提供 returnURL 时打印告警，harmony 不告警', async () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      rn.Platform.OS = 'ios';
      await functions.initPaymentSheet({});
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('returnURL'),
      );

      warnSpy.mockClear();
      await functions.initPaymentSheet({ returnURL: 'stripe://return' });
      expect(warnSpy).not.toHaveBeenCalled();

      rn.Platform.OS = 'harmony';
      await functions.initPaymentSheet({});
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('presentPaymentSheet / confirmPaymentSheetPayment', () => {
    it('presentPaymentSheet 成功 / error / 异常路径', async () => {
      const paymentOption = { label: 'Card', imageURL: 'https://x' };
      nativeSdk.presentPaymentSheet.mockResolvedValueOnce({
        paymentOption,
        didCancel: false,
      });
      expect(await functions.presentPaymentSheet()).toEqual({
        paymentOption,
        didCancel: false,
      });
      expect(nativeSdk.presentPaymentSheet).toHaveBeenCalledWith({});

      const error = { code: 'Canceled' };
      nativeSdk.presentPaymentSheet.mockResolvedValueOnce({ error });
      expect(await functions.presentPaymentSheet()).toEqual({ error });

      const boom = new Error('native crashed');
      nativeSdk.presentPaymentSheet.mockRejectedValueOnce(boom);
      expect(await functions.presentPaymentSheet()).toEqual({ error: boom });
    });

    it('confirmPaymentSheetPayment 成功返回空对象，error / 异常返回 error', async () => {
      nativeSdk.confirmPaymentSheetPayment.mockResolvedValueOnce({});
      expect(await functions.confirmPaymentSheetPayment()).toEqual({});

      const error = { code: 'Failed' };
      nativeSdk.confirmPaymentSheetPayment.mockResolvedValueOnce({ error });
      expect(await functions.confirmPaymentSheetPayment()).toEqual({ error });

      const boom = new Error('native crashed');
      nativeSdk.confirmPaymentSheetPayment.mockRejectedValueOnce(boom);
      expect(await functions.confirmPaymentSheetPayment()).toEqual({
        error: boom,
      });
    });
  });

  describe('resetPaymentSheetCustomer / Constants / isPlatformPaySupported', () => {
    it('resetPaymentSheetCustomer 直接转发并返回 null', async () => {
      expect(await functions.resetPaymentSheetCustomer()).toBeNull();
      expect(nativeSdk.resetPaymentSheetCustomer).toHaveBeenCalledTimes(1);
    });

    it('Constants 等于模块加载时 getConstants() 的返回值', () => {
      expect(functions.Constants).toEqual(CONSTANTS_FIXTURE);
      expect(nativeSdk.getConstants).toHaveBeenCalledTimes(1);
    });

    it('isPlatformPaySupported 缺省参数以空对象转发', async () => {
      expect(await functions.isPlatformPaySupported()).toBe(true);
      expect(nativeSdk.isPlatformPaySupported).toHaveBeenCalledWith({});

      const params = { googlePay: { existingPaymentRequired: true } };
      nativeSdk.isPlatformPaySupported.mockResolvedValueOnce(false);
      expect(await functions.isPlatformPaySupported(params)).toBe(false);
      expect(nativeSdk.isPlatformPaySupported).toHaveBeenLastCalledWith(params);
    });
  });

  describe('collectBankAccountForPayment / collectBankAccountForSetup', () => {
    it('ForPayment 以 isPaymentIntent=true 转发，成功后移除事件监听', async () => {
      const onEvent = jest.fn();
      const subscription = { remove: jest.fn() };
      rn.DeviceEventEmitter.addListener.mockReturnValueOnce(subscription);
      const paymentIntent = { id: 'pi_123' };
      nativeSdk.collectBankAccount.mockResolvedValueOnce({ paymentIntent });

      const result = await functions.collectBankAccountForPayment('secret_pi', {
        onEvent,
      });
      expect(result).toEqual({ paymentIntent });
      expect(nativeSdk.collectBankAccount).toHaveBeenCalledWith(
        true,
        'secret_pi',
        { onEvent },
      );
      expect(rn.DeviceEventEmitter.addListener).toHaveBeenCalledWith(
        'onFinancialConnectionsEvent',
        onEvent,
      );
      expect(subscription.remove).toHaveBeenCalled();
    });

    it('ForSetup 以 isPaymentIntent=false 转发', async () => {
      const setupIntent = { id: 'si_123' };
      nativeSdk.collectBankAccount.mockResolvedValueOnce({ setupIntent });
      expect(
        await functions.collectBankAccountForSetup('secret_si', {}),
      ).toEqual({ setupIntent });
      expect(nativeSdk.collectBankAccount).toHaveBeenCalledWith(
        false,
        'secret_si',
        {},
      );
    });

    it('未提供 onEvent 时不注册监听', async () => {
      nativeSdk.collectBankAccount.mockResolvedValueOnce({
        paymentIntent: { id: 'pi' },
      });
      await functions.collectBankAccountForPayment('secret_pi', {});
      expect(rn.DeviceEventEmitter.addListener).not.toHaveBeenCalledWith(
        'onFinancialConnectionsEvent',
        expect.any(Function),
      );
    });

    it('error 路径与异常路径（异常经 createError 规范化，均移除监听）', async () => {
      const error = { code: 'Canceled' };
      nativeSdk.collectBankAccount.mockResolvedValueOnce({ error });
      expect(await functions.collectBankAccountForPayment('s', {})).toEqual({
        error,
      });

      const subscription = { remove: jest.fn() };
      rn.DeviceEventEmitter.addListener.mockReturnValueOnce(subscription);
      nativeSdk.collectBankAccount.mockRejectedValueOnce({
        code: 'Failed',
        message: 'boom',
      });
      const result = await functions.collectBankAccountForSetup('s', {
        onEvent: jest.fn(),
      });
      expect(result.error).toEqual(
        expect.objectContaining({ code: 'Failed', message: 'boom' }),
      );
      expect(subscription.remove).toHaveBeenCalled();
    });
  });

  describe('collectBankAccountToken / collectFinancialConnectionsAccounts', () => {
    it('collectBankAccountToken 成功返回 session 与 token', async () => {
      const session = { id: 'fcs_123' };
      const token = { id: 'tok_123' };
      nativeSdk.collectBankAccountToken.mockResolvedValueOnce({
        session,
        token,
      });
      expect(await functions.collectBankAccountToken('secret', {})).toEqual({
        session,
        token,
      });
      expect(nativeSdk.collectBankAccountToken).toHaveBeenCalledWith(
        'secret',
        {},
      );
    });

    it('collectBankAccountToken error / 异常路径', async () => {
      const error = { code: 'Failed' };
      nativeSdk.collectBankAccountToken.mockResolvedValueOnce({ error });
      expect(await functions.collectBankAccountToken('secret', {})).toEqual({
        error,
      });

      nativeSdk.collectBankAccountToken.mockRejectedValueOnce({
        code: 'Failed',
        message: 'boom',
      });
      const result = await functions.collectBankAccountToken('secret', {});
      expect(result.error).toEqual(
        expect.objectContaining({ code: 'Failed', message: 'boom' }),
      );
    });

    it('collectFinancialConnectionsAccounts 成功 / error / 异常路径', async () => {
      const session = { id: 'fcs_123' };
      nativeSdk.collectFinancialConnectionsAccounts.mockResolvedValueOnce({
        session,
      });
      expect(
        await functions.collectFinancialConnectionsAccounts('secret', {}),
      ).toEqual({ session });

      const error = { code: 'Failed' };
      nativeSdk.collectFinancialConnectionsAccounts.mockResolvedValueOnce({
        error,
      });
      expect(
        await functions.collectFinancialConnectionsAccounts('secret', {}),
      ).toEqual({ error });

      nativeSdk.collectFinancialConnectionsAccounts.mockRejectedValueOnce({
        code: 'Failed',
        message: 'boom',
      });
      const result = await functions.collectFinancialConnectionsAccounts(
        'secret',
        {},
      );
      expect(result.error).toEqual(
        expect.objectContaining({ code: 'Failed', message: 'boom' }),
      );
    });
  });

  describe('canAddCardToWallet / isCardInWallet', () => {
    it('canAddCardToWallet 成功 / error / 异常路径', async () => {
      const details = { status: 'SUCCESS' };
      nativeSdk.canAddCardToWallet.mockResolvedValueOnce({
        canAddCard: true,
        details,
      });
      const params = { cardLastFour: '4242' };
      expect(await functions.canAddCardToWallet(params)).toEqual({
        canAddCard: true,
        details,
      });
      expect(nativeSdk.canAddCardToWallet).toHaveBeenCalledWith(params);

      const error = { code: 'Failed' };
      nativeSdk.canAddCardToWallet.mockResolvedValueOnce({ error });
      expect(await functions.canAddCardToWallet(params)).toEqual({ error });

      nativeSdk.canAddCardToWallet.mockRejectedValueOnce({
        code: 'Failed',
        message: 'boom',
      });
      const result = await functions.canAddCardToWallet(params);
      expect(result.error).toEqual(
        expect.objectContaining({ code: 'Failed', message: 'boom' }),
      );
    });

    it('isCardInWallet 成功 / error / 异常路径', async () => {
      const token = { id: 'tok_123' };
      nativeSdk.isCardInWallet.mockResolvedValueOnce({
        isInWallet: true,
        token,
      });
      expect(await functions.isCardInWallet({ cardLastFour: '4242' })).toEqual({
        isInWallet: true,
        token,
      });

      const error = { code: 'Failed' };
      nativeSdk.isCardInWallet.mockResolvedValueOnce({ error });
      expect(await functions.isCardInWallet({ cardLastFour: '4242' })).toEqual({
        error,
      });

      nativeSdk.isCardInWallet.mockRejectedValueOnce({
        code: 'Failed',
        message: 'boom',
      });
      const result = await functions.isCardInWallet({ cardLastFour: '4242' });
      expect(result.error).toEqual(
        expect.objectContaining({ code: 'Failed', message: 'boom' }),
      );
    });
  });

  describe('PlatformPay 系列', () => {
    it('confirmPlatformPaySetupIntent 以 isPaymentIntent=false 转发', async () => {
      const setupIntent = { id: 'si_123' };
      nativeSdk.confirmPlatformPay.mockResolvedValueOnce({
        setupIntent,
        paymentMethod: { id: 'pm_123' },
      });
      const params = { applePay: { merchantCountryCode: 'US' } };
      expect(
        await functions.confirmPlatformPaySetupIntent('secret_si', params),
      ).toEqual({ setupIntent });
      expect(nativeSdk.confirmPlatformPay).toHaveBeenCalledWith(
        'secret_si',
        params,
        false,
      );
    });

    it('confirmPlatformPaySetupIntent error / 异常路径', async () => {
      const error = { code: 'Canceled' };
      nativeSdk.confirmPlatformPay.mockResolvedValueOnce({ error });
      expect(
        await functions.confirmPlatformPaySetupIntent('secret_si', {}),
      ).toEqual({ error });

      const boom = new Error('native crashed');
      nativeSdk.confirmPlatformPay.mockRejectedValueOnce(boom);
      expect(
        await functions.confirmPlatformPaySetupIntent('secret_si', {}),
      ).toEqual({ error: boom });
    });

    it('confirmPlatformPayPayment 以 isPaymentIntent=true 转发', async () => {
      const paymentIntent = { id: 'pi_123' };
      nativeSdk.confirmPlatformPay.mockResolvedValueOnce({ paymentIntent });
      expect(
        await functions.confirmPlatformPayPayment('secret_pi', {}),
      ).toEqual({ paymentIntent });
      expect(nativeSdk.confirmPlatformPay).toHaveBeenCalledWith(
        'secret_pi',
        {},
        true,
      );

      const error = { code: 'Canceled' };
      nativeSdk.confirmPlatformPay.mockResolvedValueOnce({ error });
      expect(await functions.confirmPlatformPayPayment('secret_pi', {})).toEqual(
        { error },
      );

      const boom = new Error('native crashed');
      nativeSdk.confirmPlatformPay.mockRejectedValueOnce(boom);
      expect(await functions.confirmPlatformPayPayment('secret_pi', {})).toEqual(
        { error: boom },
      );
    });

    it('dismissPlatformPay 在 harmony 上恒为 false 且不调用原生', async () => {
      expect(await functions.dismissPlatformPay()).toBe(false);
      expect(nativeSdk.dismissPlatformPay).not.toHaveBeenCalled();
    });

    it('dismissPlatformPay 在 ios 上转发，异常时返回 false', async () => {
      rn.Platform.OS = 'ios';
      expect(await functions.dismissPlatformPay()).toBe(true);
      expect(nativeSdk.dismissPlatformPay).toHaveBeenCalledTimes(1);

      nativeSdk.dismissPlatformPay.mockRejectedValueOnce(
        new Error('native crashed'),
      );
      expect(await functions.dismissPlatformPay()).toBe(false);
    });

    it('createPlatformPayPaymentMethod 以 usesDeprecatedTokenFlow=false 转发', async () => {
      const paymentMethod = { id: 'pm_123' };
      const shippingContact = { name: 'Alice' };
      nativeSdk.createPlatformPayPaymentMethod.mockResolvedValueOnce({
        paymentMethod,
        shippingContact,
      });
      const params = { applePay: { merchantCountryCode: 'US' } };
      expect(await functions.createPlatformPayPaymentMethod(params)).toEqual({
        paymentMethod,
        shippingContact,
      });
      expect(nativeSdk.createPlatformPayPaymentMethod).toHaveBeenCalledWith(
        params,
        false,
      );

      const error = { code: 'Canceled' };
      nativeSdk.createPlatformPayPaymentMethod.mockResolvedValueOnce({ error });
      expect(await functions.createPlatformPayPaymentMethod(params)).toEqual({
        error,
      });

      const boom = new Error('native crashed');
      nativeSdk.createPlatformPayPaymentMethod.mockRejectedValueOnce(boom);
      expect(await functions.createPlatformPayPaymentMethod(params)).toEqual({
        error: boom,
      });
    });

    it('createPlatformPayToken 以 usesDeprecatedTokenFlow=true 转发', async () => {
      const token = { id: 'tok_123' };
      nativeSdk.createPlatformPayPaymentMethod.mockResolvedValueOnce({
        token,
        shippingContact: undefined,
      });
      expect(await functions.createPlatformPayToken({})).toEqual({ token });
      expect(nativeSdk.createPlatformPayPaymentMethod).toHaveBeenCalledWith(
        {},
        true,
      );

      const error = { code: 'Canceled' };
      nativeSdk.createPlatformPayPaymentMethod.mockResolvedValueOnce({ error });
      expect(await functions.createPlatformPayToken({})).toEqual({ error });

      const boom = new Error('native crashed');
      nativeSdk.createPlatformPayPaymentMethod.mockRejectedValueOnce(boom);
      expect(await functions.createPlatformPayToken({})).toEqual({
        error: boom,
      });
    });

    it('updatePlatformPaySheet 在非 ios 上为空操作', async () => {
      const params = {
        applePay: {
          cartItems: [{ label: 'Total', amount: '10.0' }],
          shippingMethods: [],
          errors: [],
        },
      };
      expect(await functions.updatePlatformPaySheet(params)).toEqual({});
      expect(nativeSdk.updatePlatformPaySheet).not.toHaveBeenCalled();
    });

    it('updatePlatformPaySheet 在 ios 上展开转发三个数组，异常返回 error', async () => {
      rn.Platform.OS = 'ios';
      const cartItems = [{ label: 'Total', amount: '10.0' }];
      const shippingMethods = [{ label: 'Standard', amount: '0.0' }];
      const errors = [{ code: 'ShippingInvalid' }];
      await functions.updatePlatformPaySheet({
        applePay: { cartItems, shippingMethods, errors },
      });
      expect(nativeSdk.updatePlatformPaySheet).toHaveBeenCalledWith(
        cartItems,
        shippingMethods,
        errors,
      );

      const boom = new Error('native crashed');
      nativeSdk.updatePlatformPaySheet.mockRejectedValueOnce(boom);
      expect(
        await functions.updatePlatformPaySheet({
          applePay: { cartItems, shippingMethods, errors },
        }),
      ).toEqual({ error: boom });
    });

    it('openPlatformPaySetup 仅在 ios 上调用原生', async () => {
      await functions.openPlatformPaySetup();
      expect(nativeSdk.openApplePaySetup).not.toHaveBeenCalled();

      rn.Platform.OS = 'ios';
      await functions.openPlatformPaySetup();
      expect(nativeSdk.openApplePaySetup).toHaveBeenCalledTimes(1);
    });
  });

  describe('createRadarSession / setFinancialConnectionsForceNativeFlow', () => {
    it('createRadarSession 直接转发原生结果', async () => {
      const radarResult = { id: 'rs_123' };
      nativeSdk.createRadarSession.mockResolvedValueOnce(radarResult);
      expect(await functions.createRadarSession()).toBe(radarResult);
    });

    it('setFinancialConnectionsForceNativeFlow 在非 ios 上为空操作', async () => {
      await functions.setFinancialConnectionsForceNativeFlow(true);
      expect(nativeSdk.setFinancialConnectionsForceNativeFlow).not.toHaveBeenCalled();
    });

    it('setFinancialConnectionsForceNativeFlow 在 ios 上转发，异常被吞掉', async () => {
      rn.Platform.OS = 'ios';
      await functions.setFinancialConnectionsForceNativeFlow(true);
      expect(nativeSdk.setFinancialConnectionsForceNativeFlow).toHaveBeenCalledWith(
        true,
      );

      nativeSdk.setFinancialConnectionsForceNativeFlow.mockRejectedValueOnce(
        new Error('native crashed'),
      );
      await expect(
        functions.setFinancialConnectionsForceNativeFlow(false),
      ).resolves.toBeUndefined();
    });
  });

  describe('LinkController（Private Preview）', () => {
    it('initLinkController 成功 / error / 异常路径', async () => {
      nativeSdk.initLinkController.mockResolvedValueOnce({});
      expect(await functions.initLinkController({})).toEqual({});

      const error = { code: 'Failed' };
      nativeSdk.initLinkController.mockResolvedValueOnce({ error });
      expect(await functions.initLinkController({})).toEqual({ error });

      const boom = new Error('native crashed');
      nativeSdk.initLinkController.mockRejectedValueOnce(boom);
      expect(await functions.initLinkController({})).toEqual({ error: boom });
    });

    it('presentLinkController 成功 / error 路径', async () => {
      const paymentMethod = { id: 'pm_123' };
      nativeSdk.presentLinkController.mockResolvedValueOnce({
        paymentMethod,
        paymentMethodPreview: undefined,
      });
      expect(await functions.presentLinkController()).toEqual({
        paymentMethod,
        paymentMethodPreview: undefined,
      });

      const error = { code: 'Failed' };
      nativeSdk.presentLinkController.mockResolvedValueOnce({ error });
      expect(await functions.presentLinkController()).toEqual({ error });
    });

    it('confirmLinkControllerSetupIntent 以 { clientSecret } 转发', async () => {
      nativeSdk.confirmLinkControllerSetupIntent.mockResolvedValueOnce({});
      expect(
        await functions.confirmLinkControllerSetupIntent('secret_si'),
      ).toEqual({});
      expect(nativeSdk.confirmLinkControllerSetupIntent).toHaveBeenCalledWith({
        clientSecret: 'secret_si',
      });

      const error = { code: 'Failed' };
      nativeSdk.confirmLinkControllerSetupIntent.mockResolvedValueOnce({
        error,
      });
      expect(
        await functions.confirmLinkControllerSetupIntent('secret_si'),
      ).toEqual({ error });
    });
  });
});
