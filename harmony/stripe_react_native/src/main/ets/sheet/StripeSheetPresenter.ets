/**
 * StripeSheetPresenter — 从 TurboModule 拉起全屏/半屏原生 Sheet 的基础设施。
 *
 * 承载方式（基于已查证 API）：window.getLastWindow(ctx) → win.getUIContext()
 * → ComponentContent(wrapBuilder(sheet), params) → promptAction.openCustomDialog。
 * HAR 内无法拿到宿主 NavPathStack，也不能注册宿主 main_pages.json 页面，
 * 全屏模态 dialog 是无宿主改动的可行路径（子窗口 setUIContent 需宿主注册页面）。
 */

import { common } from '@kit.AbilityKit';
import { window, ComponentContent, UIContext } from '@kit.ArkUI';
import hilog from '@ohos.hilog';
import { StripeSheetParams } from './SheetController';
import { StripeSheetBuilder } from './StripeSheetBuilder';

const HILOG_DOMAIN = 0x0000;
const HILOG_TAG = 'StripeSdk';

export class StripeSheetPresenter {
  private static currentContent: ComponentContent<StripeSheetParams> | null = null;
  private static currentUIContext: UIContext | null = null;

  private static async resolveUIContext(context: common.UIAbilityContext): Promise<UIContext | null> {
    try {
      const win = await window.getLastWindow(context);
      return win.getUIContext();
    } catch (err) {
      hilog.error(HILOG_DOMAIN, HILOG_TAG, 'getLastWindow failed: %{public}s', JSON.stringify(err));
      return null;
    }
  }

  static isShowing(): boolean {
    return StripeSheetPresenter.currentContent !== null;
  }

  static async present(context: common.UIAbilityContext, params: StripeSheetParams): Promise<void> {
    const uiContext = await StripeSheetPresenter.resolveUIContext(context);
    if (!uiContext) {
      throw new Error('Unable to resolve UIContext for Stripe sheet');
    }
    if (StripeSheetPresenter.currentContent !== null) {
      await StripeSheetPresenter.dismiss();
    }
    const content = new ComponentContent(uiContext, StripeSheetBuilder, params);
    StripeSheetPresenter.currentContent = content;
    StripeSheetPresenter.currentUIContext = uiContext;
    const prompt = uiContext.getPromptAction();
    try {
      await prompt.openCustomDialog(content, {
        isModal: true,
        autoCancel: false,
        alignment: DialogAlignment.Bottom,
      });
    } catch (err) {
      StripeSheetPresenter.currentContent = null;
      StripeSheetPresenter.currentUIContext = null;
      hilog.error(HILOG_DOMAIN, HILOG_TAG, 'openCustomDialog failed: %{public}s', JSON.stringify(err));
      throw new Error('Unable to present Stripe sheet');
    }
  }

  static async dismiss(): Promise<void> {
    const content = StripeSheetPresenter.currentContent;
    const uiContext = StripeSheetPresenter.currentUIContext;
    if (content !== null && uiContext !== null) {
      try {
        await uiContext.getPromptAction().closeCustomDialog(content);
      } catch (err) {
        hilog.warn(HILOG_DOMAIN, HILOG_TAG, 'closeCustomDialog failed (already closed?): %{public}s', JSON.stringify(err));
      }
    }
    StripeSheetPresenter.currentContent = null;
    StripeSheetPresenter.currentUIContext = null;
  }
}
