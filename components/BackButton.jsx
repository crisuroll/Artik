import { Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function BackButton({ fallback = '/' }) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof router.canGoBack === 'function' && router.canGoBack()) {
      router.back();
    } else if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
      router.back();
    } else {
      router.replace(fallback);
    }
  };

  return (
    <Pressable
      onPress={handleBack}
      style={({ pressed }) => [
        styles.buttonContainer,
        { opacity: pressed ? 0.5 : 1 }
      ]}
    >
      <Text style={styles.backButton}>{'< Back'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  backButton: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
});