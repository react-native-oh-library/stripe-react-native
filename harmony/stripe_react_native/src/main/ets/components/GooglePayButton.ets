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
    this.cleanUpCallbacks.push(
      this.ctx.descriptorRegistry.subscribeToDescriptorChanges(
        this.tag,
        (descriptor) => {
          const rawProps = descriptor.rawProps as Spec.DirectRawProps;
          if (rawProps) {
            this.cornerRadius = rawProps.borderRadius ?? 4;
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
