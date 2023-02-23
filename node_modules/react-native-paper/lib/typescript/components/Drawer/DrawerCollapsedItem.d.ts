import * as React from 'react';
import { GestureResponderEvent, StyleProp, View, ViewStyle } from 'react-native';
import type { InternalTheme } from '../../types';
import { IconSource } from '../Icon';
export declare type Props = React.ComponentPropsWithRef<typeof View> & {
    /**
     * The label text of the item.
     */
    label?: string;
    /**
     * Badge to show on the icon, can be `true` to show a dot, `string` or `number` to show text.
     */
    badge?: string | number | boolean;
    /**
     * Icon to use as the focused destination icon, can be a string, an image source or a react component @renamed Renamed from 'icon' to 'focusedIcon' in v5.x
     */
    focusedIcon?: IconSource;
    /**
     * Icon to use as the unfocused destination icon, can be a string, an image source or a react component @renamed Renamed from 'icon' to 'focusedIcon' in v5.x
     */
    unfocusedIcon?: IconSource;
    /**
     * Whether to highlight the drawer item as active.
     */
    active?: boolean;
    /**
     * Function to execute on press.
     */
    onPress?: (e: GestureResponderEvent) => void;
    /**
     * Accessibility label for the button. This is read by the screen reader when the user taps the button.
     */
    accessibilityLabel?: string;
    style?: StyleProp<ViewStyle>;
    /**
     * @optional
     */
    theme: InternalTheme;
    /**
     * TestID used for testing purposes
     */
    testID?: string;
};
declare const _default: React.ComponentType<Pick<import("react-native").ViewProps & React.RefAttributes<View> & {
    /**
     * The label text of the item.
     */
    label?: string | undefined;
    /**
     * Badge to show on the icon, can be `true` to show a dot, `string` or `number` to show text.
     */
    badge?: string | number | boolean | undefined;
    /**
     * Icon to use as the focused destination icon, can be a string, an image source or a react component @renamed Renamed from 'icon' to 'focusedIcon' in v5.x
     */
    focusedIcon?: IconSource | undefined;
    /**
     * Icon to use as the unfocused destination icon, can be a string, an image source or a react component @renamed Renamed from 'icon' to 'focusedIcon' in v5.x
     */
    unfocusedIcon?: IconSource | undefined;
    /**
     * Whether to highlight the drawer item as active.
     */
    active?: boolean | undefined;
    /**
     * Function to execute on press.
     */
    onPress?: ((e: GestureResponderEvent) => void) | undefined;
    /**
     * Accessibility label for the button. This is read by the screen reader when the user taps the button.
     */
    accessibilityLabel?: string | undefined;
    style?: StyleProp<ViewStyle>;
    /**
     * @optional
     */
    theme: InternalTheme;
    /**
     * TestID used for testing purposes
     */
    testID?: string | undefined;
}, "label" | "onPress" | keyof import("react-native").ViewProps | keyof React.RefAttributes<View> | "active" | "focusedIcon" | "unfocusedIcon" | "badge"> & {
    theme?: import("@callstack/react-theme-provider").$DeepPartial<unknown> | undefined;
}> & import("@callstack/react-theme-provider/typings/hoist-non-react-statics").NonReactStatics<React.ComponentType<import("react-native").ViewProps & React.RefAttributes<View> & {
    /**
     * The label text of the item.
     */
    label?: string | undefined;
    /**
     * Badge to show on the icon, can be `true` to show a dot, `string` or `number` to show text.
     */
    badge?: string | number | boolean | undefined;
    /**
     * Icon to use as the focused destination icon, can be a string, an image source or a react component @renamed Renamed from 'icon' to 'focusedIcon' in v5.x
     */
    focusedIcon?: IconSource | undefined;
    /**
     * Icon to use as the unfocused destination icon, can be a string, an image source or a react component @renamed Renamed from 'icon' to 'focusedIcon' in v5.x
     */
    unfocusedIcon?: IconSource | undefined;
    /**
     * Whether to highlight the drawer item as active.
     */
    active?: boolean | undefined;
    /**
     * Function to execute on press.
     */
    onPress?: ((e: GestureResponderEvent) => void) | undefined;
    /**
     * Accessibility label for the button. This is read by the screen reader when the user taps the button.
     */
    accessibilityLabel?: string | undefined;
    style?: StyleProp<ViewStyle>;
    /**
     * @optional
     */
    theme: InternalTheme;
    /**
     * TestID used for testing purposes
     */
    testID?: string | undefined;
}> & {
    ({ focusedIcon, unfocusedIcon, label, active, theme, style, onPress, accessibilityLabel, badge, testID, ...rest }: Props): JSX.Element | null;
    displayName: string;
}, {}>;
export default _default;
