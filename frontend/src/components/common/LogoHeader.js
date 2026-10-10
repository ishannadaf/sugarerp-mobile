import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { logoStyles, responsiveIconSizes  } from '../../screens/Login/LoginStyles';

const LogoHeader = () => {
  const logoScale = useRef(new Animated.Value(0.86)).current;

  useEffect(() => {
    Animated.spring(logoScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 70,
    }).start();
  }, [logoScale]);

  return (
    <View style={logoStyles.container}>
      <Animated.View style={[logoStyles.logoBox, { transform: [{ scale: logoScale }, { rotate: '3deg' }] }]}>
        <MaterialCommunityIcons name="robot-industrial" size={responsiveIconSizes.logo} color={colors.white} />
      </Animated.View>

      <Text style={logoStyles.title}>SugarERP</Text>
      <Text style={logoStyles.subtitle}>Enterprise Resource Planning for Commodities</Text>
    </View>
  );
};

export default LogoHeader;