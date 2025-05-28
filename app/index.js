import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useSessionCheck } from '../hooks/useSession';

const Index = () => {
  const { loading } = useSessionCheck();

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#70c0b7" />}
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
