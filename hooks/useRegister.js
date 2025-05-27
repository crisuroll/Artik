import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../supabase/supabaseClient';
import { useRouter } from 'expo-router';

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const register = async (username, email, password, confirmPassword) => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Error", "You must fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      Alert.alert("Error trying to sign up.", error.message);
    } else {
      router.replace({
        pathname: '/confirm_email',
        params: { email, password }
      });
    }

    setLoading(false);
  };

  return { register, loading };
};
