import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { appColors, goldAlpha } from "../constants/appColors";

export default function Login() {
  const router = useRouter();
  const { setToken } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    try {
      const response = await client.post("/api/auth/login", {
        email,
        password,
      });

      await setToken(response.data.token);
      router.replace("/");
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setError("Invalid email or password");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Gym AI</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={appColors.mutedDark}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={appColors.mutedDark}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.link}>
            Don't have an account? <Text style={styles.linkAccent}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.black,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: appColors.cardBg,
    borderWidth: 1,
    borderColor: goldAlpha(0.1),
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: appColors.white,
    marginBottom: 4,
  },
  subtitle: {
    color: appColors.muted,
    marginBottom: 24,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: goldAlpha(0.1),
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: appColors.white,
    marginBottom: 12,
  },
  button: {
    width: "100%",
    backgroundColor: appColors.gold,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: appColors.black,
    fontWeight: "600",
  },
  error: {
    color: appColors.danger,
    marginTop: 12,
  },
  link: {
    color: appColors.muted,
    marginTop: 24,
    fontSize: 13,
  },
  linkAccent: {
    color: appColors.gold,
  },
});
