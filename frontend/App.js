
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useAuth } from './src/context/AuthContext';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, Avatar } from 'react-native-paper';

import {
  NavigationContainer,
  DrawerActions,
  useNavigation,
} from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './src/context/AuthContext';

import LoginScreen from './src/screens/Login/LoginScreen';
import DashboardScreen from './src/screens/Dashboard/DashboardScreen';
import DistributionScreen from './src/screens/Distribution/DistributionScreen';
import DistributionForm from './src/screens/Distribution/DistributionForm';
import ReportsScreen from './src/screens/Reports/ReportsScreen';
import Members from './src/screens/Members/Members';
import AddMember from './src/screens/AddMember';
import RateMaster from './src/screens/RateMaster';
import Settings from './src/screens/Settings/Settings';
import Notice from './src/screens/Notice/Notice';

import BottomTabBar from './src/components/common/BottomTabBar';
import SideDrawer from './src/screens/Dashboard/SideDrawer';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const GlobalHeader = ({ title = 'SugarERP' }) => {
  const navigation = useNavigation();

  const openMenu = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={headerStyles.safeArea}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1E5E2A"
        translucent={false}
      />

      <View style={headerStyles.appBar}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open navigation menu"
          style={headerStyles.menuButton}
          onPress={openMenu}
        >
          <Ionicons name="menu-outline" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <Avatar.Image
          size={40}
          source={{
            uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200',
          }}
        />

        <View style={headerStyles.titleBlock}>
          <Text style={headerStyles.brandTitle}>{title}</Text>
          <Text style={headerStyles.financialYear}>FY 2023-24</Text>
        </View>

        <View style={{ flex: 1 }} />
      </View>
    </SafeAreaView>
  );
};


function HomeTabNavigator() {
  const { hasRole } = useAuth();
  const isMaster = hasRole('MASTER');

  return (
    <Tab.Navigator
      initialRouteName={
        isMaster ? 'DashboardTab' : 'DistributionTab'
      }
      screenOptions={{
        header: () => <GlobalHeader />,
      }}
      tabBar={({ state, navigation }) => {
        const routeName = state.routes[state.index].name;

        const activeTabMap = {
          DashboardTab: 'Dashboard',
          DistributionTab: 'Distribution',
          ReportsTab: 'Reports',
          NoticeTab: 'Reports',
          ProfileTab: 'Profile',
        };

        return (
          <BottomTabBar
            activeTab={activeTabMap[routeName]}
            navigation={navigation}
          />
        );
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
      />

      <Tab.Screen
        name="DistributionTab"
        component={DistributionScreen}
      />

      <Tab.Screen
        name="ReportsTab"
        component={ReportsScreen}
      />

      <Tab.Screen
        name="NoticeTab"
        component={Notice}
      />

      <Tab.Screen
        name="ProfileTab"
        component={Settings}
      />
    </Tab.Navigator>
  );
}


function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <SideDrawer {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={HomeTabNavigator}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PaperProvider>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen
                name="Login"
                component={LoginScreen}
              />

              <Stack.Screen
                name="Dashboard"
                component={DrawerNavigator}
              />

              <Stack.Screen
                name="DistributionForm"
                component={DistributionForm}
              />

              <Stack.Screen
                name="Members"
                component={Members}
              />

              <Stack.Screen
                name="AddMember"
                component={AddMember}
              />

              <Stack.Screen
                name="RateMaster"
                component={RateMaster}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const headerStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#1E5E2A',
  },

  appBar: {
    minHeight: 60,
    backgroundColor: '#1E5E2A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  menuButton: {
    padding: 8,
    marginRight: 4,
  },

  titleBlock: {
    marginLeft: 10,
  },

  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  financialYear: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
});
