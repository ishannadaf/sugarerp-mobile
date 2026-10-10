import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { cardStyles } from '../../screens/Login/LoginStyles';

const GlassCard = ({ children }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 7,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <Animated.View style={[cardStyles.card, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

export default GlassCard;