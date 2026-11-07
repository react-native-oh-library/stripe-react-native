/**
 * EmbeddedPaymentElement 用例（P0 补充）
 *
 * 覆盖检视报告中未覆盖的 4 个 TurboModule 方法（RTC-01）：
 * - StripeSdk.createEmbeddedPaymentElement / confirmEmbeddedPaymentElement /
 *   updateEmbeddedPaymentElement / clearEmbeddedPaymentOption
 *
 * 以及 useEmbeddedPaymentElement Hook 结果的全部字段（UseEmbeddedPaymentElementResult）：
 * embeddedPaymentElementView / paymentOption（PaymentOptionDisplayData）/
 * confirm / update / clearPaymentOption / loadingError / isLoaded
 *
 * 鸿蒙降级行为：createEmbeddedPaymentElement 返回 notSupported →
 * loadingError 可观察（App.tsx 已记录该路径，此处以全字段配置再次验证）。
 */

import React from 'react';
import {Text, View} from 'react-native';

import {
  useEmbeddedPaymentElement,
  type EmbeddedFormSheetAction,
  type EmbeddedPaymentElementAppearance,
  type EmbeddedPaymentElementConfiguration,
  type EmbeddedPaymentElementResult,
  type EmbeddedRowSelectionBehavior,
  type UseEmbeddedPaymentElementResult,
  type PaymentOptionDisplayData,
  AddressCollectionMode,
  AddressDetails,
  BillingDetails,
  CardBrand,
  CollectionMode,
  PaymentSheet,
} from '@stripe/stripe-react-native';
// TurboModule 直达：与库内 src/types/EmbeddedPaymentElement.tsx 同一导入方式
import NativeStripeSdk from '@stripe/stripe-react-native/src/specs/v1/NativeStripeSdkModule';

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
// 模块级常量保证引用稳定：
// 内联对象每次渲染产生新引用 → hook init effect 重跑 → 原生 notSupported emit
// loadingFailed → setLoadingError 再渲染 → 死循环刷日志（与 App.tsx 2026-11-04 修复一致）
// ---------------------------------------------------------------------------

const embeddedIntentConfiguration: PaymentSheet.IntentConfiguration = {
  mode: {
    amount: 1999,
    currencyCode: 'usd',
    captureMethod: PaymentSheet.CaptureMethod.Automatic,
    setupFutureUsage: 'OffSession',
    paymentMethodOptions: {setupFutureUsageValues: {card: 'OffSession', link: 'OnSession'}},
  },
};

const updatedIntentConfiguration: PaymentSheet.IntentConfiguration = {
  mode: {amount: 2999, currencyCode: 'eur'},
};

// 外观树样例：PaymentSheet.AppearanceParams 全字段
const embeddedAppearance: PaymentSheet.AppearanceParams = {
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
  navigationBarStyle: PaymentSheet.NavigationBarStyle.Plain,
};

// 行样式树样例：RowConfig / FlatConfig / FloatingConfig / RadioConfig /
// CheckmarkConfig / DisclosureConfig / EdgeInsetsConfig
const embeddedRowConfig: PaymentSheet.RowConfig = {
  additionalInsets: 4,
  flat: {
    separatorThickness: 1,
    separatorColor: '#E6E6EB',
    separatorInsets: {top: 0, left: 12, bottom: 0, right: 12},
    topSeparatorEnabled: false,
    bottomSeparatorEnabled: true,
    radio: {selectedColor: '#635BFF', unselectedColor: '#C7C7D1'},
    checkmark: {color: '#635BFF'},
    disclosure: {color: '#9B9BB4'},
  },
  floating: {spacing: 8},
};

const embeddedElementAppearance: EmbeddedPaymentElementAppearance = {
  row: embeddedRowConfig,
};

const embeddedFormSheetAction: EmbeddedFormSheetAction = {
  type: 'confirm',
  onFormSheetConfirmComplete: (result: EmbeddedPaymentElementResult) => {
    console.log('[EmbeddedDemo] onFormSheetConfirmComplete:', safeStringify(result));
  },
};

const embeddedRowSelectionBehavior: EmbeddedRowSelectionBehavior = {
  type: 'immediateAction',
  onSelectPaymentOption: () => {
    console.log('[EmbeddedDemo] onSelectPaymentOption');
  },
};

const embeddedConfiguration: EmbeddedPaymentElementConfiguration = {
  merchantDisplayName: 'OHOS Embedded Demo Merchant',
  customerId: 'cus_ohos_demo',
  customerEphemeralKeySecret: 'ek_test_ohos_demo_secret',
  customerSessionClientSecret: 'cuss_test_ohos_demo_secret',
  style: 'automatic',
  returnURL: 'stripe://stripe-redirect',
  billingDetailsCollectionConfiguration: {
    name: CollectionMode.AUTOMATIC,
    phone: CollectionMode.AUTOMATIC,
    email: CollectionMode.AUTOMATIC,
    address: AddressCollectionMode.AUTOMATIC,
    attachDefaultsToPaymentMethod: false,
  },
  defaultBillingDetails: {
    address: {
      city: 'Shenzhen',
      country: 'CN',
      line1: 'Keji Road 1',
      line2: 'Building A',
      postalCode: '518000',
      state: 'Guangdong',
    },
    email: 'demo@example.com',
    name: 'Demo User',
    phone: '+86 755 12345678',
  } as BillingDetails,
  defaultShippingDetails: {
    address: {city: 'Shenzhen', country: 'CN', line1: 'Keji Road 1', postalCode: '518000'},
    isCheckboxSelected: true,
    name: 'Demo User',
    phone: '+86 755 12345678',
  } as AddressDetails,
  allowsDelayedPaymentMethods: true,
  appearance: embeddedAppearance,
  primaryButtonLabel: 'Pay ¥19.99',
  removeSavedPaymentMethodMessage: '确认删除已保存的支付方式？',
  preferredNetworks: [CardBrand.Visa, CardBrand.Mastercard],
  paymentMethodOrder: ['card', 'klarna'],
  allowsRemovalOfLastSavedPaymentMethod: false,
  cardBrandAcceptance: {filter: PaymentSheet.CardBrandAcceptanceFilter.All},
  formSheetAction: embeddedFormSheetAction,
  rowSelectionBehavior: embeddedRowSelectionBehavior,
  embeddedViewDisplaysMandateText: true,
};

/** 消费 PaymentOptionDisplayData 全字段（image/mandateHTML 等字段引用即覆盖） */
function describePaymentOption(option: PaymentOptionDisplayData | null): string {
  if (!option) {
    return 'null';
  }
  return safeStringify({
    label: option.label,
    image: option.image,
    billingDetails: option.billingDetails,
    paymentMethodType: option.paymentMethodType,
    mandateHTML: option.mandateHTML,
  });
}

// ---------------------------------------------------------------------------
// Demo 组件
// ---------------------------------------------------------------------------

export function EmbeddedPaymentElementDemo() {
  const {results, run} = useDemoRunner();

  // 显式类型注解：UseEmbeddedPaymentElementResult 类型名引用
  const embeddedPaymentElement: UseEmbeddedPaymentElementResult =
    useEmbeddedPaymentElement(embeddedIntentConfiguration, embeddedConfiguration);

  return (
    <DemoScreen
      title="EmbeddedPaymentElement（嵌入式支付元素）"
      description="">
      {/* ============ Hook 结果 ============ */}
      <Section
        title="useEmbeddedPaymentElement 结果"
        description="embeddedPaymentElementView / paymentOption / confirm / update / clearPaymentOption / loadingError / isLoaded">
        <View style={demoStyles.resultBox}>
          <Text style={demoStyles.resultLabel}>isLoaded:</Text>
          <Text style={demoStyles.resultText}>
            {safeStringify(embeddedPaymentElement.isLoaded)}
          </Text>
        </View>
        <View style={demoStyles.resultBox}>
          <Text style={demoStyles.resultLabel}>loadingError:</Text>
          <Text style={demoStyles.resultText}>
            {safeStringify(embeddedPaymentElement.loadingError)}
          </Text>
        </View>
        <View style={demoStyles.resultBox}>
          <Text style={demoStyles.resultLabel}>paymentOption:</Text>
          <Text style={demoStyles.resultText}>
            {describePaymentOption(embeddedPaymentElement.paymentOption)}
          </Text>
        </View>
        {/* 原生视图（降级时高度为 0 / 不渲染），用错误边界兜底 */}
        <DemoErrorBoundary>
          <View style={{height: 120, overflow: 'hidden'}}>
            {embeddedPaymentElement.embeddedPaymentElementView}
          </View>
        </DemoErrorBoundary>
        <ActionButton
          method="confirm"
          onPress={() =>
            run('confirm', () => embeddedPaymentElement.confirm())
          }
        />
        <ResultBlock method="confirm" results={results} />
        <ActionButton
          method="update"
          onPress={() =>
            run('update', async () => {
              embeddedPaymentElement.update(updatedIntentConfiguration);
              return 'update() 已触发（异步生效，loadingError/isLoaded 区观察）';
            })
          }
        />
        <ResultBlock method="update" results={results} />
        <ActionButton
          method="clearPaymentOption"
          onPress={() =>
            run('clearPaymentOption', async () => {
              embeddedPaymentElement.clearPaymentOption();
              return 'clearPaymentOption() 已触发';
            })
          }
        />
        <ResultBlock method="clearPaymentOption" results={results} />
      </Section>

      {/* ============ TurboModule 直达 ============ */}
      <Section
        title="TurboModule 直达（StripeSdk spec 同名方法）"
        description="viewTag 传 0/-1 无法定位真实视图，直达调用用于观察鸿蒙 ArkTS 实现对非法 tag 的降级行为。">
        <ActionButton
          method="createEmbeddedPaymentElement"
          onPress={() =>
            run('createEmbeddedPaymentElement', () =>
              NativeStripeSdk.createEmbeddedPaymentElement(
                embeddedIntentConfiguration,
                embeddedConfiguration,
              ),
            )
          }
        />
        <ResultBlock method="createEmbeddedPaymentElement" results={results} />
        <ActionButton
          method="confirmEmbeddedPaymentElement"
          onPress={() =>
            run('confirmEmbeddedPaymentElement', () =>
              NativeStripeSdk.confirmEmbeddedPaymentElement(-1),
            )
          }
        />
        <ResultBlock method="confirmEmbeddedPaymentElement" results={results} />
        <ActionButton
          method="updateEmbeddedPaymentElement"
          onPress={() =>
            run('updateEmbeddedPaymentElement', () =>
              NativeStripeSdk.updateEmbeddedPaymentElement(
                updatedIntentConfiguration,
              ),
            )
          }
        />
        <ResultBlock method="updateEmbeddedPaymentElement" results={results} />
        <ActionButton
          method="clearEmbeddedPaymentOption"
          onPress={() =>
            run('clearEmbeddedPaymentOption', () =>
              NativeStripeSdk.clearEmbeddedPaymentOption(-1),
            )
          }
        />
        <ResultBlock method="clearEmbeddedPaymentOption" results={results} />
      </Section>

      {/* ============ 类型样例 ============ */}
      <Section
        title="Embedded 类型样例（EmbeddedPaymentElementConfiguration 26 字段 / 外观树）"
        description="formSheetAction / rowSelectionBehavior / embeddedViewDisplaysMandateText 等未覆盖字段以字面量引用。">
        <JsonCard
          label="EmbeddedPaymentElementConfiguration 样例"
          value={embeddedConfiguration}
        />
        <JsonCard
          label="EmbeddedPaymentElementAppearance（RowConfig 树）样例"
          value={embeddedElementAppearance}
        />
        <JsonCard label="AppearanceParams 样例" value={embeddedAppearance} />
        <JsonCard
          label="IntentConfiguration（PaymentMode 全字段）样例"
          value={embeddedIntentConfiguration}
        />
        <JsonCard label="EmbeddedFormSheetAction 样例" value={{type: embeddedFormSheetAction.type}} />
        <JsonCard
          label="EmbeddedRowSelectionBehavior 样例"
          value={{type: embeddedRowSelectionBehavior.type}}
        />
      </Section>
    </DemoScreen>
  );
}
