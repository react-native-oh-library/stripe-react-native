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

    this.cleanUpCallbacks.push(
      this.ctx.descriptorRegistry.subscribeToDescriptorChanges(
        this.tag,
        (descriptor) => {
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
