/**
 * ShareHelper — downloadAndShareFile 的下载（@ohos.request.downloadFile）与
 * 系统分享（@kit.ShareKit systemShare）实现。
 *
 * 平台限制（已查证）：
 * - request.download 旧接口已废弃，必须用 downloadFile(9+)；DownloadConfig
 *   需 url + filePath（应用沙箱路径，使用 context.cacheDir）
 * - Share Kit 属华为商用系 Kit，纯 OpenHarmony 设备可用性未承诺——分享失败
 *   不影响下载结果，返回 { success: true, error: 'share failed: ...' }
 */

import type { common } from '@kit.AbilityKit';
import { request } from '@kit.BasicServicesKit';
import { systemShare } from '@kit.ShareKit';
import fileIo from '@ohos.file.fs';
import hilog from '@ohos.hilog';

const HILOG_DOMAIN = 0x0000;
const HILOG_TAG = 'StripeSdk';

export interface DownloadShareResult {
  success: boolean;
  error?: string;
}

export class ShareHelper {
  static async downloadAndShare(context: common.UIAbilityContext, url: string, filename: string | null): Promise<DownloadShareResult> {
    try {
      const name = ShareHelper.resolveFilename(url, filename);
      const targetPath = `${context.cacheDir}/${name}`;
      // 清理可能存在的旧文件，避免 downloadFile 覆盖冲突
      try {
        if (fileIo.accessSync(targetPath)) {
          fileIo.unlinkSync(targetPath);
        }
      } catch (err) {
        hilog.info(HILOG_DOMAIN, HILOG_TAG, 'cleanup old file ignored: %{public}s', JSON.stringify(err));
      }

      const config: request.DownloadConfig = {
        url: url,
        filePath: targetPath,
        description: name,
      };
      const downloadTask = await request.downloadFile(context, config);

      const completedPath = await new Promise<string>((resolve, reject) => {
        downloadTask.on('complete', () => {
          resolve(targetPath);
        });
        downloadTask.on('fail', (err: number) => {
          reject(new Error(`download failed with error ${err}`));
        });
      });

      const shareError = await ShareHelper.tryShare(context, completedPath);
      const result: DownloadShareResult = { success: true };
      if (shareError !== null) {
        result.error = shareError;
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      hilog.error(HILOG_DOMAIN, HILOG_TAG, 'downloadAndShareFile failed: %{public}s', message);
      return { success: false, error: message };
    }
  }

  private static resolveFilename(url: string, filename: string | null): string {
    if (filename && filename.length > 0) {
      return filename;
    }
    const withoutQuery = url.split('?')[0];
    const segments = withoutQuery.split('/');
    const last = segments[segments.length - 1];
    return last.length > 0 ? last : `stripe-download-${Date.now()}`;
  }

  /** 分享面板拉起；Share Kit 不可用时降级为「仅下载成功」 */
  private static async tryShare(context: common.UIAbilityContext, path: string): Promise<string | null> {
    try {
      const data = new systemShare.SharedData({ utd: 'general.file', uri: `file://${path}` });
      const controller = new systemShare.ShareController(data);
      await controller.show(context, {
        selectionMode: systemShare.SelectionMode.SINGLE,
        previewMode: systemShare.SharePreviewMode.DETAIL,
      });
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : JSON.stringify(err);
      hilog.warn(HILOG_DOMAIN, HILOG_TAG, 'share fallback (download still ok): %{public}s', message);
      return `share failed: ${message}`;
    }
  }
}
