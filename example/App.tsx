/**
 * Stripe React Native — OpenHarmony Example 测试页
 *
 * 单页应用，覆盖 @stripe/stripe-react-native 鸿蒙适配层的公开 API：
 * - StripeProvider 初始化（initialise）
 * - CardField / CardForm / AuBECSDebitForm / StripeContainer / PlatformPayButton /
 *   AddressSheet / AddToWalletButton / PaymentMethodMessagingElement / Connect 组件
 * - useStripe / usePaymentSheet / CustomerSheet / Link / Financial Connections 方法
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
  CardField,
  CardFieldInput,
  CardForm,
  CardFormView,
  confirmLinkControllerSetupIntent,
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
  Constants,
  CustomerSheet,
  initLinkController,
  isCardInWallet,
  loadConnectAndInitialize,
  PaymentMethodMessagingElement,
  PlatformPay,
  PlatformPayButton,
  presentLinkController,
  setFinancialConnectionsForceNativeFlow,
  StripeContainer,
  StripeProvider,
  usePaymentSheet,
  useStripe,
} from '@stripe/stripe-react-native';
import type {IntentCreationCallbackParams} from '@stripe/stripe-react-native';

// 与原 example（example/src/screens/HomeScreen.tsx）一致的 Stripe 演示用测试密钥
const PUBLISHABLE_KEY =
  'pk_test_51K9W3OHMaDsveWq0oLP0ZjldetyfHIqyJcz27k2BpMGHxu9v9Cei2tofzoHncPyk3A49jMkFEgTOBQyAMTUffRLa00xzzARtZO';

const FALLBACK_PI_SECRET = 'pi_test_ohos_example_secret';
const FALLBACK_SI_SECRET = 'seti_test_ohos_example_secret';

function safeStringify(value: unknown): string {
  if (value === undefined) {
    return 'undefined';
  }
  if (value === null) {
    return 'null';
  }
  try {
    return JSON.stringify(value);
  } catch (e) {
    return String(value);
  }
}

type RunFn = (name: string, fn: () => Promise<unknown>) => Promise<void>;

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
  return (
    <StripeProvider
      publishableKey={PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.stripe.react.native"
      urlScheme="stripe">
      <TestScreen />
    </StripeProvider>
  );
}

function TestScreen(): JSX.Element {
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
          <View style={styles.stripeContainerWrap}>
            <StripeContainer>
              <CardField
                testID="stripe-card-field"
                autofocus={false}
                postalCodeEnabled={true}
                cardStyle={styles.cardFieldStyle}
                style={styles.cardField}
                onCardChange={setCardDetails}
                onFocus={focusedField =>
                  setResults(prev => ({
                    ...prev,
                    CardFieldFocus: safeStringify(focusedField),
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
          <CardForm
            testID="stripe-card-form"
            cardStyle={styles.cardFieldStyle}
            style={styles.cardForm}
            onFormComplete={setFormDetails}
          />
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>CardForm 状态:</Text>
            <Text testID="result-CardForm" style={styles.resultText}>
              {safeStringify(formDetails)}
            </Text>
          </View>
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
                        } save=${String(shouldSavePaymentMethod)}（已挂起，点击下方按钮回传）`,
                      }));
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
            method="presentPaymentSheet"
            onPress={() =>
              run('presentPaymentSheet', () => presentPaymentSheet())
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
                }),
              )
            }
          />
          <ResultBlock method="initCustomerSheet" results={results} />
          <ActionButton
            method="presentCustomerSheet"
            onPress={() =>
              run('presentCustomerSheet', () => CustomerSheet.present())
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
        </Section>

        {/* ============ Platform Pay ============ */}
        <Section title="Platform Pay（鸿蒙降级：结构化 notSupported）">
          <PlatformPayButton
            testID="stripe-platform-pay-button"
            type={PlatformPay.ButtonType.Buy}
            appearance={PlatformPay.ButtonStyle.Automatic}
            onPress={() =>
              setResults(prev => ({
                ...prev,
                PlatformPayButton: 'PlatformPayButton 按下（鸿蒙为占位降级按钮）',
              }))
            }
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

        {/* ============ Components Gallery ============ */}
        <Section title="其他组件">
          <Text style={styles.subTitle}>AuBECSDebitForm</Text>
          <AuBECSDebitForm
            testID="stripe-aubecs-form"
            companyName="Example Company Inc."
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
            }}
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
            configuration={{
              currency: 'usd',
              amount: 5000,
              country: 'US',
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
              {connectVisible ? '关闭' : '打开'} AccountOnboarding
            </Text>
          </TouchableOpacity>
          {connectVisible ? (
            <ConnectComponentsProvider connectInstance={connectInstance}>
              <ConnectAccountOnboarding
                title="Complete your account setup"
                onExit={() => setConnectVisible(false)}
                onStepChange={step =>
                  setConnectEvent(`onStepChange: ${safeStringify(step)}`)
                }
                onLoaderStart={() => setConnectEvent('onLoaderStart')}
                onLoadError={error =>
                  setConnectEvent(`onLoadError: ${safeStringify(error)}`)
                }
                onPageDidLoad={() => setConnectEvent('onPageDidLoad')}
              />
            </ConnectComponentsProvider>
          ) : null}
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
    borderColor: '#635BFF',
    borderWidth: 1,
    borderRadius: 8,
    textColor: '#1A1B25',
    placeholderColor: '#9EA0B8',
    textErrorColor: '#E25850',
    cursorColor: '#635BFF',
  },
  cardForm: {
    height: 200,
  },
  aubecsForm: {
    height: 220,
  },
  walletButton: {
    height: 44,
  },
  footer: {
    marginTop: 8,
    fontSize: 12,
    color: '#888A9E',
  },
});

export default App;
