import React, { useRef } from 'react';
import { Animated, Pressable, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { checkboxStyles, responsiveIconSizes } from '../../screens/Login/LoginStyles';

const AppCheckbox = ({ checked, label, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.9,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <Pressable style={checkboxStyles.container} onPress={handlePress}>
      <Animated.View style={[checkboxStyles.box, checked && checkboxStyles.boxChecked, { transform: [{ scale }] }]}>
        {checked ? (
          <MaterialCommunityIcons name="check" size={responsiveIconSizes.checkbox} color={colors.white} />
        ) : null}
      </Animated.View>
      <Text style={checkboxStyles.label}>{label}</Text>
    </Pressable>
  );
};

export default AppCheckbox;