
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import colors from '../constants/colors';
import {
  getShareCapitalRates,
  updateShareCapitalRate,
} from '../services/shareCapitalService';

const PRIMARY = colors.primary || '#1E5E2A';

const RateMaster = ({ navigation }) => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);

  const [form, setForm] = useState({
    minimumPaid: '',
    ratePerKg: '',
  });

  const loadRates = useCallback(async () => {
    try {
      const data = await getShareCapitalRates();

      const sortedRates = (Array.isArray(data) ? data : []).sort(
        (a, b) =>
          Number(a.minimum_paid_per_share) -
          Number(b.minimum_paid_per_share)
      );

      setRates(sortedRates);
    } catch (error) {
      console.error('Failed to load share capital rates:', error);
      Alert.alert(
        'Unable to Load Rates',
        error?.message || 'Please check your backend connection.'
      );
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await loadRates();
      setLoading(false);
    };

    initialize();
  }, [loadRates]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRates();
    setRefreshing(false);
  };

  const openEditModal = (item) => {
    setSelectedRate(item);
    setForm({
      minimumPaid: String(item.minimum_paid_per_share),
      ratePerKg: String(item.rate_per_kg),
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalVisible(false);
    setSelectedRate(null);
    setForm({
      minimumPaid: '',
      ratePerKg: '',
    });
  };

  const handleSave = async () => {
    if (!selectedRate) return;

    const minimumPaid = Number(form.minimumPaid);
    const ratePerKg = Number(form.ratePerKg);

    if (
      !form.minimumPaid.trim() ||
      !Number.isFinite(minimumPaid) ||
      minimumPaid < 0
    ) {
      Alert.alert(
        'Invalid Payment',
        'Enter a valid minimum payment per share.'
      );
      return;
    }

    if (
      !form.ratePerKg.trim() ||
      !Number.isFinite(ratePerKg) ||
      ratePerKg < 0
    ) {
      Alert.alert(
        'Invalid Rate',
        'Enter a valid sugar rate per kilogram.'
      );
      return;
    }

    setSaving(true);

    try {
      await updateShareCapitalRate(selectedRate.tier_code, {
        minimum_paid_per_share: minimumPaid,
        rate_per_kg: ratePerKg,
      });

      setModalVisible(false);
      setSelectedRate(null);

      await loadRates();

      Alert.alert('Success', 'Share capital rate updated successfully.');
    } catch (error) {
      console.error('Failed to update share capital rate:', error);

      Alert.alert(
        'Update Failed',
        error?.message || 'Unable to update the rate.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>
            Loading Share Capital Rates...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="#FFFFFF"
              />
            </Pressable>

            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Rate Master</Text>
              <Text style={styles.headerSubtitle}>
                Global share capital rates
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={23}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[PRIMARY]}
            />
          }
        >
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <MaterialCommunityIcons
                name="information-outline"
                size={24}
                color={PRIMARY}
              />
            </View>

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Global Rate Configuration</Text>
              <Text style={styles.infoDescription}>
                These rates apply across financial years. Each member's
                applicable rate is calculated from the lowest payment
                among their individual shares.
              </Text>
            </View>
          </View>

          <View style={styles.listHeader}>
            <View>
              <Text style={styles.sectionTitle}>Share Capital Tiers</Text>
              <Text style={styles.sectionDescription}>
                Tap a tier to edit its payment threshold and sugar rate.
              </Text>
            </View>

            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{rates.length}</Text>
            </View>
          </View>

          {rates.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons
                name="cash-multiple"
                size={42}
                color={PRIMARY}
              />
              <Text style={styles.emptyTitle}>No Tiers Found</Text>
              <Text style={styles.emptyDescription}>
                No share capital rate tiers were returned by the backend.
                Pull down to refresh.
              </Text>
            </View>
          ) : (
            <View style={styles.rateList}>
              {rates.map((item, index) => (
                <Pressable
                  key={item.tier_code}
                  style={[
                    styles.rateCard,
                    !item.is_active && styles.inactiveCard,
                  ]}
                  onPress={() => openEditModal(item)}
                >
                  <View style={styles.rateIconContainer}>
                    <MaterialCommunityIcons
                      name="currency-inr"
                      size={28}
                      color={PRIMARY}
                    />
                  </View>

                  <View style={styles.rateMain}>
                    <Text style={styles.tierLabel}>
                      TIER {index + 1}
                      {!item.is_active ? ' · INACTIVE' : ''}
                    </Text>

                    <Text style={styles.rateValue}>
                      ₹{Number(item.rate_per_kg).toFixed(2)}
                      <Text style={styles.rateUnit}> / KG</Text>
                    </Text>

                    <Text style={styles.rateDate}>
                      Minimum payment per share
                    </Text>

                    <Text style={styles.minimumValue}>
                      ₹
                      {Number(
                        item.minimum_paid_per_share
                      ).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </View>

                  <View style={styles.editIcon}>
                    <MaterialCommunityIcons
                      name="pencil-outline"
                      size={21}
                      color="#666666"
                    />
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>

        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={closeModal}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <Pressable
              style={styles.modalBackdrop}
              onPress={closeModal}
            />

            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Edit Rate Tier</Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedRate?.tier_code || ''}
                  </Text>
                </View>

                <Pressable
                  style={styles.closeButton}
                  onPress={closeModal}
                  disabled={saving}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color="#555555"
                  />
                </Pressable>
              </View>

              <ScrollView
                style={styles.modalBody}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Minimum Payment Per Share
                  </Text>

                  <View style={styles.inputWrapper}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                      style={styles.textInput}
                      value={form.minimumPaid}
                      onChangeText={(value) =>
                        setForm((previous) => ({
                          ...previous,
                          minimumPaid: value,
                        }))
                      }
                      placeholder="e.g. 5000"
                      placeholderTextColor="#999999"
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Rate Per Kilogram</Text>

                  <View style={styles.inputWrapper}>
                    <Text style={styles.currencySymbol}>₹</Text>
                    <TextInput
                      style={styles.textInput}
                      value={form.ratePerKg}
                      onChangeText={(value) =>
                        setForm((previous) => ({
                          ...previous,
                          ratePerKg: value,
                        }))
                      }
                      placeholder="e.g. 30"
                      placeholderTextColor="#999999"
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                <Text style={styles.helperText}>
                  Changes are saved to the global rate table and may
                  affect future distribution calculations.
                </Text>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={closeModal}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.saveButton,
                    saving && styles.disabledButton,
                  ]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="content-save-outline"
                        size={20}
                        color="#FFFFFF"
                      />
                      <Text style={styles.saveButtonText}>Update</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8F6',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F8F6',
  },
  header: {
    minHeight: 70,
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTextContainer: {
    flex: 1,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#DDEBDD',
    fontSize: 12,
    marginTop: 2,
  },
  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: '#EDF6EE',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    color: '#244C2B',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 5,
  },
  infoDescription: {
    color: '#536653',
    fontSize: 12,
    lineHeight: 18,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202020',
  },
  sectionDescription: {
    marginTop: 4,
    fontSize: 12,
    color: '#777777',
    lineHeight: 18,
  },
  countBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F2E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    color: PRIMARY,
    fontWeight: '700',
  },
  rateList: {
    gap: 10,
  },
  rateCard: {
    minHeight: 112,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E5E2',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inactiveCard: {
    opacity: 0.6,
  },
  rateIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EDF6EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rateMain: {
    flex: 1,
  },
  tierLabel: {
    color: '#777777',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  rateValue: {
    fontSize: 19,
    fontWeight: '700',
    color: '#222222',
  },
  rateUnit: {
    fontSize: 13,
    fontWeight: '500',
    color: '#777777',
  },
  rateDate: {
    marginTop: 5,
    fontSize: 11,
    color: '#777777',
  },
  minimumValue: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '700',
    color: PRIMARY,
  },
  editIcon: {
    marginLeft: 8,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E5E1',
    padding: 28,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222222',
    marginTop: 12,
  },
  emptyDescription: {
    textAlign: 'center',
    color: '#777777',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666666',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
  },
  modalSubtitle: {
    marginTop: 3,
    color: '#777777',
    fontSize: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginTop: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444444',
    marginBottom: 7,
  },
  inputWrapper: {
    height: 52,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#D8DCD7',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: PRIMARY,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#222222',
  },
  helperText: {
    marginTop: 14,
    marginBottom: 18,
    fontSize: 12,
    color: '#777777',
    lineHeight: 18,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#D5D5D5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#555555',
    fontSize: 14,
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 11,
    backgroundColor: PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default RateMaster;
