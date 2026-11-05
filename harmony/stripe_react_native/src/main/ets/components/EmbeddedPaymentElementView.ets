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
 * EmbeddedPaymentElementView — 鸿蒙降级空实现（P2）。
 *
 * Embedded Payment Element 依赖 stripe-android Compose 原生组件（鸿蒙无对应，
 * 02-planning 架构级降级）。渲染空视图保持布局；Commands（confirm/
 * clearPaymentOption/update）注册为无操作，由 TurboModule 层
 * createEmbeddedPaymentElement 返回 notSupported 结构化错误。
 */

import { RNOHContext, RNViewBase } from '@rnoh/react-native-openharmony';
import { EmbeddedPaymentElementView as Spec } from '../generated/components/EmbeddedPaymentElementView';

@Component
export struct EmbeddedPaymentElementView {
  public static readonly NAME = Spec.NAME;
  public ctx!: RNOHContext;
  public tag: number = 0;

  private cleanUpCallbacks: (() => void)[] = [];

  aboutToAppear(): void {
    this.cleanUpCallbacks.push(
      new Spec.CommandReceiver(this.ctx.componentCommandReceiver, this.tag).subscribe('confirm', () => {
        // 降级：无操作（TurboModule createEmbeddedPaymentElement 返回 notSupported）
      })
    );
    this.cleanUpCallbacks.push(
      new Spec.CommandReceiver(this.ctx.componentCommandReceiver, this.tag).subscribe('clearPaymentOption', () => {
        // 降级：无操作
      })
    );
    this.cleanUpCallbacks.push(
      new Spec.CommandReceiver(this.ctx.componentCommandReceiver, this.tag).subscribe('update', () => {
        // 降级：无操作
      })
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
