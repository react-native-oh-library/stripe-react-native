import type { HostComponent, ViewProps } from 'react-native';
import type { DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

type OnExitActionEvent = Readonly<{}>;

export interface NativeProps extends ViewProps {
  visible: boolean;
  title?: string;
  // 原名 backgroundColor 与 ViewProps 通用属性同名，鸿蒙 codegen 的
  // ViewRawProps 同名属性类型冲突（RawProps 同时 extends 两者），故更名规避；
  // JS 层组件调用处以 sheetBackgroundColor 映射原名等参。
  sheetBackgroundColor?: string;
  textColor?: string;
  onExitAction: DirectEventHandler<OnExitActionEvent>;
}

type ComponentType = HostComponent<NativeProps>;

export default codegenNativeComponent<NativeProps>(
  'ConnectAccountOnboardingView'
) as ComponentType;
