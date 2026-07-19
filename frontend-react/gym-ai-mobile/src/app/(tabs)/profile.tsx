import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Calendar, Edit2, LogOut, Save, User as UserIcon, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import client from "../../api/client";
import DropDownTextField from "../../components/DropDownTextField";
import TextField from "../../components/TextField";
import { useAuth } from "../../context/AuthContext";
import { Goal } from "../../types/Goal";
import { SkillLevel } from "../../types/SkillLevel";

export default function Profile() {
  const router = useRouter();
  const { token, logout } = useAuth();

  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const fetchProfile = () => {
    client
      .get("/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setUser(res.data);
        setFormData(res.data);
      })
      .catch((err) => console.error("Failed to fetch profile:", err));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await client.put("/api/users/me", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setFormData(res.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUploadImage = async () => {
    if (!imageUri) return;

    const uploadData = new FormData();
    uploadData.append("file", {
      uri: imageUri,
      name: "profile-picture.jpg",
      type: "image/jpeg",
    } as any);

    try {
      await client.post("/api/users/me/profile-picture", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setImageUri(null);
      fetchProfile();
    } catch (err) {
      console.error("Failed to upload profile picture:", err);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
        <Text style={styles.muted}>Loading...</Text>
      </SafeAreaView>
    );
  }

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
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.h1}>Your Profile</Text>
          <Text style={styles.muted}>Manage your personal info and fitness goals</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color="#a1a1aa" size={16} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.avatarCard}>
        <TouchableOpacity style={styles.avatarWrap} onPress={handlePickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatarImage} />
          ) : user.profilePictureUrl ? (
            <Image source={{ uri: user.profilePictureUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarInitials}>
              <Text style={styles.avatarInitialsText}>
                {user.firstName?.charAt(0)}
                {user.lastName?.charAt(0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {imageUri && (
          <TouchableOpacity style={styles.uploadButton} onPress={handleUploadImage}>
            <Text style={styles.uploadButtonText}>Upload Photo</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.name}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.muted}>{user.userName}</Text>

        <View style={styles.skillBadge}>
          <Text style={styles.skillBadgeText}>{user.skillLevel}</Text>
        </View>

        <View style={styles.joinedRow}>
          <Calendar color="#a1a1aa" size={14} />
          <Text style={styles.muted}>
            Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoHeaderRow}>
          <View style={styles.infoHeaderTitle}>
            <UserIcon color="#d4af37" size={16} />
            <Text style={styles.infoHeaderText}>Personal Information</Text>
          </View>

          {!isEditing ? (
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Edit2 color="#000000" size={13} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity style={styles.editButton} onPress={handleSave}>
                <Save color="#000000" size={13} />
                <Text style={styles.editButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <X color="#ef4444" size={13} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ gap: 12 }}>
          <TextField
            label="First Name"
            value={formData.firstName ?? ""}
            editable={isEditing}
            onChange={(v) => handleChange("firstName", v)}
          />
          <TextField
            label="Last Name"
            value={formData.lastName ?? ""}
            editable={isEditing}
            onChange={(v) => handleChange("lastName", v)}
          />
          <TextField
            label="Username"
            value={formData.userName ?? ""}
            editable={isEditing}
            onChange={(v) => handleChange("userName", v)}
          />
          <TextField
            label="Email"
            value={formData.email ?? ""}
            editable={isEditing}
            type="email"
            onChange={(v) => handleChange("email", v)}
          />
          <TextField
            label="Date of Birth"
            value={formData.dob ?? ""}
            editable={isEditing}
            onChange={(v) => handleChange("dob", v)}
          />
          <TextField
            label="Height (cm)"
            value={String(formData.height ?? "")}
            editable={isEditing}
            type="number"
            onChange={(v) => handleChange("height", v)}
          />
          <TextField
            label="Current Weight (kg)"
            value={String(formData.weight ?? "")}
            editable={isEditing}
            type="number"
            onChange={(v) => handleChange("weight", v)}
          />
          <TextField
            label="Goal Weight (kg)"
            value={String(formData.goalWeight ?? "")}
            editable={isEditing}
            type="number"
            onChange={(v) => handleChange("goalWeight", v)}
          />
          <DropDownTextField
            label="Fitness Goal"
            value={formData.userGoal ?? ""}
            onChange={(v) => handleChange("userGoal", v)}
            editable={isEditing}
            options={goalOptions}
          />
          <DropDownTextField
            label="Skill Level"
            value={formData.skillLevel ?? ""}
            onChange={(v) => handleChange("skillLevel", v)}
            editable={isEditing}
            options={skillLevelOptions}
          />
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000000",
  },
  content: {
    padding: 20,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  h1: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "600",
  },
  muted: {
    color: "#a1a1aa",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logoutText: {
    color: "#a1a1aa",
    fontSize: 13,
  },
  avatarCard: {
    backgroundColor: "#0a0a0a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.1)",
    padding: 24,
    alignItems: "center",
  },
  avatarWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(212, 175, 55, 0.3)",
    marginBottom: 12,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212, 175, 55, 0.4)",
  },
  avatarInitialsText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  uploadButton: {
    backgroundColor: "#d4af37",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  uploadButtonText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "600",
  },
  name: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  skillBadge: {
    marginTop: 12,
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skillBadgeText: {
    color: "#d4af37",
    fontSize: 12,
    fontWeight: "600",
  },
  joinedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
  },
  infoCard: {
    backgroundColor: "#0a0a0a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.1)",
    padding: 20,
    gap: 16,
  },
  infoHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoHeaderTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoHeaderText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#d4af37",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editButtonText: {
    color: "#000000",
    fontWeight: "600",
    fontSize: 12,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#ef4444",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cancelButtonText: {
    color: "#ef4444",
    fontWeight: "600",
    fontSize: 12,
  },
});
