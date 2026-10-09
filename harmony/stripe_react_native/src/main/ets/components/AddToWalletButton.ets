/**
 * AddToWalletButton — 鸿蒙降级占位组件（P3）。
 *
 * 鸿蒙 Wallet Kit walletPass 仅覆盖 Pass 卡券，无银行卡 Push Provisioning
 * （02-planning 已查证）。渲染占位按钮；点击后发射 'completeAction' 并携带
 * notSupported 结构化错误，保持 JS API 兼容。
 */

import { RNOHContext, RNViewBase } from '@rnoh/react-native-openharmony';
import { AddToWalletButton as Spec } from '../generated/components/AddToWalletButton';

@Component
export struct AddToWalletButton {
  public static readonly NAME = Spec.NAME;
  public ctx!: RNOHContext;
  public tag: number = 0;

  private eventEmitter: Spec.EventEmitter | undefined = undefined;
  private cleanUpCallbacks: (() => void)[] = [];

  aboutToAppear(): void {
    this.eventEmitter = new Spec.EventEmitter(this.ctx.rnInstance, this.tag);

    this.cleanUpCallbacks.push(
      this.ctx.descriptorRegistry.subscribeToDescriptorChanges(
        this.tag,
        (descriptor) => {
          // props（cardDetails/token/ephemeralKey 等）在本平台无可用钱包目标，仅保持订阅生命周期
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
        Text('加入钱包（该平台不支持）')
          .fontSize(14)
          .fontColor('#6A6A6A')
      }
      .width('100%')
      .height('100%')
      .borderRadius(8)
      .backgroundColor('#F6F6F6')
      .justifyContent(FlexAlign.Center)
      .onClick(() => {
        const error: Record<string, Object> = {
          'code': 'notSupported',
          'message': 'Add to wallet is not supported on HarmonyOS',
        };
        const payload: Record<string, Object> = { 'error': error };
        this.eventEmitter?.emit('completeAction', payload);
      })
    }
  }
}
