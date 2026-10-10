
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppShell from '../../components/layout/AppShell';
import { getDistributions } from '../../services/distributionService';
import { getMembers } from '../../services/memberService';
import {
  getTalukas,
  getVillages,
} from '../../services/villageService';

const GREEN = '#1E5E2A';
const LIGHT_GREEN = '#F0FDF4';
const BORDER = '#D1D5DB';
const TEXT = '#111827';
const MUTED = '#6B7280';

const todayISO = () => {
  const date = new Date();
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

const currentMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();

  return {
    from: `${year}-${month}-01`,
    to: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
  };
};

const getList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  return [];
};

const money = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const number = (value) => Number(value || 0);

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const displayDate = (value) => {
  if (!value) return '-';
  const parts = String(value).split('-');
  return parts.length === 3
    ? `${parts[2]}/${parts[1]}/${parts[0]}`
    : value;
};

const buildPdfHtml = ({ fromDate, toDate, talukaName, villageName, rows }) => {
  const totals = rows.reduce(
    (acc, row) => ({
      shares: acc.shares + row.shares,
      bags: acc.bags + row.bags,
      weight: acc.weight + row.weight,
      amount: acc.amount + row.amount,
    }),
    { shares: 0, bags: 0, weight: 0, amount: 0 }
  );

  const generatedAt = new Date().toLocaleString('en-IN');

  const rowsHtml = rows
    .map(
      (row, index) => `
        <tr>
          <td class="center">${index + 1}</td>
          <td>${escapeHtml(row.memberCode || row.memberId)}</td>
          <td>${escapeHtml(row.memberName)}</td>
          <td>${escapeHtml(row.villageName)}</td>
          <td class="num">${row.shares.toLocaleString('en-IN')}</td>
          <td class="num">${row.bags.toLocaleString('en-IN')}</td>
          <td class="num">${row.weight.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}</td>
          <td class="num">${row.amount.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}</td>
        </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Total Sugar Distribution Report</title>
<style>
  @page { size: A4 landscape; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, sans-serif; color: #111; font-size: 10px; }
  h1 { text-align: center; font-size: 19px; margin: 0 0 5px; }
  .subtitle { text-align: center; margin-bottom: 14px; }
  .filters { display: flex; justify-content: space-between; gap: 12px;
    margin-bottom: 12px; font-size: 10px; }
  .summary { display: flex; gap: 10px; margin-bottom: 14px; }
  .metric { flex: 1; border: 1px solid #888; padding: 8px; }
  .metric strong { display: block; font-size: 13px; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #555; padding: 6px 5px; }
  th { background: #e8eee9; text-align: center; }
  tbody tr:nth-child(even) { background: #f7f9f7; }
  .center { text-align: center; }
  .num { text-align: right; white-space: nowrap; }
  tfoot { font-weight: bold; background: #e8eee9; }
  .footer { margin-top: 12px; display: flex; justify-content: space-between; }
</style>
</head>
<body>
  <h1>SUGAR DISTRIBUTION REPORT</h1>
  <div class="subtitle">Member-wise distribution summary</div>

  <div class="filters">
    <span><b>From:</b> ${escapeHtml(displayDate(fromDate))}</span>
    <span><b>To:</b> ${escapeHtml(displayDate(toDate))}</span>
    <span><b>Taluka:</b> ${escapeHtml(talukaName)}</span>
    <span><b>Village:</b> ${escapeHtml(villageName)}</span>
  </div>

  <div class="summary">
    <div class="metric">Members<strong>${rows.length}</strong></div>
    <div class="metric">Total Bags<strong>${totals.bags.toLocaleString('en-IN')}</strong></div>
    <div class="metric">Total Weight<strong>${totals.weight.toLocaleString('en-IN')} kg</strong></div>
    <div class="metric">Total Amount<strong>${money(totals.amount)}</strong></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>No.</th>
        <th>Member ID / Code</th>
        <th>Member Name</th>
        <th>Village</th>
        <th>Total Shares</th>
        <th>Total Bags</th>
        <th>Total Weight (kg)</th>
        <th>Total Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml || '<tr><td colspan="8" class="center">No distribution records found for the selected filters.</td></tr>'}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="4" class="num">GRAND TOTAL</td>
        <td class="num">${totals.shares.toLocaleString('en-IN')}</td>
        <td class="num">${totals.bags.toLocaleString('en-IN')}</td>
        <td class="num">${totals.weight.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}</td>
        <td class="num">${totals.amount.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}</td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    <span>Generated: ${escapeHtml(generatedAt)}</span>
    <span>SugarERP</span>
  </div>
</body>
</html>`;
};

const cardStyle = {
  backgroundColor: '#FFFFFF',
  borderColor: BORDER,
  borderWidth: 1,
  borderRadius: 12,
  padding: 14,
  marginBottom: 12,
};

const labelStyle = {
  color: MUTED,
  fontSize: 12,
  fontWeight: '600',
  marginBottom: 6,
};

const inputStyle = {
  minHeight: 46,
  borderWidth: 1,
  borderColor: BORDER,
  borderRadius: 8,
  paddingHorizontal: 12,
  color: TEXT,
  backgroundColor: '#FFFFFF',
};

const buttonStyle = {
  minHeight: 46,
  borderRadius: 9,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  paddingHorizontal: 14,
};

const ReportsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const initialRange = useMemo(() => currentMonthRange(), []);

  const [fromDate, setFromDate] = useState(initialRange.from);
  const [toDate, setToDate] = useState(initialRange.to);

  const [talukas, setTalukas] = useState([]);
  const [villages, setVillages] = useState([]);
  const [selectedTalukaId, setSelectedTalukaId] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('');

  const [picker, setPicker] = useState(null);
  const [reportRows, setReportRows] = useState([]);
  const [generated, setGenerated] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadLocations = async () => {
      setLoadingLocations(true);
      try {
        const [talukaResponse, villageResponse] = await Promise.all([
          getTalukas(),
          getVillages(),
        ]);

        if (mounted) {
          setTalukas(getList(talukaResponse));
          setVillages(getList(villageResponse));
        }
      } catch (error) {
        console.error('Could not load report locations:', error);
        if (mounted) {
          setErrorMessage(
            'Could not load talukas and villages. Check your access and connection.'
          );
        }
      } finally {
        if (mounted) setLoadingLocations(false);
      }
    };

    loadLocations();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedTaluka = talukas.find(
    (item) => String(item.id) === String(selectedTalukaId)
  );

  const selectedVillage = villages.find(
    (item) => String(item.id) === String(selectedVillageId)
  );

  const filteredVillages = useMemo(() => {
    if (!selectedTalukaId) return villages;

    return villages.filter(
      (item) => String(item.taluka_id) === String(selectedTalukaId)
    );
  }, [villages, selectedTalukaId]);

  const totals = useMemo(
    () =>
      reportRows.reduce(
        (acc, row) => ({
          bags: acc.bags + row.bags,
          weight: acc.weight + row.weight,
          amount: acc.amount + row.amount,
          shares: acc.shares + row.shares,
        }),
        { bags: 0, weight: 0, amount: 0, shares: 0 }
      ),
    [reportRows]
  );

  const generateReport = useCallback(async () => {
    setErrorMessage('');
    setGenerated(false);

    if (!fromDate || !toDate) {
      setErrorMessage('Select both From Date and To Date.');
      return;
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(fromDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(toDate)
    ) {
      setErrorMessage('Enter dates in YYYY-MM-DD format.');
      return;
    }

    if (fromDate > toDate) {
      setErrorMessage('From Date cannot be later than To Date.');
      return;
    }

    setGenerating(true);

    try {
      const [distributionResponse, memberResponse] = await Promise.all([
        getDistributions({ fromDate, toDate }),
        getMembers(),
      ]);

      const distributions = getList(distributionResponse);
      const members = getList(memberResponse);

      const memberMap = new Map(
        members.map((member) => [String(member.id), member])
      );

      const villageMap = new Map(
        villages.map((village) => [String(village.id), village])
      );

      const filteredDistributions = distributions.filter((item) => {
        if (item.is_active === false) return false;

        const village = villageMap.get(String(item.village_id));

        if (
          selectedVillageId &&
          String(item.village_id) !== String(selectedVillageId)
        ) {
          return false;
        }

        if (
          selectedTalukaId &&
          String(village?.taluka_id) !== String(selectedTalukaId)
        ) {
          return false;
        }

        return (
          String(item.distribution_date) >= fromDate &&
          String(item.distribution_date) <= toDate
        );
      });

      const grouped = new Map();

      for (const distribution of filteredDistributions) {
        const memberId = String(distribution.member_id);
        const member = memberMap.get(memberId);
        const village = villageMap.get(String(distribution.village_id));

        if (!grouped.has(memberId)) {
          grouped.set(memberId, {
            memberId: distribution.member_id,
            memberCode: member?.member_code || distribution.member_code || '',
            memberName:
              member?.full_name ||
              member?.name ||
              `Member ${distribution.member_id}`,
            villageName: village?.name || '-',
            shares: number(member?.shares),
            bags: 0,
            weight: 0,
            amount: 0,
          });
        }

        const row = grouped.get(memberId);
        row.bags += number(distribution.bag_count);
        row.weight += number(
          distribution.total_weight_kg ??
          number(distribution.bag_count) * number(distribution.bag_weight_kg)
        );
        row.amount += number(distribution.total_amount);
      }

      const rows = Array.from(grouped.values()).sort((a, b) =>
        String(a.memberName).localeCompare(String(b.memberName))
      );

      setReportRows(rows);
      setGenerated(true);
    } catch (error) {
      console.error('Report generation failed:', error);
      setReportRows([]);
      setErrorMessage(
        error?.message ||
          'Could not generate the report. Check your connection and permissions.'
      );
    } finally {
      setGenerating(false);
    }
  }, [
    fromDate,
    toDate,
    selectedTalukaId,
    selectedVillageId,
    villages,
  ]);

    
  const exportPdf = useCallback(async () => {
    if (!generated) {
      Alert.alert('Generate report', 'Please generate the report first.');
      return;
    }

    setExporting(true);

    try {
      const html = buildPdfHtml({
        fromDate,
        toDate,
        talukaName: selectedTaluka?.name || 'All Talukas',
        villageName: selectedVillage?.name || 'All Villages',
        rows: reportRows,
      });

      if (Platform.OS === 'web') {
        const reportWindow = window.open('', '_blank');

        if (!reportWindow) {
          throw new Error(
            'The report tab was blocked. Allow pop-ups and try again.'
          );
        }

        reportWindow.document.open();
        reportWindow.document.write(html);
        reportWindow.document.close();
        reportWindow.focus();
        reportWindow.print();
        return;
      }

      // Generate the PDF in Expo's app cache.
      const file = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Android: use the native print dialog, avoiding the file URI
      // permission issue raised by Expo Sharing.
      if (Platform.OS === 'android') {
        await Print.printAsync({
          uri: file.uri,
        });
        return;
      }

      // iOS: keep the existing share-sheet behaviour.
      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Sugar Distribution Report',
          UTI: 'com.adobe.pdf',
        });
      } else {
        await Print.printAsync({
          uri: file.uri,
        });
      }
    } catch (error) {
      console.error('PDF export failed:', error);

      Alert.alert(
        'PDF Export Failed',
        error?.message || 'Could not create or open the PDF.'
      );
    } finally {
      setExporting(false);
    }
  }, [
    generated,
    fromDate,
    toDate,
    selectedTaluka,
    selectedVillage,
    reportRows,
  ]);


  const openPicker = (type) => setPicker(type);

  const pickerOptions = useMemo(() => {
    if (picker === 'taluka') {
      return [
        { id: '', name: 'All Talukas' },
        ...talukas,
      ];
    }

    if (picker === 'village') {
      return [
        { id: '', name: 'All Villages' },
        ...filteredVillages,
      ];
    }

    return [];
  }, [picker, talukas, filteredVillages]);

  const selectOption = (item) => {
    if (picker === 'taluka') {
      setSelectedTalukaId(String(item.id || ''));
      setSelectedVillageId('');
    } else if (picker === 'village') {
      setSelectedVillageId(String(item.id || ''));
    }

    setPicker(null);
    setGenerated(false);
  };

  const renderPickerButton = (label, value, onPress, disabled = false) => (
    <View style={{ flex: 1 }}>
      <Text style={labelStyle}>{label}</Text>
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled}
        onPress={onPress}
        style={[
          inputStyle,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            opacity: disabled ? 0.55 : 1,
          },
        ]}
      >
        <Text style={{ color: TEXT, flex: 1 }} numberOfLines={1}>
          {value}
        </Text>
        <MaterialCommunityIcons
          name="chevron-down"
          size={21}
          color={MUTED}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <AppShell activeTab="Reports" navigation={navigation} title="Sugar Reports">
      <ScrollView
        style={{ flex: 1, backgroundColor: '#F8FAF8' }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40, paddingTop: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: TEXT, fontSize: 24, fontWeight: '800' }}>
            Total Distribution Report
          </Text>
          <Text style={{ color: MUTED, marginTop: 5, fontSize: 13 }}>
            Filter actual sugar distributions and generate a tabular PDF.
          </Text>
        </View>

        <View style={cardStyle}>
          <Text style={{ color: TEXT, fontSize: 16, fontWeight: '700', marginBottom: 14 }}>
            Report Filters
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={labelStyle}>From Date</Text>
              <TextInput
                value={fromDate}
                onChangeText={(value) => {
                  setFromDate(value);
                  setGenerated(false);
                }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                style={inputStyle}
                autoCapitalize="none"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={labelStyle}>To Date</Text>
              <TextInput
                value={toDate}
                onChangeText={(value) => {
                  setToDate(value);
                  setGenerated(false);
                }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                style={inputStyle}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
            {renderPickerButton(
              'Taluka',
              selectedTaluka?.name || 'All Talukas',
              () => openPicker('taluka'),
              loadingLocations
            )}

            {renderPickerButton(
              'Village / City',
              selectedVillage?.name || 'All Villages',
              () => openPicker('village'),
              loadingLocations
            )}
          </View>

          {loadingLocations && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <ActivityIndicator color={GREEN} size="small" />
              <Text style={{ color: MUTED, marginLeft: 8 }}>
                Loading locations...
              </Text>
            </View>
          )}

          {!!errorMessage && (
            <Text style={{ color: '#B91C1C', marginBottom: 12, lineHeight: 20 }}>
              {errorMessage}
            </Text>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={generateReport}
            disabled={generating || loadingLocations}
            style={[
              buttonStyle,
              { backgroundColor: GREEN, opacity: generating || loadingLocations ? 0.7 : 1 },
            ]}
          >
            {generating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons
                name="file-chart-outline"
                size={20}
                color="#FFFFFF"
              />
            )}
            <Text style={{ color: '#FFFFFF', fontWeight: '700', marginLeft: 8 }}>
              {generating ? 'Generating...' : 'Generate Report'}
            </Text>
          </TouchableOpacity>
        </View>

        {generated && (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Members', value: reportRows.length.toLocaleString('en-IN') },
                { label: 'Total Bags', value: totals.bags.toLocaleString('en-IN') },
                {
                  label: 'Total Weight',
                  value: `${totals.weight.toLocaleString('en-IN', { maximumFractionDigits: 2 })} kg`,
                },
                { label: 'Total Amount', value: money(totals.amount) },
              ].map((metric) => (
                <View
                  key={metric.label}
                  style={{
                    flexGrow: 1,
                    flexBasis: '45%',
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: BORDER,
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <Text style={{ color: MUTED, fontSize: 12 }}>{metric.label}</Text>
                  <Text style={{ color: GREEN, fontWeight: '800', fontSize: 20, marginTop: 5 }}>
                    {metric.value}
                  </Text>
                </View>
              ))}
            </View>

            <View style={cardStyle}>
              <View style={{ marginBottom: 12 }}>
                <Text style={{ color: TEXT, fontSize: 16, fontWeight: '800' }}>
                  Member-wise Summary
                </Text>
                <Text style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>
                  {displayDate(fromDate)} to {displayDate(toDate)}
                </Text>
              </View>

              {reportRows.length === 0 ? (
                <Text style={{ color: MUTED, paddingVertical: 18, textAlign: 'center' }}>
                  No distribution records found for these filters.
                </Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator>
                  <View>
                    <View
                      style={{
                        flexDirection: 'row',
                        backgroundColor: GREEN,
                        paddingVertical: 10,
                        paddingHorizontal: 8,
                        minWidth: 720,
                      }}
                    >
                      {[
                        ['Member ID', 100],
                        ['Member Name', 165],
                        ['Shares', 75],
                        ['Bags', 65],
                        ['Weight (kg)', 105],
                        ['Amount (₹)', 130],
                      ].map(([title, width]) => (
                        <Text
                          key={title}
                          style={{
                            width,
                            color: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: '700',
                            paddingHorizontal: 4,
                          }}
                        >
                          {title}
                        </Text>
                      ))}
                    </View>

                    {reportRows.map((row, index) => (
                      <View
                        key={String(row.memberId)}
                        style={{
                          flexDirection: 'row',
                          minWidth: 720,
                          paddingVertical: 10,
                          paddingHorizontal: 8,
                          backgroundColor: index % 2 === 0 ? LIGHT_GREEN : '#FFFFFF',
                          borderBottomWidth: 1,
                          borderBottomColor: '#E5E7EB',
                        }}
                      >
                        <Text style={{ width: 100, color: TEXT, fontSize: 12, paddingHorizontal: 4 }}>
                          {row.memberCode || row.memberId}
                        </Text>
                        <Text style={{ width: 165, color: TEXT, fontSize: 12, paddingHorizontal: 4 }}>
                          {row.memberName}
                        </Text>
                        <Text style={{ width: 75, color: TEXT, fontSize: 12, paddingHorizontal: 4 }}>
                          {row.shares}
                        </Text>
                        <Text style={{ width: 65, color: TEXT, fontSize: 12, paddingHorizontal: 4 }}>
                          {row.bags}
                        </Text>
                        <Text style={{ width: 105, color: TEXT, fontSize: 12, paddingHorizontal: 4 }}>
                          {row.weight.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </Text>
                        <Text style={{ width: 130, color: GREEN, fontSize: 12, fontWeight: '700', paddingHorizontal: 4 }}>
                          {money(row.amount)}
                        </Text>
                      </View>
                    ))}

                    <View
                      style={{
                        flexDirection: 'row',
                        minWidth: 720,
                        paddingVertical: 12,
                        paddingHorizontal: 8,
                        backgroundColor: '#E5EFE6',
                      }}
                    >
                      <Text style={{ width: 265, color: GREEN, fontWeight: '800', paddingHorizontal: 4 }}>
                        GRAND TOTAL
                      </Text>
                      <Text style={{ width: 75, color: GREEN, fontWeight: '800', paddingHorizontal: 4 }}>
                        {totals.shares}
                      </Text>
                      <Text style={{ width: 65, color: GREEN, fontWeight: '800', paddingHorizontal: 4 }}>
                        {totals.bags}
                      </Text>
                      <Text style={{ width: 105, color: GREEN, fontWeight: '800', paddingHorizontal: 4 }}>
                        {totals.weight.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </Text>
                      <Text style={{ width: 130, color: GREEN, fontWeight: '800', paddingHorizontal: 4 }}>
                        {money(totals.amount)}
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={exportPdf}
              disabled={exporting}
              style={[
                buttonStyle,
                { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: GREEN },
              ]}
            >
              {exporting ? (
                <ActivityIndicator color={GREEN} />
              ) : (
                <MaterialCommunityIcons name="file-pdf-box" size={22} color={GREEN} />
              )}
              <Text style={{ color: GREEN, fontWeight: '800', marginLeft: 8 }}>
                {exporting ? 'Creating PDF...' : 'Export / Print PDF'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <Modal
        visible={Boolean(picker)}
        transparent
        animationType="fade"
        onRequestClose={() => setPicker(null)}
      >
        <Pressable
          onPress={() => setPicker(null)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
            justifyContent: 'center',
            padding: 22,
          }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              maxHeight: '75%',
              padding: 16,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: TEXT, fontSize: 18, fontWeight: '800' }}>
                {picker === 'taluka' ? 'Select Taluka' : 'Select Village / City'}
              </Text>
              <TouchableOpacity onPress={() => setPicker(null)} hitSlop={10}>
                <MaterialCommunityIcons name="close" size={24} color={TEXT} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {pickerOptions.map((item, index) => (
                <TouchableOpacity
                  key={`${picker}-${item.id || 'all'}-${index}`}
                  onPress={() => selectOption(item)}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E7EB',
                  }}
                >
                  <Text style={{ color: TEXT, fontSize: 15 }}>
                    {item.name || item.code || `#${item.id}`}
                  </Text>
                </TouchableOpacity>
              ))}

              {pickerOptions.length === 0 && (
                <Text style={{ color: MUTED, padding: 16 }}>
                  No options available.
                </Text>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </AppShell>
  );
};

export default ReportsScreen;
