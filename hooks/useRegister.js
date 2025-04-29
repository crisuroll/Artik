import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../supabase/supabaseClient';

export const useRegister = () => {
  const [loading, setLoading] = useState(false);

  const register = async (username, email, password, confirmPassword) => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "You must fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      Alert.alert("Error trying to sign up.", error.message);
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from('users').insert([{
      id: data.user.id,
      username: username,
      email: email,
      avatar_url: "https://ovbhqtvacxgkarasaakr.supabase.co/storage/v1/object/public/avatar//default.png",
      bio: ''
    }]);

    if (insertError) {
      Alert.alert("Error creating user profile.", insertError.message);
    } else {
      Alert.alert("Success", "Account created successfully! Check your email.");
    }

    setLoading(false);
  };

  return { register, loading };
};
