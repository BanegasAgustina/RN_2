import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, type AppIconName } from '../../components/icons';
import { ScalePressable } from '../../components/ui';
import { radius } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

const tabIcons: Record<string, AppIconName> = { index: 'home', settings: 'settings' };
// Propiedades que Expo Router entrega al componente de barra personalizado.
type BottomTabBarProps = NonNullable<React.ComponentProps<typeof Tabs>['tabBar']> extends (props: infer P) => React.ReactNode ? P : never;

/** Dibuja la barra flotante y mantiene accesibles las acciones de las pestañas visibles. */
function FloatingTabBar({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const { theme } = useTheme(); const insets = useSafeAreaInsets();
  return <View pointerEvents="box-none" style={[styles.barPosition, { paddingBottom: Math.max(insets.bottom, 8) }]}>
    <View style={[styles.bar, { backgroundColor: theme.surfaceRaised, borderColor: theme.border, borderTopColor: theme.borderHighlight, boxShadow: theme.elevation[3], elevation: 12 }]}>
      {state.routes.filter((route) => !(descriptors[route.key].options as typeof descriptors[string]['options'] & { hidden?: boolean }).hidden).map((route) => {
        const focused = state.routes[state.index]?.key === route.key; const options = descriptors[route.key].options;
        const label = typeof options.tabBarLabel === 'string' ? options.tabBarLabel : options.title ?? route.name;
        const onPress = () => { const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true }); if (!focused && !event.defaultPrevented) navigateToTab(route.key); };
        const onLongPress = () => emitter.emit({ type: 'tabLongPress', target: route.key });
        return <ScalePressable key={route.key} accessibilityLabel={options.tabBarAccessibilityLabel ?? `${label} pestaña`} accessibilityRole="tab" accessibilityState={{ selected: focused }} onPress={onPress} onLongPress={onLongPress} style={styles.tab}>
          <View style={[styles.iconPill, { backgroundColor: focused ? theme.primarySoft : 'transparent' }]}><AppIcon name={tabIcons[route.name]} size={21} color={focused ? theme.primary : theme.muted} /></View>
          <Text numberOfLines={1} style={[styles.label, { color: focused ? theme.primaryStrong : theme.muted, fontWeight: focused ? '800' : '600' }]}>{label}</Text>
        </ScalePressable>;
      })}
    </View>
  </View>;
}

/** Navegación principal con una superficie flotante, elevada y accesible. */
export default function TabLayout() {
  return <Tabs tabBar={(props) => <FloatingTabBar {...props} />} screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}>
    <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarLabel: 'Inicio' }} />
    <Tabs.Screen name="settings" options={{ title: 'Ajustes', tabBarLabel: 'Ajustes' }} />
  </Tabs>;
}

// Posición flotante, superficie y elementos internos de cada pestaña.
const styles = StyleSheet.create({ barPosition: { position: 'absolute', left: 18, right: 18, bottom: 0 }, bar: { minHeight: 68, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderRadius: radius.xl, paddingHorizontal: 6, paddingVertical: 7 }, tab: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 2 }, iconPill: { minWidth: 44, height: 31, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill }, label: { fontSize: 10, lineHeight: 13 } });
