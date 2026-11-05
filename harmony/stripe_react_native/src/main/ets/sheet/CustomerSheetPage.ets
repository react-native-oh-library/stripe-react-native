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
 * CustomerSheetPage — 客户支付方式管理页（P1）。
 *
 * 数据经 CustomerSheetFlowHandler 双向回调获取（复刻 Android
 * EventEmitterCompat 时序：native 发射 onCustomerAdapterFetchPaymentMethodsCallback
 * → JS 回传 customerAdapterFetchPaymentMethodsCallback）。
 */

import hilog from '@ohos.hilog';
import { CustomerPaymentMethodItem, CustomerSheetConfig, CustomerSheetFlowHandler } from './SheetController';

@Component
export struct CustomerSheetPage {
  config: CustomerSheetConfig | null = null;
  flowHandler: CustomerSheetFlowHandler | null = null;
  onFinished: (result: Record<string, Object>) => void = (result: Record<string, Object>) => {
  };
  /** 弹窗内容自关闭通道（同 PaymentSheetPage，2026-11-04 close() 外部微任务失效修复） */
  closeDialog: () => void = () => {
  };

  @State private items: CustomerPaymentMethodItem[] = [];
  @State private isLoading: boolean = true;
  @State private errorText: string = '';
  @State private selectedId: string = '';

  aboutToAppear(): void {
    this.loadPaymentMethods();
  }

  aboutToDisappear(): void {
    // noop：无订阅资源
  }

  private async loadPaymentMethods(): Promise<void> {
    if (this.flowHandler === null) {
      this.isLoading = false;
      this.errorText = 'CustomerSheet 未初始化';
      return;
    }
    this.isLoading = true;
    try {
      const items = await this.flowHandler.fetchPaymentMethods();
      this.items = items;
      for (const item of items) {
        if (item.isSelected) {
          this.selectedId = item.id;
        }
      }
      this.errorText = '';
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      this.errorText = message;
    }
    this.isLoading = false;
  }

  private async onSelect(item: CustomerPaymentMethodItem): Promise<void> {
    this.selectedId = item.id;
    if (this.flowHandler !== null) {
      try {
        await this.flowHandler.setSelectedPaymentOption(item.id);
      } catch (err) {
        hilog.warn(0x0000, 'StripeSdk', 'CustomerSheet setSelectedPaymentOption failed: %{public}s', JSON.stringify(err));
      }
    }
    const selection: Record<string, Object> = { 'paymentOption': item.id };
    this.onFinished(selection);
    this.closeDialog();
  }

  build() {
    Column() {
      Divider()
        .width(36)
        .height(4)
        .color('#E0E0E0')
        .borderRadius(2)
        .margin({ top: 8 })

      Text('支付方式')
        .fontSize(17)
        .fontWeight(FontWeight.Medium)
        .fontColor('#1A1A1A')
        .width('100%')
        .textAlign(TextAlign.Center)
        .margin({ top: 12, bottom: 8 })

      if (this.isLoading) {
        Column() {
          LoadingProgress()
            .width(36)
            .height(36)
            .color('#635BFF')
          Text('加载支付方式…')
            .fontSize(14)
            .fontColor('#6A6A6A')
            .margin({ top: 8 })
        }
        .width('100%')
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
      } else {
        Scroll() {
          Column() {
            if (this.items.length === 0 && this.errorText.length === 0) {
              Text('暂无已保存的支付方式')
                .fontSize(14)
                .fontColor('#6A6A6A')
                .width('100%')
                .textAlign(TextAlign.Center)
                .padding(24)
            }
            ForEach(this.items, (item: CustomerPaymentMethodItem) => {
              Row() {
                Text(item.label)
                  .fontSize(15)
                  .fontColor('#1A1A1A')
                  .layoutWeight(1)
                if (this.selectedId === item.id) {
                  Text('已选')
                    .fontSize(13)
                    .fontColor('#635BFF')
                }
              }
              .width('100%')
              .padding(16)
              .borderRadius(8)
              .backgroundColor(this.selectedId === item.id ? '#F0EEFF' : '#F6F6F6')
              .margin({ bottom: 8 })
              .onClick(() => {
                this.onSelect(item);
              })
            }, (item: CustomerPaymentMethodItem) => item.id)
          }
          .width('100%')
          .padding({ left: 16, right: 16 })
        }
        .layoutWeight(1)
        .align(Alignment.Top)
        .scrollBar(BarState.Off)
      }

      if (this.errorText.length > 0) {
        Text(this.errorText)
          .fontSize(13)
          .fontColor('#DF1B41')
          .width('100%')
          .padding({ left: 16, right: 16, bottom: 4 })
      }

      Button('关闭')
        .width('100%')
        .height(44)
        .fontSize(15)
        .fontColor('#6A6A6A')
        .backgroundColor(Color.Transparent)
        .margin({ left: 16, right: 16, bottom: 12 })
        .onClick(() => {
          const canceled: Record<string, Object> = { 'code': 'Canceled', 'message': 'Customer sheet has been canceled' };
          this.onFinished({ 'error': canceled });
          this.closeDialog();
        })
    }
    .width('100%')
    .height('80%')
    .backgroundColor('#FFFFFF')
    .borderRadius({ topLeft: 16, topRight: 16 })
    .alignItems(HorizontalAlign.Center)
  }
}
