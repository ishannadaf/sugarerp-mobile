
import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

import colors from '../../constants/colors';

const tabs = [
  {
    key: 'Dashboard',
    label: 'Dashboard',
    icon: 'view-dashboard-outline',
    tabRoute: 'DashboardTab',
  },
  {
    key: 'Distribution',
    label: 'Distribution',
    icon: 'truck-delivery-outline',
    tabRoute: 'DistributionTab',
  },
  {
    key: 'Reports',
    label: 'Reports',
    icon: 'chart-box-outline',
    tabRoute: 'ReportsTab',
  },
  {
    key: 'Profile',
    label: 'Profile',
    icon: 'account-outline',
    tabRoute: 'ProfileTab',
  },
];

const BottomTabBar = ({ activeTab, navigation }) => {
  const insets = useSafeAreaInsets();

  const { hasRole } = useAuth();
  const isMaster = hasRole('MASTER');

  const visibleTabs = isMaster
    ? tabs
    : tabs.filter((tab) => tab.key === 'Distribution');

  const handlePress = (tab) => {
    if (tab.key === activeTab || !navigation) return;

    const state = navigation.getState();
    const isInsideTabNavigator = state?.type === 'tab';

    if (isInsideTabNavigator) {
      navigation.navigate(tab.tabRoute);
    } else {
      navigation.navigate('Dashboard', {
        screen: 'MainTabs',
        params: {
          screen: tab.tabRoute,
        },
      });
    }
  };

  return (
    <View
      style={[
        styles.bottomBar,
        {
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {visibleTabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => handlePress(tab)}
            style={[
              styles.tabItem,
              isActive && styles.activeTab,
            ]}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={isActive ? 27 : 25}
              color={
                isActive
                  ? colors.secondary || '#1E5E2A'
                  : colors.text || '#374151'
              }
            />

            <Text
              numberOfLines={1}
              style={[
                styles.tabText,
                isActive && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 8,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
    ...Platform.select({
      android: { elevation: 8 },
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 5,
      },
    }),
  },
  tabItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    paddingVertical: 5,
    paddingHorizontal: 2,
  },
  activeTab: {
    backgroundColor: '#A8F5A2',
  },
  tabText: {
    marginTop: 3,
    color: '#28352A',
    fontSize: 12,
    textAlign: 'center',
  },
  activeTabText: {
    color: '#1E5E2A',
    fontWeight: '700',
  },
});

export default BottomTabBar;
