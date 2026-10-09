/**
 * StripeSheetBuilder — ComponentContent 用的 WrappedBuilder 入口。
 * 依据 StripeSheetParams.kind 分发到对应 ArkTS 组件。
 * StripeContainer 视图与页面组装遵循「叶子组件 + Stack 容器」约束。
 */

import { StripeSheetParams, StripeSheetKind, PaymentSheetFlowHandler, CustomerSheetFlowHandler } from './SheetController';
import { StripeWebSheet } from './StripeWebSheet';
import { PaymentSheetPage } from './PaymentSheetPage';
import { CustomerSheetPage } from './CustomerSheetPage';

@Builder
function stripeSheetView(params: StripeSheetParams) {
  Stack() {
    if (params.kind === StripeSheetKind.WEB_AUTH && params.webAuth !== null) {
      StripeWebSheet({ webAuth: params.webAuth })
    } else if (params.kind === StripeSheetKind.PAYMENT_SHEET && params.paymentConfig !== null) {
      PaymentSheetPage({
        config: params.paymentConfig,
        flowHandler: (params as PaymentSheetParamsExt).paymentFlow,
        onFinished: (params as PaymentSheetParamsExt).onPaymentFinished,
      })
    } else if (params.kind === StripeSheetKind.CUSTOMER_SHEET && params.customerConfig !== null) {
      CustomerSheetPage({
        config: params.customerConfig,
        flowHandler: (params as PaymentSheetParamsExt).customerFlow,
        onFinished: (params as PaymentSheetParamsExt).onCustomerFinished,
      })
    }
  }
  .width('100%')
  .height('100%')
  .align(Alignment.Bottom)
  .backgroundColor('rgba(0,0,0,0.4)')
}

/** 扩展参数：flow handler 与结果回调（由 TurboModule 组装） */
export class PaymentSheetParamsExt extends StripeSheetParams {
  paymentFlow: PaymentSheetFlowHandler | null = null;
  onPaymentFinished: (result: Record<string, Object>) => void = (result: Record<string, Object>) => {
  };
  customerFlow: CustomerSheetFlowHandler | null = null;
  onCustomerFinished: (result: Record<string, Object>) => void = (result: Record<string, Object>) => {
  };
}

export const StripeSheetBuilder: WrappedBuilder<[StripeSheetParams]> = wrapBuilder(stripeSheetView);
