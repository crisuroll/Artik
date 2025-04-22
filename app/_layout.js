import { Slot, useRouter, usePathname } from "expo-router";
import { View, ActivityIndicator, StyleSheet, useWindowDimensions } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import NavBarMobile from '../components/Navbar-Mobile';
import HeaderProfile from "../components/HeaderProfile";
import BarMenu from "../components/BarMenu";
import DesktopSidebar from '../components/DesktopSidebar';

export default function Layout() {

  const router = useRouter();
  const pathname = usePathname();
  const toggleMenu = () => setIsMenuVisible(!isMenuVisible);
  const defaultAvatar = "https://ovbhqtvacxgkarasaakr.supabase.co/storage/v1/object/public/avatar//default.png";
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [loading, setLoading] = useState(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        const user = data?.session?.user;

        if (user) {
          if (pathname === "/login" || pathname === "/register") {
            router.push("/home");
          }
          console.log(user.id);
          const { data: perfil } = await supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", user.id)
            .single();
  
          if (perfil && perfil.avatar_url) {
            setAvatarUrl(perfil.avatar_url);
          } else {
            setAvatarUrl(defaultAvatar);
          }
            
        } else if (!user && pathname !== "/login" && pathname !== "/register") {
          router.push("/login");
        }

      } catch (error) {
        console.error("Error verificando autenticación:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2f4f75" />
      </View>
    );
  }

  const isAuthScreen = pathname === "/login" || pathname === "/register";
  const main = pathname === "/home" || pathname === "/challenges" || pathname === "/gallery";

  return (
    <View style={{ flex: 1, backgroundColor: "#f6fffe", flexDirection: isDesktop ? 'row' : 'column' }}>
      {isDesktop && (
        <View style={styles.desktopSidebar}>
          <DesktopSidebar />
        </View>
      )}

      <View style={{ flex: 1 }}>
        {main && !isDesktop && <HeaderProfile toggleMenu={toggleMenu} avatarUrl={avatarUrl} />}
        <Slot />
        {!isAuthScreen && !isDesktop && (
          <View>
            <NavBarMobile />
          </View>
        )}
        {isMenuVisible && <BarMenu onClose={toggleMenu} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopSidebar: {
    width: 250,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    paddingTop: 30,
  },
});
