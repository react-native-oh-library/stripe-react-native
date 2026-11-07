/**
 * StripeSdk TurboModule 方法直达 Demo（覆盖补充）
 *
 * 为尚未直达调用的每个 StripeSdk spec 方法提供按钮，直接调用
 * NativeStripeSdk.<method> 并在结果框观察鸿蒙 ArkTS 实现的降级返回
 * （notSupported / 结构化 StripeError / false / null）。
 * 参数为最小合成占位，不触发真实支付。
 */

import React from 'react';

import {
  AddToWalletButtonProps,
  Address,
  AddressCollectionMode,
  AddressDetails,
  AddressSheetError,
  AddressSheetProps,
  AllowRedisplay,
  AppInfo,
  AppearanceParams,
  ApplePayError,
  ApplePayParams,
  ApplePayResult,
  AuBECSDebitFormProps,
  BillingDetails,
  BillingDetailsCollectionConfiguration,
  CanAddCardToWalletParams,
  CanAddCardToWalletResult,
  CanAddCardToWalletStatus,
  CaptureMethod,
  CardActionError,
  CardBrand,
  CardBrandAcceptance,
  CardBrandAcceptanceFilter,
  CardBrandCategory,
  CardFieldProps,
  CardFormProps,
  CardFundingFiltering,
  CardFundingType,
  CheckmarkConfig,
  Checkout,
  CheckoutController,
  CheckoutPaymentElement,
  CheckoutPaymentElementViewProps,
  ClientSecretProvider,
  CollectBankAccountError,
  CollectBankAccountForPaymentResult,
  CollectBankAccountForSetupResult,
  CollectionMode,
  ConfirmCustomPaymentMethodCallback,
  ConfirmPaymentError,
  ConfirmPaymentResult,
  ConfirmPaymentSheetPaymentResult,
  ConfirmSetupIntentError,
  ConfirmSetupIntentResult,
  CreateGooglePayPaymentMethodResult,
  CreatePaymentMethodError,
  CreatePaymentMethodResult,
  CreateRadarSessionResult,
  CreateTokenError,
  CreateTokenForCVCUpdateResult,
  CreateTokenResult,
  CustomPaymentMethod,
  CustomPaymentMethodConfiguration,
  CustomPaymentMethodResult,
  CustomPaymentMethodResultStatus,
  CustomerAdapter,
  CustomerPaymentOption,
  CustomerSessionClientSecret,
  CustomerSheetError,
  CustomerSheetInitParams,
  CustomerSheetIntentConfiguration,
  CustomerSheetPresentParams,
  CustomerSheetProps,
  CustomerSheetResult,
  Dictionary,
  DisclosureConfig,
  EdgeInsetsConfig,
  EmbeddedFormSheetAction,
  EmbeddedPaymentElementAppearance,
  EmbeddedPaymentElementConfiguration,
  EmbeddedPaymentElementResult,
  EmbeddedRowSelectionBehavior,
  ErrorType,
  FlatConfig,
  FloatingConfig,
  FontConfig,
  GlobalColorConfig,
  GooglePayCardToken,
  GooglePayCardTokenStatus,
  GooglePayError,
  GooglePayInitResult,
  GooglePayParams,
  HandleNextActionForSetupResult,
  HandleNextActionResult,
  InitPaymentSheetResult,
  InitStripeParams,
  InitialiseParams,
  IntentConfiguration,
  IntentCreationCallbackParams,
  IntentCreationError,
  IntentParams,
  IsCardInWalletResult,
  LinkControllerError,
  LinkDisplay,
  LinkParams,
  Mode,
  NativeProps,
  NavigationBarProps,
  NavigationBarStyle,
  OnStateChangeEvent,
  OpenApplePaySetupResult,
  PayWithGooglePayResult,
  PaymentMethodLayout,
  PaymentMethodMessagingElementAppearance,
  PaymentMethodMessagingElementConfiguration,
  PaymentMethodMessagingElementFont,
  PaymentMethodMessagingElementProps,
  PaymentMethodMessagingElementState,
  PaymentMethodMessagingElementStyle,
  PaymentMethodOptions,
  PaymentMethodPreview,
  PaymentMode,
  PaymentOption,
  PaymentOptionDisplayData,
  PaymentSheetError,
  PlatformPayButtonProps,
  PlatformPayError,
  PresentOptions,
  PresentPaymentSheetResult,
  PrimaryButtonColorConfig,
  PrimaryButtonConfig,
  Props,
  RadarError,
  RadioConfig,
  Result,
  RetrievePaymentIntentError,
  RetrievePaymentIntentResult,
  RetrieveSetupIntentError,
  RetrieveSetupIntentResult,
  RowConfig,
  RowStyle,
  SetupMode,
  SetupParams,
  SetupParamsBase,
  ShadowConfig,
  ShippingDetails,
  StripeConnectInitParams,
  StripeConnectInstance,
  StripeConnectUpdateParams,
  StripeContainerProps,
  StripeError,
  StripeProviderProps,
  TermsDisplay,
  ThemedColor,
  UseEmbeddedPaymentElementResult,
  VerifyMicrodepositsError,
  VerifyMicrodepositsForPaymentResult,
  VerifyMicrodepositsForSetupResult,
  VerifyMicrodepositsParams,
} from '@stripe/stripe-react-native';

// OHOS 库内未从根 index 再导出的 string enum：成员引用（而非裸字面量）才可赋值
import {
  ApplePaySheetErrorType,
  BillingAddressFormat,
  InvalidShippingField,
  PaymentType,
} from '@stripe/stripe-react-native/src/types/PlatformPay';
import {LinkPaymentMethodType} from '@stripe/stripe-react-native/src/types/LinkController';

// TurboModule 直达：与库内 src/functions.ts 同一导入方式
import NativeStripeSdk from '@stripe/stripe-react-native/src/specs/v1/NativeStripeSdkModule';

import {ActionButton, DemoScreen, ResultBlock, Section, useDemoRunner} from './demoHelpers';

const callinitialise = () => NativeStripeSdk.initialise({appInfo: {name: 'ohos_demo', partnerId: 'ohos_demo', url: 'ohos_demo', version: 'ohos_demo'}, publishableKey: 'ohos_demo', stripeAccountId: 'ohos_demo', threeDSecureParams: {timeout: 1, label: {headingTextColor: 'ohos_demo', textColor: 'ohos_demo', textFontSize: 1, headingFontSize: 1}, navigationBar: {headerText: 'ohos_demo', buttonText: 'ohos_demo', textColor: 'ohos_demo', textFontSize: 1, barStyle: 0, translucent: true, barTintColor: 'ohos_demo', statusBarColor: 'ohos_demo', backgroundColor: 'ohos_demo'}, textField: {borderColor: 'ohos_demo', borderWidth: 1, borderRadius: 1, textColor: 'ohos_demo', textFontSize: 1}, submitButton: {backgroundColor: 'ohos_demo', borderRadius: 1, textColor: 'ohos_demo', textFontSize: 1}, cancelButton: {backgroundColor: 'ohos_demo', borderRadius: 1, textColor: 'ohos_demo', textFontSize: 1}, continueButton: {backgroundColor: 'ohos_demo', borderRadius: 1, textColor: 'ohos_demo', textFontSize: 1}, nextButton: {backgroundColor: 'ohos_demo', borderRadius: 1, textColor: 'ohos_demo', textFontSize: 1}, resendButton: {backgroundColor: 'ohos_demo', borderRadius: 1, textColor: 'ohos_demo', textFontSize: 1}, backgroundColor: 'ohos_demo', footer: {backgroundColor: 'ohos_demo', chevronColor: 'ohos_demo', headingTextColor: 'ohos_demo', textColor: 'ohos_demo'}, accentColor: 'ohos_demo'}, merchantIdentifier: 'ohos_demo', urlScheme: 'ohos_demo', setReturnUrlSchemeOnAndroid: true});
const callcreatePaymentMethod = () => NativeStripeSdk.createPaymentMethod({paymentMethodType: "Card", paymentMethodData: {token: 'ohos_demo', billingDetails: {email: 'ohos_demo', phone: 'ohos_demo', name: 'ohos_demo', address: {city: 'ohos_demo', country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', postalCode: 'ohos_demo', state: 'ohos_demo'}}}}, {setupFutureUsage: "OffSession"});
const callhandleNextAction = () => NativeStripeSdk.handleNextAction('ohos_demo', 'ohos_demo');
const callhandleNextActionForSetup = () => NativeStripeSdk.handleNextActionForSetup('ohos_demo', 'ohos_demo');
const callconfirmPayment = () => NativeStripeSdk.confirmPayment('ohos_demo', {paymentMethodType: "Card", paymentMethodData: {token: 'ohos_demo', billingDetails: {email: 'ohos_demo', phone: 'ohos_demo', name: 'ohos_demo', address: {city: 'ohos_demo', country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', postalCode: 'ohos_demo', state: 'ohos_demo'}}, mandateData: {customerAcceptance: {online: null}}, metadata: null}}, {setupFutureUsage: "OffSession"});
const callconfirmSetupIntent = () => NativeStripeSdk.confirmSetupIntent('ohos_demo', {paymentMethodType: "Card", paymentMethodData: {token: 'ohos_demo', billingDetails: {email: 'ohos_demo', phone: 'ohos_demo', name: 'ohos_demo', address: {city: 'ohos_demo', country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', postalCode: 'ohos_demo', state: 'ohos_demo'}}, mandateData: {customerAcceptance: {online: null}}, metadata: null}}, {setupFutureUsage: "OffSession"});
const callretrievePaymentIntent = () => NativeStripeSdk.retrievePaymentIntent('ohos_demo');
const callretrieveSetupIntent = () => NativeStripeSdk.retrieveSetupIntent('ohos_demo');
const callinitPaymentSheet = () => NativeStripeSdk.initPaymentSheet(null);
const callintentCreationCallback = () => NativeStripeSdk.intentCreationCallback({clientSecret: 'ohos_demo', error: undefined as never});
const callconfirmationTokenCreationCallback = () => NativeStripeSdk.confirmationTokenCreationCallback({clientSecret: 'ohos_demo', error: undefined as never});
const callcustomPaymentMethodResultCallback = () => NativeStripeSdk.customPaymentMethodResultCallback({status: CustomPaymentMethodResultStatus.Completed});
const callpresentPaymentSheet = () => NativeStripeSdk.presentPaymentSheet({timeout: 1});
const callconfirmPaymentSheetPayment = () => NativeStripeSdk.confirmPaymentSheetPayment();
const callcreateTokenForCVCUpdate = () => NativeStripeSdk.createTokenForCVCUpdate('ohos_demo');
const callhandleURLCallback = () => NativeStripeSdk.handleURLCallback('ohos_demo');
const callcreateToken = () => NativeStripeSdk.createToken({type: "Card", address: {city: 'ohos_demo', country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', postalCode: 'ohos_demo', state: 'ohos_demo'}, name: 'ohos_demo', currency: 'ohos_demo'});
const callopenApplePaySetup = () => NativeStripeSdk.openApplePaySetup();
const callverifyMicrodeposits = () => NativeStripeSdk.verifyMicrodeposits(true, 'ohos_demo', {amounts: [1], descriptorCode: null});
const callcollectBankAccount = () => NativeStripeSdk.collectBankAccount(true, 'ohos_demo', {paymentMethodType: "USBankAccount", paymentMethodData: {billingDetails: {name: 'ohos_demo', email: 'ohos_demo'}, accountNumber: 'ohos_demo', routingNumber: 'ohos_demo', accountHolderType: "individual"}, style: "alwaysLight"});
const callgetConstants = () => NativeStripeSdk.getConstants();
const callcanAddCardToWallet = () => NativeStripeSdk.canAddCardToWallet({primaryAccountIdentifier: 'ohos_demo', cardLastFour: 'ohos_demo', cardBrand: 'ohos_demo', testEnv: true, hasPairedAppleWatch: true, supportsTapToPay: true});
const callisCardInWallet = () => NativeStripeSdk.isCardInWallet({cardLastFour: 'ohos_demo'});
const callcollectBankAccountToken = () => NativeStripeSdk.collectBankAccountToken('ohos_demo', {style: "alwaysLight", onEvent: () => undefined, connectedAccountId: 'ohos_demo'});
const callcollectFinancialConnectionsAccounts = () => NativeStripeSdk.collectFinancialConnectionsAccounts('ohos_demo', {style: "alwaysLight", onEvent: () => undefined, connectedAccountId: 'ohos_demo'});
const callresetPaymentSheetCustomer = () => NativeStripeSdk.resetPaymentSheetCustomer();
const callisPlatformPaySupported = () => NativeStripeSdk.isPlatformPaySupported({googlePay: {testEnv: true, existingPaymentMethodRequired: true}});
const callcreatePlatformPayPaymentMethod = () => NativeStripeSdk.createPlatformPayPaymentMethod({googlePay: null, applePay: null}, true);
const calldismissPlatformPay = () => NativeStripeSdk.dismissPlatformPay();
const callupdatePlatformPaySheet = () => NativeStripeSdk.updatePlatformPaySheet([{paymentType: PaymentType.Deferred, deferredDate: 1, label: 'ohos_demo', amount: 'ohos_demo'}], [{label: 'ohos_demo', amount: 'ohos_demo', isPending: true, identifier: 'ohos_demo', detail: 'ohos_demo', startDate: 1, endDate: 1}], [{errorType: ApplePaySheetErrorType.InvalidShippingAddress, field: InvalidShippingField.Street, message: 'ohos_demo'}]);
const callconfirmPlatformPay = () => NativeStripeSdk.confirmPlatformPay('ohos_demo', {googlePay: {testEnv: true, merchantCountryCode: 'ohos_demo', currencyCode: 'ohos_demo', merchantName: 'ohos_demo', isEmailRequired: true, allowCreditCards: true, existingPaymentMethodRequired: true, billingAddressConfig: {isRequired: true, isPhoneNumberRequired: true, format: BillingAddressFormat.Full}, label: 'ohos_demo', amount: 1}, applePay: null}, true);
const callconfigureOrderTracking = () => NativeStripeSdk.configureOrderTracking('ohos_demo', 'ohos_demo', 'ohos_demo', 'ohos_demo');
const callcreateRadarSession = () => NativeStripeSdk.createRadarSession();
const callsetFinancialConnectionsForceNativeFlow = () => NativeStripeSdk.setFinancialConnectionsForceNativeFlow(true);
const callopenAuthenticatedWebView = () => NativeStripeSdk.openAuthenticatedWebView('ohos_demo', 'ohos_demo');
const callpresentExternalWebPage = () => NativeStripeSdk.presentExternalWebPage('ohos_demo');
const calldownloadAndShareFile = () => NativeStripeSdk.downloadAndShareFile('ohos_demo', 'ohos_demo');
const callauthWebViewDeepLinkHandled = () => NativeStripeSdk.authWebViewDeepLinkHandled('ohos_demo');
const callstoreStripeConnectDeepLink = () => NativeStripeSdk.storeStripeConnectDeepLink('ohos_demo');
const callpollAndClearPendingStripeConnectUrls = () => NativeStripeSdk.pollAndClearPendingStripeConnectUrls();
const callinitLinkController = () => NativeStripeSdk.initLinkController({email: 'ohos_demo', merchantDisplayName: 'ohos_demo', supportedPaymentMethodTypes: [LinkPaymentMethodType.Card], paymentMethodTypes: ['ohos_demo'], phoneNumber: 'ohos_demo', allowLogout: true, billingDetailsCollectionConfiguration: {name: CollectionMode.AUTOMATIC, phone: CollectionMode.AUTOMATIC, email: CollectionMode.AUTOMATIC, address: AddressCollectionMode.AUTOMATIC, attachDefaultsToPaymentMethod: true}, appearance: {lightColors: {primary: 'ohos_demo', contentOnPrimary: 'ohos_demo', borderSelected: 'ohos_demo'}, darkColors: {primary: 'ohos_demo', contentOnPrimary: 'ohos_demo', borderSelected: 'ohos_demo'}, style: "AUTOMATIC", primaryButton: {cornerRadius: 1, height: 1}, reduceLinkBranding: true}});
const callpresentLinkController = () => NativeStripeSdk.presentLinkController();
const callconfirmLinkControllerSetupIntent = () => NativeStripeSdk.confirmLinkControllerSetupIntent({clientSecret: 'ohos_demo'});
const calladdListener = () => NativeStripeSdk.addListener('ohos_demo');
const callremoveListeners = () => NativeStripeSdk.removeListeners(1);

export function StripeSdkMethodsDemo() {
  const {results, run} = useDemoRunner();
  return (
    <DemoScreen title="StripeSdk 方法直达（降级观察）" description="">
      <Section title={"方法直达 1/5"} description="">
        <ActionButton method="initialise" onPress={() => run('initialise', callinitialise)} />
        <ResultBlock method="initialise" results={results} />
        <ActionButton method="createPaymentMethod" onPress={() => run('createPaymentMethod', callcreatePaymentMethod)} />
        <ResultBlock method="createPaymentMethod" results={results} />
        <ActionButton method="handleNextAction" onPress={() => run('handleNextAction', callhandleNextAction)} />
        <ResultBlock method="handleNextAction" results={results} />
        <ActionButton method="handleNextActionForSetup" onPress={() => run('handleNextActionForSetup', callhandleNextActionForSetup)} />
        <ResultBlock method="handleNextActionForSetup" results={results} />
        <ActionButton method="confirmPayment" onPress={() => run('confirmPayment', callconfirmPayment)} />
        <ResultBlock method="confirmPayment" results={results} />
        <ActionButton method="confirmSetupIntent" onPress={() => run('confirmSetupIntent', callconfirmSetupIntent)} />
        <ResultBlock method="confirmSetupIntent" results={results} />
        <ActionButton method="retrievePaymentIntent" onPress={() => run('retrievePaymentIntent', callretrievePaymentIntent)} />
        <ResultBlock method="retrievePaymentIntent" results={results} />
        <ActionButton method="retrieveSetupIntent" onPress={() => run('retrieveSetupIntent', callretrieveSetupIntent)} />
        <ResultBlock method="retrieveSetupIntent" results={results} />
        <ActionButton method="initPaymentSheet" onPress={() => run('initPaymentSheet', callinitPaymentSheet)} />
        <ResultBlock method="initPaymentSheet" results={results} />
        <ActionButton method="intentCreationCallback" onPress={() => run('intentCreationCallback', callintentCreationCallback)} />
        <ResultBlock method="intentCreationCallback" results={results} />
      </Section>
      <Section title={"方法直达 2/5"} description="">
        <ActionButton method="confirmationTokenCreationCallback" onPress={() => run('confirmationTokenCreationCallback', callconfirmationTokenCreationCallback)} />
        <ResultBlock method="confirmationTokenCreationCallback" results={results} />
        <ActionButton method="customPaymentMethodResultCallback" onPress={() => run('customPaymentMethodResultCallback', callcustomPaymentMethodResultCallback)} />
        <ResultBlock method="customPaymentMethodResultCallback" results={results} />
        <ActionButton method="presentPaymentSheet" onPress={() => run('presentPaymentSheet', callpresentPaymentSheet)} />
        <ResultBlock method="presentPaymentSheet" results={results} />
        <ActionButton method="confirmPaymentSheetPayment" onPress={() => run('confirmPaymentSheetPayment', callconfirmPaymentSheetPayment)} />
        <ResultBlock method="confirmPaymentSheetPayment" results={results} />
        <ActionButton method="createTokenForCVCUpdate" onPress={() => run('createTokenForCVCUpdate', callcreateTokenForCVCUpdate)} />
        <ResultBlock method="createTokenForCVCUpdate" results={results} />
        <ActionButton method="handleURLCallback" onPress={() => run('handleURLCallback', callhandleURLCallback)} />
        <ResultBlock method="handleURLCallback" results={results} />
        <ActionButton method="createToken" onPress={() => run('createToken', callcreateToken)} />
        <ResultBlock method="createToken" results={results} />
        <ActionButton method="openApplePaySetup" onPress={() => run('openApplePaySetup', callopenApplePaySetup)} />
        <ResultBlock method="openApplePaySetup" results={results} />
        <ActionButton method="verifyMicrodeposits" onPress={() => run('verifyMicrodeposits', callverifyMicrodeposits)} />
        <ResultBlock method="verifyMicrodeposits" results={results} />
        <ActionButton method="collectBankAccount" onPress={() => run('collectBankAccount', callcollectBankAccount)} />
        <ResultBlock method="collectBankAccount" results={results} />
      </Section>
      <Section title={"方法直达 3/5"} description="">
        <ActionButton method="getConstants" onPress={() => run('getConstants', callgetConstants)} />
        <ResultBlock method="getConstants" results={results} />
        <ActionButton method="canAddCardToWallet" onPress={() => run('canAddCardToWallet', callcanAddCardToWallet)} />
        <ResultBlock method="canAddCardToWallet" results={results} />
        <ActionButton method="isCardInWallet" onPress={() => run('isCardInWallet', callisCardInWallet)} />
        <ResultBlock method="isCardInWallet" results={results} />
        <ActionButton method="collectBankAccountToken" onPress={() => run('collectBankAccountToken', callcollectBankAccountToken)} />
        <ResultBlock method="collectBankAccountToken" results={results} />
        <ActionButton method="collectFinancialConnectionsAccounts" onPress={() => run('collectFinancialConnectionsAccounts', callcollectFinancialConnectionsAccounts)} />
        <ResultBlock method="collectFinancialConnectionsAccounts" results={results} />
        <ActionButton method="resetPaymentSheetCustomer" onPress={() => run('resetPaymentSheetCustomer', callresetPaymentSheetCustomer)} />
        <ResultBlock method="resetPaymentSheetCustomer" results={results} />
        <ActionButton method="isPlatformPaySupported" onPress={() => run('isPlatformPaySupported', callisPlatformPaySupported)} />
        <ResultBlock method="isPlatformPaySupported" results={results} />
        <ActionButton method="createPlatformPayPaymentMethod" onPress={() => run('createPlatformPayPaymentMethod', callcreatePlatformPayPaymentMethod)} />
        <ResultBlock method="createPlatformPayPaymentMethod" results={results} />
        <ActionButton method="dismissPlatformPay" onPress={() => run('dismissPlatformPay', calldismissPlatformPay)} />
        <ResultBlock method="dismissPlatformPay" results={results} />
        <ActionButton method="updatePlatformPaySheet" onPress={() => run('updatePlatformPaySheet', callupdatePlatformPaySheet)} />
        <ResultBlock method="updatePlatformPaySheet" results={results} />
      </Section>
      <Section title={"方法直达 4/5"} description="">
        <ActionButton method="confirmPlatformPay" onPress={() => run('confirmPlatformPay', callconfirmPlatformPay)} />
        <ResultBlock method="confirmPlatformPay" results={results} />
        <ActionButton method="configureOrderTracking" onPress={() => run('configureOrderTracking', callconfigureOrderTracking)} />
        <ResultBlock method="configureOrderTracking" results={results} />
        <ActionButton method="createRadarSession" onPress={() => run('createRadarSession', callcreateRadarSession)} />
        <ResultBlock method="createRadarSession" results={results} />
        <ActionButton method="setFinancialConnectionsForceNativeFlow" onPress={() => run('setFinancialConnectionsForceNativeFlow', callsetFinancialConnectionsForceNativeFlow)} />
        <ResultBlock method="setFinancialConnectionsForceNativeFlow" results={results} />
        <ActionButton method="openAuthenticatedWebView" onPress={() => run('openAuthenticatedWebView', callopenAuthenticatedWebView)} />
        <ResultBlock method="openAuthenticatedWebView" results={results} />
        <ActionButton method="presentExternalWebPage" onPress={() => run('presentExternalWebPage', callpresentExternalWebPage)} />
        <ResultBlock method="presentExternalWebPage" results={results} />
        <ActionButton method="downloadAndShareFile" onPress={() => run('downloadAndShareFile', calldownloadAndShareFile)} />
        <ResultBlock method="downloadAndShareFile" results={results} />
        <ActionButton method="authWebViewDeepLinkHandled" onPress={() => run('authWebViewDeepLinkHandled', callauthWebViewDeepLinkHandled)} />
        <ResultBlock method="authWebViewDeepLinkHandled" results={results} />
        <ActionButton method="storeStripeConnectDeepLink" onPress={() => run('storeStripeConnectDeepLink', callstoreStripeConnectDeepLink)} />
        <ResultBlock method="storeStripeConnectDeepLink" results={results} />
        <ActionButton method="pollAndClearPendingStripeConnectUrls" onPress={() => run('pollAndClearPendingStripeConnectUrls', callpollAndClearPendingStripeConnectUrls)} />
        <ResultBlock method="pollAndClearPendingStripeConnectUrls" results={results} />
      </Section>
      <Section title={"方法直达 5/5"} description="">
        <ActionButton method="initLinkController" onPress={() => run('initLinkController', callinitLinkController)} />
        <ResultBlock method="initLinkController" results={results} />
        <ActionButton method="presentLinkController" onPress={() => run('presentLinkController', callpresentLinkController)} />
        <ResultBlock method="presentLinkController" results={results} />
        <ActionButton method="confirmLinkControllerSetupIntent" onPress={() => run('confirmLinkControllerSetupIntent', callconfirmLinkControllerSetupIntent)} />
        <ResultBlock method="confirmLinkControllerSetupIntent" results={results} />
        <ActionButton method="addListener" onPress={() => run('addListener', calladdListener)} />
        <ResultBlock method="addListener" results={results} />
        <ActionButton method="removeListeners" onPress={() => run('removeListeners', callremoveListeners)} />
        <ResultBlock method="removeListeners" results={results} />
      </Section>
    </DemoScreen>
  );
}
