# @oh-rn/stripe-react-native for HarmonyOS

本项目基于 [@stripe/stripe-react-native](https://github.com/stripe/stripe-react-native) 开发，为 React Native 鸿蒙（OpenHarmony）适配版本。

## 版本对应关系

| 鸿蒙适配包版本 | 原始库版本 | 支持 RN 版本 | Autolink | 编译 API 版本 |
| ------------ | ---------- | ------------ | -------- | ------------- |
| 见发布记录 | 0.77.0 | 0.72+ | 是 | API12+ |

## 安装

```bash
npm install @oh-rn/stripe-react-native
```

## 使用

```tsx
import {
  StripeProvider,
  CardField,
  CardFieldInput,
  useStripe,
} from '@stripe/stripe-react-native';

export default function App() {
  return (
    <StripeProvider
      publishableKey="pk_test_..."
      urlScheme="stripe"
    >
      <PaymentScreen />
    </StripeProvider>
  );
}

function PaymentScreen() {
  const { confirmPayment } = useStripe();
  const [card, setCard] = useState<CardFieldInput.Details | null>(null);
  const cardStyle = { borderWidth: 1, borderRadius: 8 };
  const fieldStyle = { width: '100%', height: 50 };

  return (
    <CardField
      postalCodeEnabled={true}
      cardStyle={cardStyle}
      style={fieldStyle}
      onCardChange={setCard}
    />
  );
}

// 卡数据由原生 CardField 持有，confirmPayment 直接用 client secret 确认：
await confirmPayment(clientSecret, {
  paymentMethodType: 'Card',
  paymentMethodData: { billingDetails: { email: 'email@stripe.com' } },
});
```

> import 时使用原库名 `'@stripe/stripe-react-native'`，而非鸿蒙包名（由 RNOH alias 自动映射到 `@oh-rn/stripe-react-native`）。

**平台差异**：
- 闭源 `stripe-android`/`stripe-ios` 无鸿蒙版本，支付通道为 publishable key 直调 Stripe REST API（`@ohos.net.http`），行为对等、错误结构一致（`StripeError{code, message, ...}`）。
- `PaymentSheet`/`CustomerSheet` 为 ArkUI 自绘页（Stripe 设计 token 近似），非闭源原生 UI 的像素级复刻。
- 3DS/SCA 的 redirect 型 `next_action` 经 ArkWeb 全屏认证页完成，`stripe://` 回跳由 deep link（`module.json5` scheme + `handleURLCallback`）承接。
- 平台钱包类 API（Apple Pay / Google Pay / Push Provisioning / Link / Financial Connections / Crypto Onramp / 嵌入式原生组件）鸿蒙无对应系统服务，返回结构化 `notSupported` 错误或 `false`，不静默。
- Connect 嵌入组件依赖的 `injectedObjectJson()` 桥在 OHOS webview 上缺失，库内已在 harmony 端用 document-start 垫片补齐（见「API 详情 → 平台差异」），宿主无需处理；Connect 全屏 Modal 的硬件返回键也已在库内经 BackHandler 拦截（仅 harmony）。

**权限要求**：
- 需在 `module.json5` 声明 `ohos.permission.INTERNET`（system_grant，REST 通道必需，无需动态申请）。
- 宿主 `EntryAbility.onCreate` 需调用 `webview.WebviewController.initializeWebEngine()`（HarmonyOS 6.x ArkWeb 引擎不自动初始化，3DS 认证页与 Connect webview 依赖它）。

## Link

| 版本 | 是否支持 Autolink |
|------|------------------|
| 当前版本 | 是 |

如使用版本支持 Autolink 且工程已接入，可跳过手动配置。

<details>
<summary>Manual Link 配置</summary>

> **说明**：本模块需要同时在 C++ 侧和 ETS 侧注册 Package。

### 1. Overrides RN SDK

在工程根目录 `oh-package.json5` 添加：

```json
{
  "overrides": {
    "@rnoh/react-native-openharmony": "./react_native_openharmony"
  }
}
```

### 2. 引入原生端依赖

打开 `entry/oh-package.json5`，添加：

```json
"dependencies": {
  "@oh-rn/stripe-react-native": "file:../../node_modules/@oh-rn/stripe-react-native/harmony/stripe_react_native.har"
}
```

执行 `ohpm install`。

### 3. 配置 CMakeLists

打开 `entry/src/main/cpp/CMakeLists.txt`，添加：

```cmake
set(OH_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")

add_subdirectory("${OH_MODULES}/@oh-rn/stripe-react-native/src/main/cpp" ./stripe_react_native)

target_link_libraries(rnoh_app PUBLIC stripe_react_native)
```

### 4. 注册 Package（C++ 侧）

打开 `entry/src/main/cpp/PackageProvider.cpp`，添加：

```cpp
#include "StripeReactNativePackage.h"

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    return {
        std::make_shared<StripeReactNativePackage>(ctx),
    };
}
```

### 5. 注册 Package（ETS 侧）

打开 `entry/src/main/ets/RNPackagesFactory.ets`，添加：

```typescript
import { StripeReactNativePackage } from '@oh-rn/stripe-react-native/ts';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
    new StripeReactNativePackage(ctx),
  ];
}
```

</details>

## 属性 / API

| API | 描述 | 参数 | 返回值 | HarmonyOS 支持 |
|-----|------|------|--------|----------------|
| StripeProvider / initStripe | 初始化 SDK | publishableKey, urlScheme 等 | void | ✅ 完全支持 |
| Constants (getConstants) | SDK/系统信息常量 | — | API_VERSIONS + SYSTEM_INFO | ✅ 完全支持 |
| initialise | 配置 publishable key | InitialiseParams | Promise&lt;void&gt; | ✅ 完全支持 |
| createPaymentMethod | 创建支付方式 | params, options | CreatePaymentMethodResult | ✅ 完全支持（REST /v1/payment_methods） |
| createToken | 创建令牌（Card/BankAccount/Pii） | CreateParams | CreateTokenResult | ✅ 完全支持（REST /v1/tokens） |
| createTokenForCVCUpdate | CVC 更新令牌 | cvc: string | CreateTokenForCVCUpdateResult | ✅ 完全支持 |
| createRadarSession | 创建 Radar 会话 | — | CreateRadarSessionResult | ✅ 完全支持 |
| confirmPayment | 确认支付意图 | clientSecret, params, options | ConfirmPaymentResult | ✅ 完全支持（含 3DS redirect） |
| confirmSetupIntent | 确认设置意图 | clientSecret, params, options | ConfirmSetupIntentResult | ✅ 完全支持 |
| retrievePaymentIntent / retrieveSetupIntent | 回读意图 | clientSecret | Retrieve*Result | ✅ 完全支持 |
| handleNextAction / handleNextActionForSetup | 处理下一步认证 | clientSecret, returnURL | HandleNextAction*Result | ⚠️ 部分支持（redirect 型经 ArkWeb 完成；native-app 型无鸿蒙生态，按取消处理） |
| initPaymentSheet | 初始化支付页 | SetupParams | InitPaymentSheetResult | ✅ 完全支持（自绘收银台，customFlow/intentConfiguration 均支持） |
| presentPaymentSheet | 拉起支付页 | PresentOptions | PresentPaymentSheetResult | ✅ 完全支持 |
| confirmPaymentSheetPayment | customFlow 确认 | — | ConfirmPaymentSheetPaymentResult | ✅ 完全支持 |
| intentCreationCallback 等双向回调 ×3 | customFlow 回传 | IntentCreationCallbackParams 等 | Promise&lt;void&gt; | ✅ 完全支持（事件往返） |
| resetPaymentSheetCustomer | 重置客户状态 | — | Promise&lt;null&gt; | ✅ 完全支持 |
| initCustomerSheet / presentCustomerSheet | 客户支付方式管理 | InitParams / PresentParams | CustomerSheetResult | ✅ 完全支持（自绘 + CustomerAdapter 事件往返） |
| retrieveCustomerSheetPaymentOptionSelection | 回读当前选择 | — | CustomerSheetResult | ⚠️ 部分支持（无原生持久化，返回空选择） |
| customerAdapter*Callback ×6 / clientSecretProvider*Callback ×2 | 双向回调回传 | 各自 payload | Promise&lt;void&gt; | ✅ 完全支持 |
| collectBankAccount | 银行账户收集确认 | isPaymentIntent, clientSecret, params | Confirm*Result | ⚠️ 部分支持（REST 直接建 PM 并确认；无托管 UI，账号由调用方传入） |
| verifyMicrodeposits | 微存款验证 | isPaymentIntent, clientSecret, params | Confirm*Result | ✅ 完全支持 |
| handleURLCallback | stripe:// 回跳处理 | url: string | Promise&lt;boolean&gt; | ✅ 完全支持 |
| openAuthenticatedWebView / presentExternalWebPage / authWebViewDeepLinkHandled | Web 认证/外部页 | id/url 等 | 各自结果 | ✅ 完全支持（ArkWeb 承载） |
| storeStripeConnectDeepLink / pollAndClearPendingStripeConnectUrls | Connect 深链存取 | url / — | void / string[] | ✅ 完全支持 |
| downloadAndShareFile | 下载并分享文件 | url, filename | {success, error?} | ✅ 完全支持（分享面板不可用时降级为仅下载） |
| isPlatformPaySupported | 平台钱包可用性 | params | Promise&lt;boolean&gt; | ❌ 不支持（恒 false，鸿蒙无 Stripe 平台钱包） |
| createPlatformPayPaymentMethod / confirmPlatformPay | 平台钱包支付 | params, clientSecret | 结构化 notSupported | ❌ 不支持 |
| openApplePaySetup / canAddCardToWallet / isCardInWallet / updatePlatformPaySheet / dismissPlatformPay / configureOrderTracking | 钱包管理 | 各自参数 | false / 结构化 notSupported | ❌ 不支持 |
| collectFinancialConnectionsAccounts / collectBankAccountToken / setFinancialConnectionsForceNativeFlow | Financial Connections | clientSecret, params | 结构化 notSupported | ❌ 不支持（闭源托管 OAuth 流无鸿蒙承载） |
| initLinkController / presentLinkController / confirmLinkControllerSetupIntent | Link（Private Preview） | params | 结构化 notSupported | ❌ 不支持 |
| createEmbeddedPaymentElement / confirm / update / clear | 嵌入式支付组件 | intentConfig 等 | 结构化 notSupported | ❌ 不支持（发 loadingFailed 事件可感知降级） |
| OnrampSdk 全部方法 | Crypto Onramp | 各自参数 | 结构化 notSupported（isSamsungPaySupported→false） | ❌ 不支持 |
| CardField（组件） | 卡号安全输入 | autofocus/cardStyle/placeholders/postalCodeEnabled/disabled/dangerouslyGetFullCardDetails | — | ✅ 完全支持（focus/blur/clear 命令 + onCardChange/onFocusChange） |
| CardForm（组件） | 完整卡表单 | cardStyle/placeholders 等 | — | ✅ 完全支持（focus/blur 命令 + onFormComplete） |
| AuBECSDebitForm（组件） | 澳洲借记表单 | companyName/formStyle | — | ✅ 完全支持（onComplete） |
| AddressSheet（组件） | 地址表单 | visible/defaultValues/sheetTitle 等 | — | ✅ 完全支持（onSubmit/onError） |
| StripeContainer（组件） | 组件容器 | keyboardShouldPersistTaps | — | ✅ 完全支持 |
| NavigationBar（组件） | Connect 导航栏 | title 等 | — | ⚠️ 部分支持（基础标题/关闭形态） |
| PlatformPayButton（组件） | 平台钱包按钮 | type/appearance/onPress | — | ⚠️ 部分支持（渲染降级占位按钮，点击触发原生 notSupported） |
| ApplePayButton / GooglePayButton / AddToWalletButton（组件） | 钱包按钮 | 各自 props | — | ❌ 不支持（占位视图 + 结构化错误事件） |
| EmbeddedPaymentElementView / PaymentMethodMessagingElementView（组件） | 嵌入式原生视图 | configuration | — | ❌ 不支持（空视图占位） |
| Connect JS 组件（ConnectComponentsProvider / ConnectAccountOnboarding / ConnectPayments 等） | Stripe Connect 嵌入 | connectInstance | — | ⚠️ 部分支持（经 @react-native-ohos/react-native-webview 承载；harmony 端已内置 `injectedObjectJson` 垫片与 BackHandler 返回键拦截，Android 行为不变） |

### 平台差异
- 支付通道为 publishable key 直调 Stripe REST API v1（表单编码、Bearer 鉴权、结构化错误对齐 `StripeError`），非闭源移动 SDK 二进制。
- `PaymentSheet`/`CustomerSheet` 为 ArkUI 自绘（Stripe 设计 token：主色 #635BFF 等），外观近似而非闭源 Compose UI 的像素级复刻；customFlow（`onConfirmHandlerCallback` → `intentCreationCallback`）与默认流均可用。
- 3DS/SCA 仅覆盖 redirect 型 `next_action`（ArkWeb 全屏页 + `onLoadIntercept` 拦截回跳 + 回读终态）；银行 App 跳转等 native-app 型在鸿蒙无对应生态，按取消语义返回。
- 卡号输入用 TextInput Normal + inputFilter（避免鸿蒙密码保险箱自动填充），快照存原生侧 `CardFieldRegistry`，不经业务服务器。

### 未实现功能
| API | 原因 |
|-----|------|
| Apple Pay / Google Pay / Push Provisioning 全组 | 鸿蒙 Wallet Kit 仅车钥匙/交通卡（且限中国大陆手机），IAP Kit 为华为收银台，均非 Stripe 通道；返回结构化 notSupported 或 false |
| Financial Connections | 闭源 SDK 深度集成的 OAuth 托管流，Stripe 未开放鸿蒙承载 |
| Crypto Onramp（OnrampSdk） | 闭源构建变体（Android 需 StripeSdk_includeOnramp=true），无鸿蒙版本 |
| LinkController / Checkout | 官方 Private Preview，无公开 API 面 |
| EmbeddedPaymentElement / PaymentMethodMessagingElement 原生视图 | 闭源 Compose 嵌入组件；空视图占位 + 生命周期事件（loadingFailed 等）可感知降级 |

### 使用限制
- 需声明 `ohos.permission.INTERNET`（system_grant）。
- 宿主 EntryAbility 需预初始化 ArkWeb 引擎（3DS 认证页与 Connect webview 依赖）。
- 深链回跳需在 `module.json5` 声明 `stripe` scheme（browsable），JS 侧经 `Linking` 'url' 事件 + `handleURLCallback` 回到原生。
- RNOH 的 `Modal` 不拦截硬件返回键（`RNModalHostView` 仅在消失时补发 `onRequestClose`，未处理的返回会触发 `BackHandler.exitApp()` 直接退出应用）；库内 Connect 全屏 Modal 已在 harmony 端注册 BackHandler 拦截并走 `onExit` 回调，宿主自建全屏 Modal 时需自行同样处理。
- Connect 嵌入组件需设备真实联网加载 `connect-js.stripe.com`/`api.stripe.com`。断网或不可达时约 30s 后 webview 停在空白错误页且加载圈持续显示（`onLoaderStart` 不触发即不清圈，与上游 Android 行为一致），恢复网络后关闭组件重开即可；原生加载失败不触发 `onLoadError`（该回调仅覆盖 connect-js 运行期错误，上游同样如此）。

## 快速验证（运行 Example）

### 前置条件

| 依赖 | 版本要求 |
|------|----------|
| Node.js | >= 18 |
| DevEco Studio | 5.0+ / 6.0+ |
| HarmonyOS SDK | API 12+ |

### 运行步骤

**1. 克隆仓库**

```bash
git clone <仓库地址>
cd <仓库目录>
```

**2. 安装依赖并构建**

```bash
npm install --legacy-peer-deps
npm pack           # 生成 tgz 包（会自动触发 prepare 构建 JS 产物）
```

**3. 进入 example 目录，安装依赖**

```bash
cd example
npm install --legacy-peer-deps
```

**4. 生成 JS Bundle**

```bash
npm run dev
```

产物：`harmony/entry/src/main/resources/rawfile/bundle.harmony.js`

**5. 用 DevEco Studio 打开鸿蒙工程**

- 打开 DevEco Studio
- 选择 `example/harmony` 目录
- 等待 Sync 完成

**6. 编译并运行 HAP**

在 DevEco Studio 中点击运行按钮，将 HAP 安装到设备/模拟器。

> **注意**：Example 中已预置插件依赖和 Package 注册，无需手动配置 Link。

## 约束与限制

### 兼容性

- RNOH: 0.72+
- HarmonyOS SDK: API 12+
- DevEco Studio: 5.0+

## 遗留问题

- 平台钱包 / Financial Connections / Onramp / Link / 嵌入式原生组件为明确降级（结构化 notSupported，见上表），非待办事项——鸿蒙无对应系统服务或闭源 SDK 无鸿蒙版本。
- `PaymentSheet`/`CustomerSheet` 为 ArkUI 自绘近似实现，非闭源原生 UI 像素级复刻。
- HAP 未签名（模板无 signingConfigs），装真机需在 DevEco 配置签名。

## 开源协议

本项目基于 [MIT License](https://github.com/stripe/stripe-react-native/blob/main/LICENSE)，详见 [LICENSE](./LICENSE) 文件。