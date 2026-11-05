> 文档模板：v0.4.2

<p align="center">
  <h1 align="center"> <code>stripe-react-native</code> </h1>
</p>

本项目基于 [stripe-react-native](https://github.com/stripe/stripe-react-native) 开发。

该第三方库的仓库Github上，且支持直接从 npm 下载，新的包名为：@react-native-ohos/stripe-react-native 版本所属关系如下：

| 三方库名称    | 三方库版本（npm地址）    | 发布信息     | 支持RN版本    | Autolink     | 编译API版本     | 社区基线版本    |  源码地址   |
| ------------ | ------------ | ------------------------------ | ------------- | ------------- |------------------------ | ------------- | ------------- |
| @react-native-ohos/stripe-react-native | [~ 0.76.1](https://www.npmjs.com/package/@react-native-ohos/stripe-react-native) | [Github Releases](https://github.com/react-native-oh-library/stripe-react-native/releases) | 0.72.* / 0.77.* / 0.82.* / 0.84.* | 是 | API12+ | 0.76.0 | [master](https://github.com/react-native-oh-library/stripe-react-native/tree/master) |

## 简介

Stripe React Native SDK 用于在 React Native 应用中集成 Stripe 支付能力。<br/>
支持卡号安全输入（CardField / CardForm）、支付方式与令牌创建、PaymentIntent / SetupIntent 的确认与回读、PaymentSheet / CustomerSheet 收银台、3DS/SCA 认证等核心支付流程，并提供丰富的 Hooks（useStripe / usePaymentSheet 等）。<br/>
本鸿蒙适配版本的支付通道基于 publishable key 直调 Stripe REST API，卡号输入与收银台等 UI 组件使用 ArkUI 实现，JS API 与原库保持一致（import 时使用原库名 `@stripe/stripe-react-native`，由 RNOH alias 自动映射到 `@react-native-ohos/stripe-react-native`）。

## 下载安装

进入到工程目录并输入以下命令：

**npm**

```bash
npm install @react-native-ohos/stripe-react-native
```

**yarn**

```bash
yarn add @react-native-ohos/stripe-react-native
```

## 依赖关系说明

核心支付功能无额外鸿蒙侧依赖；如需使用 **Stripe Connect 嵌入组件**（ConnectComponentsProvider / ConnectAccountOnboarding / ConnectPayments 等），需额外引入鸿蒙化 react-native-webview，版本对应关系如下：

| RN 框架版本 | 鸿蒙化依赖库 | 支持版本范围 |
| --- | --- | --- |
| 0.72 | [@react-native-ohos/react-native-webview](https://gitcode.com/CPF-RN/usage-docs/blob/master/zh-cn/react-native-webview.md) | >=13.10.5 |

本库 Connect 嵌入组件经 react-native-webview（ArkWeb）承载，如已在鸿蒙应用工程中引入，可跳过本章节步骤，直接使用。

> [!TIP] 请确保引入的三方库版本与应用工程的 RN 框架版本匹配，不匹配的版本可能导致编译或运行异常。更多版本信息可通过 [RNOH 三方库总览](https://gitcode.com/CPF-RN/usage-docs/blob/master/zh-cn/README.md#rnoh-%E4%B8%89%E6%96%B9%E5%BA%93%E6%80%BB%E8%A7%88)表格获取。

## Link

|                                      | 是否支持autolink | RN框架版本          |
|--------------------------------------|-----------------|---------------------|
| 0.76.1                               | Yes             | 0.72/0.77/0.82/0.84 |

使用AutoLink的工程需要根据该文档配置，Autolink框架指导文档：https://gitcode.com/CPF-RN/ohos_react_native/blob/master/docs/zh-cn/Autolinking.md

如您使用的版本支持 Autolink，并且工程已接入 Autolink，可跳过ManualLink配置。
<details>
  <summary>ManualLink: 此步骤为手动配置原生依赖项的指导</summary>

首先需要使用 DevEco Studio 打开项目里的 HarmonyOS 工程 `harmony`。

> **说明**：本模块需要同时在 C++ 侧和 ETS 侧注册 Package。

### 1. Overrides RN SDK

为了让工程依赖同一个版本的 RN SDK，需要在工程根目录的 `oh-package.json5` 添加 overrides 字段，指向工程需要使用的 RN SDK 版本。替换的版本既可以是一个具体的版本号，也可以是一个模糊版本，还可以是本地存在的 HAR 包或源码目录。

关于该字段的作用请阅读[官方说明](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-oh-package-json5-V5#zh-cn_topic_0000001792256137_overrides)

```json
{
  "overrides": {
    "@rnoh/react-native-openharmony" : "~0.84.1" // ohpm 在线版本
    // "@rnoh/react-native-openharmony" : "./react_native_openharmony.har" // 指向本地 har 包的路径
    // "@rnoh/react-native-openharmony": "./react_native_openharmony" // 指向源码路径
  }
}
```

### 2. 引入原生端代码

目前有两种方法：

- 通过 har 包引入；
- 直接链接源码。

方法一：通过 har 包引入（推荐）

> [!TIP] har 包位于三方库安装路径的 `harmony` 文件夹下。

打开 `entry/oh-package.json5`，添加以下依赖

```json
"dependencies": {
    "@react-native-ohos/stripe-react-native": "file:../../node_modules/@react-native-ohos/stripe-react-native/harmony/stripe_react_native.har"
}
```

点击右上角的 `sync` 按钮

或者在命令行终端执行：

```bash
cd entry
ohpm install
```

方法二：直接链接源码

> [!TIP] 如需使用直接链接源码，请参考[直接链接源码说明](https://gitcode.com/CPF-RN/usage-docs/blob/master/zh-cn/link-source-code.md)

### 3. 配置 CMakeLists 和引入 StripeReactNativePackage

打开 `entry/src/main/cpp/CMakeLists.txt`，添加：

```diff
project(rnapp)
cmake_minimum_required(VERSION 3.4.1)
set(CMAKE_SKIP_BUILD_RPATH TRUE)
set(RNOH_APP_DIR "${CMAKE_CURRENT_SOURCE_DIR}")
set(NODE_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../node_modules")
+ set(OH_MODULES "${CMAKE_CURRENT_SOURCE_DIR}/../../../oh_modules")
set(RNOH_CPP_DIR "${CMAKE_CURRENT_SOURCE_DIR}/../../../../../../react-native-harmony/harmony/cpp")

add_subdirectory("${RNOH_CPP_DIR}" ./rn)

# RNOH_BEGIN: manual_package_linking_1
+ add_subdirectory("${OH_MODULES}/@react-native-ohos/stripe-react-native/src/main/cpp" ./stripe_react_native)
# RNOH_END: manual_package_linking_1

add_library(rnoh_app SHARED
    "./generated/RNOHAppNapiBridge.cpp"
    "./PackageProvider.cpp"
)
target_link_libraries(rnoh_app PUBLIC rnoh)

# RNOH_BEGIN: manual_package_linking_2
+ target_link_libraries(rnoh_app PUBLIC stripe_react_native)
# RNOH_END: manual_package_linking_2
```

打开 `entry/src/main/cpp/PackageProvider.cpp`，添加：

```diff
#include "RNOH/PackageProvider.h"
+ #include "StripeReactNativePackage.h"

using namespace rnoh;

std::vector<std::shared_ptr<Package>> PackageProvider::getPackages(Package::Context ctx) {
    return {
+     std::make_shared<StripeReactNativePackage>(ctx)
    };
}
```

### 4. 在 ArkTs 侧引入 StripeReactNativePackage

打开 `entry/src/main/ets/RNPackagesFactory.ts`，添加：

```diff
  ...
+ import { StripeReactNativePackage } from '@react-native-ohos/stripe-react-native/ts';

export function createRNPackages(ctx: RNPackageContext): RNPackage[] {
  return [
+    new StripeReactNativePackage(ctx)
  ];
}
```
</details>

### 运行

点击右上角的 `sync` 按钮

或者在命令行终端执行：

```bash
cd entry
ohpm install
```

然后编译、运行即可。

## 约束与限制

### 兼容性

本文档内容基于以下版本验证通过：

1. RNOH: 0.84.1; SDK: HarmonyOS 6.1.0 Release SDK; IDE: DevEco Studio 6.1.0.830; ROM: 6.0.0.130;

### 权限要求

- 使用 REST 支付通道需要申请网络权限（system_grant，无需动态申请）

  在`entry/src/main/module.json5`中添加

```json
requestPermissions: [
  {
    name: "ohos.permission.INTERNET",
  },
],
```

- 如需 3DS/SCA redirect 认证页与 Connect webview，宿主 `EntryAbility.onCreate` 需调用 `webview.WebviewController.initializeWebEngine()` 预初始化 ArkWeb 引擎（HarmonyOS 6.x ArkWeb 引擎不随首个 Web 组件自动初始化）：

```typescript
import { webview } from '@kit.ArkWeb';

webview.WebviewController.initializeWebEngine();
```

### 编译运行API要求

> [!TIP] 当前三方库所有版本均已实现版本隔离，支持在 `API12+` 工程编译，及 `API12+` ROM运行。

## 使用示例

下面的代码展示了这个库的基本使用场景：

> [!WARNING] 使用时 import 的库名不变。

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

## 使用说明

**初始化**
```tsx
// 方式一：根组件包裹 StripeProvider
<StripeProvider publishableKey="pk_test_..." urlScheme="stripe">
  <App />
</StripeProvider>

// 方式二：调用 initStripe
initStripe({ publishableKey: 'pk_test_...', urlScheme: 'stripe' });
```

**卡号收集（CardField）**
```tsx
<CardField
  postalCodeEnabled={true}
  cardStyle={{ borderWidth: 1, borderRadius: 8 }}
  style={{ width: '100%', height: 50 }}
  onCardChange={(cardDetails) => setCard(cardDetails)}
  onFocus={(focusedField) => console.log(focusedField)}
/>
```

**确认支付（confirmPayment / confirmSetupIntent）**
```tsx
const { confirmPayment } = useStripe();

const { error, paymentIntent } = await confirmPayment(clientSecret, {
  paymentMethodType: 'Card',
  paymentMethodData: { billingDetails: { email: 'email@stripe.com' } },
});
```

**收银台（PaymentSheet）**
```tsx
const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

await initPaymentSheet({
  merchantDisplayName: 'Merchant, Inc.',
  paymentIntentClientSecret: clientSecret,
});
const { error } = await presentPaymentSheet();
```

## 接口说明

> [!TIP] "Platform"列表示该属性在原三方库上支持的平台。

> [!TIP] "OpenHarmony Support"列为 yes 表示 OpenHarmony平台支持 该属性；no 则表示不支持；partially 表示部分支持。使用方法跨平台一致，效果对标 iOS 或 Android 的效果。

### 组件
| 名称       | 参数类型     | 必填  | 平台  | OpenHarmony平台支持| 描述 |
|------------|------------|----------------------|------|-----|----------------|
| StripeProvider | [StripeProviderProps](#stripeproviderprops) | yes  | all | yes | SDK 初始化容器组件（publishableKey / urlScheme 等） |
| CardField | [CardFieldProps](#cardfieldprops) | yes  | all | yes | 卡号安全输入组件（focus/blur/clear 命令 + onCardChange/onFocus 事件） |
| CardForm | [CardFormProps](#cardformprops) | yes  | all | partially | 完整卡表单组件（focus/blur 命令 + onFormComplete 事件；defaultValues/preferredNetworks 未生效，cardStyle 10 项中 3 项未生效） |
| AuBECSDebitForm | [AuBECSDebitFormProps](#aubecsdebitformprops) | yes  | all | yes | 澳洲借记表单（onComplete 事件） |
| AddressSheet | [AddressSheetProps](#addresssheetprops) | yes  | all | partially | 地址表单（onSubmit/onError 事件；核心收集流程可用，appearance 等高级参数未生效） |
| StripeContainer | [StripeContainerProps](#stripecontainerprops) | yes  | all | yes | 组件容器（keyboardShouldPersistTaps） |
| CustomerSheet | [CustomerSheetProps](#customersheetprops) | yes  | all | partially | 客户支付方式管理页（自绘 + CustomerAdapter 事件往返；仅列表/选择核心流程，样式与预填参数不生效） |
| PlatformPayButton | [PlatformPayButtonProps](#platformpaybuttonprops) | yes  | all | partially | 渲染降级占位按钮，点击触发原生 notSupported |
| AddToWalletButton | [AddToWalletButtonProps](#addtowalletbuttonprops) | yes  | iOS, Android | no | 占位视图 + 结构化错误事件（本版本 JS 未单独导出 ApplePayButton / GooglePayButton，钱包按钮统一使用 PlatformPayButton） |
| NavigationBar | [NavigationBarProps](#navigationbarprops) | yes  | all | yes | Connect 导航栏（title + ✕ 关闭按钮，onCloseButtonPress 已接线） |
| PaymentMethodMessagingElement | [PaymentMethodMessagingElementProps](#paymentmethodmessagingelementprops) | yes  | all | no | 空视图占位，不触发 onStateChange 状态事件 |
| EmbeddedPaymentElementView | 各自 configuration | yes  | all | no | 空视图占位（发 loadingFailed 等生命周期事件可感知降级；JS 侧未随本版本导出该组件） |
| CheckoutPaymentElementView | CheckoutPaymentElementViewProps | yes  | all | no | Checkout（Private Preview），JS 层直接抛错（非空视图占位） |
| Connect JS 组件（ConnectComponentsProvider / ConnectAccountOnboarding / ConnectPayments / ConnectPayouts / ConnectPaymentDetails） | [Connect 组件属性](#connect-组件通用属性) | yes  | all | partially | 经 @react-native-ohos/react-native-webview 承载；harmony 端已内置 `injectedObjectJson` 垫片与 BackHandler 返回键拦截 |

### 属性

#### StripeProviderProps

| 名称 | 参数类型 | 默认值 | 必填 | 平台 | HarmonyOS平台支持 | 描述 |
|------|----------|--------|------|------|------------------|------|
| publishableKey | string | None | Yes | All | Yes | 发布密钥（pk_ 开头） |
| stripeAccountId | string | None | No | All | Yes | Connect 子账号 ID，REST 请求以 Stripe-Account 头携带 |
| threeDSecureParams | ThreeDSecure.ConfigurationParams | None | No | iOS | No | iOS 专属 3DS UI 定制；鸿蒙 3DS 走 ArkWeb 页面 |
| merchantIdentifier | string | None | No | iOS | No | Apple Pay 商户标识（鸿蒙无 Apple Pay 通道） |
| urlScheme | string | None | No | iOS | Yes | App 自定义 scheme，3DS/SCA 认证完成后回跳使用 |
| setReturnUrlSchemeOnAndroid | boolean | false | No | Android | No | Android 专属行为 |
| children | ReactElement | None | Yes | All | Yes | 子组件 |

#### CardFieldProps

| 名称                           | 参数类型          | 默认值       | 必填            | 平台   | HarmonyOS平台支持    | 描述 |
|------------------------------|--------------------|------------|---------------|------|------------------|---------------|
| style                        | StyleProp&lt;ViewStyle&gt; | None | No            | All  | Yes              | 组件样式（宽高等）|
| postalCodeEnabled            | boolean            | true       | No            | All  | Yes              | 是否显示邮编输入项（鸿蒙端为通用邮编输入，不随国家切换格式） |
| countryCode                  | string             | 设备默认 locale | No         | All  | No               | 控制显示的邮编输入类型；鸿蒙未实现分国家邮编格式，传入被忽略 |
| disabled                     | boolean            | false      | No            | All  | Yes              | 禁用用户输入 |
| cardStyle                    | CardFieldInput.Styles | None    | No            | All  | Yes              | 输入框样式，10 项中 9 项生效（fontFamily 未生效）：backgroundColor/borderColor/borderWidth/borderRadius/cursorColor/fontSize/placeholderColor/textColor/textErrorColor |
| placeholders                 | CardFieldInput.Placeholders | None | No       | All  | Yes              | 输入框占位文案（number/expiration/cvc/postalCode） |
| autofocus                    | boolean            | false      | No            | All  | Yes              | 挂载时自动聚焦 |
| preferredNetworks            | Array&lt;CardBrand&gt; | None  | No            | iOS  | No               | 联名卡优先网络（iOS 专属，鸿蒙未实现） |
| onBehalfOf                   | string             | None       | No            | iOS  | No               | 资金预期接收账户（iOS 专属，鸿蒙未实现） |
| onCardChange                 | callback           | None       | No            | All  | Yes              | 卡信息变化回调（brand（单数）、last4、expiryMonth/Year、complete、valid* 等） |
| onFocus / onBlur             | callback           | None       | No            | All  | Yes              | 聚焦/失焦回调 |
| dangerouslyGetFullCardDetails | boolean           | false      | No            | All  | Yes              | 警告：返回完整卡号，需满足 PCI 合规要求 |
| testID                       | string             | None       | No            | All  | Yes              | 测试标识 |

#### CardFormProps

| 名称 | 参数类型 | 默认值 | 必填 | 平台 | HarmonyOS平台支持 | 描述 |
|------|----------|--------|------|------|------------------|------|
| style | StyleProp&lt;ViewStyle&gt; | None | No | All | Yes | 组件样式 |
| autofocus | boolean | false | No | All | Yes | 挂载时自动聚焦 |
| disabled | boolean | false | No | All | Yes | 禁用用户输入 |
| cardStyle | CardFormView.Styles | None | No | All | partially | 表单样式，10 项中 7 项生效（borderWidth/textErrorColor/fontFamily 未生效）：backgroundColor/borderColor/borderRadius/cursorColor/fontSize/placeholderColor/textColor |
| placeholders | CardFormView.Placeholders | None | No | Android | Yes | 输入框占位文案（原库 Android 专属，鸿蒙自绘支持） |
| defaultValues | CardFormView.DefaultValues | None | No | Android | No | 预填默认国家（原库 Android 专属，鸿蒙未实现） |
| preferredNetworks | Array&lt;CardBrand&gt; | None | No | iOS | No | 联名卡优先网络（iOS 专属，鸿蒙未实现） |
| onFormComplete | callback | None | No | All | Yes | 表单完成回调（CardFormView.Details） |
| dangerouslyGetFullCardDetails | boolean | false | No | All | Yes | 警告：返回完整卡号，需满足 PCI 合规要求 |
| testID | string | None | No | All | Yes | 测试标识 |

#### AuBECSDebitFormProps

| 名称 | 参数类型 | 默认值 | 必填 | 平台 | HarmonyOS平台支持 | 描述 |
|------|----------|--------|------|------|------------------|------|
| companyName | string | None | Yes | All | Yes | 表单展示的公司名 |
| onComplete | callback | None | Yes | All | Yes | 表单完成回调（bsbNumber/accountNumber/name/email） |
| formStyle | AuBECSDebitFormComponent.Styles | None | No | All | partially | 表单样式，8 项中仅 3 项生效（textColor/backgroundColor/fontSize）；borderWidth/borderColor/borderRadius（固定 8）/placeholderColor/textErrorColor 未生效，占位文案固定中文（姓名/邮箱/BSB/账号） |
| style | StyleProp&lt;ViewStyle&gt; | None | No | All | Yes | 组件样式 |
| testID | string | None | No | All | Yes | 测试标识 |

#### AddressSheetProps

| 名称 | 参数类型 | 默认值 | 必填 | 平台 | HarmonyOS平台支持 | 描述 |
|------|----------|--------|------|------|------------------|------|
| visible | boolean | false | Yes | All | Yes | 是否显示地址表单 |
| presentationStyle | string | popover | No | iOS | No | 弹出样式（iOS 专属） |
| animationStyle | string | None | No | iOS | No | 动画样式（iOS 专属） |
| appearance | PaymentSheet.AppearanceParams | None | No | All | No | 主题外观配置（ArkUI 自绘未实现） |
| defaultValues | AddressDetails | None | No | All | Yes | 预填字段（name/phone + address 的 line1/line2/city/state/postalCode/country 全量预填；isCheckboxSelected 不支持预填，提交恒为 false） |
| additionalFields | object | None | No | All | No | 附加字段（电话必填性/复选框文案），自绘未实现 |
| allowedCountries | Array&lt;string&gt; | 全部国家 | No | All | No | 可选国家白名单，自绘未实现 |
| autocompleteCountries | Array&lt;string&gt; | 默认审计名单 | No | All | No | 地址自动补全国家，自绘未实现 |
| primaryButtonTitle | string | 保存地址 | No | All | Yes | 底部主按钮文案（鸿蒙默认中文「保存地址」，原库默认 "Save Address"） |
| sheetTitle | string | 地址 | No | All | Yes | 表单标题（鸿蒙默认中文「地址」，原库默认 "Address"） |
| googlePlacesApiKey | string | None | No | Android | No | Google Places 自动补全密钥（依赖 Google 服务，鸿蒙不可用） |
| onSubmit | callback | None | Yes | All | Yes | 提交回调（CollectAddressResult） |
| onError | callback | None | Yes | All | Yes | 关闭/出错回调（StripeError&lt;AddressSheetError&gt;） |

#### StripeContainerProps

| 名称 | 参数类型 | 默认值 | 必填 | 平台 | HarmonyOS平台支持 | 描述 |
|------|----------|--------|------|------|------------------|------|
| children | ReactElement | None | Yes | All | Yes | 子组件（CardField 等） |
| keyboardShouldPersistTaps | boolean | None | No | All | Yes | 键盘弹出时是否可点击（视图 spec 类型为 boolean） |
| style | StyleProp&lt;ViewStyle&gt; | None | No | All | Yes | 容器样式 |
| testID | string | None | No | All | Yes | 测试标识 |

#### PlatformPayButtonProps

| 名称 | 参数类型 | 默认值 | 必填 | 平台 | HarmonyOS平台支持 | 描述 |
|------|----------|--------|------|------|------------------|------|
| type | PlatformPay.ButtonType | PlatformPay.ButtonType.Plain | No | All | Yes | 按钮文案类型（降级占位按钮生效） |
| appearance | PlatformPay.ButtonStyle | ButtonStyle.Automatic | No | All | Yes | 按钮配色（降级样式生效） |
| borderRadius | number | None | No | All | Yes | 按钮圆角 |
| onPress | callback | None | Yes | All | Yes | 点击回调 |
| disabled | boolean | false | No | All | Yes | 禁用按钮 |
| onShippingMethodSelected | callback | None | No | iOS | No | Apple Pay 运费选择回调（无平台钱包 sheet，不会触发） |
| onShippingContactSelected | callback | None | No | iOS | No | Apple Pay 收货地址回调（不会触发） |
| onCouponCodeEntered | callback | None | No | iOS | No | Apple Pay 优惠码回调（不会触发） |
| setOrderTracking | callback | None | No | iOS | No | Apple Pay 订单跟踪回调（不会触发） |
| testID | string | None | No | All | Yes | 测试标识 |
| style | StyleProp&lt;ViewStyle&gt; | None | No | All | Yes | 按钮容器样式 |

#### AddToWalletButtonProps

| 名称 | 参数类型 | 默认值 | 必填 | 平台 | HarmonyOS平台支持 | 描述 |
|------|----------|--------|------|------|------------------|------|
| style | StyleProp&lt;ViewStyle&gt; | None | No | All | Yes | 占位视图尺寸样式 |
| iOSButtonStyle | string | None | No | iOS | No | Apple Wallet 按钮样式（占位忽略） |
| androidAssetSource | ImageSourcePropType | None | Yes | Android | No | Google Pay 按钮图（必填，占位忽略） |
| testEnv | boolean | false | No | iOS | No | TestFlight/沙箱标记（占位忽略） |
| cardDetails | object | None | Yes | All | No | 待添加卡的详情（必填，占位忽略） |
| token | GooglePayCardToken / null | None | No | Android | No | Google Pay 黄路径令牌（占位忽略） |
| isBounceProvisioned | boolean | false | No | Android | No | 弹跳式开卡标记（占位忽略） |
| ephemeralKey | object | None | Yes | All | No | 开卡临时密钥（必填，占位忽略） |
| onComplete | callback | None | Yes | All | Yes | 流程结束回调（鸿蒙返回结构化错误事件） |
| testID | string | None | No | All | Yes | 测试标识 |

#### CustomerSheetProps

组件形态（`visible` 传 true 时自动执行 initialize + present，结果经 onResult 回传）：

| 名称 | 参数类型 | 默认值 | 必填 | 平台 | HarmonyOS平台支持 | 描述 |
|------|----------|--------|------|------|------------------|------|
| visible | boolean | false | Yes | All | Yes | 是否拉起 CustomerSheet |
| onResult | callback | None | Yes | All | Yes | 提交/关闭/出错统一回调（CustomerSheetResult） |
| 初始化参数（二选一） | CustomerAdapterInitParams 或 CustomerSessionInitParams | None | Yes | All | partially | 路径一：customerId + customerEphemeralKeySecret + customerAdapter 事件往返生效（setupIntentClientSecret 透传但原生未消费）；路径二：intentConfiguration + clientSecretProvider 原生未接入 |
| merchantDisplayName / style / appearance / headerTextForSelectionScreen | 各自类型 | None | No | All | No | 均未生效：自绘页标题固定为「支付方式」，merchantDisplayName 仅存储不展示，style/appearance/headerTextForSelectionScreen 原生未读取 |
| defaultBillingDetails | BillingDetails | None | No | All | No | 预填账单信息（原生未消费） |
| billingDetailsCollectionConfiguration | BillingDetailsCollectionConfiguration | AUTOMATIC | No | All | No | 账单字段收集策略（原生未消费） |
| returnURL | string | None | No | All | Yes | 3DS 等 Web 认证回跳地址 |
| applePayEnabled / googlePayEnabled | boolean | false | No | iOS / Android | No | 平台钱包开关（鸿蒙无对应通道） |
| preferredNetworks | Array&lt;CardBrand&gt; | None | No | iOS | No | 联名卡优先网络 |
| removeSavedPaymentMethodMessage | string | None | No | iOS | No | 删除保存支付方式提示（iOS 专属） |
| allowsRemovalOfLastSavedPaymentMethod | boolean | true | No | All | No | 是否允许删除最后一张保存的支付方式（原生未消费，自绘无删除入口） |
| cardBrandAcceptance | PaymentSheet.CardBrandAcceptance | 全部支持 | No | All | No | 卡品牌过滤（原生未消费，自绘无品牌过滤逻辑） |
| opensCardScannerAutomatically | boolean | false | No | iOS | No | 自动打开扫卡器（iOS 专属） |
| presentationStyle / animationStyle / timeout | 各自类型 | None | No | iOS / All | No | present 参数（iOS 专属/自绘忽略） |

#### PaymentSheet.SetupParams（initPaymentSheet 参数）

自绘收银台实现「卡输入 → 创建支付方式 → 确认 → 3DS redirect」核心流程，参数逐项标注实际生效情况：

| 名称 | 参数类型 | 默认值 | 必填 | 平台 | HarmonyOS平台支持 | 描述 |
|------|----------|--------|------|------|------------------|------|
| paymentIntentClientSecret | string | None | 三选一 | All | Yes | PaymentIntent client secret（默认流确认 + 金额预取展示） |
| setupIntentClientSecret | string | None | 三选一 | All | Yes | SetupIntent client secret（默认流确认） |
| intentConfiguration | PaymentSheet.IntentConfiguration | None | 三选一 | All | Yes | 现代流配置；confirmHandler / confirmationTokenConfirmHandler 经事件往返，mode 金额用于展示，存在该字段即按 customFlow 处理 |
| customerEphemeralKeySecret / customerSessionClientSecret | string | None | No | All | No | 保存支付方式访问密钥；自绘收银台未接入已保存支付方式列表，参数存储未消费 |
| merchantDisplayName | string | None | Yes | All | Yes | 收银台标题（自绘页顶栏展示） |
| customerId | string | None | No | All | No | 客户 ID（存储未消费） |
| customFlow | boolean | false | No | All | Yes | 选择/确认两步分离，需自行调用 confirmPaymentSheetPayment |
| applePay | ApplePayParams | None | No | iOS | No | 收银台内 Apple Pay（鸿蒙无通道，忽略） |
| googlePay | GooglePayParams | None | No | Android | No | 收银台内 Google Pay（鸿蒙无通道，忽略） |
| link | LinkParams | None | No | All | No | Link 配置（Private Preview，忽略） |
| style | UserInterfaceStyle | automatic | No | All | No | 明暗主题（自绘未消费） |
| returnURL | string | None | No | All | Yes | 3DS/SCA Web 认证完成后的回跳地址（PaymentSheet / CustomerSheet 均生效） |
| billingDetailsCollectionConfiguration | BillingDetailsCollectionConfiguration | AUTOMATIC | No | All | No | 账单字段收集策略（存储未消费） |
| defaultBillingDetails | BillingDetails | None | No | All | No | 预填账单信息（存储未消费） |
| defaultShippingDetails | AddressDetails | None | No | All | No | 预填收货信息（忽略） |
| allowsDelayedPaymentMethods | boolean | false | No | All | No | 允许延迟结算支付方式（存储未消费） |
| appearance | PaymentSheet.AppearanceParams | None | No | All | No | 主题外观（自绘收银台未实现，见遗留问题） |
| primaryButtonLabel | string | None | No | All | Yes | 底部主按钮文案 |
| removeSavedPaymentMethodMessage | string | None | No | iOS | No | 删除保存支付方式提示（忽略） |
| preferredNetworks | Array&lt;CardBrand&gt; | None | No | iOS | No | 联名卡优先网络（忽略） |
| paymentMethodOrder | Array&lt;string&gt; | None | No | All | No | 支付方式排序（自绘仅卡输入，忽略） |
| allowsRemovalOfLastSavedPaymentMethod | boolean | true | No | All | No | 删除最后一张保存卡（无已保存列表，忽略） |
| paymentMethodLayout | PaymentSheet.PaymentMethodLayout | Automatic | No | All | No | 支付方式布局（忽略） |
| cardBrandAcceptance | PaymentSheet.CardBrandAcceptance | 全部支持 | No | All | No | 卡品牌过滤（忽略） |
| cardFundingFiltering | PaymentSheet.CardFundingFiltering | None | No | All | No | 卡资金类型过滤（Private Preview，忽略） |
| customPaymentMethodConfiguration | PaymentSheet.CustomPaymentMethodConfiguration | None | No | All | No | 自定义支付方式；JS 侧注册回调，自绘收银台不渲染 |
| opensCardScannerAutomatically | boolean | false | No | All | No | 自动打开扫卡器（忽略） |
| termsDisplay | { [paymentMethodType: string]: TermsDisplay } | AUTOMATIC | No | All | No | 条款展示策略（忽略） |

> presentPaymentSheet 的 PresentOptions（仅 `timeout` 可选）：自绘实现未读取，传入被忽略（customFlow 确认一律经 confirmPaymentSheetPayment）。

#### PaymentMethod 类型支持矩阵（createPaymentMethod / confirmPayment）

`PaymentMethod.CreateParams` 共 19 种 paymentMethodTypes，按原生 `buildPaymentMethodForm` 的实际处理逐项标注：Card 走专用通道；其余类型按「平铺字段透传」处理——仅 string/boolean/number 一级字段以 snake_case 提交到 REST，嵌套对象整体丢弃；`billingDetails`（含 address）全类型生效。

| 类型 | HarmonyOS支持 | 说明 |
|------|---------------|------|
| Card | Yes | 专用通道：token / cardFromSheet（CardField 实时快照）/ paymentMethodId + cvc，字段最全 |
| USBankAccount | Yes | accountNumber / routingNumber / accountHolderType / accountType 平铺透传 |
| SepaDebit | Yes | iban 平铺透传 |
| Fpx | Yes | testOfflineBank 平铺透传 |
| Alipay / Oxxo / Multibanco / GrabPay / Bancontact / Eps / P24 / PayPal / CashApp | Yes | 无额外专属字段（或仅平铺字段），配合 billingDetails 可用 |
| Ideal | partially | bankName 映射为 ideal[bank_name]，Stripe 期望 ideal[bank]；不传 bankName 仍可用（跳转页选行） |
| AfterpayClearpay / Klarna / Affirm | partially | shippingDetails 为嵌套对象被丢弃，收货信息需服务端在 PaymentIntent 上预设 |
| AuBecsDebit | No | formDetails 为嵌套对象整体丢弃，缺少 BSB/账号无法创建支付方式 |
| WeChatPay | - | 原库 TS 类型已将其注释移出联合类型（PaymentMethod.ts），无法经类型创建 |

#### PaymentMethodMessagingElementProps

| 名称 | 参数类型 | 默认值 | 必填 | 平台 | HarmonyOS平台支持 | 描述 |
|------|----------|--------|------|------|------------------|------|
| configuration | PaymentMethodMessagingElementConfiguration | None | Yes | All | No | 必填配置（amount/currency/country/paymentMethodTypes 等），鸿蒙为空视图占位，参数不产生渲染 |
| appearance | PaymentMethodMessagingElementAppearance | None | No | All | No | 外观（字体/文字色/链接色/主题），空视图不生效 |
| onStateChange | callback | None | No | All | No | 状态回调（loaded/loadingFailed 等），空视图占位不触发事件 |

#### NavigationBarProps

| 名称 | 参数类型 | 默认值 | 必填 | 平台 | HarmonyOS平台支持 | 描述 |
|------|----------|--------|------|------|------------------|------|
| title | string | None | No | All | Yes | 导航栏标题 |
| onCloseButtonPress | callback | None | No | All | Yes | 关闭按钮回调（点击 ✕ 触发） |
| ViewProps 透传 | ViewProps | None | No | All | Yes | style 等透传属性 |

#### ConnectComponentsProviderProps（Connect 容器）

| 名称 | 参数类型 | 默认值 | 必填 | 平台 | HarmonyOS平台支持 | 描述 |
|------|----------|--------|------|------|------------------|------|
| connectInstance | StripeConnectInstance | None | Yes | All | Yes | loadConnectAndInitialize 返回的 Connect 实例（传入非实例直接抛错） |
| children | ReactNode | None | Yes | All | Yes | 子组件（ConnectPayments / ConnectPayouts 等） |

#### Connect 组件通用属性

ConnectAccountOnboarding / ConnectPayments / ConnectPayouts / ConnectPaymentDetails 共用的 CommonComponentProps：

| 名称 | 参数类型 | 默认值 | 必填 | 平台 | HarmonyOS平台支持 | 描述 |
|------|----------|--------|------|------|------------------|------|
| onLoaderStart | callback | None | No | All | Yes | 组件开始加载回调（webview 承载触发） |
| onLoadError | callback | None | No | All | Yes | 加载失败回调 |
| onPageDidLoad | callback | None | No | All | Yes | 页面加载完成回调 |
| style | StyleProp&lt;ViewStyle&gt; | None | No | All | Yes | 容器样式 |

ConnectAccountOnboarding 扩展属性：

| 名称 | 参数类型 | 默认值 | 必填 | 平台 | HarmonyOS平台支持 | 描述 |
|------|----------|--------|------|------|------------------|------|
| title | string | None | No | All | Yes | 导航栏标题 |
| onExit | callback | None | Yes | All | Yes | 关闭引导流程回调 |
| onStepChange | callback | None | No | All | Yes | 引导步骤变化回调 |
| recipientTermsOfServiceUrl / fullTermsOfServiceUrl / privacyPolicyUrl | string | None | No | All | Yes | 条款链接（透传 connect-js webview 生效） |
| collectionOptions | CollectionOptions | None | No | All | Yes | 收集字段配置（透传 connect-js webview 生效） |

ConnectPayments 扩展属性：defaultFilters（PaymentsListDefaultFilters，透传 webview 生效）；ConnectPaymentDetails 扩展属性：payment（必填，支付意图 ID）、onClose（必填，关闭回调）。

### API
| 名称     | 类型     | 参数类型 | 返回值 | 必填    | 平台 | OpenHarmony平台支持 | 描述  |
|--------|---------|-----|-------|-------|--------|-----|-----------------|
| initStripe / StripeProvider | function | publishableKey, urlScheme 等 | void | No | All | Yes | 初始化 SDK |
| Constants（getConstants） | function | / | API_VERSIONS + SYSTEM_INFO | No | All | Yes | SDK/系统信息常量 |
| initialise | function | InitialiseParams | Promise&lt;void&gt; | No | All | Yes（内部） | 配置 publishable key 的内部实现，经 initStripe / StripeProvider 调用，未在包入口公开导出（demo 中由二者覆盖） |
| createPaymentMethod | function | params, options | CreatePaymentMethodResult | No | All | Yes | 创建支付方式（REST /v1/payment_methods） |
| createToken | function | CreateParams（Card/BankAccount/Pii） | CreateTokenResult | No | All | Yes | 创建令牌（REST /v1/tokens） |
| createTokenForCVCUpdate | function | cvc: string | CreateTokenForCVCUpdateResult | No | All | Yes | CVC 更新令牌 |
| createRadarSession | function | / | CreateRadarSessionResult | No | All | partially | 创建 Radar 会话（/v1/radar_sessions 非公开端点，恒返回结构化 invalid_request_error，无法获得真实 rso id，见未实现功能表） |
| confirmPayment | function | clientSecret, params, options | ConfirmPaymentResult | No | All | Yes | 确认支付意图（含 3DS redirect） |
| confirmSetupIntent | function | clientSecret, params, options | ConfirmSetupIntentResult | No | All | Yes | 确认设置意图 |
| retrievePaymentIntent / retrieveSetupIntent | function | clientSecret | Retrieve*Result | No | All | Yes | 回读意图 |
| handleNextAction / handleNextActionForSetup | function | clientSecret, returnURL | HandleNextAction*Result | No | All | partially | redirect 型经 ArkWeb 完成；native-app 型无鸿蒙生态，按取消处理 |
| handleURLCallback | function | url: string | Promise&lt;boolean&gt; | No | All | Yes | stripe:// 回跳处理 |
| initPaymentSheet | function | SetupParams | InitPaymentSheetResult | No | All | Yes | 初始化支付页（自绘收银台，customFlow/intentConfiguration 均支持；参数逐项支持情况见 PaymentSheet.SetupParams 属性表） |
| presentPaymentSheet | function | PresentOptions | PresentPaymentSheetResult | No | All | partially | 拉起支付页；PresentOptions（仅 timeout 可选）自绘实现未读取，传入被忽略 |
| confirmPaymentSheetPayment | function | / | ConfirmPaymentSheetPaymentResult | No | All | Yes | customFlow 确认 |
| intentCreationCallback 等双向回调 ×3 | function | IntentCreationCallbackParams 等 | Promise&lt;void&gt; | No | All | Yes | customFlow 回传（事件往返） |
| resetPaymentSheetCustomer | function | / | Promise&lt;null&gt; | No | All | Yes | 重置客户状态 |
| initCustomerSheet / presentCustomerSheet | function | InitParams / PresentParams | CustomerSheetResult | No | All | Yes | 客户支付方式管理（自绘 + CustomerAdapter 事件往返；仅 customerId/customerEphemeralKeySecret/returnURL/customerAdapter 生效，详见 CustomerSheetProps 表） |
| retrieveCustomerSheetPaymentOptionSelection | function | / | CustomerSheetResult | No | All | partially | 无原生持久化，返回空选择 |
| customerAdapter*Callback ×6 / clientSecretProvider*Callback ×2 | function | 各自 payload | Promise&lt;void&gt; | No | All | Yes | 双向回调回传 |
| collectBankAccount | function | isPaymentIntent, clientSecret, params | Confirm*Result | No | All | partially | REST 直接建 PM 并确认；无托管 UI，账号由调用方传入 |
| verifyMicrodeposits | function | isPaymentIntent, clientSecret, params | Confirm*Result | No | All | Yes | 微存款验证 |
| openAuthenticatedWebView / presentExternalWebPage / authWebViewDeepLinkHandled | function | id/url 等 | 各自结果 | No | All | Yes（内部） | Web 认证/外部页（ArkWeb 承载）；内部接口，JS 侧无公开导出，不可直接调用（见下方重复说明行） |
| storeStripeConnectDeepLink / pollAndClearPendingStripeConnectUrls | function | url / / | void / string[] | No | All | Yes（内部） | Connect 深链存取（内部接口，JS 侧无公开导出） |
| downloadAndShareFile | function | url, filename | {success, error?} | No | All | Yes（内部） | 下载并分享文件（分享面板不可用时降级为仅下载；内部接口，JS 侧无公开导出） |
| isPlatformPaySupported | function | params | Promise&lt;boolean&gt; | No | All | No | 恒 false，鸿蒙无 Stripe 平台钱包 |
| createPlatformPayPaymentMethod / confirmPlatformPay（confirmPlatformPayPayment / confirmPlatformPaySetupIntent） | function | params, clientSecret | 结构化 notSupported | No | All | No | 平台钱包支付 |
| createPlatformPayToken | function | PlatformPay.PaymentMethodParams | 结构化 notSupported | No | All | No | 平台钱包令牌（鸿蒙降级） |
| openPlatformPaySetup（原生名 openApplePaySetup）/ canAddCardToWallet / isCardInWallet / updatePlatformPaySheet / dismissPlatformPay / configureOrderTracking | function | 各自参数 | false / 结构化 notSupported | No | All | No | 钱包管理（configureOrderTracking 经 PlatformPayButton 的 setOrderTracking / initPaymentSheet 的 orderTrackingCallback 触发） |
| collectFinancialConnectionsAccounts / collectBankAccountToken / setFinancialConnectionsForceNativeFlow | function | clientSecret, params | 结构化 notSupported | No | All | No | Financial Connections（闭源托管 OAuth 流无鸿蒙承载；setFinancialConnectionsForceNativeFlow 原生为静默 no-op，resolve 空值） |
| initLinkController / presentLinkController / confirmLinkControllerSetupIntent | function | params | 结构化 notSupported | No | All | No | Link（Private Preview） |
| createEmbeddedPaymentElement / confirmEmbeddedPaymentElement / updateEmbeddedPaymentElement / clearEmbeddedPaymentOption | function | intentConfig 等 | 结构化 notSupported | No | All | No | 嵌入式支付组件（原生方法降级 notSupported；JS 侧该组件与 Ref API 未随本版本导出，原生视图为空占位并发 loadingFailed 等事件可感知降级） |
| loadConnectAndInitialize（Connect） | function | publishableKey, StripeConnectInitParams | StripeConnectInstance | No | All | partially | Connect 嵌入组件初始化入口（返回实例传入 ConnectComponentsProvider；经 webview 承载，能力取决于 connect-js 兼容性） |
| createCheckout / useCheckout / CheckoutPaymentElementView | function / hook / 组件 | Checkout 参数 | JS 层直接抛错或结构化 error | No | All | No | Checkout（Private Preview），本版本 JS 层未内置原生支持，调用即抛错/返回 error |
| OnrampSdk 全部方法 | function | 各自参数 | 结构化 notSupported（isSamsungPaySupported→false） | No | All | No | Crypto Onramp |

### Hooks

| 名称 | 类型 | 参数/返回 | 平台 | OpenHarmony平台支持 | 描述 |
|------|------|-----------|------|---------------------|------|
| useStripe | hook | 返回上表全部 API 方法 | All | Yes | 核心 API Hook 封装 |
| usePaymentSheet | hook | initPaymentSheet / presentPaymentSheet / confirmPaymentSheetPayment / resetPaymentSheetCustomer + loading | All | Yes | 收银台 Hook |
| useConfirmPayment | hook | confirmPayment + loading | All | Yes | 确认支付 Hook |
| useConfirmSetupIntent | hook | confirmSetupIntent + loading | All | Yes | 确认设置意图 Hook |
| usePlatformPay | hook | 平台支付方法封装（isPlatformPaySupported / createPlatformPayPaymentMethod 等） | iOS, Android | No | 方法齐全但底层全部降级（false / notSupported） |
| useFinancialConnectionsSheet | hook | collectBankAccountToken / collectFinancialConnectionsAccounts + loading | iOS, Android | No | Financial Connections Hook（降级） |
| useOnramp | hook | OnrampSdk 全部方法封装（configure / hasLinkAccount / verifyIdentity / performCheckout 等） | iOS, Android | No | Crypto Onramp Hook（降级，isSamsungPaySupported→false） |
| useLinkController | hook | init / present / confirm + loading | iOS, Android | No | Link Hook（Private Preview，降级） |
| useCheckout | hook | Checkout Session 状态与控制器方法（reload / confirm 等） | All | No | Checkout Hook（Private Preview，返回结构化 error） |
| useEmbeddedPaymentElement | hook | 嵌入式支付元素（updateIntent / confirm / clearPaymentOption + 状态） | All | No | 嵌入式支付组件 Hook（JS 侧已导出；底层 createEmbeddedPaymentElement 等原生方法降级 notSupported，原生视图为空占位） |

### 未实现功能
| API / 属性 | 原因 |
|-----|------|
| Apple Pay / Google Pay / Push Provisioning 全组（含 PlatformPayButton 的 onShippingMethodSelected / onShippingContactSelected / onCouponCodeEntered / setOrderTracking 回调） | 鸿蒙 Wallet Kit 仅车钥匙/交通卡（且限中国大陆手机），IAP Kit 为华为收银台，均非 Stripe 通道；返回结构化 notSupported 或 false，钱包 sheet 回调永不触发 |
| Financial Connections | 闭源 SDK 深度集成的 OAuth 托管流，Stripe 未开放鸿蒙承载 |
| Crypto Onramp（OnrampSdk） | 闭源构建变体（Android 需 StripeSdk_includeOnramp=true），无鸿蒙版本 |
| createRadarSession 真实会话 | Stripe /v1/radar_sessions 非公开 REST 端点（原 SDK 经闭源风控/设备指纹通道获取），pk 直调恒返回 Unrecognized request URL 结构化错误（已实测两种鉴权形式均被拒） |
| LinkController / Checkout（createCheckout / useCheckout / CheckoutPaymentElementView） | 官方 Private Preview，无公开 API 面；JS 层调用直接抛错或返回结构化 error |
| EmbeddedPaymentElement / PaymentMethodMessagingElement 原生视图 | 闭源 Compose 嵌入组件；空视图占位（PMME 不触发 onStateChange），EmbeddedPaymentElement 发 loadingFailed 等生命周期事件可感知降级 |
| CardField 的 preferredNetworks / onBehalfOf / countryCode | 原库 iOS 专属行为（联名卡网络选择 / 分国家邮编格式），ArkUI 自绘未实现，传入被忽略 |
| CardForm 的 defaultValues / preferredNetworks | 原库 Android/iOS 专属预填与网络选择，自绘未实现 |
| 样式/预填字段级缺口：CardField cardStyle 的 fontFamily；CardForm cardStyle 的 borderWidth / textErrorColor / fontFamily；AuBECSDebitForm formStyle 的 borderWidth / borderColor / borderRadius / placeholderColor / textErrorColor（占位文案硬编码中文「姓名/邮箱/BSB/账号」，圆角固定 8）；AddressSheet defaultValues 的 isCheckboxSelected（不支持预填，提交恒为 false） | ArkUI 自绘组件为简化实现：样式仅映射常用字段，预填仅映射核心字段（AddressSheet defaultValues 其余字段均已预填） |
| AddressSheet 的 appearance / additionalFields / allowedCountries / autocompleteCountries / googlePlacesApiKey / presentationStyle / animationStyle | ArkUI 自绘为简化表单，未实现主题与高级字段配置；自动补全依赖 Google Places 服务，鸿蒙无对应服务 |
| CustomerSheet 的 appearance / style / merchantDisplayName 展示 / headerTextForSelectionScreen / defaultBillingDetails / billingDetailsCollectionConfiguration / allowsRemovalOfLastSavedPaymentMethod / cardBrandAcceptance / setupIntentClientSecret / applePayEnabled / googlePayEnabled / preferredNetworks / opensCardScannerAutomatically / removeSavedPaymentMethodMessage 及 present 的 presentationStyle / animationStyle / timeout | 自绘实现仅覆盖已保存支付方式列表展示/选择核心流程；样式、预填与过滤类参数均未消费；平台钱包无鸿蒙通道 |
| PaymentSheet（initPaymentSheet）的未消费参数：customerId / customerEphemeralKeySecret / customerSessionClientSecret / style / appearance / billingDetailsCollectionConfiguration / defaultBillingDetails / defaultShippingDetails / allowsDelayedPaymentMethods / applePay / googlePay / link / removeSavedPaymentMethodMessage / preferredNetworks / paymentMethodOrder / allowsRemovalOfLastSavedPaymentMethod / paymentMethodLayout / cardBrandAcceptance / cardFundingFiltering / customPaymentMethodConfiguration / opensCardScannerAutomatically / termsDisplay，及 presentPaymentSheet 的 PresentOptions（仅 timeout 可选） | 自绘收银台仅实现卡输入核心流程，未接入已保存支付方式列表与主题配置；平台钱包无鸿蒙通道 |
| 非完整支持的支付方式类型：Ideal（bankName 映射为 ideal[bank_name]，与 Stripe 期望的 ideal[bank] 不一致，不传可用）；AfterpayClearpay / Klarna / Affirm（shippingDetails 嵌套对象被丢弃，收货信息需服务端在 PaymentIntent 预设）；AuBecsDebit（formDetails 嵌套对象整体丢弃，AuBECSDebitForm 组件可采集表单但 createPaymentMethod 无法提交）；WeChatPay（原库已移出 TS 联合类型，无法经类型创建） | 原生对非 Card 类型按「平铺字段透传」实现：仅一级 string/boolean/number 字段以 snake_case 提交 REST，嵌套对象整体丢弃；逐项见 PaymentMethod 类型支持矩阵 |
| StripeProvider 的 threeDSecureParams / merchantIdentifier / setReturnUrlSchemeOnAndroid | iOS/Android 专属配置；鸿蒙 3DS 走 ArkWeb 通用页面，无 Apple Pay 标识需求 |

## 遗留问题

- 平台钱包 / Financial Connections / Onramp / Link / 嵌入式原生组件为明确降级（结构化 notSupported，见上表），非待办事项——鸿蒙无对应系统服务或闭源 SDK 无鸿蒙版本。
- `PaymentSheet`/`CustomerSheet` 为 ArkUI 自绘近似实现，非闭源原生 UI 像素级复刻；PaymentSheet.SetupParams 中仅核心流程字段生效（intent 密钥 / merchantDisplayName / customFlow / primaryButtonLabel / intentConfiguration / returnURL），appearance 等样式与高级配置字段存储未消费或被忽略，逐项标注见 PaymentSheet.SetupParams 属性表。
- `handleNextAction` / `handleNextActionForSetup` 为 partially：redirect 型 next_action 经 ArkWeb 完成认证；native-app 型 next_action 无鸿蒙钱包生态，按用户取消（cancel）处理返回。
- `retrieveCustomerSheetPaymentOptionSelection` 为 partially：无原生持久化存储，多次进入返回空选择而非上次选择。
- `collectBankAccountForPayment` / `collectBankAccountForSetup` 为 partially：无 Stripe 托管收集 UI，由 REST 直接创建 US Bank Account 支付方式并确认，账号信息需调用方传入。
- `PlatformPayButton` 为 partially：渲染降级占位按钮（type/appearance/borderRadius/onPress/disabled 生效），点击不拉起任何钱包。
- Connect 嵌入组件为 partially：经 react-native-webview（ArkWeb）承载 connect-js 页面，能力取决于 connect-js 兼容性；需额外引入鸿蒙化 react-native-webview。
- 非 Card 支付方式走「平铺字段透传」通道：嵌套对象（shippingDetails / formDetails 等）在原生层被整体丢弃，Ideal 的 bankName 参数名与 Stripe 期望不一致——类型级差异逐项见 PaymentMethod 类型支持矩阵。

## 其他

**快速验证（运行 Example）**

前置条件：

| 依赖 | 版本要求 |
|------|----------|
| Node.js | >= 18 |
| DevEco Studio | 5.0+ / 6.0+ |
| HarmonyOS SDK | API 12+ |

### 1. 准备 JS 侧

```bash
# 克隆仓库并安装依赖、打包
git clone <仓库地址>
cd <仓库目录>
npm install --legacy-peer-deps
npm pack           # 生成 tgz 包（会自动触发 prepare 构建 JS 产物）

# 进入 example 目录，安装依赖
cd example
npm install --legacy-peer-deps

# 生成 JS Bundle（产物：harmony/entry/src/main/resources/rawfile/bundle.harmony.js）
npm run dev
```

开发阶段也可改用 Metro 热加载：在 `example` 目录执行 `npm start`，无需每次重新打 bundle。

### 2. 准备鸿蒙侧

```bash
cd example/harmony
ohpm install --all   # 安装 har 依赖（DevEco Studio 打开工程 Sync 时会自动执行）
```

### 3. 编译运行

**方式一：DevEco Studio（推荐）**

用 DevEco Studio 打开 `example/harmony` 目录，等待 Sync 完成后点击运行按钮，将 HAP 安装到设备/模拟器。

**方式二：命令行**

```bash
cd example/harmony
hvigorw --mode module -p product=default -p buildMode=debug assembleHap --no-daemon
# 产物：entry/build/default/outputs/default/entry-default-signed.hap

hdc install entry/build/default/outputs/default/entry-default-signed.hap
hdc shell aa start -a EntryAbility -b com.example.application
```

> [!TIP] `hvigorw`、`ohpm`、`hdc` 均在 DevEco Studio 安装目录下（`tools/hvigor/bin`、`tools/ohpm/bin`、`sdk/default/openharmony/toolchains`），不在 PATH 时需写全路径。

> [!TIP] Example 中已预置插件依赖和 Package 注册，无需手动配置 Link；debug 签名材料已配置在 `build-profile.json5`。

### 4. 修改库源码后更新 har

example 通过 `harmony/stripe_react_native.har` 引用本库（npm tgz 内携带同一份）。修改 `harmony/stripe_react_native` 源码后需重新生成并同步 har：

```bash
# 1. 重新构建 har（ArkTS 改动需先编译产物；C++/codegen 产物随源码打包）
# 2. 更新 tgz 并同步到 example
npm pack    # 在仓库根目录执行，重新生成 tgz
# 3. 将 harmony/stripe_react_native.har 拷贝至
#    example/node_modules/@react-native-ohos/stripe-react-native/harmony/
# 4. 重装鸿蒙侧依赖
cd example/harmony && ohpm install --all
```

> [!IMPORTANT]
> har 内必须包含 `src/main/cpp/`（CMakeLists.txt、StripeReactNativePackage.h、generated/）。C-API 架构下 CMake autolinking 依赖该目录，缺失时 `BuildNativeWithCmake` 阶段会报 `add_subdirectory ... which is not an existing directory`。
> rnoh-hvigor 插件在每次构建时会自动把 oh-package.json5 中的库依赖写回 har 路径，因此修复依赖问题应从 har 本身入手，而不是手改 oh-package.json5。

## 目录结构
````
/stripe-react-native      # 项目根目录
├── harmony               # 鸿蒙适配代码
│   ├── stripe_react_native.har   # har包
│   └── stripe_react_native       # 鸿蒙适配核心代码
│       ├── index.ets     # 鸿蒙适配代码入口
│       └── src/main/ets  # ArkTS 适配层
│           ├── api       # REST API 通道
│           ├── card      # 卡数据管理（CardFieldRegistry 等）
│           ├── components # ArkUI 组件（CardField/PaymentSheet 等）
│           ├── sheet     # 自绘收银台（PaymentSheet/CustomerSheet）
│           ├── web       # ArkWeb 承载（3DS 认证页/Connect 垫片）
│           └── util      # 工具类
│       └── src/main/cpp  # C++ TurboModule 实现
├── src                   # RN代码
│   ├── index.tsx         # 入口文件
│   ├── components        # 组件（CardField/CardForm/StripeProvider 等）
│   ├── hooks             # hooks（useStripe/usePaymentSheet 等）
│   ├── functions.ts      # API 实现
│   ├── connect           # Connect 嵌入组件
│   ├── types             # 类型定义
│   └── specs             # TurboModule codegen specs
├── example               # 示例应用（含鸿蒙工程）
├── README.md             # 中文安装使用方法
└── LICENSE               # 开源协议
````

## 贡献代码

使用过程中发现任何问题都可以提交 [Issue](https://github.com/stripe/stripe-react-native/issues)，当然，也非常欢迎提交 PR。

## 开源协议

本项目基于 [MIT License](https://github.com/stripe/stripe-react-native/blob/main/LICENSE) ，请自由地享受和参与开源。
