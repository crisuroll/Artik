import { Slot } from 'expo-router';
import { AuthProvider } from './auth-context';

export default function App() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}