/**
 * CustomerSheet 用例（P0 补充）
 *
 * 覆盖检视报告中未覆盖的 Customer Sheet TurboModule 方法（RTC-01/RTC-06）：
 * - StripeSdk.initCustomerSheet / presentCustomerSheet /
 *   retrieveCustomerSheetPaymentOptionSelection
 * - 6 个 customerAdapter*Callback + 2 个 clientSecretProvider*Callback
 *
 * 两条路径互补：
 * 1. JS 门面（CustomerSheet.initialize/present/retrievePaymentOptionSelection）—
 *    验证 JS 层参数转发与事件监听注册；
 * 2. TurboModule 直达（NativeStripeSdk.xxx，与 jest/__tests__ 中 mock 的同名方法一致）—
 *    直接观察鸿蒙 ArkTS 实现的降级行为（未配置真实后端密钥时返回结构化 StripeError）。
 *
 * 同时以类型化字面量覆盖 CustomerSheet 相关类型字段：
 * CustomerSheetInitParams/CustomerSheetPresentParams/CustomerSheetResult/
 * CustomerAdapter/ClientSecretProvider/CustomerSheetIntentConfiguration/
 * CustomerSessionClientSecret/CustomerPaymentOption/PaymentSheet.PaymentOption
 */

import React from 'react';

import {
  CustomerSheet,
  type CustomerAdapter,
  type ClientSecretProvider,
  type CustomerPaymentOption,
  type CustomerSessionClientSecret,
  type CustomerSheetInitParams,
  type CustomerSheetIntentConfiguration,
  type CustomerSheetPresentParams,
  type CustomerSheetResult,
  PaymentSheet,
  CardBrand,
  AddressCollectionMode,
  CollectionMode,
} from '@stripe/stripe-react-native';
// TurboModule 直达：与库内 src/components/CustomerSheet.tsx 同一导入方式
import NativeStripeSdk from '@stripe/stripe-react-native/src/specs/v1/NativeStripeSdkModule';

import {
  ActionButton,
  DemoScreen,
  JsonCard,
  ResultBlock,
  Section,
  safeStringify,
  useDemoRunner,
} from './demoHelpers';

const CUSTOMER_ID = 'cus_ohos_demo';
const EPHEMERAL_KEY_SECRET = 'ek_test_ohos_demo_secret';
const SETUP_INTENT_SECRET = 'seti_test_ohos_demo_secret';

// ---------------------------------------------------------------------------
// 类型字面量样例（模块级常量保证引用稳定）
// ---------------------------------------------------------------------------

const samplePaymentMethodJson = {
  id: 'pm_ohos_demo',
  object: 'payment_method',
  type: 'card',
  card: {brand: 'visa', last4: '4242', exp_month: 12, exp_year: 2030},
};

const customerAdapterSample: CustomerAdapter = {
  fetchPaymentMethods: async () => [samplePaymentMethodJson],
  attachPaymentMethod: async (paymentMethodId: string) => ({
    id: paymentMethodId,
  }),
  detachPaymentMethod: async (paymentMethodId: string) => ({
    id: paymentMethodId,
  }),
  setSelectedPaymentOption: async () => undefined,
  fetchSelectedPaymentOption: async () => 'link',
  setupIntentClientSecretForCustomerAttach: async () => SETUP_INTENT_SECRET,
};

const customerSessionClientSecretSample: CustomerSessionClientSecret = {
  customerId: CUSTOMER_ID,
  clientSecret: 'cuss_test_ohos_demo_secret',
};

const clientSecretProviderSample: ClientSecretProvider = {
  provideSetupIntentClientSecret: async () => SETUP_INTENT_SECRET,
  provideCustomerSessionClientSecret: async () =>
    customerSessionClientSecretSample,
};

const customerSheetIntentConfigurationSample: CustomerSheetIntentConfiguration =
  {
    paymentMethodTypes: ['card', 'us_bank_account'],
    onBehalfOf: 'acct_demo_ohos',
  };

const customerPaymentOptionSample: CustomerPaymentOption = 'link';

const paymentOptionSample: PaymentSheet.PaymentOption = {
  label: 'Visa •••• 4242',
  image: 'iVBORw0KGgoAAAANSUhEUg==',
};

// legacy CustomerAdapter 变体（customerId + customerEphemeralKeySecret + 可选 setupIntentClientSecret）
const customerSheetAdapterParams: CustomerSheetInitParams = {
  customerId: CUSTOMER_ID,
  customerEphemeralKeySecret: EPHEMERAL_KEY_SECRET,
  setupIntentClientSecret: SETUP_INTENT_SECRET,
  customerAdapter: customerAdapterSample,
  merchantDisplayName: 'OHOS CustomerSheet Demo',
  headerTextForSelectionScreen: '选择支付方式',
  style: 'automatic',
  returnURL: 'stripe://stripe-redirect',
  allowsRemovalOfLastSavedPaymentMethod: true,
  preferredNetworks: [CardBrand.Visa, CardBrand.Mastercard],
  billingDetailsCollectionConfiguration: {
    name: CollectionMode.ALWAYS,
    phone: CollectionMode.AUTOMATIC,
    email: CollectionMode.NEVER,
    address: AddressCollectionMode.FULL,
    attachDefaultsToPaymentMethod: true,
  },
  applePayEnabled: false,
  googlePayEnabled: false,
  opensCardScannerAutomatically: false,
  removeSavedPaymentMethodMessage: '确认删除已保存的支付方式？',
};

// CustomerSession 变体（intentConfiguration + clientSecretProvider）
const customerSheetSessionParams: CustomerSheetInitParams = {
  intentConfiguration: customerSheetIntentConfigurationSample,
  clientSecretProvider: clientSecretProviderSample,
  merchantDisplayName: 'OHOS CustomerSheet Session Demo',
  style: 'alwaysLight',
};

const customerSheetPresentParams: CustomerSheetPresentParams = {
  presentationStyle: 'formSheet',
  animationStyle: 'dissolve',
  timeout: 30000,
};

// initCustomerSheet 第二参：native 侧启用哪些 customerAdapter 回调（全键显式给出）
const customerAdapterOverrides: {
  [Property in keyof CustomerAdapter]: boolean;
} = {
  fetchPaymentMethods: true,
  attachPaymentMethod: true,
  detachPaymentMethod: true,
  setSelectedPaymentOption: true,
  fetchSelectedPaymentOption: true,
  setupIntentClientSecretForCustomerAttach: true,
};

const customerAdapterOverridesNone: {
  [Property in keyof CustomerAdapter]: boolean;
} = {
  fetchPaymentMethods: false,
  attachPaymentMethod: false,
  detachPaymentMethod: false,
  setSelectedPaymentOption: false,
  fetchSelectedPaymentOption: false,
  setupIntentClientSecretForCustomerAttach: false,
};

/** 读取 CustomerSheetResult 三个可选字段的消费样例（字段引用即覆盖） */
function describeCustomerSheetResult(result: CustomerSheetResult): string {
  return safeStringify({
    error: result.error,
    paymentOption: result.paymentOption,
    paymentMethod: result.paymentMethod,
  });
}

// ---------------------------------------------------------------------------
// Demo 组件
// ---------------------------------------------------------------------------

export function CustomerSheetDemo() {
  const {results, run} = useDemoRunner();

  return (
    <DemoScreen
      title="CustomerSheet（支付方式管理）"
      description="">
      {/* ============ JS 门面 ============ */}
      <Section
        title="CustomerSheet.initialize / present / retrievePaymentOptionSelection"
        description="组件对象形态的公开 API；内部转发到 NativeStripeSdk.initCustomerSheet 等方法并注册回调事件监听。">
        <ActionButton
          method="CustomerSheet.initialize-adapter"
          onPress={() =>
            run('CustomerSheet.initialize-adapter', () =>
              CustomerSheet.initialize(customerSheetAdapterParams),
            )
          }
        />
        <ResultBlock method="CustomerSheet.initialize-adapter" results={results} />
        <ActionButton
          method="CustomerSheet.initialize-customerSession"
          onPress={() =>
            run('CustomerSheet.initialize-customerSession', () =>
              CustomerSheet.initialize(customerSheetSessionParams),
            )
          }
        />
        <ResultBlock
          method="CustomerSheet.initialize-customerSession"
          results={results}
        />
        <ActionButton
          method="CustomerSheet.present"
          onPress={() =>
            run('CustomerSheet.present', () =>
              CustomerSheet.present(customerSheetPresentParams),
            )
          }
        />
        <ResultBlock method="CustomerSheet.present" results={results} />
        <ActionButton
          method="CustomerSheet.retrievePaymentOptionSelection"
          onPress={() =>
            run('CustomerSheet.retrievePaymentOptionSelection', async () => {
              // 该方法签名无参（types/CustomerSheet.ts），JS facade 直调
              const result = await CustomerSheet.retrievePaymentOptionSelection();
              // 消费 CustomerSheetResult 的 error/paymentOption/paymentMethod 字段
              return describeCustomerSheetResult(result);
            })
          }
        />
        <ResultBlock
          method="CustomerSheet.retrievePaymentOptionSelection"
          results={results}
        />
      </Section>

      {/* ============ TurboModule 直达 ============ */}
      <Section
        title="TurboModule 直达（StripeSdk spec 同名方法）"
        description="调用鸿蒙 ArkTS 实现，观察降级返回。">
        <ActionButton
          method="initCustomerSheet"
          onPress={() =>
            run('initCustomerSheet', () =>
              NativeStripeSdk.initCustomerSheet(
                customerSheetAdapterParams,
                customerAdapterOverrides,
              ),
            )
          }
        />
        <ResultBlock method="initCustomerSheet" results={results} />
        <ActionButton
          method="initCustomerSheet-customerSession"
          onPress={() =>
            run('initCustomerSheet-customerSession', () =>
              NativeStripeSdk.initCustomerSheet(
                customerSheetSessionParams,
                customerAdapterOverridesNone,
              ),
            )
          }
        />
        <ResultBlock method="initCustomerSheet-customerSession" results={results} />
        <ActionButton
          method="presentCustomerSheet"
          onPress={() =>
            run('presentCustomerSheet', () =>
              NativeStripeSdk.presentCustomerSheet(customerSheetPresentParams),
            )
          }
        />
        <ResultBlock method="presentCustomerSheet" results={results} />
        <ActionButton
          method="retrieveCustomerSheetPaymentOptionSelection"
          onPress={() =>
            run('retrieveCustomerSheetPaymentOptionSelection', async () => {
              const result =
                await NativeStripeSdk.retrieveCustomerSheetPaymentOptionSelection();
              return describeCustomerSheetResult(result);
            })
          }
        />
        <ResultBlock
          method="retrieveCustomerSheetPaymentOptionSelection"
          results={results}
        />
      </Section>

      {/* ============ customerAdapter 回调（6 个） ============ */}
      <Section
        title="customerAdapter*Callback（6 个，RTC-06）"
        description="native 通过事件调用 JS adapter 后，JS 用这些方法把结果回传 native；调用观察鸿蒙侧实现。">
        <ActionButton
          method="customerAdapterFetchPaymentMethodsCallback"
          onPress={() =>
            run('customerAdapterFetchPaymentMethodsCallback', () =>
              NativeStripeSdk.customerAdapterFetchPaymentMethodsCallback([
                samplePaymentMethodJson,
              ]),
            )
          }
        />
        <ResultBlock
          method="customerAdapterFetchPaymentMethodsCallback"
          results={results}
        />
        <ActionButton
          method="customerAdapterAttachPaymentMethodCallback"
          onPress={() =>
            run('customerAdapterAttachPaymentMethodCallback', () =>
              NativeStripeSdk.customerAdapterAttachPaymentMethodCallback(
                samplePaymentMethodJson,
              ),
            )
          }
        />
        <ResultBlock
          method="customerAdapterAttachPaymentMethodCallback"
          results={results}
        />
        <ActionButton
          method="customerAdapterDetachPaymentMethodCallback"
          onPress={() =>
            run('customerAdapterDetachPaymentMethodCallback', () =>
              NativeStripeSdk.customerAdapterDetachPaymentMethodCallback(
                samplePaymentMethodJson,
              ),
            )
          }
        />
        <ResultBlock
          method="customerAdapterDetachPaymentMethodCallback"
          results={results}
        />
        <ActionButton
          method="customerAdapterSetSelectedPaymentOptionCallback"
          onPress={() =>
            run('customerAdapterSetSelectedPaymentOptionCallback', () =>
              NativeStripeSdk.customerAdapterSetSelectedPaymentOptionCallback(),
            )
          }
        />
        <ResultBlock
          method="customerAdapterSetSelectedPaymentOptionCallback"
          results={results}
        />
        <ActionButton
          method="customerAdapterFetchSelectedPaymentOptionCallback"
          onPress={() =>
            run('customerAdapterFetchSelectedPaymentOptionCallback', () =>
              NativeStripeSdk.customerAdapterFetchSelectedPaymentOptionCallback(
                customerPaymentOptionSample,
              ),
            )
          }
        />
        <ResultBlock
          method="customerAdapterFetchSelectedPaymentOptionCallback"
          results={results}
        />
        <ActionButton
          method="customerAdapterSetupIntentClientSecretForCustomerAttachCallback"
          onPress={() =>
            run(
              'customerAdapterSetupIntentClientSecretForCustomerAttachCallback',
              () =>
                NativeStripeSdk.customerAdapterSetupIntentClientSecretForCustomerAttachCallback(
                  SETUP_INTENT_SECRET,
                ),
            )
          }
        />
        <ResultBlock
          method="customerAdapterSetupIntentClientSecretForCustomerAttachCallback"
          results={results}
        />
      </Section>

      {/* ============ clientSecretProvider 回调（2 个） ============ */}
      <Section
        title="clientSecretProvider*Callback"
        description="CustomerSession 模式下 JS 向 native 回传 SetupIntent / CustomerSession client secret。">
        <ActionButton
          method="clientSecretProviderSetupIntentClientSecretCallback"
          onPress={() =>
            run('clientSecretProviderSetupIntentClientSecretCallback', () =>
              NativeStripeSdk.clientSecretProviderSetupIntentClientSecretCallback(
                SETUP_INTENT_SECRET,
              ),
            )
          }
        />
        <ResultBlock
          method="clientSecretProviderSetupIntentClientSecretCallback"
          results={results}
        />
        <ActionButton
          method="clientSecretProviderCustomerSessionClientSecretCallback"
          onPress={() =>
            run('clientSecretProviderCustomerSessionClientSecretCallback', () =>
              NativeStripeSdk.clientSecretProviderCustomerSessionClientSecretCallback(
                customerSessionClientSecretSample,
              ),
            )
          }
        />
        <ResultBlock
          method="clientSecretProviderCustomerSessionClientSecretCallback"
          results={results}
        />
      </Section>

      {/* ============ 组件形态 + 类型样例 ============ */}
      <Section
        title="CustomerSheet.Component（visible=false 静态挂载）"
        description="组件包装形态：visible 置 true 时依次调用 initialize + present；此处保持 false 仅验证挂载。">
        <CustomerSheet.Component
          visible={false}
          onResult={result => {
            console.log('[CustomerSheetDemo] onResult:', describeCustomerSheetResult(result));
          }}
          customerId={CUSTOMER_ID}
          customerEphemeralKeySecret={EPHEMERAL_KEY_SECRET}
        />
        <JsonCard label="CustomerAdapter 样例（6 个回调全字段）" value={{
          fetchPaymentMethods: 'async () => PaymentMethod[]',
          attachPaymentMethod: 'async (paymentMethodId) => PaymentMethod',
          detachPaymentMethod: 'async (paymentMethodId) => PaymentMethod',
          setSelectedPaymentOption: 'async (paymentOption | null) => void',
          fetchSelectedPaymentOption: 'async () => CustomerPaymentOption | null',
          setupIntentClientSecretForCustomerAttach: 'async () => clientSecret',
        }} />
        <JsonCard
          label="ClientSecretProvider 样例"
          value={clientSecretProviderSample}
        />
        <JsonCard
          label="CustomerSheetIntentConfiguration 样例"
          value={customerSheetIntentConfigurationSample}
        />
        <JsonCard
          label="CustomerSessionClientSecret 样例"
          value={customerSessionClientSecretSample}
        />
        <JsonCard
          label="CustomerSheetPresentParams 样例"
          value={customerSheetPresentParams}
        />
        <JsonCard label="PaymentSheet.PaymentOption 样例" value={paymentOptionSample} />
      </Section>
    </DemoScreen>
  );
}
