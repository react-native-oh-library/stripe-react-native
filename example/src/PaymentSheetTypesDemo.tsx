/**
 * PaymentSheet / 组件类型用例（P2 补充）
 *
 * 覆盖未引用的类型名与未覆盖字段（RTC-04）：
 * - PaymentSheet.AppearanceParams 全字段（colors / shadows / primaryButton /
 *   formInsetValues / font / shapes / applyLiquidGlass / navigationBarStyle）
 * - IntentConfiguration（confirmHandler / confirmationTokenConfirmHandler /
 *   customPaymentMethodConfiguration / mode 全变体）
 * - CustomPaymentMethod / CustomPaymentMethodResult /
 *   ConfirmCustomPaymentMethodCallback / CustomPaymentMethodConfiguration
 * - SetupParams / ApplePayParams / GooglePayParams / LinkParams
 * - 组件类型：CardFieldInput（Details/Styles/Placeholders/ValidationState）/
 *   CardFormView / AuBECSDebitFormComponent / ThreeDSecure.ConfigurationParams
 */

import React from 'react';

import {
  AddressCollectionMode,
  BillingDetails,
  CardBrand,
  CollectionMode,
  Constants,
  LinkDisplay,
  PaymentMethodLayout,
  PaymentSheet,
  PlatformPay,
  ThreeDSecure,
  AuBECSDebitFormComponent,
  CardFieldInput,
  CardFormView,
  type EdgeInsetsConfig,
  type FlatConfig,
  type FloatingConfig,
  type FontConfig,
  type GlobalColorConfig,
  type Mode,
  type PaymentMethodOptions,
  type PresentOptions,
  type PrimaryButtonColorConfig,
  type PrimaryButtonConfig,
  type RadioConfig,
  type CheckmarkConfig,
  type DisclosureConfig,
  type ShadowConfig,
  type ApplePayParams,
  type CustomPaymentMethod,
  type CustomPaymentMethodConfiguration,
  type CustomPaymentMethodResult,
  type ConfirmCustomPaymentMethodCallback,
  type GooglePayParams,
  type LinkParams,
} from '@stripe/stripe-react-native';

import {
  DemoScreen,
  JsonCard,
  Section,
} from './demoHelpers';

// ---------------------------------------------------------------------------
// PaymentSheet 类型样例
// ---------------------------------------------------------------------------

const appearanceParamsSample: PaymentSheet.AppearanceParams = {
  font: {family: 'HarmonyOS Sans', scale: 1.0},
  colors: {
    primary: '#635BFF',
    background: '#FFFFFF',
    componentBackground: '#F6F6F8',
    componentBorder: '#E6E6EB',
    componentDivider: '#EDEDF0',
    primaryText: '#1B1D30',
    secondaryText: '#686A8A',
    componentText: '#3F4152',
    placeholderText: '#9B9BB4',
    icon: '#635BFF',
  },
  shapes: {
    borderRadius: 10,
    borderWidth: 1,
    shadow: {color: '#000000', opacity: 0.06, offset: {x: 0, y: 2}, blurRadius: 4},
  },
  primaryButton: {
    font: {family: 'HarmonyOS Sans'},
    colors: {
      background: '#635BFF',
      border: '#4F49D6',
      successBackgroundColor: '#0F9D58',
      successTextColor: '#FFFFFF',
    },
  },
  formInsetValues: {top: 12, left: 16, bottom: 12, right: 16},
  applyLiquidGlass: false,
  navigationBarStyle: PaymentSheet.NavigationBarStyle.Glass,
};

const customPaymentMethodSample: CustomPaymentMethod = {
  id: 'cpmt_ohos_demo',
  subtitle: 'Demo custom payment method',
  disableBillingDetailCollection: false,
};

const customPaymentMethodConfigurationSample: CustomPaymentMethodConfiguration = {
  customPaymentMethods: [customPaymentMethodSample],
  confirmCustomPaymentMethodCallback: ((
    paymentMethod: CustomPaymentMethod,
    billingDetails: BillingDetails,
  ) => {
    console.log('[PaymentSheetTypesDemo] confirmCustomPaymentMethodCallback:', paymentMethod.id);
    const result: CustomPaymentMethodResult = {
      status: PaymentSheet.CustomPaymentMethodResultStatus.Completed,
    };
    return Promise.resolve(result);
  }) as ConfirmCustomPaymentMethodCallback,
};

const intentConfigurationSample: PaymentSheet.IntentConfiguration = {
  confirmHandler: (paymentMethod, shouldSavePaymentMethod, intentCreationCallback) => {
    console.log(
      '[PaymentSheetTypesDemo] confirmHandler:',
      paymentMethod.id,
      shouldSavePaymentMethod,
    );
    intentCreationCallback({clientSecret: 'pi_test_ohos_demo_secret'});
  },
  confirmationTokenConfirmHandler: (confirmationToken, intentCreationCallback) => {
    console.log('[PaymentSheetTypesDemo] confirmationTokenConfirmHandler:', confirmationToken.id);
    intentCreationCallback({clientSecret: 'pi_test_ohos_demo_secret'});
  },
  mode: {
    amount: 2999,
    currencyCode: 'usd',
    captureMethod: PaymentSheet.CaptureMethod.Automatic,
    setupFutureUsage: 'OffSession',
    paymentMethodOptions: {setupFutureUsageValues: {card: 'OffSession', link: 'OnSession'}},
  },
  // 注：鸿蒙化 IntentConfiguration 未含 customPaymentMethodConfiguration 字段，
  // CustomPaymentMethodConfiguration 以独立样例展示
};

// Mode 三变体：PaymentMode / SetupMode（联合类型 Mode）
const paymentModeSample: PaymentSheet.PaymentMode = {
  amount: 1999,
  currencyCode: 'usd',
  setupFutureUsage: 'OffSession',
  captureMethod: PaymentSheet.CaptureMethod.Automatic,
  paymentMethodOptions: {setupFutureUsageValues: {card: 'OffSession'}},
};
const setupModeSample: PaymentSheet.SetupMode = {
  currencyCode: 'usd',
  setupFutureUsage: 'OffSession',
};

const applePayParamsSample: ApplePayParams = {
  merchantCountryCode: 'US',
  cartItems: [
    {
      paymentType: PlatformPay.PaymentType.Immediate,
      label: 'Demo Widget',
      amount: '19.99',
    },
  ],
  buttonType: PlatformPay.ButtonType.Buy,
  // request 为请求对象（Recurring/AutomaticReload/MultiMerchant 之一），非枚举值
  request: {
    type: PlatformPay.PaymentRequestType.Recurring,
    description: 'Monthly subscription',
    managementUrl: 'https://example.com/subscriptions',
    billing: {
      paymentType: PlatformPay.PaymentType.Recurring,
      intervalUnit: PlatformPay.IntervalUnit.Month,
      intervalCount: 1,
      label: 'Demo Subscription',
      amount: '9.99',
    },
  },
};

const googlePayParamsSample: GooglePayParams = {
  merchantCountryCode: 'US',
  currencyCode: 'USD',
  testEnv: true,
  label: 'Demo Widget',
  amount: '19.99',
};

const linkParamsSample: LinkParams = {display: LinkDisplay.AUTOMATIC};

const billingDetailsCollectionConfigurationSample: PaymentSheet.BillingDetailsCollectionConfiguration =
  {
    name: CollectionMode.ALWAYS,
    phone: CollectionMode.AUTOMATIC,
    email: CollectionMode.NEVER,
    address: AddressCollectionMode.FULL,
    attachDefaultsToPaymentMethod: true,
  };

const paymentOptionSample: PaymentSheet.PaymentOption = {
  label: 'Visa •••• 4242',
  image: 'iVBORw0KGgoAAAANSUhEUg==',
};

const intentCreationErrorSample: PaymentSheet.IntentCreationError = {
  code: 'Failed',
  message: 'intent creation failed (demo)',
  localizedMessage: 'intent creation failed (demo)',
  declineCode: 'insufficient_funds',
  stripeErrorCode: 'card_insufficient_funds',
};

// ---------------------------------------------------------------------------
// 组件类型样例
// ---------------------------------------------------------------------------

const cardFieldDetailsSample: CardFieldInput.Details = {
  last4: '4242',
  expiryMonth: 12,
  expiryYear: 2030,
  postalCode: '94103',
  brand: 'Visa',
  complete: true,
  validExpiryDate: CardFieldInput.ValidationState.Valid,
  validCVC: CardFieldInput.ValidationState.Valid,
  validNumber: CardFieldInput.ValidationState.Valid,
  number: '4242424242424242',
  cvc: '123',
};

const cardFieldStylesSample: CardFieldInput.Styles = {
  borderWidth: 1,
  backgroundColor: '#F6F6F8',
  borderColor: '#E6E6EB',
  borderRadius: 8,
  textColor: '#1B1D30',
  fontSize: 15,
  placeholderColor: '#9B9BB4',
  cursorColor: '#635BFF',
  textErrorColor: '#E0457B',
  fontFamily: 'HarmonyOS Sans',
};

const cardFieldPlaceholdersSample: CardFieldInput.Placeholders = {
  number: '4242 4242 4242 4242',
  expiration: 'MM/YY',
  cvc: 'CVC',
  postalCode: 'ZIP',
};

const cardFormDetailsSample: CardFormView.Details = {
  last4: '4242',
  expiryMonth: 12,
  expiryYear: 2030,
  postalCode: '94103',
  brand: 'Visa',
  complete: true,
  country: 'US',
  number: '4242424242424242',
  cvc: '123',
};

const cardFormStylesSample: CardFormView.Styles = {
  backgroundColor: '#F6F6F8',
  borderWidth: 1,
  borderColor: '#E6E6EB',
  borderRadius: 8,
  textColor: '#1B1D30',
  fontSize: 15,
  placeholderColor: '#9B9BB4',
  cursorColor: '#635BFF',
  textErrorColor: '#E0457B',
  fontFamily: 'HarmonyOS Sans',
};

const cardFormPlaceholdersSample: CardFormView.Placeholders = {
  number: '4242 4242 4242 4242',
  expiration: 'MM/YY',
  cvc: 'CVC',
  postalCode: 'ZIP',
};

const cardFormDefaultValuesSample: CardFormView.DefaultValues = {
  countryCode: 'US',
};

const aubecsFormDetailsSample: AuBECSDebitFormComponent.FormDetails = {
  accountNumber: '000123456',
  bsbNumber: '000000',
  email: 'demo@example.com',
  name: 'Demo User',
};

const aubecsStylesSample: AuBECSDebitFormComponent.Styles = {
  borderWidth: 1,
  backgroundColor: '#F6F6F8',
  borderColor: '#E6E6EB',
  borderRadius: 8,
  textColor: '#1B1D30',
  fontSize: 15,
  placeholderColor: '#9B9BB4',
  textErrorColor: '#E0457B',
};

const threeDSecureConfigurationSample: ThreeDSecure.ConfigurationParams = {
  timeout: 5,
  label: {
    headingTextColor: '#1B1D30',
    textColor: '#3F4152',
    textFontSize: 13,
    headingFontSize: 15,
  },
  navigationBar: {
    headerText: '3DS 验证',
    buttonText: '取消',
    textColor: '#1B1D30',
    textFontSize: 15,
    barStyle: ThreeDSecure.NavigationBarStyle.default,
    translucent: false,
    barTintColor: '#FFFFFF',
    statusBarColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
  },
  textField: {
    borderColor: '#E6E6EB',
    borderWidth: 1,
    borderRadius: 8,
    textColor: '#1B1D30',
    textFontSize: 15,
  },
  submitButton: {
    backgroundColor: '#635BFF',
    borderRadius: 8,
    textColor: '#FFFFFF',
    textFontSize: 15,
  },
  cancelButton: {
    backgroundColor: '#F6F6F8',
    borderRadius: 8,
    textColor: '#1B1D30',
    textFontSize: 15,
  },
  continueButton: {
    backgroundColor: '#635BFF',
    borderRadius: 8,
    textColor: '#FFFFFF',
    textFontSize: 15,
  },
  nextButton: {
    backgroundColor: '#635BFF',
    borderRadius: 8,
    textColor: '#FFFFFF',
    textFontSize: 15,
  },
  resendButton: {
    backgroundColor: '#F6F6F8',
    borderRadius: 8,
    textColor: '#1B1D30',
    textFontSize: 15,
  },
  backgroundColor: '#FFFFFF',
  footer: {
    backgroundColor: '#F6F6F8',
    chevronColor: '#635BFF',
    headingTextColor: '#1B1D30',
    textColor: '#686A8A',
  },
  accentColor: '#635BFF',
};

// ---------------------------------------------------------------------------
// 嵌套配置类型样例（类型名引用：外观树/行样式树的子类型）
// ---------------------------------------------------------------------------

const fontConfigSample: FontConfig = {family: 'HarmonyOS Sans', scale: 1.0};

const shadowConfigSample: ShadowConfig = {
  color: '#000000',
  opacity: 0.06,
  offset: {x: 0, y: 2},
  blurRadius: 4,
};

const globalColorConfigSample: GlobalColorConfig = {
  primary: '#635BFF',
  background: '#FFFFFF',
  componentBackground: '#F6F6F8',
  componentBorder: '#E6E6EB',
  componentDivider: '#EDEDF0',
  primaryText: '#1B1D30',
  secondaryText: '#686A8A',
  componentText: '#3F4152',
  placeholderText: '#9B9BB4',
  icon: '#635BFF',
  error: '#E0457B',
};

const primaryButtonColorConfigSample: PrimaryButtonColorConfig = {
  background: '#635BFF',
  text: '#FFFFFF',
  border: '#4F49D6',
  successBackgroundColor: '#0F9D58',
  successTextColor: '#FFFFFF',
};

const primaryButtonConfigSample: PrimaryButtonConfig = {
  font: fontConfigSample,
  colors: primaryButtonColorConfigSample,
  shapes: {borderRadius: 8, borderWidth: 0, shadow: shadowConfigSample, height: 44},
};

const edgeInsetsConfigSample: EdgeInsetsConfig = {top: 12, left: 16, bottom: 12, right: 16};

const radioConfigSample: RadioConfig = {selectedColor: '#635BFF', unselectedColor: '#C7C7D1'};

const checkmarkConfigSample: CheckmarkConfig = {color: '#635BFF'};

const disclosureConfigSample: DisclosureConfig = {color: '#9B9BB4'};

const flatConfigSample: FlatConfig = {
  separatorThickness: 1,
  separatorColor: '#E6E6EB',
  separatorInsets: edgeInsetsConfigSample,
  topSeparatorEnabled: false,
  bottomSeparatorEnabled: true,
  radio: radioConfigSample,
  checkmark: checkmarkConfigSample,
  disclosure: disclosureConfigSample,
};

const floatingConfigSample: FloatingConfig = {spacing: 8};

const modeSample: Mode = paymentModeSample;

const paymentMethodOptionsSample: PaymentMethodOptions = {
  setupFutureUsageValues: {card: 'OffSession', link: 'OnSession'},
};

const presentOptionsSample: PresentOptions = {timeout: 60000};

// ---------------------------------------------------------------------------
// Demo 组件
// ---------------------------------------------------------------------------

export function PaymentSheetTypesDemo() {
  return (
    <DemoScreen
      title="PaymentSheet / 组件类型样例"
      description="P2 补充用例：以类型化字面量覆盖 PaymentSheet 外观树、IntentConfiguration、CustomPaymentMethod、ApplePay/GooglePay/Link 参数与 Card/3DS 组件类型的未覆盖字段。">
      <Section
        title="PaymentSheet.AppearanceParams（全字段）"
        description="colors（GlobalColorConfig 11 色）/ shadows / primaryButton（colors+font+text）/ formInsetValues / font / shapes / applyLiquidGlass / navigationBarStyle。">
        <JsonCard label="AppearanceParams 样例" value={appearanceParamsSample} />
      </Section>

      <Section
        title="IntentConfiguration / Mode / CustomPaymentMethod"
        description="confirmHandler + confirmationTokenConfirmHandler 二选一；customPaymentMethodConfiguration 携带 confirmCustomPaymentMethodCallback 回调。">
        <JsonCard
          label="IntentConfiguration 样例"
          value={{
            mode: intentConfigurationSample.mode,
            customPaymentMethodConfiguration: {
              customPaymentMethods: [customPaymentMethodSample],
            },
          }}
        />
        <JsonCard label="PaymentMode 样例" value={paymentModeSample} />
        <JsonCard label="SetupMode 样例" value={setupModeSample} />
        <JsonCard label="CustomPaymentMethod 样例" value={customPaymentMethodSample} />
        <JsonCard
          label="CustomPaymentMethodConfiguration 样例"
          value={customPaymentMethodConfigurationSample.customPaymentMethods}
        />
        <JsonCard
          label="CustomPaymentMethodResult / ResultStatus 枚举"
          value={{
            status: PaymentSheet.CustomPaymentMethodResultStatus.Completed,
          }}
        />
      </Section>

      <Section
        title="平台支付参数 / 收集配置 / PaymentOption"
        description="ApplePayParams（含 request PaymentRequestType）/ GooglePayParams / LinkParams / BillingDetailsCollectionConfiguration / PaymentOption。">
        <JsonCard label="ApplePayParams 样例" value={applePayParamsSample} />
        <JsonCard label="GooglePayParams 样例" value={googlePayParamsSample} />
        <JsonCard label="LinkParams 样例" value={linkParamsSample} />
        <JsonCard
          label="BillingDetailsCollectionConfiguration 样例"
          value={billingDetailsCollectionConfigurationSample}
        />
        <JsonCard label="PaymentOption 样例" value={paymentOptionSample} />
        <JsonCard label="IntentCreationError 样例" value={intentCreationErrorSample} />
      </Section>

      <Section
        title="组件类型（CardFieldInput / CardFormView / AuBECSDebitForm / ThreeDSecure）"
        description="Details / Styles / Placeholders / DefaultValues / FormDetails / ConfigurationParams 全字段。">
        <JsonCard label="CardFieldInput.Details 样例" value={cardFieldDetailsSample} />
        <JsonCard label="CardFieldInput.Styles 样例" value={cardFieldStylesSample} />
        <JsonCard
          label="CardFieldInput.Placeholders 样例"
          value={cardFieldPlaceholdersSample}
        />
        <JsonCard
          label="CardFieldInput.ValidationState 枚举引用"
          value={{
            Valid: CardFieldInput.ValidationState.Valid,
            Invalid: CardFieldInput.ValidationState.Invalid,
            Incomplete: CardFieldInput.ValidationState.Incomplete,
            Unknown: CardFieldInput.ValidationState.Unknown,
          }}
        />
        <JsonCard label="CardFormView.Details 样例" value={cardFormDetailsSample} />
        <JsonCard label="CardFormView.Styles 样例" value={cardFormStylesSample} />
        <JsonCard
          label="CardFormView.Placeholders 样例"
          value={cardFormPlaceholdersSample}
        />
        <JsonCard
          label="CardFormView.DefaultValues 样例"
          value={cardFormDefaultValuesSample}
        />
        <JsonCard
          label="AuBECSDebitFormComponent.FormDetails 样例"
          value={aubecsFormDetailsSample}
        />
        <JsonCard
          label="AuBECSDebitFormComponent.Styles 样例"
          value={aubecsStylesSample}
        />
        <JsonCard
          label="ThreeDSecure.ConfigurationParams 样例"
          value={threeDSecureConfigurationSample}
        />
        <JsonCard
          label="PaymentMethodLayout / Constants 引用"
          value={{
            layoutHorizontal: PaymentMethodLayout.Horizontal,
            layoutVertical: PaymentMethodLayout.Vertical,
            layoutAutomatic: PaymentMethodLayout.Automatic,
            apiVersions: Constants.API_VERSIONS,
            systemInfo: Constants.SYSTEM_INFO,
          }}
        />
      </Section>

      <Section
        title="嵌套配置类型（外观树 / 行样式树子类型）"
        description="FontConfig / ShadowConfig / GlobalColorConfig（10 色）/ PrimaryButtonConfig / PrimaryButtonColorConfig / EdgeInsetsConfig / RadioConfig / CheckmarkConfig / DisclosureConfig / FlatConfig / FloatingConfig / Mode / PaymentMethodOptions / PresentOptions + RowStyle 枚举。">
        <JsonCard
          label="外观树子类型样例"
          value={{
            font: fontConfigSample,
            shadow: shadowConfigSample,
            colors: globalColorConfigSample,
            primaryButton: primaryButtonConfigSample,
            edgeInsets: edgeInsetsConfigSample,
          }}
        />
        <JsonCard
          label="行样式树子类型样例"
          value={{
            radio: radioConfigSample,
            checkmark: checkmarkConfigSample,
            disclosure: disclosureConfigSample,
            flat: flatConfigSample,
            floating: floatingConfigSample,
          }}
        />
        <JsonCard
          label="Mode / PaymentMethodOptions / PresentOptions 样例"
          value={{mode: modeSample, paymentMethodOptions: paymentMethodOptionsSample, presentOptions: presentOptionsSample}}
        />
        <JsonCard
          label="PaymentSheet.RowStyle 枚举引用"
          value={{
            FlatWithRadio: PaymentSheet.RowStyle.FlatWithRadio,
            FloatingButton: PaymentSheet.RowStyle.FloatingButton,
            FlatWithCheckmark: PaymentSheet.RowStyle.FlatWithCheckmark,
            FlatWithDisclosure: PaymentSheet.RowStyle.FlatWithDisclosure,
          }}
        />
      </Section>
    </DemoScreen>
  );
}
