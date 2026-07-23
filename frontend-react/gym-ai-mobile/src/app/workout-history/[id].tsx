import { ChevronLeft, Dumbbell, Trash2 } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import client from "../../api/client";
import type { StartWorkoutResponse } from "../../api/types";
import { useAuth } from "../../context/AuthContext";
import { appColors, dangerAlpha, goldAlpha, whiteAlpha } from "../../constants/appColors";

const formatDuration = (ms: number) => {
  const totalMinutes = Math.max(1, Math.round(ms / 60000));
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
};

const formatVolume = (kg: number) => {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
  return `${Math.round(kg)}kg`;
};

export default function WorkoutHistoryDetailScreen() {
  const { id, completedAt } = useLocalSearchParams<{ id: string; completedAt?: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [session, setSession] = useState<StartWorkoutResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    client
      .get<StartWorkoutResponse>(`/api/workout-sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSession(res.data))
      .catch((err) => console.error("Error fetching workout history detail:", err))
      .finally(() => setLoading(false));
  }, [id, token]);

  const stats = useMemo(() => {
    if (!session) return null;

    let totalVolume = 0;
    let prCount = 0;

    for (const ex of session.exercises) {
      const previousMaxWeight = ex.previousSets.reduce(
        (max, s) => (s.weight != null && s.weight > max ? s.weight : max),
        0
      );

      let exerciseHasPr = false;
      for (const set of ex.currentSets) {
        if (set.completed && set.weight != null && set.reps != null) {
          totalVolume += set.weight * set.reps;
          if (previousMaxWeight > 0 && set.weight > previousMaxWeight) {
            exerciseHasPr = true;
          }
        }
      }
      if (exerciseHasPr) prCount++;
    }

    const duration =
      completedAt && session.startedAt
        ? formatDuration(new Date(completedAt).getTime() - new Date(session.startedAt).getTime())
        : "—";

    return { duration, volume: formatVolume(totalVolume), prCount };
  }, [session, completedAt]);

  const deleteEntry = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await client.delete(`/api/workout-sessions/${id}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.back();
    } catch (err) {
      console.error("Error deleting workout history entry:", err);
      Alert.alert("Couldn't delete", "Something went wrong deleting this workout. Try again.");
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete this workout?",
      "This permanently removes it from your history. This can't be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: deleteEntry },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft color={whiteAlpha(0.8)} size={18} />
          </TouchableOpacity>
          <Text style={styles.workoutName} numberOfLines={1}>
            {session?.workoutName ?? "Workout"}
          </Text>
          <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete} disabled={deleting}>
            {deleting ? (
              <ActivityIndicator color={appColors.danger} size="small" />
            ) : (
              <Trash2 color={appColors.danger} size={18} />
            )}
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={appColors.gold} style={{ marginTop: 24 }} />
        ) : (
          <>
            {stats && (
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.duration}</Text>
                  <Text style={styles.statLabel}>duration</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.volume}</Text>
                  <Text style={styles.statLabel}>volume</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, styles.statValueAccent]}>{stats.prCount}</Text>
                  <Text style={styles.statLabel}>PR</Text>
                </View>
              </View>
            )}

            <View style={{ gap: 14, marginTop: 20 }}>
              {(session?.exercises || []).map((ex) => (
                <View key={ex.workoutEntryExerciseId} style={styles.exerciseCard}>
                  <View style={styles.exerciseHeader}>
                    <View style={styles.exerciseIcon}>
                      <Dumbbell color={appColors.gold} size={16} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
                      <Text style={styles.exerciseSubtitle}>
                        {ex.currentSets.length} {ex.currentSets.length === 1 ? "set" : "sets"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.setList}>
                    {ex.currentSets.map((set) => (
                      <View key={set.id} style={styles.setRow}>
                        <View style={styles.setBadge}>
                          <Text style={styles.setBadgeText}>{set.setIndex}</Text>
                        </View>
                        <Text style={styles.setText}>
                          <Text style={styles.setValue}>{set.weight ?? 0}</Text> kg{"  ×  "}
                          <Text style={styles.setValue}>{set.reps ?? 0}</Text> reps
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appColors.black,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: whiteAlpha(0.1),
    alignItems: "center",
    justifyContent: "center",
  },
  workoutName: {
    color: appColors.gold,
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: dangerAlpha(0.3),
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: appColors.cardBg,
    borderWidth: 1,
    borderColor: goldAlpha(0.1),
    borderRadius: 14,
    marginTop: 18,
    paddingVertical: 16,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: whiteAlpha(0.08),
  },
  statValue: {
    color: appColors.white,
    fontSize: 19,
    fontWeight: "700",
  },
  statValueAccent: {
    color: appColors.gold,
  },
  statLabel: {
    color: appColors.mutedDark,
    fontSize: 12,
  },
  exerciseCard: {
    backgroundColor: appColors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: goldAlpha(0.1),
    padding: 16,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  exerciseIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: goldAlpha(0.1),
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseName: {
    color: appColors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  exerciseSubtitle: {
    color: appColors.mutedDark,
    fontSize: 12,
    marginTop: 2,
  },
  setList: {
    gap: 8,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: whiteAlpha(0.03),
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  setBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: goldAlpha(0.12),
    alignItems: "center",
    justifyContent: "center",
  },
  setBadgeText: {
    color: appColors.gold,
    fontSize: 12,
    fontWeight: "700",
  },
  setText: {
    color: appColors.mutedDark,
    fontSize: 13,
  },
  setValue: {
    color: appColors.ink,
    fontSize: 14,
    fontWeight: "600",
  },
});
