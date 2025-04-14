import { Slot, useRouter, usePathname } from "expo-router";
import { View, ActivityIndicator, StyleSheet, useWindowDimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import NavBarMobile from '../components/Navbar-Mobile';
import HeaderProfile from "../components/HeaderProfile";
import BarMenu from "../components/BarMenu";
import DesktopSidebar from '../components/DesktopSidebar';

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const toggleMenu = () => setIsMenuVisible(!isMenuVisible);

  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await AsyncStorage.getItem("user");
        if (user) {
          router.replace("/home");
        } else if (pathname !== "/") {
          router.replace("/");
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2f4f75" />
      </View>
    );
  }

  const isAuthScreen = pathname === "/login" || pathname === "/register";
  return (
    <View style={{ flex: 1, backgroundColor: "#f6fffe", flexDirection: isDesktop ? 'row' : 'column' }}>
      {isDesktop && (
        <View style={styles.desktopSidebar}>
          <DesktopSidebar />
        </View>
      )}

      <View style={{ flex: 1 }}>
        {!isAuthScreen && pathname !== "/search1" && !isDesktop && <HeaderProfile toggleMenu={toggleMenu} />}
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