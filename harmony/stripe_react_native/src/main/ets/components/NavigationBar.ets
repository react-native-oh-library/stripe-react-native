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

    this.cleanUpCallbacks.push(
      this.ctx.descriptorRegistry.subscribeToDescriptorChanges(
        this.tag,
        (descriptor) => {
          const rawProps = descriptor.rawProps as Spec.DirectRawProps;
          if (rawProps) {
            this.titleText = rawProps.title ?? '';
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
      Row() {
        Text(this.titleText)
          .fontSize(17)
          .fontWeight(FontWeight.Medium)
          .fontColor('#1A1A1A')
          .layoutWeight(1)
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
        Button('✕')
          .fontSize(16)
          .fontColor('#1A1A1A')
          .backgroundColor(Color.Transparent)
          .height(36)
          .width(36)
          .onClick(() => {
            const payload: Record<string, Object> = {};
            this.eventEmitter?.emit('closeButtonPress', payload);
          })
      }
      .width('100%')
      .height(52)
      .padding({ left: 16, right: 8 })
      .backgroundColor('#FFFFFF')
    }
  }
}
