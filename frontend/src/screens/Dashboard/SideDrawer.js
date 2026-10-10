import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const SideDrawer = ({ navigation }) => {
  const { hasRole, logout } = useAuth();
  const isMaster = hasRole('MASTER');
  const menuLinks = [
    {
      label: 'Dashboard',
      icon: 'view-dashboard-outline',
      target: 'DashboardTab',
      isTab: true,
    },

    {
      label: 'Account Master',
      icon: 'bank-outline',
      target: 'Members',
      isTab: false,
    },

    {
      label: 'Rate Master',
      icon: 'cash-multiple',
      target: 'RateMaster',
      isTab: false,
    },

    {
      label: 'Sugar Distribution',
      icon: 'truck-delivery-outline',
      target: 'DistributionTab',
      isTab: true,
    },

    {
      label: 'Sugar Stock',
      icon: 'archive-outline',
      target: 'DistributionTab',
      isTab: true,
    },

    {
      label: 'Reports',
      icon: 'chart-box-outline',
      target: 'ReportsTab',
      isTab: true,
    },

    {
      label: 'Notice Generator',
      icon: 'file-document-outline',
      target: 'NoticeTab',
      isTab: true,
    },

    {
      label: 'Settings',
      icon: 'cog-outline',
      target: 'ProfileTab',
      isTab: true,
    },
  ];

  const visibleMenuLinks = isMaster
    ? menuLinks
    : menuLinks.filter(
        (item) =>
          item.target === 'DistributionTab'
      );

  const handleNavigation = (item) => {
    if (typeof navigation.closeDrawer === 'function') {
      navigation.closeDrawer();
    }

    if (item.isTab) {
      navigation.navigate('MainTabs', {
        screen: item.target,
      });
    } else {
      navigation.navigate(item.target);
    }
  };

  return (
    <View style={styles.container}>
      {/* Drawer Profile Header */}
      <View style={styles.profileHeader}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop',
          }}
          style={styles.avatar}
        />

        <View style={styles.profileTextContainer}>
          <Text style={styles.profileRole}>
            Warehouse Manager
          </Text>

          <Text style={styles.profileSession}>
            FY 2023-24
          </Text>
        </View>
      </View>

      {/* Drawer Menu */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {visibleMenuLinks.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.navLink}
            activeOpacity={0.7}
            onPress={() => handleNavigation(item)}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={22}
              color="#40493d"
              style={styles.linkIcon}
            />

            <Text style={styles.linkText}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.divider} />

        
        {/* Logout */}
        <TouchableOpacity
          style={[styles.navLink, styles.logoutLink]}
          activeOpacity={0.7}
          onPress={async () => {
            try {
              if (typeof navigation.closeDrawer === 'function') {
                navigation.closeDrawer();
              }

              // Clear the saved token and current user.
              await logout();

              // Reset the parent Stack navigator to Login.
              const parentNavigation = navigation.getParent();

              if (parentNavigation) {
                parentNavigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              } else {
                console.error(
                  'Could not find the parent Stack navigator.'
                );
              }
            } catch (error) {
              console.error(
                'Logout failed:',
                error?.message || error
              );
            }
          }}
        >
          <MaterialCommunityIcons
            name="logout"
            size={22}
            color="#ba1a1a"
            style={styles.linkIcon}
          />

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f3f3',
    paddingTop: 40,
  },

  profileHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#bfcaba',
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#2e7d32',
  },

  profileTextContainer: {
    marginLeft: 12,
  },

  profileRole: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0d631b',
  },

  profileSession: {
    fontSize: 12,
    color: '#40493d',
    marginTop: 2,
  },

  scrollContainer: {
    flex: 1,
    padding: 12,
  },

  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginBottom: 4,
  },

  linkIcon: {
    marginRight: 14,
    width: 24,
    alignItems: 'center',
  },

  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#40493d',
  },

  divider: {
    height: 1,
    backgroundColor: '#bfcaba',
    marginVertical: 12,
    marginHorizontal: 4,
  },

  logoutLink: {
    marginTop: 10,
  },

  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ba1a1a',
  },
});

export default SideDrawer;