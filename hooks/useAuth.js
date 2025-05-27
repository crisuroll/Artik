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

    console.log('Intentando login con:', emailToUse, password);

    const { error, session } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password,
    });

    if (error) {
      console.log('Login error:', error);
      Alert.alert("Error trying to log in.", error.message);
      setLoading(false);
      return;
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      Alert.alert("Error", "No se pudo obtener el usuario autenticado.");
      setLoading(false);
      return;
    }
    const userId = user.id;

    const { data, error: profileError } = await supabase
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    if (profileError) {
      Alert.alert("Error", "Could not fetch user profile.");
      setLoading(false);
      return;
    }

    if (data.username.startsWith('user_')) {
      router.replace('/edit_profile');
    } else {
      router.replace('/home');
    }

    setLoading(false);
  };

  return { login, loading };
};

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
