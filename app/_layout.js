import { Slot, usePathname } from "expo-router";
import { useWindowDimensions, View, ActivityIndicator, StyleSheet } from "react-native";
import { useState } from "react";
import NavBarMobile from '../components/Navbar-Mobile';
import HeaderProfile from "../components/HeaderProfile";
import BarMenu from "../components/BarMenu";
import DesktopSidebar from '../components/DesktopSidebar';
import { useAuthLayout } from "../hooks/useSession";

export default function Layout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const toggleMenu = () => setIsMenuVisible(!isMenuVisible);

  const { loading, avatarUrl } = useAuthLayout();

  const pathname = usePathname();
  const isAuthScreen = pathname === "/login" || pathname === "/register" || pathname === "/confirm_email";
  const isRequestCommission = pathname === "/request-commission";
  const isEditScreen = pathname.startsWith("/edit_commission") || pathname.startsWith("/edit_profile");
  const main = pathname === "/home" || pathname === "/search" || pathname === "/challenges" || pathname === "/gallery" || pathname === "/loaded_challenge" || pathname === "/dm";
  const isDmChat = pathname.startsWith("/dm/");

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2f4f75" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f6fffe", flexDirection: isDesktop ? 'row' : 'column' }}>
      {!isAuthScreen && isDesktop && (
        <View style={styles.desktopSidebar}>
          <DesktopSidebar />
        </View>
      )}

      <View style={{ flex: 1 }}>
        {/* Solo muestra HeaderProfile si no es un chat DM ni /request-commission */}
        {main && !isDesktop && !isEditScreen && !isDmChat && !isRequestCommission && (
          <HeaderProfile toggleMenu={toggleMenu} avatarUrl={avatarUrl} />
        )}
        <Slot />
        {/* Solo muestra NavBarMobile si no es un chat DM ni /request-commission */}
        {!isAuthScreen && !isEditScreen && !isDesktop && !isDmChat && !isRequestCommission && (
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
