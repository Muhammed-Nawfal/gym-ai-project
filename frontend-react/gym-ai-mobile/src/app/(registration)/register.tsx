import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import client from "../../api/client";
import TextField from "../../components/TextField";
import { useRegistration } from "../../context/RegistrationContext";
import { appColors, goldAlpha } from "../../constants/appColors";

export default function Register() {
  const router = useRouter();
  const { updateRegistrationData } = useRegistration();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError("");

    const { firstName, lastName, userName, email, password, confirm } = formData;

    if (!firstName || !lastName || !userName || !email || !password || !confirm) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    try {
      setLoading(true);

      const availabilityResponse = await client.get("/api/auth/check-availability", {
        params: { email, userName },
      });

      const { emailAvailable, usernameAvailable } = availabilityResponse.data;

      if (!emailAvailable && !usernameAvailable) {
        setError("Email and username are already taken. Please use different ones.");
        return;
      }

      if (!emailAvailable) {
        setError("This email is already registered. Please log in or use a different email.");
        return;
      }

      if (!usernameAvailable) {
        setError("This username is already taken. Please choose a different one.");
        return;
      }

      updateRegistrationData({ firstName, lastName, userName, email, password });

      router.push("/onboarding");
    } catch (err: any) {
      setError(err.response?.data?.message || "Unable to verify availability. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Gym AI</Text>
        <Text style={styles.subtitle}>Create your account</Text>

        <View style={styles.row}>
          <View style={styles.half}>
            <TextField
              placeholder="First Name"
              value={formData.firstName}
              onChange={(v) => handleChange("firstName", v)}
              editable
            />
          </View>
          <View style={styles.half}>
            <TextField
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(v) => handleChange("lastName", v)}
              editable
            />
          </View>
        </View>

        <TextField
          placeholder="Username"
          value={formData.userName}
          onChange={(v) => handleChange("userName", v)}
          editable
        />
        <TextField
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={(v) => handleChange("email", v)}
          editable
        />
        <TextField
          placeholder="Password"
          type="password"
          value={formData.password}
          onChange={(v) => handleChange("password", v)}
          editable
        />
        <TextField
          placeholder="Confirm Password"
          type="password"
          value={formData.confirm}
          onChange={(v) => handleChange("confirm", v)}
          editable
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Checking..." : "Continue to Profile Setup"}
          </Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.link}>
            Already have an account? <Text style={styles.linkAccent}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appColors.black,
  },
  container: {
    flexGrow: 1,
    backgroundColor: appColors.black,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: appColors.cardBg,
    borderWidth: 1,
    borderColor: goldAlpha(0.1),
    borderRadius: 12,
    padding: 32,
    gap: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: appColors.white,
  },
  subtitle: {
    color: appColors.muted,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  half: {
    flex: 1,
  },
  button: {
    width: "100%",
    backgroundColor: appColors.gold,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: appColors.black,
    fontWeight: "600",
  },
  error: {
    color: appColors.danger,
  },
  link: {
    color: appColors.muted,
    marginTop: 12,
    fontSize: 13,
  },
  linkAccent: {
    color: appColors.gold,
  },
});
