import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
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
        ¡Revisa tu correo y confirma tu cuenta!{'\n'}
        Cuando hayas confirmado, pulsa el botón.
      </Text>
      <Button
        title={loading ? "Comprobando..." : "Ya he confirmado mi email"}
        onPress={handleCheckConfirmed}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  text: { fontSize: 18, textAlign: 'center', marginBottom: 32 }
});