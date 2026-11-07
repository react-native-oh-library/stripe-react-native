/**
 * 命名空间类型用例（P2 补充）
 *
 * 覆盖未引用的命名空间值导出与其中类型的字段（RTC-04）：
 * - PaymentIntent：Result（19 字段）/ Status / LastPaymentError / ShippingDetails / ConfirmParams
 * - SetupIntent：Result（12 字段）/ Status
 * - PaymentMethod：Result（13 字段）+ Card/AuBecsDebit/BacsDebit/Fpx/Ideal/SepaDebit/
 *   USBankAccount/ThreeDSecureUsage 子结果类型
 * - Token：Result / Card / BankAccount / CreateCardTokenParams / CreateBankAccountTokenParams /
 *   CreatePiiTokenParams
 * - ConfirmationToken：Result（12 字段）/ PaymentMethodPreview / ShippingDetails
 * - FinancialConnections：Session / Account / Balance / BalanceRefresh / SessionResult /
 *   TokenResult / BankAccountToken / FinancialConnectionsEvent
 * - PlatformPay / ApplePay：ApplePayBaseParams / RecurringPaymentRequest /
 *   AutomaticReloadPaymentRequest / MultiMerchantRequest / GooglePayBaseParams /
 *   ShippingMethod / ShippingContact / 结果类型 + 全部枚举
 * - LinkController：Configuration / PaymentMethodPreview / InitResult / PresentResult
 */

import React from 'react';

import {
  AddressCollectionMode,
  ApplePay,
  CollectionMode,
  ConfirmationToken,
  FinancialConnections,
  LinkController,
  PaymentIntent,
  PaymentMethod,
  PlatformPay,
  SetupIntent,
  Token,
} from '@stripe/stripe-react-native';

import {DemoScreen, JsonCard, Section} from './demoHelpers';

// ---------------------------------------------------------------------------
// PaymentMethod（先于 PaymentIntent 声明：lastPaymentError/paymentMethod 引用）
// ---------------------------------------------------------------------------

const paymentMethodThreeDSecureUsageSample: PaymentMethod.ThreeDSecureUsage = {
  isSupported: true,
};

const paymentMethodCardResultSample: PaymentMethod.CardResult = {
  brand: 'Visa',
  country: 'US',
  expYear: 2030,
  expMonth: 12,
  fingerprint: 'fp_ohos_demo',
  funding: 'Credit',
  last4: '4242',
  preferredNetwork: 'visa',
  availableNetworks: ['visa', 'mastercard'],
  threeDSecureUsage: paymentMethodThreeDSecureUsageSample,
};

const paymentMethodAuBecsDebitResultSample: PaymentMethod.AuBecsDebitResult = {
  fingerprint: 'fp_aubecs_demo',
  last4: '4242',
  bsbNumber: '000000',
};

const paymentMethodBacsDebitResultSample: PaymentMethod.BacsDebitResult = {
  sortCode: '00-00-00',
  last4: '4242',
  fingerprint: 'fp_bacs_demo',
};

const paymentMethodFpxResultSample: PaymentMethod.FpxResult = {
  bank: 'maybank2u',
};

const paymentMethodIdealResultSample: PaymentMethod.IdealResult = {
  bankIdentifierCode: 'INGBNL2A',
  bank: 'ING',
};

const paymentMethodSepaDebitResultSample: PaymentMethod.SepaDebitResult = {
  bankCode: 'INGBNL2A',
  country: 'NL',
  fingerprint: 'fp_sepa_demo',
  last4: '4242',
};

const paymentMethodUSBankAccountResultSample: PaymentMethod.USBankAccountResult = {
  routingNumber: '110000000',
  accountHolderType: 'Individual',
  accountType: 'Checking',
  last4: '4242',
  bankName: 'Demo Bank',
  linkedAccount: 'la_ohos_demo',
  fingerprint: 'fp_usbank_demo',
  preferredNetwork: 'visa',
  supportedNetworks: ['visa'],
};

const paymentMethodResultSample: PaymentMethod.Result = {
  id: 'pm_ohos_demo',
  liveMode: false,
  customerId: 'cus_ohos_demo',
  billingDetails: {name: 'Demo User', email: 'demo@example.com'},
  paymentMethodType: 'Card',
  AuBecsDebit: paymentMethodAuBecsDebitResultSample,
  BacsDebit: paymentMethodBacsDebitResultSample,
  Card: paymentMethodCardResultSample,
  Fpx: paymentMethodFpxResultSample,
  Ideal: paymentMethodIdealResultSample,
  SepaDebit: paymentMethodSepaDebitResultSample,
  USBankAccount: paymentMethodUSBankAccountResultSample,
};

const paymentMethodShippingDetailsSample: PaymentMethod.ShippingDetails = {
  email: 'demo@example.com',
  phone: '+12125551234',
  name: 'Demo User',
  address: {country: 'US', line1: 'Market Street 1'},
};

// ---------------------------------------------------------------------------
// PaymentIntent / SetupIntent
// ---------------------------------------------------------------------------

const paymentIntentResultSample: PaymentIntent.Result = {
  id: 'pi_ohos_demo',
  amount: 1999,
  created: '2026-11-06T00:00:00Z',
  currency: 'usd',
  status: PaymentIntent.Status.Succeeded,
  description: 'OHOS demo payment intent',
  receiptEmail: 'demo@example.com',
  canceledAt: null,
  clientSecret: 'pi_test_ohos_demo_secret',
  livemode: false,
  paymentMethodId: 'pm_ohos_demo',
  paymentMethod: paymentMethodResultSample,
  captureMethod: 'Automatic',
  confirmationMethod: 'Automatic',
  lastPaymentError: {
    code: 'card_declined',
    message: 'Your card was declined.',
    localizedMessage: 'Your card was declined.',
    declineCode: 'generic_decline',
    stripeErrorCode: 'card_declined',
    type: 'card_error',
    paymentMethod: paymentMethodResultSample,
  },
  shipping: {
    address: {
      country: 'US',
      line1: 'Market Street 1',
      line2: '',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94103',
    },
    name: 'Demo User',
    carrier: 'USPS',
    phone: '+12125551234',
    trackingNumber: '1Z999AA10123456784',
  },
  nextAction: null,
};

const paymentIntentConfirmParamsSample: PaymentIntent.ConfirmParams = {
  paymentMethodType: 'Card',
  paymentMethodData: {billingDetails: {name: 'Demo User', email: 'demo@example.com'}},
};

const setupIntentResultSample: SetupIntent.Result = {
  id: 'seti_ohos_demo',
  clientSecret: 'seti_test_ohos_demo_secret',
  lastSetupError: null,
  created: '2026-11-06T00:00:00Z',
  livemode: false,
  paymentMethodId: 'pm_ohos_demo',
  paymentMethod: paymentMethodResultSample,
  status: SetupIntent.Status.Succeeded,
  paymentMethodTypes: ['Card'],
  usage: 'OffSession',
  description: 'OHOS demo setup intent',
  nextAction: null,
};

// ---------------------------------------------------------------------------
// Token
// ---------------------------------------------------------------------------

const tokenCardSample: Token.Card = {
  id: 'card_ohos_demo',
  country: 'US',
  brand: 'Visa',
  currency: 'usd',
  expMonth: 12,
  expYear: 2030,
  last4: '4242',
  funding: 'Credit',
  address: {country: 'US', line1: 'Market Street 1', city: 'San Francisco', state: 'CA', postalCode: '94103'},
  name: 'Demo User',
};

const tokenBankAccountSample: Token.BankAccount = {
  id: 'ba_ohos_demo',
  bankName: 'Demo Bank',
  accountHolderName: 'Demo User',
  accountHolderType: 'Individual',
  currency: 'usd',
  country: 'US',
  routingNumber: '110000000',
  status: 'New',
  fingerprint: 'fp_ba_demo',
  last4: '4242',
};

const tokenResultSample: Token.Result = {
  id: 'tok_ohos_demo',
  created: '2026-11-06T00:00:00Z',
  type: 'Card',
  used: false,
  livemode: false,
  card: tokenCardSample,
  bankAccount: tokenBankAccountSample,
};

const createCardTokenParamsSample: Token.CreateCardTokenParams = {
  type: 'Card',
  address: {country: 'US', line1: 'Market Street 1'},
  name: 'Demo User',
  currency: 'usd',
};

const createBankAccountTokenParamsSample: Token.CreateBankAccountTokenParams = {
  type: 'BankAccount',
  accountHolderName: 'Demo User',
  accountHolderType: 'Individual',
  accountNumber: '000123456789',
  country: 'US',
  currency: 'usd',
  routingNumber: '110000000',
};

const createPiiTokenParamsSample: Token.CreatePiiTokenParams = {
  type: 'Pii',
  personalId: '000-00-0000',
};

// ---------------------------------------------------------------------------
// ConfirmationToken
// ---------------------------------------------------------------------------

const confirmationTokenShippingDetailsSample: ConfirmationToken.ShippingDetails = {
  address: {country: 'US', line1: 'Market Street 1'},
  name: 'Demo User',
  phone: '+12125551234',
};

const confirmationTokenPaymentMethodPreviewSample: ConfirmationToken.PaymentMethodPreview =
  {
    type: 'Card',
    billingDetails: {name: 'Demo User', email: 'demo@example.com'},
    allowRedisplay: 'always',
    customerId: 'cus_ohos_demo',
    allResponseFields: {id: 'pm_ohos_demo'},
  };

const confirmationTokenResultSample: ConfirmationToken.Result = {
  id: 'ctoken_ohos_demo',
  created: 1762403200,
  expiresAt: 1762489600,
  liveMode: false,
  paymentIntentId: 'pi_ohos_demo',
  setupIntentId: null,
  returnURL: 'stripe://stripe-redirect',
  setupFutureUsage: 'OffSession',
  paymentMethodPreview: confirmationTokenPaymentMethodPreviewSample,
  shipping: confirmationTokenShippingDetailsSample,
  allResponseFields: {id: 'ctoken_ohos_demo'},
};

// ---------------------------------------------------------------------------
// FinancialConnections
// ---------------------------------------------------------------------------

const financialConnectionsBalanceSample: FinancialConnections.Balance = {
  asOf: 1762403200000,
  type: 'cash',
  cash: {available: new Map([['usd', 4200]])},
  credit: {used: new Map([['usd', 0]])},
  current: new Map([['usd', 4200]]),
};

const financialConnectionsBalanceRefreshSample: FinancialConnections.BalanceRefresh =
  {
    status: 'succeeded',
    lastAttemptedAt: 1762403200000,
  };

const financialConnectionsAccountSample: FinancialConnections.Account = {
  id: 'fca_ohos_demo',
  livemode: false,
  displayName: 'Demo Checking',
  status: 'active',
  institutionName: 'Demo Bank',
  last4: '4242',
  created: 1762403200,
  balance: financialConnectionsBalanceSample,
  balanceRefresh: financialConnectionsBalanceRefreshSample,
  category: 'cash',
  subcategory: 'checking',
  permissions: ['balances', 'ownership', 'paymentMethod'],
  supportedPaymentMethodTypes: ['us_bank_account'],
};

const financialConnectionsSessionSample: FinancialConnections.Session = {
  id: 'fcsess_ohos_demo',
  clientSecret: 'fcsess_test_ohos_demo_secret',
  livemode: false,
  accounts: [financialConnectionsAccountSample],
};

const financialConnectionsEventSample: FinancialConnections.FinancialConnectionsEvent =
  {
    name: FinancialConnections.FinancialConnectionsEventName.InstitutionSelected,
    metadata: {
      manualEntry: false,
      institutionName: 'Demo Bank',
      errorCode:
        FinancialConnections.FinancialConnectionsEventErrorCode.InstitutionUnavailablePlanned,
    },
  };

const financialConnectionsSessionResultSample: FinancialConnections.SessionResult =
  {
    session: financialConnectionsSessionSample,
  };

const financialConnectionsBankAccountTokenSample: FinancialConnections.BankAccountToken =
  {
    bankAccount: tokenBankAccountSample,
    livemode: false,
    id: 'tok_ba_ohos_demo',
    used: false,
    type: 'BankAccount',
    created: 1762403200,
  };

const financialConnectionsTokenResultSample: FinancialConnections.TokenResult = {
  session: financialConnectionsSessionSample,
  token: financialConnectionsBankAccountTokenSample,
};

// ---------------------------------------------------------------------------
// PlatformPay / ApplePay
// ---------------------------------------------------------------------------

// PlatformPay 命名空间的购物车项（时间戳为 unix 秒）
const platformPayImmediateCartItem: PlatformPay.ImmediateCartSummaryItem = {
  paymentType: PlatformPay.PaymentType.Immediate,
  label: 'Demo Widget',
  amount: '19.99',
};

const platformPayDeferredCartItem: PlatformPay.DeferredCartSummaryItem = {
  paymentType: PlatformPay.PaymentType.Deferred,
  deferredDate: 1851494400,
  label: 'Demo Widget',
  amount: '19.99',
};

const platformPayRecurringCartItem: PlatformPay.RecurringCartSummaryItem = {
  paymentType: PlatformPay.PaymentType.Recurring,
  intervalUnit: PlatformPay.IntervalUnit.Month,
  intervalCount: 1,
  startDate: 1851494400,
  endDate: 1883030400,
  label: 'Demo Subscription',
  amount: '9.99',
};

// ApplePay 命名空间的购物车项（paymentType 为字符串字面量）
const applePayCartSummaryItemSample: ApplePay.CartSummaryItem = {
  paymentType: 'Immediate',
  label: 'Demo Widget',
  amount: '19.99',
};

const platformPayRecurringPaymentRequestSample: PlatformPay.RecurringPaymentRequest =
  {
    type: PlatformPay.PaymentRequestType.Recurring,
    description: 'Monthly subscription',
    managementUrl: 'https://example.com/subscriptions',
    billing: platformPayRecurringCartItem,
    trialBilling: platformPayRecurringCartItem,
    billingAgreement: 'Demo billing agreement',
    tokenNotificationURL: 'https://example.com/webhooks',
  };

const platformPayAutomaticReloadPaymentRequestSample: PlatformPay.AutomaticReloadPaymentRequest =
  {
    type: PlatformPay.PaymentRequestType.AutomaticReload,
    description: 'Prepaid reload',
    managementUrl: 'https://example.com/reloads',
    label: 'Reload Amount',
    reloadAmount: '20.00',
    thresholdAmount: '5.00',
    billingAgreement: 'Demo reload agreement',
    tokenNotificationURL: 'https://example.com/webhooks',
  };

const platformPayMultiMerchantRequestSample: PlatformPay.MultiMerchantRequest = {
  type: PlatformPay.PaymentRequestType.MultiMerchant,
  merchants: [
    {
      merchantIdentifier: 'merchant.ohos.demo1',
      externalIdentifier: 'ext_demo_1',
      merchantName: 'Demo Merchant 1',
      amount: '10.00',
    },
    {
      merchantIdentifier: 'merchant.ohos.demo2',
      externalIdentifier: 'ext_demo_2',
      merchantName: 'Demo Merchant 2',
      merchantDomain: 'example.com',
      amount: '9.99',
    },
  ],
};

const platformPayShippingMethodSample: PlatformPay.ShippingMethod = {
  label: 'Standard Shipping',
  amount: '5.00',
  isPending: false,
  identifier: 'standard',
  detail: '3-5 business days',
  startDate: 1851494400,
  endDate: 1851926400,
};

const platformPayShippingContactSample: PlatformPay.ShippingContact = {
  emailAddress: 'demo@example.com',
  name: {givenName: 'Demo', familyName: 'User'},
  phoneNumber: '+12125551234',
  postalAddress: {
    country: 'US',
    street: 'Market Street 1',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94103',
    isoCountryCode: 'US',
  },
};

const platformPayApplePayBaseParamsSample: PlatformPay.ApplePayBaseParams = {
  merchantCountryCode: 'US',
  currencyCode: 'USD',
  additionalEnabledNetworks: ['visa'],
  supportedNetworks: ['visa', 'mastercard'],
  cartItems: [platformPayImmediateCartItem],
  requiredShippingAddressFields: [PlatformPay.ContactField.PostalAddress],
  requiredBillingContactFields: [PlatformPay.ContactField.Name],
  shippingMethods: [platformPayShippingMethodSample],
  merchantCapabilities: [PlatformPay.ApplePayMerchantCapability.Supports3DS],
  shippingType: PlatformPay.ApplePayShippingType.Shipping,
  supportedCountries: ['US'],
};

const platformPayGooglePayBaseParamsSample: PlatformPay.GooglePayBaseParams = {
  testEnv: true,
  merchantCountryCode: 'US',
  currencyCode: 'USD',
  merchantName: 'OHOS Demo Merchant',
  isEmailRequired: false,
  allowCreditCards: true,
  existingPaymentMethodRequired: false,
  billingAddressConfig: {
    isRequired: false,
    format: PlatformPay.BillingAddressFormat.Min,
    isPhoneNumberRequired: false,
  },
  label: 'Demo Widget',
  amount: 1999,
};

const platformPayPaymentMethodResultSample: PlatformPay.PaymentMethodResult = {
  paymentMethod: paymentMethodResultSample,
  shippingContact: platformPayShippingContactSample,
};

const platformPayTokenResultSample: PlatformPay.TokenResult = {
  token: tokenResultSample,
  shippingContact: platformPayShippingContactSample,
};

const platformPayConfirmPaymentResultSample: PlatformPay.ConfirmPaymentResult = {
  paymentIntent: paymentIntentResultSample,
};

const platformPayConfirmSetupIntentResultSample: PlatformPay.ConfirmSetupIntentResult =
  {
    setupIntent: setupIntentResultSample,
  };

const platformPayIsGooglePaySupportedParamsSample: PlatformPay.IsGooglePaySupportedParams =
  {
    testEnv: true,
    existingPaymentMethodRequired: false,
  };

// ---------------------------------------------------------------------------
// LinkController
// ---------------------------------------------------------------------------

const linkControllerConfigurationSample: LinkController.Configuration = {
  email: 'demo@example.com',
  merchantDisplayName: 'OHOS Link Demo Merchant',
  supportedPaymentMethodTypes: [
    LinkController.LinkPaymentMethodType.Card,
    LinkController.LinkPaymentMethodType.BankAccount,
  ],
  paymentMethodTypes: ['card', 'bank_account'],
  phoneNumber: '+12125551234',
  allowLogout: true,
  billingDetailsCollectionConfiguration: {
    name: CollectionMode.AUTOMATIC,
    phone: CollectionMode.ALWAYS,
    address: AddressCollectionMode.FULL,
    attachDefaultsToPaymentMethod: false,
  },
  appearance: {
    lightColors: {primary: '#635BFF', contentOnPrimary: '#FFFFFF', borderSelected: '#4F49D6'},
    darkColors: {primary: '#7A73FF', contentOnPrimary: '#1B1D30', borderSelected: '#4F49D6'},
    style: 'ALWAYS_LIGHT',
    primaryButton: {cornerRadius: 8, height: 44},
    reduceLinkBranding: false,
  },
};

const linkControllerPaymentMethodPreviewSample: LinkController.PaymentMethodPreview =
  {
    icon: 'iVBORw0KGgoAAAANSUhEUg==',
    label: 'Link',
    sublabel: 'demo@example.com',
  };

const linkControllerInitResultSample: LinkController.InitResult = {};

const linkControllerConfirmSetupIntentResultSample: LinkController.ConfirmSetupIntentResult =
  {};

const linkControllerPresentResultSample: LinkController.PresentResult = {
  paymentMethod: paymentMethodResultSample,
  paymentMethodPreview: linkControllerPaymentMethodPreviewSample,
};

// ---------------------------------------------------------------------------
// Demo 组件
// ---------------------------------------------------------------------------

export function NamespaceTypesDemo() {
  return (
    <DemoScreen
      title="命名空间类型样例（PaymentIntent / PaymentMethod / Token / PlatformPay / …）"
      description="">
      <Section
        title="PaymentIntent / SetupIntent"
        description="Result 19/12 字段全量 + Status 枚举 + LastPaymentError/ShippingDetails/ConfirmParams。">
        <JsonCard label="PaymentIntent.Result 样例" value={paymentIntentResultSample} />
        <JsonCard
          label="PaymentIntent.Status 枚举引用"
          value={{
            Succeeded: PaymentIntent.Status.Succeeded,
            RequiresAction: PaymentIntent.Status.RequiresAction,
            Canceled: PaymentIntent.Status.Canceled,
          }}
        />
        <JsonCard
          label="PaymentIntent.ConfirmParams 样例"
          value={paymentIntentConfirmParamsSample}
        />
        <JsonCard label="SetupIntent.Result 样例" value={setupIntentResultSample} />
        <JsonCard
          label="SetupIntent.Status 枚举引用"
          value={{
            Succeeded: SetupIntent.Status.Succeeded,
            RequiresConfirmation: SetupIntent.Status.RequiresConfirmation,
          }}
        />
      </Section>

      <Section
        title="PaymentMethod"
        description="Result 13 字段 + Card/AuBecsDebit/BacsDebit/Fpx/Ideal/SepaDebit/USBankAccount/ThreeDSecureUsage 子结果。">
        <JsonCard label="PaymentMethod.Result 样例" value={paymentMethodResultSample} />
        <JsonCard
          label="PaymentMethod.CardResult 样例"
          value={paymentMethodCardResultSample}
        />
        <JsonCard
          label="PaymentMethod.USBankAccountResult 样例"
          value={paymentMethodUSBankAccountResultSample}
        />
        <JsonCard
          label="PaymentMethod.ShippingDetails 样例"
          value={paymentMethodShippingDetailsSample}
        />
      </Section>

      <Section
        title="Token"
        description="Result / Card / BankAccount + CreateCardTokenParams / CreateBankAccountTokenParams / CreatePiiTokenParams。">
        <JsonCard label="Token.Result 样例" value={tokenResultSample} />
        <JsonCard label="Token.Card 样例" value={tokenCardSample} />
        <JsonCard label="Token.BankAccount 样例" value={tokenBankAccountSample} />
        <JsonCard
          label="Token.CreateCardTokenParams 样例"
          value={createCardTokenParamsSample}
        />
        <JsonCard
          label="Token.CreateBankAccountTokenParams 样例"
          value={createBankAccountTokenParamsSample}
        />
        <JsonCard
          label="Token.CreatePiiTokenParams 样例"
          value={createPiiTokenParamsSample}
        />
      </Section>

      <Section
        title="ConfirmationToken"
        description="Result 12 字段（created/expiresAt 为 unix 时间戳；含 liveMode/paymentIntentId/setupIntentId/returnURL/setupFutureUsage/paymentMethodPreview/shipping/allResponseFields）。">
        <JsonCard label="ConfirmationToken.Result 样例" value={confirmationTokenResultSample} />
        <JsonCard
          label="ConfirmationToken.PaymentMethodPreview 样例"
          value={confirmationTokenPaymentMethodPreviewSample}
        />
        <JsonCard
          label="ConfirmationToken.ShippingDetails 样例"
          value={confirmationTokenShippingDetailsSample}
        />
      </Section>

      <Section
        title="FinancialConnections"
        description="Session / Account（14 字段）/ Balance（Map<String,number>）/ BalanceRefresh / SessionResult / TokenResult / BankAccountToken / Event + 枚举。">
        <JsonCard
          label="FinancialConnections.Session 样例"
          value={financialConnectionsSessionSample}
        />
        <JsonCard
          label="FinancialConnections.Account 样例"
          value={financialConnectionsAccountSample}
        />
        <JsonCard
          label="FinancialConnections.Event 样例"
          value={financialConnectionsEventSample}
        />
        <JsonCard
          label="FinancialConnections.SessionResult / TokenResult 样例"
          value={[financialConnectionsSessionResultSample, financialConnectionsTokenResultSample]}
        />
      </Section>

      <Section
        title="PlatformPay / ApplePay"
        description="ApplePayBaseParams（11 字段）/ GooglePayBaseParams（11 字段）/ Recurring / AutomaticReload / MultiMerchant 请求 + ShippingMethod / ShippingContact + 结果类型 + 全部枚举。">
        <JsonCard
          label="PlatformPay.ApplePayBaseParams 样例"
          value={platformPayApplePayBaseParamsSample}
        />
        <JsonCard
          label="PlatformPay.GooglePayBaseParams 样例"
          value={platformPayGooglePayBaseParamsSample}
        />
        <JsonCard
          label="PlatformPay.RecurringPaymentRequest 样例"
          value={platformPayRecurringPaymentRequestSample}
        />
        <JsonCard
          label="PlatformPay.AutomaticReloadPaymentRequest 样例"
          value={platformPayAutomaticReloadPaymentRequestSample}
        />
        <JsonCard
          label="PlatformPay.MultiMerchantRequest 样例"
          value={platformPayMultiMerchantRequestSample}
        />
        <JsonCard
          label="PlatformPay.ShippingMethod / ShippingContact 样例"
          value={[platformPayShippingMethodSample, platformPayShippingContactSample]}
        />
        <JsonCard
          label="PlatformPay 结果类型样例"
          value={[
            platformPayPaymentMethodResultSample,
            platformPayTokenResultSample,
            platformPayConfirmPaymentResultSample,
            platformPayConfirmSetupIntentResultSample,
            platformPayIsGooglePaySupportedParamsSample,
          ]}
        />
        <JsonCard
          label="ApplePay / PlatformPay 购物车项（Immediate / Deferred / Recurring）"
          value={[
            applePayCartSummaryItemSample,
            platformPayImmediateCartItem,
            platformPayDeferredCartItem,
            platformPayRecurringCartItem,
          ]}
        />
        <JsonCard
          label="PlatformPay 枚举引用"
          value={{
            ButtonType: PlatformPay.ButtonType.Buy,
            ButtonStyle: PlatformPay.ButtonStyle.Automatic,
            PaymentType: PlatformPay.PaymentType.Immediate,
            IntervalUnit: PlatformPay.IntervalUnit.Month,
            ContactField: PlatformPay.ContactField.EmailAddress,
            MerchantCapability: PlatformPay.ApplePayMerchantCapability.Supports3DS,
            ShippingType: PlatformPay.ApplePayShippingType.Shipping,
            PaymentRequestType: PlatformPay.PaymentRequestType.Recurring,
            BillingAddressFormat: PlatformPay.BillingAddressFormat.Full,
            ApplePaySheetErrorType: PlatformPay.ApplePaySheetErrorType.InvalidCouponCode,
            InvalidShippingField: PlatformPay.InvalidShippingField.PostalCode,
          }}
        />
      </Section>

      <Section
        title="LinkController"
        description="Configuration（9 字段）/ PaymentMethodPreview / InitResult / ConfirmSetupIntentResult / PresentResult + LinkPaymentMethodType 枚举。">
        <JsonCard
          label="LinkController.Configuration 样例"
          value={linkControllerConfigurationSample}
        />
        <JsonCard
          label="LinkController.PaymentMethodPreview 样例"
          value={linkControllerPaymentMethodPreviewSample}
        />
        <JsonCard
          label="LinkController 结果类型样例"
          value={[
            linkControllerInitResultSample,
            linkControllerConfirmSetupIntentResultSample,
            linkControllerPresentResultSample,
          ]}
        />
      </Section>
    </DemoScreen>
  );
}
