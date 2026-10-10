import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import colors from '../constants/colors';
import styles from './AddMemberStyles';

import {
  getDistricts,
  getTalukas,
  getVillages,
} from '../services/villageService';

import {
  createMember,
  updateMember,
} from '../services/memberService';

import {
  getMemberShareCapital,
  updateMemberShareCapital,
} from '../services/shareCapitalService';

const initialForm = {
  code: '',
  name: '',
  mobile: '',
  state: 'Maharashtra',
  district: '',
  taluka: '',
  village: '',
  shares: '',
  eligibility: '',
  address: '',
};

const STATE_OPTIONS = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
].map((name, index) => ({
  id: index + 1,
  name,
}));

const PAYMENT_OPTIONS = [
  { id: 5000, name: '₹5,000', value: 5000 },
  { id: 10000, name: '₹10,000', value: 10000 },
  { id: 15000, name: '₹15,000', value: 15000 },
];

const initialSummary = {
  qualifying_minimum_per_share: '0',
  applicable_rate_per_kg: '0',
};

const AddMember = ({ navigation, route }) => {
  const editMode = route?.params?.mode === 'edit';
  const editingMember = route?.params?.member || null;

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const [sharePayments, setSharePayments] = useState([]);
  const [shareCapitalSummary, setShareCapitalSummary] =
    useState(initialSummary);

  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [villages, setVillages] = useState([]);

  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [selectedTalukaId, setSelectedTalukaId] = useState(null);
  const [selectedVillageId, setSelectedVillageId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [pickerModal, setPickerModal] = useState({
    visible: false,
    type: '',
    data: [],
    shareNumber: null,
  });

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      setIsLoading(true);

      const [districtData, talukaData, villageData] =
        await Promise.all([
          getDistricts(),
          getTalukas(),
          getVillages(),
        ]);

      const districtList = Array.isArray(districtData)
        ? districtData
        : [];

      const talukaList = Array.isArray(talukaData)
        ? talukaData
        : [];

      const villageList = Array.isArray(villageData)
        ? villageData
        : [];

      setDistricts(districtList);
      setTalukas(talukaList);
      setVillages(villageList);

      if (editMode && editingMember) {
        const memberVillage = villageList.find(
          (village) =>
            Number(village.id) ===
            Number(editingMember.village_id)
        );

        const memberTaluka = memberVillage
          ? talukaList.find(
              (taluka) =>
                Number(taluka.id) ===
                Number(memberVillage.taluka_id)
            )
          : null;

        const memberDistrict = memberTaluka
          ? districtList.find(
              (district) =>
                Number(district.id) ===
                Number(memberTaluka.district_id)
            )
          : null;

        setSelectedVillageId(memberVillage?.id || null);
        setSelectedTalukaId(memberTaluka?.id || null);
        setSelectedDistrictId(memberDistrict?.id || null);

        setForm({
          code: editingMember.member_code || '',
          name: editingMember.full_name || '',
          mobile: editingMember.mobile_number || '',
          state: memberDistrict?.state || 'Maharashtra',
          district: memberDistrict?.name || '',
          taluka: memberTaluka?.name || '',
          village: memberVillage?.name || '',
          shares:
            editingMember.shares != null
              ? String(editingMember.shares)
              : '',
          eligibility:
            editingMember.eligibility_kg != null
              ? String(editingMember.eligibility_kg)
              : '',
          address: editingMember.address || '',
        });

        const shareCount = Math.max(
          0,
          Math.min(1000, Number(editingMember.shares) || 0)
        );

        setSharePayments(
          Array.from({ length: shareCount }, (_, index) => ({
            share_number: index + 1,
            amount_paid: '',
          }))
        );

        try {
          const shareCapital = await getMemberShareCapital(
            editingMember.id
          );

          const savedPayments = Array.isArray(
            shareCapital?.payments
          )
            ? shareCapital.payments
            : [];

          const paymentMap = new Map(
            savedPayments.map((payment) => [
              Number(payment.share_number),
              String(payment.amount_paid ?? ''),
            ])
          );

          setSharePayments(
            Array.from({ length: shareCount }, (_, index) => ({
              share_number: index + 1,
              amount_paid: paymentMap.get(index + 1) ?? '',
            }))
          );

          setShareCapitalSummary({
            qualifying_minimum_per_share: String(
              shareCapital?.qualifying_minimum_per_share ?? '0'
            ),
            applicable_rate_per_kg: String(
              shareCapital?.applicable_rate_per_kg ?? '0'
            ),
          });
        } catch (error) {
          console.error(
            'Failed to load member share payments:',
            error
          );

          Alert.alert(
            'Share Payments',
            'Could not load saved share payments. Verify the Share Capital API before saving changes.'
          );
        }
      } else {
        setSharePayments([]);
        setShareCapitalSummary(initialSummary);
      }
    } catch (error) {
      console.error('Failed to load master data:', error);

      Alert.alert(
        'Error',
        error?.message || 'Unable to load master data.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: '',
    }));
  };

  const handleSharesChange = (value) => {
    updateField('shares', value);

    const count = Math.max(
      0,
      Math.min(1000, Number.parseInt(value, 10) || 0)
    );

    setSharePayments((current) =>
      Array.from({ length: count }, (_, index) => {
        const shareNumber = index + 1;

        const existing = current.find(
          (item) => item.share_number === shareNumber
        );

        return (
          existing || {
            share_number: shareNumber,
            amount_paid: '',
          }
        );
      })
    );
  };

  const handleSharePaymentChange = (shareNumber, value) => {
    setSharePayments((current) =>
      current.map((item) =>
        item.share_number === shareNumber
          ? { ...item, amount_paid: value }
          : item
      )
    );

    setErrors((current) => ({
      ...current,
      [`share_${shareNumber}`]: '',
    }));
  };

  const openSharePaymentPicker = (shareNumber) => {
    setPickerModal({
      visible: true,
      type: 'sharePayment',
      data: PAYMENT_OPTIONS,
      shareNumber,
    });
  };

  const districtOptions = districts;

  const talukaOptions = selectedDistrictId
    ? talukas.filter(
        (taluka) =>
          Number(taluka.district_id) ===
          Number(selectedDistrictId)
      )
    : [];

  const villageOptions = selectedTalukaId
    ? villages.filter(
        (village) =>
          Number(village.taluka_id) ===
          Number(selectedTalukaId)
      )
    : [];

  const openPicker = (type, data) => {
    if (!data || data.length === 0) {
      Alert.alert(
        'Notice',
        type === 'taluka'
          ? 'Please select a district first.'
          : type === 'village'
            ? 'Please select a taluka first.'
            : 'No options available.'
      );
      return;
    }

    setPickerModal({
      visible: true,
      type,
      data,
      shareNumber: null,
    });
  };

  const closePicker = () => {
    setPickerModal({
      visible: false,
      type: '',
      data: [],
      shareNumber: null,
    });
  };

  const handlePickerSelect = (type, option) => {
    if (type === 'state') {
      setSelectedDistrictId(null);
      setSelectedTalukaId(null);
      setSelectedVillageId(null);

      setForm((current) => ({
        ...current,
        state: option.name,
        district: '',
        taluka: '',
        village: '',
      }));

      setErrors((current) => ({
        ...current,
        district: '',
        taluka: '',
        village: '',
      }));
    } else if (type === 'sharePayment') {
      handleSharePaymentChange(
        pickerModal.shareNumber,
        String(option.value)
      );
    } else if (type === 'district') {
      setSelectedDistrictId(option.id);
      setSelectedTalukaId(null);
      setSelectedVillageId(null);

      setForm((current) => ({
        ...current,
        district: option.name,
        taluka: '',
        village: '',
      }));

      setErrors((current) => ({
        ...current,
        district: '',
        taluka: '',
        village: '',
      }));
    } else if (type === 'taluka') {
      setSelectedTalukaId(option.id);
      setSelectedVillageId(null);

      setForm((current) => ({
        ...current,
        taluka: option.name,
        village: '',
      }));

      setErrors((current) => ({
        ...current,
        taluka: '',
        village: '',
      }));
    } else if (type === 'village') {
      setSelectedVillageId(option.id);

      setForm((current) => ({
        ...current,
        village: option.name,
      }));

      setErrors((current) => ({
        ...current,
        village: '',
      }));
    }

    closePicker();
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.code.trim()) {
      nextErrors.code = 'Member code is required';
    }

    if (!form.name.trim()) {
      nextErrors.name = 'Full name is required';
    }

    if (!/^[0-9]{10}$/.test(form.mobile.trim())) {
      nextErrors.mobile = 'Enter a valid 10 digit mobile number';
    }

    if (!form.state.trim()) {
      nextErrors.state = 'State required';
    }

    if (!selectedDistrictId) {
      nextErrors.district = 'District required';
    }

    if (!selectedTalukaId) {
      nextErrors.taluka = 'Taluka required';
    }

    if (!selectedVillageId) {
      nextErrors.village = 'Village required';
    }

    const shareCount = Number(form.shares);

    if (
      form.shares.trim() === '' ||
      !Number.isInteger(shareCount) ||
      shareCount < 0 ||
      shareCount > 1000
    ) {
      nextErrors.shares =
        'Enter a whole number between 0 and 1000';
    }

    if (
      form.eligibility.trim() === '' ||
      !Number.isFinite(Number(form.eligibility)) ||
      Number(form.eligibility) < 0
    ) {
      nextErrors.eligibility =
        'Enter a valid non-negative number';
    }

    if (!form.address.trim()) {
      nextErrors.address = 'Address is required';
    }

    for (const item of sharePayments) {
      if (
        !['5000', '10000', '15000'].includes(
          String(item.amount_paid)
        )
      ) {
        nextErrors[`share_${item.share_number}`] =
          `Select a payment amount for Share ${item.share_number}`;
      }
    }

    if (sharePayments.length !== shareCount) {
      nextErrors.shares =
        'Payment fields must match the total number of shares';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        member_code: form.code.trim().toUpperCase(),
        full_name: form.name.trim(),
        mobile_number: form.mobile.trim(),
        village_id: selectedVillageId,
        shares: Number.parseInt(form.shares, 10),
        eligibility_kg: Number(form.eligibility),
        address: form.address.trim(),
      };

      let memberId;

      if (editMode && editingMember) {
        memberId = editingMember.id;
        await updateMember(memberId, payload);
      } else {
        const createdMember = await createMember(payload);

        memberId =
          createdMember?.id ??
          createdMember?.member?.id;

        if (!memberId) {
          throw new Error(
            'Member was created, but the API did not return its ID. Verify the member API response.'
          );
        }
      }

      const shareCapital = await updateMemberShareCapital(
        memberId,
        {
          shares: payload.shares,
          payments: sharePayments.map((item) => ({
            share_number: item.share_number,
            amount_paid: Number(item.amount_paid),
          })),
        }
      );

      setShareCapitalSummary({
        qualifying_minimum_per_share: String(
          shareCapital?.qualifying_minimum_per_share ?? '0'
        ),
        applicable_rate_per_kg: String(
          shareCapital?.applicable_rate_per_kg ?? '0'
        ),
      });

      Alert.alert(
        'Success',
        editMode
          ? 'Member and share payments updated successfully.'
          : 'Member and share payments saved successfully.',
        [
          {
            text: 'OK',
            onPress: () =>
              navigation.navigate('Members', {
                refresh: true,
              }),
          },
        ]
      );
    } catch (error) {
      console.error(
        editMode
          ? 'Failed to update member:'
          : 'Failed to create member:',
        error
      );

      Alert.alert(
        editMode ? 'Update Failed' : 'Save Failed',
        error?.message ||
          (editMode
            ? 'Unable to update member.'
            : 'Unable to save member.')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = ({
    field,
    label,
    placeholder,
    keyboardType = 'default',
    multiline = false,
    onChangeText,
  }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={form[field]}
        onChangeText={
          onChangeText ||
          ((value) => updateField(field, value))
        }
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.input,
          multiline && styles.multilineInput,
          errors[field] && styles.inputError,
        ]}
      />

      {errors[field] ? (
        <Text style={styles.errorText}>
          {errors[field]}
        </Text>
      ) : null}
    </View>
  );

  const renderDropdownTrigger = ({
    field,
    label,
    placeholder,
    options,
  }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => openPicker(field, options)}
        style={[
          styles.input,
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          },
          errors[field] && styles.inputError,
        ]}
      >
        <Text
          style={{
            color: form[field] ? '#111827' : colors.muted,
          }}
        >
          {form[field] || placeholder}
        </Text>

        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color="#374151"
        />
      </TouchableOpacity>

      {errors[field] ? (
        <Text style={styles.errorText}>
          {errors[field]}
        </Text>
      ) : null}
    </View>
  );

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
        <Text style={{ marginTop: 10, color: '#666' }}>
          Loading member data...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.secondary}
      />

      <View style={styles.appBar}>
        <Pressable
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={25}
            color={colors.white}
          />
        </Pressable>

        <Text style={styles.appTitle}>
          {editMode ? 'Edit Member' : 'Add Member'}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {editMode ? 'Edit Member' : 'New Member'}
        </Text>

        <Text style={styles.subtitle}>
          {editMode
            ? 'Update complete member details'
            : 'Enter complete member details for registration'}
        </Text>

        <View style={styles.formCard}>
          {renderInput({
            field: 'code',
            label: 'Member Code',
            placeholder: 'Example: MBR-9001',
          })}

          {renderInput({
            field: 'name',
            label: 'Full Name',
            placeholder: 'Enter member full name',
          })}

          {renderInput({
            field: 'mobile',
            label: 'Mobile Number',
            placeholder: '10 digit mobile number',
            keyboardType: 'number-pad',
          })}

          {renderDropdownTrigger({
            field: 'state',
            label: 'State',
            placeholder: 'Select State',
            options: STATE_OPTIONS,
          })}

          <View style={styles.row}>
            <View style={styles.halfField}>
              {renderDropdownTrigger({
                field: 'district',
                label: 'District',
                placeholder: 'Select District',
                options: districtOptions,
              })}
            </View>

            <View style={styles.halfField}>
              {renderDropdownTrigger({
                field: 'taluka',
                label: 'Taluka / City',
                placeholder: 'Select Taluka',
                options: talukaOptions,
              })}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              {renderDropdownTrigger({
                field: 'village',
                label: 'Village',
                placeholder: 'Select Village',
                options: villageOptions,
              })}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfField}>
              {renderInput({
                field: 'shares',
                label: 'Total Shares',
                placeholder: '1250',
                keyboardType: 'number-pad',
                onChangeText: handleSharesChange,
              })}
            </View>

            <View style={styles.halfField}>
              {renderInput({
                field: 'eligibility',
                label: 'Eligibility KG',
                placeholder: '45',
                keyboardType: 'decimal-pad',
              })}
            </View>
          </View>

          <View
            style={{
              marginTop: 8,
              marginBottom: 16,
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#D1D5DB',
              backgroundColor: colors.white || '#FFFFFF',
            }}
          >
            <Text
              style={{
                fontSize: 17,
                fontWeight: '800',
                color: '#111827',
                marginBottom: 4,
              }}
            >
              Share Capital Payments
            </Text>

            <Text
              style={{
                fontSize: 12,
                color: '#4B5563',
                marginBottom: 12,
              }}
            >
              Select the amount paid separately for each share.
            </Text>

            {sharePayments.map((item) => (
              <View
                key={item.share_number}
                style={{ marginBottom: 12 }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: '#374151',
                    marginBottom: 6,
                  }}
                >
                  Share {item.share_number} — Amount paid
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    openSharePaymentPicker(item.share_number)
                  }
                  style={[
                    styles.input,
                    {
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    },
                    errors[`share_${item.share_number}`] &&
                      styles.inputError,
                  ]}
                >
                  <Text
                    style={{
                      color: item.amount_paid
                        ? '#111827'
                        : colors.muted,
                    }}
                  >
                    {item.amount_paid
                      ? `₹${Number(item.amount_paid).toLocaleString('en-IN')}`
                      : 'Select payment amount'}
                  </Text>

                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={20}
                    color="#374151"
                  />
                </TouchableOpacity>

                {errors[`share_${item.share_number}`] ? (
                  <Text style={styles.errorText}>
                    {errors[`share_${item.share_number}`]}
                  </Text>
                ) : null}
              </View>
            ))}

            {sharePayments.length === 0 ? (
              <Text style={{ color: '#6B7280', fontSize: 13 }}>
                Enter Total Shares above to add payment fields.
              </Text>
            ) : null}

            <View
              style={{
                marginTop: 4,
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: '#D1D5DB',
              }}
            >
              <Text style={{ color: '#4B5563', fontSize: 13 }}>
                Qualifying minimum per share: ₹
                {Number(
                  shareCapitalSummary.qualifying_minimum_per_share
                ).toLocaleString('en-IN')}
              </Text>

              <Text
                style={{
                  color: colors.primary || '#166534',
                  fontSize: 16,
                  fontWeight: '800',
                  marginTop: 6,
                }}
              >
                Applicable sugar rate: ₹
                {Number(
                  shareCapitalSummary.applicable_rate_per_kg
                ).toLocaleString('en-IN')}
                /kg
              </Text>
            </View>
          </View>

          {renderInput({
            field: 'address',
            label: 'Address',
            placeholder: 'Enter full member address',
            multiline: true,
          })}

          <Pressable
            style={[
              styles.saveButton,
              isSaving && { opacity: 0.6 },
            ]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator
                size="small"
                color={colors.white}
              />
            ) : (
              <MaterialCommunityIcons
                name={
                  editMode
                    ? 'content-save-edit-outline'
                    : 'content-save-outline'
                }
                size={22}
                color={colors.white}
              />
            )}

            <Text style={styles.saveButtonText}>
              {isSaving
                ? 'Saving...'
                : editMode
                  ? 'Update Member'
                  : 'Save Member'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={pickerModal.visible}
        transparent
        animationType="fade"
        onRequestClose={closePicker}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
          onPress={closePicker}
        >
          <Pressable
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              width: '100%',
              maxWidth: 320,
              padding: 16,
            }}
            onPress={(event) => event.stopPropagation()}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                marginBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#E5E7EB',
                paddingBottom: 8,
              }}
            >
              {pickerModal.type === 'sharePayment'
                ? 'SELECT SHARE PAYMENT'
                : `SELECT ${pickerModal.type.toUpperCase()}`}
            </Text>

            <ScrollView
              style={{ maxHeight: 280 }}
              showsVerticalScrollIndicator={false}
            >
              {pickerModal.data.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={{
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#F3F4F6',
                  }}
                  onPress={() =>
                    handlePickerSelect(
                      pickerModal.type,
                      option
                    )
                  }
                >
                  <Text
                    style={{
                      fontSize: 15,
                      color: '#374151',
                    }}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default AddMember;