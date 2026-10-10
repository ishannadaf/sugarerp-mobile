import React, { useRef } from 'react';
import { Animated, Pressable, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { buttonStyles, responsiveIconSizes } from '../../screens/Login/LoginStyles';

const AppButton = ({ title, icon = 'login-variant', onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      friction: 6,
      tension: 90,
    }).start();
  };

  return (
    <Animated.View style={[buttonStyles.animated, { transform: [{ scale }] }]}>
      <Pressable
        style={buttonStyles.button}
        onPress={onPress}
        onPressIn={() => animateTo(0.98)}
        onPressOut={() => animateTo(1)}
      >
        <Text style={buttonStyles.text}>{title}</Text>
        <MaterialCommunityIcons name={icon} size={responsiveIconSizes.button} color={colors.white} />
      </Pressable>
    </Animated.View>
  );
};

export default AppButton;