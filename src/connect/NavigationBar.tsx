import React, { forwardRef } from 'react';
import type { ViewProps } from 'react-native';
import NativeNavigationBar from '../specs/v1/NativeNavigationBar';

export interface NavigationBarProps extends ViewProps {
  title?: string;
  onCloseButtonPress?: () => void;
}

export const NavigationBar = forwardRef<any, NavigationBarProps>(
  ({ title, onCloseButtonPress, ...rest }, ref) => {
    return (
      <NativeNavigationBar
        ref={ref}
        title={title}
        onCloseButtonPress={
          onCloseButtonPress
            ? (_event) => {
                onCloseButtonPress();
              }
            : undefined
        }
        {...rest}
      />
    );
  }
);

NavigationBar.displayName = 'NavigationBar';
