> Document Template: v0.4.2

<p align="center">
  <h1 align="center"> <code>stripe-react-native</code> </h1>
</p>

This project is developed based on [stripe-react-native](https://github.com/stripe/stripe-react-native).

The repository of this third-party library is hosted on GitHub, and the package can be downloaded directly from npm. The new package name is @react-native-ohos/stripe-react-native. The version correspondence is as follows:

| Name | Version (npm Address) | Release Information | Supported RN Version | Autolink | Compile API Version | Community Baseline Version | Source Code Address |
| --------------| -------------- | ------------------------------ | ------------- | ------------- |------------------------ | ------------ | ------------- | 
| @react-native-ohos/stripe-react-native | [~ 0.76.1](https://www.npmjs.com/package/@react-native-ohos/stripe-react-native) | [Github Releases](https://github.com/react-native-oh-library/stripe-react-native/releases) | 0.72.* / 0.77.* / 0.82.* / 0.84.* | Yes | API12+ | 0.76.0 | [master](https://github.com/react-native-oh-library/stripe-react-native/tree/master) |

## Introduction

The Stripe React Native SDK integrates Stripe payment capabilities into React Native applications.<br/>
It covers core payment flows including secure card input (CardField / CardForm), payment method and token creation, PaymentIntent / SetupIntent confirmation and retrieval, PaymentSheet / CustomerSheet checkout, and 3DS/SCA authentication, and provides a rich set of Hooks (useStripe / usePaymentSheet, etc.).<br/>
In this OpenHarmony adaptation, the payment channel calls the Stripe REST API directly with the publishable key, UI components such as card input and checkout sheets are implemented in ArkUI, and the JS API stays consistent with the original library (import it under the original package name `@stripe/stripe-react-native`; the RNOH alias maps it to `@react-native-ohos/stripe-react-native` automatically).

## Installation

Go to the project directory and execute the following instruction:

**npm**

```bash
npm install @react-native-ohos/stripe-react-native
```

**yarn**

```bash
yarn add @react-native-ohos/stripe-react-native
```

## Dependency Notes

The core payment functionality has no additional OpenHarmony-side dependencies. To use the **Stripe Connect embedded components** (ConnectComponentsProvider / ConnectAccountOnboarding / ConnectPayments, etc.), you need to additionally integrate the OpenHarmony-adapted react-native-webview. The version mapping is as follows:

| RN Framework Version | Harmonized Dependency Library | Supported Version Range |
| --- | --- | --- |
| 0.72 | [@react-native-ohos/react-native-webview](https://gitcode.com/CPF-RN/usage-docs/blob/master/zh-cn/react-native-webview.md) | >=13.10.5 |

The Connect embedded components of this library are hosted by react-native-webview (ArkWeb). If it has already been integrated into your HarmonyOS application project, you may skip this section and use the library directly.

> [!TIP] Ensure that the third-party library versions match the RN framework version used in your project. Mismatched versions may cause compilation or runtime errors. For more version information, refer to the [RNOH Third-Party Libraries Overview](https://gitcode.com/CPF-RN/usage-docs/blob/master/zh-cn/README.md#rnoh-%E4%B8%89%E6%96%B9%E5%BA%93%E6%80%BB%E8%A7%88).

## Link

|                                      | Supported Autolink | Supported RN Version |
|--------------------------------------|--------------------|----------------------|
| 0.76.1                               | Yes                | 0.72/0.77/0.82/0.84 |

Projects using AutoLink need to be configured according to this document, AutoLink framework guide: https://gitcode.com/CPF-RN/ohos_react_native/blob/master/docs/zh-cn/Autolinking.md

If the version you are using supports Autolink and the project has integrated Autolink, you can skip the ManualLink configuration.

<details>
  <summary>ManualLink: This step provides guidance for manually configuring native dependencies.</summary>

First, use DevEco Studio to open the `harmony` HarmonyOS project in the project.

> [!NOTE] This module requires registering the Package on both the C++ side and the ETS side.

### 1. Overrides RN SDK

To ensure the project relies on the same version of the RN SDK, you need to add an `overrides` field in the project's root `oh-package.json5` file, specifying the RN SDK version to be used. The replacement version can be a specific version number, a semver range, or a locally available HAR package or source directory.

For more information about the purpose of this field, please refer to the [official documentation](https://developer.huawei.com/consumer/en/doc/harmonyos-guides-V5/ide-oh-package-json5-V5#en-us_topic_0000001792256137_overrides).

```json
{
  "overrides": {
    "@rnoh/react-native-openharmony" : "~0.84.1" // online ohpm version
    // "@rnoh/react-native-openharmony" : "./react_native_openharmony.har" // path to a local HAR package
    // "@rnoh/react-native-openharmony": "./react_native_openharmony" // path to the source code
  }
}
```

### 2. Introducing Native Code

Currently, two methods are available:

- Use the HAR file.
- Directly link to the source code.

Method 1 (recommended): Use the HAR file.

> [!TIP] The HAR file is stored in the `harmony` directory in the installation path of the third-party library.

Open `entry/oh-package.json5` file and add the following dependencies:

```json
"dependencies": {
    "@react-native-ohos/stripe-react-native": "file:../../node_modules/@react-native-ohos/stripe-react-native/harmony/stripe_react_native.har"
}
```

Click the `sync` button in the upper right corner.

Alternatively, run the following instruction on the terminal:

```bash
cd entry
ohpm install
```

Method 2: Directly link to the source code.

> [!TIP] For details, see [Directly Linking Source Code](https://gitcode.com/CPF-RN/usage-docs/blob/master/en/link-source-code.md).

### 3. Configuring CMakeLists and Introducing StripeReactNativePackage

Open `entry/src/main/cpp/CMakeLists.txt` and add the following code:

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

Open `entry/src/main/cpp/PackageProvider.cpp` and add the following code:

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

### 4. Introducing StripeReactNativePackage to ArkTS

Open `entry/src/main/ets/RNPackagesFactory.ts` and add:

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

### Running

Click the `sync` button in the upper right corner.

Alternatively, run the following instruction on the terminal:

```bash
cd entry
ohpm install
```

Then build and run the code.

## Constraints

### Compatibility

This document is verified based on the following versions:

1. RNOH: 0.84.1; SDK: HarmonyOS 6.1.0 Release SDK; IDE: DevEco Studio 6.1.0.830; ROM: 6.0.0.130;

### Permission Requirements

- Using the REST payment channel requires the network permission (system_grant, no dynamic request needed).

  Add the following in `entry/src/main/module.json5`:

```json
requestPermissions: [
  {
    name: "ohos.permission.INTERNET",
  },
],
```

- For the 3DS/SCA redirect authentication page and the Connect webview, the host `EntryAbility.onCreate` needs to call `webview.WebviewController.initializeWebEngine()` to pre-initialize the ArkWeb engine (on HarmonyOS 6.x, the ArkWeb engine is not initialized automatically with the first Web component):

```typescript
import { webview } from '@kit.ArkWeb';

webview.WebviewController.initializeWebEngine();
```

### API requirements

> [!TIP] All versions of the current third-party libraries have implemented version isolation, supporting compilation in `API12+` projects and execution on `API12+` ROMs.

## Example

The following code shows the basic usage scenario of this library:

> [!WARNING] The library name used in the import statement remains unchanged.

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

// Card details are held by the native CardField; confirmPayment confirms directly with the client secret:
await confirmPayment(clientSecret, {
  paymentMethodType: 'Card',
  paymentMethodData: { billingDetails: { email: 'email@stripe.com' } },
});
```

## How to Use
**Initialization**
```tsx
// Option 1: wrap the root component with StripeProvider
<StripeProvider publishableKey="pk_test_..." urlScheme="stripe">
  <App />
</StripeProvider>

// Option 2: call initStripe
initStripe({ publishableKey: 'pk_test_...', urlScheme: 'stripe' });
```

**Card input (CardField)**
```tsx
<CardField
  postalCodeEnabled={true}
  cardStyle={{ borderWidth: 1, borderRadius: 8 }}
  style={{ width: '100%', height: 50 }}
  onCardChange={(cardDetails) => setCard(cardDetails)}
  onFocus={(focusedField) => console.log(focusedField)}
/>
```

**Confirming a payment (confirmPayment / confirmSetupIntent)**
```tsx
const { confirmPayment } = useStripe();

const { error, paymentIntent } = await confirmPayment(clientSecret, {
  paymentMethodType: 'Card',
  paymentMethodData: { billingDetails: { email: 'email@stripe.com' } },
});
```

**Checkout (PaymentSheet)**
```tsx
const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

await initPaymentSheet({
  merchantDisplayName: 'Merchant, Inc.',
  paymentIntentClientSecret: clientSecret,
});
const { error } = await presentPaymentSheet();
```

## Available APIs

> [!TIP] The **Platform** column indicates the platform where the properties are supported in the original third-party library.

> [!TIP] If the value of **OpenHarmony Platform Support** is **yes**, it means that the OpenHarmony platform supports this property; **no** means the opposite; **partially** means some capabilities of this property are supported. The usage method is the same on different platforms and the effect is the same as that of iOS or Android.

### Components
| Name       | Parameter Type     | Required  | Platform  | OpenHarmony Platform Support | Description |
|------------|------------|----------------------|------|-----|----------------|
| StripeProvider | [StripeProviderProps](#stripeproviderprops) | yes  | all | yes | SDK initialization container component (publishableKey / urlScheme, etc.) |
| CardField | [CardFieldProps](#cardfieldprops) | yes  | all | yes | Secure card input component (focus/blur/clear commands + onCardChange/onFocus events) |
| CardForm | [CardFormProps](#cardformprops) | yes  | all | partially | Full card form component (focus/blur commands + onFormComplete event; defaultValues/preferredNetworks have no effect, and 3 of 10 cardStyle fields have no effect) |
| AuBECSDebitForm | [AuBECSDebitFormProps](#aubecsdebitformprops) | yes  | all | yes | AU BECS debit form (onComplete event) |
| AddressSheet | [AddressSheetProps](#addresssheetprops) | yes  | all | partially | Address form (onSubmit/onError events; core collection flow works, advanced params such as appearance have no effect) |
| StripeContainer | [StripeContainerProps](#stripecontainerprops) | yes  | all | yes | Component container (keyboardShouldPersistTaps) |
| CustomerSheet | [CustomerSheetProps](#customersheetprops) | yes  | all | partially | Customer payment method management page (custom-drawn + CustomerAdapter event round-trips; only the list/select core flow, style and prefill params have no effect) |
| PlatformPayButton | [PlatformPayButtonProps](#platformpaybuttonprops) | yes  | all | partially | Renders a degraded placeholder button; tapping it triggers a native notSupported error |
| AddToWalletButton | [AddToWalletButtonProps](#addtowalletbuttonprops) | yes  | iOS, Android | no | Placeholder views + structured error events (ApplePayButton / GooglePayButton are not exported separately in this version; use PlatformPayButton for wallet buttons) |
| NavigationBar | [NavigationBarProps](#navigationbarprops) | yes  | all | yes | Connect navigation bar (title + ✕ close button, onCloseButtonPress is wired) |
| PaymentMethodMessagingElement | [PaymentMethodMessagingElementProps](#paymentmethodmessagingelementprops) | yes  | all | no | Empty view placeholder; does not fire onStateChange state events |
| EmbeddedPaymentElementView | respective configuration | yes  | all | no | Empty view placeholder (emits loadingFailed etc. lifecycle events so the degradation is observable; the component is not exported on the JS side in this version) |
| CheckoutPaymentElementView | CheckoutPaymentElementViewProps | yes  | all | no | Checkout (Private Preview); the JS layer throws directly (not an empty-view placeholder) |
| Connect JS components (ConnectComponentsProvider / ConnectAccountOnboarding / ConnectPayments / ConnectPayouts / ConnectPaymentDetails) | [Connect component props](#connect-common-component-props) | yes  | all | partially | Hosted via @react-native-ohos/react-native-webview; the harmony side includes a built-in `injectedObjectJson` shim and BackHandler back-button interception |

### Properties

#### StripeProviderProps

| Name | Parameter Type | Default Value | Required | Platform | HarmonyOS Platform Support | Description |
|------|----------|--------|------|------|------------------|------|
| publishableKey | string | None | Yes | All | Yes | Publishable key (pk_...) |
| stripeAccountId | string | None | No | All | Yes | Connect sub-account ID; carried as the Stripe-Account header on REST requests |
| threeDSecureParams | ThreeDSecure.ConfigurationParams | None | No | iOS | No | iOS-only 3DS UI customization; OpenHarmony 3DS uses an ArkWeb page |
| merchantIdentifier | string | None | No | iOS | No | Apple Pay merchant identifier (no Apple Pay channel on OpenHarmony) |
| urlScheme | string | None | No | iOS | Yes | Custom app scheme used to return after 3DS/SCA authentication |
| setReturnUrlSchemeOnAndroid | boolean | false | No | Android | No | Android-only behavior |
| children | ReactElement | None | Yes | All | Yes | Child components |

#### CardFieldProps

| Name                           | Parameter Type          | Default Value       | Required            | Platform   | HarmonyOS Platform Support    | Description |
|------------------------------|--------------------|------------|---------------|------|------------------|---------------|
| style                        | StyleProp&lt;ViewStyle&gt; | None | No            | All  | Yes              | Component style (width, height, etc.) |
| postalCodeEnabled            | boolean            | true       | No            | All  | Yes              | Whether to show the postal code input (generic input on OpenHarmony; format does not switch by country) |
| countryCode                  | string             | Device default locale | No         | All  | No               | Controls the type of postal code input shown; not implemented in the custom-drawn OpenHarmony view, the value is ignored |
| disabled                     | boolean            | false      | No            | All  | Yes              | Disables user input |
| cardStyle                    | CardFieldInput.Styles | None    | No            | All  | Yes              | Input field style; 9 of 10 fields take effect (fontFamily does not): backgroundColor/borderColor/borderWidth/borderRadius/cursorColor/fontSize/placeholderColor/textColor/textErrorColor |
| placeholders                 | CardFieldInput.Placeholders | None | No       | All  | Yes              | Input field placeholder text (number/expiration/cvc/postalCode) |
| autofocus                    | boolean            | false      | No            | All  | Yes              | Automatically focuses on mount |
| preferredNetworks            | Array&lt;CardBrand&gt; | None  | No            | iOS  | No               | Preferred networks for co-branded cards (iOS only, not implemented on OpenHarmony) |
| onBehalfOf                   | string             | None       | No            | iOS  | No               | The account expected to receive the funds (iOS only, not implemented on OpenHarmony) |
| onCardChange                 | callback           | None       | No            | All  | Yes              | Callback fired when card details change (brands, last4, complete, etc.) |
| onFocus / onBlur             | callback           | None       | No            | All  | Yes              | Focus/blur callbacks |
| dangerouslyGetFullCardDetails | boolean           | false      | No            | All  | Yes              | Warning: returns the full card number; PCI compliance requirements must be met |
| testID                       | string             | None       | No            | All  | Yes              | Test identifier |

#### CardFormProps

| Name | Parameter Type | Default Value | Required | Platform | HarmonyOS Platform Support | Description |
|------|----------|--------|------|------|------------------|------|
| style | StyleProp&lt;ViewStyle&gt; | None | No | All | Yes | Component style |
| autofocus | boolean | false | No | All | Yes | Automatically focuses on mount |
| disabled | boolean | false | No | All | Yes | Disables user input |
| cardStyle | CardFormView.Styles | None | No | All | partially | Form style; 7 of 10 fields take effect (borderWidth/textErrorColor/fontFamily do not): backgroundColor/borderColor/borderRadius/cursorColor/fontSize/placeholderColor/textColor |
| placeholders | CardFormView.Placeholders | None | No | Android | Yes | Input field placeholder text (Android-only in the original library; supported by the OpenHarmony custom-drawn form) |
| defaultValues | CardFormView.DefaultValues | None | No | Android | No | Default country prefill (Android-only in the original library; not implemented) |
| preferredNetworks | Array&lt;CardBrand&gt; | None | No | iOS | No | Preferred networks for co-branded cards (iOS only, not implemented) |
| onFormComplete | callback | None | No | All | Yes | Form complete callback (CardFormView.Details) |
| dangerouslyGetFullCardDetails | boolean | false | No | All | Yes | Warning: returns the full card number; PCI compliance requirements must be met |
| testID | string | None | No | All | Yes | Test identifier |

#### AuBECSDebitFormProps

| Name | Parameter Type | Default Value | Required | Platform | HarmonyOS Platform Support | Description |
|------|----------|--------|------|------|------------------|------|
| companyName | string | None | Yes | All | Yes | Company name shown on the form |
| onComplete | callback | None | Yes | All | Yes | Form complete callback (bsbNumber/accountNumber/name/email) |
| formStyle | AuBECSDebitFormComponent.Styles | None | No | All | partially | Form style; only 3 of 8 fields take effect (textColor/backgroundColor/fontSize); borderWidth/borderColor/borderRadius (fixed at 8)/placeholderColor/textErrorColor do not, and placeholders are hardcoded Chinese text (name/email/BSB/account) |
| style | StyleProp&lt;ViewStyle&gt; | None | No | All | Yes | Component style |
| testID | string | None | No | All | Yes | Test identifier |

#### AddressSheetProps

| Name | Parameter Type | Default Value | Required | Platform | HarmonyOS Platform Support | Description |
|------|----------|--------|------|------|------------------|------|
| visible | boolean | false | Yes | All | Yes | Whether the address sheet is visible |
| presentationStyle | string | popover | No | iOS | No | Presentation style (iOS only) |
| animationStyle | string | None | No | iOS | No | Animation style (iOS only) |
| appearance | PaymentSheet.AppearanceParams | None | No | All | No | Theme/appearance configuration (not implemented in the ArkUI custom-drawn view) |
| defaultValues | AddressDetails | None | No | All | Yes | Prefilled fields (name/phone + all address fields line1/line2/city/state/postalCode/country; isCheckboxSelected cannot be prefilled and is always submitted as false) |
| additionalFields | object | None | No | All | No | Additional fields (phone requirement/checkbox label); not implemented |
| allowedCountries | Array&lt;string&gt; | all countries | No | All | No | Country allowlist; not implemented |
| autocompleteCountries | Array&lt;string&gt; | audited list | No | All | No | Address-autocomplete countries; not implemented |
| primaryButtonTitle | string | "Save Address" | No | All | Yes | Primary button title |
| sheetTitle | string | "Address" | No | All | Yes | Sheet title |
| googlePlacesApiKey | string | None | No | Android | No | Google Places autocomplete key (depends on Google services, unavailable on OpenHarmony) |
| onSubmit | callback | None | Yes | All | Yes | Submit callback (CollectAddressResult) |
| onError | callback | None | Yes | All | Yes | Dismiss/error callback (StripeError&lt;AddressSheetError&gt;) |

#### StripeContainerProps

| Name | Parameter Type | Default Value | Required | Platform | HarmonyOS Platform Support | Description |
|------|----------|--------|------|------|------------------|------|
| children | ReactElement | None | Yes | All | Yes | Child components (CardField etc.) |
| keyboardShouldPersistTaps | boolean/string | None | No | All | Yes | Whether taps are allowed while the keyboard is up |
| style | StyleProp&lt;ViewStyle&gt; | None | No | All | Yes | Container style |
| testID | string | None | No | All | Yes | Test identifier |

#### PlatformPayButtonProps

| Name | Parameter Type | Default Value | Required | Platform | HarmonyOS Platform Support | Description |
|------|----------|--------|------|------|------------------|------|
| type | PlatformPay.ButtonType | ButtonType.Plain | No | All | Yes | Button label type (effective on the degraded placeholder) |
| appearance | PlatformPay.ButtonStyle | ButtonStyle.Automatic | No | All | Yes | Button coloring (effective on the degraded style) |
| borderRadius | number | None | No | All | Yes | Button corner radius |
| onPress | callback | None | Yes | All | Yes | Press callback |
| disabled | boolean | false | No | All | Yes | Disables the button |
| onShippingMethodSelected | callback | None | No | iOS | No | Apple Pay shipping-method callback (no platform wallet sheet, never fires) |
| onShippingContactSelected | callback | None | No | iOS | No | Apple Pay shipping-contact callback (never fires) |
| onCouponCodeEntered | callback | None | No | iOS | No | Apple Pay coupon callback (never fires) |
| setOrderTracking | callback | None | No | iOS | No | Apple Pay order-tracking callback (never fires) |
| testID | string | None | No | All | Yes | Test identifier |
| style | StyleProp&lt;ViewStyle&gt; | None | No | All | Yes | Button container style |

#### AddToWalletButtonProps

| Name | Parameter Type | Default Value | Required | Platform | HarmonyOS Platform Support | Description |
|------|----------|--------|------|------|------------------|------|
| style | StyleProp&lt;ViewStyle&gt; | None | No | All | Yes | Placeholder view size style |
| iOSButtonStyle | string | None | No | iOS | No | Apple Wallet button style (ignored by the placeholder) |
| androidAssetSource | ImageSourcePropType | None | Yes | Android | No | Google Pay button image (required, ignored by the placeholder) |
| testEnv | boolean | false | No | iOS | No | TestFlight/sandbox flag (ignored) |
| cardDetails | object | None | Yes | All | No | Details of the card to add (required, ignored) |
| token | GooglePayCardToken / null | None | No | Android | No | Google Pay yellow-path token (ignored) |
| isBounceProvisioned | boolean | false | No | Android | No | Bounce-provisioning flag (ignored) |
| ephemeralKey | object | None | Yes | All | No | Ephemeral key for provisioning (required, ignored) |
| onComplete | callback | None | Yes | All | Yes | Flow completion callback (returns a structured error event on OpenHarmony) |
| testID | string | None | No | All | Yes | Test identifier |

#### CustomerSheetProps

Component form (passing `true` to `visible` automatically runs initialize + present, results delivered via onResult):

| Name | Parameter Type | Default Value | Required | Platform | HarmonyOS Platform Support | Description |
|------|----------|--------|------|------|------------------|------|
| visible | boolean | false | Yes | All | Yes | Whether to present the CustomerSheet |
| onResult | callback | None | Yes | All | Yes | Unified submit/dismiss/error callback (CustomerSheetResult) |
| Init params (choose one) | CustomerAdapterInitParams or CustomerSessionInitParams | None | Yes | All | partially | Path 1: customerId + customerEphemeralKeySecret + customerAdapter event round-trips take effect (setupIntentClientSecret is passed through but not consumed natively); Path 2: intentConfiguration + clientSecretProvider is not wired up natively |
| merchantDisplayName / style / appearance / headerTextForSelectionScreen | respective types | None | No | All | No | None take effect: the custom-drawn page title is fixed to "支付方式", merchantDisplayName is stored but never displayed, style/appearance/headerTextForSelectionScreen are not read natively |
| defaultBillingDetails | BillingDetails | None | No | All | No | Prefilled billing details (not consumed natively) |
| billingDetailsCollectionConfiguration | BillingDetailsCollectionConfiguration | AUTOMATIC | No | All | No | Billing field collection policy (not consumed natively) |
| returnURL | string | None | No | All | Yes | Return URL for 3DS etc. web authentication |
| applePayEnabled / googlePayEnabled | boolean | false | No | iOS / Android | No | Platform wallet toggles (no such channel on OpenHarmony) |
| preferredNetworks | Array&lt;CardBrand&gt; | None | No | iOS | No | Preferred networks for co-branded cards |
| removeSavedPaymentMethodMessage | string | None | No | iOS | No | Message shown when removing a saved payment method (iOS only) |
| allowsRemovalOfLastSavedPaymentMethod | boolean | true | No | All | No | Whether the last saved payment method can be removed (not consumed natively; no removal entry in the custom-drawn UI) |
| cardBrandAcceptance | PaymentSheet.CardBrandAcceptance | all brands | No | All | No | Card brand filtering (not consumed natively; no brand filtering logic in the custom-drawn UI) |
| opensCardScannerAutomatically | boolean | false | No | iOS | No | Open the card scanner automatically (iOS only) |
| presentationStyle / animationStyle / timeout | respective types | None | No | iOS / All | No | present params (iOS only / ignored by the custom-drawn UI) |

#### PaymentSheet.SetupParams (initPaymentSheet params)

The custom-drawn payment sheet implements the core flow "card input → create payment method → confirm → 3DS redirect". Per-field support:

| Name | Parameter Type | Default Value | Required | Platform | HarmonyOS Platform Support | Description |
|------|----------|--------|------|------|------------------|------|
| paymentIntentClientSecret | string | None | one of three | All | Yes | PaymentIntent client secret (default-flow confirmation + amount prefetch for display) |
| setupIntentClientSecret | string | None | one of three | All | Yes | SetupIntent client secret (default-flow confirmation) |
| intentConfiguration | PaymentSheet.IntentConfiguration | None | one of three | All | Yes | Modern-flow config; confirmHandler / confirmationTokenConfirmHandler round-trip via events, the mode amount is used for display, and its presence switches the sheet to customFlow |
| customerEphemeralKeySecret / customerSessionClientSecret | string | None | No | All | No | Access key for saved payment methods; the custom-drawn sheet does not load saved payment methods, the value is stored but not consumed |
| merchantDisplayName | string | None | Yes | All | Yes | Sheet title (shown in the custom-drawn header) |
| customerId | string | None | No | All | No | Customer ID (stored but not consumed) |
| customFlow | boolean | false | No | All | Yes | Separates selection and confirmation; you must call confirmPaymentSheetPayment yourself |
| applePay | ApplePayParams | None | No | iOS | No | Apple Pay inside the sheet (no channel on OpenHarmony, ignored) |
| googlePay | GooglePayParams | None | No | Android | No | Google Pay inside the sheet (no channel on OpenHarmony, ignored) |
| link | LinkParams | None | No | All | No | Link config (Private Preview, ignored) |
| style | UserInterfaceStyle | automatic | No | All | No | Light/dark theme (not consumed by the custom-drawn UI) |
| returnURL | string | None | No | All | Yes | Return URL after 3DS/SCA web authentication (effective for both PaymentSheet and CustomerSheet) |
| billingDetailsCollectionConfiguration | BillingDetailsCollectionConfiguration | AUTOMATIC | No | All | No | Billing field collection policy (stored but not consumed) |
| defaultBillingDetails | BillingDetails | None | No | All | No | Prefilled billing details (stored but not consumed) |
| defaultShippingDetails | AddressDetails | None | No | All | No | Prefilled shipping info (ignored) |
| allowsDelayedPaymentMethods | boolean | false | No | All | No | Allow delayed-settlement payment methods (stored but not consumed) |
| appearance | PaymentSheet.AppearanceParams | None | No | All | No | Theme/appearance (not implemented in the custom-drawn sheet, see Known Issues) |
| primaryButtonLabel | string | None | No | All | Yes | Primary button label |
| removeSavedPaymentMethodMessage | string | None | No | iOS | No | Message when removing a saved payment method (ignored) |
| preferredNetworks | Array&lt;CardBrand&gt; | None | No | iOS | No | Preferred networks for co-branded cards (ignored) |
| paymentMethodOrder | Array&lt;string&gt; | None | No | All | No | Payment method ordering (card input only, ignored) |
| allowsRemovalOfLastSavedPaymentMethod | boolean | true | No | All | No | Removing the last saved card (no saved-method list, ignored) |
| paymentMethodLayout | PaymentSheet.PaymentMethodLayout | Automatic | No | All | No | Payment method layout (ignored) |
| cardBrandAcceptance | PaymentSheet.CardBrandAcceptance | all brands | No | All | No | Card brand filtering (ignored) |
| cardFundingFiltering | PaymentSheet.CardFundingFiltering | None | No | All | No | Card funding-type filtering (Private Preview, ignored) |
| customPaymentMethodConfiguration | PaymentSheet.CustomPaymentMethodConfiguration | None | No | All | No | Custom payment methods; callbacks are registered on the JS side but the custom-drawn sheet does not render them |
| opensCardScannerAutomatically | boolean | false | No | All | No | Open the card scanner automatically (ignored) |
| termsDisplay | { [paymentMethodType: string]: TermsDisplay } | AUTOMATIC | No | All | No | Terms display policy (ignored) |

> presentPaymentSheet's PresentOptions (only `timeout` is optional): not read by the custom-drawn implementation, values are ignored (custom-flow confirmation always goes through confirmPaymentSheetPayment).

#### PaymentMethod type support matrix (createPaymentMethod / confirmPayment)

The 19 paymentMethodTypes of `PaymentMethod.CreateParams`, annotated per the native `buildPaymentMethodForm` behavior: Card goes through a dedicated channel; all other types go through "flat field passthrough" — only first-level string/boolean/number fields are submitted to the REST API in snake_case, nested objects are dropped entirely; `billingDetails` (including address) works for all types.

| Type | HarmonyOS Support | Notes |
|------|---------------|------|
| Card | Yes | Dedicated channel: token / cardFromSheet (live CardField snapshot) / paymentMethodId + cvc; richest field support |
| USBankAccount | Yes | accountNumber / routingNumber / accountHolderType / accountType passed through flat |
| SepaDebit | Yes | iban passed through flat |
| Fpx | Yes | testOfflineBank passed through flat |
| Alipay / Oxxo / Multibanco / GrabPay / Bancontact / Eps / P24 / PayPal / CashApp | Yes | No extra dedicated fields (or flat fields only); usable together with billingDetails |
| Ideal | partially | bankName maps to ideal[bank_name] while Stripe expects ideal[bank]; omitting bankName still works (bank is chosen on the redirect page) |
| AfterpayClearpay / Klarna / Affirm | partially | shippingDetails is a nested object and gets dropped; shipping info must be preset server-side on the PaymentIntent |
| AuBecsDebit | No | formDetails is a nested object dropped entirely; without BSB/account the payment method cannot be created |
| WeChatPay | - | Commented out of the TS union type in the original library (PaymentMethod.ts); cannot be created via types |

#### PaymentMethodMessagingElementProps

| Name | Parameter Type | Default Value | Required | Platform | HarmonyOS Platform Support | Description |
|------|----------|--------|------|------|------------------|------|
| configuration | PaymentMethodMessagingElementConfiguration | None | Yes | All | No | Required configuration (amount/currency/country/paymentMethodTypes etc.); an empty placeholder view on OpenHarmony, params produce no rendering |
| appearance | PaymentMethodMessagingElementAppearance | None | No | All | No | Appearance (font/text color/link color/theme); no effect on the empty view |
| onStateChange | callback | None | No | All | No | State callback (loaded/loadingFailed etc.); the placeholder fires no events |

#### NavigationBarProps

| Name | Parameter Type | Default Value | Required | Platform | HarmonyOS Platform Support | Description |
|------|----------|--------|------|------|------------------|------|
| title | string | None | No | All | Yes | Navigation bar title |
| onCloseButtonPress | callback | None | No | All | Yes | Close button callback (fires when ✕ is tapped) |
| ViewProps passthrough | ViewProps | None | No | All | Yes | style and other passthrough props |

#### Connect common component props

CommonComponentProps shared by ConnectAccountOnboarding / ConnectPayments / ConnectPayouts / ConnectPaymentDetails:

| Name | Parameter Type | Default Value | Required | Platform | HarmonyOS Platform Support | Description |
|------|----------|--------|------|------|------------------|------|
| onLoaderStart | callback | None | No | All | Yes | Component starts loading (fired by the webview host) |
| onLoadError | callback | None | No | All | Yes | Load failure callback |
| onPageDidLoad | callback | None | No | All | Yes | Page loaded callback |
| style | StyleProp&lt;ViewStyle&gt; | None | No | All | Yes | Container style |

ConnectAccountOnboarding extra props:

| Name | Parameter Type | Default Value | Required | Platform | HarmonyOS Platform Support | Description |
|------|----------|--------|------|------|------------------|------|
| title | string | None | No | All | Yes | Navigation bar title |
| onExit | callback | None | Yes | All | Yes | Close the onboarding flow |
| onStepChange | callback | None | No | All | Yes | Onboarding step change callback |
| recipientTermsOfServiceUrl / fullTermsOfServiceUrl / privacyPolicyUrl | string | None | No | All | Yes | Terms links (passed through to the connect-js webview) |
| collectionOptions | CollectionOptions | None | No | All | Yes | Field collection config (passed through to the connect-js webview) |

ConnectPayments extra prop: defaultFilters (PaymentsListDefaultFilters, effective via webview passthrough); ConnectPaymentDetails extra props: payment (required, payment intent ID) and onClose (required, close callback).

### API
| Name     | Type     | Parameter Type | Return Value | Required    | Platform | OpenHarmony Platform Support | Description  |
|--------|---------|-----|-------|-------|--------|-----|-----------------|
| initStripe / StripeProvider | function | publishableKey, urlScheme, etc. | void | No | All | Yes | Initializes the SDK |
| Constants (getConstants) | function | / | API_VERSIONS + SYSTEM_INFO | No | All | Yes | SDK/system information constants |
| initialise | function | InitialiseParams | Promise&lt;void&gt; | No | All | Yes (internal) | Internal implementation that configures the publishable key; called via initStripe / StripeProvider and not publicly exported from the package entry (covered by both in the demo) |
| createPaymentMethod | function | params, options | CreatePaymentMethodResult | No | All | Yes | Creates a payment method (REST /v1/payment_methods) |
| createToken | function | CreateParams (Card/BankAccount/Pii) | CreateTokenResult | No | All | Yes | Creates a token (REST /v1/tokens) |
| createTokenForCVCUpdate | function | cvc: string | CreateTokenForCVCUpdateResult | No | All | Yes | CVC update token |
| createRadarSession | function | / | CreateRadarSessionResult | No | All | partially | Creates a Radar session (/v1/radar_sessions is not a public endpoint; always returns a structured invalid_request_error, no real rso id — see Unimplemented Features) |
| confirmPayment | function | clientSecret, params, options | ConfirmPaymentResult | No | All | Yes | Confirms a payment intent (including 3DS redirect) |
| confirmSetupIntent | function | clientSecret, params, options | ConfirmSetupIntentResult | No | All | Yes | Confirms a setup intent |
| retrievePaymentIntent / retrieveSetupIntent | function | clientSecret | Retrieve*Result | No | All | Yes | Retrieves intents |
| handleNextAction / handleNextActionForSetup | function | clientSecret, returnURL | HandleNextAction*Result | No | All | partially | Redirect-type actions are completed via ArkWeb; native-app-type actions have no OpenHarmony counterpart and are treated as cancellation |
| handleURLCallback | function | url: string | Promise&lt;boolean&gt; | No | All | Yes | Handles stripe:// callbacks |
| initPaymentSheet | function | SetupParams | InitPaymentSheetResult | No | All | Yes | Initializes the payment sheet (custom-drawn checkout; both customFlow/intentConfiguration supported; per-field support is listed in the PaymentSheet.SetupParams property table) |
| presentPaymentSheet | function | PresentOptions | PresentPaymentSheetResult | No | All | partially | Presents the payment sheet; PresentOptions (only timeout is optional) is not read by the custom-drawn implementation and is ignored |
| confirmPaymentSheetPayment | function | / | ConfirmPaymentSheetPaymentResult | No | All | Yes | Confirms in the custom flow |
| intentCreationCallback and other two-way callbacks ×3 | function | IntentCreationCallbackParams etc. | Promise&lt;void&gt; | No | All | Yes | customFlow callbacks (event round-trips) |
| resetPaymentSheetCustomer | function | / | Promise&lt;null&gt; | No | All | Yes | Resets customer state |
| initCustomerSheet / presentCustomerSheet | function | InitParams / PresentParams | CustomerSheetResult | No | All | Yes | Customer payment method management (custom-drawn + CustomerAdapter event round-trips; only customerId/customerEphemeralKeySecret/returnURL/customerAdapter take effect — see the CustomerSheetProps table) |
| retrieveCustomerSheetPaymentOptionSelection | function | / | CustomerSheetResult | No | All | partially | No native persistence; returns an empty selection |
| customerAdapter*Callback ×6 / clientSecretProvider*Callback ×2 | function | respective payloads | Promise&lt;void&gt; | No | All | Yes | Two-way callback round-trips |
| collectBankAccount | function | isPaymentIntent, clientSecret, params | Confirm*Result | No | All | partially | Creates and confirms a payment method directly via REST; no hosted UI, account details are passed in by the caller |
| verifyMicrodeposits | function | isPaymentIntent, clientSecret, params | Confirm*Result | No | All | Yes | Micro-deposit verification |
| openAuthenticatedWebView / presentExternalWebPage / authWebViewDeepLinkHandled | function | id/url etc. | respective results | No | All | Yes (internal) | Web authentication/external pages (hosted by ArkWeb); internal interfaces not exported on the JS side, cannot be called directly |
| storeStripeConnectDeepLink / pollAndClearPendingStripeConnectUrls | function | url / / | void / string[] | No | All | Yes (internal) | Connect deep link storage and retrieval (internal, not exported on the JS side) |
| downloadAndShareFile | function | url, filename | {success, error?} | No | All | Yes (internal) | Downloads and shares a file (falls back to download-only when the share sheet is unavailable; internal, not exported on the JS side) |
| isPlatformPaySupported | function | params | Promise&lt;boolean&gt; | No | All | No | Always false; no Stripe platform wallet on OpenHarmony |
| createPlatformPayPaymentMethod / confirmPlatformPay (confirmPlatformPayPayment / confirmPlatformPaySetupIntent) | function | params, clientSecret | structured notSupported | No | All | No | Platform wallet payments |
| createPlatformPayToken | function | PlatformPay.PaymentMethodParams | structured notSupported | No | All | No | Platform wallet token (degraded on OpenHarmony) |
| openPlatformPaySetup (native name openApplePaySetup) / canAddCardToWallet / isCardInWallet / updatePlatformPaySheet / dismissPlatformPay / configureOrderTracking | function | respective params | false / structured notSupported | No | All | No | Wallet management (configureOrderTracking is triggered via PlatformPayButton's setOrderTracking / initPaymentSheet's orderTrackingCallback) |
| collectFinancialConnectionsAccounts / collectBankAccountToken / setFinancialConnectionsForceNativeFlow | function | clientSecret, params | structured notSupported | No | All | No | Financial Connections (the closed-source hosted OAuth flow has no OpenHarmony carrier) |
| initLinkController / presentLinkController / confirmLinkControllerSetupIntent | function | params | structured notSupported | No | All | No | Link (Private Preview) |
| createEmbeddedPaymentElement / confirmEmbeddedPaymentElement / updateEmbeddedPaymentElement / clearEmbeddedPaymentOption | function | intentConfig etc. | structured notSupported | No | All | No | Embedded payment component (native methods degraded to notSupported; the component and its Ref API are not exported on the JS side in this version; the native view is an empty placeholder that emits loadingFailed etc. events so the degradation is observable) |
| createCheckout / useCheckout / CheckoutPaymentElementView | function / hook / component | Checkout params | JS-layer throw or structured error | No | All | No | Checkout (Private Preview); this build has no native support, calls throw/return an error directly |
| OnrampSdk, all methods | function | respective params | structured notSupported (isSamsungPaySupported→false) | No | All | No | Crypto Onramp |

### Hooks

| Name | Type | Params / Returns | Platform | OpenHarmony Platform Support | Description |
|------|------|-----------|------|---------------------|------|
| useStripe | hook | returns all API methods above | All | Yes | Core API hook wrapper |
| usePaymentSheet | hook | initPaymentSheet / presentPaymentSheet / confirmPaymentSheetPayment + loading | All | Yes | Payment sheet hook |
| useConfirmPayment | hook | confirmPayment + loading | All | Yes | Confirm payment hook |
| useConfirmSetupIntent | hook | confirmSetupIntent + loading | All | Yes | Confirm setup intent hook |
| usePlatformPay | hook | platform pay method wrappers (isPlatformPaySupported / createPlatformPayPaymentMethod, etc.) | iOS, Android | No | Methods exist but everything underneath is degraded (false / notSupported) |
| useFinancialConnectionsSheet | hook | collectBankAccountToken / collectFinancialConnectionsAccounts + loading | iOS, Android | No | Financial Connections hook (degraded) |
| useOnramp | hook | wraps all OnrampSdk methods (configure / hasLinkAccount / verifyIdentity / performCheckout, etc.) | iOS, Android | No | Crypto Onramp hook (degraded, isSamsungPaySupported→false) |
| useLinkController | hook | init / present / confirm + loading | iOS, Android | No | Link hook (Private Preview, degraded) |
| useCheckout | hook | Checkout Session state and controller methods (reload / confirm, etc.) | All | No | Checkout hook (Private Preview, returns structured error) |
| useEmbeddedPaymentElement | hook | embedded payment element (updateIntent / confirm / clearPaymentOption + state) | All | No | Embedded payment element hook (exported on the JS side; the underlying createEmbeddedPaymentElement etc. native methods degrade to notSupported, and the native view is an empty placeholder) |

### Unimplemented Features
| API / Property | Reason |
|-----|------|
| Apple Pay / Google Pay / Push Provisioning, full group (including PlatformPayButton's onShippingMethodSelected / onShippingContactSelected / onCouponCodeEntered / setOrderTracking callbacks) | The HarmonyOS Wallet Kit only supports car keys/transit cards (and only on mainland China phones), and the IAP Kit is Huawei's checkout — neither is a Stripe channel; returns structured notSupported or false, wallet sheet callbacks never fire |
| Financial Connections | A hosted OAuth flow deeply integrated with a closed-source SDK; Stripe has not opened an OpenHarmony carrier for it |
| Crypto Onramp (OnrampSdk) | Closed-source build variant (Android requires StripeSdk_includeOnramp=true); no OpenHarmony version |
| createRadarSession real session | Stripe /v1/radar_sessions is not a public REST endpoint (the original SDK obtains sessions via a closed-source fraud-detection/device-fingerprint channel); direct pk calls always return the Unrecognized request URL structured error (verified with both Bearer and form-key auth) |
| LinkController / Checkout (createCheckout / useCheckout / CheckoutPaymentElementView) | Official Private Preview; no public API surface; JS-layer calls throw directly or return a structured error |
| EmbeddedPaymentElement / PaymentMethodMessagingElement native views | Closed-source Compose embedded components; empty view placeholders (PMME does not fire onStateChange); EmbeddedPaymentElement emits loadingFailed etc. lifecycle events so the degradation is observable |
| CardField's preferredNetworks / onBehalfOf / countryCode | iOS-only behaviors in the original library (co-branded network selection / per-country postal formats); not implemented in the ArkUI custom-drawn view, values are ignored |
| CardForm's defaultValues / preferredNetworks | Android/iOS-only prefill and network selection in the original library; not implemented in the custom-drawn form |
| Field-level style/prefill gaps: CardField cardStyle fontFamily; CardForm cardStyle borderWidth / textErrorColor / fontFamily; AuBECSDebitForm formStyle borderWidth / borderColor / borderRadius / placeholderColor / textErrorColor (placeholders hardcoded to Chinese "姓名/邮箱/BSB/账号", corner radius fixed at 8); AddressSheet defaultValues address.line2 / isCheckboxSelected | The ArkUI custom-drawn components are simplified implementations: styles map only common fields, prefill maps only core fields |
| AddressSheet's appearance / additionalFields / allowedCountries / autocompleteCountries / googlePlacesApiKey / presentationStyle / animationStyle | The ArkUI implementation is a simplified form without theme or advanced field config; autocomplete depends on Google Places, which is unavailable on OpenHarmony |
| CustomerSheet's appearance / style / merchantDisplayName display / headerTextForSelectionScreen / defaultBillingDetails / billingDetailsCollectionConfiguration / allowsRemovalOfLastSavedPaymentMethod / cardBrandAcceptance / setupIntentClientSecret / applePayEnabled / googlePayEnabled / preferredNetworks / opensCardScannerAutomatically / removeSavedPaymentMethodMessage, and present's presentationStyle / animationStyle / timeout | The custom-drawn implementation only covers the saved-payment-method list/select core flow; style, prefill, and filtering params are all unconsumed; no platform-wallet channel on OpenHarmony |
| PaymentSheet (initPaymentSheet) unconsumed params: customerId / customerEphemeralKeySecret / customerSessionClientSecret / style / appearance / billingDetailsCollectionConfiguration / defaultBillingDetails / defaultShippingDetails / allowsDelayedPaymentMethods / applePay / googlePay / link / removeSavedPaymentMethodMessage / preferredNetworks / paymentMethodOrder / allowsRemovalOfLastSavedPaymentMethod / paymentMethodLayout / cardBrandAcceptance / cardFundingFiltering / customPaymentMethodConfiguration / opensCardScannerAutomatically / termsDisplay, plus presentPaymentSheet's PresentOptions (only timeout is optional) | The custom-drawn sheet implements only the card-input core flow, without saved payment method lists or theme config; no platform-wallet channel on OpenHarmony |
| Payment method types without full support: Ideal (bankName maps to ideal[bank_name], which does not match the ideal[bank] Stripe expects; omitting it still works); AfterpayClearpay / Klarna / Affirm (shippingDetails is a nested object and gets dropped; shipping must be preset server-side on the PaymentIntent); AuBecsDebit (formDetails is a nested object dropped entirely; the AuBECSDebitForm component can collect the form but createPaymentMethod cannot submit it); WeChatPay (removed from the TS union type in the original library; cannot be created via types) | Non-Card types go through a "flat field passthrough" native channel: only first-level string/boolean/number fields are submitted to the REST API in snake_case, nested objects are dropped entirely; see the PaymentMethod type support matrix |
| StripeProvider's threeDSecureParams / merchantIdentifier / setReturnUrlSchemeOnAndroid | iOS/Android-only config; OpenHarmony 3DS uses a generic ArkWeb page and has no Apple Pay identifier need |

## Known Issues

- Platform wallets / Financial Connections / Onramp / Link / embedded native components are explicitly degraded (structured notSupported, see the tables above) — this is not a pending to-do list; OpenHarmony has no corresponding system services, or the closed-source SDKs have no OpenHarmony version.
- `PaymentSheet`/`CustomerSheet` are approximate ArkUI custom-drawn implementations, not pixel-perfect replicas of the closed-source native UI; in PaymentSheet.SetupParams only the core-flow fields take effect (intent secrets / merchantDisplayName / customFlow / primaryButtonLabel / intentConfiguration), while appearance and other style or advanced config fields are stored but not consumed or ignored — per-field status is listed in the PaymentSheet.SetupParams property table.
- `handleNextAction` / `handleNextActionForSetup` are partially supported: redirect-type next_actions complete authentication via ArkWeb; native-app-type next_actions have no OpenHarmony wallet ecosystem and are returned as user cancellation (cancel).
- `retrieveCustomerSheetPaymentOptionSelection` is partially supported: no native persistence, repeated entry returns an empty selection instead of the previous one.
- `collectBankAccountForPayment` / `collectBankAccountForSetup` are partially supported: no Stripe-hosted collection UI; a US Bank Account payment method is created and confirmed directly via REST, with account details supplied by the caller.
- `PlatformPayButton` is partially supported: renders a degraded placeholder button (type/appearance/borderRadius/onPress/disabled take effect); tapping it opens no wallet.
- Connect embedded components are partially supported: hosted by react-native-webview (ArkWeb) rendering connect-js pages, capabilities depend on connect-js compatibility; the OpenHarmony react-native-webview package must be installed additionally.
- Non-Card payment methods go through a "flat field passthrough" channel: nested objects (shippingDetails / formDetails, etc.) are dropped entirely at the native layer, and Ideal's bankName parameter name does not match what Stripe expects — per-type differences are listed in the PaymentMethod type support matrix.

## Other

**Quick verification (running the Example)**

Prerequisites:

| Dependency | Version Requirement |
|------|----------|
| Node.js | >= 18 |
| DevEco Studio | 5.0+ / 6.0+ |
| HarmonyOS SDK | API 12+ |

Steps:

```bash
# 1. Clone the repository, install dependencies, and pack
git clone <repository-url>
cd <repository-directory>
npm install --legacy-peer-deps
npm pack           # generates the tgz package (also triggers prepare to build the JS artifacts)

# 2. Go to the example directory and install dependencies
cd example
npm install --legacy-peer-deps

# 3. Generate the JS bundle (output: harmony/entry/src/main/resources/rawfile/bundle.harmony.js)
npm run dev
```

Then open the `example/harmony` directory in DevEco Studio, wait for Sync to finish, and click Run to install the HAP on a device/emulator.

> [!TIP] The Example project already has the plugin dependencies and Package registration in place; no manual Link configuration is required.

## Directory Structure
````
/stripe-react-native      # Project root directory
├── harmony               # HarmonyOS adaptation code
│   ├── stripe_react_native.har   # har package
│   └── stripe_react_native       # HarmonyOS adaptation core code
│       ├── index.ets     # HarmonyOS adaptation code entry point
│       └── src/main/ets  # ArkTS adaptation layer
│           ├── api       # REST API channel
│           ├── card      # Card data management (CardFieldRegistry, etc.)
│           ├── components # ArkUI components (CardField/PaymentSheet, etc.)
│           ├── sheet     # Custom-drawn checkout sheets (PaymentSheet/CustomerSheet)
│           ├── web       # ArkWeb hosting (3DS auth page/Connect shim)
│           └── util      # Utilities
│       └── src/main/cpp  # C++ TurboModule implementation
├── src                   # RN code
│   ├── index.tsx         # Entry file
│   ├── components        # Components (CardField/CardForm/StripeProvider, etc.)
│   ├── hooks             # Hooks (useStripe/usePaymentSheet, etc.)
│   ├── functions.ts      # API implementation
│   ├── connect           # Connect embedded components
│   ├── types             # Type definitions
│   └── specs             # TurboModule codegen specs
├── example               # Example application (includes the HarmonyOS project)
├── README.md             # Chinese installation and usage instructions
└── LICENSE               # Open source license
````

## How to Contribute

If you run into any problems while using stripe-react-native, feel free to submit an [Issue](https://github.com/react-native-oh-library/stripe-react-native/issues). Pull requests are also very welcome.

## License

This project is licensed under the [MIT License](https://github.com/stripe/stripe-react-native/blob/main/LICENSE). Feel free to enjoy and contribute to open source.
