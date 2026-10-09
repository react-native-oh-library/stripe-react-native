/**
 * AuBECSDebitForm — 澳大利亚 BECS 借记表单（BSB/账号/姓名/邮箱，P2）。
 *
 * 对齐 STPAUBECSFormView 交互：四项填写完整后发射 'completeAction'，
 * payload = { accountNumber, bsbNumber, email, name }。
 */

import { RNOHContext, RNViewBase } from '@rnoh/react-native-openharmony';
import { AuBECSDebitForm as Spec } from '../generated/components/AuBECSDebitForm';

@Component
export struct AuBECSDebitForm {
  public static readonly NAME = Spec.NAME;
  public ctx!: RNOHContext;
  public tag: number = 0;

  @State private companyNameText: string = '';
  @State private nameInput: string = '';
  @State private emailInput: string = '';
  @State private bsbInput: string = '';
  @State private accountNumberInput: string = '';
  @State private textColorValue: string = '#1A1A1A';
  @State private backgroundColorValue: string = '#F6F8FA';
  @State private textSizeValue: number = 15;

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
            this.companyNameText = rawProps.companyName ?? '';
            if (rawProps.formStyle !== undefined) {
              const style = rawProps.formStyle as Record<string, Object>;
              const tc = style['textColor'];
              if (typeof tc === 'string') {
                this.textColorValue = tc;
              }
              const bg = style['backgroundColor'];
              if (typeof bg === 'string') {
                this.backgroundColorValue = bg;
              }
              const fs = style['fontSize'];
              if (typeof fs === 'number') {
                this.textSizeValue = fs;
              }
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

  private isComplete(): boolean {
    return this.nameInput.length > 0
      && this.emailInput.length > 0
      && this.bsbInput.length >= 6
      && this.accountNumberInput.length >= 4;
  }

  private publishIfComplete(): void {
    if (!this.isComplete()) {
      return;
    }
    this.eventEmitter?.emit('completeAction', {
      accountNumber: this.accountNumberInput,
      bsbNumber: this.bsbInput,
      email: this.emailInput,
      name: this.nameInput,
    });
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      Column() {
        if (this.companyNameText.length > 0) {
          Text(this.companyNameText)
            .fontSize(this.textSizeValue)
            .fontColor(this.textColorValue)
            .width('100%')
            .margin({ bottom: 8 })
        }
        TextInput({ text: this.nameInput, placeholder: '姓名' })
          .type(InputType.Normal)
          .fontSize(this.textSizeValue)
          .fontColor(this.textColorValue)
          .height(42)
          .width('100%')
          .padding({ left: 12, right: 12 })
          .borderRadius(8)
          .backgroundColor(this.backgroundColorValue)
          .margin({ bottom: 8 })
          .onChange((value: string) => {
            this.nameInput = value;
            this.publishIfComplete();
          })
        TextInput({ text: this.emailInput, placeholder: '邮箱' })
          .type(InputType.Normal)
          .fontSize(this.textSizeValue)
          .fontColor(this.textColorValue)
          .height(42)
          .width('100%')
          .padding({ left: 12, right: 12 })
          .borderRadius(8)
          .backgroundColor(this.backgroundColorValue)
          .margin({ bottom: 8 })
          .onChange((value: string) => {
            this.emailInput = value;
            this.publishIfComplete();
          })
        TextInput({ text: this.bsbInput, placeholder: 'BSB（6 位）' })
          .type(InputType.Normal)
          .inputFilter('[0-9]')
          .maxLength(6)
          .fontSize(this.textSizeValue)
          .fontColor(this.textColorValue)
          .height(42)
          .width('100%')
          .padding({ left: 12, right: 12 })
          .borderRadius(8)
          .backgroundColor(this.backgroundColorValue)
          .margin({ bottom: 8 })
          .onChange((value: string) => {
            this.bsbInput = value;
            this.publishIfComplete();
          })
        TextInput({ text: this.accountNumberInput, placeholder: '账号' })
          .type(InputType.Normal)
          .inputFilter('[0-9]')
          .maxLength(9)
          .fontSize(this.textSizeValue)
          .fontColor(this.textColorValue)
          .height(42)
          .width('100%')
          .padding({ left: 12, right: 12 })
          .borderRadius(8)
          .backgroundColor(this.backgroundColorValue)
          .onChange((value: string) => {
            this.accountNumberInput = value;
            this.publishIfComplete();
          })
      }
      .width('100%')
    }
  }
}
