/**
 * Sheet 层共享类型与控制器（无 ArkUI 依赖，可被 .ts/.ets 双向导入）。
 */

import type { CardFieldSnapshot } from '../card/CardValidator';

/** 3DS / redirect 认证 Web 承载请求 */
export class WebAuthRequest {
  readonly url: string;
  /** 期望回跳的 returnURL 前缀（stripe:// 或业务自定义 scheme） */
  readonly returnUrl: string;
  /** 认证完成（回跳命中或用户取消传 null） */
  onComplete: ((resultUrl: string | null) => void) | null = null;

  constructor(url: string, returnUrl: string) {
    this.url = url;
    this.returnUrl = returnUrl;
  }
}

/** PaymentSheet 初始化配置（initPaymentSheet 存储） */
export class PaymentSheetConfig {
  paymentIntentClientSecret: string = '';
  setupIntentClientSecret: string = '';
  customFlow: boolean = false;
  merchantDisplayName: string = '';
  customerId: string = '';
  customerEphemeralKeySecret: string = '';
  stripeAccountId: string = '';
  primaryButtonLabel: string = '';
  defaultBillingDetails: Record<string, Object> | null = null;
  appearance: Record<string, Object> | null = null;
  allowsDelayedPaymentMethods: boolean = false;
  billingDetailsCollectionConfiguration: Record<string, Object> | null = null;
  returnURL: string = '';
  /** present 时由 TurboModule retrieve Intent 预取的金额展示串（如 "$10.00"） */
  displayAmount: string = '';
}

/** PaymentSheet 结果回传 */
export type SheetResultCallback = (result: Record<string, Object>) => void;

/** CustomerSheet 初始化配置 */
export class CustomerSheetConfig {
  customerId: string = '';
  customerEphemeralKeySecret: string = '';
  merchantDisplayName: string = '';
  headerTextForSelection: string = '';
  returnURL: string = '';
  customerAdapterOverrides: Record<string, Object> | null = null;
}

/** 客户支付方式展示项（来自 customerAdapterFetchPaymentMethodsCallback 回传） */
export class CustomerPaymentMethodItem {
  id: string = '';
  label: string = '';
  isSelected: boolean = false;
}

/** Stripe Sheet 视图种类（builder 分发用） */
export enum StripeSheetKind {
  WEB_AUTH = 'webAuth',
  PAYMENT_SHEET = 'paymentSheet',
  CUSTOMER_SHEET = 'customerSheet',
  EXTERNAL_PAGE = 'externalPage',
}

/** 传给 @Builder 的参数 */
export class StripeSheetParams {
  kind: string = StripeSheetKind.WEB_AUTH;
  webAuth: WebAuthRequest | null = null;
  paymentConfig: PaymentSheetConfig | null = null;
  customerConfig: CustomerSheetConfig | null = null;
  externalUrl: string = '';
}

/**
 * PaymentSheet 支付流程处理器（StripeSdkTurboModule 实现）：
 * 页面只负责 UI 与卡数据采集，REST 创建/确认/3DS 由 TurboModule 层完成。
 */
export interface PaymentSheetFlowHandler {
  /** 默认流程：卡数据 → 创建 PM → 确认 → 3DS → 结果 */
  confirmDefaultFlow(card: CardFieldSnapshot, config: PaymentSheetConfig): Promise<Record<string, Object>>;
  /** customFlow：创建 PM 后发射 onConfirmHandlerCallback，等待 JS 确认 */
  startCustomFlow(card: CardFieldSnapshot, config: PaymentSheetConfig): Promise<Record<string, Object>>;
}

/** 客户支付方式列表数据源（由 customerAdapterFetchPaymentMethodsCallback 回传驱动） */
export class CustomerSheetDataSource {
  items: CustomerPaymentMethodItem[] = [];
}

/** CustomerSheet 流程处理器（StripeSdkTurboModule 实现） */
export interface CustomerSheetFlowHandler {
  /** 发射 onCustomerAdapterFetchPaymentMethodsCallback 并等待 JS 回传列表 */
  fetchPaymentMethods(): Promise<CustomerPaymentMethodItem[]>;
  /** 用户选择支付方式后：发射 setSelected 回调并等待确认 */
  setSelectedPaymentOption(paymentOption: string): Promise<void>;
}
