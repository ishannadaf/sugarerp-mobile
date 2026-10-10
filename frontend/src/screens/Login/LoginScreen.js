import React, { useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  View,
} from 'react-native';
import { HelperText, Menu } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

import AppButton from '../../components/common/AppButton';
import AppCheckbox from '../../components/common/AppCheckbox';
import AppInput from '../../components/common/AppInput';
import GlassCard from '../../components/common/GlassCard';
import LogoHeader from '../../components/common/LogoHeader';
import colors from '../../constants/colors';
import styles,{ responsiveIconSizes } from './LoginStyles';

const financialYears = ['FY 2024-25', 'FY 2023-24', 'FY 2022-23'];

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [financialYear, setFinancialYear] = useState('FY 2023-24');
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [yearMenuVisible, setYearMenuVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const togglePassword = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPasswordVisible((current) => !current);
  };

  const validate = () => {
    const nextErrors = {};

    if (!username.trim()) {
      nextErrors.username = 'Username is required';
    }

    if (!password.trim()) {
      nextErrors.password = 'Password is required';
    }

    if (!financialYear) {
      nextErrors.financialYear = 'Financial Year is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) {
      return;
    }

    try {
      setErrors({});

      await login(
        username.trim(),
        password
      );

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Dashboard',
          },
        ],
      });
    } catch (error) {
      console.log(
        'Login failed:',
        error
      );

      setErrors({
        login:
          error.message ||
          'Invalid username or password',
      });
    }
  };

  const selectFinancialYear = (year) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFinancialYear(year);
    setYearMenuVisible(false);
    setErrors((current) => ({ ...current, financialYear: '' }));
  };

  return (
    <ImageBackground
      source={require('../../assets/login-bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <LogoHeader />

            <GlassCard>
              <AppInput
                label="Username"
                value={username}
                onChangeText={setUsername}
                rightIcon="account-outline"
                errorText={errors.username}
              />

              <AppInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                rightIcon={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                onRightPress={togglePassword}
                errorText={errors.password}
              />

              <View style={styles.yearWrapper}>
                <Text style={styles.yearLabel}>Financial Year</Text>

                <Menu
                  visible={yearMenuVisible}
                  onDismiss={() => setYearMenuVisible(false)}
                  anchor={
                    <Pressable
                      style={[
                        styles.yearSelector,
                        errors.financialYear && styles.yearSelectorError,
                      ]}
                      onPress={() => setYearMenuVisible(true)}
                    >
                      <Text style={styles.yearText}>{financialYear || 'Select Financial Year'}</Text>
                      <MaterialCommunityIcons
                        name="calendar-month-outline"
                        size={responsiveIconSizes.calendar}
                        color={colors.text}
                      />
                    </Pressable>
                  }
                >
                  {financialYears.map((year) => (
                    <Menu.Item
                      key={year}
                      title={year}
                      onPress={() => selectFinancialYear(year)}
                    />
                  ))}
                </Menu>

                <HelperText
                  type="error"
                  visible={Boolean(errors.financialYear)}
                  style={styles.yearHelper}
                >
                  {errors.financialYear}
                </HelperText>
              </View>

              <View style={styles.optionsRow}>
                <AppCheckbox
                  checked={rememberMe}
                  label="Remember Me"
                  onPress={() => setRememberMe((current) => !current)}
                />

                <Pressable>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </Pressable>
              </View>

              <HelperText
                type="error"
                visible={Boolean(errors.login)}
              >
                {errors.login}
              </HelperText>

              <AppButton title="Login to Portal" onPress={handleLogin} />
            </GlassCard>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                © 2024 SugarERP Logistics. All Rights Reserved.
              </Text>

              <View style={styles.footerLinks}>
                <Text style={styles.footerLink}>Privacy Policy</Text>
                <Text style={styles.footerLink}>Support</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

export default LoginScreen;