/**
 * Stripe React Native — OpenHarmony Example 测试页
 *
 * 单页应用，覆盖 @stripe/stripe-react-native 鸿蒙适配层的公开 API：
 * - StripeProvider 初始化（initialise / initStripe / stripeAccountId / threeDSecureParams）
 * - CardField / CardForm（含 focus/blur/clear ref 命令）/ AuBECSDebitForm / StripeContainer / PlatformPayButton /
 *   AddressSheet / AddToWalletButton / PaymentMethodMessagingElement / CustomerSheet（组件形态）/
 *   Connect 组件（AccountOnboarding / Payments / Payouts / PaymentDetails / NavigationBar）
 * - useStripe / usePaymentSheet / useConfirmPayment / useConfirmSetupIntent / usePlatformPay /
 *   useFinancialConnectionsSheet / useOnramp / useLinkController / useCheckout /
 *   useEmbeddedPaymentElement 全部 Hooks
 * - Link / Financial Connections / Platform Pay / Checkout 方法（含降级行为观察）
 * - 非 Card 支付方式类型（SepaDebit / Ideal / AuBecsDebit，对照类型支持矩阵观察平铺透传行为）
 *
 * 未配置真实后端密钥时，接口调用返回结构化 StripeError（可在结果区观察），
 * 配置真实 client secret 后可走完整支付链路。
 */

import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AddressSheet,
  AddToWalletButton,
  AuBECSDebitForm,
  BillingDetails,
  CardBrand,
  CardField,
  CardFieldInput,
  CardForm,
  CardFormView,
  confirmLinkControllerSetupIntent,
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
  ConnectPaymentDetails,
  ConnectPayments,
  ConnectPayouts,
  AddressCollectionMode,
  CollectionMode,
  Constants,
  createCheckout,
  CustomerSheet,
  initLinkController,
  initStripe,
  isCardInWallet,
  loadConnectAndInitialize,
  NavigationBar,
  PaymentMethodMessagingElement,
  PaymentMethodMessagingElementStyle,
  PaymentSheet,
  PlatformPay,
  PlatformPayButton,
  presentLinkController,
  setFinancialConnectionsForceNativeFlow,
  StripeContainer,
  StripeProvider,
  useCheckout,
  useEmbeddedPaymentElement,
  useConfirmPayment,
  useConfirmSetupIntent,
  useFinancialConnectionsSheet,
  useLinkController,
  useOnramp,
  usePaymentSheet,
  usePlatformPay,
  useStripe,
} from '@stripe/stripe-react-native';
import type {
  CustomerSheetResult,
  IntentCreationCallbackParams,
} from '@stripe/stripe-react-native';

// 与原 example（example/src/screens/HomeScreen.tsx）一致的 Stripe 演示用测试密钥
// 2026-11-03 换成用户自己账号(51UXLDK...)的 pk, 配合用户 curl 建的 PaymentIntent 测 Card-12 完整链路
const PUBLISHABLE_KEY =
  'pk_test_51UXLDKDV8zdV6PUc8vJLRtsZtQ9RkTqAT7eQZrXTWl527wg4DVPM8zAp2eeXSagUHPTS5vaUQztEvO0r0KEgVeIe00EDyRaMaR';

const FALLBACK_PI_SECRET = 'pi_test_ohos_example_secret';
const FALLBACK_SI_SECRET = 'seti_test_ohos_example_secret';

// useEmbeddedPaymentElement 配置（模块级常量保证引用稳定）：
// 内联对象每次渲染产生新引用 → init effect 重跑 → 原生 notSupported emit
// loadingFailed → setLoadingError 再渲染 → 死循环刷日志（2026-11-04 修复）
const EMBEDDED_INTENT_CONFIG = {mode: {amount: 1000, currencyCode: 'usd'}};
const EMBEDDED_ELEMENT_CONFIGURATION = {merchantDisplayName: 'OHOS Example Merchant'};

function safeStringify(value: unknown): string {
  if (value === undefined) {
    return 'undefined';
  }
  if (value === null) {
    return 'null';
  }
  try {
    // Error（含嵌套在对象里的，如 loadingError）序列化为 {name,message}，
    // 否则 JSON.stringify 会得到 '{}'，message 被吞——THREW 观测必须可见
    return JSON.stringify(value, (_k, v) =>
      v instanceof Error ? {name: v.name, message: v.message} : v,
    );
  } catch (e) {
    return String(value);
  }
}

type RunFn = (name: string, fn: () => Promise<unknown>) => Promise<void>;

// RNOH 下未捕获的渲染错误会拆掉整棵 RN 树（全屏白屏）；用边界把 Connect 区
// 崩溃隔离成可见文本，保证后续用例可观测
class SectionErrorBoundary extends React.Component<
  {children: React.ReactNode},
  {error: Error | null}
> {
  state = {error: null as Error | null};

  static getDerivedStateFromError(error: Error) {
    return {error};
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>该区块渲染崩溃（已隔离）:</Text>
          <Text style={styles.resultText} testID="result-SectionError">
            {safeStringify(this.state.error)}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function ActionButton({
  method,
  onPress,
  disabled,
}: {
  method: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      testID={`test-${method}-btn`}
      accessibilityLabel={`test-${method}-btn`}
      style={[styles.button, disabled ? styles.buttonDisabled : null]}
      disabled={disabled}
      onPress={onPress}>
      <Text style={styles.buttonText}>Run {method}</Text>
    </TouchableOpacity>
  );
}

function ResultBlock({
  method,
  results,
}: {
  method: string;
  results: Record<string, string>;
}) {
  const text = results[method];
  if (text === undefined) {
    return null;
  }
  return (
    <View
      testID={`result-${method}-box`}
      style={styles.resultBox}
      accessibilityLabel={`result-${method}`}>
      <Text style={styles.resultLabel}>Result:</Text>
      <Text testID={`result-${method}`} style={styles.resultText}>
        {text}
      </Text>
    </View>
  );
}

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function SecretInput({
  label,
  testId,
  value,
  onChange,
}: {
  label: string;
  testId: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.inputRow}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        testID={testId}
        accessibilityLabel={testId}
        style={styles.input}
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="粘贴 client secret…"
      />
    </View>
  );
}

export function App(): JSX.Element {
  // StripeProvider 属性覆盖：stripeAccountId 开关（打开后 REST 请求携带
  // Stripe-Account 头，可用真实 key 观察子账号链路；演示值会导致结构化错误）
  const [useAccountId, setUseAccountId] = useState(false);
  return (
    <StripeProvider
      publishableKey={PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.stripe.react.native"
      urlScheme="stripe"
      stripeAccountId={useAccountId ? 'acct_demo_ohos' : undefined}
      threeDSecureParams={{timeout: 5}}
      setReturnUrlSchemeOnAndroid={false}>
      <TestScreen
        useAccountId={useAccountId}
        onToggleAccountId={() => setUseAccountId(v => !v)}
      />
    </StripeProvider>
  );
}

function TestScreen({
  useAccountId,
  onToggleAccountId,
}: {
  useAccountId: boolean;
  onToggleAccountId: () => void;
}): JSX.Element {
  const {
    createPaymentMethod,
    createToken,
    createTokenForCVCUpdate,
    confirmPayment,
    confirmSetupIntent,
    handleNextAction,
    handleNextActionForSetup,
    retrievePaymentIntent,
    retrieveSetupIntent,
    handleURLCallback,
    resetPaymentSheetCustomer,
    isPlatformPaySupported,
    createPlatformPayPaymentMethod,
    createPlatformPayToken,
    confirmPlatformPayPayment,
    confirmPlatformPaySetupIntent,
    updatePlatformPaySheet,
    dismissPlatformPay,
    openPlatformPaySetup,
    createRadarSession,
    canAddCardToWallet,
    collectBankAccountForPayment,
    collectBankAccountForSetup,
    collectBankAccountToken,
    collectFinancialConnectionsAccounts,
    verifyMicrodepositsForPayment,
    verifyMicrodepositsForSetup,
  } = useStripe();
  const {initPaymentSheet, presentPaymentSheet, confirmPaymentSheetPayment} =
    usePaymentSheet();
  // 其余公开 Hooks（对照 README Hooks 表逐个覆盖）
  const {confirmPayment: hookConfirmPayment} = useConfirmPayment();
  const {confirmSetupIntent: hookConfirmSetupIntent} = useConfirmSetupIntent();
  const {
    isPlatformPaySupported: hookIsPlatformPaySupported,
    createPlatformPayPaymentMethod: hookCreatePlatformPayPaymentMethod,
  } = usePlatformPay();
  const {
    collectFinancialConnectionsAccounts: hookCollectFinancialConnections,
    collectBankAccountToken: hookCollectBankAccountToken,
  } = useFinancialConnectionsSheet();
  const onramp = useOnramp();
  const linkController = useLinkController();
  // useEmbeddedPaymentElement（README Hooks 表第 10 个；鸿蒙原生降级：
  // createEmbeddedPaymentElement 返回 notSupported，loadingError 可观察）
  const embeddedPaymentElement = useEmbeddedPaymentElement(
    EMBEDDED_INTENT_CONFIG,
    EMBEDDED_ELEMENT_CONFIGURATION,
  );
  // Checkout（Private Preview）：enabled=false 时 status=idle，不触发网络
  const checkout = useCheckout({
    enabled: false,
    getConfiguration: async () => ({
      clientSecret: 'cos_test_ohos_example_secret',
      returnURL: 'stripe://stripe-redirect',
    }),
  });

  const [results, setResults] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [piSecret, setPiSecret] = useState(FALLBACK_PI_SECRET);
  const [siSecret, setSiSecret] = useState(FALLBACK_SI_SECRET);
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details | null>(
    null,
  );
  const [formDetails, setFormDetails] = useState<CardFormView.Details | null>(
    null,
  );
  const [becsDetails, setBecsDetails] = useState<string | null>(null);
  const [addressVisible, setAddressVisible] = useState(false);
  const [pmmeState, setPmmeState] = useState<string | null>(null);
  const [walletResult, setWalletResult] = useState<string | null>(null);
  const [connectEvent, setConnectEvent] = useState<string | null>(null);
  const [connectVisible, setConnectVisible] = useState(false);
  const intentCreationCbRef = useRef<
    ((result: IntentCreationCallbackParams) => void) | null
  >(null);
  // confirmationTokenConfirmHandler 挂起的回传回调
  //（PaymentSheet 第二条双向回调链路，与 confirmHandler 二选一）
  const confirmationTokenCreationCbRef = useRef<
    ((result: IntentCreationCallbackParams) => void) | null
  >(null);
  // CardField / CardForm ref 命令（focus/blur/clear，经 CommandReceiver 透传原生）
  const cardFieldRef = useRef<CardFieldInput.Methods>(null);
  const cardFormRef = useRef<CardFormView.Methods>(null);

  // 组件属性覆盖用状态
  const [cardDisabled, setCardDisabled] = useState(false);
  const [cardFullDetails, setCardFullDetails] = useState(false);
  const [formDisabled, setFormDisabled] = useState(false);
  const [platformPayDisabled, setPlatformPayDisabled] = useState(false);
  const [customerSheetVisible, setCustomerSheetVisible] = useState(false);
  // 默认 payments（内联 webview）：onboarding 是全屏 Modal,若默认打开会把
  // 视图切换按钮和外层 NavigationBar 全部遮住,payments/payouts/details 永远不可达
  const [connectView, setConnectView] = useState<
    'onboarding' | 'payments' | 'payouts' | 'details'
  >('payments');
  // setOrderTracking 注册的 completion（鸿蒙无 Apple Pay 流程，不会被原生调用）
  const orderTrackingCompletionRef = useRef<
    ((
      orderIdentifier: string,
      orderTypeIdentifier: string,
      authenticationToken: string,
      webServiceUrl: string,
    ) => void) | null
  >(null);

  const run: RunFn = async (name, fn) => {
    setBusy(name);
    try {
      const res = await fn();
      setResults(prev => ({...prev, [name]: safeStringify(res)}));
    } catch (e) {
      setResults(prev => ({...prev, [name]: `THREW: ${safeStringify(e)}`}));
    } finally {
      setBusy(null);
    }
  };

  const billingDetails: BillingDetails = {
    email: 'email@stripe.com',
    phone: '+48888000888',
    address: {
      city: 'Houston',
      country: 'US',
      line1: '1459 Circle Drive',
      line2: 'Texas',
      postalCode: '77063',
      state: 'TX',
    },
  };

  const connectInstance = useMemo(
    () =>
      loadConnectAndInitialize({
        publishableKey: PUBLISHABLE_KEY,
        fetchClientSecret: async () => 'cs_test_ohos_account_session',
      }),
    [],
  );

  // deep link 链路：UIAbility onNewWant → RNInstance.emitDeviceEvent('url') →
  // JS 监听 → handleURLCallback → 原生 DeepLinkHelper（3DS/Connect 回跳）
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({url}) => {
      handleURLCallback(url)
        .then(handled => {
          setResults(prev => ({
            ...prev,
            deepLink: `${url} → handleURLCallback=${String(handled)}`,
          }));
        })
        .catch((e: unknown) => {
          setResults(prev => ({
            ...prev,
            deepLink: `${url} → error=${safeStringify(e)}`,
          }));
        });
    });
    return () => subscription.remove();
  }, [handleURLCallback]);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text testID="app-title" accessibilityLabel="app-title" style={styles.appTitle}>
          Stripe React Native OHOS Example
        </Text>

        {/* ============ Env & Init ============ */}
        <Section title="环境与初始化">
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>Constants (getConstants):</Text>
            <Text testID="result-Constants" style={styles.resultText}>
              {safeStringify(Constants)}
            </Text>
          </View>
          <ActionButton
            method="initStripe"
            onPress={() =>
              run('initStripe', () =>
                initStripe({
                  publishableKey: PUBLISHABLE_KEY,
                  urlScheme: 'stripe',
                  stripeAccountId: useAccountId ? 'acct_demo_ohos' : undefined,
                }),
              )
            }
          />
          <ResultBlock method="initStripe" results={results} />
          <TouchableOpacity
            testID="test-toggleAccountId-btn"
            accessibilityLabel="test-toggleAccountId-btn"
            style={styles.button}
            onPress={onToggleAccountId}>
            <Text style={styles.buttonText}>
              stripeAccountId: {useAccountId ? 'acct_demo_ohos（开）' : 'off'}
            </Text>
          </TouchableOpacity>
          <ActionButton
            method="isPlatformPaySupported"
            onPress={() =>
              run('isPlatformPaySupported', () =>
                isPlatformPaySupported({googlePay: {testEnv: true}}),
              )
            }
          />
          <ResultBlock method="isPlatformPaySupported" results={results} />
          <ActionButton
            method="canAddCardToWallet"
            onPress={() =>
              run('canAddCardToWallet', () =>
                canAddCardToWallet({
                  primaryAccountIdentifier: 'V-123',
                  cardLastFour: '4242',
                  cardBrand: 'visa',
                  testEnv: true,
                }),
              )
            }
          />
          <ResultBlock method="canAddCardToWallet" results={results} />
          <ActionButton
            method="isCardInWallet"
            onPress={() =>
              run('isCardInWallet', () =>
                isCardInWallet({cardLastFour: '4242'}),
              )
            }
          />
          <ResultBlock method="isCardInWallet" results={results} />
          <ActionButton
            method="createRadarSession"
            onPress={() => run('createRadarSession', () => createRadarSession())}
          />
          <ResultBlock method="createRadarSession" results={results} />
          <ActionButton
            method="handleURLCallback"
            onPress={() =>
              run('handleURLCallback', () =>
                handleURLCallback('stripe://example-deep-link-callback'),
              )
            }
          />
          <ResultBlock method="handleURLCallback" results={results} />
          <ResultBlock method="deepLink" results={results} />
          <ActionButton
            method="setFinancialConnectionsForceNativeFlow"
            onPress={() =>
              run('setFinancialConnectionsForceNativeFlow', () =>
                setFinancialConnectionsForceNativeFlow(false),
              )
            }
          />
          <ResultBlock
            method="setFinancialConnectionsForceNativeFlow"
            results={results}
          />
        </Section>

        {/* ============ Secrets ============ */}
        <Section title="密钥输入（真实后端生成的 client secret）">
          <SecretInput
            label="PaymentIntent"
            testId="input-payment-intent-secret"
            value={piSecret}
            onChange={setPiSecret}
          />
          <SecretInput
            label="SetupIntent"
            testId="input-setup-intent-secret"
            value={siSecret}
            onChange={setSiSecret}
          />
        </Section>

        {/* ============ CardField ============ */}
        <Section title="CardField 组件与核心支付">
          <TouchableOpacity
            testID="test-toggleCardDisabled-btn"
            accessibilityLabel="test-toggleCardDisabled-btn"
            style={styles.button}
            onPress={() => setCardDisabled(v => !v)}>
            <Text style={styles.buttonText}>
              CardField disabled: {String(cardDisabled)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="test-toggleCardFullDetails-btn"
            accessibilityLabel="test-toggleCardFullDetails-btn"
            style={styles.button}
            onPress={() => setCardFullDetails(v => !v)}>
            <Text style={styles.buttonText}>
              dangerouslyGetFullCardDetails: {String(cardFullDetails)}（PCI 警告）
            </Text>
          </TouchableOpacity>
          <View style={styles.stripeContainerWrap}>
            <StripeContainer
              testID="stripe-container"
              keyboardShouldPersistTaps={true}
              style={styles.stripeContainerWrap}>
              <CardField
                ref={cardFieldRef}
                testID="stripe-card-field"
                autofocus={false}
                postalCodeEnabled={true}
                countryCode="US"
                disabled={cardDisabled}
                cardStyle={styles.cardFieldStyle}
                placeholders={{
                  number: '4242 4242 4242 4242',
                  expiration: 'MM/YY',
                  cvc: 'CVC',
                  postalCode: 'ZIP',
                }}
                preferredNetworks={[CardBrand.Visa, CardBrand.Mastercard]}
                onBehalfOf="acct_demo_ohos"
                dangerouslyGetFullCardDetails={cardFullDetails}
                style={styles.cardField}
                onCardChange={setCardDetails}
                onFocus={focusedField =>
                  setResults(prev => ({
                    ...prev,
                    CardFieldFocus: safeStringify(focusedField),
                  }))
                }
                onBlur={() =>
                  setResults(prev => ({
                    ...prev,
                    CardFieldBlur: 'onBlur',
                  }))
                }
              />
            </StripeContainer>
          </View>
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>CardField 状态:</Text>
            <Text testID="result-CardField" style={styles.resultText}>
              {safeStringify(cardDetails)}
            </Text>
          </View>
          {/* ref 命令：focus 触发原生聚焦并回调 onFocus；clear 清空卡号（CardField 状态区可观察） */}
          <ActionButton
            method="CardFieldFocus"
            onPress={() => cardFieldRef.current?.focus()}
          />
          <ResultBlock method="CardFieldFocus" results={results} />
          <ActionButton
            method="CardFieldBlur"
            onPress={() => cardFieldRef.current?.blur()}
          />
          <ResultBlock method="CardFieldBlur" results={results} />
          <ActionButton
            method="CardFieldClear"
            onPress={() => cardFieldRef.current?.clear()}
          />
          <ActionButton
            method="createPaymentMethod"
            onPress={() =>
              run('createPaymentMethod', () =>
                createPaymentMethod({
                  paymentMethodType: 'Card',
                  paymentMethodData: {billingDetails},
                }),
              )
            }
          />
          <ResultBlock method="createPaymentMethod" results={results} />
          {/* 非 Card 支付方式类型（对照 README 类型支持矩阵）：
              SepaDebit 平铺透传可用；Ideal 参数名不匹配（不传可用）；
              AuBecsDebit formDetails 嵌套对象被原生丢弃（预期结构化报错） */}
          <ActionButton
            method="createPaymentMethod-SepaDebit"
            onPress={() =>
              run('createPaymentMethod-SepaDebit', () =>
                createPaymentMethod({
                  paymentMethodType: 'SepaDebit',
                  paymentMethodData: {
                    iban: 'DE89370400440532013000',
                    billingDetails,
                  },
                }),
              )
            }
          />
          <ResultBlock method="createPaymentMethod-SepaDebit" results={results} />
          <ActionButton
            method="createPaymentMethod-Ideal"
            onPress={() =>
              run('createPaymentMethod-Ideal', () =>
                createPaymentMethod({
                  paymentMethodType: 'Ideal',
                  paymentMethodData: {billingDetails},
                }),
              )
            }
          />
          <ResultBlock method="createPaymentMethod-Ideal" results={results} />
          <ActionButton
            method="createPaymentMethod-AuBecsDebit"
            onPress={() =>
              run('createPaymentMethod-AuBecsDebit', () =>
                createPaymentMethod({
                  paymentMethodType: 'AuBecsDebit',
                  paymentMethodData: {
                    formDetails: {
                      bsbNumber: '000000',
                      accountNumber: '000123456',
                      name: 'Test User',
                      email: 'email@stripe.com',
                    },
                  },
                }),
              )
            }
          />
          <ResultBlock
            method="createPaymentMethod-AuBecsDebit"
            results={results}
          />
          <ActionButton
            method="createToken-Card"
            onPress={() =>
              run('createToken-Card', () =>
                createToken({type: 'Card', name: 'Test User'}),
              )
            }
          />
          <ResultBlock method="createToken-Card" results={results} />
          <ActionButton
            method="createToken-Pii"
            onPress={() =>
              run('createToken-Pii', () =>
                createToken({type: 'Pii', personalId: '123456789'}),
              )
            }
          />
          <ResultBlock method="createToken-Pii" results={results} />
          <ActionButton
            method="createToken-BankAccount"
            onPress={() =>
              run('createToken-BankAccount', () =>
                createToken({
                  type: 'BankAccount',
                  accountHolderName: 'Test User',
                  accountHolderType: 'Individual',
                  accountNumber: '000123456789',
                  country: 'US',
                  currency: 'usd',
                  routingNumber: '110000000',
                }),
              )
            }
          />
          <ResultBlock method="createToken-BankAccount" results={results} />
          <ActionButton
            method="createTokenForCVCUpdate"
            onPress={() =>
              run('createTokenForCVCUpdate', () =>
                createTokenForCVCUpdate('424'),
              )
            }
          />
          <ResultBlock method="createTokenForCVCUpdate" results={results} />
          <ActionButton
            method="confirmPayment"
            onPress={() =>
              run('confirmPayment', () =>
                confirmPayment(piSecret, {
                  paymentMethodType: 'Card',
                  paymentMethodData: {billingDetails},
                }),
              )
            }
          />
          <ResultBlock method="confirmPayment" results={results} />
          <ActionButton
            method="retrievePaymentIntent"
            onPress={() =>
              run('retrievePaymentIntent', () =>
                retrievePaymentIntent(piSecret),
              )
            }
          />
          <ResultBlock method="retrievePaymentIntent" results={results} />
          <ActionButton
            method="handleNextAction"
            onPress={() =>
              run('handleNextAction', () =>
                handleNextAction(piSecret, 'stripe://stripe-redirect'),
              )
            }
          />
          <ResultBlock method="handleNextAction" results={results} />
        </Section>

        {/* ============ CardForm ============ */}
        <Section title="CardForm 组件">
          <TouchableOpacity
            testID="test-toggleFormDisabled-btn"
            accessibilityLabel="test-toggleFormDisabled-btn"
            style={styles.button}
            onPress={() => setFormDisabled(v => !v)}>
            <Text style={styles.buttonText}>
              CardForm disabled: {String(formDisabled)}
            </Text>
          </TouchableOpacity>
          <CardForm
            ref={cardFormRef}
            testID="stripe-card-form"
            autofocus={false}
            disabled={formDisabled}
            cardStyle={styles.cardFieldStyle}
            placeholders={{
              number: '4242 4242 4242 4242',
              expiration: 'MM/YY',
              cvc: 'CVC',
              postalCode: 'ZIP',
            }}
            defaultValues={{countryCode: 'US'}}
            preferredNetworks={[CardBrand.Visa]}
            dangerouslyGetFullCardDetails={false}
            style={styles.cardForm}
            onFormComplete={setFormDetails}
          />
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>CardForm 状态:</Text>
            <Text testID="result-CardForm" style={styles.resultText}>
              {safeStringify(formDetails)}
            </Text>
          </View>
          {/* ref 命令：focus/blur 透传原生（CardForm 仅支持这两条命令） */}
          <ActionButton
            method="CardFormFocus"
            onPress={() => cardFormRef.current?.focus()}
          />
          <ActionButton
            method="CardFormBlur"
            onPress={() => cardFormRef.current?.blur()}
          />
        </Section>

        {/* ============ SetupIntent ============ */}
        <Section title="SetupIntent（保存支付方式）">
          <ActionButton
            method="confirmSetupIntent"
            onPress={() =>
              run('confirmSetupIntent', () =>
                confirmSetupIntent(siSecret, {
                  paymentMethodType: 'Card',
                  paymentMethodData: {billingDetails},
                }),
              )
            }
          />
          <ResultBlock method="confirmSetupIntent" results={results} />
          <ActionButton
            method="retrieveSetupIntent"
            onPress={() =>
              run('retrieveSetupIntent', () => retrieveSetupIntent(siSecret))
            }
          />
          <ResultBlock method="retrieveSetupIntent" results={results} />
          <ActionButton
            method="handleNextActionForSetup"
            onPress={() =>
              run('handleNextActionForSetup', () =>
                handleNextActionForSetup(siSecret, 'stripe://stripe-redirect'),
              )
            }
          />
          <ResultBlock method="handleNextActionForSetup" results={results} />
        </Section>

        {/* ============ PaymentSheet ============ */}
        <Section title="PaymentSheet（custom flow）">
          <ActionButton
            method="initPaymentSheet"
            onPress={() =>
              run('initPaymentSheet', () =>
                initPaymentSheet({
                  customFlow: true,
                  merchantDisplayName: 'OHOS Example Merchant',
                  intentConfiguration: {
                    mode: {amount: 1000, currencyCode: 'usd'},
                    confirmHandler: (
                      paymentMethod,
                      shouldSavePaymentMethod,
                      intentCreationCallback,
                    ) => {
                      intentCreationCbRef.current = intentCreationCallback;
                      setResults(prev => ({
                        ...prev,
                        initPaymentSheet: `confirmHandler: pm=${
                          paymentMethod.id
                        } save=${String(shouldSavePaymentMethod)}（已挂起，自动回传中…）`,
                      }));
                      // 收银台为 isModal 全屏 dialog，挂起期间页面回传按钮不可达；
                      // 模拟真实商户后端 1.5s 后自动回传（手动按钮保留，sheet 关闭后可观察）
                      setTimeout(() => {
                        if (intentCreationCbRef.current !== intentCreationCallback) {
                          return;
                        }
                        intentCreationCbRef.current = null;
                        intentCreationCallback({clientSecret: piSecret});
                        setResults(prev => ({
                          ...prev,
                          intentCreationCallback: `已自动回传 clientSecret=${piSecret}`,
                        }));
                      }, 1500);
                    },
                  },
                }),
              )
            }
          />
          <ResultBlock method="initPaymentSheet" results={results} />
          <ActionButton
            method="intentCreationCallback"
            onPress={() => {
              const cb = intentCreationCbRef.current;
              if (cb === null) {
                setResults(prev => ({
                  ...prev,
                  intentCreationCallback: '无挂起的 confirmHandler 回调',
                }));
                return;
              }
              cb({clientSecret: piSecret});
              intentCreationCbRef.current = null;
              setResults(prev => ({
                ...prev,
                intentCreationCallback: `已回传 clientSecret=${piSecret}`,
              }));
            }}
          />
          <ResultBlock method="intentCreationCallback" results={results} />
          <ActionButton
            method="initPaymentSheet-confirmationToken"
            onPress={() =>
              run('initPaymentSheet-confirmationToken', () =>
                initPaymentSheet({
                  customFlow: true,
                  merchantDisplayName: 'OHOS Example Merchant',
                  intentConfiguration: {
                    mode: {amount: 1000, currencyCode: 'usd'},
                    paymentMethodTypes: ['card'],
                    onBehalfOf: 'acct_demo_ohos',
                    // confirmHandler 与 confirmationTokenConfirmHandler 二选一
                    confirmationTokenConfirmHandler: (
                      confirmationToken,
                      intentCreationCallback,
                    ) => {
                      confirmationTokenCreationCbRef.current =
                        intentCreationCallback;
                      setResults(prev => ({
                        ...prev,
                        'initPaymentSheet-confirmationToken': `confirmationTokenConfirmHandler: id=${
                          confirmationToken.id
                        }（已挂起，自动回传中…）`,
                      }));
                      // 同 confirmHandler：挂起期间 isModal 收银台挡住页面按钮，自动回传
                      setTimeout(() => {
                        if (confirmationTokenCreationCbRef.current !== intentCreationCallback) {
                          return;
                        }
                        confirmationTokenCreationCbRef.current = null;
                        intentCreationCallback({clientSecret: piSecret});
                        setResults(prev => ({
                          ...prev,
                          confirmationTokenCreationCallback: `已自动回传 clientSecret=${piSecret}`,
                        }));
                      }, 1500);
                    },
                  },
                }),
              )
            }
          />
          <ResultBlock
            method="initPaymentSheet-confirmationToken"
            results={results}
          />
          <ActionButton
            method="confirmationTokenCreationCallback"
            onPress={() => {
              const cb = confirmationTokenCreationCbRef.current;
              if (cb === null) {
                setResults(prev => ({
                  ...prev,
                  confirmationTokenCreationCallback:
                    '无挂起的 confirmationTokenConfirmHandler 回调',
                }));
                return;
              }
              cb({clientSecret: piSecret});
              confirmationTokenCreationCbRef.current = null;
              setResults(prev => ({
                ...prev,
                confirmationTokenCreationCallback: `已回传 clientSecret=${piSecret}`,
              }));
            }}
          />
          <ResultBlock
            method="confirmationTokenCreationCallback"
            results={results}
          />
          <ActionButton
            method="presentPaymentSheet"
            onPress={() =>
              // PresentOptions.timeout：自绘实现未读取，传入被忽略（对照 README）
              run('presentPaymentSheet', () =>
                presentPaymentSheet({timeout: 30000}),
              )
            }
          />
          <ResultBlock method="presentPaymentSheet" results={results} />
          <ActionButton
            method="confirmPaymentSheetPayment"
            onPress={() =>
              run('confirmPaymentSheetPayment', () =>
                confirmPaymentSheetPayment(),
              )
            }
          />
          <ResultBlock method="confirmPaymentSheetPayment" results={results} />
          <ActionButton
            method="resetPaymentSheetCustomer"
            onPress={() =>
              run('resetPaymentSheetCustomer', () =>
                resetPaymentSheetCustomer(),
              )
            }
          />
          <ResultBlock method="resetPaymentSheetCustomer" results={results} />
          <ActionButton
            method="initPaymentSheet-default"
            onPress={() =>
              run('initPaymentSheet-default', () =>
                initPaymentSheet({
                  merchantDisplayName: 'OHOS Example Merchant',
                  paymentIntentClientSecret: piSecret,
                  customerId: 'cus_ohos_example',
                  customerEphemeralKeySecret: 'ek_test_ohos_example',
                  allowsDelayedPaymentMethods: true,
                  returnURL: 'stripe://stripe-redirect',
                  primaryButtonLabel: '支付 $10.00',
                  defaultBillingDetails: billingDetails,
                  defaultShippingDetails: {
                    name: 'Test User',
                    phone: '+48888000888',
                    address: {
                      city: 'Houston',
                      country: 'US',
                      line1: '1459 Circle Drive',
                      line2: 'Texas',
                      postalCode: '77063',
                      state: 'TX',
                    },
                  },
                  billingDetailsCollectionConfiguration: {
                    name: CollectionMode.NEVER,
                    phone: CollectionMode.NEVER,
                    email: CollectionMode.AUTOMATIC,
                    address: AddressCollectionMode.NEVER,
                    // 预填值是否附加到支付方式（鸿蒙存储未消费，传入演示透传）
                    attachDefaultsToPaymentMethod: false,
                  },
                  style: 'alwaysLight',
                  appearance: {shapes: {borderRadius: 8, borderWidth: 1}},
                  paymentMethodOrder: ['card'],
                  allowsRemovalOfLastSavedPaymentMethod: false,
                  removeSavedPaymentMethodMessage: '删除已保存的支付方式',
                  opensCardScannerAutomatically: false,
                  termsDisplay: {card: PaymentSheet.TermsDisplay.NEVER},
                  link: {display: PaymentSheet.LinkDisplay.AUTOMATIC},
                  applePay: {
                    merchantCountryCode: 'US',
                    buttonType: PlatformPay.ButtonType.Buy,
                    cartItems: [
                      {
                        paymentType: PlatformPay.PaymentType.Immediate,
                        label: 'Demo Item',
                        amount: '10.00',
                      },
                    ],
                  },
                  googlePay: {
                    merchantCountryCode: 'US',
                    currencyCode: 'usd',
                    testEnv: true,
                    amount: '10.00',
                    label: 'Demo Item',
                    buttonType: PlatformPay.ButtonType.Buy,
                  },
                  // 以下均为鸿蒙忽略参数（对照 SetupParams 表 No 项，传入仅演示透传降级）
                  preferredNetworks: [CardBrand.Visa, CardBrand.Mastercard],
                  paymentMethodLayout:
                    PaymentSheet.PaymentMethodLayout.Horizontal,
                  // Allowed 变体（与 CustomerSheet 处的 All 变体互补，覆盖联合类型）
                  cardBrandAcceptance: {
                    filter: PaymentSheet.CardBrandAcceptanceFilter.Allowed,
                    brands: [
                      PaymentSheet.CardBrandCategory.Visa,
                      PaymentSheet.CardBrandCategory.Mastercard,
                    ],
                  },
                  cardFundingFiltering: {
                    allowedCardFundingTypes: [
                      PaymentSheet.CardFundingType.Debit,
                      PaymentSheet.CardFundingType.Credit,
                    ],
                  },
                  customPaymentMethodConfiguration: {
                    customPaymentMethods: [
                      {
                        id: 'cpmt_ohos_example',
                        subtitle: '演示自定义支付方式',
                        disableBillingDetailCollection: true,
                      },
                    ],
                    confirmCustomPaymentMethodCallback: (
                      customPaymentMethod,
                      _billingDetails,
                      resultHandler,
                    ) => {
                      // 自绘收银台不渲染自定义支付方式，该回调不会被原生触发
                      setResults(prev => ({
                        ...prev,
                        'initPaymentSheet-default': `confirmCustomPaymentMethodCallback: ${customPaymentMethod.id}（自绘收银台不渲染，不会被调用）`,
                      }));
                      resultHandler({
                        status:
                          PaymentSheet.CustomPaymentMethodResultStatus.Failed,
                        error: 'demo: custom payment method not rendered',
                      });
                    },
                  },
                }),
              )
            }
          />
          <ResultBlock method="initPaymentSheet-default" results={results} />
          <ActionButton
            method="initPaymentSheet-customerSession"
            onPress={() =>
              run('initPaymentSheet-customerSession', () =>
                initPaymentSheet({
                  merchantDisplayName: 'OHOS Example Merchant',
                  paymentIntentClientSecret: piSecret,
                  customerId: 'cus_ohos_example',
                  // CustomerSession 路径（与 customerEphemeralKeySecret 类型互斥）：
                  // 自绘收银台未接入已保存支付方式列表，参数存储未消费
                  customerSessionClientSecret: 'cuss_test_ohos_example',
                }),
              )
            }
          />
          <ResultBlock
            method="initPaymentSheet-customerSession"
            results={results}
          />
          <ActionButton
            method="initPaymentSheet-setupIntent"
            onPress={() =>
              run('initPaymentSheet-setupIntent', () =>
                initPaymentSheet({
                  merchantDisplayName: 'OHOS Example Merchant',
                  setupIntentClientSecret: siSecret,
                  primaryButtonLabel: '保存支付方式',
                  returnURL: 'stripe://stripe-redirect',
                }),
              )
            }
          />
          <ResultBlock method="initPaymentSheet-setupIntent" results={results} />
          <ActionButton
            method="presentPaymentSheet-default"
            onPress={() =>
              run('presentPaymentSheet-default', () => presentPaymentSheet())
            }
          />
          <ResultBlock method="presentPaymentSheet-default" results={results} />
        </Section>

        {/* ============ CustomerSheet ============ */}
        <Section title="CustomerSheet（支付方式管理）">
          <ActionButton
            method="initCustomerSheet"
            onPress={() =>
              run('initCustomerSheet', () =>
                CustomerSheet.initialize({
                  setupIntentClientSecret: siSecret,
                  customerEphemeralKeySecret: 'ek_test_ohos_example',
                  customerId: 'cus_ohos_example',
                  returnURL: 'stripe://stripe-redirect',
                  merchantDisplayName: 'OHOS Test Merchant',
                  style: 'alwaysLight',
                  appearance: {shapes: {borderRadius: 8, borderWidth: 1}},
                  // 以下为鸿蒙未消费参数（对照 CustomerSheetProps 表 No 项，传入仅演示透传降级）
                  headerTextForSelectionScreen: '选择支付方式',
                  defaultBillingDetails: billingDetails,
                  billingDetailsCollectionConfiguration: {
                    name: CollectionMode.NEVER,
                    phone: CollectionMode.NEVER,
                    email: CollectionMode.AUTOMATIC,
                    address: AddressCollectionMode.NEVER,
                    // 预填值是否附加到支付方式（鸿蒙存储未消费，传入演示透传）
                    attachDefaultsToPaymentMethod: false,
                  },
                  allowsRemovalOfLastSavedPaymentMethod: false,
                  cardBrandAcceptance: {
                    filter: PaymentSheet.CardBrandAcceptanceFilter.All,
                  },
                  applePayEnabled: false,
                  googlePayEnabled: false,
                  preferredNetworks: [CardBrand.Visa],
                  opensCardScannerAutomatically: false,
                  removeSavedPaymentMethodMessage: '删除已保存的支付方式',
                }),
              )
            }
          />
          <ResultBlock method="initCustomerSheet" results={results} />
          <ActionButton
            method="presentCustomerSheet"
            onPress={() =>
              run('presentCustomerSheet', () =>
                CustomerSheet.present({
                  presentationStyle: 'popover',
                  animationStyle: 'slide',
                  timeout: 30,
                }),
              )
            }
          />
          <ResultBlock method="presentCustomerSheet" results={results} />
          <ActionButton
            method="retrieveCustomerSheetPaymentOptionSelection"
            onPress={() =>
              run(
                'retrieveCustomerSheetPaymentOptionSelection',
                () => CustomerSheet.retrievePaymentOptionSelection(),
              )
            }
          />
          <ResultBlock
            method="retrieveCustomerSheetPaymentOptionSelection"
            results={results}
          />
          <ActionButton
            method="initCustomerSheetAdapter"
            onPress={() =>
              run('initCustomerSheetAdapter', () =>
                CustomerSheet.initialize({
                  customerId: 'cus_ohos_example',
                  customerEphemeralKeySecret: 'ek_test_ohos_example',
                  setupIntentClientSecret: siSecret,
                  customerAdapter: {
                    // CustomerAdapter 六个回调（×6 双向回调演示）
                    fetchPaymentMethods: async () => [],
                    attachPaymentMethod: async (paymentMethodId: string) => ({
                      id: paymentMethodId,
                    }),
                    detachPaymentMethod: async (paymentMethodId: string) => ({
                      id: paymentMethodId,
                    }),
                    setSelectedPaymentOption: async () => undefined,
                    fetchSelectedPaymentOption: async () => null,
                    setupIntentClientSecretForCustomerAttach: async () =>
                      siSecret,
                  },
                }),
              )
            }
          />
          <ResultBlock method="initCustomerSheetAdapter" results={results} />
          <ActionButton
            method="initCustomerSheetSession"
            onPress={() =>
              run('initCustomerSheetSession', () =>
                CustomerSheet.initialize({
                  // CustomerSession 路径：intentConfiguration + clientSecretProvider（×2 双向回调演示）
                  intentConfiguration: {
                    paymentMethodTypes: ['us_bank_account', 'card'],
                  },
                  clientSecretProvider: {
                    provideSetupIntentClientSecret: async () => siSecret,
                    provideCustomerSessionClientSecret: async () => ({
                      customerId: 'cus_ohos_example',
                      clientSecret: 'cuss_test_ohos_example',
                    }),
                  },
                }),
              )
            }
          />
          <ResultBlock method="initCustomerSheetSession" results={results} />
          <TouchableOpacity
            testID="test-toggleCustomerSheetComponent-btn"
            accessibilityLabel="test-toggleCustomerSheetComponent-btn"
            style={styles.button}
            onPress={() => setCustomerSheetVisible(v => !v)}>
            <Text style={styles.buttonText}>
              {customerSheetVisible ? '关闭' : '打开'} CustomerSheet 组件形态
            </Text>
          </TouchableOpacity>
          <CustomerSheet.Component
            visible={customerSheetVisible}
            customerId="cus_ohos_example"
            customerEphemeralKeySecret="ek_test_ohos_example"
            setupIntentClientSecret={siSecret}
            merchantDisplayName="OHOS Test Merchant"
            style="alwaysLight"
            appearance={{shapes: {borderRadius: 8, borderWidth: 1}}}
            returnURL="stripe://stripe-redirect"
            onResult={(result: CustomerSheetResult) => {
              setResults(prev => ({
                ...prev,
                CustomerSheetComponent: safeStringify(result),
              }));
              setCustomerSheetVisible(false);
            }}
          />
          <ResultBlock method="CustomerSheetComponent" results={results} />
        </Section>

        {/* ============ Platform Pay ============ */}
        <Section title="Platform Pay（鸿蒙降级：结构化 notSupported）">
          <TouchableOpacity
            testID="test-togglePlatformPayDisabled-btn"
            accessibilityLabel="test-togglePlatformPayDisabled-btn"
            style={styles.button}
            onPress={() => setPlatformPayDisabled(v => !v)}>
            <Text style={styles.buttonText}>
              PlatformPayButton disabled: {String(platformPayDisabled)}
            </Text>
          </TouchableOpacity>
          <PlatformPayButton
            testID="stripe-platform-pay-button"
            type={PlatformPay.ButtonType.Buy}
            appearance={PlatformPay.ButtonStyle.Automatic}
            borderRadius={8}
            style={styles.platformPayButton}
            disabled={platformPayDisabled}
            onPress={() =>
              setResults(prev => ({
                ...prev,
                PlatformPayButton: 'PlatformPayButton 按下（鸿蒙为占位降级按钮）',
              }))
            }
            onShippingMethodSelected={event =>
              setResults(prev => ({
                ...prev,
                PlatformPayButton: `onShippingMethodSelected: ${safeStringify(event)}`,
              }))
            }
            onShippingContactSelected={event =>
              setResults(prev => ({
                ...prev,
                PlatformPayButton: `onShippingContactSelected: ${safeStringify(event)}`,
              }))
            }
            onCouponCodeEntered={event =>
              setResults(prev => ({
                ...prev,
                PlatformPayButton: `onCouponCodeEntered: ${safeStringify(event)}`,
              }))
            }
            setOrderTracking={completion => {
              // 鸿蒙无 Apple Pay 流程，completion 不会被原生调用，仅演示注册
              orderTrackingCompletionRef.current = completion;
              setResults(prev => ({
                ...prev,
                PlatformPayButton: 'setOrderTracking 已注册（无钱包流程，不触发）',
              }));
            }}
          />
          <ResultBlock method="PlatformPayButton" results={results} />
          <ActionButton
            method="createPlatformPayPaymentMethod"
            onPress={() =>
              run('createPlatformPayPaymentMethod', () =>
                createPlatformPayPaymentMethod({}),
              )
            }
          />
          <ResultBlock method="createPlatformPayPaymentMethod" results={results} />
          <ActionButton
            method="createPlatformPayToken"
            onPress={() =>
              run('createPlatformPayToken', () => createPlatformPayToken({}))
            }
          />
          <ResultBlock method="createPlatformPayToken" results={results} />
          <ActionButton
            method="confirmPlatformPayPayment"
            onPress={() =>
              run('confirmPlatformPayPayment', () =>
                confirmPlatformPayPayment(piSecret, {}),
              )
            }
          />
          <ResultBlock method="confirmPlatformPayPayment" results={results} />
          <ActionButton
            method="confirmPlatformPaySetupIntent"
            onPress={() =>
              run('confirmPlatformPaySetupIntent', () =>
                confirmPlatformPaySetupIntent(siSecret, {}),
              )
            }
          />
          <ResultBlock method="confirmPlatformPaySetupIntent" results={results} />
          <ActionButton
            method="updatePlatformPaySheet"
            onPress={() =>
              run('updatePlatformPaySheet', () =>
                updatePlatformPaySheet({
                  applePay: {
                    cartItems: [
                      {
                        paymentType: PlatformPay.PaymentType.Immediate,
                        label: 'Demo Item',
                        amount: '10.00',
                      },
                    ],
                    shippingMethods: [],
                    errors: [],
                  },
                }),
              )
            }
          />
          <ResultBlock method="updatePlatformPaySheet" results={results} />
          <ActionButton
            method="dismissPlatformPay"
            onPress={() =>
              run('dismissPlatformPay', () => dismissPlatformPay())
            }
          />
          <ResultBlock method="dismissPlatformPay" results={results} />
          <ActionButton
            method="openPlatformPaySetup"
            onPress={() =>
              run('openPlatformPaySetup', () => openPlatformPaySetup())
            }
          />
          <ResultBlock method="openPlatformPaySetup" results={results} />
        </Section>

        {/* ============ Bank & Financial Connections ============ */}
        <Section title="银行账户与 Financial Connections">
          <ActionButton
            method="collectBankAccountForPayment"
            onPress={() =>
              run('collectBankAccountForPayment', () =>
                collectBankAccountForPayment(piSecret, {
                  paymentMethodType: 'USBankAccount',
                  paymentMethodData: {
                    // Stripe 测试模式专用银行账号（无 FC 托管 UI，REST 直建 PM 必填）
                    accountNumber: '000123456789',
                    routingNumber: '110000000',
                    accountHolderType: 'individual' as const,
                    billingDetails: {name: 'Test User', email: 'a@b.com'},
                  },
                }),
              )
            }
          />
          <ResultBlock method="collectBankAccountForPayment" results={results} />
          <ActionButton
            method="collectBankAccountForSetup"
            onPress={() =>
              run('collectBankAccountForSetup', () =>
                collectBankAccountForSetup(siSecret, {
                  paymentMethodType: 'USBankAccount',
                  paymentMethodData: {
                    // Stripe 测试模式专用银行账号（无 FC 托管 UI，REST 直建 PM 必填）
                    accountNumber: '000123456789',
                    routingNumber: '110000000',
                    accountHolderType: 'individual' as const,
                    billingDetails: {name: 'Test User', email: 'a@b.com'},
                  },
                }),
              )
            }
          />
          <ResultBlock method="collectBankAccountForSetup" results={results} />
          <ActionButton
            method="collectBankAccountToken"
            onPress={() =>
              run('collectBankAccountToken', () =>
                collectBankAccountToken(piSecret),
              )
            }
          />
          <ResultBlock method="collectBankAccountToken" results={results} />
          <ActionButton
            method="collectFinancialConnectionsAccounts"
            onPress={() =>
              run('collectFinancialConnectionsAccounts', () =>
                collectFinancialConnectionsAccounts(piSecret),
              )
            }
          />
          <ResultBlock
            method="collectFinancialConnectionsAccounts"
            results={results}
          />
          <ActionButton
            method="verifyMicrodepositsForPayment"
            onPress={() =>
              run('verifyMicrodepositsForPayment', () =>
                verifyMicrodepositsForPayment(piSecret, {amounts: [32, 45]}),
              )
            }
          />
          <ResultBlock method="verifyMicrodepositsForPayment" results={results} />
          <ActionButton
            method="verifyMicrodepositsForSetup"
            onPress={() =>
              run('verifyMicrodepositsForSetup', () =>
                verifyMicrodepositsForSetup(siSecret, {amounts: [32, 45]}),
              )
            }
          />
          <ResultBlock method="verifyMicrodepositsForSetup" results={results} />
        </Section>

        {/* ============ Link ============ */}
        <Section title="Link（Private Preview，鸿蒙降级）">
          <ActionButton
            method="initLinkController"
            onPress={() =>
              run('initLinkController', () =>
                initLinkController({
                  merchantDisplayName: 'OHOS Example Merchant',
                  email: 'email@stripe.com',
                }),
              )
            }
          />
          <ResultBlock method="initLinkController" results={results} />
          <ActionButton
            method="presentLinkController"
            onPress={() =>
              run('presentLinkController', () => presentLinkController())
            }
          />
          <ResultBlock method="presentLinkController" results={results} />
          <ActionButton
            method="confirmLinkControllerSetupIntent"
            onPress={() =>
              run('confirmLinkControllerSetupIntent', () =>
                confirmLinkControllerSetupIntent(siSecret),
              )
            }
          />
          <ResultBlock
            method="confirmLinkControllerSetupIntent"
            results={results}
          />
        </Section>

        {/* ============ Hooks ============ */}
        <Section title="Hooks（快捷封装，对照 README Hooks 表）">
          <ActionButton
            method="useConfirmPayment"
            onPress={() =>
              run('useConfirmPayment', () =>
                hookConfirmPayment(piSecret, {
                  paymentMethodType: 'Card',
                  paymentMethodData: {billingDetails},
                }),
              )
            }
          />
          <ResultBlock method="useConfirmPayment" results={results} />
          <ActionButton
            method="useConfirmSetupIntent"
            onPress={() =>
              run('useConfirmSetupIntent', () =>
                hookConfirmSetupIntent(siSecret, {
                  paymentMethodType: 'Card',
                  paymentMethodData: {billingDetails},
                }),
              )
            }
          />
          <ResultBlock method="useConfirmSetupIntent" results={results} />
          <ActionButton
            method="usePlatformPay.isPlatformPaySupported"
            onPress={() =>
              run('usePlatformPay.isPlatformPaySupported', () =>
                hookIsPlatformPaySupported({googlePay: {testEnv: true}}),
              )
            }
          />
          <ResultBlock
            method="usePlatformPay.isPlatformPaySupported"
            results={results}
          />
          <ActionButton
            method="usePlatformPay.createPlatformPayPaymentMethod"
            onPress={() =>
              run('usePlatformPay.createPlatformPayPaymentMethod', () =>
                hookCreatePlatformPayPaymentMethod({}),
              )
            }
          />
          <ResultBlock
            method="usePlatformPay.createPlatformPayPaymentMethod"
            results={results}
          />
          <ActionButton
            method="useFinancialConnectionsSheet.collectFinancialConnectionsAccounts"
            onPress={() =>
              run(
                'useFinancialConnectionsSheet.collectFinancialConnectionsAccounts',
                () => hookCollectFinancialConnections(piSecret),
              )
            }
          />
          <ResultBlock
            method="useFinancialConnectionsSheet.collectFinancialConnectionsAccounts"
            results={results}
          />
          <ActionButton
            method="useFinancialConnectionsSheet.collectBankAccountToken"
            onPress={() =>
              run(
                'useFinancialConnectionsSheet.collectBankAccountToken',
                () => hookCollectBankAccountToken(piSecret),
              )
            }
          />
          <ResultBlock
            method="useFinancialConnectionsSheet.collectBankAccountToken"
            results={results}
          />
          <ActionButton
            method="useOnramp.configure"
            onPress={() =>
              run('useOnramp.configure', () =>
                onramp.configure({
                  merchantDisplayName: 'OHOS Example Merchant',
                  appearance: {style: 'ALWAYS_LIGHT', primaryButton: {cornerRadius: 8}},
                }),
              )
            }
          />
          <ResultBlock method="useOnramp.configure" results={results} />
          <ActionButton
            method="useOnramp.isSamsungPaySupported"
            onPress={() =>
              run('useOnramp.isSamsungPaySupported', () =>
                onramp.isSamsungPaySupported(),
              )
            }
          />
          <ResultBlock method="useOnramp.isSamsungPaySupported" results={results} />
          <ActionButton
            method="useOnramp.hasLinkAccount"
            onPress={() =>
              run('useOnramp.hasLinkAccount', () =>
                onramp.hasLinkAccount('email@stripe.com'),
              )
            }
          />
          <ResultBlock method="useOnramp.hasLinkAccount" results={results} />
          <ActionButton
            method="useOnramp.registerLinkUser"
            onPress={() =>
              run('useOnramp.registerLinkUser', () =>
                onramp.registerLinkUser({
                  email: 'email@stripe.com',
                  phone: '+12125551234',
                  country: 'US',
                }),
              )
            }
          />
          <ResultBlock method="useOnramp.registerLinkUser" results={results} />
          <ActionButton
            method="useOnramp.verifyIdentity"
            onPress={() =>
              run('useOnramp.verifyIdentity', () => onramp.verifyIdentity())
            }
          />
          <ResultBlock method="useOnramp.verifyIdentity" results={results} />
          <ActionButton
            method="useOnramp.performCheckout"
            onPress={() =>
              run('useOnramp.performCheckout', () =>
                onramp.performCheckout(
                  'ors_test_ohos_example',
                  async () => null,
                ),
              )
            }
          />
          <ResultBlock method="useOnramp.performCheckout" results={results} />
          <ActionButton
            method="useLinkController.initLinkController"
            onPress={() =>
              run('useLinkController.initLinkController', () =>
                linkController.initLinkController({
                  merchantDisplayName: 'OHOS Example Merchant',
                  email: 'email@stripe.com',
                }),
              )
            }
          />
          <ResultBlock
            method="useLinkController.initLinkController"
            results={results}
          />
          <ActionButton
            method="useLinkController.presentLinkController"
            onPress={() =>
              run('useLinkController.presentLinkController', () =>
                linkController.presentLinkController(),
              )
            }
          />
          <ResultBlock
            method="useLinkController.presentLinkController"
            results={results}
          />
          <ActionButton
            method="useLinkController.confirmLinkControllerSetupIntent"
            onPress={() =>
              run('useLinkController.confirmLinkControllerSetupIntent', () =>
                linkController.confirmLinkControllerSetupIntent(siSecret),
              )
            }
          />
          <ResultBlock
            method="useLinkController.confirmLinkControllerSetupIntent"
            results={results}
          />
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>
              useCheckout 状态（enabled=false → idle，控制器方法全部降级）:
            </Text>
            <Text testID="result-useCheckout" style={styles.resultText}>
              {safeStringify({
                status: checkout.status,
                error: checkout.error,
              })}
            </Text>
          </View>
          <ActionButton
            method="useCheckout.reload"
            onPress={() =>
              run('useCheckout.reload', () => checkout.reload())
            }
          />
          <ResultBlock method="useCheckout.reload" results={results} />
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>
              useEmbeddedPaymentElement 状态（原生降级 notSupported）:
            </Text>
            <Text testID="result-useEmbeddedPaymentElement" style={styles.resultText}>
              {safeStringify({
                paymentOption: embeddedPaymentElement.paymentOption,
                loadingError: embeddedPaymentElement.loadingError,
                isLoaded: embeddedPaymentElement.isLoaded,
              })}
            </Text>
          </View>
          <ActionButton
            method="useEmbeddedPaymentElement.update"
            onPress={() => {
              // 元素未就绪时 hook 同步抛错；不捕获则确认文案不会出现且无任何可见反馈
              try {
                embeddedPaymentElement.update({
                  mode: {amount: 2000, currencyCode: 'usd'},
                });
                setResults(prev => ({
                  ...prev,
                  'useEmbeddedPaymentElement.update': 'update(2000) 已调用',
                }));
              } catch (e) {
                setResults(prev => ({
                  ...prev,
                  'useEmbeddedPaymentElement.update': `THREW: ${safeStringify(e)}`,
                }));
              }
            }}
          />
          <ResultBlock
            method="useEmbeddedPaymentElement.update"
            results={results}
          />
          <ActionButton
            method="useEmbeddedPaymentElement.confirm"
            onPress={() =>
              run('useEmbeddedPaymentElement.confirm', () =>
                embeddedPaymentElement.confirm(),
              )
            }
          />
          <ResultBlock
            method="useEmbeddedPaymentElement.confirm"
            results={results}
          />
          <ActionButton
            method="useEmbeddedPaymentElement.clearPaymentOption"
            onPress={() => {
              // 同 update：元素未就绪时同步抛错，需捕获为可见 THREW
              try {
                embeddedPaymentElement.clearPaymentOption();
                setResults(prev => ({
                  ...prev,
                  'useEmbeddedPaymentElement.clearPaymentOption':
                    'clearPaymentOption 已调用',
                }));
              } catch (e) {
                setResults(prev => ({
                  ...prev,
                  'useEmbeddedPaymentElement.clearPaymentOption': `THREW: ${safeStringify(e)}`,
                }));
              }
            }}
          />
          <ResultBlock
            method="useEmbeddedPaymentElement.clearPaymentOption"
            results={results}
          />
        </Section>

        {/* ============ Checkout ============ */}
        <Section title="Checkout（Private Preview，JS 层直接抛错）">
          <Text style={styles.subTitle}>
            说明：CheckoutPaymentElementView 组件在本版本 JS 层渲染即抛错
            （非空视图占位），故 demo 不直接渲染该组件。
          </Text>
          <ActionButton
            method="createCheckout"
            onPress={() =>
              run('createCheckout', () =>
                createCheckout({
                  clientSecret: 'cos_test_ohos_example_secret',
                  returnURL: 'stripe://stripe-redirect',
                }),
              )
            }
          />
          <ResultBlock method="createCheckout" results={results} />
        </Section>

        {/* ============ Components Gallery ============ */}
        <Section title="其他组件">
          <Text style={styles.subTitle}>AuBECSDebitForm</Text>
          <AuBECSDebitForm
            testID="stripe-aubecs-form"
            companyName="Example Company Inc."
            formStyle={{
              borderWidth: 1,
              borderColor: '#635BFF',
              borderRadius: 8,
              backgroundColor: '#FFFFFF',
              textColor: '#1A1B25',
              placeholderColor: '#9EA0B8',
              textErrorColor: '#E25850',
              fontSize: 14,
            }}
            style={styles.aubecsForm}
            onComplete={value => setBecsDetails(safeStringify(value))}
          />
          {becsDetails !== null && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Result:</Text>
              <Text testID="result-AuBECSDebitForm" style={styles.resultText}>
                {becsDetails}
              </Text>
            </View>
          )}

          <Text style={styles.subTitle}>AddressSheet</Text>
          <TouchableOpacity
            testID="test-toggleAddressSheet-btn"
            accessibilityLabel="test-toggleAddressSheet-btn"
            style={styles.button}
            onPress={() => setAddressVisible(v => !v)}>
            <Text style={styles.buttonText}>
              {addressVisible ? '关闭' : '打开'} AddressSheet
            </Text>
          </TouchableOpacity>
          <AddressSheet
            visible={addressVisible}
            presentationStyle="popover"
            animationStyle="slide"
            appearance={{shapes: {borderRadius: 8, borderWidth: 1}}}
            defaultValues={{
              name: 'Test User',
              phone: '+48888000888',
              address: {
                city: 'Houston',
                country: 'US',
                line1: '1459 Circle Drive',
                line2: 'Texas',
                postalCode: '77063',
                state: 'TX',
              },
            }}
            additionalFields={{
              phoneNumber: 'optional',
              checkboxLabel: '保存为默认地址',
            }}
            allowedCountries={['US', 'AU', 'JP']}
            autocompleteCountries={['US']}
            primaryButtonTitle="保存地址"
            sheetTitle="收货地址"
            googlePlacesApiKey="demo_places_key"
            onSubmit={result =>
              setResults(prev => ({
                ...prev,
                AddressSheet: safeStringify(result),
              }))
            }
            onError={error =>
              setResults(prev => ({
                ...prev,
                AddressSheet: `Error: ${safeStringify(error)}`,
              }))
            }
          />
          <ResultBlock method="AddressSheet" results={results} />

          <Text style={styles.subTitle}>AddToWalletButton</Text>
          <AddToWalletButton
            testID="stripe-add-to-wallet-button"
            testEnv={true}
            iOSButtonStyle="onLightBackground"
            androidAssetSource={{uri: 'google_pay_button_asset'}}
            style={styles.walletButton}
            cardDetails={{
              primaryAccountIdentifier: 'V-123',
              name: 'David Wallace',
              description: 'Test issued card',
              lastFour: '4242',
              brand: 'Visa',
            }}
            token={null}
            isBounceProvisioned={false}
            ephemeralKey={{}}
            onComplete={result => setWalletResult(safeStringify(result))}
          />
          {walletResult !== null && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Result:</Text>
              <Text testID="result-AddToWalletButton" style={styles.resultText}>
                {walletResult}
              </Text>
            </View>
          )}

          <Text style={styles.subTitle}>PaymentMethodMessagingElement</Text>
          <PaymentMethodMessagingElement
            appearance={{
              // 覆盖 README PMME appearance 全部 4 子项（字体/文字色/链接色/主题）
              font: {size: 14},
              textColor: '#1A1B25',
              linkTextColor: '#635BFF',
              style: PaymentMethodMessagingElementStyle.Light,
            }}
            configuration={{
              currency: 'usd',
              amount: 5000,
              country: 'US',
              locale: 'en',
              paymentMethodTypes: ['afterpay_clearpay', 'klarna'],
            }}
            onStateChange={event => setPmmeState(safeStringify(event))}
          />
          {pmmeState !== null && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Result:</Text>
              <Text
                testID="result-PaymentMethodMessagingElement"
                style={styles.resultText}>
                {pmmeState}
              </Text>
            </View>
          )}
        </Section>

        {/* ============ Connect ============ */}
        <Section title="Connect 组件（connect-js webview 承载）">
          <TouchableOpacity
            testID="test-toggleConnectOnboarding-btn"
            accessibilityLabel="test-toggleConnectOnboarding-btn"
            style={styles.button}
            onPress={() => setConnectVisible(v => !v)}>
            <Text style={styles.buttonText}>
              {connectVisible ? '关闭' : '打开'} Connect 组件
            </Text>
          </TouchableOpacity>
          <SectionErrorBoundary>
          {connectVisible ? (
            <View>
              {(['onboarding', 'payments', 'payouts', 'details'] as const).map(
                view => (
                  <TouchableOpacity
                    key={view}
                    testID={`test-connectView-${view}-btn`}
                    accessibilityLabel={`test-connectView-${view}-btn`}
                    style={[
                      styles.button,
                      connectView === view ? styles.buttonActive : null,
                    ]}
                    onPress={() => setConnectView(view)}>
                    <Text style={styles.buttonText}>ConnectView: {view}</Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
          ) : null}
          {connectVisible ? (
            <ConnectComponentsProvider connectInstance={connectInstance}>
              <NavigationBar
                title="Connect 组件"
                onCloseButtonPress={() =>
                  setConnectEvent('NavigationBar.onCloseButtonPress')
                }
                style={styles.navigationBar}
              />
              {connectView === 'onboarding' ? (
                <ConnectAccountOnboarding
                  title="Complete your account setup"
                  onExit={() => setConnectVisible(false)}
                  onStepChange={step =>
                    setConnectEvent(`onStepChange: ${safeStringify(step)}`)
                  }
                  recipientTermsOfServiceUrl="https://stripe.com/recipient-terms"
                  fullTermsOfServiceUrl="https://stripe.com/terms"
                  privacyPolicyUrl="https://stripe.com/privacy"
                  collectionOptions={{
                    fields: 'currently_due',
                    futureRequirements: 'include',
                  }}
                  onLoaderStart={() => setConnectEvent('onLoaderStart')}
                  onLoadError={error =>
                    setConnectEvent(`onLoadError: ${safeStringify(error)}`)
                  }
                  onPageDidLoad={() => setConnectEvent('onPageDidLoad')}
                />
              ) : null}
              {connectView === 'payments' ? (
                <ConnectPayments
                  defaultFilters={{status: ['successful', 'pending']}}
                  onLoaderStart={() => setConnectEvent('Payments.onLoaderStart')}
                  onLoadError={error =>
                    setConnectEvent(`Payments.onLoadError: ${safeStringify(error)}`)
                  }
                  onPageDidLoad={() => setConnectEvent('Payments.onPageDidLoad')}
                  style={styles.connectView}
                />
              ) : null}
              {connectView === 'payouts' ? (
                <ConnectPayouts
                  onLoaderStart={() => setConnectEvent('Payouts.onLoaderStart')}
                  onLoadError={error =>
                    setConnectEvent(`Payouts.onLoadError: ${safeStringify(error)}`)
                  }
                  onPageDidLoad={() => setConnectEvent('Payouts.onPageDidLoad')}
                  style={styles.connectView}
                />
              ) : null}
              {connectView === 'details' ? (
                <ConnectPaymentDetails
                  payment="pi_demo_ohos"
                  onClose={() => setConnectVisible(false)}
                  onLoaderStart={() => setConnectEvent('Details.onLoaderStart')}
                  onLoadError={error =>
                    setConnectEvent(`Details.onLoadError: ${safeStringify(error)}`)
                  }
                  onPageDidLoad={() => setConnectEvent('Details.onPageDidLoad')}
                  style={styles.connectView}
                />
              ) : null}
            </ConnectComponentsProvider>
          ) : null}
          </SectionErrorBoundary>
          {connectEvent !== null && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Result:</Text>
              <Text
                testID="result-ConnectAccountOnboarding"
                style={styles.resultText}>
                {connectEvent}
              </Text>
            </View>
          )}
        </Section>

        <Text style={styles.footer}>
          {busy !== null ? `执行中: ${busy} …` : ' '}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F6F7F9',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 48,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#635BFF',
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1B25',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#44465A',
    marginTop: 8,
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#635BFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#B9B7D7',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resultBox: {
    marginTop: 8,
    backgroundColor: '#F1F2F8',
    borderRadius: 8,
    padding: 8,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#635BFF',
  },
  resultText: {
    fontSize: 12,
    color: '#33344A',
    marginTop: 2,
  },
  inputRow: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: '#66687F',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D5D6E5',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: '#1A1B25',
  },
  stripeContainerWrap: {
    height: 90,
  },
  cardField: {
    width: '100%',
    height: 50,
  },
  cardFieldStyle: {
    // 覆盖 README CardFieldProps cardStyle 全部 9 项生效字段（fontFamily 未生效不传）
    backgroundColor: '#FFFFFF',
    borderColor: '#635BFF',
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 14,
    textColor: '#1A1B25',
    placeholderColor: '#9EA0B8',
    textErrorColor: '#E25850',
    cursorColor: '#635BFF',
  },
  cardForm: {
    // 4 字段（含 postalCodeEnabled 默认开启的邮编）实际内容高 ≈286：
    // 3×(标签16+间距4+输入框44+字段距10) + 末字段64。低于内容高度时
    // ArkUI 内部溢出 RN 盒子，ZIP 框会被下方「CardForm 状态」结果区遮挡
    height: 290,
  },
  aubecsForm: {
    // companyName 行(≈27) + 姓名/邮箱/BSB/账号 4×(42+8) ≈ 227
    height: 230,
  },
  walletButton: {
    height: 44,
  },
  platformPayButton: {
    marginTop: 8,
  },
  navigationBar: {
    height: 44,
  },
  connectView: {
    height: 320,
  },
  buttonActive: {
    backgroundColor: '#4F49D6',
  },
  footer: {
    marginTop: 8,
    fontSize: 12,
    color: '#888A9E',
  },
});

export default App;
