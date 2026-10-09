/**
 * AddressSheetView — Fabric 地址表单组件（P1）。
 *
 * visible 属性控制表单显隐（对齐 iOS STPAddressSheet / Android AddressLauncher 语义）；
 * 提交完整地址后发射 'submitAction'（payload.result 为 AddressDetails），
 * 校验失败/取消发射 'errorAction'（payload.error 为 StripeError）。
 */

import { RNOHContext, RNViewBase } from '@rnoh/react-native-openharmony';
import { AddressSheetView as Spec } from '../generated/components/AddressSheetView';
import { StripeModels, BridgeRecord } from '../api/StripeModels';

/** codegen 契约的 submitAction/errorAction 载荷（generated/components/AddressSheetView.ts） */
interface AddressSubmitPayload {
  result: Object;
}

interface AddressErrorPayload {
  error: Object;
}

@Component
export struct AddressSheetView {
  public static readonly NAME = Spec.NAME;
  public ctx!: RNOHContext;
  public tag: number = 0;

  @State private isVisible: boolean = false;
  @State private sheetTitle: string = '地址';
  @State private primaryButtonTitle: string = '保存地址';
  @State private nameInput: string = '';
  @State private line1Input: string = '';
  @State private line2Input: string = '';
  @State private cityInput: string = '';
  @State private stateInput: string = '';
  @State private postalCodeInput: string = '';
  @State private countryInput: string = '';
  @State private phoneInput: string = '';
  @State private errorText: string = '';

  private eventEmitter: Spec.EventEmitter | undefined = undefined;
  private cleanUpCallbacks: (() => void)[] = [];

  aboutToAppear(): void {
    this.eventEmitter = new Spec.EventEmitter(this.ctx.rnInstance, this.tag);

    this.cleanUpCallbacks.push(
      this.ctx.descriptorRegistry.subscribeToDescriptorChanges(
        this.tag,
        (descriptor) => {
          const rawProps = (descriptor as Spec.Descriptor).rawProps as Spec.DirectRawProps;
          if (rawProps) {
            this.isVisible = rawProps.visible ?? false;
            const title = rawProps.sheetTitle;
            if (title && title.length > 0) {
              this.sheetTitle = title;
            }
            const buttonTitle = rawProps.primaryButtonTitle;
            if (buttonTitle && buttonTitle.length > 0) {
              this.primaryButtonTitle = buttonTitle;
            }
            this.applyDefaultValues(rawProps.defaultValues as Object);
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

  private applyDefaultValues(defaults: Object): void {
    const record = StripeModels.asRecord(defaults);
    if (record === null) {
      return;
    }
    this.nameInput = StripeModels.str(record, 'name');
    this.phoneInput = StripeModels.str(record, 'phone');
    const address = StripeModels.asRecord(record['address']);
    if (address !== null) {
      this.line1Input = StripeModels.str(address, 'line1');
      this.line2Input = StripeModels.str(address, 'line2');
      this.cityInput = StripeModels.str(address, 'city');
      this.stateInput = StripeModels.str(address, 'state');
      this.postalCodeInput = StripeModels.str(address, 'postalCode');
      this.countryInput = StripeModels.str(address, 'country');
    }
  }

  private isFormComplete(): boolean {
    return this.nameInput.length > 0
      && this.line1Input.length > 0
      && this.cityInput.length > 0
      && this.postalCodeInput.length > 0
      && this.countryInput.length > 0;
  }

  private submit(): void {
    if (!this.isFormComplete()) {
      this.errorText = '请完整填写姓名、地址行 1、城市、邮编与国家/地区';
      const error: BridgeRecord = {
        'code': 'Failed',
        'message': this.errorText,
      };
      const errorPayload: AddressErrorPayload = { error: error };
      this.eventEmitter?.emit('errorAction', errorPayload);
      return;
    }
    const address: BridgeRecord = {
      'line1': this.line1Input,
      'line2': this.line2Input,
      'city': this.cityInput,
      'state': this.stateInput,
      'postalCode': this.postalCodeInput,
      'country': this.countryInput,
    };
    const result: BridgeRecord = {
      'name': this.nameInput,
      'phone': this.phoneInput,
      'address': address,
      'isCheckboxSelected': false,
    };
    const submitPayload: AddressSubmitPayload = { result: result };
    this.eventEmitter?.emit('submitAction', submitPayload);
    this.isVisible = false;
    this.errorText = '';
  }

  private cancel(): void {
    const error: BridgeRecord = {
      'code': 'Canceled',
      'message': 'Address sheet has been canceled',
    };
    const errorPayload: AddressErrorPayload = { error: error };
    this.eventEmitter?.emit('errorAction', errorPayload);
    this.isVisible = false;
    this.errorText = '';
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      if (this.isVisible) {
        Column() {
          Column() {
            Text(this.sheetTitle)
              .fontSize(17)
              .fontWeight(FontWeight.Medium)
              .fontColor('#1A1A1A')
              .width('100%')
              .textAlign(TextAlign.Center)
              .padding({ top: 16, bottom: 12 })

            Scroll() {
              Column() {
                AddressSheetInput({ label: '姓名', textValue: $nameInput })
                AddressSheetInput({ label: '地址行 1', textValue: $line1Input })
                AddressSheetInput({ label: '地址行 2（可选）', textValue: $line2Input })
                AddressSheetInput({ label: '城市', textValue: $cityInput })
                AddressSheetInput({ label: '州/省', textValue: $stateInput })
                AddressSheetInput({ label: '邮编', textValue: $postalCodeInput })
                AddressSheetInput({ label: '国家/地区（如 CN / US）', textValue: $countryInput })
                AddressSheetInput({ label: '电话（可选）', textValue: $phoneInput })

                if (this.errorText.length > 0) {
                  Text(this.errorText)
                    .fontSize(13)
                    .fontColor('#DF1B41')
                    .width('100%')
                    .margin({ top: 8 })
                }
              }
              .width('100%')
            }
            .layoutWeight(1)
            .scrollBar(BarState.Off)

            Button(this.primaryButtonTitle)
              .width('100%')
              .height(44)
              .fontSize(15)
              .fontColor(Color.White)
              .backgroundColor('#635BFF')
              .borderRadius(8)
              .margin({ top: 8 })
              .onClick(() => {
                this.submit();
              })

            Button('取消')
              .width('100%')
              .height(36)
              .fontSize(14)
              .fontColor('#6A6A6A')
              .backgroundColor(Color.Transparent)
              .margin({ bottom: 8 })
              .onClick(() => {
                this.cancel();
              })
          }
          .width('100%')
          .height('90%')
          .backgroundColor('#FFFFFF')
          .borderRadius({ topLeft: 16, topRight: 16 })
        }
        .width('100%')
        .height('100%')
        .backgroundColor('rgba(0,0,0,0.4)')
      }
    }
  }
}

/** 受控输入行（$textValue 双向同步宿主 @State，避免 @Builder 闭包参数） */
@Component
struct AddressSheetInput {
  label: string = '';
  @Link textValue: string;

  build() {
    Column() {
      Text(this.label)
        .fontSize(12)
        .fontColor('#6A6A6A')
        .width('100%')
        .margin({ bottom: 4 })
      TextInput({ text: this.textValue, placeholder: this.label })
        .type(InputType.Normal)
        .fontSize(15)
        .fontColor('#1A1A1A')
        .placeholderColor('#9CA3AF')
        .caretColor('#635BFF')
        .height(42)
        .width('100%')
        .padding({ left: 12, right: 12 })
        .borderRadius(8)
        .backgroundColor('#F6F6F6')
        .onChange((value: string) => {
          this.textValue = value;
        })
    }
    .width('100%')
    .padding({ left: 16, right: 16 })
    .margin({ bottom: 8 })
  }
}
