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
 * NavigationBar — Stripe Connect 顶部导航栏组件。
 *
 * 对齐 Android NavigationBarManager：标题居左 + 关闭按钮，点击关闭发射
 * 'closeButtonPress'。
 */

import { RNOHContext, RNViewBase } from '@rnoh/react-native-openharmony';
import { NavigationBar as Spec } from '../generated/components/NavigationBar';

@Component
export struct NavigationBar {
  public static readonly NAME = Spec.NAME;
  public ctx!: RNOHContext;
  public tag: number = 0;

  @State private titleText: string = '';

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
      this.titleText = rawProps.title ?? '';
    }
  }

  aboutToDisappear(): void {
    for (const cb of this.cleanUpCallbacks) {
      cb();
    }
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      Row() {
        // 左侧占位与右侧 ✕ 区（16 边距 + 36 按钮）等宽，让标题真正居中
        // （对齐原库：Android Toolbar Gravity.CENTER、iOS UINavigationBar 系统标题居中）
        Row() {
        }.width(52)
        Text(this.titleText)
          .fontSize(17)
          .fontWeight(FontWeight.Medium)
          .fontColor('#1A1A1A')
          .layoutWeight(1)
          .textAlign(TextAlign.Center)
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
        // 固定尺寸 Button 的默认内边距会裁切字形（✕ 显示不全），改用 Text + padding 自适应
        Text('✕')
          .fontSize(18)
          .fontColor('#1A1A1A')
          .padding({ left: 10, right: 10, top: 6, bottom: 6 })
          .onClick(() => {
            const payload: Record<string, Object> = {};
            this.eventEmitter?.emit('closeButtonPress', payload);
          })
      }
      .width('100%')
      // 高度跟随 JS 侧 style（外层 44 / onboarding Modal 内 56）：固写 52 会在
      // 44 帧里把 ✕ 裁到帧边（显示不全）、在 56 帧里欠高留白
      .height('100%')
      // ✕ 右边距 16 对齐原库 Android CLOSE_BUTTON_MARGIN_END=16dp（此前 8 显得贴边）
      .padding({ left: 0, right: 16 })
      .backgroundColor('#FFFFFF')
    }
  }
}
