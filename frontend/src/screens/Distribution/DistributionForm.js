import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  Modal,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';

import BottomTabBar from '../../components/common/BottomTabBar';
import styles from './DistributionFormStyles';

import { apiGet } from '../../services/apiClient';
import { getDistributions, createDistribution } from '../../services/distributionService';
import { getMembers } from '../../services/memberService';
import { getVillages } from '../../services/villageService';
import { uploadDistributionPhoto } from '../../services/photoService';
import { getMemberShareCapital } from '../../services/shareCapitalService';

const BAG_WEIGHT_KG = 50;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatApiDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const formatDate = (date) =>
  `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

const getCalendarDays = (date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const dayCount = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  return [
    ...Array(firstDay).fill(null),
    ...Array.from(
      { length: dayCount },
      (_, index) => new Date(date.getFullYear(), date.getMonth(), index + 1)
    ),
  ];
};

const getList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.members)) return response.members;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const DistributionForm = ({ navigation }) => {
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [calendarVisible, setCalendarVisible] = useState(false);

  const [talukas, setTalukas] = useState([]);
  const [villages, setVillages] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedTaluka, setSelectedTaluka] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [masterLoading, setMasterLoading] = useState(true);
  const [dropdown, setDropdown] = useState(null);

  const [searchCode, setSearchCode] = useState('');
  const [member, setMember] = useState(null);
  const [memberLoading, setMemberLoading] = useState(false);

  // New: member distribution validation
  const [distributionError, setDistributionError] = useState('');
  const [alreadyDistributed, setAlreadyDistributed] = useState(false);

  const [applicableRate, setApplicableRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState('');

  const [bagCount, setBagCount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const cameraRef = useRef(null);

  const [scannerOpen, setScannerOpen] = useState(false);
  const scanCooldown = useRef(false);

  const bagCountNum = Number.parseInt(bagCount, 10) || 0;
  const totalWeight = bagCountNum * BAG_WEIGHT_KG;
  const eligibility = Number(member?.eligibility_kg || 0);
  const rateNum = Number(applicableRate?.rate ?? 0);
  const totalAmount = totalWeight * rateNum;

  const talukaVillages = useMemo(() => {
    if (!selectedTaluka) return [];

    return villages.filter(
      (village) => String(village.taluka_id) === String(selectedTaluka.id)
    );
  }, [villages, selectedTaluka]);

  const loadMasterData = useCallback(async () => {
    try {
      setMasterLoading(true);

      const [talukaResult, villageResult, routeResult] = await Promise.all([
        apiGet('/master/talukas'),
        getVillages(),
        apiGet('/master/routes').catch(() => []),
      ]);

      const talukaList = getList(talukaResult);
      const villageList = getList(villageResult);
      const routeList = getList(routeResult);

      setTalukas(talukaList);
      setVillages(villageList);
      setRoutes(routeList);

      if (talukaList.length === 1) {
        setSelectedTaluka(talukaList[0]);
      }
    } catch (error) {
      console.error('Distribution master data loading failed:', error);

      Alert.alert(
        'Unable to Load Data',
        error?.message || 'Could not load talukas and villages.'
      );
    } finally {
      setMasterLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);

  const loadMemberRate = useCallback(async (memberId) => {
    setApplicableRate(null);
    setRateError('');

    if (!memberId) {
      setRateError('Member ID is missing.');
      return false;
    }

    try {
      setRateLoading(true);

      const result = await getMemberShareCapital(memberId);
      const rate = Number(result?.applicable_rate_per_kg);

      if (
        result?.applicable_rate_per_kg == null ||
        !Number.isFinite(rate) ||
        rate < 0
      ) {
        throw new Error('The server did not return a valid Share Capital rate.');
      }

      setApplicableRate({
        rate,
        qualifyingMinimumPerShare: result?.qualifying_minimum_per_share ?? null,
      });

      return true;
    } catch (error) {
      console.error('Member rate lookup failed:', error);
      setRateError(error?.message || 'Could not calculate this member’s rate.');
      return false;
    } finally {
      setRateLoading(false);
    }
  }, []);

  // Check whether the member already received sugar during the
  // financial year containing the selected distribution date.
  const checkExistingDistribution = useCallback(async (foundMember) => {
    const memberId = foundMember?.id ?? foundMember?.member_id;

    if (!memberId) {
      throw new Error('Member ID is missing. Cannot verify distribution history.');
    }

    const year = selectedDate.getFullYear();
    const financialYearStart =
      selectedDate.getMonth() >= 3 ? year : year - 1;

    const fromDate = `${financialYearStart}-04-01`;
    const toDate = `${financialYearStart + 1}-03-31`;

    const response = await getDistributions({
      memberId,
      fromDate,
      toDate,
    });

    const list = getList(response);

    const duplicate = list.some((item) => {
      const existingMemberId = item.member_id ?? item.member?.id;
      const isActive = item.is_active !== false && item.active !== false;

      return (
        String(existingMemberId) === String(memberId) &&
        isActive
      );
    });

    if (duplicate) {
      setAlreadyDistributed(true);
      setDistributionError(
        `Distribution Already Completed: ${foundMember.member_code || foundMember.full_name || 'This member'} has already received sugar during financial year ${financialYearStart}-${String(financialYearStart + 1).slice(-2)}. A second distribution is not allowed.`
      );

      return false;
    }

    setAlreadyDistributed(false);
    setDistributionError('');
    return true;
  }, [selectedDate]);

  const fetchMemberByCode = useCallback(async (rawValue) => {
    const searchValue = String(rawValue ?? '').trim();

    if (!searchValue) {
      Alert.alert('Member Required', 'Enter or scan the member ID or member code.');
      return;
    }

    try {
      setMemberLoading(true);
      setMember(null);

      setDistributionError('');
      setAlreadyDistributed(false);

      setApplicableRate(null);
      setRateError('');
      setSelectedVillage(null);
      setSelectedTaluka(null);
      setSelectedRoute(null);
      setCapturedImage(null);
      setBagCount('');
      setErrors({});

      let found = null;

      // Search through the existing members API.
      try {
        const response = await getMembers({ search: searchValue });
        const list = getList(response);
        const normalized = searchValue.toUpperCase();

        found = list.find(
          (item) => String(item.member_code || '').toUpperCase() === normalized
        );

        // Barcode may contain the numeric database member ID.
        if (!found) {
          found = list.find(
            (item) =>
              String(item.id ?? '') === searchValue ||
              String(item.member_id ?? '') === searchValue
          );
        }
      } catch (searchError) {
        console.warn(
          'Member search endpoint did not return a match:',
          searchError?.message
        );
      }

      // If the scanned value is a numeric database ID, try direct ID lookup.
      if (!found && /^\d+$/.test(searchValue)) {
        try {
          const directResult = await apiGet(
            `/members/${encodeURIComponent(searchValue)}`
          );

          found = directResult?.member || directResult?.data || directResult;

          if (!found?.id && !found?.member_id) {
            found = null;
          }
        } catch (directError) {
          console.warn('Direct member-ID lookup failed:', directError?.message);
        }
      }

      if (!found) {
        Alert.alert(
          'Member Not Found',
          `No member was found for "${searchValue}". Check the barcode or member code.`
        );
        return;
      }

      // Display the member details while checking distribution history.
      setMember(found);
      setSearchCode(
        String(found.member_code || found.id || found.member_id || searchValue)
      );

      const totalShares = Number(found.shares ?? 0);

      setBagCount(
        Number.isFinite(totalShares) && totalShares > 0
          ? String(Math.floor(totalShares))
          : ''
      );

      // Check for an existing distribution before allowing a new one.
      try {
        await checkExistingDistribution(found);
      } catch (distributionCheckError) {
        console.error(
          'Member distribution check failed:',
          distributionCheckError
        );

        // Fail closed: do not allow saving if history cannot be verified.
        setAlreadyDistributed(true);
        setDistributionError(
          'Unable to verify this member’s distribution history. Please search again or contact the administrator before creating a distribution.'
        );
      }

      const village = villages.find(
        (item) => String(item.id) === String(found.village_id)
      );

      if (village) {
        setSelectedVillage(village);

        const taluka = talukas.find(
          (item) => String(item.id) === String(village.taluka_id)
        );

        if (taluka) setSelectedTaluka(taluka);

        const route = routes.find(
          (item) => String(item.id) === String(village.route_id)
        );

        if (route) setSelectedRoute(route);
      }

      await loadMemberRate(found.id ?? found.member_id);
    } catch (error) {
      console.error('Member lookup failed:', error);

      Alert.alert(
        'Member Lookup Failed',
        error?.message || 'Could not retrieve member details.'
      );
    } finally {
      setMemberLoading(false);
    }
  }, [
    villages,
    talukas,
    routes,
    loadMemberRate,
    checkExistingDistribution,
  ]);

  const handleBarcodeScanned = useCallback(({ data }) => {
    if (scanCooldown.current) return;

    scanCooldown.current = true;
    setScannerOpen(false);

    const scannedValue = String(data || '').trim();
    setSearchCode(scannedValue);

    fetchMemberByCode(scannedValue).finally(() => {
      setTimeout(() => {
        scanCooldown.current = false;
      }, 1500);
    });
  }, [fetchMemberByCode]);

  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        Alert.alert(
          'Camera Permission',
          'Allow camera access to scan the member card.'
        );
        return;
      }
    }

    scanCooldown.current = false;
    setScannerOpen(true);
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();

      if (!result.granted) {
        Alert.alert(
          'Camera Permission',
          'Allow camera access to capture the delivery photo.'
        );
        return;
      }
    }

    setCameraOpen(true);
  };

  const takePicture = async () => {
    try {
      if (!cameraRef.current) {
        Alert.alert('Camera', 'Camera is not ready yet.');
        return;
      }

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });

      setCapturedImage(photo.uri);
      setCameraOpen(false);
      setErrors((previous) => ({ ...previous, photo: null }));
    } catch (error) {
      console.error('Photo capture failed:', error);
      Alert.alert('Camera Error', 'Could not capture the photo.');
    }
  };

  const chooseTaluka = (taluka) => {
    setSelectedTaluka(taluka);
    setSelectedVillage(null);
    setDropdown(null);
    setErrors((previous) => ({ ...previous, taluka: null, village: null }));
  };

  const chooseVillage = (village) => {
    setSelectedVillage(village);

    const route = routes.find(
      (item) => String(item.id) === String(village.route_id)
    );

    setSelectedRoute(route || null);
    setDropdown(null);
    setErrors((previous) => ({ ...previous, village: null }));
  };

  const validateForm = () => {
    const next = {};

    if (alreadyDistributed) {
      next.member =
        distributionError ||
        'This member has already received sugar during the current financial year.';
    }

    if (!selectedTaluka) next.taluka = 'Select a taluka.';
    if (!selectedVillage) next.village = 'Select a village.';
    if (!member) next.member = 'Search or scan a valid member.';

    if (member && !applicableRate) {
      next.rate = rateError || 'Member rate has not been loaded.';
    }

    if (rateLoading) {
      next.rate = 'Wait for the member rate to finish loading.';
    }

    if (!Number.isInteger(bagCountNum) || bagCountNum <= 0) {
      next.quantity = 'Enter at least one bag.';
    }

    if (eligibility > 0 && totalWeight > eligibility) {
      next.quantity =
        `Distribution exceeds eligibility of ${eligibility.toFixed(2)} KG.`;
    }

    if (!capturedImage) {
      next.photo = 'Capture the delivery photo before saving.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSaveDistribution = async () => {
    if (saving || alreadyDistributed) {
      if (alreadyDistributed) {
        Alert.alert(
          'Distribution Not Allowed',
          distributionError ||
            'This member has already received sugar during the current financial year.'
        );
      }
      return;
    }

    if (!validateForm()) {
      Alert.alert(
        'Check Required Fields',
        'Complete the required fields before saving.'
      );
      return;
    }

    try {
      setSaving(true);

      // Use the actual route attached to the selected village.
      const routeId = selectedVillage?.route_id ?? selectedRoute?.id ?? null;

      const payload = {
        distribution_date: formatApiDate(selectedDate),
        route_id: 1,
        village_id: selectedVillage.id,
        member_id: member.id ?? member.member_id,
        bag_count: bagCountNum,
        bag_weight_kg: BAG_WEIGHT_KG,
        delivery_photo_url: null,
        notes: remarks.trim() || null,
      };

      const created = await createDistribution(payload);
      const distributionId = created?.id ?? created?.distribution?.id;

      if (!distributionId) {
        throw new Error(
          'Distribution was created, but the API did not return its ID.'
        );
      }

      const extension = capturedImage.toLowerCase().split('?')[0].endsWith('.png')
        ? 'png'
        : 'jpg';

      const contentType = extension === 'png'
        ? 'image/png'
        : 'image/jpeg';

      const uploadResult = await uploadDistributionPhoto({
        distributionId,
        fileUri: capturedImage,
        fileName: `member_${member.member_code || member.id}_${Date.now()}.${extension}`,
        contentType,
      });

      if (!uploadResult?.success || !uploadResult?.object_key) {
        throw new Error(
          uploadResult?.message ||
            'The backend did not confirm the photo upload.'
        );
      }

      Alert.alert(
        'Distribution Saved',
        `${totalWeight.toFixed(2)} KG distributed to ${member.full_name || member.name || member.member_code}.\nRate: ₹${rateNum.toFixed(2)}/KG\nAmount: ₹${totalAmount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        [{ text: 'OK', onPress: () => navigation?.goBack() }]
      );
    } catch (error) {
      console.error('Distribution save failed:', error);

      const status = error?.status ?? error?.response?.status;
      const detail =
        error?.response?.data?.detail ??
        error?.data?.detail ??
        error?.message;

      if (status === 409) {
        setAlreadyDistributed(true);
        setDistributionError(
          typeof detail === 'string'
            ? detail
            : 'This member has already received sugar during the current financial year.'
        );

        Alert.alert(
          'Distribution Already Completed',
          typeof detail === 'string'
            ? detail
            : 'This member has already received sugar during the current financial year.'
        );
      } else {
        Alert.alert(
          'Save Failed',
          detail || 'Could not save the distribution or upload its photo.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const calendarDays = useMemo(
    () => getCalendarDays(calendarMonth),
    [calendarMonth]
  );

  const renderMemberCard = () => {
    if (memberLoading) {
      return (
        <View style={styles.memberCard}>
          <ActivityIndicator size="large" color="#1E5E2A" />
          <Text style={styles.centerHint}>
            Looking up member and checking distribution history...
          </Text>
        </View>
      );
    }

    if (!member) {
      return (
        <View style={styles.memberCard}>
          <Ionicons name="person-outline" size={36} color="#9CA3AF" />
          <Text style={styles.centerHint}>Search or scan a member card</Text>
        </View>
      );
    }

    return (
      <View style={styles.memberCard}>
        <View style={styles.memberHeader}>
          <View style={styles.memberInfo}>
            <View style={styles.badgeRow}>
              <Text style={styles.memberCode}>
                {member.member_code || `ID: ${member.id ?? member.member_id}`}
              </Text>

              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Member</Text>
              </View>
            </View>

            <Text style={styles.memberName}>
              {member.full_name || member.name || 'Unnamed Member'}
            </Text>

            <Text style={styles.memberVillage}>
              {selectedVillage?.name || 'Village not available'}
            </Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Total Shares</Text>
            <Text style={styles.metricValue}>
              {Number(member.shares || 0).toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Eligibility</Text>
            <Text style={[styles.metricValue, { color: '#1E5E2A' }]}>
              {eligibility.toFixed(2)} KG
            </Text>
          </View>
        </View>

        <View style={styles.phoneBanner}>
          <MaterialCommunityIcons
            name="phone-outline"
            size={16}
            color="#1E5E2A"
          />
          <Text style={styles.phoneText}>
            {member.mobile_number || member.mobile || 'No mobile number'}
          </Text>
        </View>
      </View>
    );
  };

  const renderDropdown = () => {
    if (!dropdown) return null;

    const isTaluka = dropdown === 'taluka';
    const options = isTaluka ? talukas : talukaVillages;

    return (
      <Modal
        visible
        transparent
        animationType="fade"
        onRequestClose={() => setDropdown(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setDropdown(null)}
        >
          <Pressable style={styles.dropdownCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isTaluka ? 'Select Taluka' : 'Select Village'}
              </Text>

              <TouchableOpacity onPress={() => setDropdown(null)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              {options.length === 0 ? (
                <Text style={styles.emptyOption}>
                  {isTaluka
                    ? 'No talukas available.'
                    : 'Select a taluka first, or no villages are linked to it.'}
                </Text>
              ) : (
                options.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() =>
                      isTaluka ? chooseTaluka(item) : chooseVillage(item)
                    }
                    style={styles.dropdownOption}
                  >
                    <Text style={styles.dropdownOptionText}>
                      {item.name || item.code || `#${item.id}`}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E5E2A" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>SugarERP — Distribution</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.contentWrapper}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Feather
                name="search"
                size={18}
                color="#6B7280"
                style={{ marginRight: 8 }}
              />

              <TextInput
                style={styles.searchInput}
                placeholder="Member ID or member code"
                placeholderTextColor="#9CA3AF"
                value={searchCode}
                onChangeText={(value) => {
                  setSearchCode(value);
                  setDistributionError('');
                  setAlreadyDistributed(false);
                  setMember(null);
                }}
                returnKeyType="search"
                autoCapitalize="characters"
                onSubmitEditing={() => fetchMemberByCode(searchCode)}
              />

              {!!searchCode && (
                <TouchableOpacity
                  onPress={() => fetchMemberByCode(searchCode)}
                >
                  <Feather
                    name="arrow-right"
                    size={20}
                    color="#1E5E2A"
                  />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.qrIconBtn}
              onPress={openScanner}
            >
              <Ionicons name="barcode-outline" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Duplicate distribution message appears directly under search. */}
          {!!distributionError && (
            <View
              style={{
                backgroundColor: '#FEF2F2',
                borderColor: '#FECACA',
                borderWidth: 1,
                borderRadius: 10,
                padding: 12,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'flex-start',
              }}
            >
              <Ionicons
                name="alert-circle"
                size={20}
                color="#B91C1C"
                style={{ marginRight: 8 }}
              />

              <Text
                style={{
                  color: '#B91C1C',
                  fontSize: 13,
                  lineHeight: 19,
                  flex: 1,
                  fontWeight: '600',
                }}
              >
                {distributionError}
              </Text>
            </View>
          )}

          {!!errors.member && (
            <Text style={styles.errorText}>{errors.member}</Text>
          )}

          {renderMemberCard()}

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Distribution Setup</Text>

            <Text style={styles.fieldLabel}>Taluka</Text>

            <TouchableOpacity
              style={[
                styles.inputField,
                errors.taluka && styles.errorBorder,
              ]}
              onPress={() => setDropdown('taluka')}
            >
              <Text
                style={[
                  styles.inputText,
                  !selectedTaluka && styles.placeholderText,
                ]}
              >
                {selectedTaluka?.name || 'Select Taluka'}
              </Text>

              <Feather name="chevron-down" size={18} color="#6B7280" />
            </TouchableOpacity>

            {!!errors.taluka && (
              <Text style={styles.errorText}>{errors.taluka}</Text>
            )}

            <Text style={styles.fieldLabel}>Village</Text>

            <TouchableOpacity
              style={[
                styles.inputField,
                errors.village && styles.errorBorder,
              ]}
              onPress={() => {
                if (!selectedTaluka) {
                  Alert.alert(
                    'Select Taluka',
                    'Please select a taluka first.'
                  );
                  return;
                }

                setDropdown('village');
              }}
            >
              <Text
                style={[
                  styles.inputText,
                  !selectedVillage && styles.placeholderText,
                ]}
              >
                {selectedVillage?.name || 'Select Village'}
              </Text>

              <Feather name="chevron-down" size={18} color="#6B7280" />
            </TouchableOpacity>

            {!!errors.village && (
              <Text style={styles.errorText}>{errors.village}</Text>
            )}

            <Text style={styles.fieldLabel}>
              Applicable Share Capital Rate
            </Text>

            <View style={styles.rateBox}>
              <MaterialCommunityIcons
                name="cash-check"
                size={24}
                color="#1E5E2A"
                style={{ marginRight: 10 }}
              />

              <View style={{ flex: 1 }}>
                {rateLoading ? (
                  <View style={styles.rateLoadingRow}>
                    <ActivityIndicator color="#1E5E2A" />
                    <Text style={styles.rateDescription}>
                      Calculating member rate...
                    </Text>
                  </View>
                ) : applicableRate ? (
                  <>
                    <Text style={styles.rateValue}>
                      ₹ {applicableRate.rate.toFixed(2)} / KG
                    </Text>

                    <Text style={styles.rateDescription}>
                      Calculated from this member’s Share Capital payments
                    </Text>

                    {applicableRate.qualifyingMinimumPerShare != null && (
                      <Text style={styles.rateDescription}>
                        Qualifying minimum per share: ₹
                        {Number(
                          applicableRate.qualifyingMinimumPerShare
                        ).toLocaleString('en-IN')}
                      </Text>
                    )}
                  </>
                ) : (
                  <Text style={{ color: rateError ? '#B91C1C' : '#6B7280' }}>
                    {rateError || 'Search for a member to calculate the rate.'}
                  </Text>
                )}
              </View>
            </View>

            {!!errors.rate && (
              <Text style={styles.errorText}>{errors.rate}</Text>
            )}

            <View style={styles.dualFieldRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.fieldLabel}>Bags (50 KG each)</Text>

                <View
                  style={[
                    styles.inputField,
                    errors.quantity && styles.errorBorder,
                  ]}
                >
                  <TextInput
                    style={styles.inputText}
                    value={bagCount}
                    onChangeText={(value) => {
                      setBagCount(value.replace(/[^0-9]/g, ''));
                      setErrors((previous) => ({
                        ...previous,
                        quantity: null,
                      }));
                    }}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.fieldLabel}>Total Weight</Text>

                <View style={styles.inputField}>
                  <Text style={styles.inputText}>
                    {totalWeight.toFixed(2)} KG
                  </Text>
                </View>
              </View>
            </View>

            {!!errors.quantity && (
              <Text style={styles.errorText}>{errors.quantity}</Text>
            )}

            <Text style={styles.fieldLabel}>Total Amount</Text>

            <View style={[styles.inputField, styles.amountField]}>
              <Text style={[styles.inputText, styles.amountText]}>
                ₹ {totalAmount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.sectionCard,
              errors.photo && styles.errorBorder,
            ]}
          >
            <View style={styles.photoHeading}>
              <Feather name="camera" size={18} color="#1E5E2A" />
              <Text style={styles.sectionTitle}>Delivery Photo</Text>
            </View>

            <View style={styles.cameraContainer}>
              {capturedImage ? (
                <Image
                  source={{ uri: capturedImage }}
                  style={styles.capturedPhoto}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.cameraPlaceholderImage}>
                  <Ionicons
                    name="camera-outline"
                    size={38}
                    color="#9CA3AF"
                  />
                  <Text style={styles.photoHint}>Photo required</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={openCamera}
              activeOpacity={0.85}
            >
              <Ionicons
                name="camera-outline"
                size={20}
                color="#FFF"
                style={{ marginRight: 8 }}
              />

              <Text style={styles.captureButtonText}>
                {capturedImage ? 'Retake Photo' : 'Capture Photo'}
              </Text>
            </TouchableOpacity>

            {!!errors.photo && (
              <Text style={styles.errorText}>{errors.photo}</Text>
            )}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Distribution Details</Text>

            <Text style={styles.fieldLabel}>Date of Distribution</Text>

            <TouchableOpacity
              style={styles.inputField}
              onPress={() => setCalendarVisible(true)}
            >
              <Feather
                name="calendar"
                size={18}
                color="#6B7280"
                style={{ marginRight: 8 }}
              />

              <Text style={styles.inputText}>
                {formatDate(selectedDate)}
              </Text>

              <Feather name="chevron-down" size={18} color="#6B7280" />
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>Remarks (Optional)</Text>

            <TextInput
              style={styles.remarksInput}
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Add optional remarks..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            onPress={handleSaveDistribution}
            disabled={saving || masterLoading || alreadyDistributed}
            activeOpacity={0.85}
            style={[
              styles.saveButton,
              (saving || masterLoading || alreadyDistributed) &&
                styles.disabledSaveButton,
            ]}
          >
            {saving && (
              <ActivityIndicator
                color="#FFF"
                style={{ marginRight: 10 }}
              />
            )}

            <Text style={styles.saveButtonText}>
              {alreadyDistributed
                ? 'Distribution Not Allowed'
                : saving
                  ? 'Saving Distribution...'
                  : 'Save Distribution'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {renderDropdown()}

      <Modal
        visible={calendarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setCalendarVisible(false)}
        >
          <Pressable style={styles.calendarCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() =>
                  setCalendarMonth((current) =>
                    new Date(
                      current.getFullYear(),
                      current.getMonth() - 1,
                      1
                    )
                  )
                }
              >
                <Feather
                  name="chevron-left"
                  size={24}
                  color="#111827"
                />
              </TouchableOpacity>

              <Text style={styles.modalTitle}>
                {MONTHS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setCalendarMonth((current) =>
                    new Date(
                      current.getFullYear(),
                      current.getMonth() + 1,
                      1
                    )
                  )
                }
              >
                <Feather
                  name="chevron-right"
                  size={24}
                  color="#111827"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((day) => (
                <Text key={day} style={styles.weekdayText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((date, index) => {
                if (!date) {
                  return (
                    <View
                      key={`empty-${index}`}
                      style={styles.emptyDay}
                    />
                  );
                }

                const selected =
                  date.getFullYear() === selectedDate.getFullYear() &&
                  date.getMonth() === selectedDate.getMonth() &&
                  date.getDate() === selectedDate.getDate();

                return (
                  <TouchableOpacity
                    key={date.toISOString()}
                    style={[
                      styles.dayCell,
                      selected && styles.selectedDayCell,
                    ]}
                    onPress={() => {
                      setSelectedDate(date);
                      setCalendarVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        selected && styles.selectedDayText,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => setCalendarVisible(false)}
              style={styles.cancelCalendar}
            >
              <Text style={styles.cancelCalendarText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={scannerOpen}
        animationType="slide"
        onRequestClose={() => setScannerOpen(false)}
      >
        <View style={styles.cameraModal}>
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: [
                'qr',
                'code128',
                'code39',
                'ean13',
                'ean8',
                'upc_a',
                'upc_e',
                'pdf417',
              ],
            }}
            onBarcodeScanned={
              scannerOpen ? handleBarcodeScanned : undefined
            }
          />

          <View style={styles.scannerTop}>
            <Text style={styles.scannerTitle}>
              Scan Member Card Barcode
            </Text>

            <Text style={styles.scannerSubtitle}>
              Scan the barcode containing the member ID or member code.
            </Text>

            <TouchableOpacity
              onPress={() => setScannerOpen(false)}
              style={styles.scannerCloseButton}
            >
              <Text style={styles.scannerCloseText}>Close Scanner</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={cameraOpen}
        animationType="slide"
        onRequestClose={() => setCameraOpen(false)}
      >
        <View style={styles.cameraModal}>
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing="back"
          />

          <View style={styles.cameraControls}>
            <TouchableOpacity
              onPress={() => setCameraOpen(false)}
              style={styles.cameraCancelButton}
            >
              <Text style={styles.cameraControlText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={takePicture}
              style={styles.shutterButton}
            >
              <Ionicons name="camera" size={30} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {masterLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1E5E2A" />
          <Text style={styles.loadingText}>
            Loading distribution setup...
          </Text>
        </View>
      )}

      <BottomTabBar navigation={navigation} />
    </SafeAreaView>
  );
};

export default DistributionForm;