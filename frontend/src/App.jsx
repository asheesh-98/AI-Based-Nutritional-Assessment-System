import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import AppRouter from './routes/AppRouter';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppRouter />
        <PWAInstallPrompt />
      </AuthProvider>
    </LanguageProvider>
  );
}
