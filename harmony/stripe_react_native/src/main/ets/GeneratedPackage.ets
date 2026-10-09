/**
 * StripeReactNativePackage — RNOHPackage：同一 default 导出内同时注册
 * - Fabric：createDescriptorWrapperFactoryByDescriptorType（12 组件）
 * - TurboModule：getUITurboModuleFactoryByNameMap（StripeSdk + OnrampSdk）
 *
 * 类名与 package.json harmony.autolinking.etsPackageClassName 保持一致，
 * 供 hvigor autolink 生成的 RNOHPackagesFactory.ets 以同名注册。
 * OnrampSdk 必须注册：C++ 侧 RNOHGeneratedPackage 已按名字创建 OnrampSdk 的
 * ArkTSTurboModule，ArkTS 侧缺失实现会让 JS 拿到非空模块但所有调用派发失败；
 * 注册 OnrampSdkTurboModule 后每个调用返回结构化 notSupported 错误。
 */

import { RNOHPackage } from '@rnoh/react-native-openharmony/ets';
import { ComponentBuilderContext } from '@rnoh/react-native-openharmony';
import type {
  DescriptorWrapperFactoryByDescriptorTypeCtx,
  DescriptorWrapperFactoryByDescriptorType,
  UITurboModule,
  UITurboModuleContext,
} from '@rnoh/react-native-openharmony/ts';
import { AddToWalletButton as AddToWalletButtonSpec } from './generated/components/AddToWalletButton';
import { AddressSheetView as AddressSheetViewSpec } from './generated/components/AddressSheetView';
import { ApplePayButton as ApplePayButtonSpec } from './generated/components/ApplePayButton';
import { AuBECSDebitForm as AuBECSDebitFormSpec } from './generated/components/AuBECSDebitForm';
import { CardField as CardFieldSpec } from './generated/components/CardField';
import { CardForm as CardFormSpec } from './generated/components/CardForm';
import { ConnectAccountOnboardingView as ConnectAccountOnboardingViewSpec } from './generated/components/ConnectAccountOnboardingView';
import { EmbeddedPaymentElementView as EmbeddedPaymentElementViewSpec } from './generated/components/EmbeddedPaymentElementView';
import { GooglePayButton as GooglePayButtonSpec } from './generated/components/GooglePayButton';
import { NavigationBar as NavigationBarSpec } from './generated/components/NavigationBar';
import { PaymentMethodMessagingElementView as PaymentMethodMessagingElementViewSpec } from './generated/components/PaymentMethodMessagingElementView';
import { StripeContainer as StripeContainerSpec } from './generated/components/StripeContainer';
import { TM } from './generated/ts';
import { StripeSdkTurboModule } from './StripeSdkTurboModule';
import { OnrampSdkTurboModule } from './OnrampSdkTurboModule';
import { AddToWalletButton } from './components/AddToWalletButton';
import { AddressSheetView } from './components/AddressSheetView';
import { ApplePayButton } from './components/ApplePayButton';
import { AuBECSDebitForm } from './components/AuBECSDebitForm';
import { CardField } from './components/CardField';
import { CardForm } from './components/CardForm';
import { ConnectAccountOnboardingView } from './components/ConnectAccountOnboardingView';
import { EmbeddedPaymentElementView } from './components/EmbeddedPaymentElementView';
import { GooglePayButton } from './components/GooglePayButton';
import { NavigationBar } from './components/NavigationBar';
import { PaymentMethodMessagingElementView } from './components/PaymentMethodMessagingElementView';
import { StripeContainer } from './components/StripeContainer';

// RNOH 0.72 渲染链路：非核心组件经 RNComponentFactory 尾部分支进入
// customRNComponentWrappedBuilderByName（由各 Package 的 builder 映射聚合而来）。
// 不提供映射时组件渲染空白（DescriptorWrapper 只解决 props 解析，不负责渲染）。
@Builder
function buildAddToWalletButton(ctx: ComponentBuilderContext) {
  AddToWalletButton({ ctx: ctx.rnComponentContext, tag: ctx.tag })
}

@Builder
function buildAddressSheetView(ctx: ComponentBuilderContext) {
  AddressSheetView({ ctx: ctx.rnComponentContext, tag: ctx.tag })
}

@Builder
function buildApplePayButton(ctx: ComponentBuilderContext) {
  ApplePayButton({ ctx: ctx.rnComponentContext, tag: ctx.tag })
}

@Builder
function buildAuBECSDebitForm(ctx: ComponentBuilderContext) {
  AuBECSDebitForm({ ctx: ctx.rnComponentContext, tag: ctx.tag })
}

@Builder
function buildCardField(ctx: ComponentBuilderContext) {
  CardField({ ctx: ctx.rnComponentContext, tag: ctx.tag })
}

@Builder
function buildCardForm(ctx: ComponentBuilderContext) {
  CardForm({ ctx: ctx.rnComponentContext, tag: ctx.tag })
}

@Builder
function buildConnectAccountOnboardingView(ctx: ComponentBuilderContext) {
  ConnectAccountOnboardingView({ ctx: ctx.rnComponentContext, tag: ctx.tag })
}

@Builder
function buildEmbeddedPaymentElementView(ctx: ComponentBuilderContext) {
  EmbeddedPaymentElementView({ ctx: ctx.rnComponentContext, tag: ctx.tag })
}

@Builder
function buildGooglePayButton(ctx: ComponentBuilderContext) {
  GooglePayButton({ ctx: ctx.rnComponentContext, tag: ctx.tag })
}

@Builder
function buildNavigationBar(ctx: ComponentBuilderContext) {
  NavigationBar({ ctx: ctx.rnComponentContext, tag: ctx.tag })
}

@Builder
function buildPaymentMethodMessagingElementView(ctx: ComponentBuilderContext) {
  PaymentMethodMessagingElementView({ ctx: ctx.rnComponentContext, tag: ctx.tag })
}

@Builder
function buildStripeContainer(ctx: ComponentBuilderContext) {
  StripeContainer({ ctx: ctx.rnComponentContext, tag: ctx.tag })
}

export class StripeReactNativePackage extends RNOHPackage {
  createDescriptorWrapperFactoryByDescriptorType(
    ctx: DescriptorWrapperFactoryByDescriptorTypeCtx
  ): DescriptorWrapperFactoryByDescriptorType {
    return {
      AddToWalletButton: (ctx) => new AddToWalletButtonSpec.DescriptorWrapper(ctx.descriptor),
      AddressSheetView: (ctx) => new AddressSheetViewSpec.DescriptorWrapper(ctx.descriptor),
      ApplePayButton: (ctx) => new ApplePayButtonSpec.DescriptorWrapper(ctx.descriptor),
      AuBECSDebitForm: (ctx) => new AuBECSDebitFormSpec.DescriptorWrapper(ctx.descriptor),
      CardField: (ctx) => new CardFieldSpec.DescriptorWrapper(ctx.descriptor),
      CardForm: (ctx) => new CardFormSpec.DescriptorWrapper(ctx.descriptor),
      ConnectAccountOnboardingView: (ctx) => new ConnectAccountOnboardingViewSpec.DescriptorWrapper(ctx.descriptor),
      EmbeddedPaymentElementView: (ctx) => new EmbeddedPaymentElementViewSpec.DescriptorWrapper(ctx.descriptor),
      GooglePayButton: (ctx) => new GooglePayButtonSpec.DescriptorWrapper(ctx.descriptor),
      NavigationBar: (ctx) => new NavigationBarSpec.DescriptorWrapper(ctx.descriptor),
      PaymentMethodMessagingElementView: (ctx) => new PaymentMethodMessagingElementViewSpec.DescriptorWrapper(ctx.descriptor),
      StripeContainer: (ctx) => new StripeContainerSpec.DescriptorWrapper(ctx.descriptor),
    };
  }

  override getUITurboModuleFactoryByNameMap(): Map<string, (ctx: UITurboModuleContext) => UITurboModule | null> {
    const map = new Map<string, (ctx: UITurboModuleContext) => UITurboModule | null>();
    map.set(TM.StripeSdk.NAME, (ctx: UITurboModuleContext) => new StripeSdkTurboModule(ctx));
    map.set(TM.OnrampSdk.NAME, (ctx: UITurboModuleContext) => new OnrampSdkTurboModule(ctx));
    return map;
  }

  override createWrappedCustomRNComponentBuilderByComponentNameMap(): Map<string, WrappedBuilder<[ComponentBuilderContext]>> {
    return new Map<string, WrappedBuilder<[ComponentBuilderContext]>>()
      .set(AddToWalletButtonSpec.NAME, wrapBuilder(buildAddToWalletButton))
      .set(AddressSheetViewSpec.NAME, wrapBuilder(buildAddressSheetView))
      .set(ApplePayButtonSpec.NAME, wrapBuilder(buildApplePayButton))
      .set(AuBECSDebitFormSpec.NAME, wrapBuilder(buildAuBECSDebitForm))
      .set(CardFieldSpec.NAME, wrapBuilder(buildCardField))
      .set(CardFormSpec.NAME, wrapBuilder(buildCardForm))
      .set(ConnectAccountOnboardingViewSpec.NAME, wrapBuilder(buildConnectAccountOnboardingView))
      .set(EmbeddedPaymentElementViewSpec.NAME, wrapBuilder(buildEmbeddedPaymentElementView))
      .set(GooglePayButtonSpec.NAME, wrapBuilder(buildGooglePayButton))
      .set(NavigationBarSpec.NAME, wrapBuilder(buildNavigationBar))
      .set(PaymentMethodMessagingElementViewSpec.NAME, wrapBuilder(buildPaymentMethodMessagingElementView))
      .set(StripeContainerSpec.NAME, wrapBuilder(buildStripeContainer));
  }
}
