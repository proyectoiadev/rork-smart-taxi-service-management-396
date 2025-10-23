import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View, useColorScheme, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotFoundScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <>
      <Stack.Screen options={{ title: "Página no encontrada" }} />
      <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.content}>
          {/* Ícono visual para mejor UX */}
          <Text style={styles.icon}>🚕</Text>
          
          <Text style={[styles.title, isDark && styles.titleDark]}>
            Esta página no existe
          </Text>
          
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            La página que buscas no se encuentra disponible
          </Text>

          <Link 
            href="/" 
            style={[styles.button, isDark && styles.buttonDark]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Volver a la página de inicio"
          >
            <Text style={styles.buttonText}>Volver al inicio</Text>
          </Link>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  containerDark: {
    backgroundColor: "#1F2937",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
    textAlign: "center",
    marginBottom: 12,
  },
  titleDark: {
    color: "#F9FAFB",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  subtitleDark: {
    color: "#9CA3AF",
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonDark: {
    backgroundColor: "#059669",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});