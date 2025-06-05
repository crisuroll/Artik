import { View, StyleSheet, Pressable, Alert } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Link } from 'expo-router';

function NavBarMobile() {
    return(
        <View style={styles.navbar}>
            <Pressable 
                style={styles.iconContainer}
            >
                <Link href="/home">
                <Svg width={28} height={28} viewBox="0 0 24 24">
                    <Path
                        d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z"
                        stroke="#70c0b7"
                        strokeWidth="1.5"
                        fill="none"
                    />
                </Svg>
                </Link>
            </Pressable>
            <Pressable 
                style={styles.iconContainer}
            >
                <Link href="/search">
                <Svg width={28} height={28} viewBox="0 0 24 24">
                    <Path
                        d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 10-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1114 9.5 4.5 4.5 0 019.5 14z"
                        stroke="#70c0b7"
                        strokeWidth="1.5"
                        fill="none"
                    />
                </Svg>
                </Link>
            </Pressable>
            <Pressable 
                style={styles.iconContainer}
            >
                <Link href="/challenges">
                <Svg width={28} height={28} viewBox="0 0 24 24">
                    <Path
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                        stroke="#70c0b7"
                        strokeWidth="1.5"
                        fill="none"
                    />
                </Svg>
                </Link>
            </Pressable>
            <Pressable 
                style={styles.iconContainer}
            >
                <Link href="/gallery">
                <Svg width={28} height={28} viewBox="0 0 24 24">
                    <Path
                        d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"
                        stroke="#70c0b7"
                        strokeWidth="1.5"
                        fill="none"
                    />
                </Svg>
                </Link>
            </Pressable>
            <Pressable 
                style={styles.iconContainer}
            >
                <Link href="/dm">
                <Svg width={28} height={28} viewBox="0 0 24 24">
                    <Path
                        d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                        stroke="#70c0b7"
                        strokeWidth="1.5"
                        fill="none"
                    />
                </Svg>
                </Link>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    navbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        '@media (min-width: 768px)': {
            display: 'none',
        },
    },
    iconContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: '#ebfdfb'
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 30,
      color: '#70c0b7',
      fontFamily: 'Nunito',
    },
    input: {
      height: 50,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 16,
      paddingHorizontal: 15,
      marginBottom: 15,
      backgroundColor: '#fff',
      color: '#333',
      fontFamily: 'Nunito',
    },
    button: {
      height: 45,
      width: 120,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'Nunito',
    },
    link: {
      color: '#5ea8a0'
    }
  });

export default NavBarMobile;