import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  fetchUserProfile,
  updateUserProfile,
  loadUser,
  loadUserPosts,
  loadUserReposts,
  loadUserProducts,
  loadUserCommission,
} from '../services/usersService';
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

export function useEditProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        setLoading(false);
        return;
      }
      const id = authData.user.id;
      setUserId(id);
      try {
        const userData = await fetchUserProfile(id);
        setUsername(userData.username);
        setEmail(userData.email);
        setAvatarUrl(userData.avatar_url || '');
        setBio(userData.bio || '');
      } catch (e) {
        // Manejo de error opcional
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleSave = useCallback(async () => {
    if (!username || !email) return;
    setSaving(true);
    try {
      await updateUserProfile({
        userId,
        username,
        email,
        avatarUrl,
        bio,
      });
      router.replace(`/${username}`);
    } catch (e) {
      // Manejo de error opcional
    }
    setSaving(false);
  }, [userId, username, email, avatarUrl, bio, router]);

  return {
    loading,
    saving,
    userId,
    username, setUsername,
    email, setEmail,
    avatarUrl, setAvatarUrl,
    bio, setBio,
    uploading, setUploading,
    handleSave,
  };
}

export function useMyUser(profileUserId) {
  const [activeTab, setActiveTab] = useState('Posts');
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userReposts, setUserReposts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [description, setDescription] = useState('');
  const [userId, setUserId] = useState(null);
  const [commission, setCommission] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await loadUser();
        if (user) {
          setUserData(user);
          setUserId(user.userId);
          setDescription(user.bio || '');

          const posts = await loadUserPosts(user.userId);
          setUserPosts(posts);

          const reposts = await loadUserReposts(user.userId);
          setUserReposts(reposts);

          const products = await loadUserProducts(user.userId);
          setUserProducts(products);

          const commissionData = await loadUserCommission(user.userId);
          setCommission(commissionData);
        }
      } catch (error) {
        // Manejo de error opcional
      }
    };
    fetchUserData();
  }, []);

  // Refresca productos al volver al foco
  const refreshProducts = useCallback(async () => {
    if (!userId) return;
    const products = await loadUserProducts(userId);
    setUserProducts(products);
  }, [userId]);

  return {
    activeTab, setActiveTab,
    userData,
    userPosts,
    userReposts,
    userProducts,
    description, setDescription,
    userId,
    commission,
    refreshProducts,
  };
}

export function usePublicUser(username) {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [userReposts, setUserReposts] = useState([]);
  const [description, setDescription] = useState('');
  const [commission, setCommission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username)
          .single();

        if (user) {
          setUserData(user);
          setDescription(user.bio || '');

          const posts = await loadUserPosts(user.id);
          setUserPosts(posts);

          const products = await loadUserProducts(user.id);
          setUserProducts(products);

          const reposts = await loadUserReposts(user.id);
          setUserReposts(reposts);

          const commissionData = await loadUserCommission(user.id);
          setCommission(commissionData);
        }
      } catch (error) {
        // Manejo de error opcional
      }
      setLoading(false);
    };

    fetchUserData();
  }, [username]);

  return {
    userData,
    userPosts,
    userProducts,
    userReposts,
    description,
    commission,
    loading,
  };
}
