/**
 * stripe-react-native 鸿蒙化 Example — Demo 导航首页
 *
 * 目录结构参考 rntpc_react-native-audio/example/src：本文件作为测试列表首页，
 * 原 example/App.tsx（单页用例，内容未改动）移入 src 并重命名为 LegacyApp.tsx，作为其中一屏保留，其余为补充用例：
 * - CustomerSheetDemo           P0：Customer Sheet 3 个 TurboModule 方法 +
 *                               customerAdapter/clientSecretProvider 8 个回调
 * - EmbeddedPaymentElementDemo  P0：Embedded Payment Element 4 个 TurboModule 方法 + useEmbeddedPaymentElement 全字段
 * - OnrampDemo                  P1：OnrampSdk 全部 26 个 TurboModule 方法 + useOnramp 全方法 + Onramp 类型
 * - CheckoutDemo                P2：Checkout private preview（createCheckout/useCheckout/CheckoutPaymentElementView/CheckoutController）
 * - PaymentSheetTypesDemo       P2：PaymentSheet 外观树 / IntentConfiguration / CustomPaymentMethod / 组件类型
 * - ResultTypesDemo             P2：Result 联合类型 / Errors / InitStripe / PushProvisioning
 * - NamespaceTypesDemo          P2：PaymentIntent/PaymentMethod/Token/PlatformPay/FinancialConnections/ConfirmationToken/LinkController 等命名空间
 */

import React, {useEffect, useState} from 'react';
import {Button, ScrollView, StyleSheet, Text, View} from 'react-native';

import LegacyApp from './LegacyApp';
import {ensureStripeInit} from './demoHelpers';
import {CustomerSheetDemo} from './CustomerSheetDemo';
import {EmbeddedPaymentElementDemo} from './EmbeddedPaymentElementDemo';
import {OnrampDemo} from './OnrampDemo';
import {CheckoutDemo} from './CheckoutDemo';
import {PaymentSheetTypesDemo} from './PaymentSheetTypesDemo';
import {ResultTypesDemo} from './ResultTypesDemo';
import {NamespaceTypesDemo} from './NamespaceTypesDemo';

type ScreenName =
  | 'home'
  | 'legacy'
  | 'customerSheet'
  | 'embedded'
  | 'onramp'
  | 'checkout'
  | 'paymentSheetTypes'
  | 'resultTypes'
  | 'namespaceTypes';

const DEMOS: Array<{
  name: Exclude<ScreenName, 'home'>;
  title: string;
  description: string;
}> = [
  {
    name: 'legacy',
    title: 'CardField/CardForm/PaymentSheet/Hooks/Connect',
    description:
      '',
  },
  {
    name: 'customerSheet',
    title: 'CustomerSheetDemo',
    description: '',
  },
  {
    name: 'embedded',
    title: 'EmbeddedPaymentElementDemo',
    description: '',
  },
  {
    name: 'onramp',
    title: 'OnrampDemo',
    description: '',
  },
  {
    name: 'checkout',
    title: 'CheckoutDemo',
    description: '',
  },
  {
    name: 'paymentSheetTypes',
    title: 'PaymentSheetTypesDemo',
    description: '',
  },
  {
    name: 'resultTypes',
    title: 'ResultTypesDemo',
    description: '',
  },
  {
    name: 'namespaceTypes',
    title: 'NamespaceTypesDemo',
    description: '',
  },
];

const App = () => {
  const [screen, setScreen] = useState<ScreenName>('home');

  useEffect(() => {
    void ensureStripeInit();
  }, []);

  const renderHome = () => (
    <ScrollView
      style={styles.home}
      contentContainerStyle={styles.homeContent}>
      <Text style={styles.homeTitle}>stripe-react-native 测试列表</Text>
      {DEMOS.map(demo => (
        <View key={demo.name} style={styles.item}>
          <Button title={demo.title} onPress={() => setScreen(demo.name)} />
          <Text style={styles.itemDescription}>{demo.description}</Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderScreen = () => {
    switch (screen) {
      case 'legacy':
        return <LegacyApp />;
      case 'customerSheet':
        return <CustomerSheetDemo />;
      case 'embedded':
        return <EmbeddedPaymentElementDemo />;
      case 'onramp':
        return <OnrampDemo />;
      case 'checkout':
        return <CheckoutDemo />;
      case 'paymentSheetTypes':
        return <PaymentSheetTypesDemo />;
      case 'resultTypes':
        return <ResultTypesDemo />;
      case 'namespaceTypes':
        return <NamespaceTypesDemo />;
      default:
        return renderHome();
    }
  };

  return (
    <View style={styles.container}>
      {screen !== 'home' ? (
        <View style={styles.header}>
          <Button title="back" onPress={() => setScreen('home')} />
          <Text style={styles.headerTitle}>{screen}</Text>
        </View>
      ) : null}
      <View style={styles.content}>{renderScreen()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  home: {
    flex: 1,
  },
  homeContent: {
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 32,
  },
  homeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  item: {
    marginBottom: 16,
  },
  itemDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    lineHeight: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 40,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#000',
  },
  content: {
    flex: 1,
  },
});

export default App;
