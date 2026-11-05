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
 * PaymentSheetPage — ArkUI 自绘支付页（P1 范围：卡支付 + 金额展示 + customFlow）。
 *
 * 视觉规格对齐 Stripe 官方设计 token（圆角/主色 #635BFF/字体层级）；
 * 卡输入复用 card/ 模块（TextInput Normal + inputFilter，规避密码保险箱）。
 * REST 创建/确认/3DS 由 PaymentSheetFlowHandler（TurboModule 层）完成。
 */

import { PaymentSheetConfig, PaymentSheetFlowHandler } from './SheetController';
import { CardFieldSnapshot, CardValidator } from '../card/CardValidator';
import { CardBrandDetector, CardBrandRule } from '../card/CardBrand';

@Component
export struct PaymentSheetPage {
  config: PaymentSheetConfig | null = null;
  flowHandler: PaymentSheetFlowHandler | null = null;
  onFinished: (result: Record<string, Object>) => void = (result: Record<string, Object>) => {
  };
  /** 弹窗内容自关闭通道：由 Presenter 注入 controller.close()。
   * 2026-11-04 实测：TurboModule 侧微任务里 controller.close() 静默失效（sheet 卡屏），
   *  官方 openCustomDialogWithController 示例的模式是内容内部经 controller 关闭，改走此通道。 */
  closeDialog: () => void = () => {
  };

  @State private amountText: string = '';
  @State private merchantName: string = '';
  @State private cardNumber: string = '';
  @State private expiry: string = '';
  @State private cvc: string = '';
  @State private postalCode: string = '';
  @State private postalEnabled: boolean = true;
  @State private isWorking: boolean = false;
  @State private errorText: string = '';
  @State private awaitingMerchant: boolean = false;
  private numberController: TextInputController = new TextInputController();

  aboutToAppear(): void {
    this.merchantName = this.config?.merchantDisplayName ?? '';
    this.postalEnabled = true;
    this.amountText = this.config?.displayAmount ?? '';
  }

  aboutToDisappear(): void {
    // noop：无订阅资源
  }

  private currentBrand(): CardBrandRule {
    return CardBrandDetector.detect(this.cardNumber);
  }

  /** 编程式聚焦(auto-advance):对齐 stripe-android 子字段输满即自动前进的原生行为 */
  private focusInput(key: string): void {
    try {
      this.getUIContext().getFocusController().requestFocus(key);
    } catch (e) {
      // 目标节点未挂载时抛错,安全忽略(收银台单实例,静态 id)
    }
  }

  private isCardComplete(): boolean {
    const brand = this.currentBrand();
    const digits = this.cardNumber.replace(new RegExp('[^0-9]', 'g'), '');
    const parsed = CardValidator.parseExpiry(this.expiry);
    return CardBrandDetector.isCardNumberLengthValid(brand, digits.length)
      && CardValidator.isValidLuhn(digits)
      && CardValidator.validateExpiry(parsed.month, parsed.year) === 'Valid'
      && CardValidator.validateCvc(brand, this.cvc) === 'Valid';
  }

  /** 主按钮文案：未配置时回退「支付」。原生 str() 对未传字段存 ''，'' ?? 兜不住，会渲染成空按钮 */
  private payButtonLabel(): string {
    if (this.awaitingMerchant) {
      return '等待商户确认…';
    }
    const label = this.config?.primaryButtonLabel ?? '';
    return label.length > 0 ? label : '支付';
  }

  private buildSnapshot(): CardFieldSnapshot {
    const snapshot = new CardFieldSnapshot();
    snapshot.number = this.cardNumber.replace(new RegExp('[^0-9]', 'g'), '');
    snapshot.cvc = this.cvc;
    const parsed = CardValidator.parseExpiry(this.expiry);
    snapshot.expiryMonth = parsed.month;
    snapshot.expiryYear = parsed.year;
    snapshot.postalCode = this.postalCode;
    return snapshot;
  }

  private async onPayPressed(): Promise<void> {
    if (this.isWorking || this.config === null || this.flowHandler === null) {
      return;
    }
    if (!this.isCardComplete()) {
      this.errorText = '卡片信息不完整或无效，请检查后重试';
      return;
    }
    this.isWorking = true;
    this.errorText = '';
    this.awaitingMerchant = false;
    try {
      const config = this.config;
      const handler = this.flowHandler;
      const result = this.config.customFlow
        ? await handler.startCustomFlow(this.buildSnapshot(), config)
        : await handler.confirmDefaultFlow(this.buildSnapshot(), config);
      // customFlow：startCustomFlow 在等待 JS 确认期间 resolve（sheet 保持打开）
      const waitForMerchant = result['awaitingMerchant'];
      if (waitForMerchant === true) {
        this.awaitingMerchant = true;
        this.isWorking = false;
        return;
      }
      this.isWorking = false;
      this.onFinished(result);
      this.closeDialog();
    } catch (err) {
      this.isWorking = false;
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      this.errorText = message;
    }
  }

  build() {
    Column() {
      // 拖拽指示条
      Divider()
        .width(36)
        .height(4)
        .color('#E0E0E0')
        .borderRadius(2)
        .margin({ top: 8 })

      // 商户与金额
      Column() {
        Text(this.merchantName.length > 0 ? this.merchantName : '支付')
          .fontSize(16)
          .fontColor('#6A6A6A')
        if (this.amountText.length > 0) {
          Text(this.amountText)
            .fontSize(28)
            .fontWeight(FontWeight.Bold)
            .fontColor('#1A1A1A')
            .margin({ top: 4 })
        }
      }
      .width('100%')
      .alignItems(HorizontalAlign.Center)
      .margin({ top: 16, bottom: 8 })

      Scroll() {
        Column() {
          // 卡号
          Text('卡号')
            .fontSize(13)
            .fontColor('#6A6A6A')
            .width('100%')
            .margin({ bottom: 4 })
          TextInput({ text: this.cardNumber, placeholder: '1234 1234 1234 1234', controller: this.numberController })
            .id('stripe_sheet_number')
            .type(InputType.Normal)
            .inputFilter('[0-9 ]')
            .maxLength(23)
            .fontSize(16)
            .height(48)
            .borderRadius(8)
            .backgroundColor('#F6F6F6')
            .enabled(!this.isWorking)
            .onChange((value: string) => {
              const brand = this.currentBrand();
              this.cardNumber = CardValidator.formatNumber(brand, value);
              // 卡号有效(长度+Luhn)即自动前进到有效期(对齐 stripe-android 收银台行为)
              if (CardValidator.validateNumber(brand, this.cardNumber) === 'Valid') {
                this.focusInput('stripe_sheet_expiry');
              }
            })

          // 有效期 + CVC
          Row() {
            Column() {
              Text('有效期')
                .fontSize(13)
                .fontColor('#6A6A6A')
                .margin({ bottom: 4 })
              TextInput({ text: this.expiry, placeholder: 'MM/YY' })
                .id('stripe_sheet_expiry')
                .type(InputType.Normal)
                .inputFilter('[0-9/]')
                .maxLength(5)
                .fontSize(16)
                .height(48)
                .borderRadius(8)
                .backgroundColor('#F6F6F6')
                .enabled(!this.isWorking)
                .onChange((value: string) => {
                  this.expiry = CardValidator.formatExpiry(value);
                  const parsed = CardValidator.parseExpiry(this.expiry);
                  if (CardValidator.validateExpiry(parsed.month, parsed.year) === 'Valid') {
                    this.focusInput('stripe_sheet_cvc');
                  }
                })
            }
            .layoutWeight(1)

            Column() {
              Text('CVC')
                .fontSize(13)
                .fontColor('#6A6A6A')
                .margin({ bottom: 4 })
              TextInput({ text: this.cvc, placeholder: 'CVC' })
                .id('stripe_sheet_cvc')
                .type(InputType.Normal)
                .inputFilter('[0-9]')
                .maxLength(4)
                .fontSize(16)
                .height(48)
                .borderRadius(8)
                .backgroundColor('#F6F6F6')
                .enabled(!this.isWorking)
                .onChange((value: string) => {
                  this.cvc = value.replace(new RegExp('[^0-9]', 'g'), '');
                  const brand = this.currentBrand();
                  if (this.postalEnabled && this.cvc.length >= brand.cvcLength) {
                    this.focusInput('stripe_sheet_postal');
                  }
                })
            }
            .layoutWeight(1)
            .margin({ left: 12 })
          }
          .width('100%')
          .margin({ top: 12 })

          // 邮编
          if (this.postalEnabled) {
            Column() {
              Text('邮编')
                .fontSize(13)
                .fontColor('#6A6A6A')
                .margin({ bottom: 4 })
              TextInput({ text: this.postalCode, placeholder: '邮编' })
                .id('stripe_sheet_postal')
                .type(InputType.Normal)
                .maxLength(10)
                .fontSize(16)
                .height(48)
                .borderRadius(8)
                .backgroundColor('#F6F6F6')
                .enabled(!this.isWorking)
                .onChange((value: string) => {
                  this.postalCode = value;
                })
            }
            .width('100%')
            .margin({ top: 12 })
          }

          if (this.errorText.length > 0) {
            Text(this.errorText)
              .fontSize(13)
              .fontColor('#DF1B41')
              .width('100%')
              .margin({ top: 12 })
          }
        }
        .width('100%')
        .padding({ left: 16, right: 16 })
      }
      .layoutWeight(1)
      .align(Alignment.Top)
      .scrollBar(BarState.Off)

      // 支付按钮
      Button(this.payButtonLabel())
        .width('100%')
        .height(48)
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor(Color.White)
        .backgroundColor('#635BFF')
        .borderRadius(8)
        .enabled(!this.isWorking && !this.awaitingMerchant && this.isCardComplete())
        .opacity(this.isWorking || this.awaitingMerchant || !this.isCardComplete() ? 0.5 : 1)
        .margin({ left: 16, right: 16, bottom: 16, top: 8 })
        .onClick(() => {
          this.onPayPressed();
        })

      // 关闭（取消）
      Button('取消')
        .width('100%')
        .height(36)
        .fontSize(14)
        .fontColor('#6A6A6A')
        .backgroundColor(Color.Transparent)
        .enabled(!this.isWorking)
        .margin({ left: 16, right: 16, bottom: 12 })
        .onClick(() => {
          // 对齐 Android：用户取消 → { didCancel: true }（无 error）；随后内容内部自关闭
          this.onFinished({ 'canceled': true });
          this.closeDialog();
        })
    }
    .width('100%')
    .height('94%')
    .backgroundColor('#FFFFFF')
    .borderRadius({ topLeft: 16, topRight: 16 })
    .alignItems(HorizontalAlign.Center)
  }
}
