import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, usePathname } from "expo-router";
import { getSessionUser, getUserAvatar, getCurrentSession } from "../services/sessionService";


export function useSessionCheck() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getCurrentSession();
        if (!session) {
          router.push('/login');
        } else {
          await AsyncStorage.setItem('user', JSON.stringify(session.user));
          router.push('/home');
        }
      } catch (e) {
        console.error('Error trying to verify session:', e);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, [router]);

  return { loading };
}

export function useAuthLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      const user = await getSessionUser();

      if (user) {
        if (pathname === "/login" || pathname === "/register") {
          router.push("/home");
        }
        const avatar = await getUserAvatar(user.id);
        setAvatarUrl(avatar);
      } else if (
        pathname !== "/login" &&
        pathname !== "/register" &&
        pathname !== "/confirm_email"
      ) {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error verificando autenticación:", error);
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { loading, avatarUrl };
}