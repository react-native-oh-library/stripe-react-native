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
 * CardForm — Fabric 完整卡表单组件（卡号/有效期/CVC/邮编复合表单，P1）。
 *
 * 行为规格对齐 Android CardFormView：onFormComplete 在卡片信息完整时发射，
 * onFocusChange 上报聚焦字段；Commands：focus / blur。
 * 卡数据同步 CardFieldRegistry（与 CardField 同型，供 createPaymentMethod 使用）。
 */

import hilog from '@ohos.hilog';
import { RNOHContext, RNViewBase } from '@rnoh/react-native-openharmony';
import { CardForm as Spec } from '../generated/components/CardForm';
import { CardBrandDetector } from '../card/CardBrand';
import { CardFieldRegistry, CardFieldSnapshot, CardValidator } from '../card/CardValidator';
import { StripeModels, BridgeRecord } from '../api/StripeModels';

/** codegen 契约的 focusChange 字面量联合（generated/components/CardForm.ts） */
type CardFormFocusField = 'CardNumber' | 'Cvc' | 'ExpiryDate' | 'PostalCode';

@Component
export struct CardForm {
  public static readonly NAME = Spec.NAME;
  public ctx!: RNOHContext;
  public tag: number = 0;

  @State private cardNumber: string = '';
  @State private expiry: string = '';
  @State private cvc: string = '';
  @State private postalCode: string = '';
  @State private autofocus: boolean = false;
  @State private isDisabled: boolean = false;
  @State private dangerouslyGetFullCardDetails: boolean = false;
  @State private postalCodeEnabled: boolean = true;
  @State private fieldBackgroundColor: string = '#F6F8FA';
  @State private fieldBorderColor: string = '#DDE2E8';
  @State private fieldBorderWidth: number = 1;
  @State private fieldBorderRadius: number = 8;
  @State private textColor: string = '#1A1A1A';
  @State private fontSize: number = 15;
  @State private placeholderColor: string = '#9CA3AF';
  @State private cursorColor: string = '#635BFF';
  @State private labelColor: string = '#6A6A6A';
  @State private placeholderNumber: string = '1234 1234 1234 1234';
  @State private placeholderExpiration: string = 'MM/YY';
  @State private placeholderCvc: string = 'CVC';
  @State private placeholderPostalCode: string = 'ZIP';

  private eventEmitter: Spec.EventEmitter | undefined = undefined;
  private cleanUpCallbacks: (() => void)[] = [];
  private numberInputController: TextInputController = new TextInputController();

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

    this.cleanUpCallbacks.push(
      new Spec.CommandReceiver(this.ctx.componentCommandReceiver, this.tag).subscribe('focus', () => {
        // TextInputController 无 focus 方法，经 FocusControl 按 id 聚焦
        try {
          this.getUIContext().getFocusController().requestFocus(`stripe_cardform_number_${this.tag}`);
        } catch (err) {
          hilog.warn(0x0000, 'StripeSdk', 'CardForm requestFocus failed: %{public}s', `${err}`);
        }
      })
    );
    this.cleanUpCallbacks.push(
      new Spec.CommandReceiver(this.ctx.componentCommandReceiver, this.tag).subscribe('blur', () => {
        this.emitFocusChange(null);
      })
    );
  }

  aboutToDisappear(): void {
    for (const cb of this.cleanUpCallbacks) {
      cb();
    }
  }

  private applyDescriptor(descriptor: Spec.Descriptor): void {
    const rawProps = descriptor.rawProps as Spec.DirectRawProps;
    if (rawProps) {
      this.autofocus = rawProps.autofocus ?? false;
      this.isDisabled = rawProps.disabled ?? false;
      this.dangerouslyGetFullCardDetails = rawProps.dangerouslyGetFullCardDetails ?? false;
      this.postalCodeEnabled = rawProps.postalCodeEnabled ?? true;
      this.applyCardStyle(rawProps.cardStyle as Object);
      this.applyPlaceholders(rawProps.placeholders as Object);
    }
  }

  private applyCardStyle(style: Object): void {
    const styleRecord = StripeModels.asRecord(style);
    if (styleRecord === null) {
      return;
    }
    const bg = StripeModels.str(styleRecord, 'backgroundColor');
    if (bg.length > 0) {
      this.fieldBackgroundColor = bg;
    }
    const bc = StripeModels.str(styleRecord, 'borderColor');
    if (bc.length > 0) {
      this.fieldBorderColor = bc;
    }
    const tc = StripeModels.str(styleRecord, 'textColor');
    if (tc.length > 0) {
      this.textColor = tc;
    }
    const pc = StripeModels.str(styleRecord, 'placeholderColor');
    if (pc.length > 0) {
      this.placeholderColor = pc;
    }
    const cc = StripeModels.str(styleRecord, 'cursorColor');
    if (cc.length > 0) {
      this.cursorColor = cc;
    }
    const br = StripeModels.num(styleRecord, 'borderRadius', -1);
    if (br >= 0) {
      this.fieldBorderRadius = br;
    }
    const fs = StripeModels.num(styleRecord, 'fontSize', -1);
    if (fs > 0) {
      this.fontSize = fs;
    }
  }

  private applyPlaceholders(placeholders: Object): void {
    const record = StripeModels.asRecord(placeholders);
    if (record === null) {
      return;
    }
    const number = StripeModels.str(record, 'number');
    if (number.length > 0) {
      this.placeholderNumber = number;
    }
    const expiration = StripeModels.str(record, 'expiration');
    if (expiration.length > 0) {
      this.placeholderExpiration = expiration;
    }
    const cvc = StripeModels.str(record, 'cvc');
    if (cvc.length > 0) {
      this.placeholderCvc = cvc;
    }
    const postal = StripeModels.str(record, 'postalCode');
    if (postal.length > 0) {
      this.placeholderPostalCode = postal;
    }
  }

  /** 编程式聚焦(auto-advance):对齐 stripe-android 子字段输满即自动前进的原生行为 */
  private focusInput(key: string): void {
    try {
      this.getUIContext().getFocusController().requestFocus(key);
    } catch (e) {
      hilog.debug(0, 'StripeCardForm', 'requestFocus %{public}s unavailable', key);
    }
  }

  private emitFocusChange(field: CardFormFocusField | null): void {
    if (field === null) {
      this.eventEmitter?.emit('focusChange', { focusedField: undefined });
    } else {
      this.eventEmitter?.emit('focusChange', { focusedField: field });
    }
  }

  private publishFormChange(): void {
    const brand = CardBrandDetector.detect(this.cardNumber);
    const digits = this.cardNumber.replace(new RegExp('[^0-9]', 'g'), '');
    const parsed = CardValidator.parseExpiry(this.expiry);
    const validNumber = CardValidator.validateNumber(brand, digits);
    const validCvc = CardValidator.validateCvc(brand, this.cvc);
    const validExpiry = CardValidator.validateExpiry(parsed.month, parsed.year);
    const complete = validNumber === 'Valid' && validCvc === 'Valid' && validExpiry === 'Valid';

    const card: BridgeRecord = {
      'last4': digits.length >= 4 ? digits.substring(digits.length - 4) : digits,
      'expiryMonth': parsed.month,
      'expiryYear': parsed.year,
      // JS 层 CardFormView.Details.brand 为字符串联合（types/Token.ts CardBrand）
      'brand': brand.code,
      'complete': complete,
      'validExpiryDate': validExpiry,
      'validCVC': validCvc,
      'validNumber': validNumber,
      'postalCode': this.postalCode,
    };
    if (this.dangerouslyGetFullCardDetails) {
      card['number'] = digits;
      card['cvc'] = this.cvc;
    }
    this.eventEmitter?.emit('formComplete', { card: card });

    const snapshot = new CardFieldSnapshot();
    snapshot.number = digits;
    snapshot.cvc = this.cvc;
    snapshot.expiryMonth = parsed.month;
    snapshot.expiryYear = parsed.year;
    snapshot.postalCode = this.postalCode;
    CardFieldRegistry.shared.update(snapshot);
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      Column() {
        // 卡号
        Column() {
          Text('卡号')
            .fontSize(12)
            .fontColor(this.labelColor)
            .width('100%')
            .margin({ bottom: 4 })
          TextInput({ text: this.cardNumber, placeholder: this.placeholderNumber, controller: this.numberInputController })
            .type(InputType.Normal)
            .inputFilter('[0-9 ]')
            .maxLength(23)
            .fontSize(this.fontSize)
            .fontColor(this.textColor)
            .placeholderColor(this.placeholderColor)
            .caretColor(this.cursorColor)
            .height(44)
            .width('100%')
            .padding({ left: 12, right: 12 })
            .borderRadius(this.fieldBorderRadius)
            .backgroundColor(this.fieldBackgroundColor)
            .border({ width: this.fieldBorderWidth, color: this.fieldBorderColor })
            .enabled(!this.isDisabled)
            .defaultFocus(this.autofocus)
            .id(`stripe_cardform_number_${this.tag}`)
            .onFocus(() => {
              this.emitFocusChange('CardNumber');
            })
            .onBlur(() => {
              this.emitFocusChange(null);
            })
            .onChange((value: string) => {
              const brand = CardBrandDetector.detect(value);
              this.cardNumber = CardValidator.formatNumber(brand, value);
              this.publishFormChange();
              // 对齐 stripe-android:卡号有效(长度+Luhn)即自动前进到有效期,
              // 避免继续输入落进 19 位死胡同(Form-01 实测 4242x16 有效后仍可输到 19 位卡死)
              if (CardValidator.validateNumber(brand, this.cardNumber) === 'Valid') {
                this.focusInput(`stripe_cardform_expiry_${this.tag}`);
              }
            })
        }
        .width('100%')
        .margin({ bottom: 10 })

        // 有效期
        Column() {
          Text('有效期')
            .fontSize(12)
            .fontColor(this.labelColor)
            .width('100%')
            .margin({ bottom: 4 })
          TextInput({ text: this.expiry, placeholder: this.placeholderExpiration })
            .id(`stripe_cardform_expiry_${this.tag}`)
            .type(InputType.Normal)
            .inputFilter('[0-9/]')
            .maxLength(5)
            .fontSize(this.fontSize)
            .fontColor(this.textColor)
            .placeholderColor(this.placeholderColor)
            .caretColor(this.cursorColor)
            .height(44)
            .width('100%')
            .padding({ left: 12, right: 12 })
            .borderRadius(this.fieldBorderRadius)
            .backgroundColor(this.fieldBackgroundColor)
            .border({ width: this.fieldBorderWidth, color: this.fieldBorderColor })
            .enabled(!this.isDisabled)
            .onFocus(() => {
              this.emitFocusChange('ExpiryDate');
            })
            .onBlur(() => {
              this.emitFocusChange(null);
            })
            .onChange((value: string) => {
              this.expiry = CardValidator.formatExpiry(value);
              this.publishFormChange();
              // 有效期输满且合法 → 自动前进到 CVC(对齐 stripe-android)
              const parsed = CardValidator.parseExpiry(this.expiry);
              if (CardValidator.validateExpiry(parsed.month, parsed.year) === 'Valid') {
                this.focusInput(`stripe_cardform_cvc_${this.tag}`);
              }
            })
        }
        .width('100%')
        .margin({ bottom: 10 })

        // CVC
        Column() {
          Text('CVC')
            .fontSize(12)
            .fontColor(this.labelColor)
            .width('100%')
            .margin({ bottom: 4 })
          TextInput({ text: this.cvc, placeholder: this.placeholderCvc })
            .id(`stripe_cardform_cvc_${this.tag}`)
            .type(InputType.Normal)
            .inputFilter('[0-9]')
            .maxLength(4)
            .fontSize(this.fontSize)
            .fontColor(this.textColor)
            .placeholderColor(this.placeholderColor)
            .caretColor(this.cursorColor)
            .height(44)
            .width('100%')
            .padding({ left: 12, right: 12 })
            .borderRadius(this.fieldBorderRadius)
            .backgroundColor(this.fieldBackgroundColor)
            .border({ width: this.fieldBorderWidth, color: this.fieldBorderColor })
            .enabled(!this.isDisabled)
            .onFocus(() => {
              this.emitFocusChange('Cvc');
            })
            .onBlur(() => {
              this.emitFocusChange(null);
            })
            .onChange((value: string) => {
              this.cvc = value.replace(new RegExp('[^0-9]', 'g'), '');
              this.publishFormChange();
              // CVC 达到品牌位数(Amex 4/其余 3)→ 自动前进到邮编(对齐 stripe-android)
              const brand = CardBrandDetector.detect(this.cardNumber);
              if (this.postalCodeEnabled && this.cvc.length >= brand.cvcLength) {
                this.focusInput(`stripe_cardform_postal_${this.tag}`);
              }
            })
        }
        .width('100%')
        .margin({ bottom: 10 })

        // 邮编
        if (this.postalCodeEnabled) {
          Column() {
            Text('邮编')
              .fontSize(12)
              .fontColor(this.labelColor)
              .width('100%')
              .margin({ bottom: 4 })
            TextInput({ text: this.postalCode, placeholder: this.placeholderPostalCode })
              .id(`stripe_cardform_postal_${this.tag}`)
              .type(InputType.Normal)
              .maxLength(10)
              .fontSize(this.fontSize)
              .fontColor(this.textColor)
              .placeholderColor(this.placeholderColor)
              .caretColor(this.cursorColor)
              .height(44)
              .width('100%')
              .padding({ left: 12, right: 12 })
              .borderRadius(this.fieldBorderRadius)
              .backgroundColor(this.fieldBackgroundColor)
              .border({ width: this.fieldBorderWidth, color: this.fieldBorderColor })
              .enabled(!this.isDisabled)
              .onFocus(() => {
                this.emitFocusChange('PostalCode');
              })
              .onBlur(() => {
                this.emitFocusChange(null);
              })
              .onChange((value: string) => {
                this.postalCode = value;
                this.publishFormChange();
              })
          }
          .width('100%')
        }
      }
      .width('100%')
    }
  }
}
