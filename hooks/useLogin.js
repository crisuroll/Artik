import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../supabase/supabaseClient';
import { useRouter } from 'expo-router';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async (identifier, password) => {
    if (!identifier || !password) {
      Alert.alert("Error", "You must fill all fields.");
      return;
    }

    setLoading(true);

    let emailToUse = identifier;

    if (!identifier.includes('@')) {
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('username', identifier)
        .single();

      if (error || !data) {
        Alert.alert("Error", "Username not found.");
        setLoading(false);
        return;
      }

      emailToUse = data.email;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (error) {
      Alert.alert("Error trying to log in.", error.message);
      setLoading(false);
      return;
    }

    Alert.alert("Éxito", "Inicio de sesión correcto");
    router.push("/home");
    setLoading(false);
  };

  return { login, loading };
};
