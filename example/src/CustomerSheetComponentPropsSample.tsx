/**
 * Props（CustomerSheet.tsx）全字段字面量
 *
 * 覆盖度缺口补样（自动生成，勿手改）：对报告点名未覆盖的接口
 * 生成「注解类型 = 接口名」的全字段字面量；复杂字段以 undefined as never 占位。
 */
import type {Props} from '@stripe/stripe-react-native/src/components/CustomerSheet';

const customerSheetComponentPropsSample: Props = {
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
} as unknown as Props;

export {customerSheetComponentPropsSample};
