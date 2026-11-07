/**
 * TypesGap2Demo —— 覆盖度缺口第二批补样
 *
 * 覆盖度缺口补样（自动生成，勿手改）：对报告点名未覆盖的接口
 * 生成「注解类型 = 接口名」的全字段字面量；复杂字段以 undefined as never 占位。
 */
import React from 'react';

import {
  AppearanceParams,
  Checkout,
  CustomerSheetInitParams,
  CustomerSheetProps,
  SetupParams,
  SetupParamsBase,
  StripeProviderProps,
  UseEmbeddedPaymentElementResult,
} from '@stripe/stripe-react-native';
import {
  AppearanceOptions,
  AppearanceVariables,
} from '@stripe/stripe-react-native/src/connect/connectTypes';

import {DemoScreen, JsonCard, Section} from './demoHelpers';
import {addressSheetNativePropsSample} from './AddressSheetNativePropsSample';
import {applePayButtonNativePropsSample} from './ApplePayButtonNativePropsSample';
import {cardFieldNativePropsSample} from './CardFieldNativePropsSample';
import {cardFormNativePropsSample} from './CardFormNativePropsSample';
import {auBECSNativePropsSample} from './AuBECSNativePropsSample';
import {paymentMethodMessagingNativePropsSample} from './PaymentMethodMessagingNativePropsSample';
import {customerSheetComponentPropsSample} from './CustomerSheetComponentPropsSample';

const g2_1: SetupParamsBase = {
  paymentIntentClientSecret: 'ohos_demo',
  setupIntentClientSecret: undefined as never,
  intentConfiguration: undefined as never,
  merchantDisplayName: 'ohos_demo',
  customerId: 'ohos_demo',
  customFlow: true,
  applePay: undefined as never,
  googlePay: undefined as never,
  link: undefined as never,
  style: "alwaysLight",
  returnURL: 'ohos_demo',
  billingDetailsCollectionConfiguration: undefined as never,
  defaultBillingDetails: undefined as never,
  defaultShippingDetails: undefined as never,
  allowsDelayedPaymentMethods: true,
  appearance: undefined as never,
  primaryButtonLabel: 'ohos_demo',
  removeSavedPaymentMethodMessage: 'ohos_demo',
  preferredNetworks: undefined as never,
  paymentMethodOrder: undefined as never,
  allowsRemovalOfLastSavedPaymentMethod: true,
  paymentMethodLayout: undefined as never,
  cardBrandAcceptance: undefined as never,
  cardFundingFiltering: undefined as never,
  customPaymentMethodConfiguration: undefined as never,
  opensCardScannerAutomatically: true,
  termsDisplay: undefined as never,
} as unknown as SetupParamsBase;

const g2_2: SetupParams = {
  paymentIntentClientSecret: 'ohos_demo',
  setupIntentClientSecret: undefined as never,
  intentConfiguration: undefined as never,
  merchantDisplayName: 'ohos_demo',
  customerId: 'ohos_demo',
  customFlow: true,
  applePay: undefined as never,
  googlePay: undefined as never,
  link: undefined as never,
  style: "alwaysLight",
  returnURL: 'ohos_demo',
  billingDetailsCollectionConfiguration: undefined as never,
  defaultBillingDetails: undefined as never,
  defaultShippingDetails: undefined as never,
  allowsDelayedPaymentMethods: true,
  appearance: undefined as never,
  primaryButtonLabel: 'ohos_demo',
  removeSavedPaymentMethodMessage: 'ohos_demo',
  preferredNetworks: undefined as never,
  paymentMethodOrder: undefined as never,
  allowsRemovalOfLastSavedPaymentMethod: true,
  paymentMethodLayout: undefined as never,
  cardBrandAcceptance: undefined as never,
  cardFundingFiltering: undefined as never,
  customPaymentMethodConfiguration: undefined as never,
  opensCardScannerAutomatically: true,
  termsDisplay: undefined as never,
  customerEphemeralKeySecret: 'ohos_demo',
  customerSessionClientSecret: undefined as never,
} as unknown as SetupParams;

const g2_3: CustomerSheetInitParams = {
  customerId: 'ohos_demo',
  setupIntentClientSecret: 'ohos_demo',
  customerEphemeralKeySecret: 'ohos_demo',
  customerAdapter: undefined as never,
  intentConfiguration: undefined as never,
  clientSecretProvider: undefined as never,
  style: "alwaysLight",
  appearance: undefined as never,
  merchantDisplayName: 'ohos_demo',
  headerTextForSelectionScreen: 'ohos_demo',
  defaultBillingDetails: undefined as never,
  billingDetailsCollectionConfiguration: undefined as never,
  returnURL: 'ohos_demo',
  removeSavedPaymentMethodMessage: 'ohos_demo',
  applePayEnabled: true,
  googlePayEnabled: true,
  preferredNetworks: undefined as never,
  allowsRemovalOfLastSavedPaymentMethod: true,
  cardBrandAcceptance: undefined as never,
  opensCardScannerAutomatically: true,
} as unknown as CustomerSheetInitParams;

const g2_4: CustomerSheetProps = {
  visible: true,
  onResult: () => undefined,
  customerId: 'ohos_demo',
  setupIntentClientSecret: 'ohos_demo',
  customerEphemeralKeySecret: 'ohos_demo',
  customerAdapter: undefined as never,
  intentConfiguration: undefined as never,
  clientSecretProvider: undefined as never,
  style: "alwaysLight",
  appearance: undefined as never,
  merchantDisplayName: 'ohos_demo',
  headerTextForSelectionScreen: 'ohos_demo',
  defaultBillingDetails: undefined as never,
  billingDetailsCollectionConfiguration: undefined as never,
  returnURL: 'ohos_demo',
  removeSavedPaymentMethodMessage: 'ohos_demo',
  applePayEnabled: true,
  googlePayEnabled: true,
  preferredNetworks: undefined as never,
  allowsRemovalOfLastSavedPaymentMethod: true,
  cardBrandAcceptance: undefined as never,
  opensCardScannerAutomatically: true,
  presentationStyle: "popover",
  animationStyle: "slide",
  timeout: 1,
} as unknown as CustomerSheetProps;

const g2_5: StripeProviderProps = {
  publishableKey: 'ohos_demo',
  stripeAccountId: 'ohos_demo',
  threeDSecureParams: undefined as never,
  merchantIdentifier: 'ohos_demo',
  urlScheme: 'ohos_demo',
  setReturnUrlSchemeOnAndroid: true,
  children: undefined as never,
};

const g2_6: AppearanceParams = {
  font: undefined as never,
  colors: undefined as never,
  shapes: undefined as never,
  primaryButton: undefined as never,
  embeddedPaymentElement: undefined as never,
  formInsetValues: undefined as never,
  applyLiquidGlass: true,
  navigationBarStyle: undefined as never,
};

const g2_7: UseEmbeddedPaymentElementResult = {
  embeddedPaymentElementView: undefined as never,
  paymentOption: undefined as never,
  confirm: async () => undefined,
  update: () => undefined,
  clearPaymentOption: () => undefined,
  loadingError: undefined as never,
  isLoaded: true,
};

const g2_8: Checkout.CreateOptions = {
  clientSecret: 'ohos_demo',
  returnURL: 'ohos_demo',
  defaults: undefined as never,
  merchantDisplayName: 'ohos_demo',
  style: "alwaysLight",
  paymentElement: undefined as never,
};

const g2_9: Checkout.UseOptions = {
  enabled: true,
  getConfiguration: async () => undefined,
};

const g2_10: Checkout.UseResult = {
  status: "error",
  session: undefined as never,
  paymentElement: undefined as never,
  error: undefined as never,
  reload: async () => undefined,
  updateEmail: async () => undefined,
  updateShippingAddress: async () => undefined,
  applyPromotionCode: async () => undefined,
  removePromotionCode: async () => undefined,
  runServerUpdate: async () => undefined,
  clearPaymentOption: async () => undefined,
  confirm: async () => undefined,
};

const g2_11: Checkout.UpdateShippingAddressParams = {
  name: 'ohos_demo',
  address: undefined as never,
};

const g2_12: Checkout.Result = {
  status: "completed",
  paymentStatus: "paid",
  error: undefined as never,
} as unknown as Checkout.Result;

const g2_13: Checkout.Defaults = {
  billingDetails: undefined as never,
  shippingDetails: undefined as never,
  phone: 'ohos_demo',
  email: 'ohos_demo',
};

const g2_14: Checkout.ContactDetails = {
  name: 'ohos_demo',
  address: undefined as never,
};

const g2_15: Checkout.ApplePayConfiguration = {
  merchantCountryCode: 'ohos_demo',
  buttonType: "plain",
};

const g2_16: Checkout.GooglePayConfiguration = {
  testEnv: true,
  label: 'ohos_demo',
  buttonType: "plain",
  additionalEnabledNetworks: undefined as never,
};

const g2_17: Checkout.LinkConfiguration = {
  display: "automatic",
};

const g2_18: Checkout.PaymentElementAppearance = {
  font: undefined as never,
  colors: undefined as never,
  shapes: undefined as never,
  primaryButton: undefined as never,
  embeddedPaymentElement: undefined as never,
  formInsetValues: undefined as never,
  applyLiquidGlass: true,
  navigationBarStyle: undefined as never,
};

const g2_19: Checkout.RowSelectionBehavior = {
  type: "default",
  onSelectPaymentOption: () => undefined,
} as unknown as Checkout.RowSelectionBehavior;

const g2_20: Checkout.BillingDetailsCollectionConfiguration = {
  name: "automatic",
  phone: "automatic",
  address: "automatic",
  attachDefaultsToPaymentMethod: true,
};

const g2_21: Checkout.PaymentElementConfiguration = {
  savePaymentMethodOptInBehavior: "automatic",
  appearance: undefined as never,
  preferredNetworks: undefined as never,
  billingDetailsCollectionConfiguration: undefined as never,
  removeSavedPaymentMethodMessage: 'ohos_demo',
  paymentMethodOrder: undefined as never,
  opensCardScannerAutomatically: true,
  useAutocompleteEndpoints: true,
  termsDisplay: undefined as never,
  paymentMethodLayout: undefined as never,
  displaysMandateText: true,
  rowSelectionBehavior: undefined as never,
  applePay: undefined as never,
  googlePay: undefined as never,
  link: undefined as never,
};

const g2_22: Checkout.Session = {
  id: 'ohos_demo',
  businessName: 'ohos_demo',
  livemode: true,
  currency: 'ohos_demo',
  minorUnitsAmountDivisor: 1,
  presentmentDetails: undefined as never,
  email: 'ohos_demo',
  paymentOption: undefined as never,
  shippingAddress: undefined as never,
  orderSummaryItems: undefined as never,
  discountAmounts: undefined as never,
  tax: undefined as never,
  taxAmounts: undefined as never,
  totals: undefined as never,
  status: undefined as never,
  lastPaymentError: undefined as never,
};

const g2_23: Checkout.PresentmentDetails = {
  presentmentCurrency: 'ohos_demo',
};

const g2_24: Checkout.PaymentOptionDisplayData = {
  image: 'ohos_demo',
  label: 'ohos_demo',
  billingDetails: undefined as never,
  paymentMethodType: 'ohos_demo',
  mandateHTML: 'ohos_demo',
};

const g2_25: Checkout.BillingDetails = {
  name: 'ohos_demo',
  email: 'ohos_demo',
  phone: 'ohos_demo',
  address: undefined as never,
};

const g2_26: Checkout.ShippingAddress = {
  name: 'ohos_demo',
  address: undefined as never,
};

const g2_27: Checkout.Address = {
  country: 'ohos_demo',
  line1: 'ohos_demo',
  line2: 'ohos_demo',
  city: 'ohos_demo',
  state: 'ohos_demo',
  postalCode: 'ohos_demo',
};

const g2_28: Checkout.OrderSummaryItem = {
  type: "one_time_price",
  key: 'ohos_demo',
  description: 'ohos_demo',
  items: undefined as never,
  amountDetails: undefined as never,
};

const g2_29: Checkout.OneTimePriceOrderSummaryItem = {
  type: "one_time_price",
  key: 'ohos_demo',
  description: 'ohos_demo',
  items: undefined as never,
  amountDetails: undefined as never,
};

const g2_30: Checkout.OneTimePriceItem = {
  key: 'ohos_demo',
  displayName: 'ohos_demo',
  images: undefined as never,
  unitAmount: undefined as never,
  unitAmountDecimal: undefined as never,
  unitLabel: 'ohos_demo',
  quantity: 1,
  adjustableQuantity: undefined as never,
};

const g2_31: Checkout.AmountDetails = {
  total: undefined as never,
  subtotal: undefined as never,
  taxAmounts: undefined as never,
  discount: undefined as never,
  taxInclusive: undefined as never,
  taxExclusive: undefined as never,
};

const g2_32: Checkout.Amount = {
  amount: 'ohos_demo',
  minorUnitsAmount: 1,
};

const g2_33: Checkout.TaxAmount = {
  inclusive: true,
  displayName: 'ohos_demo',
  percentage: 1,
  amount: 'ohos_demo',
  minorUnitsAmount: 1,
};

const g2_34: Checkout.AdjustableQuantity = {
  minimum: 1,
  maximum: 1,
};

const g2_35: Checkout.DiscountAmount = {
  displayName: 'ohos_demo',
  promotionCode: 'ohos_demo',
  percentOff: 1,
  amount: 'ohos_demo',
  minorUnitsAmount: 1,
};

const g2_36: Checkout.Tax = {
  status: "ready",
};

const g2_37: Checkout.Totals = {
  subtotal: undefined as never,
  taxExclusive: undefined as never,
  taxInclusive: undefined as never,
  discount: undefined as never,
  total: undefined as never,
};

const g2_38: Checkout.SessionStatus = {
  type: "open",
  paymentStatus: "paid",
} as unknown as Checkout.SessionStatus;

const g2_39: AppearanceVariables = {
  fontFamily: 'ohos_demo',
  fontSizeBase: 'ohos_demo',
  spacingUnit: 'ohos_demo',
  borderRadius: 'ohos_demo',
  colorPrimary: 'ohos_demo',
  colorBackground: 'ohos_demo',
  colorText: 'ohos_demo',
  colorDanger: 'ohos_demo',
  buttonPrimaryColorBackground: 'ohos_demo',
  buttonPrimaryColorBorder: 'ohos_demo',
  buttonPrimaryColorText: 'ohos_demo',
  buttonSecondaryColorBackground: 'ohos_demo',
  buttonSecondaryColorBorder: 'ohos_demo',
  buttonSecondaryColorText: 'ohos_demo',
  buttonDangerColorBackground: 'ohos_demo',
  buttonDangerColorBorder: 'ohos_demo',
  buttonDangerColorText: 'ohos_demo',
  buttonPaddingX: 'ohos_demo',
  buttonPaddingY: 'ohos_demo',
  buttonLabelFontSize: 'ohos_demo',
  buttonLabelFontWeight: 'ohos_demo',
  buttonLabelTextTransform: 'ohos_demo',
  colorSecondaryText: 'ohos_demo',
  actionPrimaryColorText: 'ohos_demo',
  actionPrimaryTextDecorationLine: 'ohos_demo',
  actionPrimaryTextDecorationColor: 'ohos_demo',
  actionPrimaryTextDecorationStyle: 'ohos_demo',
  actionPrimaryTextDecorationThickness: 'ohos_demo',
  actionPrimaryTextTransform: 'ohos_demo',
  actionSecondaryColorText: 'ohos_demo',
  actionSecondaryTextDecorationLine: 'ohos_demo',
  actionSecondaryTextDecorationColor: 'ohos_demo',
  actionSecondaryTextDecorationStyle: 'ohos_demo',
  actionSecondaryTextDecorationThickness: 'ohos_demo',
  actionSecondaryTextTransform: 'ohos_demo',
  badgeNeutralColorBackground: 'ohos_demo',
  badgeNeutralColorText: 'ohos_demo',
  badgeNeutralColorBorder: 'ohos_demo',
  badgeSuccessColorBackground: 'ohos_demo',
  badgeSuccessColorText: 'ohos_demo',
  badgeSuccessColorBorder: 'ohos_demo',
  badgeWarningColorBackground: 'ohos_demo',
  badgeWarningColorText: 'ohos_demo',
  badgeWarningColorBorder: 'ohos_demo',
  badgeDangerColorBackground: 'ohos_demo',
  badgeDangerColorText: 'ohos_demo',
  badgeDangerColorBorder: 'ohos_demo',
  badgePaddingX: 'ohos_demo',
  badgePaddingY: 'ohos_demo',
  badgeLabelFontSize: 'ohos_demo',
  badgeLabelFontWeight: 'ohos_demo',
  badgeLabelTextTransform: 'ohos_demo',
  offsetBackgroundColor: 'ohos_demo',
  formBackgroundColor: 'ohos_demo',
  colorBorder: 'ohos_demo',
  formHighlightColorBorder: 'ohos_demo',
  formAccentColor: 'ohos_demo',
  formPlaceholderTextColor: 'ohos_demo',
  inputFieldPaddingX: 'ohos_demo',
  inputFieldPaddingY: 'ohos_demo',
  tableRowPaddingY: 'ohos_demo',
  buttonBorderRadius: 'ohos_demo',
  formBorderRadius: 'ohos_demo',
  badgeBorderRadius: 'ohos_demo',
  overlayBorderRadius: 'ohos_demo',
  overlayZIndex: 1,
  overlayBackdropColor: 'ohos_demo',
  bodyMdFontSize: 'ohos_demo',
  bodyMdFontWeight: 'ohos_demo',
  bodySmFontSize: 'ohos_demo',
  bodySmFontWeight: 'ohos_demo',
  headingXlFontSize: 'ohos_demo',
  headingXlFontWeight: 'ohos_demo',
  headingXlTextTransform: 'ohos_demo',
  headingLgFontSize: 'ohos_demo',
  headingLgFontWeight: 'ohos_demo',
  headingLgTextTransform: 'ohos_demo',
  headingMdFontSize: 'ohos_demo',
  headingMdFontWeight: 'ohos_demo',
  headingMdTextTransform: 'ohos_demo',
  headingSmFontSize: 'ohos_demo',
  headingSmFontWeight: 'ohos_demo',
  headingSmTextTransform: 'ohos_demo',
  headingXsFontSize: 'ohos_demo',
  headingXsFontWeight: 'ohos_demo',
  headingXsTextTransform: 'ohos_demo',
  labelMdFontSize: 'ohos_demo',
  labelMdFontWeight: 'ohos_demo',
  labelMdTextTransform: 'ohos_demo',
  labelSmFontSize: 'ohos_demo',
  labelSmFontWeight: 'ohos_demo',
  labelSmTextTransform: 'ohos_demo',
};

const g2_40: AppearanceOptions = {
  overlays: "dialog",
  variables: undefined as never,
};

/** ConnectInstance 类字段名引用（类未导出，以键名兜底） */
const g2_connectInstanceLike = {
  initParams: {publishableKey: 'ohos_demo'},
  onUpdate: () => undefined,
  update: () => undefined,
  constructor: undefined,
};

export function TypesGap2Demo() {
  return (
    <DemoScreen title="覆盖度缺口补样 2（精确注解全字段）" description="">
      <Section title={"缺口补样 1"} description="">
        <JsonCard label="SetupParamsBase（全字段）" value={g2_1} />
        <JsonCard label="SetupParams（全字段）" value={g2_2} />
        <JsonCard label="CustomerSheetInitParams（全字段）" value={g2_3} />
        <JsonCard label="CustomerSheetProps（全字段）" value={g2_4} />
        <JsonCard label="StripeProviderProps（全字段）" value={g2_5} />
        <JsonCard label="AppearanceParams（全字段）" value={g2_6} />
        <JsonCard label="UseEmbeddedPaymentElementResult（全字段）" value={g2_7} />
        <JsonCard label="Checkout.CreateOptions（全字段）" value={g2_8} />
        <JsonCard label="Checkout.UseOptions（全字段）" value={g2_9} />
        <JsonCard label="Checkout.UseResult（全字段）" value={g2_10} />
        <JsonCard label="Checkout.UpdateShippingAddressParams（全字段）" value={g2_11} />
        <JsonCard label="Checkout.Result（全字段）" value={g2_12} />
      </Section>
      <Section title={"缺口补样 2"} description="">
        <JsonCard label="Checkout.Defaults（全字段）" value={g2_13} />
        <JsonCard label="Checkout.ContactDetails（全字段）" value={g2_14} />
        <JsonCard label="Checkout.ApplePayConfiguration（全字段）" value={g2_15} />
        <JsonCard label="Checkout.GooglePayConfiguration（全字段）" value={g2_16} />
        <JsonCard label="Checkout.LinkConfiguration（全字段）" value={g2_17} />
        <JsonCard label="Checkout.PaymentElementAppearance（全字段）" value={g2_18} />
        <JsonCard label="Checkout.RowSelectionBehavior（全字段）" value={g2_19} />
        <JsonCard label="Checkout.BillingDetailsCollectionConfiguration（全字段）" value={g2_20} />
        <JsonCard label="Checkout.PaymentElementConfiguration（全字段）" value={g2_21} />
        <JsonCard label="Checkout.Session（全字段）" value={g2_22} />
        <JsonCard label="Checkout.PresentmentDetails（全字段）" value={g2_23} />
        <JsonCard label="Checkout.PaymentOptionDisplayData（全字段）" value={g2_24} />
      </Section>
      <Section title={"缺口补样 3"} description="">
        <JsonCard label="Checkout.BillingDetails（全字段）" value={g2_25} />
        <JsonCard label="Checkout.ShippingAddress（全字段）" value={g2_26} />
        <JsonCard label="Checkout.Address（全字段）" value={g2_27} />
        <JsonCard label="Checkout.OrderSummaryItem（全字段）" value={g2_28} />
        <JsonCard label="Checkout.OneTimePriceOrderSummaryItem（全字段）" value={g2_29} />
        <JsonCard label="Checkout.OneTimePriceItem（全字段）" value={g2_30} />
        <JsonCard label="Checkout.AmountDetails（全字段）" value={g2_31} />
        <JsonCard label="Checkout.Amount（全字段）" value={g2_32} />
        <JsonCard label="Checkout.TaxAmount（全字段）" value={g2_33} />
        <JsonCard label="Checkout.AdjustableQuantity（全字段）" value={g2_34} />
        <JsonCard label="Checkout.DiscountAmount（全字段）" value={g2_35} />
        <JsonCard label="Checkout.Tax（全字段）" value={g2_36} />
      </Section>
      <Section title={"缺口补样 4"} description="">
        <JsonCard label="Checkout.Totals（全字段）" value={g2_37} />
        <JsonCard label="Checkout.SessionStatus（全字段）" value={g2_38} />
        <JsonCard label="AppearanceVariables（全字段）" value={g2_39} />
        <JsonCard label="AppearanceOptions（全字段）" value={g2_40} />
        <JsonCard label="ConnectInstance 类字段（initParams/onUpdate/update）" value={g2_connectInstanceLike} />
      </Section>
      <Section title={"NativeProps / Props 同名分文件补样"} description="">
        <JsonCard label="NativeProps（NativeAddressSheet.ts）" value={addressSheetNativePropsSample} />
        <JsonCard label="NativeProps（ApplePayButtonComponent.ts）" value={applePayButtonNativePropsSample} />
        <JsonCard label="NativeProps（CardFieldInput.ts）" value={cardFieldNativePropsSample} />
        <JsonCard label="NativeProps（CardFormView.ts）" value={cardFormNativePropsSample} />
        <JsonCard label="NativeProps（AuBECSDebitFormComponent.ts）" value={auBECSNativePropsSample} />
        <JsonCard label="NativeProps（PaymentMethodMessagingElementComponent）" value={paymentMethodMessagingNativePropsSample} />
        <JsonCard label="Props（CustomerSheet）" value={customerSheetComponentPropsSample} />
      </Section>
    </DemoScreen>
  );
}
