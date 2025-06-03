import { useState, useEffect, useCallback } from 'react';
import { Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import {
  loadUser,
  loadUserPosts,
  loadUserReposts,
  loadUserProducts,
  loadUserCommission,
} from '../services/usersService';
import { supabase } from '../supabase/supabaseClient';

async function getImageSize(uri) {
  return new Promise((resolve) => {
    if (!uri) return resolve({ width: 200, height: 300 });
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      () => resolve({ width: 200, height: 300 })
    );
  });
}

export function useUserProfile({ userId: propUserId, username }) {
  const [activeTab, setActiveTab] = useState('Posts');
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userReposts, setUserReposts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState(propUserId || null);
  const [commission, setCommission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        let user = null;
        let resolvedUserId = propUserId;

        if (propUserId) {
          user = await loadUser();
          resolvedUserId = propUserId;
        } else if (username) {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();
          user = data;
          resolvedUserId = data?.id;
        }

        if (user && resolvedUserId) {
          setUserData(user);
          setUserId(resolvedUserId);
          setDescription(user.bio || '');

          let posts = await loadUserPosts(resolvedUserId);
          posts = await Promise.all(
            posts.map(async (post) => {
              if (post.width && post.height) return post;
              if (post.imageUrl) {
                const { width, height } = await getImageSize(post.imageUrl);
                return { ...post, width, height };
              }
              return post;
            })
          );
          setUserPosts(posts);

          let reposts = await loadUserReposts(resolvedUserId);
          reposts = await Promise.all(
            reposts.map(async (post) => {
              if (post.width && post.height) return post;
              if (post.imageUrl) {
                const { width, height } = await getImageSize(post.imageUrl);
                return { ...post, width, height };
              }
              return post;
            })
          );
          setUserReposts(reposts);

          const products = await loadUserProducts(resolvedUserId);
          setUserProducts(products);

          const commissionData = await loadUserCommission(resolvedUserId);
          setCommission(commissionData);
        }
      } catch (error) {
        // Manejo de error opcional
      }
      setLoading(false);
    };
    fetchUserData();
  }, [propUserId, username]);

  const refreshProducts = useCallback(async () => {
    if (!userId) return;
    const products = await loadUserProducts(userId);
    setUserProducts(products);
  }, [userId]);

  return {
    activeTab,
    setActiveTab,
    userData,
    userPosts,
    userReposts,
    userProducts,
    description,
    setDescription,
    userId,
    commission,
    loading,
    refreshProducts,
  };
}

// --- Hook de login ---
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

// --- Hook de registro ---
export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const register = async (email, password, confirmPassword) => {
    if (!email || !password || !confirmPassword) {
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
