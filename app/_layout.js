import { Slot, useRouter, usePathname } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import NavBarMobile from '../components/Navbar-Mobile';
import HeaderProfile from "../components/HeaderProfile";
import BarMenu from "../components/BarMenu";

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const toggleMenu = () => setIsMenuVisible(!isMenuVisible);

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
    <View style={{ flex: 1, backgroundColor: "#f6fffe" }}>
      {!isAuthScreen && <HeaderProfile toggleMenu={toggleMenu} />}
      <Slot />
      {!isAuthScreen && (
        <View>
          <NavBarMobile />
        </View>
      )}
      {isMenuVisible && <BarMenu onClose={toggleMenu} />}
    </View>
  );
}