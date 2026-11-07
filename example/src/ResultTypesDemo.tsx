/**
 * Result 联合类型 / Errors / InitStripe / PushProvisioning 类型用例（P2 补充）
 *
 * 覆盖未引用的类型名与未覆盖字段（RTC-04）：
 * - InitStripeParams / InitialiseParams / AppInfo / Address / BillingDetails / AddressDetails
 * - 全部 *Result 联合类型（两分支各一：成功字段 + error 字段）
 * - StripeError / IntentCreationError / ErrorType / 各错误枚举
 * - MissingRoutingNumber（值导出）
 * - PushProvisioning：GooglePayCardToken（8 字段）/ GooglePayCardTokenStatus /
 *   IsCardInWalletResult / CanAddCardToWalletParams / CanAddCardToWalletResult /
 *   CanAddCardToWalletStatus
 */

import React from 'react';

import {
  Address,
  AddressDetails,
  AppInfo,
  ApplePayResult,
  BillingDetails,
  CanAddCardToWalletParams,
  CanAddCardToWalletResult,
  CanAddCardToWalletStatus,
  GooglePayCardTokenStatus,
  CollectBankAccountForPaymentResult,
  CollectBankAccountForSetupResult,
  ConfirmPaymentResult,
  ConfirmSetupIntentResult,
  CreateGooglePayPaymentMethodResult,
  CreatePaymentMethodResult,
  CreateRadarSessionResult,
  CreateTokenForCVCUpdateResult,
  CreateTokenResult,
  GooglePayCardToken,
  GooglePayInitResult,
  HandleNextActionResult,
  HandleNextActionForSetupResult,
  InitPaymentSheetResult,
  InitialiseParams,
  InitStripeParams,
  IsCardInWalletResult,
  MissingRoutingNumber,
  OpenApplePaySetupResult,
  PayWithGooglePayResult,
  PaymentSheet,
  PresentPaymentSheetResult,
  RetrievePaymentIntentResult,
  RetrieveSetupIntentResult,
  VerifyMicrodepositsForPaymentResult,
  VerifyMicrodepositsForSetupResult,
  VerifyMicrodepositsParams,
  // 错误枚举为值导出（export enum），下方以 ApplePayError.Canceled 等方式成员引用
  ApplePayError,
  CardActionError,
  CollectBankAccountError,
  ConfirmPaymentError,
  ConfirmSetupIntentError,
  CreatePaymentMethodError,
  CreateTokenError,
  CustomerSheetError,
  GooglePayError,
  LinkControllerError,
  PaymentSheetError,
  RadarError,
  RetrievePaymentIntentError,
  RetrieveSetupIntentError,
  VerifyMicrodepositsError,
  type ErrorType,
  type StripeError,
} from '@stripe/stripe-react-native';

import {DemoScreen, JsonCard, Section} from './demoHelpers';

// ---------------------------------------------------------------------------
// 基础类型样例
// ---------------------------------------------------------------------------

const appInfoSample: AppInfo = {
  name: 'stripe-react-native-ohos-example',
  partnerId: 'pp_partner_demo_ohos',
  url: 'https://example.com',
  version: '0.76.1-beta.1',
};

const initStripeParamsSample: InitStripeParams = {
  publishableKey: 'pk_test_ohos_demo',
  stripeAccountId: 'acct_demo_ohos',
  threeDSecureParams: {timeout: 5},
  urlScheme: 'stripe-example',
};

const initialiseParamsSample: InitialiseParams = {
  publishableKey: 'pk_test_ohos_demo',
  stripeAccountId: 'acct_demo_ohos',
  threeDSecureParams: {timeout: 5},
  urlScheme: 'stripe-example',
  appInfo: appInfoSample,
};

const addressSample: Address = {
  city: 'Shenzhen',
  country: 'CN',
  line1: 'Keji Road 1',
  line2: 'Building A',
  postalCode: '518000',
  state: 'Guangdong',
};

const billingDetailsSample: BillingDetails = {
  address: addressSample,
  email: 'demo@example.com',
  name: 'Demo User',
  phone: '+8675512345678',
};

const addressDetailsSample: AddressDetails = {
  address: addressSample,
  isCheckboxSelected: true,
  name: 'Demo User',
  phone: '+8675512345678',
};

// ---------------------------------------------------------------------------
// StripeError 样例
// ---------------------------------------------------------------------------

const stripeErrorSample: StripeError<CreatePaymentMethodError> = {
  code: CreatePaymentMethodError.Failed,
  message: 'demo error message',
  localizedMessage: '演示错误信息',
  declineCode: 'insufficient_funds',
  stripeErrorCode: 'card_insufficient_funds',
  type: 'card_error' as ErrorType,
};

const intentCreationErrorSample: PaymentSheet.IntentCreationError = {
  code: 'Failed',
  message: 'intent creation failed (demo)',
  localizedMessage: 'intent creation failed (demo)',
  declineCode: 'card_declined',
  stripeErrorCode: 'card_declined',
};

// ---------------------------------------------------------------------------
// Result 联合类型样例（每型一个成功分支 + 一个 error 分支）
// ---------------------------------------------------------------------------

const resultSamples: Array<{label: string; value: unknown}> = [
  {
    label: 'CreatePaymentMethodResult（成功/error 分支）',
    value: [
      {paymentMethod: {id: 'pm_ohos_demo', paymentMethodType: 'Card'}} as CreatePaymentMethodResult,
      {error: stripeErrorSample} as CreatePaymentMethodResult,
    ],
  },
  {
    label: 'RetrievePaymentIntentResult（paymentIntent 字段）',
    value: {paymentIntent: {id: 'pi_ohos_demo', amount: 1999, status: 'Succeeded'}} as RetrievePaymentIntentResult,
  },
  {
    label: 'RetrieveSetupIntentResult（setupIntent 字段）',
    value: {setupIntent: {id: 'seti_ohos_demo', status: 'Succeeded'}} as RetrieveSetupIntentResult,
  },
  {
    label: 'ConfirmPaymentResult（paymentIntent 字段）',
    value: {paymentIntent: {id: 'pi_ohos_demo', status: 'Succeeded'}} as ConfirmPaymentResult,
  },
  {
    label: 'HandleNextActionResult（paymentIntent 字段）',
    value: {paymentIntent: {id: 'pi_ohos_demo', status: 'RequiresAction'}} as HandleNextActionResult,
  },
  {
    label: 'HandleNextActionForSetupResult（setupIntent 字段）',
    value: {setupIntent: {id: 'seti_ohos_demo', status: 'RequiresAction'}} as HandleNextActionForSetupResult,
  },
  {
    label: 'ConfirmSetupIntentResult（setupIntent 字段）',
    value: {setupIntent: {id: 'seti_ohos_demo', status: 'Succeeded'}} as ConfirmSetupIntentResult,
  },
  {
    label: 'CreateTokenForCVCUpdateResult（tokenId 字段）',
    value: {tokenId: 'tok_ohos_demo'} as CreateTokenForCVCUpdateResult,
  },
  {
    label: 'CreateTokenResult（token 字段）',
    value: {token: {id: 'tok_ohos_demo', type: 'Pii'}} as CreateTokenResult,
  },
  {
    label: 'InitPaymentSheetResult（paymentOption 字段）',
    value: {paymentOption: {label: 'Visa •••• 4242', image: 'iVBORw0KGgo=='}} as InitPaymentSheetResult,
  },
  {
    label: 'PresentPaymentSheetResult（paymentOption + didCancel 字段）',
    value: {paymentOption: {label: 'Visa •••• 4242'}, didCancel: true} as PresentPaymentSheetResult,
  },
  {
    label: 'CreateRadarSessionResult（id 字段）',
    value: {id: 'rsid_ohos_demo'} as CreateRadarSessionResult,
  },
  {
    label: 'ApplePayResult（paymentMethod 字段）',
    value: {paymentMethod: {id: 'pm_ohos_demo'}} as ApplePayResult,
  },
  {
    label: 'GooglePayInitResult / PayWithGooglePayResult（error 字段）',
    value: [{error: undefined} as GooglePayInitResult, {error: undefined} as PayWithGooglePayResult],
  },
  {
    label: 'CreateGooglePayPaymentMethodResult（paymentMethod 字段）',
    value: {paymentMethod: {id: 'pm_ohos_demo'}} as CreateGooglePayPaymentMethodResult,
  },
  {
    label: 'OpenApplePaySetupResult（error 字段）',
    value: {error: undefined} as OpenApplePaySetupResult,
  },
  {
    label: 'VerifyMicrodepositsParams（amounts / descriptorCode 双变体）',
    value: [
      {amounts: [32, 45]} as VerifyMicrodepositsParams,
      {descriptorCode: 'SMALLSTA'} as VerifyMicrodepositsParams,
    ],
  },
  {
    label: 'VerifyMicrodepositsForPaymentResult（paymentIntent 字段）',
    value: {paymentIntent: {id: 'pi_ohos_demo'}} as VerifyMicrodepositsForPaymentResult,
  },
  {
    label: 'VerifyMicrodepositsForSetupResult（setupIntent 字段）',
    value: {setupIntent: {id: 'seti_ohos_demo'}} as VerifyMicrodepositsForSetupResult,
  },
  {
    label: 'CollectBankAccountForPaymentResult（paymentIntent 字段）',
    value: {paymentIntent: {id: 'pi_ohos_demo'}} as CollectBankAccountForPaymentResult,
  },
  {
    label: 'CollectBankAccountForSetupResult（setupIntent 字段）',
    value: {setupIntent: {id: 'seti_ohos_demo'}} as CollectBankAccountForSetupResult,
  },
];

// ---------------------------------------------------------------------------
// PushProvisioning 类型样例
// ---------------------------------------------------------------------------

const googlePayCardTokenSample: GooglePayCardToken = {
  id: 'tok_gp_ohos_demo',
  cardLastFour: '4242',
  fpanLastFour: '4242',
  dpanLastFour: '0005',
  network: 3,
  serviceProvider: 1,
  issuer: 'Demo Issuer Bank',
  status: GooglePayCardTokenStatus.TOKEN_STATE_ACTIVE,
};

const isCardInWalletResultSample: IsCardInWalletResult = {
  isInWallet: true,
  token: googlePayCardTokenSample,
};

const canAddCardToWalletParamsSample: CanAddCardToWalletParams = {
  primaryAccountIdentifier: 'pai_ohos_demo',
  cardLastFour: '4242',
  cardBrand: 'visa',
  testEnv: true,
  hasPairedAppleWatch: false,
  supportsTapToPay: false,
};

const canAddCardToWalletResultSample: CanAddCardToWalletResult = {
  canAddCard: false,
  details: {
    token: googlePayCardTokenSample,
    status: CanAddCardToWalletStatus.CARD_ALREADY_EXISTS,
  },
};

// ---------------------------------------------------------------------------
// Demo 组件
// ---------------------------------------------------------------------------

export function ResultTypesDemo() {
  return (
    <DemoScreen
      title="Result / Errors / InitStripe / PushProvisioning 类型样例"
      description="">
      <Section
        title="初始化与基础类型"
        description="InitStripeParams / InitialiseParams（appInfo）/ AppInfo（partnerId/version）/ Address / BillingDetails / AddressDetails（isCheckboxSelected）。">
        <JsonCard label="InitStripeParams 样例" value={initStripeParamsSample} />
        <JsonCard label="InitialiseParams 样例" value={initialiseParamsSample} />
        <JsonCard label="AppInfo 样例" value={appInfoSample} />
        <JsonCard label="Address 样例" value={addressSample} />
        <JsonCard label="BillingDetails 样例" value={billingDetailsSample} />
        <JsonCard label="AddressDetails 样例" value={addressDetailsSample} />
      </Section>

      <Section
        title="StripeError / ErrorType / 错误枚举"
        description="StripeError 6 字段全量 + 各错误枚举成员引用（枚举名即类型名）。">
        <JsonCard label="StripeError 样例" value={stripeErrorSample} />
        <JsonCard label="IntentCreationError 样例" value={intentCreationErrorSample} />
        <JsonCard
          label="错误枚举成员引用（13 个）"
          value={{
            ConfirmPaymentError: ConfirmPaymentError.Failed,
            CardActionError: CardActionError.Failed,
            ConfirmSetupIntentError: ConfirmSetupIntentError.Failed,
            CreatePaymentMethodError: CreatePaymentMethodError.Failed,
            CreateTokenError: CreateTokenError.Failed,
            RetrievePaymentIntentError: RetrievePaymentIntentError.Unknown,
            RetrieveSetupIntentError: RetrieveSetupIntentError.Unknown,
            ApplePayError: ApplePayError.Canceled,
            PaymentSheetError: PaymentSheetError.Failed,
            GooglePayError: GooglePayError.Canceled,
            VerifyMicrodepositsError: VerifyMicrodepositsError.Failed,
            CollectBankAccountError: CollectBankAccountError.Canceled,
            CustomerSheetError: CustomerSheetError.Failed,
            RadarError: RadarError.Failed,
            LinkControllerError: LinkControllerError.Canceled,
            ErrorType: 'card_error',
          }}
        />
        <JsonCard
          label="MissingRoutingNumber（值导出）"
          value={MissingRoutingNumber}
        />
      </Section>

      <Section
        title="Result 联合类型样例（21 组）"
        description="每个 Result 类型的成功字段（paymentIntent/setupIntent/tokenId/paymentOption 等）与 error 字段。">
        {resultSamples.map(sample => (
          <JsonCard key={sample.label} label={sample.label} value={sample.value} />
        ))}
      </Section>

      <Section
        title="PushProvisioning 类型样例"
        description="GooglePayCardToken（8 字段）/ IsCardInWalletResult / CanAddCardToWalletParams / CanAddCardToWalletResult。">
        <JsonCard label="GooglePayCardToken 样例" value={googlePayCardTokenSample} />
        <JsonCard
          label="IsCardInWalletResult 样例"
          value={isCardInWalletResultSample}
        />
        <JsonCard
          label="CanAddCardToWalletParams 样例"
          value={canAddCardToWalletParamsSample}
        />
        <JsonCard
          label="CanAddCardToWalletResult 样例"
          value={canAddCardToWalletResultSample}
        />
      </Section>
    </DemoScreen>
  );
}
