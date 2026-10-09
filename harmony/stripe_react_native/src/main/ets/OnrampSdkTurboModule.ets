/**
 * OnrampSdkTurboModule — Crypto Onramp TurboModule 鸿蒙实现（明确降级）。
 *
 * Crypto Onramp 依赖闭源 stripe-android crypto-onramp 构建变体（Android 仅在
 * StripeSdk_includeOnramp=true 时提供，iOS 需 Onramp pod），Stripe 未提供
 * OpenHarmony 版本。鸿蒙端与平台钱包同级处理：全部方法返回结构化
 * notSupported 错误（对齐 StripeError 结构），不做静默空实现。
 *
 * 注意：C++ 侧 RNOHGeneratedPackage 已为 'OnrampSdk' 注册 ArkTSTurboModule，
 * 若 ArkTS 侧不提供实现，JS 的 TurboModuleRegistry.get('OnrampSdk') 会拿到
 * 非空模块但所有调用派发失败；注册本类后每个调用都能拿到干净的错误结果。
 */

import { UITurboModule, UITurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import { TM } from './generated/ts';

type BridgeRecord = Record<string, Object>;

export class OnrampSdkTurboModule extends UITurboModule implements TM.OnrampSdk.Spec {
  private static readonly NOT_SUPPORTED_MESSAGE = 'Crypto Onramp is not supported on HarmonyOS.';

  private static voidPromise(p: Promise<Object>): Promise<void> {
    return p as ESObject as Promise<void>;
  }

  private notSupported(methodName: string): Promise<Object> {
    const error: BridgeRecord = {
      'code': 'notSupported',
      'message': `${methodName}: ${OnrampSdkTurboModule.NOT_SUPPORTED_MESSAGE}`,
    };
    const result: BridgeRecord = { 'error': error };
    return Promise.resolve(result);
  }

  initialise(params: Object): Promise<void> {
    // 初始化为配置型调用：允许成功（与 StripeSdk.initialise 独立、无副作用）
    return Promise.resolve();
  }

  configureOnramp(config: Object): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('configureOnramp'));
  }

  async isSamsungPaySupported(): Promise<boolean> {
    // 三星钱包在鸿蒙不可用，真实语义回答 false
    return false;
  }

  async hasLinkAccount(email: string): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('hasLinkAccount'));
  }

  async registerLinkUser(info: Object): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('registerLinkUser'));
  }

  async registerWalletAddress(walletAddress: string, network: string): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('registerWalletAddress'));
  }

  async deleteWalletAddress(walletId: string): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('deleteWalletAddress'));
  }

  async getWalletOwnershipChallenge(walletAddress: string, network: string): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('getWalletOwnershipChallenge'));
  }

  async submitWalletOwnershipSignature(challengeId: string, signature: string): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('submitWalletOwnershipSignature'));
  }

  async attachKycInfo(kycInfo: Object): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('attachKycInfo'));
  }

  async retrieveMissingIdentifiers(): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('retrieveMissingIdentifiers'));
  }

  async submitIdentifiers(identifiers: Object[]): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('submitIdentifiers'));
  }

  async presentUserAttestation(): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('presentUserAttestation'));
  }

  async presentKycInfoVerification(updatedAddress: null | Object): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('presentKycInfoVerification'));
  }

  async updatePhoneNumber(phone: string): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('updatePhoneNumber'));
  }

  async authenticateUserWithToken(linkAuthTokenClientSecret: string): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('authenticateUserWithToken'));
  }

  async verifyIdentity(): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('verifyIdentity'));
  }

  async collectPaymentMethod(paymentMethod: string, platformPayParams: Object): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('collectPaymentMethod'));
  }

  provideCheckoutClientSecret(clientSecret: null | string): void {
    // 同步无返回值方法：无可报告通道，保持无操作（对应 JS Spec void 返回）
  }

  async createCryptoPaymentToken(): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('createCryptoPaymentToken'));
  }

  async performCheckout(onrampSessionId: string): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('performCheckout'));
  }

  async onrampAuthorize(linkAuthIntentId: string): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('onrampAuthorize'));
  }

  async getCryptoTokenDisplayData(token: Object): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('getCryptoTokenDisplayData'));
  }

  async logout(): Promise<void> {
    return OnrampSdkTurboModule.voidPromise(this.notSupported('logout'));
  }

  addListener(eventType: string): void {
    // DeviceEventEmitter 为推模型，native 侧无需订阅登记
  }

  removeListeners(count: number): void {
    // 对应 addListener 占位，无操作
  }
}
