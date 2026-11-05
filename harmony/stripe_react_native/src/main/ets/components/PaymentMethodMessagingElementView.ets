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
 * PaymentMethodMessagingElementView — 鸿蒙降级空实现（P2）。
 *
 * PaymentMethodMessaging 依赖 Stripe 私有 API（REST 未公开对应端点，
 * 02-planning native_dependency_mapping 降级决策）。渲染空视图；
 * configureResult 事件由 JS 侧消费，native 保持静默（不发射假成功）。
 */

import { RNOHContext, RNViewBase } from '@rnoh/react-native-openharmony';
import { PaymentMethodMessagingElementView as Spec } from '../generated/components/PaymentMethodMessagingElementView';

@Component
export struct PaymentMethodMessagingElementView {
  public static readonly NAME = Spec.NAME;
  public ctx!: RNOHContext;
  public tag: number = 0;

  private cleanUpCallbacks: (() => void)[] = [];

  aboutToAppear(): void {
    this.cleanUpCallbacks.push(
      this.ctx.descriptorRegistry.subscribeToDescriptorChanges(
        this.tag,
        (descriptor) => {
          // appearance/configuration 在本平台无对应实现（降级空视图），仅保持订阅生命周期
        }
      )
    );
  }

  aboutToDisappear(): void {
    for (const cb of this.cleanUpCallbacks) {
      cb();
    }
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      Column() {
      }
      .width('100%')
      .height('100%')
    }
  }
}
