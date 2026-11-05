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
 * ApplePayButton — 鸿蒙降级占位组件（P3）。
 *
 * 鸿蒙无 Apple Pay 系统服务（02-planning 已查证无等价能力）。本组件渲染
 * 黑底占位按钮保持布局兼容；shipping/coupon/order 回调事件在此平台不会触发。
 * JS 侧 PlatformPayButton 已对 harmony 分支渲染降级占位。
 */

import { RNOHContext, RNViewBase } from '@rnoh/react-native-openharmony';
import { ApplePayButton as Spec } from '../generated/components/ApplePayButton';

@Component
export struct ApplePayButton {
  public static readonly NAME = Spec.NAME;
  public ctx!: RNOHContext;
  public tag: number = 0;

  @State private isDisabled: boolean = false;
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
      this.isDisabled = rawProps.disabled ?? false;
      this.cornerRadius = rawProps.buttonBorderRadius ?? 4;
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
        Text(' Pay')
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor('#FFFFFF')
      }
      .width('100%')
      .height('100%')
      .borderRadius(this.cornerRadius)
      .backgroundColor('#000000')
      .justifyContent(FlexAlign.Center)
      .opacity(this.isDisabled ? 0.4 : 1)
    }
  }
}
