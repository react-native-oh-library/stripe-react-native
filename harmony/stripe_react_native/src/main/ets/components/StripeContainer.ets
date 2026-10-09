/**
 * StripeContainer — Stripe 组件容器（容器组件）。
 *
 * 对齐 Android StripeContainer（ScrollView 容器）：LazyForEach 渲染 RN children，
 * keyboardShouldPersistTaps 透传键盘点击穿透语义（ArkUI 由父级滚动容器自然处理）。
 */

import {
  DescriptorWrapper, RNComponentContext, RNOHContext, RNViewBaseAttributeModifier, ViewBaseDescriptor, ViewDescriptorWrapperBase,
} from '@rnoh/react-native-openharmony';
import { StripeContainer as Spec } from '../generated/components/StripeContainer';

@Component
export struct StripeContainer {
  public static readonly NAME = Spec.NAME;
  public ctx!: RNOHContext;
  public tag: number = 0;
  @State private descriptorWrapper: ViewDescriptorWrapperBase | undefined = undefined;
  @State private rnViewAttributeModifier: RNViewBaseAttributeModifier | undefined = undefined;

  @State private keyboardShouldPersistTaps: boolean = false;
  private eventEmitter: Spec.EventEmitter | undefined = undefined;
  private cleanUpCallbacks: (() => void)[] = [];

  aboutToAppear(): void {
    this.eventEmitter = new Spec.EventEmitter(this.ctx.rnInstance, this.tag);
    const descriptor = this.ctx.descriptorRegistry.getDescriptor<ViewBaseDescriptor>(this.tag);
    this.applyDescriptor(descriptor);
    this.cleanUpCallbacks.push(
      this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag, (d: ViewBaseDescriptor) => {
        this.applyDescriptor(d);
      })
    );

    // codegen EventPayloadByName 为空（StripeContainer 无自定义事件）
  }

  private applyDescriptor(descriptor: ViewBaseDescriptor): void {
    let dw = this.ctx.descriptorRegistry.findDescriptorWrapperByTag<ViewDescriptorWrapperBase>(this.tag);
    if (!dw || !(dw instanceof ViewDescriptorWrapperBase)) {
      dw = new ViewDescriptorWrapperBase(descriptor);
    }
    if (this.ctx instanceof RNComponentContext) {
      this.rnViewAttributeModifier = new RNViewBaseAttributeModifier(dw, this.ctx);
    }
    this.descriptorWrapper = dw;
    const rawProps = descriptor.rawProps as Spec.DirectRawProps;
    if (rawProps) {
      this.keyboardShouldPersistTaps = rawProps.keyboardShouldPersistTaps ?? false;
    }
  }

  aboutToDisappear(): void {
    this.cleanUpCallbacks.forEach(cb => cb());
  }

  build() {
    Stack() {
      if (this.descriptorWrapper?.focusable) {
        Button().width(0).height(0).padding(0).margin(0)
      }
      if (this.ctx instanceof RNComponentContext) {
        LazyForEach(this.ctx.createComponentDataSource({ tag: this.tag }),
          (descriptorWrapper: DescriptorWrapper) => {
            (this.ctx as RNComponentContext).wrappedRNComponentBuilder.builder(
              (this.ctx as RNComponentContext),
              descriptorWrapper.tag
            )
          },
          (descriptorWrapper: DescriptorWrapper) =>
            descriptorWrapper.tag.toString() + '@' + descriptorWrapper.renderKey
        )
      }
    }
    .width('100%')
    .height('100%')
    .id(this.tag.toString())
    .align(Alignment.TopStart)
    .attributeModifier(this.rnViewAttributeModifier)
  }
}
