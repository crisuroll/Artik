import { Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function BackButton({ fallback = '/' }) {
  const router = useRouter();

  const handleBack = () => {
    router.push(fallback);
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
    color: '#aaa',
    marginBottom: 10,
    fontFamily: 'Nunito',
  },
});