
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AppShell = ({ children }) => {
  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#1E5E2A"
        translucent={false}
      />

      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E5E2A',
  },
  content: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#F7F9F7',
  },
});

export default AppShell;
