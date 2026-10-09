/**
 * StripeWebSheet — 3DS/SCA next_action、redirect 类支付方式、Stripe Connect
 * 外部页面的 Web 承载页（ArkUI Web 组件）。
 *
 * 已查证平台约束：
 * - 拦截用 onLoadIntercept（onUrlLoadIntercept 已于 API10 废弃），返回 true 阻止导航
 * - ArkWeb 引擎需 EntryAbility 预初始化（宿主责任，见 README 集成说明）
 * - Web 组件加载远程页面依赖 ohos.permission.INTERNET
 */

import { webview } from '@kit.ArkWeb';
import hilog from '@ohos.hilog';
import { WebAuthRequest } from './SheetController';

const HILOG_DOMAIN = 0x0000;
const HILOG_TAG = 'StripeSdk';

@Component
export struct StripeWebSheet {
  webAuth: WebAuthRequest | null = null;
  @State pageTitle: string = '';
  @State isFinished: boolean = false;
  @State isControllerReady: boolean = false;
  private controller: webview.WebviewController | null = null;

  aboutToAppear(): void {
    try {
      this.controller = new webview.WebviewController();
      this.isControllerReady = true;
    } catch (err) {
      this.controller = null;
      this.isControllerReady = false;
      hilog.error(HILOG_DOMAIN, HILOG_TAG, 'WebviewController create failed: %{public}s', `${err}`);
    }
  }

  aboutToDisappear(): void {
    // noop：controller 随组件销毁解绑
  }

  private handleIntercepted(returnUrl: string): void {
    if (this.isFinished) {
      return;
    }
    this.isFinished = true;
    this.webAuth?.onComplete?.(returnUrl);
  }

  private handleCancel(): void {
    if (this.isFinished) {
      return;
    }
    this.isFinished = true;
    this.webAuth?.onComplete?.(null);
  }

  build() {
    Column() {
      // 顶部导航
      Row() {
        Button('‹')
          .fontSize(24)
          .fontColor('#1A1A1A')
          .backgroundColor(Color.Transparent)
          .height(40)
          .width(48)
          .onClick(() => {
            this.handleCancel();
          })
        Text(this.pageTitle.length > 0 ? this.pageTitle : 'Stripe')
          .fontSize(17)
          .fontWeight(FontWeight.Medium)
          .fontColor('#1A1A1A')
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .layoutWeight(1)
        Blank()
          .width(48)
      }
      .width('100%')
      .height(56)
      .padding({ left: 4, right: 8 })
      .backgroundColor('#FFFFFF')

      // Web 承载区
      Column() {
        if (this.webAuth !== null && this.webAuth.url.length > 0 && this.isControllerReady && this.controller !== null) {
          Web({ src: this.webAuth.url, controller: this.controller })
            .javaScriptAccess(true)
            .domStorageAccess(true)
            .zoomAccess(true)
            .fileAccess(false)
            .geolocationAccess(false)
            .width('100%')
            .height('100%')
            .onLoadIntercept((event) => {
              if (event) {
                const url = event.data.getRequestUrl();
                // 命中 returnURL 前缀或 stripe:// scheme 即视为认证完成
                // （prefix 为空时 startsWith 恒真，必须先判长度，避免首个 URL 被误拦截）
                const prefix = this.webAuth?.returnUrl ?? '';
                if ((prefix.length > 0 && url.startsWith(prefix)) || url.startsWith('stripe://')) {
                  this.handleIntercepted(url);
                  return true;
                }
              }
              return false;
            })
            .onPageEnd((event) => {
              if (event) {
                // controller.getTitle() API 12+；失败保持当前标题
                try {
                  this.pageTitle = this.controller?.getTitle() ?? '';
                } catch (err) {
                  this.pageTitle = '';
                }
              }
            })
            .onConsole((event) => {
              if (event) {
                hilog.info(HILOG_DOMAIN, HILOG_TAG, 'web console: %{public}s', event.message.getMessage());
              }
              return false;
            })
            .onErrorReceive((event) => {
              if (event && event.request.isMainFrame()) {
                hilog.error(HILOG_DOMAIN, HILOG_TAG, 'web error: %{public}s url=%{public}s',
                  event.error.getErrorInfo(), event.request.getRequestUrl());
              }
            })
        } else {
          Column() {
            Text('无效的认证地址')
              .fontSize(15)
              .fontColor('#6A6A6A')
          }
          .width('100%')
          .layoutWeight(1)
          .justifyContent(FlexAlign.Center)
        }
      }
      .layoutWeight(1)
      .width('100%')
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FFFFFF')
  }
}
