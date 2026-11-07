/**
 * Onramp（Crypto Onramp）用例（P1 补充）
 *
 * 覆盖检视报告中未覆盖的 OnrampSdk 全部 26 个 TurboModule 方法（RTC-02）：
 * - useOnramp() 解构调用 19 个同名方法（configure/isSamsungPaySupported/
 *   hasLinkAccount/registerLinkUser/registerWalletAddress/deleteWalletAddress/
 *   getWalletOwnershipChallenge/submitWalletOwnershipSignature/attachKycInfo/
 *   retrieveMissingIdentifiers/submitIdentifiers/presentUserAttestation/
 *   presentKycInfoVerification/updatePhoneNumber/authenticateUserWithToken/
 *   verifyIdentity/collectPaymentMethod/createCryptoPaymentToken/
 *   performCheckout/getCryptoTokenDisplayData）
 * - TurboModule 直达调用 hook 未同名暴露的 7 个方法：
 *   initialise / configureOnramp / onrampAuthorize / logout /
 *   provideCheckoutClientSecret / addListener / removeListeners
 *
 * 鸿蒙侧为 ArkTS 降级实现（返回结构化 notSupported / false / resolve），
 * 本用例逐个调用并观察降级返回结构。
 *
 * 同时以类型化字面量覆盖 Onramp 命名空间类型：
 * Configuration/GooglePayConfig/SamsungPayConfig/LinkUserInfo/KycInfo/
 * CryptoNetwork/WalletOwnershipChallenge/CryptoConsumerWallet/ComplianceIdentifier 等
 */

import React from 'react';

import {
  useOnramp,
  Onramp,
  CardBrand,
  type Address,
} from '@stripe/stripe-react-native';
// TurboModule 直达：与库内 src/hooks/useOnramp.tsx 同一导入方式
import NativeOnrampSdk from '@stripe/stripe-react-native/src/specs/v1/NativeOnrampSdkModule';

import {
  ActionButton,
  DemoScreen,
  JsonCard,
  ResultBlock,
  Section,
  safeStringify,
  useDemoRunner,
} from './demoHelpers';

// ---------------------------------------------------------------------------
// Onramp 类型字面量样例（模块级常量）
// ---------------------------------------------------------------------------

const onrampGooglePayConfig: Onramp.GooglePayConfig = {
  testEnv: true,
  merchantCountryCode: 'US',
  merchantName: 'OHOS Onramp Demo',
  isEmailRequired: false,
  allowCreditCards: true,
  existingPaymentMethodRequired: false,
  billingAddressConfig: {
    isRequired: false,
    format: 'Min',
    isPhoneNumberRequired: false,
  },
};

const onrampSamsungPayConfig: Onramp.SamsungPayConfig = {
  serviceId: 'svc_ohos_demo',
  merchantId: 'merchant_ohos_demo',
  merchantName: 'OHOS Onramp Demo',
  allowedCardBrands: [CardBrand.Visa, CardBrand.Mastercard],
};

const onrampConfiguration: Onramp.Configuration = {
  merchantDisplayName: 'OHOS Onramp Demo Merchant',
  appearance: {
    lightColors: {primary: '#635BFF', contentOnPrimary: '#FFFFFF', borderSelected: '#4F49D6'},
    darkColors: {primary: '#7A73FF', contentOnPrimary: '#1B1D30', borderSelected: '#4F49D6'},
    style: 'ALWAYS_DARK',
    primaryButton: {cornerRadius: 8, height: 44},
    reduceLinkBranding: false,
  },
  cryptoCustomerId: 'crypto_cus_ohos_demo',
  googlePay: onrampGooglePayConfig,
  samsungPay: onrampSamsungPayConfig,
};

const onrampLinkUserInfo: Onramp.LinkUserInfo = {
  email: 'demo@example.com',
  phone: '+12125551234',
  country: 'US',
  fullName: 'Demo User',
};

const onrampKycInfo: Onramp.KycInfo = {
  firstName: 'Demo',
  lastName: 'User',
  idNumber: '000-00-0000',
  idType: 'social_security_number',
  dateOfBirth: {day: 1, month: 1, year: 1990},
  address: {
    city: 'San Francisco',
    country: 'US',
    line1: 'Market Street 1',
    postalCode: '94103',
    state: 'CA',
  },
  birthCountry: 'US',
  birthCity: 'New York',
  nationalities: ['US'],
};

const onrampComplianceIdentifiers: Array<Onramp.ComplianceIdentifier> = [
  {type: 'social_security_number', value: '000-00-0000'},
];

const onrampWalletAddress = '0x1234567890abcdef1234567890abcdef12345678';
const onrampNetwork = Onramp.CryptoNetwork.ethereum;

const onrampPlatformPayParams: Onramp.OnrampPlatformPayParams = {
  googlePay: {
    currencyCode: 'USD',
    amount: 1999,
    label: 'Crypto purchase',
    transactionId: 'txn_ohos_demo',
  },
  samsungPay: {
    currencyCode: 'USD',
    amount: 1999,
    orderNumber: 'order_ohos_demo',
  },
};

const onrampCryptoPaymentToken: Onramp.CryptoPaymentToken = {
  card: {brand: 'visa', funding: 'credit', last4: '4242'},
};

const onrampAddressSample: Address = {
  city: 'San Francisco',
  country: 'US',
  line1: 'Market Street 1',
  postalCode: '94103',
  state: 'CA',
};

const ONRAMP_SESSION_ID = 'cos_ohos_demo_session';
const LINK_AUTH_INTENT_ID = 'lai_ohos_demo';

// ---------------------------------------------------------------------------
// Demo 组件
// ---------------------------------------------------------------------------

export function OnrampDemo() {
  const {results, run} = useDemoRunner();

  // useOnramp() 解构：19 个与 TurboModule 同名的方法（标识符即覆盖）
  const {
    configure,
    isSamsungPaySupported,
    hasLinkAccount,
    registerLinkUser,
    registerWalletAddress,
    deleteWalletAddress,
    getWalletOwnershipChallenge,
    submitWalletOwnershipSignature,
    attachKycInfo,
    retrieveMissingIdentifiers,
    submitIdentifiers,
    presentUserAttestation,
    presentKycInfoVerification,
    updatePhoneNumber,
    authenticateUserWithToken,
    verifyIdentity,
    collectPaymentMethod,
    createCryptoPaymentToken,
    performCheckout,
    authorize,
    getCryptoTokenDisplayData,
    logOut,
    isAuthError,
  } = useOnramp();

  return (
    <DemoScreen
      title="Onramp（Crypto Onramp，降级观察）"
      description="">
      {/* ============ 配置与会话 ============ */}
      <Section
        title="配置与会话（configure / link 账户）"
        description="configureOnramp 在 hook 中暴露为 configure；isSamsungPaySupported 降级返回 false。">
        <ActionButton
          method="configureOnramp(via configure)"
          onPress={() =>
            run('configureOnramp(via configure)', () =>
              configure(onrampConfiguration),
            )
          }
        />
        <ResultBlock method="configureOnramp(via configure)" results={results} />
        <ActionButton
          method="isSamsungPaySupported"
          onPress={() =>
            run('isSamsungPaySupported', () => isSamsungPaySupported())
          }
        />
        <ResultBlock method="isSamsungPaySupported" results={results} />
        <ActionButton
          method="hasLinkAccount"
          onPress={() =>
            run('hasLinkAccount', () =>
              hasLinkAccount('demo@example.com'),
            )
          }
        />
        <ResultBlock method="hasLinkAccount" results={results} />
        <ActionButton
          method="registerLinkUser"
          onPress={() =>
            run('registerLinkUser', () => registerLinkUser(onrampLinkUserInfo))
          }
        />
        <ResultBlock method="registerLinkUser" results={results} />
      </Section>

      {/* ============ 钱包 ============ */}
      <Section
        title="钱包地址（register / delete / ownership）"
        description="钱包所有权挑战-签名闭环；鸿蒙降级返回 notSupported。">
        <ActionButton
          method="registerWalletAddress"
          onPress={() =>
            run('registerWalletAddress', () =>
              registerWalletAddress(onrampWalletAddress, onrampNetwork),
            )
          }
        />
        <ResultBlock method="registerWalletAddress" results={results} />
        <ActionButton
          method="deleteWalletAddress"
          onPress={() =>
            run('deleteWalletAddress', () =>
              deleteWalletAddress('wallet_ohos_demo'),
            )
          }
        />
        <ResultBlock method="deleteWalletAddress" results={results} />
        <ActionButton
          method="getWalletOwnershipChallenge"
          onPress={() =>
            run('getWalletOwnershipChallenge', () =>
              getWalletOwnershipChallenge(onrampWalletAddress, onrampNetwork),
            )
          }
        />
        <ResultBlock method="getWalletOwnershipChallenge" results={results} />
        <ActionButton
          method="submitWalletOwnershipSignature"
          onPress={() =>
            run('submitWalletOwnershipSignature', () =>
              submitWalletOwnershipSignature(
                'challenge_ohos_demo',
                '0xsignature_demo',
              ),
            )
          }
        />
        <ResultBlock
          method="submitWalletOwnershipSignature"
          results={results}
        />
      </Section>

      {/* ============ KYC / 合规 ============ */}
      <Section
        title="KYC 与合规标识（MiCA / CARF）"
        description="attachKycInfo / retrieveMissingIdentifiers / submitIdentifiers / presentUserAttestation / presentKycInfoVerification。">
        <ActionButton
          method="attachKycInfo"
          onPress={() =>
            run('attachKycInfo', () => attachKycInfo(onrampKycInfo))
          }
        />
        <ResultBlock method="attachKycInfo" results={results} />
        <ActionButton
          method="retrieveMissingIdentifiers"
          onPress={() =>
            run('retrieveMissingIdentifiers', () =>
              retrieveMissingIdentifiers(),
            )
          }
        />
        <ResultBlock method="retrieveMissingIdentifiers" results={results} />
        <ActionButton
          method="submitIdentifiers"
          onPress={() =>
            run('submitIdentifiers', () =>
              submitIdentifiers(onrampComplianceIdentifiers),
            )
          }
        />
        <ResultBlock method="submitIdentifiers" results={results} />
        <ActionButton
          method="presentUserAttestation"
          onPress={() =>
            run('presentUserAttestation', () => presentUserAttestation())
          }
        />
        <ResultBlock method="presentUserAttestation" results={results} />
        <ActionButton
          method="presentKycInfoVerification"
          onPress={() =>
            run('presentKycInfoVerification', () =>
              presentKycInfoVerification(null),
            )
          }
        />
        <ResultBlock method="presentKycInfoVerification" results={results} />
        <ActionButton
          method="presentKycInfoVerification-updateAddress"
          onPress={() =>
            run('presentKycInfoVerification-updateAddress', () =>
              presentKycInfoVerification(onrampAddressSample),
            )
          }
        />
        <ResultBlock
          method="presentKycInfoVerification-updateAddress"
          results={results}
        />
      </Section>

      {/* ============ 认证与身份 ============ */}
      <Section
        title="认证与身份验证"
        description="updatePhoneNumber / authenticateUserWithToken / verifyIdentity / authorize / logOut / isAuthError。">
        <ActionButton
          method="updatePhoneNumber"
          onPress={() =>
            run('updatePhoneNumber', () => updatePhoneNumber('+12125551234'))
          }
        />
        <ResultBlock method="updatePhoneNumber" results={results} />
        <ActionButton
          method="authenticateUserWithToken"
          onPress={() =>
            run('authenticateUserWithToken', () =>
              authenticateUserWithToken('link_auth_token_secret_demo'),
            )
          }
        />
        <ResultBlock method="authenticateUserWithToken" results={results} />
        <ActionButton
          method="verifyIdentity"
          onPress={() => run('verifyIdentity', () => verifyIdentity())}
        />
        <ResultBlock method="verifyIdentity" results={results} />
        <ActionButton
          method="authorize(onrampAuthorize via hook)"
          onPress={() =>
            run('authorize(onrampAuthorize via hook)', () =>
              authorize(LINK_AUTH_INTENT_ID),
            )
          }
        />
        <ResultBlock
          method="authorize(onrampAuthorize via hook)"
          results={results}
        />
        <ActionButton
          method="logOut(logout via hook)"
          onPress={() => run('logOut(logout via hook)', () => logOut())}
        />
        <ResultBlock method="logOut(logout via hook)" results={results} />
        <ActionButton
          method="isAuthError"
          onPress={() =>
            run('isAuthError', async () => {
              const result = await hasLinkAccount('demo@example.com');
              // isAuthError 判定错误对象是否 Link 认证错误（消费 result.error 字段）
              return safeStringify({
                isAuthError: isAuthError(result.error),
                error: result.error,
              });
            })
          }
        />
        <ResultBlock method="isAuthError" results={results} />
      </Section>

      {/* ============ 支付方式收集与结账 ============ */}
      <Section
        title="支付方式收集与结账"
        description="collectPaymentMethod（Card/BankAccount/PlatformPay 变体）/ createCryptoPaymentToken / performCheckout / getCryptoTokenDisplayData。">
        <ActionButton
          method="collectPaymentMethod-Card"
          onPress={() =>
            run('collectPaymentMethod-Card', () =>
              collectPaymentMethod('Card'),
            )
          }
        />
        <ResultBlock method="collectPaymentMethod-Card" results={results} />
        <ActionButton
          method="collectPaymentMethod-BankAccount"
          onPress={() =>
            run('collectPaymentMethod-BankAccount', () =>
              collectPaymentMethod('BankAccount'),
            )
          }
        />
        <ResultBlock
          method="collectPaymentMethod-BankAccount"
          results={results}
        />
        <ActionButton
          method="collectPaymentMethod-PlatformPay"
          onPress={() =>
            run('collectPaymentMethod-PlatformPay', () =>
              collectPaymentMethod('PlatformPay', onrampPlatformPayParams),
            )
          }
        />
        <ResultBlock
          method="collectPaymentMethod-PlatformPay"
          results={results}
        />
        <ActionButton
          method="createCryptoPaymentToken"
          onPress={() =>
            run('createCryptoPaymentToken', () => createCryptoPaymentToken())
          }
        />
        <ResultBlock method="createCryptoPaymentToken" results={results} />
        <ActionButton
          method="performCheckout"
          onPress={() =>
            run('performCheckout', () =>
              performCheckout(ONRAMP_SESSION_ID, async () => 'cos_demo_secret'),
            )
          }
        />
        <ResultBlock method="performCheckout" results={results} />
        <ActionButton
          method="getCryptoTokenDisplayData"
          onPress={() =>
            run('getCryptoTokenDisplayData', () =>
              getCryptoTokenDisplayData(onrampCryptoPaymentToken),
            )
          }
        />
        <ResultBlock method="getCryptoTokenDisplayData" results={results} />
      </Section>

      {/* ============ TurboModule 直达（hook 未同名暴露的方法） ============ */}
      <Section
        title="TurboModule 直达（OnrampSdk spec 同名方法）"
        description="initialise / configureOnramp / onrampAuthorize / logout / provideCheckoutClientSecret / addListener / removeListeners —— hook 暴露名与 TurboModule 名不一致的 7 个方法，直达调用观察降级。">
        <ActionButton
          method="initialise"
          onPress={() =>
            run('initialise', () =>
              NativeOnrampSdk?.initialise({
                publishableKey:
                  'pk_test_51UXLDKDV8zdV6PUc8vJLRtsZtQ9RkTqAT7eQZrXTWl527wg4DVPM8zAp2eeXSagUHPTS5vaUQztEvO0r0KEgVeIe00EDyRaMaR',
                appInfo: {
                  name: 'stripe-react-native-ohos-example',
                  partnerId: 'pp_partner_demo_ohos',
                  version: '0.76.1-beta.1',
                  url: 'https://example.com',
                },
              }),
            )
          }
        />
        <ResultBlock method="initialise" results={results} />
        <ActionButton
          method="configureOnramp"
          onPress={() =>
            run('configureOnramp', () =>
              NativeOnrampSdk?.configureOnramp(onrampConfiguration),
            )
          }
        />
        <ResultBlock method="configureOnramp" results={results} />
        <ActionButton
          method="onrampAuthorize"
          onPress={() =>
            run('onrampAuthorize', () =>
              NativeOnrampSdk?.onrampAuthorize(LINK_AUTH_INTENT_ID),
            )
          }
        />
        <ResultBlock method="onrampAuthorize" results={results} />
        <ActionButton
          method="provideCheckoutClientSecret"
          onPress={() =>
            run('provideCheckoutClientSecret', async () => {
              NativeOnrampSdk?.provideCheckoutClientSecret('cos_demo_secret');
              return 'provideCheckoutClientSecret(void) 已调用';
            })
          }
        />
        <ResultBlock method="provideCheckoutClientSecret" results={results} />
        <ActionButton
          method="logout"
          onPress={() => run('logout', () => NativeOnrampSdk?.logout())}
        />
        <ResultBlock method="logout" results={results} />
        <ActionButton
          method="addListener"
          onPress={() =>
            run('addListener', async () => {
              NativeOnrampSdk?.addListener('onCheckoutClientSecretRequested');
              return "addListener('onCheckoutClientSecretRequested') 已注册";
            })
          }
        />
        <ResultBlock method="addListener" results={results} />
        <ActionButton
          method="removeListeners"
          onPress={() =>
            run('removeListeners', async () => {
              NativeOnrampSdk?.removeListeners(1);
              return 'removeListeners(1) 已调用';
            })
          }
        />
        <ResultBlock method="removeListeners" results={results} />
      </Section>

      {/* ============ Onramp 类型样例 ============ */}
      <Section
        title="Onramp 类型样例"
        description="Configuration（含 appearance/GooglePay/SamsungPay 全字段）/ LinkUserInfo / KycInfo / ComplianceIdentifier / OnrampPlatformPayParams / CryptoPaymentToken。">
        <JsonCard label="Onramp.Configuration 样例" value={onrampConfiguration} />
        <JsonCard label="Onramp.LinkUserInfo 样例" value={onrampLinkUserInfo} />
        <JsonCard label="Onramp.KycInfo 样例" value={onrampKycInfo} />
        <JsonCard
          label="Onramp.ComplianceIdentifier 样例"
          value={onrampComplianceIdentifiers}
        />
        <JsonCard
          label="Onramp.OnrampPlatformPayParams 样例"
          value={onrampPlatformPayParams}
        />
        <JsonCard
          label="Onramp.CryptoPaymentToken 样例"
          value={onrampCryptoPaymentToken}
        />
        <JsonCard
          label="Onramp.CryptoNetwork / OnrampErrorStatus 枚举引用"
          value={{
            ethereum: Onramp.CryptoNetwork.ethereum,
            solana: Onramp.CryptoNetwork.solana,
            Failed: Onramp.OnrampErrorStatus.Failed,
            Canceled: Onramp.OnrampErrorStatus.Canceled,
          }}
        />
      </Section>
    </DemoScreen>
  );
}
