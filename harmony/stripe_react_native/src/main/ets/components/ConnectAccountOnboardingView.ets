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
 * ConnectAccountOnboardingView — 鸿蒙降级空实现（P3）。
 *
 * JS 层 ConnectAccountOnboarding 组件仅在 iOS 分支使用该原生视图；Android 走
 * RN Modal（鸿蒙同 Android 路径）。本组件保留注册与 visible 属性兼容，
 * 渲染空视图。exitAction 事件在 visible 变为 false 时发射以保持时序兼容。
 */

import { RNOHContext, RNViewBase } from '@rnoh/react-native-openharmony';
import { ConnectAccountOnboardingView as Spec } from '../generated/components/ConnectAccountOnboardingView';

@Component
export struct ConnectAccountOnboardingView {
  public static readonly NAME = Spec.NAME;
  public ctx!: RNOHContext;
  public tag: number = 0;

  @State private isVisible: boolean = false;

  private eventEmitter: Spec.EventEmitter | undefined = undefined;
  private cleanUpCallbacks: (() => void)[] = [];

  aboutToAppear(): void {
    this.eventEmitter = new Spec.EventEmitter(this.ctx.rnInstance, this.tag);

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
      const wasVisible = this.isVisible;
      this.isVisible = rawProps.visible ?? false;
      if (wasVisible && !this.isVisible) {
        const payload: Record<string, Object> = {};
        this.eventEmitter?.emit('exitAction', payload);
      }
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
      }
      .width('100%')
      .height('100%')
    }
  }
}
