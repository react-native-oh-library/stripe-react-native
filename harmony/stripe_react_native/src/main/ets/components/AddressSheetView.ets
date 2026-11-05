/**
 * MIT License
 *
 * Copyright (C) 2026 Huawei Device Co., Ltd.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software") to deal
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
 * AddressSheetView — Fabric 地址表单组件（P1）。
 *
 * 呈现方式（2026-11-03 真机修复）：RN 视图是叶子组件，App 侧不给 style 时
 * yoga 测高为 0，内联百分比布局（height('90%')）对 0 求值全部塌缩，只剩
 * 两个固有高度按钮泄漏到页面流里（Comp-02 无表单弹出的根因）。改为
 * bindSheet 半模态：RNViewBase 仅作 0 尺寸锚点，表单在窗口级 sheet 中呈现，
 * 尺寸不再依赖 RN 视图 frame（与 PaymentSheet 的 DialogController 呈现同型）。
 *
 * visible 只跟随 JS 侧变迁（true→false / false→true）生效：手势/按钮本地关闭后，
 * 无关重渲染携旧的 visible=true 不会复活 sheet；JS 重新置 true 前需先经历 false。
 * 提交完整地址发射 'submitAction'（payload.result 为 AddressDetails），
 * 校验失败/取消发射 'errorAction'（payload.error 为 StripeError）。
 * 未提交关闭（取消按钮/下拉/侧拉/返回/遮罩）统一 Canceled（2026-11-03 对齐原库：
 * iOS didFinish(nil)、Android AddressLauncherResult.Canceled 均回 Canceled error）。
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

  /** JS 侧 visible 上次生效值：仅变迁时驱动 sheet，本地关闭不被无关重渲染复活 */
  private lastJsVisible: boolean = false;
  private eventEmitter: Spec.EventEmitter | undefined = undefined;
  private cleanUpCallbacks: (() => void)[] = [];

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
  }

  private applyDescriptor(descriptor: Spec.Descriptor): void {
    const rawProps = descriptor.rawProps as Spec.DirectRawProps;
    if (rawProps) {
      const wantVisible = rawProps.visible ?? false;
      const opening = wantVisible && !this.lastJsVisible;
      if (wantVisible !== this.lastJsVisible) {
        this.lastJsVisible = wantVisible;
        this.isVisible = wantVisible;
      }
      const title = rawProps.sheetTitle;
      if (title && title.length > 0) {
        this.sheetTitle = title;
      }
      const buttonTitle = rawProps.primaryButtonTitle;
      if (buttonTitle && buttonTitle.length > 0) {
        this.primaryButtonTitle = buttonTitle;
      }
      // 预填只在挂载首次与每次打开时应用，避免表单填写中途被无关重渲染清掉
      if (opening || (this.nameInput.length === 0 && !wantVisible)) {
        this.applyDefaultValues(rawProps.defaultValues as Object);
      }
    }
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
    this.emitCanceled();
    this.isVisible = false;
    this.errorText = '';
  }

  /** 未提交关闭统一发 Canceled，取消按钮与 onWillDismiss 手势关闭共用 */
  private emitCanceled(): void {
    const error: BridgeRecord = {
      'code': 'Canceled',
      'message': 'Address sheet has been canceled',
    };
    const errorPayload: AddressErrorPayload = { error: error };
    this.eventEmitter?.emit('errorAction', errorPayload);
  }

  /** 半模态内容：表单由 sheet 容器定高，Scroll 占剩余空间（嵌套滚动支持拖拽换挡） */
  @Builder
  sheetBuilder() {
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
      .nestedScroll({
        scrollForward: NestedScrollMode.PARENT_FIRST,
        scrollBackward: NestedScrollMode.SELF_FIRST,
      })

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
    .height('100%')
    .backgroundColor(Color.White)
  }

  build() {
    // 叶子组件无 style 时 frame 为 0×0，只作锚点；表单走窗口级 bindSheet 呈现。
    // 两个 ArkTS 语法约束：
    // 1) 自定义组件（RNViewBase）尾随闭包后不允许再链式调用属性，bindSheet 只能挂在
    //    闭包内的内置容器上；
    // 2) RNViewBase 的 @BuilderParam renderChildren 无默认值，闭包体不能为空，
    //    否则 initialRender 调 this.renderChildren() 时 bind undefined → 启动即 jscrash。
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      Column() {
      }
      .bindSheet($$this.isVisible, this.sheetBuilder(), {
        detents: [SheetSize.MEDIUM, SheetSize.LARGE],
        dragBar: true,
        backgroundColor: Color.White,
        // 手势关闭(下拉/侧拉/返回/遮罩)拦截:先按原库契约发 Canceled 再放行关闭;
        // 程序化关闭(submit/cancel 置 isVisible=false)不进此回调,无重复发射
        onWillDismiss: (dismissSheetAction: DismissSheetAction) => {
          this.emitCanceled();
          this.errorText = '';
          dismissSheetAction.dismiss();
        },
      })
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
