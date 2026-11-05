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
 * GooglePayButton — 鸿蒙降级占位组件（P3）。
 *
 * 鸿蒙无 Google 移动服务（02-planning 已查证）。渲染 G Pay 风格占位按钮
 * 保持布局兼容，无支付行为。
 */

import { RNOHContext, RNViewBase } from '@rnoh/react-native-openharmony';
import { GooglePayButton as Spec } from '../generated/components/GooglePayButton';

@Component
export struct GooglePayButton {
  public static readonly NAME = Spec.NAME;
  public ctx!: RNOHContext;
  public tag: number = 0;

  @State private cornerRadius: number = 4;

  private cleanUpCallbacks: (() => void)[] = [];

  aboutToAppear(): void {
    // subscribeToDescriptorChanges 只监听后续变更，不会以初始 descriptor 立即回调，
    // 需主动读取当前 props 应用一次，否则首帧全部为默认值（与 StripeContainer 同型）
    this.applyDescriptor(this.ctx.descriptorRegistry.getDescriptor<Spec.Descriptor>(this.tag));
    this.cleanUpCallbacks.push(
      this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag, (descriptor) => {
        this.applyDescriptor(descriptor as Spec.Descriptor);
      })
    );
  }

  private applyDescriptor(descriptor: Spec.Descriptor): void {
    const rawProps = descriptor.rawProps as Spec.DirectRawProps;
    if (rawProps) {
      this.cornerRadius = rawProps.borderRadius ?? 4;
    }
  }

  aboutToDisappear(): void {
    for (const cb of this.cleanUpCallbacks) {
      cb();
    }
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      Column() {
        Text('G Pay')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor('#3C4043')
      }
      .width('100%')
      .height('100%')
      .borderRadius(this.cornerRadius)
      .backgroundColor('#FFFFFF')
      .border({ width: 1, color: '#DADCE0' })
      .justifyContent(FlexAlign.Center)
    }
  }
}
