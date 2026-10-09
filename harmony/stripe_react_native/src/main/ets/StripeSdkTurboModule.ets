/**
 * StripeSdkTurboModule — StripeSdk TurboModule 鸿蒙实现（60 方法全签名）。
 *
 * 架构（对照 02-planning.json）：
 * - 支付引擎：@ohos.net.http 直调 Stripe REST API v1（publishable key 客户端模式，
 *   与 stripe-android/stripe-ios 客户端能力同构）
 * - PaymentSheet/CustomerSheet：ArkUI 自绘页经 StripeSheetPresenter 全屏模态承载
 * - 3DS/redirect：StripeWebSheet（ArkUI Web 组件）+ onLoadIntercept 拦截 stripe:// 回跳
 * - 双向回调：EventBridge（callId 关联 pending-promise 表 + 超时回收）
 * - 平台支付/钱包/Onramp/Link：结构化 notSupported 降级（无鸿蒙等价系统服务）
 */

import { UITurboModule, UITurboModuleContext } from '@rnoh/react-native-openharmony/ts';
import hilog from '@ohos.hilog';
import { TM } from './generated/ts';
import { StripeApiClient, StripeApiError, pascalToSnake } from './api/StripeApiClient';
import { StripeModels, BridgeRecord } from './api/StripeModels';
import { CardFieldRegistry, CardFieldSnapshot, CardValidator } from './card/CardValidator';
import { CardBrandDetector } from './card/CardBrand';
import { CallbackRegistry, CallbackMethodKeys, StripeEventEmitter, StripeSdkEvents } from './util/EventBridge';
import { ShareHelper } from './util/ShareHelper';
import { DeviceEnv } from './util/DeviceEnv';
import { DeepLinkHelper } from './web/DeepLinkHelper';
import {
  PaymentSheetConfig,
  CustomerSheetConfig,
  CustomerPaymentMethodItem,
  PaymentSheetFlowHandler,
  CustomerSheetFlowHandler,
  StripeSheetParams,
  StripeSheetKind,
  WebAuthRequest,
} from './sheet/SheetController';
import { StripeSheetPresenter } from './sheet/StripeSheetPresenter';
import { PaymentSheetParamsExt } from './sheet/StripeSheetBuilder';

const HILOG_DOMAIN = 0x0000;
const HILOG_TAG = 'StripeSdk';

/** getConstants 返回结构（对齐 JS Spec 签名） */
interface ApiVersionsResult {
  CORE: string;
  ISSUING: string;
}

interface SystemInfoResult {
  sdkVersion: string;
  osVersion: string;
  deviceType: string;
  appName: string;
  appVersion: string;
  isNewArchitecture: boolean;
  reactNativeVersion: string;
}

interface GetConstantsResult {
  API_VERSIONS: ApiVersionsResult;
  SYSTEM_INFO: SystemInfoResult;
}

/** downloadAndShareFile 返回结构 */
interface DownloadShareOutcome {
  success: boolean;
  error?: string;
}

/** buildPaymentMethodForm 返回结构 */
interface PaymentMethodFormResult {
  form: Map<string, Object>;
  paymentMethodId: string;
}

/** openAuthenticatedWebView 返回结构（替代内联对象字面量类型） */
interface WebViewAuthResult {
  url?: string;
}

export class StripeSdkTurboModule extends UITurboModule implements TM.StripeSdk.Spec {
  private emitter: StripeEventEmitter = new StripeEventEmitter();
  private callbacks: CallbackRegistry = new CallbackRegistry();
  private paymentSheetConfig: PaymentSheetConfig | null = null;
  private customerSheetConfig: CustomerSheetConfig | null = null;
  /** presentPaymentSheet 的 pending resolver（sheet 关闭或 customFlow 完成时 resolve） */
  private presentPaymentSheetResolver: ((result: BridgeRecord) => void) | null = null;
  /** customFlow / intentConfiguration 流程中已创建的 PaymentMethod */
  private pendingSheetPaymentMethod: BridgeRecord | null = null;

  constructor(ctx: UITurboModuleContext) {
    super(ctx);
    this.emitter.setInstance(ctx.rnInstance);
  }

  // ==================== 通用工具 ====================

  private rec(value: Object | null | undefined): BridgeRecord {
    const result = StripeModels.asRecord(value ?? null);
    return result ?? {};
  }

  /** Promise<Record> → Promise<void>（codegen 将复杂返回类型降级为 void，运行时值仍可达 JS） */
  private static voidPromise(p: Promise<Object>): Promise<void> {
    return p as ESObject as Promise<void>;
  }

  private errorResult(code: string, message: string): BridgeRecord {
    return { 'code': code, 'message': message };
  }

  private notSupported(methodName: string): Promise<Object> {
    const result: BridgeRecord = {
      'error': this.errorResult('notSupported', `${methodName} is not supported on HarmonyOS`),
    };
    return Promise.resolve(result);
  }

  /** 从 client secret 提取 intent id（pi_xxx_secret_yyy → pi_xxx） */
  private intentIdFromSecret(clientSecret: string, prefix: string): string {
    const idx = clientSecret.indexOf('_secret_');
    if (idx > 0) {
      return clientSecret.substring(0, idx);
    }
    return prefix;
  }

  private apiException(err: Object | null | undefined, errorCode: string): BridgeRecord {
    return StripeModels.toBridgeError(err, errorCode);
  }

  // ==================== 3DS / Web 认证 ====================

  private async runWebAuth(url: string, returnUrl: string): Promise<string | null> {
    if (url.length === 0) {
      return null;
    }
    const request = new WebAuthRequest(url, returnUrl.length > 0 ? returnUrl : 'stripe://');
    const authId = `webauth_${Date.now()}`;
    return new Promise<string | null>((resolve) => {
      // 登记 deep link 处理器：UIAbility onNewWant → JS handleURLCallback → 本回调
      DeepLinkHelper.shared.registerAuthHandler(authId, (deepLinkUrl: string) => {
        request.onComplete?.(deepLinkUrl);
        return true;
      });
      request.onComplete = (resultUrl: string | null) => {
        DeepLinkHelper.shared.unregisterAuthHandler(authId);
        resolve(resultUrl);
      };
      const params = new StripeSheetParams();
      params.kind = StripeSheetKind.WEB_AUTH;
      params.webAuth = request;
      StripeSheetPresenter.present(this.ctx.uiAbilityContext, params).catch((err: Object) => {
        hilog.error(HILOG_DOMAIN, HILOG_TAG, 'present web auth sheet failed: %{public}s', JSON.stringify(err));
        DeepLinkHelper.shared.unregisterAuthHandler(authId);
        resolve(null);
      });
    });
  }

  /**
   * 确认后的 next_action 处理：requires_action → Web 认证 → retrieve 终态。
   * @returns 处理后的 intent 最新快照；无 next_action 时原样返回
   */
  private async resolveNextActionIfNeeded(intent: BridgeRecord, isPaymentIntent: boolean, returnUrl: string): Promise<BridgeRecord> {
    let current = intent;
    for (let round = 0; round < 2; round++) {
      const status = StripeModels.str(current, 'status');
      const nextAction = StripeModels.asRecord(current['nextAction'] as Object | undefined);
      if (status !== 'RequiresAction' || nextAction === null) {
        return current;
      }
      const redirectUrl = StripeModels.str(nextAction, 'redirectUrl');
      if (redirectUrl.length === 0) {
        return current;
      }
      const resultUrl = await this.runWebAuth(redirectUrl, returnUrl);
      await StripeSheetPresenter.dismiss();
      if (resultUrl === null) {
        return current; // 用户取消，保持 requires_action，由上层判定 Canceled
      }
      const id = StripeModels.str(current, 'id');
      const clientSecret = StripeModels.str(current, 'clientSecret');
      const form = new Map<string, Object>();
      form.set('client_secret', clientSecret);
      const path = isPaymentIntent
        ? `/v1/payment_intents/${id}`
        : `/v1/setup_intents/${id}`;
      const response = await StripeApiClient.shared.get(path, form);
      current = isPaymentIntent
        ? StripeModels.paymentIntent(response.body)
        : StripeModels.setupIntent(response.body);
    }
    return current;
  }

  // ==================== 表单构建 ====================

  private appendBillingDetails(form: Map<string, Object>, prefix: string, data: BridgeRecord): void {
    const details = StripeModels.asRecord(data['billingDetails'] ?? null);
    if (details) {
      const name = StripeModels.str(details, 'name');
      if (name.length > 0) {
        form.set(`${prefix}[name]`, name);
      }
      const email = StripeModels.str(details, 'email');
      if (email.length > 0) {
        form.set(`${prefix}[email]`, email);
      }
      const phone = StripeModels.str(details, 'phone');
      if (phone.length > 0) {
        form.set(`${prefix}[phone]`, phone);
      }
      const address = StripeModels.asRecord(details['address'] ?? null);
      if (address) {
        const fields: string[][] = [['city', 'city'], ['country', 'country'], ['line1', 'line1'], ['line2', 'line2'], ['postalCode', 'postal_code'], ['state', 'state']];
        for (const pair of fields) {
          const v = StripeModels.str(address, pair[0]);
          if (v.length > 0) {
            form.set(`${prefix}[address][${pair[1]}]`, v);
          }
        }
      }
    }
  }

  private buildPaymentMethodForm(params: BridgeRecord, cardFromSheet: CardFieldSnapshot | null): PaymentMethodFormResult {
    const form = new Map<string, Object>();
    const pmType = StripeModels.str(params, 'paymentMethodType');
    const data = StripeModels.asRecord(params['paymentMethodData'] ?? null) ?? {};
    const existingId = StripeModels.str(data, 'paymentMethodId');
    if (existingId.length > 0) {
      const result: PaymentMethodFormResult = { form: form, paymentMethodId: existingId };
      return result;
    }
    const type = pascalToSnake(pmType);
    const prefix = 'payment_method_data';
    form.set(`${prefix}[type]`, type);

    if (type === 'card') {
      const token = StripeModels.str(data, 'token');
      if (token.length > 0) {
        form.set(`${prefix}[card][token]`, token);
      } else {
        const card = cardFromSheet ?? CardFieldRegistry.shared.current;
        if (card !== null && card.number.length > 0) {
          form.set(`${prefix}[card][number]`, card.number);
          form.set(`${prefix}[card][exp_month]`, card.expiryMonth);
          form.set(`${prefix}[card][exp_year]`, card.expiryYear);
          form.set(`${prefix}[card][cvc]`, card.cvc);
        }
      }
      const cvc = StripeModels.str(data, 'cvc');
      if (cvc.length > 0) {
        form.set(`${prefix}[card][cvc]`, cvc);
      }
    } else {
      // 其余支付方式：将 paymentMethodData 中的扁平字段按同名 snake 键透传
      const keys = Object.keys(data);
      for (const key of keys) {
        const value = data[key];
        if (value !== null && value !== undefined && (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number')) {
          form.set(`${prefix}[${type}][${pascalToSnake(key)}]`, value);
        }
      }
    }
    this.appendBillingDetails(form, prefix, data);
    const metadata = StripeModels.asRecord(data['metadata'] ?? null);
    if (metadata) {
      const keys = Object.keys(metadata);
      for (const key of keys) {
        form.set(`${prefix}[metadata][${key}]`, String(metadata[key]));
      }
    }
    const finalResult: PaymentMethodFormResult = { form: form, paymentMethodId: '' };
    return finalResult;
  }

  // ==================== P0：初始化 / 支付引擎 ====================

  initialise(params: Object): Promise<void> {
    const record = this.rec(params);
    const publishableKey = StripeModels.str(record, 'publishableKey');
    if (publishableKey.length === 0) {
      return Promise.reject(this.errorResult('Failed', 'publishableKey is required'));
    }
    StripeApiClient.shared.configure(publishableKey, StripeModels.str(record, 'stripeAccountId'));
    return Promise.resolve();
  }

  createPaymentMethod(params: Object, options: Object): Promise<void> {
    const impl = async (): Promise<BridgeRecord> => {
      try {
        const built = this.buildPaymentMethodForm(this.rec(params), null);
        if (built.paymentMethodId.length > 0) {
          return { 'error': this.errorResult('Failed', 'paymentMethodId cannot be used with createPaymentMethod') };
        }
        const optionRec = this.rec(options);
        const setupFutureUsage = StripeModels.str(optionRec, 'setupFutureUsage');
        if (setupFutureUsage.length > 0) {
          built.form.set('setup_future_usage', setupFutureUsage.toLowerCase());
        }
        const response = await StripeApiClient.shared.post('/v1/payment_methods', built.form);
        return { 'paymentMethod': StripeModels.paymentMethod(response.body) };
      } catch (err) {
        return { 'error': this.apiException(err, 'Failed') };
      }
    };
    return StripeSdkTurboModule.voidPromise(impl() as Promise<Object>);
  }

  async handleNextAction(paymentIntentClientSecret: string, returnURL: null | string): Promise<void> {
    const impl = async (): Promise<BridgeRecord> => {
      try {
        const id = this.intentIdFromSecret(paymentIntentClientSecret, 'pi');
        const form = new Map<string, Object>();
        form.set('client_secret', paymentIntentClientSecret);
        const response = await StripeApiClient.shared.post(`/v1/payment_intents/${id}/confirm`, form);
        let intent = StripeModels.paymentIntent(response.body);
        intent = await this.resolveNextActionIfNeeded(intent, true, returnURL ?? '');
        const status = StripeModels.str(intent, 'status');
        if (status === 'RequiresAction') {
          return { 'error': this.errorResult('Canceled', 'The payment attempt was canceled') };
        }
        return { 'paymentIntent': intent };
      } catch (err) {
        return { 'error': this.apiException(err, 'Failed') };
      }
    };
    return StripeSdkTurboModule.voidPromise(impl() as Promise<Object>);
  }

  async handleNextActionForSetup(setupIntentClientSecret: string, returnURL: null | string): Promise<void> {
    const impl = async (): Promise<BridgeRecord> => {
      try {
        const id = this.intentIdFromSecret(setupIntentClientSecret, 'seti');
        const form = new Map<string, Object>();
        form.set('client_secret', setupIntentClientSecret);
        const response = await StripeApiClient.shared.post(`/v1/setup_intents/${id}/confirm`, form);
        let intent = StripeModels.setupIntent(response.body);
        intent = await this.resolveNextActionIfNeeded(intent, false, returnURL ?? '');
        const status = StripeModels.str(intent, 'status');
        if (status === 'RequiresAction') {
          return { 'error': this.errorResult('Canceled', 'The setup attempt was canceled') };
        }
        return { 'setupIntent': intent };
      } catch (err) {
        return { 'error': this.apiException(err, 'Failed') };
      }
    };
    return StripeSdkTurboModule.voidPromise(impl() as Promise<Object>);
  }

  async confirmPayment(paymentIntentClientSecret: string, params: null | Object, options: Object): Promise<void> {
    const impl = async (): Promise<BridgeRecord> => {
      try {
        const id = this.intentIdFromSecret(paymentIntentClientSecret, 'pi');
        const form = new Map<string, Object>();
        form.set('client_secret', paymentIntentClientSecret);
        const paramsRec: BridgeRecord = params === null ? {} : this.rec(params);
        const built = this.buildPaymentMethodForm(paramsRec, null);
        if (built.paymentMethodId.length > 0) {
          form.set('payment_method', built.paymentMethodId);
        } else {
          for (const entry of Array.from(built.form.entries())) {
            form.set(entry[0], entry[1]);
          }
        }
        const optionRec = this.rec(options);
        const setupFutureUsage = StripeModels.str(optionRec, 'setupFutureUsage');
        if (setupFutureUsage.length > 0) {
          form.set('setup_future_usage', setupFutureUsage.toLowerCase());
        }
        const response = await StripeApiClient.shared.post(`/v1/payment_intents/${id}/confirm`, form);
        let intent = StripeModels.paymentIntent(response.body);
        intent = await this.resolveNextActionIfNeeded(intent, true, StripeModels.str(paramsRec, 'returnURL'));
        return { 'paymentIntent': intent };
      } catch (err) {
        return { 'error': this.apiException(err, 'Failed') };
      }
    };
    return StripeSdkTurboModule.voidPromise(impl() as Promise<Object>);
  }

  async confirmSetupIntent(paymentIntentClientSecret: string, params: Object, options: Object): Promise<void> {
    const impl = async (): Promise<BridgeRecord> => {
      try {
        const id = this.intentIdFromSecret(paymentIntentClientSecret, 'seti');
        const form = new Map<string, Object>();
        form.set('client_secret', paymentIntentClientSecret);
        const built = this.buildPaymentMethodForm(this.rec(params), null);
        if (built.paymentMethodId.length > 0) {
          form.set('payment_method', built.paymentMethodId);
        } else {
          for (const entry of Array.from(built.form.entries())) {
            form.set(entry[0], entry[1]);
          }
        }
        const response = await StripeApiClient.shared.post(`/v1/setup_intents/${id}/confirm`, form);
        let intent = StripeModels.setupIntent(response.body);
        intent = await this.resolveNextActionIfNeeded(intent, false, StripeModels.str(this.rec(params), 'returnURL'));
        return { 'setupIntent': intent };
      } catch (err) {
        return { 'error': this.apiException(err, 'Failed') };
      }
    };
    return StripeSdkTurboModule.voidPromise(impl() as Promise<Object>);
  }

  async retrievePaymentIntent(clientSecret: string): Promise<void> {
    const impl = async (): Promise<BridgeRecord> => {
      try {
        const id = this.intentIdFromSecret(clientSecret, 'pi');
        const form = new Map<string, Object>();
        form.set('client_secret', clientSecret);
        const response = await StripeApiClient.shared.get(`/v1/payment_intents/${id}`, form);
        return { 'paymentIntent': StripeModels.paymentIntent(response.body) };
      } catch (err) {
        return { 'error': this.apiException(err, 'Unknown') };
      }
    };
    return StripeSdkTurboModule.voidPromise(impl() as Promise<Object>);
  }

  async retrieveSetupIntent(clientSecret: string): Promise<void> {
    const impl = async (): Promise<BridgeRecord> => {
      try {
        const id = this.intentIdFromSecret(clientSecret, 'seti');
        const form = new Map<string, Object>();
        form.set('client_secret', clientSecret);
        const response = await StripeApiClient.shared.get(`/v1/setup_intents/${id}`, form);
        return { 'setupIntent': StripeModels.setupIntent(response.body) };
      } catch (err) {
        return { 'error': this.apiException(err, 'Unknown') };
      }
    };
    return StripeSdkTurboModule.voidPromise(impl() as Promise<Object>);
  }

  async createTokenForCVCUpdate(cvc: string): Promise<void> {
    const impl = async (): Promise<BridgeRecord> => {
      try {
        const form = new Map<string, Object>();
        form.set('cvc_update[cvc]', cvc);
        const response = await StripeApiClient.shared.post('/v1/tokens', form);
        // JS 层 CreateTokenForCVCUpdateResult 解构 { tokenId, error }
        return { 'tokenId': StripeModels.str(response.body, 'id') };
      } catch (err) {
        return { 'error': this.apiException(err, 'Failed') };
      }
    };
    return StripeSdkTurboModule.voidPromise(impl() as Promise<Object>);
  }

  async handleURLCallback(url: string): Promise<boolean> {
    return DeepLinkHelper.shared.handleUrl(url);
  }

  async createToken(params: Object): Promise<void> {
    const impl = async (): Promise<BridgeRecord> => {
      try {
        const record = this.rec(params);
        const type = StripeModels.str(record, 'type');
        const form = new Map<string, Object>();
        if (type === 'Card') {
          const card = StripeModels.asRecord(record['card'] ?? null) ?? {};
          const cardFields: string[][] = [['number', 'number'], ['expMonth', 'exp_month'], ['expYear', 'exp_year'], ['cvc', 'cvc'], ['currency', 'currency']];
          for (const pair of cardFields) {
            const value = card[pair[0]];
            if (value !== null && value !== undefined && String(value).length > 0) {
              form.set(`card[${pair[1]}]`, value);
            }
          }
          const name = StripeModels.str(card, 'name');
          if (name.length > 0) {
            form.set('card[name]', name);
          }
          const address = StripeModels.asRecord(card['address'] ?? null);
          if (address) {
            const fields: string[][] = [['city', 'city'], ['country', 'country'], ['line1', 'line1'], ['line2', 'line2'], ['postalCode', 'postal_code'], ['state', 'state']];
            for (const pair of fields) {
              const v = StripeModels.str(address, pair[0]);
              if (v.length > 0) {
                form.set(`card[address][${pair[1]}]`, v);
              }
            }
          }
        } else if (type === 'BankAccount') {
          const bank = StripeModels.asRecord(record['bankAccount'] ?? null) ?? {};
          const bankFields: string[][] = [['country', 'country'], ['currency', 'currency'], ['accountNumber', 'account_number'], ['routingNumber', 'routing_number'], ['accountHolderName', 'account_holder_name'], ['accountHolderType', 'account_holder_type']];
          for (const pair of bankFields) {
            const value = bank[pair[0]];
            if (value !== null && value !== undefined && String(value).length > 0) {
              form.set(`bank_account[${pair[1]}]`, value);
            }
          }
        } else if (type === 'Pii') {
          form.set('pii[personal_id]', StripeModels.str(record, 'personalId'));
        } else {
          return { 'error': this.errorResult('Failed', `Unsupported token type: ${type}`) };
        }
        const response = await StripeApiClient.shared.post('/v1/tokens', form);
        return { 'token': StripeModels.token(response.body) };
      } catch (err) {
        return { 'error': this.apiException(err, 'Failed') };
      }
    };
    return StripeSdkTurboModule.voidPromise(impl() as Promise<Object>);
  }

  // ==================== getConstants ====================

  getConstants(): GetConstantsResult {
    const apiVersions: ApiVersionsResult = {
      CORE: '2025-03-31.basil',
      ISSUING: '2022-08-01',
    };
    const systemInfo: SystemInfoResult = {
      sdkVersion: '0.77.0',
      osVersion: DeviceEnv.osVersion,
      deviceType: DeviceEnv.deviceType,
      appName: DeviceEnv.appName,
      appVersion: DeviceEnv.appVersion,
      isNewArchitecture: true,
      reactNativeVersion: '0.72.5',
    };
    const result: GetConstantsResult = {
      API_VERSIONS: apiVersions,
      SYSTEM_INFO: systemInfo,
    };
    return result;
  }

  // ==================== P1：PaymentSheet ====================

  initPaymentSheet(params: Object): Promise<void> {
    const record = this.rec(params);
    const config = new PaymentSheetConfig();
    config.paymentIntentClientSecret = StripeModels.str(record, 'paymentIntentClientSecret');
    config.setupIntentClientSecret = StripeModels.str(record, 'setupIntentClientSecret');
    config.customFlow = StripeModels.bool(record, 'customFlow');
    config.merchantDisplayName = StripeModels.str(record, 'merchantDisplayName');
    config.customerId = StripeModels.str(record, 'customerId');
    config.customerEphemeralKeySecret = StripeModels.str(record, 'customerEphemeralKeySecret');
    config.primaryButtonLabel = StripeModels.str(record, 'primaryButtonLabel');
    config.returnURL = StripeModels.str(record, 'urlScheme');
    config.allowsDelayedPaymentMethods = StripeModels.bool(record, 'allowsDelayedPaymentMethods');
    const billing = StripeModels.asRecord(record['defaultBillingDetails'] ?? null);
    config.defaultBillingDetails = billing;
    const appearance = StripeModels.asRecord(record['appearance'] ?? null);
    config.appearance = appearance;
    const bdcc = StripeModels.asRecord(record['billingDetailsCollectionConfiguration'] ?? null);
    config.billingDetailsCollectionConfiguration = bdcc;
    // intentConfiguration（现代流）：mode 提供金额展示；存在 intentConfiguration 即为
    // confirmHandler 自定义流（对齐 Android buildIntentConfiguration 语义——confirmHandler
    // 是 JS 侧回调，函数值不跨桥，原生以 intentConfiguration 存在性判定该流）
    const intentConfig = StripeModels.asRecord(record['intentConfiguration'] ?? null);
    if (intentConfig !== null) {
      const mode = StripeModels.asRecord(intentConfig['mode'] ?? null);
      if (mode !== null) {
        const amount = StripeModels.num(mode, 'amount', -1);
        const currency = StripeModels.str(mode, 'currencyCode');
        if (amount >= 0 && currency.length > 0) {
          config.displayAmount = this.formatAmount(amount, currency);
        }
      }
      config.customFlow = true;
    }
    this.paymentSheetConfig = config;
    return Promise.resolve();
  }

  private formatAmount(minorUnits: number, currency: string): string {
    const symbols: BridgeRecord = { 'usd': '$', 'eur': '€', 'gbp': '£', 'jpy': '¥', 'cny': '¥' };
    const upper = currency.toUpperCase();
    const symbol = typeof symbols[currency.toLowerCase()] === 'string' ? symbols[currency.toLowerCase()] as string : '';
    const text = symbol.length > 0 ? symbol : `${upper} `;
    if (upper === 'JPY') {
      return `${text}${minorUnits}`;
    }
    return `${text}${(minorUnits / 100).toFixed(2)}`;
  }

  private paymentFlowHandler(): PaymentSheetFlowHandler {
    const handler: PaymentSheetFlowHandler = {
      confirmDefaultFlow: (card: CardFieldSnapshot, config: PaymentSheetConfig): Promise<BridgeRecord> => {
        return this.confirmSheetPayment(card, config, '');
      },
      startCustomFlow: (card: CardFieldSnapshot, config: PaymentSheetConfig): Promise<BridgeRecord> => {
        return this.startSheetCustomFlow(card, config);
      },
    };
    return handler;
  }

  /** 默认流程：创建 PM → 确认 → 3DS → 终态 */
  private async confirmSheetPayment(card: CardFieldSnapshot, config: PaymentSheetConfig, overrideSecret: string): Promise<BridgeRecord> {
    try {
      const secret = overrideSecret.length > 0 ? overrideSecret
        : (config.paymentIntentClientSecret.length > 0 ? config.paymentIntentClientSecret : config.setupIntentClientSecret);
      const isPI = overrideSecret.length > 0
        ? overrideSecret.startsWith('pi_')
        : config.paymentIntentClientSecret.length > 0;
      if (secret.length === 0) {
        throw new Error('No client secret available for PaymentSheet confirmation');
      }
      const pmForm = new Map<string, Object>();
      pmForm.set('payment_method_data[type]', 'card');
      pmForm.set('payment_method_data[card][number]', card.number);
      pmForm.set('payment_method_data[card][exp_month]', card.expiryMonth);
      pmForm.set('payment_method_data[card][exp_year]', card.expiryYear);
      pmForm.set('payment_method_data[card][cvc]', card.cvc);
      const id = this.intentIdFromSecret(secret, isPI ? 'pi' : 'seti');
      const form = new Map<string, Object>();
      form.set('client_secret', secret);
      for (const entry of Array.from(pmForm.entries())) {
        form.set(entry[0], entry[1]);
      }
      const path = isPI ? `/v1/payment_intents/${id}/confirm` : `/v1/setup_intents/${id}/confirm`;
      const response = await StripeApiClient.shared.post(path, form);
      let intent = isPI ? StripeModels.paymentIntent(response.body) : StripeModels.setupIntent(response.body);
      intent = await this.resolveNextActionIfNeeded(intent, isPI, config.returnURL);
      const intentResultKey = isPI ? 'paymentIntent' : 'setupIntent';
      const result: BridgeRecord = {};
      result[intentResultKey] = intent;
      return result;
    } catch (err) {
      return { 'error': this.apiException(err, 'Failed') };
    }
  }

  /** customFlow：创建 PM 并发射 onConfirmHandlerCallback，返回 { awaitingMerchant: true } */
  private async startSheetCustomFlow(card: CardFieldSnapshot, config: PaymentSheetConfig): Promise<BridgeRecord> {
    try {
      const form = new Map<string, Object>();
      form.set('type', 'card');
      form.set('card[number]', card.number);
      form.set('card[exp_month]', card.expiryMonth);
      form.set('card[exp_year]', card.expiryYear);
      form.set('card[cvc]', card.cvc);
      const response = await StripeApiClient.shared.post('/v1/payment_methods', form);
      const paymentMethod = StripeModels.paymentMethod(response.body);
      this.pendingSheetPaymentMethod = paymentMethod;
      const pmId = StripeModels.str(paymentMethod, 'id');
      // 唤起 intentCreationCallback（现代流）；legacy customFlow 由 confirmPaymentSheetPayment 驱动
      const waitPromise = this.callbacks.awaitCallback(CallbackMethodKeys.INTENT_CREATION, 120000);
      this.emitter.emit(StripeSdkEvents.ON_CONFIRM_HANDLER_CALLBACK, {
        'paymentMethod': paymentMethod,
        'shouldSavePaymentMethod': false,
      });
      const creation = await waitPromise;
      const clientSecret = StripeModels.str(creation, 'clientSecret');
      if (clientSecret.length > 0) {
        const cardRef = new CardFieldSnapshot();
        // PM 已创建，用 payment_method 引用确认
        const confirmResult = await this.confirmWithExistingPaymentMethod(clientSecret, pmId, config);
        return confirmResult;
      }
      const creationError = StripeModels.asRecord(creation['error'] ?? null);
      if (creationError !== null) {
        return { 'error': StripeModels.toBridgeError(new Error(StripeModels.str(creationError, 'message')), 'Failed') };
      }
      // 未提供 secret（legacy customFlow）：等待 confirmPaymentSheetPayment
      return { 'awaitingMerchant': true };
    } catch (err) {
      return { 'error': this.apiException(err, 'Failed') };
    }
  }

  private async confirmWithExistingPaymentMethod(clientSecret: string, paymentMethodId: string, config: PaymentSheetConfig): Promise<BridgeRecord> {
    try {
      const isPI = clientSecret.startsWith('pi_');
      const id = this.intentIdFromSecret(clientSecret, isPI ? 'pi' : 'seti');
      const form = new Map<string, Object>();
      form.set('client_secret', clientSecret);
      form.set('payment_method', paymentMethodId);
      const path = isPI ? `/v1/payment_intents/${id}/confirm` : `/v1/setup_intents/${id}/confirm`;
      const response = await StripeApiClient.shared.post(path, form);
      let intent = isPI ? StripeModels.paymentIntent(response.body) : StripeModels.setupIntent(response.body);
      intent = await this.resolveNextActionIfNeeded(intent, isPI, config.returnURL);
      const intentResultKey = isPI ? 'paymentIntent' : 'setupIntent';
      const result: BridgeRecord = {};
      result[intentResultKey] = intent;
      return result;
    } catch (err) {
      return { 'error': this.apiException(err, 'Failed') };
    }
  }

  async presentPaymentSheet(options: Object): Promise<void> {
    const config = this.paymentSheetConfig;
    if (config === null) {
      const failure: BridgeRecord = {
        'error': this.errorResult('Failed', 'PaymentSheet has not been initialized'),
      };
      return StripeSdkTurboModule.voidPromise(Promise.resolve(failure));
    }
    const impl = async (): Promise<BridgeRecord> => {
      try {
        // 金额展示：legacy 流从 intent retrieve 预取
        if (config.displayAmount.length === 0 && config.paymentIntentClientSecret.length > 0) {
          try {
            const id = this.intentIdFromSecret(config.paymentIntentClientSecret, 'pi');
            const form = new Map<string, Object>();
            form.set('client_secret', config.paymentIntentClientSecret);
            const response = await StripeApiClient.shared.get(`/v1/payment_intents/${id}`, form);
            const amount = StripeModels.num(response.body, 'amount', -1);
            const currency = StripeModels.str(response.body, 'currency');
            if (amount >= 0 && currency.length > 0) {
              config.displayAmount = this.formatAmount(amount, currency);
            }
          } catch (err) {
            hilog.warn(HILOG_DOMAIN, HILOG_TAG, 'retrieve amount for display failed: %{public}s', JSON.stringify(err));
          }
        }
        const result = await new Promise<BridgeRecord>((resolve) => {
          const ext = new PaymentSheetParamsExt();
          ext.kind = StripeSheetKind.PAYMENT_SHEET;
          ext.paymentConfig = config;
          ext.paymentFlow = this.paymentFlowHandler();
          ext.onPaymentFinished = (sheetResult: BridgeRecord) => {
            resolve(sheetResult);
          };
          this.presentPaymentSheetResolver = resolve;
          StripeSheetPresenter.present(this.ctx.uiAbilityContext, ext).catch((err: Object) => {
            resolve({ 'error': this.errorResult('Failed', `present sheet failed: ${JSON.stringify(err)}`) });
          });
        });
        await StripeSheetPresenter.dismiss();
        this.presentPaymentSheetResolver = null;
        this.pendingSheetPaymentMethod = null;
        // sheet 结果 → PresentPaymentSheetResult：成功 {} / 取消 {didCancel} / 失败 {error}
        if (result['canceled'] === true) {
          return { 'didCancel': true };
        }
        const error = StripeModels.asRecord(result['error'] ?? null);
        if (error !== null) {
          return { 'error': error };
        }
        if (result['awaitingMerchant'] === true) {
          return {};
        }
        return {};
      } catch (err) {
        return { 'error': this.apiException(err, 'Failed') };
      }
    };
    return StripeSdkTurboModule.voidPromise(impl() as Promise<Object>);
  }

  async confirmPaymentSheetPayment(): Promise<void> {
    const impl = async (): Promise<BridgeRecord> => {
      const config = this.paymentSheetConfig;
      const pendingPm = this.pendingSheetPaymentMethod;
      if (config === null) {
        return { 'error': this.errorResult('Failed', 'PaymentSheet has not been initialized') };
      }
      if (pendingPm === null) {
        return { 'error': this.errorResult('Failed', 'No payment method selected in the PaymentSheet') };
      }
      const secret = config.paymentIntentClientSecret.length > 0
        ? config.paymentIntentClientSecret
        : config.setupIntentClientSecret;
      if (secret.length === 0) {
        return { 'error': this.errorResult('Failed', 'No client secret configured for PaymentSheet') };
      }
      const result = await this.confirmWithExistingPaymentMethod(secret, StripeModels.str(pendingPm, 'id'), config);
      await StripeSheetPresenter.dismiss();
      this.pendingSheetPaymentMethod = null;
      // sheet 关闭后，一并 resolve 仍挂起的 presentPaymentSheet promise
      const resolver = this.presentPaymentSheetResolver;
      this.presentPaymentSheetResolver = null;
      if (resolver !== null) {
        const error = StripeModels.asRecord(result['error'] ?? null);
        resolver(error !== null ? { 'error': error } : {});
      }
      const error = StripeModels.asRecord(result['error'] ?? null);
      if (error !== null) {
        return { 'error': error };
      }
      return {};
    };
    return StripeSdkTurboModule.voidPromise(impl() as Promise<Object>);
  }

  async intentCreationCallback(result: Object): Promise<void> {
    const record = this.rec(result);
    this.callbacks.deliverCallback(CallbackMethodKeys.INTENT_CREATION, record);
    return Promise.resolve();
  }

  async confirmationTokenCreationCallback(result: Object): Promise<void> {
    const record = this.rec(result);
    this.callbacks.deliverCallback(CallbackMethodKeys.CONFIRMATION_TOKEN_CREATION, record);
    return Promise.resolve();
  }

  async customPaymentMethodResultCallback(result: Object): Promise<void> {
    const record = this.rec(result);
    this.callbacks.deliverCallback(CallbackMethodKeys.CUSTOM_PAYMENT_METHOD_RESULT, record);
    return Promise.resolve();
  }

  async resetPaymentSheetCustomer(): Promise<void> {
    this.callbacks.cancelAll();
    this.pendingSheetPaymentMethod = null;
    return Promise.resolve();
  }

  // ==================== P1：CustomerSheet ====================

  initCustomerSheet(params: Object, customerAdapterOverrides: Object): Promise<Object> {
    const record = this.rec(params);
    const config = new CustomerSheetConfig();
    config.customerId = StripeModels.str(record, 'customerId');
    config.customerEphemeralKeySecret = StripeModels.str(record, 'customerEphemeralKeySecret');
    config.merchantDisplayName = StripeModels.str(record, 'merchantDisplayName');
    config.returnURL = StripeModels.str(record, 'returnURL');
    const overrides = this.rec(customerAdapterOverrides);
    const overrideRecord: BridgeRecord = {};
    const keys = Object.keys(overrides);
    for (const key of keys) {
      overrideRecord[key] = overrides[key] === true;
    }
    config.customerAdapterOverrides = overrideRecord;
    this.customerSheetConfig = config;
    const empty: BridgeRecord = {};
    return Promise.resolve(empty);
  }

  private customerFlowHandler(): CustomerSheetFlowHandler {
    const handler: CustomerSheetFlowHandler = {
      fetchPaymentMethods: (): Promise<CustomerPaymentMethodItem[]> => {
        return this.fetchCustomerPaymentMethods();
      },
      setSelectedPaymentOption: (paymentOption: string): Promise<void> => {
        const wait = this.callbacks.awaitCallback(CallbackMethodKeys.CUSTOMER_ADAPTER_SET_SELECTED);
        this.emitter.emit(StripeSdkEvents.ON_CUSTOMER_ADAPTER_SET_SELECTED_PAYMENT_OPTION, {
          'paymentOption': paymentOption,
        });
        return wait.then(() => {
          return Promise.resolve();
        });
      },
    };
    return handler;
  }

  private async fetchCustomerPaymentMethods(): Promise<CustomerPaymentMethodItem[]> {
    const wait = this.callbacks.awaitCallback(CallbackMethodKeys.CUSTOMER_ADAPTER_FETCH_PAYMENT_METHODS, 120000);
    this.emitter.emit(StripeSdkEvents.ON_CUSTOMER_ADAPTER_FETCH_PAYMENT_METHODS, {});
    const result = await wait;
    const rawList = result['paymentMethods'];
    const items: CustomerPaymentMethodItem[] = [];
    if (Array.isArray(rawList)) {
      const list = rawList as Object[];
      for (const entry of list) {
        const raw = StripeModels.asRecord(entry);
        if (raw === null) {
          continue;
        }
        const item = new CustomerPaymentMethodItem();
        item.id = StripeModels.str(raw, 'id');
        const pmType = StripeModels.str(raw, 'paymentMethodType');
        const card = StripeModels.asRecord(raw['Card'] ?? null);
        const last4 = card !== null ? StripeModels.str(card, 'last4') : '';
        item.label = last4.length > 0 ? `${pmType} •••• ${last4}` : pmType;
        items.push(item);
      }
    }
    return items;
  }

  async presentCustomerSheet(params: Object): Promise<void> {
    const config = this.customerSheetConfig;
    if (config === null) {
      const failure: BridgeRecord = {
        'error': this.errorResult('Failed', 'CustomerSheet has not been initialized'),
      };
      return StripeSdkTurboModule.voidPromise(Promise.resolve(failure));
    }
    const impl = async (): Promise<BridgeRecord> => {
      try {
        const result = await new Promise<BridgeRecord>((resolve) => {
          const ext = new PaymentSheetParamsExt();
          ext.kind = StripeSheetKind.CUSTOMER_SHEET;
          ext.customerConfig = config;
          ext.customerFlow = this.customerFlowHandler();
          ext.onCustomerFinished = (sheetResult: BridgeRecord) => {
            resolve(sheetResult);
          };
          StripeSheetPresenter.present(this.ctx.uiAbilityContext, ext).catch((err: Object) => {
            resolve({ 'error': this.errorResult('Failed', `present sheet failed: ${JSON.stringify(err)}`) });
          });
        });
        await StripeSheetPresenter.dismiss();
        const error = StripeModels.asRecord(result['error'] ?? null);
        if (error !== null) {
          return { 'error': error };
        }
        const selection: BridgeRecord = {};
        const option = result['paymentOption'];
        if (typeof option === 'string') {
          selection['paymentOption'] = option;
        }
        return selection;
      } catch (err) {
        return { 'error': this.apiException(err, 'Failed') };
      }
    };
    return StripeSdkTurboModule.voidPromise(impl() as Promise<Object>);
  }

  async retrieveCustomerSheetPaymentOptionSelection(): Promise<void> {
    const empty: BridgeRecord = {};
    return StripeSdkTurboModule.voidPromise(Promise.resolve(empty));
  }

  async customerAdapterFetchPaymentMethodsCallback(paymentMethods: Object[]): Promise<void> {
    const record: BridgeRecord = { 'paymentMethods': paymentMethods as Object };
    this.callbacks.deliverCallback(CallbackMethodKeys.CUSTOMER_ADAPTER_FETCH_PAYMENT_METHODS, record);
    return Promise.resolve();
  }

  async customerAdapterAttachPaymentMethodCallback(paymentMethod: Object): Promise<void> {
    this.callbacks.deliverCallback(CallbackMethodKeys.CUSTOMER_ADAPTER_ATTACH, this.rec(paymentMethod));
    return Promise.resolve();
  }

  async customerAdapterDetachPaymentMethodCallback(paymentMethod: Object): Promise<void> {
    this.callbacks.deliverCallback(CallbackMethodKeys.CUSTOMER_ADAPTER_DETACH, this.rec(paymentMethod));
    return Promise.resolve();
  }

  async customerAdapterSetSelectedPaymentOptionCallback(): Promise<void> {
    const record: BridgeRecord = {};
    this.callbacks.deliverCallback(CallbackMethodKeys.CUSTOMER_ADAPTER_SET_SELECTED, record);
    return Promise.resolve();
  }

  async customerAdapterFetchSelectedPaymentOptionCallback(paymentOption: null | string): Promise<void> {
    const record: BridgeRecord = { 'paymentOption': paymentOption ?? '' };
    this.callbacks.deliverCallback(CallbackMethodKeys.CUSTOMER_ADAPTER_FETCH_SELECTED, record);
    return Promise.resolve();
  }

  async customerAdapterSetupIntentClientSecretForCustomerAttachCallback(clientSecret: string): Promise<void> {
    const record: BridgeRecord = { 'clientSecret': clientSecret };
    this.callbacks.deliverCallback(CallbackMethodKeys.CUSTOMER_ADAPTER_SETUP_INTENT_SECRET, record);
    return Promise.resolve();
  }

  async clientSecretProviderSetupIntentClientSecretCallback(setupIntentClientSecret: string): Promise<void> {
    const record: BridgeRecord = { 'clientSecret': setupIntentClientSecret };
    this.callbacks.deliverCallback(CallbackMethodKeys.CLIENT_SECRET_PROVIDER_SETUP_INTENT, record);
    return Promise.resolve();
  }

  async clientSecretProviderCustomerSessionClientSecretCallback(customerSessionClientSecret: Object): Promise<void> {
    this.callbacks.deliverCallback(CallbackMethodKeys.CLIENT_SECRET_PROVIDER_CUSTOMER_SESSION, this.rec(customerSessionClientSecret));
    return Promise.resolve();
  }

  // ==================== P2：Financial Connections / 微存款 / Radar ====================

  async verifyMicrodeposits(isPaymentIntent: boolean, clientSecret: string, params: Object): Promise<Object> {
    try {
      const record = this.rec(params);
      const prefix = isPaymentIntent ? 'pi' : 'seti';
      const id = this.intentIdFromSecret(clientSecret, prefix);
      const form = new Map<string, Object>();
      form.set('client_secret', clientSecret);
      const amounts = record['amounts'];
      if (Array.isArray(amounts) && amounts.length === 2) {
        form.set('amounts[0]', amounts[0]);
        form.set('amounts[1]', amounts[1]);
      }
      const descriptor = StripeModels.str(record, 'descriptor');
      if (descriptor.length > 0) {
        form.set('descriptor', descriptor);
      }
      const path = isPaymentIntent
        ? `/v1/payment_intents/${id}/verify_microdeposits`
        : `/v1/setup_intents/${id}/verify_microdeposits`;
      const response = await StripeApiClient.shared.post(path, form);
      if (isPaymentIntent) {
        const piResult: BridgeRecord = { 'paymentIntent': StripeModels.paymentIntent(response.body) };
        return piResult;
      }
      const siResult: BridgeRecord = { 'setupIntent': StripeModels.setupIntent(response.body) };
      return siResult;
    } catch (err) {
      const errResult: BridgeRecord = { 'error': this.apiException(err, 'Failed') };
      return errResult;
    }
  }

  async collectBankAccount(isPaymentIntent: boolean, clientSecret: string, params: Object): Promise<Object> {
    try {
      const record = this.rec(params);
      const form = new Map<string, Object>();
      form.set('payment_method_data[type]', 'us_bank_account');
      const pmData = StripeModels.asRecord(record['paymentMethodData'] ?? null) ?? {};
      const accountNumber = StripeModels.str(pmData, 'accountNumber');
      const routingNumber = StripeModels.str(pmData, 'routingNumber');
      if (accountNumber.length === 0 || routingNumber.length === 0) {
        const missing: BridgeRecord = { 'error': this.errorResult('Failed', 'accountNumber and routingNumber are required') };
        return missing;
      }
      form.set('payment_method_data[us_bank_account][account_number]', accountNumber);
      form.set('payment_method_data[us_bank_account][routing_number]', routingNumber);
      const holderType = StripeModels.str(pmData, 'accountHolderType');
      if (holderType.length > 0) {
        form.set('payment_method_data[us_bank_account][account_holder_type]', holderType.toLowerCase());
      }
      const billing = StripeModels.asRecord(pmData['billingDetails'] ?? null);
      if (billing !== null) {
        const name = StripeModels.str(billing, 'name');
        if (name.length > 0) {
          form.set('payment_method_data[billing_details][name]', name);
        }
        const email = StripeModels.str(billing, 'email');
        if (email.length > 0) {
          form.set('payment_method_data[billing_details][email]', email);
        }
      }
      const pmResponse = await StripeApiClient.shared.post('/v1/payment_methods', form);
      const pmId = StripeModels.str(pmResponse.body, 'id');
      const isPI = isPaymentIntent;
      const id = this.intentIdFromSecret(clientSecret, isPI ? 'pi' : 'seti');
      const confirmForm = new Map<string, Object>();
      confirmForm.set('client_secret', clientSecret);
      confirmForm.set('payment_method', pmId);
      const path = isPI ? `/v1/payment_intents/${id}/confirm` : `/v1/setup_intents/${id}/confirm`;
      const response = await StripeApiClient.shared.post(path, confirmForm);
      if (isPI) {
        const piResult: BridgeRecord = { 'paymentIntent': StripeModels.paymentIntent(response.body) };
        return piResult;
      }
      const siResult: BridgeRecord = { 'setupIntent': StripeModels.setupIntent(response.body) };
      return siResult;
    } catch (err) {
      const errResult: BridgeRecord = { 'error': this.apiException(err, 'Failed') };
      return errResult;
    }
  }

  async canAddCardToWallet(params: Object): Promise<void> {
    // JS 层 CanAddCardToWalletResult：{ canAddCard: false, details: { status } }
    const details: BridgeRecord = { 'status': 'UNSUPPORTED_DEVICE' };
    const result: BridgeRecord = {
      'canAddCard': false,
      'details': details,
    };
    return StripeSdkTurboModule.voidPromise(Promise.resolve(result));
  }

  async isCardInWallet(params: Object): Promise<void> {
    const result: BridgeRecord = {
      'isInWallet': false,
    };
    return StripeSdkTurboModule.voidPromise(Promise.resolve(result));
  }

  async collectBankAccountToken(clientSecret: string, params: Object): Promise<void> {
    return StripeSdkTurboModule.voidPromise(this.notSupported('collectBankAccountToken'));
  }

  async collectFinancialConnectionsAccounts(clientSecret: string, params: Object): Promise<void> {
    return StripeSdkTurboModule.voidPromise(this.notSupported('collectFinancialConnectionsAccounts'));
  }

  async createRadarSession(): Promise<void> {
    const impl = async (): Promise<BridgeRecord> => {
      try {
        const form = new Map<string, Object>();
        const response = await StripeApiClient.shared.post('/v1/radar_sessions', form);
        return { 'radarSessionId': StripeModels.str(response.body, 'id') };
      } catch (err) {
        return { 'error': this.apiException(err, 'Failed') };
      }
    };
    return StripeSdkTurboModule.voidPromise(impl() as Promise<Object>);
  }

  async setFinancialConnectionsForceNativeFlow(enabled: boolean): Promise<void> {
    return Promise.resolve();
  }

  // ==================== P2：Web 承载 / 下载分享 / Connect ====================

  async openAuthenticatedWebView(id: string, url: string): Promise<null | WebViewAuthResult> {
    const resultUrl = await this.runWebAuth(url, 'stripe://');
    await StripeSheetPresenter.dismiss();
    if (resultUrl === null) {
      return null;
    }
    const result: WebViewAuthResult = { url: resultUrl };
    return result;
  }

  async presentExternalWebPage(url: string): Promise<void> {
    const request = new WebAuthRequest(url, 'stripe://');
    const impl = new Promise<void>((resolve) => {
      request.onComplete = (resultUrl: string | null) => {
        resolve();
      };
      const params = new StripeSheetParams();
      params.kind = StripeSheetKind.WEB_AUTH;
      params.webAuth = request;
      StripeSheetPresenter.present(this.ctx.uiAbilityContext, params).catch(() => {
        resolve();
      });
    });
    return impl;
  }

  async downloadAndShareFile(url: string, filename: null | string): Promise<DownloadShareOutcome> {
    const result = await ShareHelper.downloadAndShare(this.ctx.uiAbilityContext, url, filename);
    const outcome: DownloadShareOutcome = { success: result.success };
    if (result.error !== undefined) {
      outcome.error = result.error;
    }
    return outcome;
  }

  async authWebViewDeepLinkHandled(id: string): Promise<void> {
    DeepLinkHelper.shared.handleUrl('stripe://');
    return Promise.resolve();
  }

  async storeStripeConnectDeepLink(url: string): Promise<void> {
    DeepLinkHelper.shared.storeConnectDeepLink(url);
    return Promise.resolve();
  }

  async pollAndClearPendingStripeConnectUrls(): Promise<string[]> {
    return DeepLinkHelper.shared.pollAndClearConnectUrls();
  }

  // ==================== P3 / 降级：平台支付 / 钱包 / Link / Embedded ====================

  async isPlatformPaySupported(params: Object): Promise<boolean> {
    return false;
  }

  async createPlatformPayPaymentMethod(params: Object, usesDeprecatedTokenFlow: boolean): Promise<Object> {
    return this.notSupported('createPlatformPayPaymentMethod');
  }

  async dismissPlatformPay(): Promise<boolean> {
    return false;
  }

  async updatePlatformPaySheet(summaryItems: Object[], shippingMethods: Object[], errors: Object[]): Promise<void> {
    return Promise.resolve();
  }

  async confirmPlatformPay(clientSecret: string, params: Object, isPaymentIntent: boolean): Promise<Object> {
    return this.notSupported('confirmPlatformPay');
  }

  async openApplePaySetup(): Promise<void> {
    return StripeSdkTurboModule.voidPromise(this.notSupported('openApplePaySetup'));
  }

  async configureOrderTracking(orderTypeIdentifier: string, orderIdentifier: string, webServiceUrl: string, authenticationToken: string): Promise<void> {
    return Promise.resolve();
  }

  async createEmbeddedPaymentElement(intentConfig: Object, configuration: Object): Promise<void> {
    const error = this.errorResult('notSupported', 'EmbeddedPaymentElement is not supported on HarmonyOS');
    const payload: BridgeRecord = { 'message': error['message'] };
    this.emitter.emit(StripeSdkEvents.EMBEDDED_ELEMENT_LOADING_FAILED, payload);
    const result: BridgeRecord = { 'error': error };
    return StripeSdkTurboModule.voidPromise(Promise.resolve(result));
  }

  async confirmEmbeddedPaymentElement(viewTag: number): Promise<void> {
    return StripeSdkTurboModule.voidPromise(this.notSupported('confirmEmbeddedPaymentElement'));
  }

  async updateEmbeddedPaymentElement(intentConfig: Object): Promise<null | Object> {
    return null;
  }

  async clearEmbeddedPaymentOption(viewTag: number): Promise<void> {
    return Promise.resolve();
  }

  async initLinkController(params: Object): Promise<Object> {
    return this.notSupported('initLinkController');
  }

  async presentLinkController(): Promise<Object> {
    return this.notSupported('presentLinkController');
  }

  async confirmLinkControllerSetupIntent(params: Object): Promise<Object> {
    return this.notSupported('confirmLinkControllerSetupIntent');
  }

  // ==================== 事件订阅占位（DeviceEventEmitter 推模型） ====================

  addListener(eventType: string): void {
    // DeviceEventEmitter 为推模型，native 侧无需订阅登记
  }

  removeListeners(count: number): void {
    // 对应 addListener 占位，无操作
  }
}
