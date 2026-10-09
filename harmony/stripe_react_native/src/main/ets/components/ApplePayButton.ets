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
    this.cleanUpCallbacks.push(
      this.ctx.descriptorRegistry.subscribeToDescriptorChanges(
        this.tag,
        (descriptor) => {
          const rawProps = descriptor.rawProps as Spec.DirectRawProps;
          if (rawProps) {
            this.isDisabled = rawProps.disabled ?? false;
            this.cornerRadius = rawProps.buttonBorderRadius ?? 4;
          }
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
