import React from 'react';
import { View } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';
import colors from '../../constants/colors';
import { inputStyles } from '../../screens/Login/LoginStyles';

const AppInput = ({
  label,
  value,
  onChangeText,
  secureTextEntry,
  rightIcon,
  onRightPress,
  errorText,
  keyboardType = 'default',
}) => {
  return (
    <View style={inputStyles.wrapper}>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        error={Boolean(errorText)}
        style={inputStyles.input}
        outlineStyle={inputStyles.outline}
        contentStyle={inputStyles.content}
        activeOutlineColor={colors.primary}
        outlineColor={colors.border}
        textColor={colors.text}
        placeholderTextColor={colors.muted}
        right={
          rightIcon ? (
            <TextInput.Icon
              icon={rightIcon}
              color={colors.text}
              onPress={onRightPress}
              forceTextInputFocus={false}
            />
          ) : null
        }
      />

      <HelperText type="error" visible={Boolean(errorText)} style={inputStyles.helper}>
        {errorText}
      </HelperText>
    </View>
  );
};

export default AppInput;