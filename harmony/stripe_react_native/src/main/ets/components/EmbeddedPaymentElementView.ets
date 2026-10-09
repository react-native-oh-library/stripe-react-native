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
