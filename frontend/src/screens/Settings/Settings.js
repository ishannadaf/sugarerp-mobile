import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';

import BottomTabBar from '../../components/common/BottomTabBar';
import styles from './SettingsStyles';

const Settings = ({ navigation }) => {
  // --- Backend Ready States ---
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    role: 'Warehouse Manager',
    financialYear: 'FY 2023-24',
    sessionStatus: 'Active Session',
  });

  const [appConfig, setAppConfig] = useState({
    version: 'v2.4.12-industrial-build',
    badgeText: 'STABLE',
    brandBannerUri:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
  });

  // Dynamic Settings Menu Array (Easy to hook up with permissions or API toggles)
  const settingsMenu = [
    {
      id: 'financialYear',
      title: 'Financial Year Management',
      subtitle: 'Manage cycles and reporting periods',
      iconName: 'calendar-range-outline',
      actionRoute: 'FinancialYearSettings',
    },
    {
      id: 'userManagement',
      title: 'User Management',
      subtitle: 'Permissions, roles, and warehouse access',
      iconName: 'account-group-outline',
      actionRoute: 'UserManagement',
    },
    {
      id: 'printerSettings',
      title: 'Printer Settings',
      subtitle: 'Thermal printer and invoice layouts',
      iconName: 'printer-outline',
      actionRoute: 'PrinterSettings',
    },
    {
      id: 'backupRestore',
      title: 'Backup & Restore',
      subtitle: 'Sync database to cloud or local storage',
      iconName: 'cloud-sync-outline',
      actionRoute: 'BackupRestore',
    },
  ];

  // --- Fetch Data Handler (Example placeholder for backend integration) ---
  useEffect(() => {
    // async function fetchSettingsData() {
    //   setIsLoading(true);
    //   try {
    //     const data = await api.getSettings();
    //     setUserProfile(data.profile);
    //   } catch(e) { console.error(e); }
    //   finally { setIsLoading(false); }
    // }
    // fetchSettingsData();
  }, []);

  // --- Action Handlers ---
  const handleItemPress = (item) => {
    if (item.actionRoute) {
      try {
        navigation?.navigate(item.actionRoute);
      } catch (err) {
        Alert.alert(item.title, `Feature clicked: ${item.subtitle}`);
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out from the system?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            // TODO: Clear Auth Tokens / AsyncStorage here when backend is connected
            navigation?.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E5E2A" />

      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* <View style={styles.headerIconsRow}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={22} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.smallAvatar}>
            <MaterialCommunityIcons name="view-grid" size={20} color="#FFF" />
          </View>
        </View> */}
      </View>

      {/* Main Content Area */}
      <View style={styles.contentWrapper}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#1E5E2A" style={{ marginTop: 40 }} />
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* User Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.profileAvatar}>
                <MaterialCommunityIcons name="account-outline" size={32} color="#FFF" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileRole}>{userProfile.role}</Text>
                <Text style={styles.profileSession}>
                  {userProfile.financialYear} • {userProfile.sessionStatus}
                </Text>
              </View>
            </View>

            {/* Settings Menu List */}
            {settingsMenu.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuCard}
                activeOpacity={0.75}
                onPress={() => handleItemPress(item)}
              >
                <View style={styles.menuIconContainer}>
                  <MaterialCommunityIcons name={item.iconName} size={22} color="#1E5E2A" />
                </View>

                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>

                <Feather name="chevron-right" size={20} color="#374151" />
              </TouchableOpacity>
            ))}

            {/* App Version Item */}
            <View style={styles.menuCard}>
              <View style={styles.menuIconContainerGrey}>
                <Feather name="info" size={20} color="#374151" />
              </View>

              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>App Version</Text>
                <Text style={styles.menuSubtitle}>{appConfig.version}</Text>
              </View>

              <View style={styles.stableBadge}>
                <Text style={styles.stableBadgeText}>{appConfig.badgeText}</Text>
              </View>
            </View>

            {/* Branding Banner */}
            <ImageBackground
              source={{ uri: appConfig.brandBannerUri }}
              style={styles.bannerContainer}
              imageStyle={styles.bannerImage}
            >
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerText}>SUGARERP INDUSTRIAL</Text>
              </View>
            </ImageBackground>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              activeOpacity={0.8}
              onPress={handleLogout}
            >
              <MaterialCommunityIcons
                name="logout"
                size={22}
                color="#991B1B"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.logoutButtonText}>Logout from System</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Settings;