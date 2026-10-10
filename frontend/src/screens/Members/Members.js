import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import colors from '../../constants/colors';
import styles from './MembersStyles';

import { getVillages } from '../../services/villageService';

import {
  getMembers,
  deleteMember,
} from '../../services/memberService';

const Members = ({
  navigation,
}) => {
  const [
    members,
    setMembers,
  ] = useState([]);

  const [
    villages,
    setVillages,
  ] = useState([]);

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(null);

  const [
    selectedMember,
    setSelectedMember,
  ] = useState(null);

  const [
    actionModalVisible,
    setActionModalVisible,
  ] = useState(false);


  /*
   * ==========================================
   * LOAD MEMBERS + VILLAGES
   * ==========================================
   */

  const fetchMembers = useCallback(
    async () => {
      try {
        setError(null);

        const [
          memberData,
          villageData,
        ] = await Promise.all([
          getMembers(),
          getVillages(),
        ]);

        setMembers(
          Array.isArray(memberData)
            ? memberData
            : []
        );

        setVillages(
          Array.isArray(villageData)
            ? villageData
            : []
        );
      } catch (err) {
        console.error(
          'Failed to fetch members:',
          err
        );

        setError(
          err?.message ||
            'Unable to load members'
        );

        setMembers([]);
        setVillages([]);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    []
  );


  /*
   * ==========================================
   * LOAD WHEN SCREEN OPENS / FOCUSES
   * ==========================================
   */

  useEffect(() => {
    const unsubscribe =
      navigation.addListener(
        'focus',
        fetchMembers
      );

    return unsubscribe;
  }, [
    navigation,
    fetchMembers,
  ]);


  /*
   * ==========================================
   * REFRESH
   * ==========================================
   */

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMembers();
  };


  /*
   * ==========================================
   * VILLAGE NAME
   * ==========================================
   */

  const getVillageName = (villageId) => {
    const village = villages.find(
      (item) =>
        Number(item.id) === Number(villageId)
    );

    if (!village) {
      return `Village ID: ${villageId}`;
    }

    return village.name;
  };


  /*
   * ==========================================
   * SEARCH
   * ==========================================
   */

  const filteredMembers =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return members;
      }

      return members.filter(
        (member) => {
          const memberCode =
            member.member_code ||
            '';

          const memberName =
            member.full_name ||
            '';

          const mobile =
            member.mobile_number ||
            '';

          const address =
            member.address ||
            '';

          const villageName =
            getVillageName(
              member.village_id
            );

          return [
            memberCode,
            memberName,
            mobile,
            address,
            villageName,
          ]
            .join(' ')
            .toLowerCase()
            .includes(query);
        }
      );
    }, [
      members,
      search,
      villages,
    ]);


  /*
   * ==========================================
   * ACTIVE MEMBER COUNT
   * ==========================================
   */

  const activeMemberCount =
    members.filter(
      (member) =>
        member.is_active === true
    ).length;


  /*
   * ==========================================
   * MEMBER INITIAL
   * ==========================================
   */

  const getInitial =
    (name) => {
      if (!name) {
        return '?';
      }

      return name
        .trim()
        .charAt(0)
        .toUpperCase();
    };


  /*
   * ==========================================
   * STATUS
   * ==========================================
   */

  const getStatus =
    (member) => {
      return member.is_active
        ? 'Active'
        : 'Inactive';
    };


  /*
   * ==========================================
   * MEMBER ACTIONS
   * ==========================================
   */

  const openMemberActions = (member) => {
    setSelectedMember(member);
    setActionModalVisible(true);
  };

  const closeMemberActions = () => {
    setActionModalVisible(false);
  };

  const handleEditMember = () => {
    if (!selectedMember) {
      return;
    }

    setActionModalVisible(false);

    navigation.navigate(
      'AddMember',
      {
        mode: 'edit',
        member: selectedMember,
      }
    );
  };

  const handleDeleteMember = () => {
    if (!selectedMember) {
      return;
    }

    const memberToDelete =
      selectedMember;

    setActionModalVisible(false);

    Alert.alert(
      'Delete Member',
      `Are you sure you want to delete ${memberToDelete.full_name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',

          onPress: async () => {
            try {
              setIsLoading(true);

              await deleteMember(
                memberToDelete.id
              );

              Alert.alert(
                'Success',
                'Member deleted successfully.'
              );

              setSelectedMember(null);

              await fetchMembers();
            } catch (err) {
              console.error(
                'Failed to delete member:',
                err
              );

              Alert.alert(
                'Delete Failed',
                err?.message ||
                  'Unable to delete member.'
              );

              setIsLoading(false);
            }
          },
        },
      ]
    );
  };


  return (
    <View style={styles.screen}>

      <StatusBar
        barStyle="light-content"
        backgroundColor={
          colors.secondary
        }
      />


      {/* ====================================
          APP BAR
      ===================================== */}

      <View style={styles.appBar}>

        <View
          style={
            styles.appBarLeft
          }
        >

          <Pressable
            style={
              styles.iconButton
            }
            onPress={() =>
              navigation.goBack()
            }
          >

            <MaterialCommunityIcons
              name="arrow-left"
              size={25}
              color={colors.white}
            />

          </Pressable>


          <Text
            style={
              styles.appTitle
            }
          >
            Members
          </Text>

        </View>


        <Pressable
          style={
            styles.iconButton
          }
          onPress={
            handleRefresh
          }
        >

          <MaterialCommunityIcons
            name={
              refreshing
                ? 'loading'
                : 'refresh'
            }
            size={25}
            color={colors.white}
          />

        </Pressable>

      </View>


      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
        refreshing={refreshing}
        onRefresh={
          handleRefresh
        }
      >


        {/* ====================================
            HEADER
        ===================================== */}

        <View
          style={
            styles.heroRow
          }
        >

          <View>

            <Text
              style={
                styles.title
              }
            >
              Member List
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Manage registered sugar
              distribution members
            </Text>

          </View>


          <Pressable
            style={
              styles.addButton
            }
            onPress={() =>
              navigation.navigate(
                'AddMember'
              )
            }
          >

            <MaterialCommunityIcons
              name="plus"
              size={20}
              color={colors.white}
            />

            <Text
              style={
                styles.addButtonText
              }
            >
              Add
            </Text>

          </Pressable>

        </View>


        {/* ====================================
            SEARCH
        ===================================== */}

        <View
          style={
            styles.searchBox
          }
        >

          <MaterialCommunityIcons
            name="magnify"
            size={23}
            color={colors.text}
          />

          <TextInput
            value={search}
            onChangeText={
              setSearch
            }
            placeholder={
              'Search member name, code, village...'
            }
            placeholderTextColor={
              colors.muted
            }
            style={
              styles.searchInput
            }
            autoCapitalize="none"
            autoCorrect={false}
          />

          {search.length > 0 ? (

            <Pressable
              onPress={() =>
                setSearch('')
              }
            >

              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color={colors.muted}
              />

            </Pressable>

          ) : null}

        </View>


        {/* ====================================
            SUMMARY
        ===================================== */}

        <View
          style={
            styles.summaryRow
          }
        >

          <View
            style={
              styles.summaryCard
            }
          >

            <Text
              style={
                styles.summaryLabel
              }
            >
              Total Members
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {isLoading
                ? '...'
                : members.length}
            </Text>

          </View>


          <View
            style={
              styles.summaryCard
            }
          >

            <Text
              style={
                styles.summaryLabel
              }
            >
              Active Members
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {isLoading
                ? '...'
                : activeMemberCount}
            </Text>

          </View>

        </View>


        {/* ====================================
            ERROR
        ===================================== */}

        {error ? (

          <Pressable
            onPress={
              handleRefresh
            }
            style={{
              marginBottom: 16,
              padding: 14,
              borderRadius: 12,
              backgroundColor:
                colors.white,
              borderWidth: 1,
              borderColor:
                colors.primary,
            }}
          >

            <Text
              style={{
                color:
                  colors.primary,
                fontWeight: '700',
              }}
            >
              Unable to load members
            </Text>

            <Text
              style={{
                color:
                  colors.text,
                marginTop: 5,
                fontSize: 12,
              }}
            >
              {error}
            </Text>

            <Text
              style={{
                color:
                  colors.muted,
                marginTop: 7,
                fontSize: 12,
              }}
            >
              Tap to retry
            </Text>

          </Pressable>

        ) : null}


        {/* ====================================
            LOADING / MEMBER LIST
        ===================================== */}

        {isLoading ? (

          <ActivityIndicator
            size="large"
            color={
              colors.primary
            }
            style={{
              marginTop: 40,
            }}
          />

        ) : (

          <View
            style={
              styles.list
            }
          >

            {filteredMembers.map(
              (member) => {

                const status =
                  getStatus(
                    member
                  );

                const isActive =
                  member.is_active ===
                  true;

                const villageName =
                  getVillageName(
                    member.village_id
                  );

                return (

                  <Pressable
                    key={
                      member.id
                    }
                    style={
                      styles.memberCard
                    }
                    onPress={() =>
                      openMemberActions(
                        member
                      )
                    }
                  >

                    {/* Avatar */}

                    <View
                      style={
                        styles.avatar
                      }
                    >

                      <Text
                        style={
                          styles.avatarText
                        }
                      >
                        {getInitial(
                          member.full_name
                        )}
                      </Text>

                    </View>


                    {/* Member information */}

                    <View
                      style={
                        styles.memberInfo
                      }
                    >

                      <View
                        style={
                          styles.codeRow
                        }
                      >

                        <Text
                          style={
                            styles.memberCode
                          }
                        >
                          {member.member_code}
                        </Text>


                        <View
                          style={[
                            styles.statusPill,

                            !isActive && {
                              backgroundColor:
                                '#fee2e2',
                            },
                          ]}
                        >

                          <Text
                            style={[
                              styles.statusText,

                              !isActive && {
                                color:
                                  '#ef4444',
                              },
                            ]}
                          >
                            {status}
                          </Text>

                        </View>

                      </View>


                      <Text
                        style={
                          styles.memberName
                        }
                      >
                        {member.full_name}
                      </Text>


                      <Text
                        style={
                          styles.memberMeta
                        }
                      >
                        {member.mobile_number ||
                          'No mobile number'}
                      </Text>


                      {member.address ? (

                        <Text
                          style={
                            styles.memberMeta
                          }
                          numberOfLines={2}
                        >
                          {member.address}
                        </Text>

                      ) : null}


                      <Text
                        style={
                          styles.memberMeta
                        }
                      >
                        Village:{' '}
                        {villageName}
                      </Text>


                      <View
                        style={
                          styles.memberFooter
                        }
                      >

                        <Text
                          style={
                            styles.footerText
                          }
                        >
                          Member ID:{' '}
                          {member.id}
                        </Text>

                        <Text
                          style={
                            styles.footerText
                          }
                        >
                          Village ID:{' '}
                          {member.village_id}
                        </Text>

                      </View>

                    </View>

                  </Pressable>

                );
              }
            )}

          </View>

        )}


        {/* ====================================
            EMPTY STATE
        ===================================== */}

        {!isLoading &&
        filteredMembers.length === 0 ? (

          <Text
            style={
              styles.emptyText
            }
          >
            {search.trim()
              ? 'No members match your search'
              : 'No members found'}
          </Text>

        ) : null}

      </ScrollView>


      {/* ====================================
          MEMBER ACTION MODAL
      ===================================== */}

      <Modal
        visible={
          actionModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={
          closeMemberActions
        }
      >

        <Pressable
          style={{
            flex: 1,
            backgroundColor:
              'rgba(0,0,0,0.45)',
            justifyContent:
              'flex-end',
          }}
          onPress={
            closeMemberActions
          }
        >

          <Pressable
            style={{
              backgroundColor:
                colors.white,
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 28,
            }}
            onPress={(event) =>
              event.stopPropagation()
            }
          >

            <View
              style={{
                width: 42,
                height: 5,
                borderRadius: 3,
                backgroundColor:
                  '#d1d5db',
                alignSelf: 'center',
                marginBottom: 18,
              }}
            />


            <Text
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: colors.text,
                marginBottom: 4,
              }}
            >
              Member Actions
            </Text>


            {selectedMember ? (

              <Text
                style={{
                  fontSize: 13,
                  color: colors.muted,
                  marginBottom: 18,
                }}
                numberOfLines={1}
              >
                {selectedMember.full_name}
                {' • '}
                {selectedMember.member_code}
              </Text>

            ) : null}


            {/* Edit */}

            <Pressable
              onPress={
                handleEditMember
              }
              style={{
                flexDirection:
                  'row',
                alignItems:
                  'center',
                paddingVertical: 15,
                borderBottomWidth: 1,
                borderBottomColor:
                  '#e5e7eb',
              }}
            >

              <MaterialCommunityIcons
                name="pencil-outline"
                size={22}
                color={
                  colors.primary
                }
              />

              <Text
                style={{
                  marginLeft: 14,
                  fontSize: 16,
                  fontWeight: '600',
                  color:
                    colors.text,
                }}
              >
                Edit Member
              </Text>

            </Pressable>


            {/* Delete */}

            <Pressable
              onPress={
                handleDeleteMember
              }
              style={{
                flexDirection:
                  'row',
                alignItems:
                  'center',
                paddingVertical: 15,
                borderBottomWidth: 1,
                borderBottomColor:
                  '#e5e7eb',
              }}
            >

              <MaterialCommunityIcons
                name="delete-outline"
                size={22}
                color="#ef4444"
              />

              <Text
                style={{
                  marginLeft: 14,
                  fontSize: 16,
                  fontWeight: '600',
                  color:
                    '#ef4444',
                }}
              >
                Delete Member
              </Text>

            </Pressable>


            {/* Cancel */}

            <Pressable
              onPress={
                closeMemberActions
              }
              style={{
                marginTop: 14,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor:
                  '#f3f4f6',
                alignItems:
                  'center',
              }}
            >

              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '700',
                  color:
                    colors.text,
                }}
              >
                Cancel
              </Text>

            </Pressable>

          </Pressable>

        </Pressable>

      </Modal>

    </View>
  );
};

export default Members;