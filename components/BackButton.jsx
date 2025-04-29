import { Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function BackButton() {
  const router = useRouter();

  return (
    <Pressable 
      onPress={() => router.back()}
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