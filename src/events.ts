/**
 * Compatibility helper for new architecture events using NativeEventEmitter
 * or DeviceEventEmitter on React Native versions before 0.80.
 *
 * Can be removed once we no longer need to support React Native < 0.80 and use
 * the methods on NativeStripeSdkModule directly.
 */

import {
  DeviceEventEmitter,
  EventSubscription,
  NativeEventEmitter,
  Platform,
} from 'react-native';
import NativeStripeSdkModule from './specs/v1/NativeStripeSdkModule';
import NativeOnrampSdkModule from './specs/v1/NativeOnrampSdkModule';
import { PaymentMethod } from './types';
import { UnsafeObject } from './specs/v1/utils';
import { FinancialConnectionsEvent } from './types/FinancialConnections';
import { Result as ConfirmationTokenResult } from './types/ConfirmationToken';
import type { CheckoutControllerUpdate } from './checkout/CheckoutControllerEventEmitter';

// RN 0.72 的 CodegenTypes 未导出 EventEmitter 类型，这里用等价的函数签名本地声明
// （EventEmitter<Payload> 表示：接收 (event: Payload) => void 监听器的发射器签名）。
type EventEmitter<T> = (listener: (event: T) => void) => void;

const compatEventEmitter =
  Platform.OS === 'ios'
    ? new NativeEventEmitter(NativeStripeSdkModule as any)
    : DeviceEventEmitter;

// This is a temporary compat layer for event emitters on new arch.
// Versions before RN 0.80 crash sometimes when setting the event emitter callback.
// Move this back to the NativeStripeSdkModule spec once we drop support for RN < 0.80.
type Events = {
  onConfirmHandlerCallback: EventEmitter<{
    paymentMethod: UnsafeObject<PaymentMethod.Result>;
    shouldSavePaymentMethod: boolean;
  }>;
  onConfirmationTokenHandlerCallback: EventEmitter<{
    confirmationToken: UnsafeObject<ConfirmationTokenResult>;
  }>;
  onFinancialConnectionsEvent: EventEmitter<
    UnsafeObject<FinancialConnectionsEvent>
  >;
  onOrderTrackingCallback: EventEmitter<void>;
  onCustomerAdapterFetchPaymentMethodsCallback: EventEmitter<void>;
  onCustomerAdapterAttachPaymentMethodCallback: EventEmitter<{
    paymentMethodId: string;
  }>;
  onCustomerAdapterDetachPaymentMethodCallback: EventEmitter<{
    paymentMethodId: string;
  }>;
  onCustomerAdapterSetSelectedPaymentOptionCallback: EventEmitter<{
    paymentOption: string;
  }>;
  onCustomerAdapterFetchSelectedPaymentOptionCallback: EventEmitter<void>;
  onCustomerAdapterSetupIntentClientSecretForCustomerAttachCallback: EventEmitter<void>;
  onCustomerSessionProviderSetupIntentClientSecret: EventEmitter<void>;
  onCustomerSessionProviderCustomerSessionClientSecret: EventEmitter<void>;
  embeddedPaymentElementDidUpdateHeight: EventEmitter<UnsafeObject<any>>;
  embeddedPaymentElementWillPresent: EventEmitter<void>;
  embeddedPaymentElementDidUpdatePaymentOption: EventEmitter<UnsafeObject<any>>;
  embeddedPaymentElementFormSheetConfirmComplete: EventEmitter<
    UnsafeObject<any>
  >;
  embeddedPaymentElementRowSelectionImmediateAction: EventEmitter<void>;
  embeddedPaymentElementLoadingFailed: EventEmitter<UnsafeObject<any>>;
  embeddedPaymentElementUpdateComplete: EventEmitter<UnsafeObject<any>>;
  onCustomPaymentMethodConfirmHandlerCallback: EventEmitter<UnsafeObject<any>>;
  paymentMethodMessagingElementDidUpdateHeight: EventEmitter<UnsafeObject<any>>;
  paymentMethodMessagingElementConfigureResult: EventEmitter<UnsafeObject<any>>;
  checkoutControllerDidUpdate: EventEmitter<
    UnsafeObject<CheckoutControllerUpdate>
  >;
};

export function addListener<EventT extends keyof Events>(
  event: EventT,
  handler: Parameters<Events[EventT]>[0]
): EventSubscription {
  return compatEventEmitter.addListener(event, handler);
}

const compatOnrampEventEmitter =
  NativeOnrampSdkModule == null
    ? null
    : Platform.OS === 'ios'
      ? new NativeEventEmitter(NativeOnrampSdkModule as any)
      : DeviceEventEmitter;

type OnrampEventMap = {
  onCheckoutClientSecretRequested: void;
};

type OnrampEvents = keyof OnrampEventMap;

export function addOnrampListener<EventT extends OnrampEvents>(
  event: EventT,
  handler: (params: OnrampEventMap[EventT]) => void
): EventSubscription {
  if (compatOnrampEventEmitter == null) {
    // Return a no-op subscription when module is not available
    return { remove: () => {} } as EventSubscription;
  }
  return compatOnrampEventEmitter.addListener(event, handler);
}
