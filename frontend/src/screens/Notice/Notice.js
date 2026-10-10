import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AppShell from '../../components/layout/AppShell';
import styles from './NoticeStyles';
import { BASE_URL } from '../../config/api';

const distributionPartners = [
  'All Distribution Partners',
  'Global Logistics Solutions',
  'Northern Sugar Co-operative',
  'Southwest Refineries Ltd.',
  'Agri-Trade Exports',
];

const Notice = ({ navigation }) => {
  const [selectedPartner, setSelectedPartner] = useState('All Distribution Partners');
  const [activeTab, setActiveTab] = useState('General');
  const [partnerPickerVisible, setPartnerPickerVisible] = useState(false);
  
  const [dbNotices, setDbNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const templatePreviews = {
    General: {
      title: 'OFFICIAL COMMUNICATION:\nGENERAL NOTICE',
      body: 'This is to inform all stakeholders regarding the updated operational protocols for the upcoming harvest season. Please ensure all warehouse manifests are synchronized with the ERP system by Friday 5:00 PM.',
      effectiveFrom: '2023-11-01',
      priority: 'High-Urgency',
    },
    Shareholder: {
      title: 'ANNUAL GENERAL\nSHAREHOLDER MEETING',
      body: 'Notice is hereby given that the 42nd Annual General Meeting of SugarERP Co-operative will be held at the Main Auditorium on Dec 15th.',
      effectiveFrom: '2023-12-15',
      priority: 'Routine',
    },
    Distribution: {
      title: 'SUGAR DISTRIBUTION\nSCHEDULE UPDATE',
      body: 'Please find the revised distribution schedule for Region B warehouses. Transit delays are expected due to industrial track maintenance.',
      effectiveFrom: '2023-10-28',
      priority: 'Medium',
    },
  };

  const currentPreview = templatePreviews[activeTab];

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/notices/`);
      if (!response.ok) throw new Error('API Response Error');
      const data = await response.json();
      setDbNotices(data);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchNotices();
    });
    return unsubscribe;
  }, [navigation]);

  const handleGenerateNotice = async () => {
    const randomRef = `SUG/2026/NOT/${Math.floor(1000 + Math.random() * 9000)}`;
    const payload = {
      target_partner: selectedPartner,
      notice_type: activeTab,
      title: currentPreview.title,
      body: currentPreview.body,
      effective_from: currentPreview.effectiveFrom,
      priority_level: currentPreview.priority,
      reference_number: randomRef,
    };

    try {
      const response = await fetch(`${BASE_URL}/notices/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        Alert.alert('Success', 'Notice stored in SQL Database successfully!');
        fetchNotices();
      } else {
        const text = await response.text();
        Alert.alert('Validation Error', text);
      }
    } catch (error) {
      Alert.alert('Connection Error', 'Could not reach backend API server.');
    }
  };

  return (
    <AppShell activeTab="Reports" navigation={navigation} title="Notice Generator">
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.fieldLabel}>Select Member</Text>
          <TouchableOpacity style={styles.dropdownTrigger} activeOpacity={0.7} onPress={() => setPartnerPickerVisible(true)}>
            <Text style={styles.dropdownTriggerText}>{selectedPartner}</Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color="#374151" />
          </TouchableOpacity>

          <Text style={styles.fieldLabel}>Notice Type</Text>
          <View style={styles.tabsContainer}>
            {['General', 'Shareholder', 'Distribution'].map((type) => (
              <TouchableOpacity key={type} style={[styles.tabChip, activeTab === type && styles.tabChipActive]} onPress={() => setActiveTab(type)}>
                <Text style={[styles.tabChipText, activeTab === type && styles.tabChipTextActive]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionHeading}>Document Preview</Text>
          <View style={styles.previewCanvas}>
            <View style={styles.documentPaper}>
              <View style={styles.letterheadRow}>
                <View>
                  <Text style={styles.brandLogoText}>SUGAREXP ERP</Text>
                  <Text style={styles.brandMutedText}>Logistics & Commodity Trading</Text>
                </View>
                <View style={styles.metaTextRightBlock}>
                  <Text style={styles.metaTextRight}>Ref: AUTO-GEN</Text>
                  <Text style={styles.metaTextRight}>Date: Current Session</Text>
                </View>
              </View>
              <View style={styles.documentBody}>
                <Text style={styles.documentTitle}>{currentPreview.title}</Text>
                <Text style={styles.salutationText}>To: {selectedPartner},</Text>
                <Text style={styles.bodyParagraph}>{currentPreview.body}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionBlockContainer}>
            <TouchableOpacity style={styles.primaryGenerateBtn} onPress={handleGenerateNotice}>
              <MaterialCommunityIcons name="auto-fix" size={22} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>Generate & Save Notice</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionHeading, { marginTop: 24 }]}>Recent Database Logs ({dbNotices.length})</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color="#0d631b" />
          ) : (
            dbNotices.map((item) => (
              <View key={item.id} style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, marginTop: 8, borderWidth: 1, borderColor: '#e2e2e2' }}>
                <Text style={{ fontWeight: '700', color: '#0d631b' }}>{item.reference_number}</Text>
                <Text style={{ fontSize: 13, marginTop: 4 }}>Target: {item.target_partner}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </AppShell>
  );
};

export default Notice;