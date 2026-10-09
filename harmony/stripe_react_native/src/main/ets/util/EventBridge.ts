/**
 * EventBridge — 统一的事件发射与双向回调（callId/pending-promise 表）管理。
 *
 * 24 个模块事件经 ctx.rnInstance.emitDeviceEvent 发射（JS 侧 events.ts 在非 iOS
 * 平台统一走 DeviceEventEmitter，鸿蒙零改动兼容）。
 * 11 个双向回调方法（customerAdapter ×6 / clientSecretProvider ×2 /
 * intentCreation / confirmationToken / customPaymentMethod）复刻 Android
 * EventEmitterCompat 模式：native 触发时机发射事件，JS 处理后调用对应
 * Promise 方法回传结果，native 侧以方法名为 key 维护 pending resolver，
 * 并带超时回收防泄漏。
 */

import type { RNInstance } from '@rnoh/react-native-openharmony/ts';
import hilog from '@ohos.hilog';

const HILOG_DOMAIN = 0x0000;
const HILOG_TAG = 'StripeSdk';

/** StripeSdk 模块事件名（与 JS 侧 src/events.ts 的 Events 映射一致） */
export class StripeSdkEvents {
  static readonly ON_CONFIRM_HANDLER_CALLBACK = 'onConfirmHandlerCallback';
  static readonly ON_CONFIRMATION_TOKEN_HANDLER_CALLBACK = 'onConfirmationTokenHandlerCallback';
  static readonly ON_FINANCIAL_CONNECTIONS_EVENT = 'onFinancialConnectionsEvent';
  static readonly ON_ORDER_TRACKING_CALLBACK = 'onOrderTrackingCallback';
  static readonly ON_CUSTOMER_ADAPTER_FETCH_PAYMENT_METHODS = 'onCustomerAdapterFetchPaymentMethodsCallback';
  static readonly ON_CUSTOMER_ADAPTER_ATTACH_PAYMENT_METHOD = 'onCustomerAdapterAttachPaymentMethodCallback';
  static readonly ON_CUSTOMER_ADAPTER_DETACH_PAYMENT_METHOD = 'onCustomerAdapterDetachPaymentMethodCallback';
  static readonly ON_CUSTOMER_ADAPTER_SET_SELECTED_PAYMENT_OPTION = 'onCustomerAdapterSetSelectedPaymentOptionCallback';
  static readonly ON_CUSTOMER_ADAPTER_FETCH_SELECTED_PAYMENT_OPTION = 'onCustomerAdapterFetchSelectedPaymentOptionCallback';
  static readonly ON_CUSTOMER_ADAPTER_SETUP_INTENT_CLIENT_SECRET = 'onCustomerAdapterSetupIntentClientSecretForCustomerAttachCallback';
  static readonly ON_CUSTOMER_SESSION_PROVIDER_SETUP_INTENT_SECRET = 'onCustomerSessionProviderSetupIntentClientSecret';
  static readonly ON_CUSTOMER_SESSION_PROVIDER_CUSTOMER_SESSION_SECRET = 'onCustomerSessionProviderCustomerSessionClientSecret';
  static readonly EMBEDDED_ELEMENT_DID_UPDATE_HEIGHT = 'embeddedPaymentElementDidUpdateHeight';
  static readonly EMBEDDED_ELEMENT_WILL_PRESENT = 'embeddedPaymentElementWillPresent';
  static readonly EMBEDDED_ELEMENT_DID_UPDATE_PAYMENT_OPTION = 'embeddedPaymentElementDidUpdatePaymentOption';
  static readonly EMBEDDED_ELEMENT_FORM_SHEET_CONFIRM_COMPLETE = 'embeddedPaymentElementFormSheetConfirmComplete';
  static readonly EMBEDDED_ELEMENT_ROW_SELECTION_IMMEDIATE_ACTION = 'embeddedPaymentElementRowSelectionImmediateAction';
  static readonly EMBEDDED_ELEMENT_LOADING_FAILED = 'embeddedPaymentElementLoadingFailed';
  static readonly EMBEDDED_ELEMENT_UPDATE_COMPLETE = 'embeddedPaymentElementUpdateComplete';
  static readonly ON_CUSTOM_PAYMENT_METHOD_CONFIRM_HANDLER = 'onCustomPaymentMethodConfirmHandlerCallback';
  static readonly PMME_DID_UPDATE_HEIGHT = 'paymentMethodMessagingElementDidUpdateHeight';
  static readonly PMME_CONFIGURE_RESULT = 'paymentMethodMessagingElementConfigureResult';
  static readonly CHECKOUT_CONTROLLER_DID_UPDATE = 'checkoutControllerDidUpdate';
}

/** 双向回调方法的 pending 表 key（即 JS 回传方法名） */
export class CallbackMethodKeys {
  static readonly INTENT_CREATION = 'intentCreationCallback';
  static readonly CONFIRMATION_TOKEN_CREATION = 'confirmationTokenCreationCallback';
  static readonly CUSTOM_PAYMENT_METHOD_RESULT = 'customPaymentMethodResultCallback';
  static readonly CUSTOMER_ADAPTER_FETCH_PAYMENT_METHODS = 'customerAdapterFetchPaymentMethodsCallback';
  static readonly CUSTOMER_ADAPTER_ATTACH = 'customerAdapterAttachPaymentMethodCallback';
  static readonly CUSTOMER_ADAPTER_DETACH = 'customerAdapterDetachPaymentMethodCallback';
  static readonly CUSTOMER_ADAPTER_SET_SELECTED = 'customerAdapterSetSelectedPaymentOptionCallback';
  static readonly CUSTOMER_ADAPTER_FETCH_SELECTED = 'customerAdapterFetchSelectedPaymentOptionCallback';
  static readonly CUSTOMER_ADAPTER_SETUP_INTENT_SECRET = 'customerAdapterSetupIntentClientSecretForCustomerAttachCallback';
  static readonly CLIENT_SECRET_PROVIDER_SETUP_INTENT = 'clientSecretProviderSetupIntentClientSecretCallback';
  static readonly CLIENT_SECRET_PROVIDER_CUSTOMER_SESSION = 'clientSecretProviderCustomerSessionClientSecretCallback';
}

/** 双向回调默认超时（ms），超时后以 Canceled 错误回收 pending promise */
export const CALLBACK_TIMEOUT_MS = 60000;

/**
 * 双向回调 pending-promise 表：
 * - awaitCallback(key) 在发射事件前调用，得到一个 Promise（native 等待 JS 回传）
 * - deliverCallback(key, value) 由 JS 回传方法调用，resolve 对应 pending
 * - 超时自动 reject，防止泄漏
 */
export class CallbackRegistry {
  private pending: Map<string, { resolve: (value: Record<string, Object>) => void, reject: (reason: Record<string, Object>) => void, timer: number }> = new Map();

  awaitCallback(key: string, timeoutMs: number = CALLBACK_TIMEOUT_MS): Promise<Record<string, Object>> {
    this.cancelPending(key);
    return new Promise<Record<string, Object>>((resolve, reject) => {
      const timer = setTimeout(() => {
        const entry = this.pending.get(key);
        if (entry) {
          this.pending.delete(key);
          const timeoutError: Record<string, Object> = {
            'code': 'Timeout',
            'message': `Stripe callback ${key} timed out waiting for JS response`,
          };
          entry.reject(timeoutError);
        }
      }, timeoutMs);
      this.pending.set(key, { resolve: resolve, reject: reject, timer: timer });
    });
  }

  deliverCallback(key: string, value: Record<string, Object>): boolean {
    const entry = this.pending.get(key);
    if (!entry) {
      return false;
    }
    clearTimeout(entry.timer);
    this.pending.delete(key);
    entry.resolve(value);
    return true;
  }

  cancelPending(key: string): void {
    const entry = this.pending.get(key);
    if (entry) {
      clearTimeout(entry.timer);
      this.pending.delete(key);
      const canceled: Record<string, Object> = { 'code': 'Canceled', 'message': `Stripe callback ${key} canceled` };
      entry.reject(canceled);
    }
  }

  cancelAll(): void {
    const keys = Array.from(this.pending.keys());
    for (const key of keys) {
      this.cancelPending(key);
    }
  }
}

/**
 * 事件发射封装：保证 payload 非裸标量（跨边界合约 1），
 * 统一 try-catch（合约 6：禁止 ArkTS throw 外泄）。
 */
export class StripeEventEmitter {
  private rnInstance: RNInstance | null = null;

  setInstance(rnInstance: RNInstance | null): void {
    this.rnInstance = rnInstance;
  }

  emit(eventName: string, payload: Record<string, Object>): void {
    try {
      this.rnInstance?.emitDeviceEvent(eventName, payload);
    } catch (err) {
      hilog.error(HILOG_DOMAIN, HILOG_TAG, 'emitDeviceEvent %{public}s failed: %{public}s', eventName, JSON.stringify(err));
    }
  }
}
