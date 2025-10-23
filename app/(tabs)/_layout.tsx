import { Tabs } from 'expo-router';
import { Home, FileText, User, Settings } from 'lucide-react-native';
import { Platform, useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280',
        tabBarStyle: {
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#374151' : '#E5E7EB',
          // Altura dinámica según plataforma
          height: Platform.select({
            ios: 88, // Más alto para iOS (incluye safe area)
            android: 65,
            default: 73,
          }),
          paddingBottom: Platform.select({
            ios: 20, // Más padding para iOS con notch
            android: 8,
            default: 12,
          }),
          paddingTop: 8,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        // Animación suave al cambiar de tab
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Servicios',
          tabBarIcon: ({ color, size }) => (
            <Home size={size} color={color} strokeWidth={2} />
          ),
          tabBarAccessibilityLabel: 'Servicios activos',
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color, size }) => (
            <FileText size={size} color={color} strokeWidth={2} />
          ),
          tabBarAccessibilityLabel: 'Ver reportes',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={2} />
          ),
          tabBarAccessibilityLabel: 'Perfil de usuario',
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} strokeWidth={2} />
          ),
          tabBarAccessibilityLabel: 'Configuración de la aplicación',
        }}
      />
    </Tabs>
  );
}