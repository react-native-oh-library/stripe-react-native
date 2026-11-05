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
 * StripeSheetPresenter — 从 TurboModule 拉起全屏/半屏原生 Sheet 的基础设施。
 *
 * 承载方式（基于已查证 API）：window.getLastWindow(ctx) → win.getUIContext()
 * → ComponentContent(wrapBuilder(sheet), params) → promptAction.openCustomDialogWithController。
 * HAR 内无法拿到宿主 NavPathStack，也不能注册宿主 main_pages.json 页面，
 * 全屏模态 dialog 是无宿主改动的可行路径（子窗口 setUIContent 需宿主注册页面）。
 *
 * 关闭通道（2026-11-04 三次修复，API 26 真机取证）：controller.close() 在该设备上
 * 从任何调用点（页面 onClick / TurboModule 微任务，均主线程）静默失效——getState()
 * 三轮重试恒 APPEARED(3)，而系统 Back 键可正常关闭（弹窗本身健康，纯程序化通道失效）。
 * 故反转打开优先级：内容寻址 openCustomDialog(content)(since 12) 为主通道，
 * closeCustomDialog(content) 关闭并以「二次 close 抛 103303 = 已注销」验证；
 * controller 路径降为 fallback（保留 getState 验证）。
 * closeDialog 注入回调双通道并试（按打开模式一条生效，另一条无副作用）。
 */

import { common } from '@kit.AbilityKit';
import { window, ComponentContent, UIContext, promptAction } from '@kit.ArkUI';
import hilog from '@ohos.hilog';
import { StripeSheetParams } from './SheetController';
import { StripeSheetBuilder, PaymentSheetParamsExt } from './StripeSheetBuilder';

const HILOG_DOMAIN = 0x0000;
const HILOG_TAG = 'StripeSdk';

export class StripeSheetPresenter {
  private static currentContent: ComponentContent<StripeSheetParams> | null = null;
  private static currentUIContext: UIContext | null = null;
  private static currentController: promptAction.DialogController | null = null;

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
    const controller = new promptAction.DialogController();
    // 双通道自关闭回调：内容寻址 closeCustomDialog + controller.close() 并试。
    // 按实际打开模式一条生效，另一条无副作用（103303 / no-op 均被吞）。
    (params as PaymentSheetParamsExt).closeDialog = (): void => {
      try {
        uiContext.getPromptAction().closeCustomDialog(content).catch((): void => {
        });
      } catch (err) {
        hilog.warn(HILOG_DOMAIN, HILOG_TAG, 'in-dialog closeCustomDialog threw: %{public}s', JSON.stringify(err));
      }
      try {
        controller.close();
      } catch (err) {
        hilog.warn(HILOG_DOMAIN, HILOG_TAG, 'in-dialog controller.close failed: %{public}s', JSON.stringify(err));
      }
    };
    StripeSheetPresenter.currentContent = content;
    StripeSheetPresenter.currentUIContext = uiContext;
    StripeSheetPresenter.currentController = controller;
    const prompt = uiContext.getPromptAction();
    // 主通道：内容寻址打开（since 12 成熟路径）。
    // 2026-11-04 实测：controller 绑定路径 open 正常，但 close() 从任何调用点静默失效
    //（API 26 真机，getState 恒 APPEARED），故 controller 降为打开兜底。
    try {
      await prompt.openCustomDialog(content, {
        isModal: true,
        autoCancel: false,
        alignment: DialogAlignment.Bottom,
      });
      StripeSheetPresenter.currentController = null; // 内容寻址模式：controller 未绑定
      return;
    } catch (err) {
      hilog.warn(HILOG_DOMAIN, HILOG_TAG, 'openCustomDialog(content) failed, fallback to controller: %{public}s', JSON.stringify(err));
    }
    try {
      await prompt.openCustomDialogWithController(content, controller, {
        isModal: true,
        autoCancel: false,
        alignment: DialogAlignment.Bottom,
      });
    } catch (err2) {
      StripeSheetPresenter.currentContent = null;
      StripeSheetPresenter.currentUIContext = null;
      StripeSheetPresenter.currentController = null;
      hilog.error(HILOG_DOMAIN, HILOG_TAG, 'openCustomDialogWithController failed: %{public}s', JSON.stringify(err2));
      throw new Error('Unable to present Stripe sheet');
    }
  }

  static async dismiss(): Promise<void> {
    const content = StripeSheetPresenter.currentContent;
    const uiContext = StripeSheetPresenter.currentUIContext;
    const controller = StripeSheetPresenter.currentController;
    // 先摘静态引用：重入 dismiss（present 顶替 / 二次回调）直接变 no-op
    StripeSheetPresenter.currentContent = null;
    StripeSheetPresenter.currentUIContext = null;
    StripeSheetPresenter.currentController = null;
    if (content === null) {
      return;
    }
    let closed = false;
    if (controller === null && uiContext !== null) {
      // 通道 A（内容寻址模式）：closeCustomDialog(content)，
      // 以「二次调用抛 103303（content 已注销）」验证真关闭。
      for (let attempt = 1; attempt <= 3 && !closed; attempt++) {
        try {
          await uiContext.getPromptAction().closeCustomDialog(content);
        } catch (err) {
          hilog.warn(HILOG_DOMAIN, HILOG_TAG, 'closeCustomDialog attempt %{public}d threw: %{public}s', attempt, JSON.stringify(err));
        }
        await StripeSheetPresenter.delay(100);
        try {
          await uiContext.getPromptAction().closeCustomDialog(content);
          // 二次仍 resolve = 仍注册 = 首次关闭被静默吞掉，重试
          hilog.warn(HILOG_DOMAIN, HILOG_TAG, 'content still registered after close attempt %{public}d', attempt);
        } catch (err) {
          hilog.info(HILOG_DOMAIN, HILOG_TAG, 'content close verified (deregistered) on attempt %{public}d', attempt);
          closed = true;
        }
      }
    } else if (controller !== null) {
      // 通道 B（controller 模式兜底）：close() + getState()(API 20+) 验证
      for (let attempt = 1; attempt <= 3 && !closed; attempt++) {
        try {
          controller.close();
        } catch (err) {
          hilog.warn(HILOG_DOMAIN, HILOG_TAG, 'DialogController.close failed: %{public}s', JSON.stringify(err));
        }
        await StripeSheetPresenter.delay(100);
        try {
          const state = controller.getState();
          hilog.info(HILOG_DOMAIN, HILOG_TAG, 'dialog state after close attempt %{public}d: %{public}d', attempt, state);
          closed = state === promptAction.CommonState.DISAPPEARING || state === promptAction.CommonState.DISAPPEARED;
        } catch (err) {
          hilog.info(HILOG_DOMAIN, HILOG_TAG, 'getState unavailable, close submitted once');
          closed = true;
        }
      }
    }
    if (!closed) {
      hilog.warn(HILOG_DOMAIN, HILOG_TAG, 'dismiss: all channels exhausted, dialog may still be visible');
    }
    // dispose 延后：close 异步生效，过早 dispose 与关闭动画竞速可能留僵尸帧
    await StripeSheetPresenter.delay(120);
    try {
      content.dispose();
    } catch (err) {
      hilog.warn(HILOG_DOMAIN, HILOG_TAG, 'ComponentContent.dispose failed: %{public}s', JSON.stringify(err));
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise<void>((resolve: () => void) => {
      setTimeout(resolve, ms);
    });
  }
}
