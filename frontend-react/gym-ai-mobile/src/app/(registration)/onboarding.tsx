import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Dumbbell } from "lucide-react-native";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import client from "../../api/client";
import DropDownTextField from "../../components/DropDownTextField";
import TextField from "../../components/TextField";
import { useAuth } from "../../context/AuthContext";
import { useRegistration } from "../../context/RegistrationContext";
import { Goal } from "../../types/Goal";
import { SkillLevel } from "../../types/SkillLevel";
import { appColors, goldAlpha } from "../../constants/appColors";

export default function OnBoarding() {
  const router = useRouter();
  const { registrationData, clearRegistrationData } = useRegistration();
  const { setToken } = useAuth();

  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    goalWeight: "",
    userGoal: "",
    skillLevel: "",
    dob: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // On web this held a File object read via FileReader. RN's image picker
  // instead hands back a local file URI directly (a path the OS lets you
  // read from), which is what we need both to preview it (Image can render
  // a URI directly, no base64 conversion needed) and to attach it to the
  // multipart upload later.
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Permission to access photos is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (
      !formData.height ||
      !formData.weight ||
      !formData.goalWeight ||
      !formData.userGoal ||
      !formData.skillLevel ||
      !formData.dob
    ) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);

      const completeRegistrationData = {
        ...registrationData,
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        goalWeight: parseInt(formData.goalWeight),
        userGoal: formData.userGoal,
        skillLevel: formData.skillLevel,
        dob: formData.dob,
      };

      const registerResponse = await client.post("/api/auth/register", completeRegistrationData);

      const { token } = registerResponse.data;
      await setToken(token);

      if (imageUri) {
        const uploadData = new FormData();
        // React Native's fetch/FormData expects file parts as
        // { uri, name, type } instead of a real File/Blob object, since
        // there's no Blob-backed File API on-device the way a browser has.
        uploadData.append("file", {
          uri: imageUri,
          name: "profile-picture.jpg",
          type: "image/jpeg",
        } as any);

        await client.post("/api/users/me/profile-picture", uploadData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
      }

      clearRegistrationData();
      router.replace("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const goalOptions = [
    { value: Goal.CUTTING, label: "Cutting (Fat Loss)" },
    { value: Goal.BULKING, label: "Bulking (Muscle Gain)" },
    { value: Goal.BODY_RECOMPOSITION, label: "Body Recomposition" },
  ];

  const skillLevelOptions = [
    { value: SkillLevel.BEGINNER, label: "Beginner" },
    { value: SkillLevel.INTERMEDIATE_LIFTER, label: "Intermediate Lifter" },
    { value: SkillLevel.ADVANCED_LIFTER, label: "Advanced Lifter" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Dumbbell color={appColors.gold} size={40} style={{ alignSelf: "center" }} />
        <Text style={styles.title}>Your Gym Journey Starts Here</Text>
        <Text style={styles.subtitle}>
          Complete your profile to get personalized workout plans and track your progress
          effectively.
        </Text>

        <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.imagePickerText}>Upload Photo</Text>
          )}
        </TouchableOpacity>

        <TextField
          placeholder="Height (cm)"
          value={formData.height}
          onChange={(v) => handleChange("height", v)}
          editable
          type="number"
        />
        <TextField
          placeholder="Current Weight (kg)"
          value={formData.weight}
          onChange={(v) => handleChange("weight", v)}
          editable
          type="number"
        />
        <TextField
          placeholder="Date of Birth (YYYY-MM-DD)"
          value={formData.dob}
          onChange={(v) => handleChange("dob", v)}
          editable
        />
        <TextField
          placeholder="Your Goal Weight (kg)"
          value={formData.goalWeight}
          onChange={(v) => handleChange("goalWeight", v)}
          editable
          type="number"
        />

        <DropDownTextField
          placeholder="Select your fitness goal"
          value={formData.userGoal}
          onChange={(val) => handleChange("userGoal", val)}
          options={goalOptions}
          editable
        />
        <DropDownTextField
          placeholder="Select your skill level"
          value={formData.skillLevel}
          onChange={(val) => handleChange("skillLevel", val)}
          options={skillLevelOptions}
          editable
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating..." : "Create Your Profile"}
          </Text>
        </TouchableOpacity>

        {error ? <Text style={styles.error}>{error}</Text> : null}
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
    maxWidth: 480,
    backgroundColor: appColors.cardBg,
    borderWidth: 1,
    borderColor: goldAlpha(0.1),
    borderRadius: 12,
    padding: 28,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: appColors.gold,
    textAlign: "center",
  },
  subtitle: {
    color: appColors.muted,
    textAlign: "center",
    marginBottom: 8,
  },
  imagePicker: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: goldAlpha(0.3),
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 8,
    backgroundColor: "#18181b",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  imagePickerText: {
    color: appColors.muted,
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  button: {
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
    textAlign: "center",
  },
});
