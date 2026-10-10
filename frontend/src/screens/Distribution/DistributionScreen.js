import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';

import AppShell from '../../components/layout/AppShell';
import {
  getDistributions,
  deleteDistribution,
} from '../../services/distributionService';
import {
  getTalukas,
  getVillages,
} from '../../services/villageService';
import { apiGet } from '../../services/apiClient';

const GREEN = '#1E5E2A';
const PAGE_BG = '#F5F7F5';
const BORDER = '#E5E7EB';

const unwrap = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

const DistributionScreen = ({ navigation }) => {
  const [distributions, setDistributions] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [villages, setVillages] = useState([]);

  const [searchText, setSearchText] = useState('');
  const [selectedTaluka, setSelectedTaluka] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);

  const [picker, setPicker] = useState({
    visible: false,
    type: '',
  });

  const [isMaster, setIsMaster] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load distributions, talukas, villages and logged-in user.
  const loadData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const [
        distributionResponse,
        talukaResponse,
        villageResponse,
        userResponse,
      ] = await Promise.all([
        getDistributions(),
        getTalukas(),
        getVillages(),
        apiGet('/users/me'),
      ]);

      const userData = userResponse?.data ?? userResponse;
      const roles = Array.isArray(userData?.roles)
        ? userData.roles
        : [];

      setIsMaster(roles.includes('MASTER'));
      setDistributions(unwrap(distributionResponse));
      setTalukas(unwrap(talukaResponse));
      setVillages(unwrap(villageResponse));
    } catch (error) {
      console.error('Failed to load distribution history:', error);

      Alert.alert(
        'Loading Failed',
        error?.message || 'Could not load distribution history.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter villages according to the selected taluka.
  const visibleVillages = useMemo(() => {
    if (!selectedTaluka) return villages;

    return villages.filter(
      (village) =>
        String(village.taluka_id) === String(selectedTaluka.id)
    );
  }, [villages, selectedTaluka]);

  // Search ONLY by member_code and apply location filters.
  const filteredDistributions = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return distributions.filter((item) => {
      const village = villages.find(
        (entry) => String(entry.id) === String(item.village_id)
      );

      const memberCode = String(item.member_code ?? '')
        .trim()
        .toLowerCase();

      const matchesSearch =
        !search || memberCode.includes(search);

      const matchesTaluka =
        !selectedTaluka ||
        String(village?.taluka_id) === String(selectedTaluka.id);

      const matchesVillage =
        !selectedVillage ||
        String(item.village_id) === String(selectedVillage.id);

      return matchesSearch && matchesTaluka && matchesVillage;
    });
  }, [
    distributions,
    villages,
    searchText,
    selectedTaluka,
    selectedVillage,
  ]);

  const openNewDistribution = () => {
    navigation.navigate('DistributionForm');
  };

  const openPicker = (type) => {
    setPicker({ visible: true, type });
  };

  const chooseTaluka = (taluka) => {
    setSelectedTaluka(taluka);
    setSelectedVillage(null);
    setPicker({ visible: false, type: '' });
  };

  const chooseVillage = (village) => {
    setSelectedVillage(village);
    setPicker({ visible: false, type: '' });
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedTaluka(null);
    setSelectedVillage(null);
  };

  // Ask for confirmation before deleting a distribution.
  const confirmDelete = (item) => {
    if (!isMaster) {
      Alert.alert(
        'Permission Denied',
        'Only MASTER users can delete distribution records.'
      );
      return;
    }

    Alert.alert(
      'Delete Distribution',
      `Delete the distribution record for Member Code ${
        item.member_code ?? '—'
      }?\n\nThis will deactivate the record.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => performDelete(item),
        },
      ]
    );
  };

  const performDelete = async (item) => {
    try {
      setDeletingId(item.id);

      await deleteDistribution(item.id);

      setDistributions((current) =>
        current.filter(
          (distribution) =>
            String(distribution.id) !== String(item.id)
        )
      );

      Alert.alert(
        'Deleted',
        'Distribution record deactivated successfully.'
      );
    } catch (error) {
      console.error('Distribution delete failed:', error);

      Alert.alert(
        'Delete Failed',
        error?.message ||
          'Could not delete this distribution record.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (value) => {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatMoney = (value) => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) return '₹0.00';

    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Distribution history card.
  const renderDistribution = ({ item }) => {
    const village = villages.find(
      (entry) => String(entry.id) === String(item.village_id)
    );

    const taluka = talukas.find(
      (entry) => String(entry.id) === String(village?.taluka_id)
    );

    const isDeleting = String(deletingId) === String(item.id);

    return (
      <TouchableOpacity
        activeOpacity={isMaster ? 0.8 : 1}
        disabled={isDeleting}
        onPress={() => {
          if (isMaster) confirmDelete(item);
        }}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: BORDER,
          padding: 15,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text
              style={{
                color: '#111827',
                fontSize: 16,
                fontWeight: '800',
              }}
            >
              Member Code: {item.member_code ?? '—'}
            </Text>

            <Text
              style={{
                color: '#6B7280',
                marginTop: 5,
                fontSize: 13,
              }}
            >
              {village?.name ||
                `Village ID: ${item.village_id ?? '—'}`}
              {taluka?.name ? ` • ${taluka.name}` : ''}
            </Text>
          </View>

          {isMaster && (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: '#FEE2E2',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isDeleting ? (
                <ActivityIndicator
                  size="small"
                  color="#B91C1C"
                />
              ) : (
                <Feather
                  name="trash-2"
                  size={17}
                  color="#B91C1C"
                />
              )}
            </View>
          )}
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: '#F0F2F0',
            marginVertical: 12,
          }}
        />

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <View style={{ minWidth: '40%' }}>
            <Text style={{ color: '#6B7280', fontSize: 12 }}>
              Distribution Date
            </Text>
            <Text
              style={{
                color: '#111827',
                fontSize: 14,
                fontWeight: '700',
                marginTop: 4,
              }}
            >
              {formatDate(item.distribution_date)}
            </Text>
          </View>

          <View style={{ minWidth: '35%' }}>
            <Text style={{ color: '#6B7280', fontSize: 12 }}>
              Bags
            </Text>
            <Text
              style={{
                color: '#111827',
                fontSize: 14,
                fontWeight: '700',
                marginTop: 4,
              }}
            >
              {item.bag_count ?? 0}
            </Text>
          </View>

          <View style={{ minWidth: '40%' }}>
            <Text style={{ color: '#6B7280', fontSize: 12 }}>
              Rate per kg
            </Text>
            <Text
              style={{
                color: '#111827',
                fontSize: 14,
                fontWeight: '700',
                marginTop: 4,
              }}
            >
              {formatMoney(item.rate_per_kg)}
            </Text>
          </View>

          <View style={{ minWidth: '35%' }}>
            <Text style={{ color: '#6B7280', fontSize: 12 }}>
              Total Amount
            </Text>
            <Text
              style={{
                color: GREEN,
                fontSize: 15,
                fontWeight: '800',
                marginTop: 4,
              }}
            >
              {formatMoney(item.total_amount)}
            </Text>
          </View>
        </View>

        {isMaster && (
          <Text
            style={{
              color: '#B91C1C',
              fontSize: 12,
              marginTop: 12,
            }}
          >
            Tap this record to delete
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const pickerOptions =
    picker.type === 'taluka'
      ? talukas
      : picker.type === 'village'
        ? visibleVillages
        : [];

  return (
    <AppShell
      activeTab="Distribution"
      navigation={navigation}
      title="Sugar Distribution"
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={GREEN}
        translucent={false}
      />

      <View
        style={{
          flex: 1,
          backgroundColor: PAGE_BG,
          padding: 20,
        }}
      >
        {/* New Distribution section */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: BORDER,
            padding: 22,
            marginTop: 12,
          }}
        >
          {/* <View
            style={{
              width: 58,
              height: 58,
              borderRadius: 16,
              backgroundColor: '#DCFCE7',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 18,
            }}
          >
          </View> */}

          <Text
            style={{
              fontSize: 22,
              fontWeight: '800',
              alignSelf: 'center',
              paddingBottom: 18,
              color: '#111827',
            }}
          >
            Sugar Distribution
          </Text>

          {/* <Text
            style={{
              fontSize: 14,
              lineHeight: 21,
              color: '#6B7280',
              marginTop: 8,
              marginBottom: 22,
            }}
          >
            Select a member, verify their Share Capital rate,
            record the number of bags, and capture a delivery photo.
          </Text> */}

          <TouchableOpacity
            onPress={openNewDistribution}
            activeOpacity={0.85}
            style={{
              minHeight: 54,
              backgroundColor: GREEN,
              borderRadius: 12,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons
                name="person-add-outline"
                size={22}
                color="#FFFFFF"
              />
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 15,
                  fontWeight: '800',
                  marginLeft: 10,
                }}
              >
                New Member Distribution
              </Text>
            </View>

            <Feather
              name="arrow-right"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Distribution history */}
        <View style={{ marginTop: 24, flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '800',
                  color: '#111827',
                }}
              >
                Distribution History
              </Text>
              <Text
                style={{
                  color: '#6B7280',
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                {filteredDistributions.length} record(s)
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setRefreshing(true);
                loadData(false);
              }}
              style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: '#DCFCE7',
              }}
            >
              <Feather
                name="refresh-cw"
                size={18}
                color={GREEN}
              />
            </TouchableOpacity>
          </View>

          {/* Search by member code */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: BORDER,
              borderRadius: 12,
              paddingHorizontal: 12,
              marginBottom: 12,
            }}
          >
            <Feather
              name="search"
              size={19}
              color="#6B7280"
            />

            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search by Member Code"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              style={{
                flex: 1,
                paddingVertical: 13,
                paddingHorizontal: 10,
                color: '#111827',
                fontSize: 14,
              }}
            />

            {!!searchText && (
              <TouchableOpacity
                onPress={() => setSearchText('')}
              >
                <Feather
                  name="x-circle"
                  size={18}
                  color="#6B7280"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Taluka and village filters */}
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => openPicker('taluka')}
              style={{
                flex: 1,
                minHeight: 46,
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: BORDER,
                paddingHorizontal: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  color: selectedTaluka ? '#111827' : '#6B7280',
                  flex: 1,
                  fontSize: 13,
                }}
              >
                {selectedTaluka?.name || 'All Talukas'}
              </Text>
              <Feather
                name="chevron-down"
                size={17}
                color="#6B7280"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openPicker('village')}
              style={{
                flex: 1,
                minHeight: 46,
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: BORDER,
                paddingHorizontal: 10,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  color: selectedVillage ? '#111827' : '#6B7280',
                  flex: 1,
                  fontSize: 13,
                }}
              >
                {selectedVillage?.name || 'All Villages'}
              </Text>
              <Feather
                name="chevron-down"
                size={17}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          {(selectedTaluka || selectedVillage || searchText) && (
            <TouchableOpacity
              onPress={clearFilters}
              style={{
                alignSelf: 'flex-end',
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: GREEN,
                  fontSize: 13,
                  fontWeight: '700',
                }}
              >
                Clear filters
              </Text>
            </TouchableOpacity>
          )}

          {loading ? (
            <View
              style={{
                padding: 30,
                alignItems: 'center',
              }}
            >
              <ActivityIndicator size="large" color={GREEN} />
              <Text
                style={{
                  color: '#6B7280',
                  marginTop: 10,
                }}
              >
                Loading distributions...
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredDistributions}
              keyExtractor={(item, index) =>
                String(item.id ?? index)
              }
              renderItem={renderDistribution}
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadData(false);
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingBottom: 30,
                flexGrow: 1,
              }}
              ListEmptyComponent={
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    padding: 24,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: BORDER,
                  }}
                >
                  <Ionicons
                    name="file-tray-outline"
                    size={32}
                    color="#9CA3AF"
                  />
                  <Text
                    style={{
                      color: '#374151',
                      fontWeight: '700',
                      marginTop: 10,
                    }}
                  >
                    No distributions found
                  </Text>
                  <Text
                    style={{
                      color: '#6B7280',
                      fontSize: 13,
                      marginTop: 5,
                      textAlign: 'center',
                    }}
                  >
                    Try changing the member code, taluka, or village filter.
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>

      {/* Taluka and village picker modal */}
      <Modal
        visible={picker.visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setPicker({ visible: false, type: '' })
        }
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.45)',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              maxHeight: '70%',
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 18,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  color: '#111827',
                  fontSize: 18,
                  fontWeight: '800',
                }}
              >
                Select {picker.type === 'taluka' ? 'Taluka' : 'Village'}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setPicker({ visible: false, type: '' })
                }
              >
                <Feather
                  name="x"
                  size={23}
                  color="#374151"
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={pickerOptions}
              keyExtractor={(item) => String(item.id)}
              ListHeaderComponent={
                <TouchableOpacity
                  onPress={() => {
                    if (picker.type === 'taluka') {
                      setSelectedTaluka(null);
                      setSelectedVillage(null);
                    } else {
                      setSelectedVillage(null);
                    }

                    setPicker({ visible: false, type: '' });
                  }}
                  style={{
                    paddingVertical: 13,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F0F2F0',
                  }}
                >
                  <Text
                    style={{
                      color: GREEN,
                      fontWeight: '800',
                    }}
                  >
                    All {picker.type === 'taluka' ? 'Talukas' : 'Villages'}
                  </Text>
                </TouchableOpacity>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    if (picker.type === 'taluka') {
                      chooseTaluka(item);
                    } else {
                      chooseVillage(item);
                    }
                  }}
                  style={{
                    paddingVertical: 14,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F0F2F0',
                  }}
                >
                  <Text
                    style={{
                      color: '#111827',
                      fontSize: 15,
                    }}
                  >
                    {item.name || `#${item.id}`}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text
                  style={{
                    color: '#6B7280',
                    paddingVertical: 20,
                  }}
                >
                  No options available.
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </AppShell>
  );
};

export default DistributionScreen;