/**
 * MIT License
 *
 * Copyright (C) 2026 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
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
        closeDialog: (params as PaymentSheetParamsExt).closeDialog,
      })
    } else if (params.kind === StripeSheetKind.CUSTOMER_SHEET && params.customerConfig !== null) {
      CustomerSheetPage({
        config: params.customerConfig,
        flowHandler: (params as PaymentSheetParamsExt).customerFlow,
        onFinished: (params as PaymentSheetParamsExt).onCustomerFinished,
        closeDialog: (params as PaymentSheetParamsExt).closeDialog,
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
  /** 弹窗内容自关闭通道（Presenter 注入 controller.close()，2026-11-04 卡屏修复） */
  closeDialog: () => void = () => {
  };
}

export const StripeSheetBuilder: WrappedBuilder<[StripeSheetParams]> = wrapBuilder(stripeSheetView);
