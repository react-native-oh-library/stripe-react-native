/**
 * Checkout（Private Preview）用例（P2 补充）
 *
 * 覆盖：
 * - createCheckout（JS 导出，鸿蒙未含 native 支持时 reject notImplemented）
 * - useCheckout 全部结果字段（Checkout.UseResult / CheckoutController 同构方法）：
 *   status / session / paymentElement / error / reload / updateEmail /
 *   updateShippingAddress / applyPromotionCode / removePromotionCode /
 *   runServerUpdate / clearPaymentOption / confirm
 * - CheckoutPaymentElementView 组件（element prop 消费）
 * - Checkout 命名空间类型树：Session / OneTimePriceItem / AmountDetails /
 *   Totals / TaxAmount / DiscountAmount / AdjustableQuantity / Defaults 等
 */

import React from 'react';
import {Text, View} from 'react-native';

import {
  createCheckout,
  useCheckout,
  CheckoutPaymentElementView,
  Checkout,
  CardBrand,
  PaymentMethodLayout,
  type CheckoutController,
  type CheckoutPaymentElement,
} from '@stripe/stripe-react-native';

import {
  ActionButton,
  DemoErrorBoundary,
  DemoScreen,
  JsonCard,
  ResultBlock,
  Section,
  demoStyles,
  safeStringify,
  useDemoRunner,
} from './demoHelpers';

// ---------------------------------------------------------------------------
// Checkout 类型字面量样例（Session 树全字段）
// ---------------------------------------------------------------------------

const checkoutAmount: Checkout.Amount = {amount: '$19.99', minorUnitsAmount: 1999};
const checkoutTaxAmount: Checkout.TaxAmount = {
  inclusive: true,
  displayName: 'VAT',
  percentage: 0.2,
  amount: '$3.33',
  minorUnitsAmount: 333,
};
const checkoutAdjustableQuantity: Checkout.AdjustableQuantity = {
  minimum: 1,
  maximum: 10,
};
const checkoutOneTimePriceItem: Checkout.OneTimePriceItem = {
  key: 'item_key_demo',
  displayName: 'Demo Widget',
  images: ['https://example.com/widget.png'],
  unitAmount: checkoutAmount,
  unitAmountDecimal: checkoutAmount,
  unitLabel: 'widget',
  quantity: 1,
  adjustableQuantity: checkoutAdjustableQuantity,
};
const checkoutAmountDetails: Checkout.AmountDetails = {
  total: checkoutAmount,
  subtotal: checkoutAmount,
  taxAmounts: [checkoutTaxAmount],
  // AmountDetails.discount 为纯 Amount（不含折扣明细字段）
  discount: {amount: '$2.00', minorUnitsAmount: 200},
  taxInclusive: checkoutAmount,
  taxExclusive: checkoutAmount,
};
const checkoutOrderSummaryItem: Checkout.OneTimePriceOrderSummaryItem = {
  type: 'one_time_price',
  key: 'summary_item_demo',
  description: 'Demo order summary item',
  items: [checkoutOneTimePriceItem],
  amountDetails: checkoutAmountDetails,
};
const checkoutSessionSample: Checkout.Session = {
  id: 'cos_test_ohos_demo',
  businessName: 'OHOS Checkout Demo Merchant',
  livemode: false,
  currency: 'USD',
  minorUnitsAmountDivisor: 100,
  presentmentDetails: {presentmentCurrency: 'USD'},
  email: 'demo@example.com',
  paymentOption: {
    image: 'iVBORw0KGgoAAAANSUhEUg==',
    label: 'Visa •••• 4242',
    billingDetails: {name: 'Demo User', email: 'demo@example.com'},
    paymentMethodType: 'card',
    mandateHTML: '<p>mandate html</p>',
  },
  shippingAddress: {
    name: 'Demo User',
    address: {country: 'US', line1: 'Market Street 1', line2: '', city: 'San Francisco', state: 'CA', postalCode: '94103'},
  },
  orderSummaryItems: [checkoutOrderSummaryItem],
  discountAmounts: [
    {
      displayName: 'WELCOME10',
      promotionCode: 'promo_demo',
      percentOff: 0.1,
      amount: '$2.00',
      minorUnitsAmount: 200,
    },
  ],
  tax: {status: 'ready'},
  taxAmounts: [checkoutTaxAmount],
  totals: {
    subtotal: checkoutAmount,
    taxExclusive: checkoutAmount,
    taxInclusive: checkoutAmount,
    discount: checkoutAmount,
    total: checkoutAmount,
  },
  status: {type: 'open'},
  lastPaymentError: null,
};

const checkoutDefaultsSample: Checkout.Defaults = {
  billingDetails: {name: 'Demo User', address: {country: 'US', line1: 'Market Street 1'}},
  shippingDetails: {name: 'Demo User', address: {country: 'US', line1: 'Market Street 1', city: 'San Francisco', state: 'CA', postalCode: '94103'}},
  phone: '+12125551234',
  email: 'demo@example.com',
};

const checkoutCreateOptions: Checkout.CreateOptions = {
  clientSecret: 'cos_test_ohos_demo_secret',
  returnURL: 'stripe://stripe-redirect',
  defaults: checkoutDefaultsSample,
  merchantDisplayName: 'OHOS Checkout Demo Merchant',
  style: 'automatic',
  paymentElement: {
    savePaymentMethodOptInBehavior: 'requiresOptIn',
    preferredNetworks: [CardBrand.Visa],
    removeSavedPaymentMethodMessage: '确认删除？',
    paymentMethodOrder: ['card', 'klarna'],
    opensCardScannerAutomatically: false,
    useAutocompleteEndpoints: true,
    paymentMethodLayout: PaymentMethodLayout.Automatic,
    displaysMandateText: true,
    rowSelectionBehavior: {type: 'default'},
    applePay: {merchantCountryCode: 'US', buttonType: 'buy'},
    googlePay: {testEnv: true, label: 'Demo', buttonType: 'buy', additionalEnabledNetworks: ['visa']},
    link: {display: 'automatic'},
    billingDetailsCollectionConfiguration: {
      name: 'automatic',
      phone: 'automatic',
      address: 'automatic',
      attachDefaultsToPaymentMethod: false,
    },
  },
};

// ---------------------------------------------------------------------------
// Demo 组件
// ---------------------------------------------------------------------------

export function CheckoutDemo() {
  const {results, run} = useDemoRunner();

  const checkout = useCheckout({
    enabled: true,
    getConfiguration: async () => ({
      clientSecret: 'cos_test_ohos_demo_secret',
      returnURL: 'stripe://stripe-redirect',
    }),
  });

  // 类型名引用：CheckoutPaymentElement（hook 结果字段）/ CheckoutController（含 destroy 字段，
  // useCheckout 未直接暴露 controller，以类型化空引用消费其字段名）
  const checkoutPaymentElementRef: CheckoutPaymentElement | null =
    checkout.paymentElement;
  const checkoutControllerRef: CheckoutController | null = null;

  return (
    <DemoScreen
      title="Checkout（Private Preview，降级观察）"
      description="">
      {/* ============ useCheckout 结果 ============ */}
      <Section
        title="useCheckout 结果（UseResult 全字段）"
        description="status / session / paymentElement / error 与 CheckoutController 同构的 8 个方法。">
        <View style={demoStyles.resultBox}>
          <Text style={demoStyles.resultLabel}>status:</Text>
          <Text style={demoStyles.resultText}>
            {safeStringify(checkout.status)}
          </Text>
        </View>
        <View style={demoStyles.resultBox}>
          <Text style={demoStyles.resultLabel}>session:</Text>
          <Text style={demoStyles.resultText}>
            {safeStringify(checkout.session)}
          </Text>
        </View>
        <View style={demoStyles.resultBox}>
          <Text style={demoStyles.resultLabel}>paymentElement:</Text>
          <Text style={demoStyles.resultText}>
            {safeStringify(checkout.paymentElement)}
          </Text>
        </View>
        <View style={demoStyles.resultBox}>
          <Text style={demoStyles.resultLabel}>error:</Text>
          <Text style={demoStyles.resultText}>
            {safeStringify(checkout.error)}
          </Text>
        </View>

        <ActionButton
          method="reload"
          onPress={() => run('reload', () => checkout.reload())}
        />
        <ResultBlock method="reload" results={results} />
        <ActionButton
          method="updateEmail"
          onPress={() =>
            run('updateEmail', () => checkout.updateEmail('demo@example.com'))
          }
        />
        <ResultBlock method="updateEmail" results={results} />
        <ActionButton
          method="updateEmail-null"
          onPress={() => run('updateEmail-null', () => checkout.updateEmail(null))}
        />
        <ResultBlock method="updateEmail-null" results={results} />
        <ActionButton
          method="updateShippingAddress"
          onPress={() =>
            run('updateShippingAddress', () =>
              checkout.updateShippingAddress({
                name: 'Demo User',
                address: {country: 'US', line1: 'Market Street 1', city: 'San Francisco', state: 'CA', postalCode: '94103'},
              }),
            )
          }
        />
        <ResultBlock method="updateShippingAddress" results={results} />
        <ActionButton
          method="applyPromotionCode"
          onPress={() =>
            run('applyPromotionCode', () =>
              checkout.applyPromotionCode('WELCOME10'),
            )
          }
        />
        <ResultBlock method="applyPromotionCode" results={results} />
        <ActionButton
          method="removePromotionCode"
          onPress={() => run('removePromotionCode', () => checkout.removePromotionCode())}
        />
        <ResultBlock method="removePromotionCode" results={results} />
        <ActionButton
          method="runServerUpdate"
          onPress={() =>
            run('runServerUpdate', () =>
              checkout.runServerUpdate(async () => undefined),
            )
          }
        />
        <ResultBlock method="runServerUpdate" results={results} />
        <ActionButton
          method="clearPaymentOption"
          onPress={() => run('clearPaymentOption', () => checkout.clearPaymentOption())}
        />
        <ResultBlock method="clearPaymentOption" results={results} />
        <ActionButton
          method="confirm"
          onPress={() => run('confirm', () => checkout.confirm())}
        />
        <ResultBlock method="confirm" results={results} />
      </Section>

      {/* ============ createCheckout + CheckoutPaymentElementView ============ */}
      <Section
        title="createCheckout / CheckoutPaymentElementView"
        description="createCheckout 调用（预期 reject notImplemented）；视图仅在 paymentElement 就绪后渲染（降级时为 null，显示占位说明）。">
        <ActionButton
          method="createCheckout"
          onPress={() =>
            run('createCheckout', () => createCheckout(checkoutCreateOptions))
          }
        />
        <ResultBlock method="createCheckout" results={results} />
        <JsonCard
          label="CheckoutController.destroy / CheckoutPaymentElement 字段引用"
          value={{
            destroy: safeStringify(checkoutControllerRef?.destroy),
            paymentElementIsNull: checkoutPaymentElementRef === null,
          }}
        />
        <DemoErrorBoundary>
          {checkoutPaymentElementRef ? (
            <CheckoutPaymentElementView element={checkoutPaymentElementRef} />
          ) : (
            <View style={demoStyles.resultBox}>
              <Text style={demoStyles.resultText}>
                paymentElement 为 null（降级），CheckoutPaymentElementView 未挂载；
                element prop 类型（CheckoutPaymentElementViewProps.element）已在本节类型样例中引用。
              </Text>
            </View>
          )}
        </DemoErrorBoundary>
      </Section>

      {/* ============ 类型样例 ============ */}
      <Section
        title="Checkout 类型样例（Session 树全字段）"
        description="Session / OneTimePriceItem / AmountDetails / Totals / TaxAmount / DiscountAmount / AdjustableQuantity / Defaults / PaymentElementConfiguration。">
        <JsonCard label="Checkout.Session 样例" value={checkoutSessionSample} />
        <JsonCard
          label="Checkout.OneTimePriceItem 样例"
          value={checkoutOneTimePriceItem}
        />
        <JsonCard
          label="Checkout.AmountDetails 样例"
          value={checkoutAmountDetails}
        />
        <JsonCard label="Checkout.Totals 样例" value={checkoutSessionSample.totals} />
        <JsonCard label="Checkout.Defaults 样例" value={checkoutDefaultsSample} />
        <JsonCard
          label="Checkout.CreateOptions 样例"
          value={checkoutCreateOptions}
        />
        <JsonCard
          label="Checkout 枚举/字面量联合引用"
          value={{
            sessionStatus: checkoutSessionSample.status,
            applePayButtonType: 'buy',
            googlePayButtonType: 'donate',
            savePaymentMethodOptInBehavior: 'requiresOptIn',
            errorCode: 'Failed',
            userInterfaceStyle: 'alwaysDark',
          }}
        />
      </Section>
    </DemoScreen>
  );
}
