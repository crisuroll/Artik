import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { supabase } from '../supabase/supabaseClient';

export default function ConfirmEmail() {
  const { email, password } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckConfirmed = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert("Aún no has confirmado tu email o los datos son incorrectos.");
    } else {
      router.replace('/edit_profile');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        ¡Revisa tu correo y verifica tu cuenta!{'\n'}
        Cuando hayas clickado al enlace, vuelve a esta página y pulsa el botón.
      </Text>
      <Pressable
        onPress={handleCheckConfirmed}
        disabled={loading}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: pressed ? '#5ea8a0' : '#70c0b7', opacity: loading ? 0.7 : 1 }
        ]}
      >
        <Text style={styles.buttonText}>
          {loading ? "Comprobando..." : "Ya he confirmado mi email"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  text: { fontSize: 18, textAlign: 'center', marginBottom: 32 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#70c0b7'
  },
  button: {
    height: 45,
    width: 220,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: '#70c0b7',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
});