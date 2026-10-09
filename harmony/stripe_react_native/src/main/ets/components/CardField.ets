/**
 * CardField — Fabric 卡号输入组件（ArkTS 叶子组件）。
 *
 * 安全模型（对照 02-planning 决策「卡号输入安全」）：
 * - TextInput 使用 Normal 类型 + inputFilter 数字过滤（Password 模式会触发系统
 *   密码保险箱自动保存/填充，已查证 TextInput.md:1670,1691，卡号场景禁用）
 * - 卡号仅存在于 ArkTS 内存与 HTTPS 直传 Stripe，每次变更同步到
 *   CardFieldRegistry（原生侧持有，不经业务服务器，与 Android 端同型）
 * - dangerouslyGetFullCardDetails=false 时 onCardChange 不回传完整卡号/CVC
 *
 * 事件发射名遵循 codegen 契约（去 on 前缀）：onCardChange → 'cardChange'。
 */

import hilog from '@ohos.hilog';
import { RNOHContext, RNViewBase } from '@rnoh/react-native-openharmony';
import { CardField as Spec } from '../generated/components/CardField';
import { CardBrandDetector } from '../card/CardBrand';
import { CardFieldRegistry, CardFieldSnapshot, CardValidator } from '../card/CardValidator';
import { StripeModels, BridgeRecord } from '../api/StripeModels';

@Component
export struct CardField {
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
  @State private textErrorColor: string = '#DF1B41';
  @State private placeholderNumber: string = '1234 1234 1234 1234';
  @State private placeholderExpiration: string = 'MM/YY';
  @State private placeholderCvc: string = 'CVC';
  @State private placeholderPostalCode: string = 'ZIP';

  private eventEmitter: Spec.EventEmitter | undefined = undefined;
  private cleanUpCallbacks: (() => void)[] = [];
  private numberInputController: TextInputController = new TextInputController();

  aboutToAppear(): void {
    this.eventEmitter = new Spec.EventEmitter(this.ctx.rnInstance, this.tag);

    this.cleanUpCallbacks.push(
      this.ctx.descriptorRegistry.subscribeToDescriptorChanges(
        this.tag,
        (descriptor) => {
          const rawProps = (descriptor as Spec.Descriptor).rawProps as Spec.DirectRawProps;
          if (rawProps) {
            this.autofocus = rawProps.autofocus ?? false;
            this.isDisabled = rawProps.disabled ?? false;
            this.dangerouslyGetFullCardDetails = rawProps.dangerouslyGetFullCardDetails ?? false;
            this.postalCodeEnabled = rawProps.postalCodeEnabled ?? true;
            this.applyCardStyle(rawProps.cardStyle as Object);
            this.applyPlaceholders(rawProps.placeholders as Object);
          }
        }
      )
    );

    this.cleanUpCallbacks.push(
      new Spec.CommandReceiver(this.ctx.componentCommandReceiver, this.tag).subscribe('focus', () => {
        // TextInputController 无 focus 方法，经 FocusControl 按 id 聚焦
        try {
          this.getUIContext().getFocusController().requestFocus(`stripe_cardfield_number_${this.tag}`);
        } catch (err) {
          hilog.warn(0x0000, 'StripeSdk', 'CardField requestFocus failed: %{public}s', JSON.stringify(err));
        }
      })
    );
    this.cleanUpCallbacks.push(
      new Spec.CommandReceiver(this.ctx.componentCommandReceiver, this.tag).subscribe('blur', () => {
        this.emitFocusChange(null);
      })
    );
    this.cleanUpCallbacks.push(
      new Spec.CommandReceiver(this.ctx.componentCommandReceiver, this.tag).subscribe('clear', () => {
        this.clearAll();
      })
    );
  }

  aboutToDisappear(): void {
    CardFieldRegistry.shared.clear();
    for (const cb of this.cleanUpCallbacks) {
      cb();
    }
  }

  private applyCardStyle(style: Object): void {
    const record = StripeModels.asRecord(style);
    if (record === null) {
      return;
    }
    const bg = StripeModels.str(record, 'backgroundColor');
    if (bg.length > 0) {
      this.fieldBackgroundColor = bg;
    }
    const bc = StripeModels.str(record, 'borderColor');
    if (bc.length > 0) {
      this.fieldBorderColor = bc;
    }
    const tc = StripeModels.str(record, 'textColor');
    if (tc.length > 0) {
      this.textColor = tc;
    }
    const pc = StripeModels.str(record, 'placeholderColor');
    if (pc.length > 0) {
      this.placeholderColor = pc;
    }
    const cc = StripeModels.str(record, 'cursorColor');
    if (cc.length > 0) {
      this.cursorColor = cc;
    }
    const ec = StripeModels.str(record, 'textErrorColor');
    if (ec.length > 0) {
      this.textErrorColor = ec;
    }
    const bw = StripeModels.num(record, 'borderWidth', -1);
    if (bw >= 0) {
      this.fieldBorderWidth = bw;
    }
    const br = StripeModels.num(record, 'borderRadius', -1);
    if (br >= 0) {
      this.fieldBorderRadius = br;
    }
    const fs = StripeModels.num(record, 'fontSize', -1);
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

  private clearAll(): void {
    this.cardNumber = '';
    this.expiry = '';
    this.cvc = '';
    this.postalCode = '';
    this.publishCardChange();
  }

  private emitFocusChange(field: string | null): void {
    this.eventEmitter?.emit('focusChange', { focusedField: field === null ? '' : field });
  }

  private publishCardChange(): void {
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
      // JS 层 CardFieldInput.Details.brand 为字符串联合（types/Token.ts CardBrand）
      'brand': brand.code,
      'complete': complete,
      'validExpiryDate': validExpiry,
      'validCVC': validCvc,
      'validNumber': validNumber,
    };
    if (this.postalCodeEnabled) {
      card['postalCode'] = this.postalCode;
    }
    if (this.dangerouslyGetFullCardDetails) {
      card['number'] = digits;
      card['cvc'] = this.cvc;
    }
    this.eventEmitter?.emit('cardChange', { card: card });

    // 同步到原生侧注册表（createPaymentMethod 无 token 时从这里取卡数据）
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
        // 卡号行
        Row() {
          TextInput({ text: this.cardNumber, placeholder: this.placeholderNumber, controller: this.numberInputController })
            .type(InputType.Normal)
            .inputFilter('[0-9 ]')
            .maxLength(23)
            .fontSize(this.fontSize)
            .fontColor(this.textColor)
            .placeholderColor(this.placeholderColor)
            .caretColor(this.cursorColor)
            .backgroundColor(Color.Transparent)
            .border({ width: 0 })
            .padding(0)
            .layoutWeight(1)
            .enabled(!this.isDisabled)
            .defaultFocus(this.autofocus)
            .id(`stripe_cardfield_number_${this.tag}`)
            .onFocus(() => {
              this.emitFocusChange('CardNumber');
            })
            .onBlur(() => {
              this.emitFocusChange(null);
            })
            .onChange((value: string) => {
              this.cardNumber = CardValidator.formatNumber(CardBrandDetector.detect(value), value);
              this.publishCardChange();
            })
        }
        .width('100%')
        .height(44)
        .padding({ left: 12, right: 12 })
        .borderRadius(this.fieldBorderRadius)
        .backgroundColor(this.fieldBackgroundColor)
        .border({ width: this.fieldBorderWidth, color: this.fieldBorderColor })

        // 有效期 / CVC / 邮编行
        Row() {
          TextInput({ text: this.expiry, placeholder: this.placeholderExpiration })
            .type(InputType.Normal)
            .inputFilter('[0-9/]')
            .maxLength(5)
            .fontSize(this.fontSize)
            .fontColor(this.textColor)
            .placeholderColor(this.placeholderColor)
            .caretColor(this.cursorColor)
            .backgroundColor(Color.Transparent)
            .border({ width: 0 })
            .padding(0)
            .width(72)
            .enabled(!this.isDisabled)
            .onFocus(() => {
              this.emitFocusChange('ExpiryDate');
            })
            .onBlur(() => {
              this.emitFocusChange(null);
            })
            .onChange((value: string) => {
              this.expiry = CardValidator.formatExpiry(value);
              this.publishCardChange();
            })

          TextInput({ text: this.cvc, placeholder: this.placeholderCvc })
            .type(InputType.Normal)
            .inputFilter('[0-9]')
            .maxLength(4)
            .fontSize(this.fontSize)
            .fontColor(this.textColor)
            .placeholderColor(this.placeholderColor)
            .caretColor(this.cursorColor)
            .backgroundColor(Color.Transparent)
            .border({ width: 0 })
            .padding(0)
            .width(64)
            .margin({ left: 12 })
            .enabled(!this.isDisabled)
            .onFocus(() => {
              this.emitFocusChange('Cvc');
            })
            .onBlur(() => {
              this.emitFocusChange(null);
            })
            .onChange((value: string) => {
              this.cvc = value.replace(new RegExp('[^0-9]', 'g'), '');
              this.publishCardChange();
            })

          if (this.postalCodeEnabled) {
            TextInput({ text: this.postalCode, placeholder: this.placeholderPostalCode })
              .type(InputType.Normal)
              .maxLength(10)
              .fontSize(this.fontSize)
              .fontColor(this.textColor)
              .placeholderColor(this.placeholderColor)
              .caretColor(this.cursorColor)
              .backgroundColor(Color.Transparent)
              .border({ width: 0 })
              .padding(0)
              .layoutWeight(1)
              .margin({ left: 12 })
              .enabled(!this.isDisabled)
              .onFocus(() => {
                this.emitFocusChange('PostalCode');
              })
              .onBlur(() => {
                this.emitFocusChange(null);
              })
              .onChange((value: string) => {
                this.postalCode = value;
                this.publishCardChange();
              })
          } else {
            Blank()
              .layoutWeight(1)
          }
        }
        .width('100%')
        .height(44)
        .padding({ left: 12, right: 12 })
        .margin({ top: 8 })
        .borderRadius(this.fieldBorderRadius)
        .backgroundColor(this.fieldBackgroundColor)
        .border({ width: this.fieldBorderWidth, color: this.fieldBorderColor })
      }
      .width('100%')
    }
  }
}
