/**
 * DeviceEnv — getConstants() 的 SYSTEM_INFO 数据源。
 *
 * deviceInfo 为同步常量（@ohos.deviceInfo）；appName/appVersion 用
 * bundleManager.getBundleInfoForSelfSync（API 10+，同步形态，满足 JS 层
 * functions.ts 在模块加载期同步调用 getConstants 的时序）。
 * osVersion 无直接字段，按 osFullName + sdkApiVersion 拼接映射。
 * BundleInfo.applicationInfo 以 WITH_APPLICATION flag 携带（本 SDK 类型声明
 * 未直接暴露该字段，运行时存在，经 Record 桥式读取）。
 */

import { deviceInfo } from '@kit.BasicServicesKit';
import { bundleManager } from '@kit.AbilityKit';
import hilog from '@ohos.hilog';

const HILOG_DOMAIN = 0x0000;
const HILOG_TAG = 'StripeSdk';

export class DeviceEnv {
  static get osVersion(): string {
    return `HarmonyOS ${deviceInfo.osFullName} / API ${deviceInfo.sdkApiVersion}`;
  }

  static get deviceType(): string {
    return deviceInfo.deviceType;
  }

  private static fetchBundleInfoRecord(): Record<string, Object> {
    try {
      const flags = bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION;
      const info = bundleManager.getBundleInfoForSelfSync(flags);
      const record = info as Object as Record<string, Object>;
      return record;
    } catch (err) {
      hilog.error(HILOG_DOMAIN, HILOG_TAG, 'getBundleInfoForSelfSync failed: %{public}s', JSON.stringify(err));
      return {};
    }
  }

  static get appName(): string {
    const bundleRecord = DeviceEnv.fetchBundleInfoRecord();
    const appInfo = bundleRecord.applicationInfo as Record<string, Object> | undefined;
    if (appInfo && typeof appInfo.name === 'string') {
      return appInfo.name as string;
    }
    return '';
  }

  static get appVersion(): string {
    const bundleRecord = DeviceEnv.fetchBundleInfoRecord();
    const version = bundleRecord.versionName;
    if (typeof version === 'string') {
      return version;
    }
    return '';
  }
}
