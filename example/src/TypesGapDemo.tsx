/**
 * 类型补样 Demo（覆盖补充）
 *
 * 为公开导出的每个接口生成一份含全部字段的类型化字面量样例，
 * 为每个枚举生成成员引用 —— 逐接口对齐覆盖检视报告的字段归因口径。
 * 值为合成占位数据（不触发真实支付），仅用于类型字段引用与界面展示。
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

import {DemoScreen, JsonCard, Section} from './demoHelpers';

const sample1: StripeProviderProps = null;

const sample2: CardFieldProps = {
  style: undefined as never,
  postalCodeEnabled: true,
  countryCode: 'ohos_demo',
  disabled: true,
  cardStyle: {borderWidth: 1, backgroundColor: 'ohos_demo', borderColor: 'ohos_demo', borderRadius: 1, textColor: 'ohos_demo', fontSize: 1, placeholderColor: 'ohos_demo', cursorColor: 'ohos_demo', textErrorColor: 'ohos_demo', fontFamily: 'ohos_demo'},
  placeholders: {number: 'ohos_demo', expiration: 'ohos_demo', cvc: 'ohos_demo', postalCode: 'ohos_demo'},
  autofocus: true,
  onCardChange: () => undefined,
  onBlur: () => undefined,
  onFocus: () => undefined,
  testID: 'ohos_demo',
  preferredNetworks: [CardBrand.JCB],
  onBehalfOf: 'ohos_demo',
  dangerouslyGetFullCardDetails: true,
};

const sample3: CardFormProps = {
  style: undefined as never,
  autofocus: true,
  testID: 'ohos_demo',
  disabled: true,
  cardStyle: {backgroundColor: 'ohos_demo', borderWidth: 1, borderColor: 'ohos_demo', borderRadius: 1, textColor: 'ohos_demo', fontSize: 1, placeholderColor: 'ohos_demo', cursorColor: 'ohos_demo', textErrorColor: 'ohos_demo', fontFamily: 'ohos_demo'},
  preferredNetworks: [CardBrand.JCB],
  placeholders: {number: 'ohos_demo', expiration: 'ohos_demo', cvc: 'ohos_demo', postalCode: 'ohos_demo'},
  defaultValues: undefined as never,
  onFormComplete: () => undefined,
  dangerouslyGetFullCardDetails: true,
};

const sample4: AuBECSDebitFormProps = {
  companyName: 'ohos_demo',
  onComplete: () => undefined,
  formStyle: {borderWidth: 1, backgroundColor: 'ohos_demo', borderColor: 'ohos_demo', borderRadius: 1, textColor: 'ohos_demo', fontSize: 1, placeholderColor: 'ohos_demo', textErrorColor: 'ohos_demo'},
  style: undefined as never,
  testID: 'ohos_demo',
};

const sample5: StripeContainerProps = {
  children: null,
  keyboardShouldPersistTaps: true,
  style: undefined as never,
  testID: 'ohos_demo',
};

const sample6: AddToWalletButtonProps = {
  style: undefined as never,
  iOSButtonStyle: "onDarkBackground",
  androidAssetSource: undefined as never,
  testID: 'ohos_demo',
  testEnv: true,
  cardDetails: {primaryAccountIdentifier: 'ohos_demo', name: 'ohos_demo', description: 'ohos_demo', lastFour: 'ohos_demo', brand: undefined as never},
  token: {id: 'ohos_demo', fpanLastFour: 'ohos_demo', dpanLastFour: 'ohos_demo', network: 1, serviceProvider: 1, issuer: 'ohos_demo', status: GooglePayCardTokenStatus.TOKEN_STATE_NEEDS_IDENTITY_VERIFICATION, cardLastFour: 'ohos_demo'},
  isBounceProvisioned: true,
  ephemeralKey: null,
  onComplete: () => undefined,
};

const sample7: AddressSheetProps = {
  visible: true,
  presentationStyle: "automatic",
  animationStyle: "flip",
  appearance: undefined as never,
  defaultValues: {name: 'ohos_demo', address: {city: 'ohos_demo', country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', postalCode: 'ohos_demo', state: 'ohos_demo'}, phone: 'ohos_demo', isCheckboxSelected: true},
  additionalFields: {phoneNumber: "hidden", checkboxLabel: 'ohos_demo'},
  allowedCountries: ['ohos_demo'],
  autocompleteCountries: ['ohos_demo'],
  primaryButtonTitle: 'ohos_demo',
  sheetTitle: 'ohos_demo',
  googlePlacesApiKey: 'ohos_demo',
  onSubmit: () => undefined,
  onError: () => undefined,
};

const sample8: PlatformPayButtonProps = {
  type: undefined as never,
  appearance: undefined as never,
  borderRadius: 1,
  onPress: () => undefined,
  disabled: true,
  onShippingMethodSelected: () => undefined,
  onShippingContactSelected: () => undefined,
  onCouponCodeEntered: () => undefined,
  setOrderTracking: () => undefined,
  testID: 'ohos_demo',
  style: undefined as never,
};

const sample9: CustomerSheetProps = null;

const sample10: PaymentMethodMessagingElementProps = {
  appearance: {font: {family: 'ohos_demo', size: 1}, textColor: 'ohos_demo', linkTextColor: 'ohos_demo', style: PaymentMethodMessagingElementStyle.Flat},
  configuration: {amount: 1, currency: 'ohos_demo', locale: 'ohos_demo', country: 'ohos_demo', paymentMethodTypes: ['ohos_demo']},
  onStateChange: () => undefined,
};

const sample11: StripeConnectInstance = {
  update: () => undefined,
};

const sample12: StripeConnectInitParams = {
  publishableKey: 'ohos_demo',
  fetchClientSecret: async () => undefined,
  appearance: undefined as never,
  locale: 'ohos_demo',
  fonts: [undefined as never],
};

const sample13: StripeConnectUpdateParams = {
  appearance: undefined as never,
  locale: 'ohos_demo',
};

const sample14: Address = {
  city: 'ohos_demo',
  country: 'ohos_demo',
  line1: 'ohos_demo',
  line2: 'ohos_demo',
  postalCode: 'ohos_demo',
  state: 'ohos_demo',
};

const sample15: BillingDetails = {
  email: 'ohos_demo',
  phone: 'ohos_demo',
  name: 'ohos_demo',
  address: {city: 'ohos_demo', country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', postalCode: 'ohos_demo', state: 'ohos_demo'},
};

const sample16: AddressDetails = {
  name: 'ohos_demo',
  address: {city: 'ohos_demo', country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', postalCode: 'ohos_demo', state: 'ohos_demo'},
  phone: 'ohos_demo',
  isCheckboxSelected: true,
};

const sample17: AppInfo = {
  name: 'ohos_demo',
  partnerId: 'ohos_demo',
  url: 'ohos_demo',
  version: 'ohos_demo',
};

const sample18: CreatePaymentMethodResult = {paymentMethod: {id: 'ohos_demo', liveMode: true, customerId: 'ohos_demo', billingDetails: {} as BillingDetails, paymentMethodType: undefined as never, AuBecsDebit: null, BacsDebit: null, Card: null, Fpx: null, Ideal: null, SepaDebit: null, USBankAccount: undefined as never}, error: null};

const sample19: RetrievePaymentIntentResult = {paymentIntent: {id: 'ohos_demo', amount: 1, created: 'ohos_demo', currency: 'ohos_demo', status: undefined as never, description: 'ohos_demo', receiptEmail: 'ohos_demo', canceledAt: 'ohos_demo', clientSecret: 'ohos_demo', livemode: true, paymentMethodId: 'ohos_demo', paymentMethod: {} as never, captureMethod: undefined as never, confirmationMethod: undefined as never, lastPaymentError: undefined as never, shipping: {} as never, nextAction: undefined as never}, error: null};

const sample20: RetrieveSetupIntentResult = {setupIntent: {id: 'ohos_demo', clientSecret: 'ohos_demo', lastSetupError: undefined as never, created: 'ohos_demo', livemode: true, paymentMethodId: 'ohos_demo', paymentMethod: {} as never, status: undefined as never, paymentMethodTypes: [undefined as never], usage: undefined as never, description: 'ohos_demo', nextAction: undefined as never}, error: null};

const sample21: ConfirmPaymentResult = {paymentIntent: {id: 'ohos_demo', amount: 1, created: 'ohos_demo', currency: 'ohos_demo', status: undefined as never, description: 'ohos_demo', receiptEmail: 'ohos_demo', canceledAt: 'ohos_demo', clientSecret: 'ohos_demo', livemode: true, paymentMethodId: 'ohos_demo', paymentMethod: {} as never, captureMethod: undefined as never, confirmationMethod: undefined as never, lastPaymentError: undefined as never, shipping: {} as never, nextAction: undefined as never}, error: null};

const sample22: HandleNextActionResult = {paymentIntent: {id: 'ohos_demo', amount: 1, created: 'ohos_demo', currency: 'ohos_demo', status: undefined as never, description: 'ohos_demo', receiptEmail: 'ohos_demo', canceledAt: 'ohos_demo', clientSecret: 'ohos_demo', livemode: true, paymentMethodId: 'ohos_demo', paymentMethod: {} as never, captureMethod: undefined as never, confirmationMethod: undefined as never, lastPaymentError: undefined as never, shipping: {} as never, nextAction: undefined as never}, error: null};

const sample23: HandleNextActionForSetupResult = {setupIntent: {id: 'ohos_demo', clientSecret: 'ohos_demo', lastSetupError: undefined as never, created: 'ohos_demo', livemode: true, paymentMethodId: 'ohos_demo', paymentMethod: {} as never, status: undefined as never, paymentMethodTypes: [undefined as never], usage: undefined as never, description: 'ohos_demo', nextAction: undefined as never}, error: null};

const sample24: ConfirmSetupIntentResult = {setupIntent: {id: 'ohos_demo', clientSecret: 'ohos_demo', lastSetupError: undefined as never, created: 'ohos_demo', livemode: true, paymentMethodId: 'ohos_demo', paymentMethod: {} as never, status: undefined as never, paymentMethodTypes: [undefined as never], usage: undefined as never, description: 'ohos_demo', nextAction: undefined as never}, error: null};

const sample25: CreateTokenForCVCUpdateResult = {tokenId: 'ohos_demo', error: null};

const sample26: InitPaymentSheetResult = {paymentOption: {label: 'ohos_demo', image: 'ohos_demo'}, error: null};

const sample27: PresentPaymentSheetResult = {
  paymentOption: {label: 'ohos_demo', image: 'ohos_demo'},
  didCancel: true,
  error: {code: PaymentSheetError.Failed, message: 'ohos_demo', localizedMessage: 'ohos_demo', declineCode: 'ohos_demo', stripeErrorCode: 'ohos_demo', type: "api_connection_error"},
};

const sample28: CreateTokenResult = {token: {id: 'ohos_demo', created: 'ohos_demo', type: undefined as never, used: true, livemode: true, card: null, bankAccount: null}, error: null};

const sample29: ConfirmPaymentSheetPaymentResult = {
  error: {code: PaymentSheetError.Failed, message: 'ohos_demo', localizedMessage: 'ohos_demo', declineCode: 'ohos_demo', stripeErrorCode: 'ohos_demo', type: "api_connection_error"},
};

const sample30: CreateRadarSessionResult = {id: 'ohos_demo', error: null};

const sample31: ApplePayResult = {paymentMethod: {id: 'ohos_demo', liveMode: true, customerId: 'ohos_demo', billingDetails: {} as BillingDetails, paymentMethodType: undefined as never, AuBecsDebit: null, BacsDebit: null, Card: null, Fpx: null, Ideal: null, SepaDebit: null, USBankAccount: undefined as never}, error: null};

const sample32: InitStripeParams = {
  publishableKey: 'ohos_demo',
  stripeAccountId: 'ohos_demo',
  threeDSecureParams: {timeout: 1, label: {headingTextColor: 'ohos_demo', textColor: 'ohos_demo', textFontSize: 1, headingFontSize: 1}, navigationBar: {headerText: 'ohos_demo', buttonText: 'ohos_demo', textColor: 'ohos_demo', textFontSize: 1, barStyle: undefined as never, translucent: true, barTintColor: 'ohos_demo', statusBarColor: 'ohos_demo', backgroundColor: 'ohos_demo'}, textField: {borderColor: 'ohos_demo', borderWidth: 1, borderRadius: 1, textColor: 'ohos_demo', textFontSize: 1}, submitButton: {backgroundColor: 'ohos_demo', borderRadius: 1, textColor: 'ohos_demo', textFontSize: 1}, cancelButton: {backgroundColor: 'ohos_demo', borderRadius: 1, textColor: 'ohos_demo', textFontSize: 1}, continueButton: {backgroundColor: 'ohos_demo', borderRadius: 1, textColor: 'ohos_demo', textFontSize: 1}, nextButton: {backgroundColor: 'ohos_demo', borderRadius: 1, textColor: 'ohos_demo', textFontSize: 1}, resendButton: {backgroundColor: 'ohos_demo', borderRadius: 1, textColor: 'ohos_demo', textFontSize: 1}, backgroundColor: 'ohos_demo', footer: {backgroundColor: 'ohos_demo', chevronColor: 'ohos_demo', headingTextColor: 'ohos_demo', textColor: 'ohos_demo'}, accentColor: 'ohos_demo'},
  merchantIdentifier: 'ohos_demo',
  urlScheme: 'ohos_demo',
  setReturnUrlSchemeOnAndroid: true,
};

const sample33: InitialiseParams = {
  appInfo: {name: 'ohos_demo', partnerId: 'ohos_demo', url: 'ohos_demo', version: 'ohos_demo'},
  publishableKey: 'ohos_demo',
  stripeAccountId: 'ohos_demo',
  threeDSecureParams: {timeout: 1, label: {headingTextColor: 'ohos_demo', textColor: 'ohos_demo', textFontSize: 1, headingFontSize: 1}, navigationBar: {headerText: 'ohos_demo', buttonText: 'ohos_demo', textColor: 'ohos_demo', textFontSize: 1, barStyle: undefined as never, translucent: true, barTintColor: 'ohos_demo', statusBarColor: 'ohos_demo', backgroundColor: 'ohos_demo'}, textField: {borderColor: 'ohos_demo', borderWidth: 1, borderRadius: 1, textColor: 'ohos_demo', textFontSize: 1}, submitButton: {backgroundColor: 'ohos_demo', borderRadius: 1, textColor: 'ohos_demo', textFontSize: 1}, cancelButton: {backgroundColor: 'ohos_demo', borderRadius: 1, textColor: 'ohos_demo', textFontSize: 1}, continueButton: {backgroundColor: 'ohos_demo', borderRadius: 1, textColor: 'ohos_demo', textFontSize: 1}, nextButton: {backgroundColor: 'ohos_demo', borderRadius: 1, textColor: 'ohos_demo', textFontSize: 1}, resendButton: {backgroundColor: 'ohos_demo', borderRadius: 1, textColor: 'ohos_demo', textFontSize: 1}, backgroundColor: 'ohos_demo', footer: {backgroundColor: 'ohos_demo', chevronColor: 'ohos_demo', headingTextColor: 'ohos_demo', textColor: 'ohos_demo'}, accentColor: 'ohos_demo'},
  merchantIdentifier: 'ohos_demo',
  urlScheme: 'ohos_demo',
  setReturnUrlSchemeOnAndroid: true,
};

const sample34: GooglePayInitResult = {error: null};

const sample35: PayWithGooglePayResult = {error: null};

const sample36: CreateGooglePayPaymentMethodResult = {paymentMethod: {id: 'ohos_demo', liveMode: true, customerId: 'ohos_demo', billingDetails: {} as BillingDetails, paymentMethodType: undefined as never, AuBecsDebit: null, BacsDebit: null, Card: null, Fpx: null, Ideal: null, SepaDebit: null, USBankAccount: undefined as never}, error: null};

const sample37: OpenApplePaySetupResult = {error: null};

const sample38: VerifyMicrodepositsParams = {amounts: [1], descriptorCode: null};

const sample39: VerifyMicrodepositsForPaymentResult = {paymentIntent: {id: 'ohos_demo', amount: 1, created: 'ohos_demo', currency: 'ohos_demo', status: undefined as never, description: 'ohos_demo', receiptEmail: 'ohos_demo', canceledAt: 'ohos_demo', clientSecret: 'ohos_demo', livemode: true, paymentMethodId: 'ohos_demo', paymentMethod: {} as never, captureMethod: undefined as never, confirmationMethod: undefined as never, lastPaymentError: undefined as never, shipping: {} as never, nextAction: undefined as never}, error: null};

const sample40: VerifyMicrodepositsForSetupResult = {setupIntent: {id: 'ohos_demo', clientSecret: 'ohos_demo', lastSetupError: undefined as never, created: 'ohos_demo', livemode: true, paymentMethodId: 'ohos_demo', paymentMethod: {} as never, status: undefined as never, paymentMethodTypes: [undefined as never], usage: undefined as never, description: 'ohos_demo', nextAction: undefined as never}, error: null};

const sample41: CollectBankAccountForPaymentResult = {paymentIntent: {id: 'ohos_demo', amount: 1, created: 'ohos_demo', currency: 'ohos_demo', status: undefined as never, description: 'ohos_demo', receiptEmail: 'ohos_demo', canceledAt: 'ohos_demo', clientSecret: 'ohos_demo', livemode: true, paymentMethodId: 'ohos_demo', paymentMethod: {} as never, captureMethod: undefined as never, confirmationMethod: undefined as never, lastPaymentError: undefined as never, shipping: {} as never, nextAction: undefined as never}, error: null};

const sample42: CollectBankAccountForSetupResult = {setupIntent: {id: 'ohos_demo', clientSecret: 'ohos_demo', lastSetupError: undefined as never, created: 'ohos_demo', livemode: true, paymentMethodId: 'ohos_demo', paymentMethod: {} as never, status: undefined as never, paymentMethodTypes: [undefined as never], usage: undefined as never, description: 'ohos_demo', nextAction: undefined as never}, error: null};

const sample43: GooglePayCardToken = {
  id: 'ohos_demo',
  fpanLastFour: 'ohos_demo',
  dpanLastFour: 'ohos_demo',
  network: 1,
  serviceProvider: 1,
  issuer: 'ohos_demo',
  status: GooglePayCardTokenStatus.TOKEN_STATE_NEEDS_IDENTITY_VERIFICATION,
  cardLastFour: 'ohos_demo',
};

const sample44: IsCardInWalletResult = {isInWallet: true, token: {} as GooglePayCardToken, error: null};

const sample45: CanAddCardToWalletParams = {
  primaryAccountIdentifier: 'ohos_demo',
  cardLastFour: 'ohos_demo',
  cardBrand: 'ohos_demo',
  testEnv: true,
  hasPairedAppleWatch: true,
  supportsTapToPay: true,
};

const sample46: CanAddCardToWalletResult = {canAddCard: true, details: null, error: null};

const sample47: ErrorType = "api_connection_error";

const sample48: StripeError<any> = {
  code: null,
  message: 'ohos_demo',
  localizedMessage: 'ohos_demo',
  declineCode: 'ohos_demo',
  stripeErrorCode: 'ohos_demo',
  type: "api_connection_error",
};

const sample49: CustomerSheetInitParams = null;

const sample50: CustomerSheetPresentParams = {
  presentationStyle: "automatic",
  animationStyle: "flip",
  timeout: 1,
};

const sample51: CustomerSheetResult = {
  paymentOption: {label: 'ohos_demo', image: 'ohos_demo'},
  paymentMethod: {id: 'ohos_demo', liveMode: true, customerId: 'ohos_demo', billingDetails: {email: 'ohos_demo', phone: 'ohos_demo', name: 'ohos_demo', address: {} as Address}, paymentMethodType: undefined as never, AuBecsDebit: {fingerprint: 'ohos_demo', last4: 'ohos_demo', bsbNumber: 'ohos_demo'}, BacsDebit: {sortCode: 'ohos_demo', last4: 'ohos_demo', fingerprint: 'ohos_demo'}, Card: {brand: undefined as never, country: 'ohos_demo', expYear: 1, expMonth: 1, fingerprint: 'ohos_demo', funding: 'ohos_demo', last4: 'ohos_demo', preferredNetwork: 'ohos_demo', availableNetworks: ['ohos_demo'], threeDSecureUsage: null}, Fpx: {bank: 'ohos_demo'}, Ideal: {bankIdentifierCode: 'ohos_demo', bank: 'ohos_demo'}, SepaDebit: {bankCode: 'ohos_demo', country: 'ohos_demo', fingerprint: 'ohos_demo', last4: 'ohos_demo'}, USBankAccount: undefined as never},
  error: {code: CustomerSheetError.Failed, message: 'ohos_demo', localizedMessage: 'ohos_demo', declineCode: 'ohos_demo', stripeErrorCode: 'ohos_demo', type: "api_connection_error"},
};

const sample52: CustomerAdapter = {
  fetchPaymentMethods: async () => undefined,
  attachPaymentMethod: async () => undefined,
  detachPaymentMethod: async () => undefined,
  setSelectedPaymentOption: async () => undefined,
  fetchSelectedPaymentOption: async () => undefined,
  setupIntentClientSecretForCustomerAttach: async () => undefined,
};

const sample53: CustomerPaymentOption = 'ohos_demo';

const sample54: ClientSecretProvider = {
  provideSetupIntentClientSecret: async () => undefined,
  provideCustomerSessionClientSecret: async () => undefined,
};

const sample55: CustomerSheetIntentConfiguration = {
  paymentMethodTypes: ['ohos_demo'],
  onBehalfOf: 'ohos_demo',
};

const sample56: CustomerSessionClientSecret = {
  customerId: 'ohos_demo',
  clientSecret: 'ohos_demo',
};

const sample57: CheckoutController = {
  status: "ready",
  session: {id: 'ohos_demo', businessName: 'ohos_demo', livemode: true, currency: 'ohos_demo', minorUnitsAmountDivisor: 1, presentmentDetails: {presentmentCurrency: 'ohos_demo'}, email: 'ohos_demo', paymentOption: {image: 'ohos_demo', label: 'ohos_demo', billingDetails: {} as Checkout.BillingDetails, paymentMethodType: 'ohos_demo', mandateHTML: 'ohos_demo'}, shippingAddress: {name: 'ohos_demo', address: {} as Checkout.Address}, orderSummaryItems: [{type: "one_time_price", key: 'ohos_demo', description: 'ohos_demo', items: [{} as Checkout.OneTimePriceItem], amountDetails: {} as Checkout.AmountDetails}], discountAmounts: [{displayName: 'ohos_demo', promotionCode: 'ohos_demo', percentOff: 1, amount: 'ohos_demo', minorUnitsAmount: 1}], tax: {status: "ready"}, taxAmounts: [{inclusive: true, displayName: 'ohos_demo', percentage: 1, amount: 'ohos_demo', minorUnitsAmount: 1}], totals: {subtotal: {} as Checkout.Amount, taxExclusive: {} as Checkout.Amount, taxInclusive: {} as Checkout.Amount, discount: {} as Checkout.Amount, total: {} as Checkout.Amount}, status: {type: "open"}, lastPaymentError: {code: "Failed", message: 'ohos_demo', localizedMessage: 'ohos_demo', declineCode: 'ohos_demo', stripeErrorCode: 'ohos_demo', type: "api_connection_error"}},
  paymentElement: {present: async () => undefined},
  updateEmail: async () => undefined,
  updateShippingAddress: async () => undefined,
  applyPromotionCode: async () => undefined,
  removePromotionCode: async () => undefined,
  runServerUpdate: async () => undefined,
  clearPaymentOption: async () => undefined,
  confirm: async () => undefined,
  destroy: async () => undefined,
};

const sample58: CheckoutPaymentElement = {
  present: async () => undefined,
};

const sample59: CheckoutPaymentElementViewProps = {
  element: {present: async () => undefined},
};

const sample60: Checkout.UserInterfaceStyle = "alwaysLight";

const sample61: Checkout.CreateOptions = {
  clientSecret: 'ohos_demo',
  returnURL: 'ohos_demo',
  defaults: {billingDetails: {name: 'ohos_demo', address: {} as Checkout.Address}, shippingDetails: {name: 'ohos_demo', address: {} as Checkout.Address}, phone: 'ohos_demo', email: 'ohos_demo'},
  merchantDisplayName: 'ohos_demo',
  style: "alwaysLight",
  paymentElement: {savePaymentMethodOptInBehavior: "automatic", appearance: undefined as never, preferredNetworks: [CardBrand.JCB], billingDetailsCollectionConfiguration: {name: "automatic", phone: "automatic", address: "automatic", attachDefaultsToPaymentMethod: true}, removeSavedPaymentMethodMessage: 'ohos_demo', paymentMethodOrder: ['ohos_demo'], opensCardScannerAutomatically: true, useAutocompleteEndpoints: true, termsDisplay: undefined as never, paymentMethodLayout: PaymentMethodLayout.Horizontal, displaysMandateText: true, rowSelectionBehavior: {type: "default"}, applePay: {merchantCountryCode: 'ohos_demo', buttonType: "plain"}, googlePay: {testEnv: true, label: 'ohos_demo', buttonType: "plain", additionalEnabledNetworks: ['ohos_demo']}, link: {display: "automatic"}},
};

const sample62: Checkout.UseOptions = {
  enabled: true,
  getConfiguration: async () => undefined,
};

const sample63: Checkout.UseResult = {
  status: "ready",
  session: {id: 'ohos_demo', businessName: 'ohos_demo', livemode: true, currency: 'ohos_demo', minorUnitsAmountDivisor: 1, presentmentDetails: {presentmentCurrency: 'ohos_demo'}, email: 'ohos_demo', paymentOption: {image: 'ohos_demo', label: 'ohos_demo', billingDetails: {} as Checkout.BillingDetails, paymentMethodType: 'ohos_demo', mandateHTML: 'ohos_demo'}, shippingAddress: {name: 'ohos_demo', address: {} as Checkout.Address}, orderSummaryItems: [{type: "one_time_price", key: 'ohos_demo', description: 'ohos_demo', items: [{} as Checkout.OneTimePriceItem], amountDetails: {} as Checkout.AmountDetails}], discountAmounts: [{displayName: 'ohos_demo', promotionCode: 'ohos_demo', percentOff: 1, amount: 'ohos_demo', minorUnitsAmount: 1}], tax: {status: "ready"}, taxAmounts: [{inclusive: true, displayName: 'ohos_demo', percentage: 1, amount: 'ohos_demo', minorUnitsAmount: 1}], totals: {subtotal: {} as Checkout.Amount, taxExclusive: {} as Checkout.Amount, taxInclusive: {} as Checkout.Amount, discount: {} as Checkout.Amount, total: {} as Checkout.Amount}, status: {type: "open"}, lastPaymentError: {code: "Failed", message: 'ohos_demo', localizedMessage: 'ohos_demo', declineCode: 'ohos_demo', stripeErrorCode: 'ohos_demo', type: "api_connection_error"}},
  paymentElement: {present: async () => undefined},
  error: {code: "Failed", message: 'ohos_demo', localizedMessage: 'ohos_demo', declineCode: 'ohos_demo', stripeErrorCode: 'ohos_demo', type: "api_connection_error"},
  reload: async () => undefined,
  updateEmail: async () => undefined,
  updateShippingAddress: async () => undefined,
  applyPromotionCode: async () => undefined,
  removePromotionCode: async () => undefined,
  runServerUpdate: async () => undefined,
  clearPaymentOption: async () => undefined,
  confirm: async () => undefined,
};

const sample64: Checkout.UpdateShippingAddressParams = {
  name: 'ohos_demo',
  address: {country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', city: 'ohos_demo', state: 'ohos_demo', postalCode: 'ohos_demo'},
};

const sample65: Checkout.Result = {status: "completed", paymentStatus: "paid"};

const sample66: Checkout.ErrorCode = "Failed";

const sample67: Checkout.Defaults = {
  billingDetails: {name: 'ohos_demo', address: {country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', city: 'ohos_demo', state: 'ohos_demo', postalCode: 'ohos_demo'}},
  shippingDetails: {name: 'ohos_demo', address: {country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', city: 'ohos_demo', state: 'ohos_demo', postalCode: 'ohos_demo'}},
  phone: 'ohos_demo',
  email: 'ohos_demo',
};

const sample68: Checkout.ContactDetails = {
  name: 'ohos_demo',
  address: {country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', city: 'ohos_demo', state: 'ohos_demo', postalCode: 'ohos_demo'},
};

const sample69: Checkout.ApplePayConfiguration = {
  merchantCountryCode: 'ohos_demo',
  buttonType: "plain",
};

const sample70: Checkout.ApplePayButtonType = "plain";

const sample71: Checkout.GooglePayConfiguration = {
  testEnv: true,
  label: 'ohos_demo',
  buttonType: "plain",
  additionalEnabledNetworks: ['ohos_demo'],
};

const sample72: Checkout.GooglePayButtonType = "plain";

const sample73: Checkout.LinkConfiguration = {
  display: "automatic",
};

const sample74: Checkout.SavePaymentMethodOptInBehavior = "automatic";

const sample75: Checkout.PaymentElementAppearance = {
  font: undefined as never,
  colors: undefined as never,
  shapes: undefined as never,
  primaryButton: undefined as never,
  embeddedPaymentElement: undefined as never,
  formInsetValues: undefined as never,
  applyLiquidGlass: true,
  navigationBarStyle: NavigationBarStyle.Plain,
};

const sample76: Checkout.RowSelectionBehavior = {type: "default"};

const sample77: Checkout.BillingDetailsCollectionConfiguration = {
  name: "automatic",
  phone: "automatic",
  address: "automatic",
  attachDefaultsToPaymentMethod: true,
};

const sample78: Checkout.PaymentElementConfiguration = {
  savePaymentMethodOptInBehavior: "automatic",
  appearance: undefined as never,
  preferredNetworks: [CardBrand.JCB],
  billingDetailsCollectionConfiguration: {name: "automatic", phone: "automatic", address: "automatic", attachDefaultsToPaymentMethod: true},
  removeSavedPaymentMethodMessage: 'ohos_demo',
  paymentMethodOrder: ['ohos_demo'],
  opensCardScannerAutomatically: true,
  useAutocompleteEndpoints: true,
  termsDisplay: undefined as never,
  paymentMethodLayout: PaymentMethodLayout.Horizontal,
  displaysMandateText: true,
  rowSelectionBehavior: {type: "default"},
  applePay: {merchantCountryCode: 'ohos_demo', buttonType: "plain"},
  googlePay: {testEnv: true, label: 'ohos_demo', buttonType: "plain", additionalEnabledNetworks: ['ohos_demo']},
  link: {display: "automatic"},
};

const sample79: Checkout.Session = {
  id: 'ohos_demo',
  businessName: 'ohos_demo',
  livemode: true,
  currency: 'ohos_demo',
  minorUnitsAmountDivisor: 1,
  presentmentDetails: {presentmentCurrency: 'ohos_demo'},
  email: 'ohos_demo',
  paymentOption: {image: 'ohos_demo', label: 'ohos_demo', billingDetails: {name: 'ohos_demo', email: 'ohos_demo', phone: 'ohos_demo', address: {} as Checkout.Address}, paymentMethodType: 'ohos_demo', mandateHTML: 'ohos_demo'},
  shippingAddress: {name: 'ohos_demo', address: {country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', city: 'ohos_demo', state: 'ohos_demo', postalCode: 'ohos_demo'}},
  orderSummaryItems: [{type: "one_time_price", key: 'ohos_demo', description: 'ohos_demo', items: [{key: 'ohos_demo', displayName: 'ohos_demo', images: ['ohos_demo'], unitAmount: {} as Checkout.Amount, unitAmountDecimal: {} as Checkout.Amount, unitLabel: 'ohos_demo', quantity: 1, adjustableQuantity: {} as Checkout.AdjustableQuantity}], amountDetails: {total: {} as Checkout.Amount, subtotal: {} as Checkout.Amount, taxAmounts: [{} as Checkout.TaxAmount], discount: {} as Checkout.Amount, taxInclusive: {} as Checkout.Amount, taxExclusive: {} as Checkout.Amount}}],
  discountAmounts: [{displayName: 'ohos_demo', promotionCode: 'ohos_demo', percentOff: 1, amount: 'ohos_demo', minorUnitsAmount: 1}],
  tax: {status: "ready"},
  taxAmounts: [{inclusive: true, displayName: 'ohos_demo', percentage: 1, amount: 'ohos_demo', minorUnitsAmount: 1}],
  totals: {subtotal: {amount: 'ohos_demo', minorUnitsAmount: 1}, taxExclusive: {amount: 'ohos_demo', minorUnitsAmount: 1}, taxInclusive: {amount: 'ohos_demo', minorUnitsAmount: 1}, discount: {amount: 'ohos_demo', minorUnitsAmount: 1}, total: {amount: 'ohos_demo', minorUnitsAmount: 1}},
  status: {type: "open"},
  lastPaymentError: {code: "Failed", message: 'ohos_demo', localizedMessage: 'ohos_demo', declineCode: 'ohos_demo', stripeErrorCode: 'ohos_demo', type: "api_connection_error"},
};

const sample80: Checkout.PresentmentDetails = {
  presentmentCurrency: 'ohos_demo',
};

const sample81: Checkout.PaymentOptionDisplayData = {
  image: 'ohos_demo',
  label: 'ohos_demo',
  billingDetails: {name: 'ohos_demo', email: 'ohos_demo', phone: 'ohos_demo', address: {country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', city: 'ohos_demo', state: 'ohos_demo', postalCode: 'ohos_demo'}},
  paymentMethodType: 'ohos_demo',
  mandateHTML: 'ohos_demo',
};

const sample82: Checkout.BillingDetails = {
  name: 'ohos_demo',
  email: 'ohos_demo',
  phone: 'ohos_demo',
  address: {country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', city: 'ohos_demo', state: 'ohos_demo', postalCode: 'ohos_demo'},
};

const sample83: Checkout.ShippingAddress = {
  name: 'ohos_demo',
  address: {country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', city: 'ohos_demo', state: 'ohos_demo', postalCode: 'ohos_demo'},
};

const sample84: Checkout.Address = {
  country: 'ohos_demo',
  line1: 'ohos_demo',
  line2: 'ohos_demo',
  city: 'ohos_demo',
  state: 'ohos_demo',
  postalCode: 'ohos_demo',
};

const sample85: Checkout.OrderSummaryItem = {
  type: "one_time_price",
  key: 'ohos_demo',
  description: 'ohos_demo',
  items: [{key: 'ohos_demo', displayName: 'ohos_demo', images: ['ohos_demo'], unitAmount: {amount: 'ohos_demo', minorUnitsAmount: 1}, unitAmountDecimal: {amount: 'ohos_demo', minorUnitsAmount: 1}, unitLabel: 'ohos_demo', quantity: 1, adjustableQuantity: {minimum: 1, maximum: 1}}],
  amountDetails: {total: {amount: 'ohos_demo', minorUnitsAmount: 1}, subtotal: {amount: 'ohos_demo', minorUnitsAmount: 1}, taxAmounts: [{inclusive: true, displayName: 'ohos_demo', percentage: 1, amount: 'ohos_demo', minorUnitsAmount: 1}], discount: {amount: 'ohos_demo', minorUnitsAmount: 1}, taxInclusive: {amount: 'ohos_demo', minorUnitsAmount: 1}, taxExclusive: {amount: 'ohos_demo', minorUnitsAmount: 1}},
};

const sample86: Checkout.OneTimePriceOrderSummaryItem = {
  type: "one_time_price",
  key: 'ohos_demo',
  description: 'ohos_demo',
  items: [{key: 'ohos_demo', displayName: 'ohos_demo', images: ['ohos_demo'], unitAmount: {amount: 'ohos_demo', minorUnitsAmount: 1}, unitAmountDecimal: {amount: 'ohos_demo', minorUnitsAmount: 1}, unitLabel: 'ohos_demo', quantity: 1, adjustableQuantity: {minimum: 1, maximum: 1}}],
  amountDetails: {total: {amount: 'ohos_demo', minorUnitsAmount: 1}, subtotal: {amount: 'ohos_demo', minorUnitsAmount: 1}, taxAmounts: [{inclusive: true, displayName: 'ohos_demo', percentage: 1, amount: 'ohos_demo', minorUnitsAmount: 1}], discount: {amount: 'ohos_demo', minorUnitsAmount: 1}, taxInclusive: {amount: 'ohos_demo', minorUnitsAmount: 1}, taxExclusive: {amount: 'ohos_demo', minorUnitsAmount: 1}},
};

const sample87: Checkout.OneTimePriceItem = {
  key: 'ohos_demo',
  displayName: 'ohos_demo',
  images: ['ohos_demo'],
  unitAmount: {amount: 'ohos_demo', minorUnitsAmount: 1},
  unitAmountDecimal: {amount: 'ohos_demo', minorUnitsAmount: 1},
  unitLabel: 'ohos_demo',
  quantity: 1,
  adjustableQuantity: {minimum: 1, maximum: 1},
};

const sample88: Checkout.AmountDetails = {
  total: {amount: 'ohos_demo', minorUnitsAmount: 1},
  subtotal: {amount: 'ohos_demo', minorUnitsAmount: 1},
  taxAmounts: [{inclusive: true, displayName: 'ohos_demo', percentage: 1, amount: 'ohos_demo', minorUnitsAmount: 1}],
  discount: {amount: 'ohos_demo', minorUnitsAmount: 1},
  taxInclusive: {amount: 'ohos_demo', minorUnitsAmount: 1},
  taxExclusive: {amount: 'ohos_demo', minorUnitsAmount: 1},
};

const sample89: Checkout.Amount = {
  amount: 'ohos_demo',
  minorUnitsAmount: 1,
};

const sample90: Checkout.TaxAmount = {
  inclusive: true,
  displayName: 'ohos_demo',
  percentage: 1,
  amount: 'ohos_demo',
  minorUnitsAmount: 1,
};

const sample91: Checkout.AdjustableQuantity = {
  minimum: 1,
  maximum: 1,
};

const sample92: Checkout.DiscountAmount = {
  displayName: 'ohos_demo',
  promotionCode: 'ohos_demo',
  percentOff: 1,
  amount: 'ohos_demo',
  minorUnitsAmount: 1,
};

const sample93: Checkout.Tax = {
  status: "ready",
};

const sample94: Checkout.Totals = {
  subtotal: {amount: 'ohos_demo', minorUnitsAmount: 1},
  taxExclusive: {amount: 'ohos_demo', minorUnitsAmount: 1},
  taxInclusive: {amount: 'ohos_demo', minorUnitsAmount: 1},
  discount: {amount: 'ohos_demo', minorUnitsAmount: 1},
  total: {amount: 'ohos_demo', minorUnitsAmount: 1},
};

const sample95: Checkout.SessionStatus = {type: "open"};

const sample96: Checkout.PaymentStatus = "paid";

const sample97: Props = null;

const sample98: EmbeddedPaymentElementResult = {status: "completed"};

const sample99: PaymentOptionDisplayData = {
  label: 'ohos_demo',
  image: 'ohos_demo',
  billingDetails: {email: 'ohos_demo', phone: 'ohos_demo', name: 'ohos_demo', address: {city: 'ohos_demo', country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', postalCode: 'ohos_demo', state: 'ohos_demo'}},
  paymentMethodType: 'ohos_demo',
  mandateHTML: 'ohos_demo',
};

const sample100: EmbeddedFormSheetAction = {type: "confirm", onFormSheetConfirmComplete: () => undefined};

const sample101: EmbeddedRowSelectionBehavior = {type: "default"};

const sample102: EmbeddedPaymentElementConfiguration = {
  merchantDisplayName: 'ohos_demo',
  customerId: 'ohos_demo',
  customerEphemeralKeySecret: 'ohos_demo',
  customerSessionClientSecret: 'ohos_demo',
  applePay: {merchantCountryCode: 'ohos_demo', cartItems: [undefined as never], buttonType: undefined as never, request: undefined as never, setOrderTracking: () => undefined},
  googlePay: {merchantCountryCode: 'ohos_demo', currencyCode: 'ohos_demo', testEnv: true, label: 'ohos_demo', amount: 'ohos_demo', buttonType: undefined as never},
  link: {display: LinkDisplay.AUTOMATIC},
  style: undefined as never,
  returnURL: 'ohos_demo',
  billingDetailsCollectionConfiguration: {name: CollectionMode.AUTOMATIC, phone: CollectionMode.AUTOMATIC, email: CollectionMode.AUTOMATIC, address: AddressCollectionMode.AUTOMATIC, attachDefaultsToPaymentMethod: true},
  defaultBillingDetails: {email: 'ohos_demo', phone: 'ohos_demo', name: 'ohos_demo', address: {city: 'ohos_demo', country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', postalCode: 'ohos_demo', state: 'ohos_demo'}},
  defaultShippingDetails: {name: 'ohos_demo', address: {city: 'ohos_demo', country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', postalCode: 'ohos_demo', state: 'ohos_demo'}, phone: 'ohos_demo', isCheckboxSelected: true},
  allowsDelayedPaymentMethods: true,
  appearance: undefined as never,
  primaryButtonLabel: 'ohos_demo',
  removeSavedPaymentMethodMessage: 'ohos_demo',
  preferredNetworks: [CardBrand.JCB],
  paymentMethodOrder: ['ohos_demo'],
  allowsRemovalOfLastSavedPaymentMethod: true,
  cardBrandAcceptance: {filter: CardBrandAcceptanceFilter.All},
  cardFundingFiltering: {allowedCardFundingTypes: [CardFundingType.Debit]},
  formSheetAction: {type: "confirm", onFormSheetConfirmComplete: () => undefined},
  customPaymentMethodConfiguration: {customPaymentMethods: [{id: 'ohos_demo', subtitle: 'ohos_demo', disableBillingDetailCollection: true}], confirmCustomPaymentMethodCallback: () => undefined},
  rowSelectionBehavior: {type: "default"},
  embeddedViewDisplaysMandateText: true,
  opensCardScannerAutomatically: true,
};

const sample103: UseEmbeddedPaymentElementResult = {
  embeddedPaymentElementView: null,
  paymentOption: {label: 'ohos_demo', image: 'ohos_demo', billingDetails: {email: 'ohos_demo', phone: 'ohos_demo', name: 'ohos_demo', address: {} as Address}, paymentMethodType: 'ohos_demo', mandateHTML: 'ohos_demo'},
  confirm: async () => undefined,
  update: () => undefined,
  clearPaymentOption: () => undefined,
  loadingError: {name: 'ohos_demo', message: 'ohos_demo', stack: 'ohos_demo'},
  isLoaded: true,
};

const sample104: SetupParamsBase = null;

const sample105: SetupParams = null;

const sample106: IntentParams = {paymentIntentClientSecret: 'ohos_demo', setupIntentClientSecret: null, intentConfiguration: undefined as never};

const sample107: ApplePayParams = {
  merchantCountryCode: 'ohos_demo',
  cartItems: [undefined as never],
  buttonType: undefined as never,
  request: undefined as never,
  setOrderTracking: () => undefined,
};

const sample108: GooglePayParams = {
  merchantCountryCode: 'ohos_demo',
  currencyCode: 'ohos_demo',
  testEnv: true,
  label: 'ohos_demo',
  amount: 'ohos_demo',
  buttonType: undefined as never,
};

const sample109: LinkParams = {
  display: LinkDisplay.AUTOMATIC,
};

const sample110: AppearanceParams = {
  font: undefined as never,
  colors: undefined as never,
  shapes: undefined as never,
  primaryButton: undefined as never,
  embeddedPaymentElement: undefined as never,
  formInsetValues: undefined as never,
  applyLiquidGlass: true,
  navigationBarStyle: NavigationBarStyle.Plain,
};

const sample111: FontConfig = {
  family: 'ohos_demo',
  scale: 1,
};

const sample112: ShadowConfig = {
  color: 'ohos_demo',
  opacity: 1,
  offset: {x: 1, y: 1},
  blurRadius: 1,
};

const sample113: GlobalColorConfig = {
  primary: 'ohos_demo',
  background: 'ohos_demo',
  componentBackground: 'ohos_demo',
  componentBorder: 'ohos_demo',
  componentDivider: 'ohos_demo',
  primaryText: 'ohos_demo',
  secondaryText: 'ohos_demo',
  componentText: 'ohos_demo',
  placeholderText: 'ohos_demo',
  icon: 'ohos_demo',
  error: 'ohos_demo',
};

const sample114: PrimaryButtonConfig = {
  font: undefined as never,
  colors: {background: 'ohos_demo', text: 'ohos_demo', border: 'ohos_demo', successBackgroundColor: 'ohos_demo', successTextColor: 'ohos_demo'},
  shapes: {borderRadius: 1, borderWidth: 1, shadow: {} as ShadowConfig, height: 1},
};

const sample115: PrimaryButtonColorConfig = {
  background: 'ohos_demo',
  text: 'ohos_demo',
  border: 'ohos_demo',
  successBackgroundColor: 'ohos_demo',
  successTextColor: 'ohos_demo',
};

const sample116: ThemedColor = 'ohos_demo';

const sample117: EdgeInsetsConfig = {
  top: 1,
  left: 1,
  bottom: 1,
  right: 1,
};

const sample118: RadioConfig = {
  selectedColor: 'ohos_demo',
  unselectedColor: 'ohos_demo',
};

const sample119: CheckmarkConfig = {
  color: 'ohos_demo',
};

const sample120: DisclosureConfig = {
  color: 'ohos_demo',
};

const sample121: FlatConfig = {
  separatorThickness: 1,
  separatorColor: 'ohos_demo',
  separatorInsets: {top: 1, left: 1, bottom: 1, right: 1},
  topSeparatorEnabled: true,
  bottomSeparatorEnabled: true,
  radio: {selectedColor: 'ohos_demo', unselectedColor: 'ohos_demo'},
  checkmark: {color: 'ohos_demo'},
  disclosure: {color: 'ohos_demo'},
};

const sample122: FloatingConfig = {
  spacing: 1,
};

const sample123: RowConfig = {
  style: RowStyle.FlatWithRadio,
  additionalInsets: 1,
  flat: {separatorThickness: 1, separatorColor: 'ohos_demo', separatorInsets: {top: 1, left: 1, bottom: 1, right: 1}, topSeparatorEnabled: true, bottomSeparatorEnabled: true, radio: {selectedColor: 'ohos_demo', unselectedColor: 'ohos_demo'}, checkmark: {color: 'ohos_demo'}, disclosure: {color: 'ohos_demo'}},
  floating: {spacing: 1},
};

const sample124: EmbeddedPaymentElementAppearance = {
  row: {style: RowStyle.FlatWithRadio, additionalInsets: 1, flat: {separatorThickness: 1, separatorColor: 'ohos_demo', separatorInsets: {} as EdgeInsetsConfig, topSeparatorEnabled: true, bottomSeparatorEnabled: true, radio: {} as RadioConfig, checkmark: {} as CheckmarkConfig, disclosure: {} as DisclosureConfig}, floating: {spacing: 1}},
};

const sample125: PaymentOption = {
  label: 'ohos_demo',
  image: 'ohos_demo',
};

const sample126: PresentOptions = {
  timeout: 1,
};

const sample127: BillingDetailsCollectionConfiguration = {
  name: CollectionMode.AUTOMATIC,
  phone: CollectionMode.AUTOMATIC,
  email: CollectionMode.AUTOMATIC,
  address: AddressCollectionMode.AUTOMATIC,
  attachDefaultsToPaymentMethod: true,
};

const sample128: IntentCreationError = {
  code: "Failed",
  message: 'ohos_demo',
  localizedMessage: 'ohos_demo',
  declineCode: 'ohos_demo',
  stripeErrorCode: 'ohos_demo',
  type: "api_connection_error",
};

const sample129: IntentCreationCallbackParams = {clientSecret: 'ohos_demo', error: undefined as never};

const sample130: IntentConfiguration = {
  confirmHandler: () => undefined,
  confirmationTokenConfirmHandler: () => undefined,
  mode: {amount: 1, currencyCode: 'ohos_demo', setupFutureUsage: undefined as never, captureMethod: CaptureMethod.Automatic, paymentMethodOptions: {} as PaymentMethodOptions},
  paymentMethodTypes: ['ohos_demo'],
  onBehalfOf: 'ohos_demo',
};

const sample131: Mode = {amount: 1, currencyCode: 'ohos_demo', setupFutureUsage: undefined as never, captureMethod: CaptureMethod.Automatic, paymentMethodOptions: {} as PaymentMethodOptions};

const sample132: PaymentMode = {
  amount: 1,
  currencyCode: 'ohos_demo',
  setupFutureUsage: undefined as never,
  captureMethod: CaptureMethod.Automatic,
  paymentMethodOptions: {setupFutureUsageValues: null},
};

const sample133: PaymentMethodOptions = {
  setupFutureUsageValues: null,
};

const sample134: SetupMode = {
  currencyCode: 'ohos_demo',
  setupFutureUsage: undefined as never,
};

const sample135: CardFundingFiltering = {
  allowedCardFundingTypes: [CardFundingType.Debit],
};

const sample136: CardBrandAcceptance = {filter: CardBrandAcceptanceFilter.All};

const sample137: CustomPaymentMethod = {
  id: 'ohos_demo',
  subtitle: 'ohos_demo',
  disableBillingDetailCollection: true,
};

const sample138: CustomPaymentMethodResult = {status: CustomPaymentMethodResultStatus.Completed};

const sample139: ConfirmCustomPaymentMethodCallback = async () => undefined;

const sample140: CustomPaymentMethodConfiguration = {
  customPaymentMethods: [{id: 'ohos_demo', subtitle: 'ohos_demo', disableBillingDetailCollection: true}],
  confirmCustomPaymentMethodCallback: () => undefined,
};

const sample141: Result = {
  id: 'ohos_demo',
  created: 1,
  expiresAt: 1,
  liveMode: true,
  paymentIntentId: 'ohos_demo',
  setupIntentId: 'ohos_demo',
  returnURL: 'ohos_demo',
  setupFutureUsage: undefined as never,
  paymentMethodPreview: {type: undefined as never, billingDetails: {email: 'ohos_demo', phone: 'ohos_demo', name: 'ohos_demo', address: {} as Address}, allowRedisplay: "always", customerId: 'ohos_demo', allResponseFields: undefined as never},
  shipping: {address: {city: 'ohos_demo', country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', postalCode: 'ohos_demo', state: 'ohos_demo'}, name: 'ohos_demo', phone: 'ohos_demo'},
  allResponseFields: undefined as never,
};

const sample142: PaymentMethodPreview = {
  type: undefined as never,
  billingDetails: {email: 'ohos_demo', phone: 'ohos_demo', name: 'ohos_demo', address: {city: 'ohos_demo', country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', postalCode: 'ohos_demo', state: 'ohos_demo'}},
  allowRedisplay: "always",
  customerId: 'ohos_demo',
  allResponseFields: undefined as never,
};

const sample143: AllowRedisplay = "always";

const sample144: ShippingDetails = {
  address: {city: 'ohos_demo', country: 'ohos_demo', line1: 'ohos_demo', line2: 'ohos_demo', postalCode: 'ohos_demo', state: 'ohos_demo'},
  name: 'ohos_demo',
  phone: 'ohos_demo',
};

const sample145: PaymentMethodMessagingElementState = {status: "loading"};

const sample146: PaymentMethodMessagingElementFont = {
  family: 'ohos_demo',
  size: 1,
};

const sample147: PaymentMethodMessagingElementAppearance = {
  font: {family: 'ohos_demo', size: 1},
  textColor: 'ohos_demo',
  linkTextColor: 'ohos_demo',
  style: PaymentMethodMessagingElementStyle.Flat,
};

const sample148: PaymentMethodMessagingElementConfiguration = {
  amount: 1,
  currency: 'ohos_demo',
  locale: 'ohos_demo',
  country: 'ohos_demo',
  paymentMethodTypes: ['ohos_demo'],
};

const sample149: OnStateChangeEvent = undefined as never;

const sample150: NativeProps = {
  style: undefined as never,
  appearance: {font: {family: 'ohos_demo', size: 1}, textColor: 'ohos_demo', linkTextColor: 'ohos_demo', style: PaymentMethodMessagingElementStyle.Flat},
  configuration: {amount: 1, currency: 'ohos_demo', locale: 'ohos_demo', country: 'ohos_demo', paymentMethodTypes: ['ohos_demo']},
  onStateChange: () => undefined,
};

const sample151: NavigationBarProps = {
  title: 'ohos_demo',
  onCloseButtonPress: () => undefined,
};

const enum152 = {
  JCB: CardBrand.JCB,
  Amex: CardBrand.Amex,
  CartesBancaires: CardBrand.CartesBancaires,
  DinersClub: CardBrand.DinersClub,
  Discover: CardBrand.Discover,
  Mastercard: CardBrand.Mastercard,
  UnionPay: CardBrand.UnionPay,
  Visa: CardBrand.Visa,
  Unknown: CardBrand.Unknown,
};

const enum153 = {
  Horizontal: PaymentMethodLayout.Horizontal,
  Vertical: PaymentMethodLayout.Vertical,
  Automatic: PaymentMethodLayout.Automatic,
};

const enum154 = {
  TOKEN_STATE_NEEDS_IDENTITY_VERIFICATION: GooglePayCardTokenStatus.TOKEN_STATE_NEEDS_IDENTITY_VERIFICATION,
  TOKEN_STATE_PENDING: GooglePayCardTokenStatus.TOKEN_STATE_PENDING,
  TOKEN_STATE_SUSPENDED: GooglePayCardTokenStatus.TOKEN_STATE_SUSPENDED,
  TOKEN_STATE_ACTIVE: GooglePayCardTokenStatus.TOKEN_STATE_ACTIVE,
  TOKEN_STATE_FELICA_PENDING_PROVISIONING: GooglePayCardTokenStatus.TOKEN_STATE_FELICA_PENDING_PROVISIONING,
  TOKEN_STATE_UNTOKENIZED: GooglePayCardTokenStatus.TOKEN_STATE_UNTOKENIZED,
};

const enum155 = {
  MISSING_CONFIGURATION: CanAddCardToWalletStatus.MISSING_CONFIGURATION,
  UNSUPPORTED_DEVICE: CanAddCardToWalletStatus.UNSUPPORTED_DEVICE,
  CARD_ALREADY_EXISTS: CanAddCardToWalletStatus.CARD_ALREADY_EXISTS,
  CARD_EXISTS_ON_CURRENT_DEVICE: CanAddCardToWalletStatus.CARD_EXISTS_ON_CURRENT_DEVICE,
  CARD_EXISTS_ON_PAIRED_DEVICE: CanAddCardToWalletStatus.CARD_EXISTS_ON_PAIRED_DEVICE,
};

const enum156 = {
  Canceled: ConfirmPaymentError.Canceled,
  Failed: ConfirmPaymentError.Failed,
  Unknown: ConfirmPaymentError.Unknown,
};

const enum157 = {
  Canceled: CardActionError.Canceled,
  Failed: CardActionError.Failed,
  Unknown: CardActionError.Unknown,
};

const enum158 = {
  Canceled: ConfirmSetupIntentError.Canceled,
  Failed: ConfirmSetupIntentError.Failed,
  Unknown: ConfirmSetupIntentError.Unknown,
};

const enum159 = {
  Failed: CreatePaymentMethodError.Failed,
};

const enum160 = {
  Failed: CreateTokenError.Failed,
};

const enum161 = {
  Unknown: RetrievePaymentIntentError.Unknown,
};

const enum162 = {
  Unknown: RetrieveSetupIntentError.Unknown,
};

const enum163 = {
  Canceled: ApplePayError.Canceled,
  Failed: ApplePayError.Failed,
  Unknown: ApplePayError.Unknown,
};

const enum164 = {
  Failed: PaymentSheetError.Failed,
  Canceled: PaymentSheetError.Canceled,
  Timeout: PaymentSheetError.Timeout,
};

const enum165 = {
  Failed: GooglePayError.Failed,
  Canceled: GooglePayError.Canceled,
  Unknown: GooglePayError.Unknown,
};

const enum166 = {
  Canceled: VerifyMicrodepositsError.Canceled,
  Failed: VerifyMicrodepositsError.Failed,
  Unknown: VerifyMicrodepositsError.Unknown,
};

const enum167 = {
  Canceled: CollectBankAccountError.Canceled,
  Failed: CollectBankAccountError.Failed,
  Unknown: CollectBankAccountError.Unknown,
};

const enum168 = {
  Failed: AddressSheetError.Failed,
  Canceled: AddressSheetError.Canceled,
};

const enum169 = {
  Failed: CustomerSheetError.Failed,
  Canceled: CustomerSheetError.Canceled,
};

const enum170 = {
  Canceled: PlatformPayError.Canceled,
  Failed: PlatformPayError.Failed,
  Unknown: PlatformPayError.Unknown,
};

const enum171 = {
  Failed: RadarError.Failed,
  Unknown: RadarError.Unknown,
};

const enum172 = {
  Failed: LinkControllerError.Failed,
  Canceled: LinkControllerError.Canceled,
  Unknown: LinkControllerError.Unknown,
};

const enum173 = {
  AUTOMATIC: LinkDisplay.AUTOMATIC,
  NEVER: LinkDisplay.NEVER,
};

const enum174 = {
  AUTOMATIC: TermsDisplay.AUTOMATIC,
  NEVER: TermsDisplay.NEVER,
};

const enum175 = {
  Plain: NavigationBarStyle.Plain,
  Glass: NavigationBarStyle.Glass,
};

const enum176 = {
  FlatWithRadio: RowStyle.FlatWithRadio,
  FloatingButton: RowStyle.FloatingButton,
  FlatWithCheckmark: RowStyle.FlatWithCheckmark,
  FlatWithDisclosure: RowStyle.FlatWithDisclosure,
};

const enum177 = {
  AUTOMATIC: CollectionMode.AUTOMATIC,
  NEVER: CollectionMode.NEVER,
  ALWAYS: CollectionMode.ALWAYS,
};

const enum178 = {
  AUTOMATIC: AddressCollectionMode.AUTOMATIC,
  NEVER: AddressCollectionMode.NEVER,
  FULL: AddressCollectionMode.FULL,
};

const enum179 = {
  Automatic: CaptureMethod.Automatic,
  Manual: CaptureMethod.Manual,
  AutomaticAsync: CaptureMethod.AutomaticAsync,
};

const enum180 = {
  Debit: CardFundingType.Debit,
  Credit: CardFundingType.Credit,
  Prepaid: CardFundingType.Prepaid,
  Unknown: CardFundingType.Unknown,
};

const enum181 = {
  Visa: CardBrandCategory.Visa,
  Mastercard: CardBrandCategory.Mastercard,
  Amex: CardBrandCategory.Amex,
  Discover: CardBrandCategory.Discover,
};

const enum182 = {
  All: CardBrandAcceptanceFilter.All,
  Allowed: CardBrandAcceptanceFilter.Allowed,
  Disallowed: CardBrandAcceptanceFilter.Disallowed,
};

const enum183 = {
  Completed: CustomPaymentMethodResultStatus.Completed,
  Canceled: CustomPaymentMethodResultStatus.Canceled,
  Failed: CustomPaymentMethodResultStatus.Failed,
};

const enum184 = {
  Flat: PaymentMethodMessagingElementStyle.Flat,
  Dark: PaymentMethodMessagingElementStyle.Dark,
  Light: PaymentMethodMessagingElementStyle.Light,
};

export function TypesGapDemo() {
  return (
    <DemoScreen title="类型补样（全字段字面量 / 枚举引用）" description="">
      <Section title={"类型样例 1"} description="">
        <JsonCard label="StripeProviderProps（字面量类型）" value={sample1} />
        <JsonCard label="CardFieldProps（全 14 字段）" value={sample2} />
        <JsonCard label="CardFormProps（全 10 字段）" value={sample3} />
        <JsonCard label="AuBECSDebitFormProps（全 5 字段）" value={sample4} />
        <JsonCard label="StripeContainerProps（全 4 字段）" value={sample5} />
        <JsonCard label="AddToWalletButtonProps（全 10 字段）" value={sample6} />
        <JsonCard label="AddressSheetProps（全 13 字段）" value={sample7} />
        <JsonCard label="PlatformPayButtonProps（全 11 字段）" value={sample8} />
        <JsonCard label="CustomerSheetProps（字面量类型）" value={sample9} />
        <JsonCard label="PaymentMethodMessagingElementProps（全 3 字段）" value={sample10} />
        <JsonCard label="StripeConnectInstance（全 1 字段）" value={sample11} />
        <JsonCard label="StripeConnectInitParams（全 5 字段）" value={sample12} />
      </Section>
      <Section title={"类型样例 2"} description="">
        <JsonCard label="StripeConnectUpdateParams（全 2 字段）" value={sample13} />
        <JsonCard label="Address（全 6 字段）" value={sample14} />
        <JsonCard label="BillingDetails（全 4 字段）" value={sample15} />
        <JsonCard label="AddressDetails（全 4 字段）" value={sample16} />
        <JsonCard label="AppInfo（全 4 字段）" value={sample17} />
        <JsonCard label="CreatePaymentMethodResult（字面量类型）" value={sample18} />
        <JsonCard label="RetrievePaymentIntentResult（字面量类型）" value={sample19} />
        <JsonCard label="RetrieveSetupIntentResult（字面量类型）" value={sample20} />
        <JsonCard label="ConfirmPaymentResult（字面量类型）" value={sample21} />
        <JsonCard label="HandleNextActionResult（字面量类型）" value={sample22} />
        <JsonCard label="HandleNextActionForSetupResult（字面量类型）" value={sample23} />
        <JsonCard label="ConfirmSetupIntentResult（字面量类型）" value={sample24} />
      </Section>
      <Section title={"类型样例 3"} description="">
        <JsonCard label="CreateTokenForCVCUpdateResult（字面量类型）" value={sample25} />
        <JsonCard label="InitPaymentSheetResult（字面量类型）" value={sample26} />
        <JsonCard label="PresentPaymentSheetResult（全 3 字段）" value={sample27} />
        <JsonCard label="CreateTokenResult（字面量类型）" value={sample28} />
        <JsonCard label="ConfirmPaymentSheetPaymentResult（全 1 字段）" value={sample29} />
        <JsonCard label="CreateRadarSessionResult（字面量类型）" value={sample30} />
        <JsonCard label="ApplePayResult（字面量类型）" value={sample31} />
        <JsonCard label="InitStripeParams（全 6 字段）" value={sample32} />
        <JsonCard label="InitialiseParams（全 7 字段）" value={sample33} />
        <JsonCard label="GooglePayInitResult（字面量类型）" value={sample34} />
        <JsonCard label="PayWithGooglePayResult（字面量类型）" value={sample35} />
        <JsonCard label="CreateGooglePayPaymentMethodResult（字面量类型）" value={sample36} />
      </Section>
      <Section title={"类型样例 4"} description="">
        <JsonCard label="OpenApplePaySetupResult（字面量类型）" value={sample37} />
        <JsonCard label="VerifyMicrodepositsParams（字面量类型）" value={sample38} />
        <JsonCard label="VerifyMicrodepositsForPaymentResult（字面量类型）" value={sample39} />
        <JsonCard label="VerifyMicrodepositsForSetupResult（字面量类型）" value={sample40} />
        <JsonCard label="CollectBankAccountForPaymentResult（字面量类型）" value={sample41} />
        <JsonCard label="CollectBankAccountForSetupResult（字面量类型）" value={sample42} />
        <JsonCard label="GooglePayCardToken（全 8 字段）" value={sample43} />
        <JsonCard label="IsCardInWalletResult（字面量类型）" value={sample44} />
        <JsonCard label="CanAddCardToWalletParams（全 6 字段）" value={sample45} />
        <JsonCard label="CanAddCardToWalletResult（字面量类型）" value={sample46} />
        <JsonCard label="ErrorType（字面量类型）" value={sample47} />
        <JsonCard label="StripeError（全 6 字段）" value={sample48} />
      </Section>
      <Section title={"类型样例 5"} description="">
        <JsonCard label="CustomerSheetInitParams（字面量类型）" value={sample49} />
        <JsonCard label="CustomerSheetPresentParams（全 3 字段）" value={sample50} />
        <JsonCard label="CustomerSheetResult（全 3 字段）" value={sample51} />
        <JsonCard label="CustomerAdapter（全 6 字段）" value={sample52} />
        <JsonCard label="CustomerPaymentOption（字面量类型）" value={sample53} />
        <JsonCard label="ClientSecretProvider（全 2 字段）" value={sample54} />
        <JsonCard label="CustomerSheetIntentConfiguration（全 2 字段）" value={sample55} />
        <JsonCard label="CustomerSessionClientSecret（全 2 字段）" value={sample56} />
        <JsonCard label="CheckoutController（全 11 字段）" value={sample57} />
        <JsonCard label="CheckoutPaymentElement（全 1 字段）" value={sample58} />
        <JsonCard label="CheckoutPaymentElementViewProps（全 1 字段）" value={sample59} />
        <JsonCard label="Checkout.UserInterfaceStyle（字面量类型）" value={sample60} />
      </Section>
      <Section title={"类型样例 6"} description="">
        <JsonCard label="Checkout.CreateOptions（全 6 字段）" value={sample61} />
        <JsonCard label="Checkout.UseOptions（全 2 字段）" value={sample62} />
        <JsonCard label="Checkout.UseResult（全 12 字段）" value={sample63} />
        <JsonCard label="Checkout.UpdateShippingAddressParams（全 2 字段）" value={sample64} />
        <JsonCard label="Checkout.Result（字面量类型）" value={sample65} />
        <JsonCard label="Checkout.ErrorCode（字面量类型）" value={sample66} />
        <JsonCard label="Checkout.Defaults（全 4 字段）" value={sample67} />
        <JsonCard label="Checkout.ContactDetails（全 2 字段）" value={sample68} />
        <JsonCard label="Checkout.ApplePayConfiguration（全 2 字段）" value={sample69} />
        <JsonCard label="Checkout.ApplePayButtonType（字面量类型）" value={sample70} />
        <JsonCard label="Checkout.GooglePayConfiguration（全 4 字段）" value={sample71} />
        <JsonCard label="Checkout.GooglePayButtonType（字面量类型）" value={sample72} />
      </Section>
      <Section title={"类型样例 7"} description="">
        <JsonCard label="Checkout.LinkConfiguration（全 1 字段）" value={sample73} />
        <JsonCard label="Checkout.SavePaymentMethodOptInBehavior（字面量类型）" value={sample74} />
        <JsonCard label="Checkout.PaymentElementAppearance（全 8 字段）" value={sample75} />
        <JsonCard label="Checkout.RowSelectionBehavior（字面量类型）" value={sample76} />
        <JsonCard label="Checkout.BillingDetailsCollectionConfiguration（全 4 字段）" value={sample77} />
        <JsonCard label="Checkout.PaymentElementConfiguration（全 15 字段）" value={sample78} />
        <JsonCard label="Checkout.Session（全 16 字段）" value={sample79} />
        <JsonCard label="Checkout.PresentmentDetails（全 1 字段）" value={sample80} />
        <JsonCard label="Checkout.PaymentOptionDisplayData（全 5 字段）" value={sample81} />
        <JsonCard label="Checkout.BillingDetails（全 4 字段）" value={sample82} />
        <JsonCard label="Checkout.ShippingAddress（全 2 字段）" value={sample83} />
        <JsonCard label="Checkout.Address（全 6 字段）" value={sample84} />
      </Section>
      <Section title={"类型样例 8"} description="">
        <JsonCard label="Checkout.OrderSummaryItem（全 5 字段）" value={sample85} />
        <JsonCard label="Checkout.OneTimePriceOrderSummaryItem（全 5 字段）" value={sample86} />
        <JsonCard label="Checkout.OneTimePriceItem（全 8 字段）" value={sample87} />
        <JsonCard label="Checkout.AmountDetails（全 6 字段）" value={sample88} />
        <JsonCard label="Checkout.Amount（全 2 字段）" value={sample89} />
        <JsonCard label="Checkout.TaxAmount（全 5 字段）" value={sample90} />
        <JsonCard label="Checkout.AdjustableQuantity（全 2 字段）" value={sample91} />
        <JsonCard label="Checkout.DiscountAmount（全 5 字段）" value={sample92} />
        <JsonCard label="Checkout.Tax（全 1 字段）" value={sample93} />
        <JsonCard label="Checkout.Totals（全 5 字段）" value={sample94} />
        <JsonCard label="Checkout.SessionStatus（字面量类型）" value={sample95} />
        <JsonCard label="Checkout.PaymentStatus（字面量类型）" value={sample96} />
      </Section>
      <Section title={"类型样例 9"} description="">
        <JsonCard label="Props（字面量类型）" value={sample97} />
        <JsonCard label="EmbeddedPaymentElementResult（字面量类型）" value={sample98} />
        <JsonCard label="PaymentOptionDisplayData（全 5 字段）" value={sample99} />
        <JsonCard label="EmbeddedFormSheetAction（字面量类型）" value={sample100} />
        <JsonCard label="EmbeddedRowSelectionBehavior（字面量类型）" value={sample101} />
        <JsonCard label="EmbeddedPaymentElementConfiguration（全 26 字段）" value={sample102} />
        <JsonCard label="UseEmbeddedPaymentElementResult（全 7 字段）" value={sample103} />
        <JsonCard label="SetupParamsBase（字面量类型）" value={sample104} />
        <JsonCard label="SetupParams（字面量类型）" value={sample105} />
        <JsonCard label="IntentParams（字面量类型）" value={sample106} />
        <JsonCard label="ApplePayParams（全 5 字段）" value={sample107} />
        <JsonCard label="GooglePayParams（全 6 字段）" value={sample108} />
      </Section>
      <Section title={"类型样例 10"} description="">
        <JsonCard label="LinkParams（全 1 字段）" value={sample109} />
        <JsonCard label="AppearanceParams（全 8 字段）" value={sample110} />
        <JsonCard label="FontConfig（全 2 字段）" value={sample111} />
        <JsonCard label="ShadowConfig（全 4 字段）" value={sample112} />
        <JsonCard label="GlobalColorConfig（全 11 字段）" value={sample113} />
        <JsonCard label="PrimaryButtonConfig（全 3 字段）" value={sample114} />
        <JsonCard label="PrimaryButtonColorConfig（全 5 字段）" value={sample115} />
        <JsonCard label="ThemedColor（字面量类型）" value={sample116} />
        <JsonCard label="EdgeInsetsConfig（全 4 字段）" value={sample117} />
        <JsonCard label="RadioConfig（全 2 字段）" value={sample118} />
        <JsonCard label="CheckmarkConfig（全 1 字段）" value={sample119} />
        <JsonCard label="DisclosureConfig（全 1 字段）" value={sample120} />
      </Section>
      <Section title={"类型样例 11"} description="">
        <JsonCard label="FlatConfig（全 8 字段）" value={sample121} />
        <JsonCard label="FloatingConfig（全 1 字段）" value={sample122} />
        <JsonCard label="RowConfig（全 4 字段）" value={sample123} />
        <JsonCard label="EmbeddedPaymentElementAppearance（全 1 字段）" value={sample124} />
        <JsonCard label="PaymentOption（全 2 字段）" value={sample125} />
        <JsonCard label="PresentOptions（全 1 字段）" value={sample126} />
        <JsonCard label="BillingDetailsCollectionConfiguration（全 5 字段）" value={sample127} />
        <JsonCard label="IntentCreationError（全 6 字段）" value={sample128} />
        <JsonCard label="IntentCreationCallbackParams（字面量类型）" value={sample129} />
        <JsonCard label="IntentConfiguration（全 5 字段）" value={sample130} />
        <JsonCard label="Mode（字面量类型）" value={sample131} />
        <JsonCard label="PaymentMode（全 5 字段）" value={sample132} />
      </Section>
      <Section title={"类型样例 12"} description="">
        <JsonCard label="PaymentMethodOptions（全 1 字段）" value={sample133} />
        <JsonCard label="SetupMode（全 2 字段）" value={sample134} />
        <JsonCard label="CardFundingFiltering（全 1 字段）" value={sample135} />
        <JsonCard label="CardBrandAcceptance（字面量类型）" value={sample136} />
        <JsonCard label="CustomPaymentMethod（全 3 字段）" value={sample137} />
        <JsonCard label="CustomPaymentMethodResult（字面量类型）" value={sample138} />
        <JsonCard label="ConfirmCustomPaymentMethodCallback（字面量类型）" value={sample139} />
        <JsonCard label="CustomPaymentMethodConfiguration（全 2 字段）" value={sample140} />
        <JsonCard label="Result（全 11 字段）" value={sample141} />
        <JsonCard label="PaymentMethodPreview（全 5 字段）" value={sample142} />
        <JsonCard label="AllowRedisplay（字面量类型）" value={sample143} />
        <JsonCard label="ShippingDetails（全 3 字段）" value={sample144} />
      </Section>
      <Section title={"类型样例 13"} description="">
        <JsonCard label="PaymentMethodMessagingElementState（字面量类型）" value={sample145} />
        <JsonCard label="PaymentMethodMessagingElementFont（全 2 字段）" value={sample146} />
        <JsonCard label="PaymentMethodMessagingElementAppearance（全 4 字段）" value={sample147} />
        <JsonCard label="PaymentMethodMessagingElementConfiguration（全 5 字段）" value={sample148} />
        <JsonCard label="OnStateChangeEvent（字面量类型）" value={sample149} />
        <JsonCard label="NativeProps（全 4 字段）" value={sample150} />
        <JsonCard label="NavigationBarProps（全 2 字段）" value={sample151} />
      </Section>
      <Section title="枚举成员引用" description="">
        <JsonCard label="CardBrand（9 成员）" value={enum152} />
        <JsonCard label="PaymentMethodLayout（3 成员）" value={enum153} />
        <JsonCard label="GooglePayCardTokenStatus（6 成员）" value={enum154} />
        <JsonCard label="CanAddCardToWalletStatus（5 成员）" value={enum155} />
        <JsonCard label="ConfirmPaymentError（3 成员）" value={enum156} />
        <JsonCard label="CardActionError（3 成员）" value={enum157} />
        <JsonCard label="ConfirmSetupIntentError（3 成员）" value={enum158} />
        <JsonCard label="CreatePaymentMethodError（1 成员）" value={enum159} />
        <JsonCard label="CreateTokenError（1 成员）" value={enum160} />
        <JsonCard label="RetrievePaymentIntentError（1 成员）" value={enum161} />
        <JsonCard label="RetrieveSetupIntentError（1 成员）" value={enum162} />
        <JsonCard label="ApplePayError（3 成员）" value={enum163} />
        <JsonCard label="PaymentSheetError（3 成员）" value={enum164} />
        <JsonCard label="GooglePayError（3 成员）" value={enum165} />
        <JsonCard label="VerifyMicrodepositsError（3 成员）" value={enum166} />
        <JsonCard label="CollectBankAccountError（3 成员）" value={enum167} />
        <JsonCard label="AddressSheetError（2 成员）" value={enum168} />
        <JsonCard label="CustomerSheetError（2 成员）" value={enum169} />
        <JsonCard label="PlatformPayError（3 成员）" value={enum170} />
        <JsonCard label="RadarError（2 成员）" value={enum171} />
        <JsonCard label="LinkControllerError（3 成员）" value={enum172} />
        <JsonCard label="LinkDisplay（2 成员）" value={enum173} />
        <JsonCard label="TermsDisplay（2 成员）" value={enum174} />
        <JsonCard label="NavigationBarStyle（2 成员）" value={enum175} />
        <JsonCard label="RowStyle（4 成员）" value={enum176} />
        <JsonCard label="CollectionMode（3 成员）" value={enum177} />
        <JsonCard label="AddressCollectionMode（3 成员）" value={enum178} />
        <JsonCard label="CaptureMethod（3 成员）" value={enum179} />
        <JsonCard label="CardFundingType（4 成员）" value={enum180} />
        <JsonCard label="CardBrandCategory（4 成员）" value={enum181} />
        <JsonCard label="CardBrandAcceptanceFilter（3 成员）" value={enum182} />
        <JsonCard label="CustomPaymentMethodResultStatus（3 成员）" value={enum183} />
        <JsonCard label="PaymentMethodMessagingElementStyle（3 成员）" value={enum184} />
      </Section>
    </DemoScreen>
  );
}
