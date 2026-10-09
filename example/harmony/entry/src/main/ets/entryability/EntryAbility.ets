/**
 * This source code is licensed under the MIT license found in the
 * LICENSE-MIT file in the root directory of this source tree.
 */

import { RNAbility } from '@rnoh/react-native-openharmony';
import { Want } from '@kit.AbilityKit';
import { AbilityConstant } from '@kit.AbilityKit';
import { webview } from '@kit.ArkWeb';

export default class EntryAbility extends RNAbility {
  getPagePath() {
    return 'pages/Index';
  }

  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    super.onCreate(want, launchParam);
    // HarmonyOS 6.x ArkWeb 引擎不会随首个 Web 组件自动初始化，
    // StripeWebSheet（3DS/SCA redirect）与 Connect 的 react-native-webview
    // 都依赖 ArkWeb，启动时预初始化引擎。
    try {
      webview.WebviewController.initializeWebEngine();
    } catch (err) {
      console.error(`initializeWebEngine failed: ${JSON.stringify(err)}`);
    }
  }
}
