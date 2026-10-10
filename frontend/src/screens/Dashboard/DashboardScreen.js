import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useFocusEffect } from '@react-navigation/native';

import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import AppShell from '../../components/layout/AppShell';
import colors from '../../constants/colors';
import styles from './DashboardStyles';

import {
  getDashboardSummary,
  getMembers,
} from '../../services/dashboardService';


const quickActions = [
  {
    label: 'Account\nMaster',
    icon: 'bank-outline',
  },
  {
    label: 'Sugar\nDistribution',
    icon: 'truck-delivery-outline',
  },
  {
    label: 'Sugar Stock',
    icon: 'archive-outline',
  },
  {
    label: 'Reports',
    icon: 'chart-box-outline',
  },
  {
    label: 'Notices',
    icon: 'file-document-outline',
  },
  {
    label: 'Settings',
    icon: 'cog-outline',
  },
];


const AnimatedPressable = ({
  children,
  style,
  onPress,
}) => {
  const scale = useRef(
    new Animated.Value(1)
  ).current;

  const animate = (toValue) => {
    Animated.spring(scale, {
      toValue,
      useNativeDriver: true,
      friction: 7,
      tension: 90,
    }).start();
  };

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [
            {
              scale,
            },
          ],
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => animate(0.96)}
        onPressOut={() => animate(1)}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};


const DashboardScreen = ({
  navigation,
}) => {
  const contentOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const contentTranslate = useRef(
    new Animated.Value(18)
  ).current;

  const [dashboard, setDashboard] =
    useState(null);

  const [memberCount, setMemberCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState(null);


  /*
   * Dashboard entrance animation
   */
  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
      }),

      Animated.spring(contentTranslate, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }),
    ]).start();
  }, [
    contentOpacity,
    contentTranslate,
  ]);


  /*
   * Load dashboard data
   */
  const loadDashboard = useCallback(
    async () => {
      try {
        setError(null);

        const [
          dashboardData,
          membersData,
        ] = await Promise.all([
          getDashboardSummary(),
          getMembers(),
        ]);

        setDashboard(dashboardData);

        setMemberCount(
          Array.isArray(membersData)
            ? membersData.length
            : 0
        );
      } catch (err) {
        console.log(
          'Dashboard loading failed:',
          err
        );

        setError(
          err?.message ||
          'Unable to load dashboard'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  /*
   * Initial dashboard load
   */
  useFocusEffect(
    useCallback(() => {
      loadDashboard();

      return undefined;
    }, [loadDashboard])
  );

  /*
   * Manual refresh
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };


  /*
   * Quick action navigation
   */
  const handleActionPress = (
    label
  ) => {
    if (!navigation) {
      return;
    }

    if (label.includes('Account')) {
      navigation.navigate('Members');

    } else if (
      label.includes('Distribution')
    ) {
      navigation.navigate(
        'DistributionTab'
      );

    } else if (
      label.includes('Stock')
    ) {
      navigation.navigate(
        'Distribution'
      );

    } else if (
      label.includes('Reports')
    ) {
      navigation.navigate(
        'ReportsTab'
      );

    } else if (
      label.includes('Settings')
    ) {
      navigation.navigate(
        'ProfileTab'
      );

    } else if (
      label.includes('Notices')
    ) {
      navigation.navigate(
        'NoticeTab'
      );
    }
  };


  /*
   * Format currency
   */
  const formatCurrency = (
    amount
  ) => {
    const value = Number(amount || 0);

    return `₹${Math.round(
      value
    ).toLocaleString('en-IN')}`;
  };


  /*
   * Format number
   */
  const formatNumber = (
    value
  ) => {
    return Math.round(
      Number(value || 0)
    ).toLocaleString('en-IN');
  };


  return (
    <AppShell
      activeTab="Dashboard"
      navigation={navigation}
      title="SugarERP"
    >
      <Animated.View
        style={[
          styles.content,
          {
            flex: 1,
            opacity: contentOpacity,
            transform: [
              {
                translateY:
                  contentTranslate,
              },
            ],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
          refreshing={refreshing}
          onRefresh={handleRefresh}
        >

          {/* =========================
              HEADER
          ========================== */}

          <View style={styles.hero}>
            <Text style={styles.pageTitle}>
              Warehouse Dashboard
            </Text>

            <Text style={styles.pageSubtitle}>
              Real-time distribution oversight
            </Text>
          </View>


          {/* =========================
              ERROR MESSAGE
          ========================== */}

          {error ? (
            <Pressable
              onPress={handleRefresh}
              style={{
                marginBottom: 12,
                padding: 12,
                borderRadius: 10,
                backgroundColor:
                  colors.surface,
                borderWidth: 1,
                borderColor:
                  colors.error ||
                  colors.primary,
              }}
            >
              <Text
                style={{
                  color:
                    colors.error ||
                    colors.primary,
                  fontSize: 13,
                }}
              >
                {error}
              </Text>

              <Text
                style={{
                  marginTop: 4,
                  color:
                    colors.textSecondary ||
                    colors.text,
                  fontSize: 12,
                }}
              >
                Tap to retry
              </Text>
            </Pressable>
          ) : null}


          {/* =========================
              MEMBERS
          ========================== */}

          <Pressable
            style={styles.memberCard}
            onPress={() =>
              navigation?.navigate(
                'Members'
              )
            }
          >
            <View>
              <Text style={styles.statLabel}>
                TOTAL MEMBERS
              </Text>

              <Text
                style={styles.memberCount}
              >
                {loading
                  ? '...'
                  : memberCount.toLocaleString(
                      'en-IN'
                    )}
              </Text>
            </View>

            <View
              style={styles.memberGrowth}
            >
              <MaterialCommunityIcons
                name="account-check-outline"
                size={16}
                color={colors.primary}
              />

              <Text
                style={
                  styles.memberGrowthText
                }
              >
                Active members
              </Text>
            </View>

            <MaterialCommunityIcons
              name="account-group"
              size={104}
              color={colors.iconGhost}
              style={styles.memberIcon}
            />
          </Pressable>


          {/* =========================
              TODAY'S STATISTICS
          ========================== */}

          <View style={styles.statsRow}>

            {/* Distribution */}
            <View style={styles.smallCard}>
              <Text style={styles.cardTitle}>
                Distribution
              </Text>

              <View>
                <Text
                  style={styles.cardValue}
                >
                  {loading
                    ? '...'
                    : formatNumber(
                        dashboard?.total_weight_kg
                      )}
                </Text>

                <Text
                  style={
                    styles.cardSubtitle
                  }
                >
                  Today (KG)
                </Text>
              </View>

              <MaterialCommunityIcons
                name="truck-delivery-outline"
                size={43}
                color={colors.secondary}
              />
            </View>


            {/* Bags */}
            <View style={styles.smallCard}>
              <Text style={styles.cardTitle}>
                Bags Distributed
              </Text>

              <View>
                <Text
                  style={styles.cardValue}
                >
                  {loading
                    ? '...'
                    : formatNumber(
                        dashboard?.bag_count
                      )}
                </Text>

                <Text
                  style={
                    styles.cardSubtitle
                  }
                >
                  Today (Bags)
                </Text>
              </View>

              <MaterialCommunityIcons
                name="sack"
                size={43}
                color={colors.primary}
              />
            </View>

          </View>


          {/* =========================
              COLLECTION / PENDING
          ========================== */}

          <View style={styles.statsRow}>

            <View style={styles.smallCard}>
              <Text style={styles.cardTitle}>
                Collected
              </Text>

              <View>
                <Text
                  style={styles.cardValue}
                >
                  {loading
                    ? '...'
                    : formatCurrency(
                        dashboard?.collected_amount
                      )}
                </Text>

                <Text
                  style={
                    styles.cardSubtitle
                  }
                >
                  Today
                </Text>
              </View>

              <MaterialCommunityIcons
                name="cash-check"
                size={43}
                color={colors.primary}
              />
            </View>


            <View style={styles.smallCard}>
              <Text style={styles.cardTitle}>
                Pending
              </Text>

              <View>
                <Text
                  style={styles.cardValue}
                >
                  {loading
                    ? '...'
                    : formatCurrency(
                        dashboard?.pending_amount
                      )}
                </Text>

                <Text
                  style={
                    styles.cardSubtitle
                  }
                >
                  Today
                </Text>
              </View>

              <MaterialCommunityIcons
                name="cash-clock"
                size={43}
                color={colors.secondary}
              />
            </View>

          </View>


          {/* =========================
              TODAY'S DISTRIBUTION
          ========================== */}

          <AnimatedPressable
            style={
              styles.distributedCard
            }
            onPress={() =>
              navigation?.navigate(
                'Distribution'
              )
            }
          >
            <View
              style={
                styles.distributedRow
              }
            >
              <View
                style={
                  styles.distributedContent
                }
              >
                <View
                  style={
                    styles.distributedIconBox
                  }
                >
                  <MaterialCommunityIcons
                    name="scale-balance"
                    size={32}
                    color={colors.white}
                  />
                </View>

                <View>
                  <Text
                    style={
                      styles.distributedTitle
                    }
                  >
                    Today's Distribution
                  </Text>

                  <Text
                    style={
                      styles.distributedValue
                    }
                  >
                    {loading
                      ? '...'
                      : `${formatNumber(
                          dashboard?.total_weight_kg
                        )} KG`}
                  </Text>
                </View>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={32}
                color={colors.greenSoft}
              />
            </View>
          </AnimatedPressable>


          {/* =========================
              QUICK ACTIONS
          ========================== */}

          <View style={styles.section}>
            <Text
              style={styles.sectionTitle}
            >
              Quick Actions
            </Text>

            <View
              style={styles.actionGrid}
            >
              {quickActions.map(
                (item) => (
                  <AnimatedPressable
                    key={item.label}
                    style={
                      styles.actionCard
                    }
                    onPress={() =>
                      handleActionPress(
                        item.label
                      )
                    }
                  >
                    <View
                      style={
                        styles.actionInner
                      }
                    >
                      <View
                        style={
                          styles.actionIcon
                        }
                      >
                        <MaterialCommunityIcons
                          name={item.icon}
                          size={30}
                          color={
                            colors.white
                          }
                        />
                      </View>

                      <Text
                        style={
                          styles.actionText
                        }
                      >
                        {item.label}
                      </Text>
                    </View>
                  </AnimatedPressable>
                )
              )}
            </View>
          </View>


          {/* =========================
              RECENT ACTIVITY
          ========================== */}

          <View
            style={styles.logsHeader}
          >
            <Text
              style={styles.sectionTitle}
            >
              Today's Activity
            </Text>

            <Pressable
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <Text
                style={styles.viewAll}
              >
                {refreshing
                  ? 'Refreshing...'
                  : 'Refresh'}
              </Text>
            </Pressable>
          </View>


          <View style={styles.logsList}>

            {/* Distribution activity */}
            <View style={styles.logCard}>
              <View
                style={styles.logBar}
              />

              <View
                style={
                  styles.logTextBlock
                }
              >
                <Text
                  style={styles.logTitle}
                >
                  Today's Distribution
                </Text>

                <Text
                  style={
                    styles.logSubtitle
                  }
                >
                  {loading
                    ? 'Loading...'
                    : `${formatNumber(
                        dashboard?.distribution_count
                      )} distribution entries`}
                </Text>
              </View>

              <Text
                style={styles.logTime}
              >
                Today
              </Text>
            </View>


            {/* Collection activity */}
            <View style={styles.logCard}>
              <View
                style={styles.logBar}
              />

              <View
                style={
                  styles.logTextBlock
                }
              >
                <Text
                  style={styles.logTitle}
                >
                  Today's Collection
                </Text>

                <Text
                  style={
                    styles.logSubtitle
                  }
                >
                  {loading
                    ? 'Loading...'
                    : `${formatCurrency(
                        dashboard?.collected_amount
                      )} collected`}
                </Text>
              </View>

              <Text
                style={styles.logTime}
              >
                Today
              </Text>
            </View>


            {/* Pending activity */}
            <View style={styles.logCard}>
              <View
                style={styles.logBar}
              />

              <View
                style={
                  styles.logTextBlock
                }
              >
                <Text
                  style={styles.logTitle}
                >
                  Pending Collection
                </Text>

                <Text
                  style={
                    styles.logSubtitle
                  }
                >
                  {loading
                    ? 'Loading...'
                    : `${formatCurrency(
                        dashboard?.pending_amount
                      )} pending`}
                </Text>
              </View>

              <Text
                style={styles.logTime}
              >
                Today
              </Text>
            </View>

          </View>

        </ScrollView>


        {/* =========================
            SCAN / DISTRIBUTION FAB
        ========================== */}

        <AnimatedPressable
          style={styles.fab}
          onPress={() =>
            navigation?.navigate(
              'DistributionForm'
            )
          }
        >
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={31}
            color={colors.white}
          />
        </AnimatedPressable>

      </Animated.View>
    </AppShell>
  );
};


export default DashboardScreen;