import { AlertTriangle, Award, Calendar, Dumbbell, Plus, Target, TrendingUp, Zap } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import client from "../../api/client";
import StatsCard from "../../components/StatsCard";
import { useAuth } from "../../context/AuthContext";
import { appColors, goldAlpha } from "../../constants/appColors";
import { CoachInsightDto, PersonalRecordDto, WorkoutHistoryDto } from "@/api/types";
import { useRouter } from "expo-router";
import LoadingScreen from "../../components/LoadingScreen";

const goalLabels: Record<string, string> = {
  CUTTING: "Cutting",
  BULKING: "Bulking (Muscle Gain)",
  BODY_RECOMPOSITION: "Body Recomposition",
};

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const STREAK_DAYS_PER_WEEK = 3;

function daysWorkedOutByWeek(completedAtDates: string[]): Map<string, Set<string>> {
  const byWeek = new Map<string, Set<string>>();
  for (const iso of completedAtDates) {
    const date = new Date(iso);
    const weekKey = toDateKey(startOfWeek(date));
    const dayKey = toDateKey(date);
    if (!byWeek.has(weekKey)) byWeek.set(weekKey, new Set());
    byWeek.get(weekKey)!.add(dayKey);
  }
  return byWeek;
}

// A week counts toward the streak once the user has hit STREAK_DAYS_PER_WEEK
// distinct workout days in it. The current (in-progress) week never breaks
// the streak just for not having hit the threshold yet - only a fully past
// week that fell short does.
function computeWeeklyStreak(completedAtDates: string[]): number {
  const byWeek = daysWorkedOutByWeek(completedAtDates);
  const cursor = startOfWeek(new Date());

  let streak = 0;
  if ((byWeek.get(toDateKey(cursor))?.size ?? 0) >= STREAK_DAYS_PER_WEEK) {
    streak++;
  }
  cursor.setDate(cursor.getDate() - 7);
  while ((byWeek.get(toDateKey(cursor))?.size ?? 0) >= STREAK_DAYS_PER_WEEK) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

function formatRelativeDate(isoString: string): string {
  const target = new Date(isoString);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - target.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(isoString).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Home() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [totalWorkouts, setTotalWorkouts] = useState<number>(0);
  const [insights, setInsights] = useState<CoachInsightDto[]>([]);
  const [history, setHistory] = useState<WorkoutHistoryDto[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecordDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    Promise.allSettled([
      client
        .get(`/api/workout-entry/count/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setTotalWorkouts(res.data))
        .catch((err) => console.error("Failed to fetch the count:", err)),

      client
        .get<CoachInsightDto[]>("/api/insights", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setInsights(res.data))
        .catch((err) => console.error("Failed to fetch insights", err)),

      client
        .get<WorkoutHistoryDto[]>(`/api/workout-sessions/user/${user.id}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setHistory(res.data))
        .catch((err) => console.error("Failed to fetch workout history", err)),

      client
        .get<PersonalRecordDto[]>(`/api/personal-records/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setPersonalRecords(res.data))
        .catch((err) => console.error("Failed to fetch personal records", err)),
    ]).finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return <LoadingScreen />;
  }

  const weekStart = startOfWeek(new Date());
  const thisWeekCount = history.filter((h) => new Date(h.completedAt) >= weekStart).length;
  const streak = computeWeeklyStreak(history.map((h) => h.completedAt));
  const daysThisWeek =
    daysWorkedOutByWeek(history.map((h) => h.completedAt)).get(toDateKey(weekStart))?.size ?? 0;
  const recentWorkouts = history.slice(0, 3);
  const recentPRs = [...personalRecords]
    .sort((a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime())
    .slice(0, 3);

  const askCoachAboutInsight = (insight: CoachInsightDto) => {
    router.push({
      pathname: "/coach",
      params: {
        insightId: String(insight.id),
        insightExerciseName: insight.exerciseName ?? "",
        insightMessage: insight.message,
        insightNonce: String(Date.now()),
      },
    });
  };

  const dismissInsight = (insight: CoachInsightDto) => {
    Alert.alert(
      "Dismiss this insight?",
      "You won't get this alert again once dismissed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Dismiss",
          style: "destructive",
          onPress: async () => {
            try {
              await client.patch(`/api/insights/${insight.id}/resolve`, {}, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setInsights((prev) => prev.filter((i) => i.id !== insight.id));
            } catch (err) {
              console.error("Failed to dismiss insight:", err);
            }
          },
        },
      ]
    );
  };

  return (
      <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
        <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <Image
            source={require("../../../assets/images/jackzilla-icon.jpg")}
            style={styles.brandIcon}
            resizeMode="contain"
          />
          <Image
            source={require("../../../assets/images/jackzilla-wordmark.png")}
            style={styles.brandWordmark}
            resizeMode="contain"
          />
        </View>

        <View style={styles.statsGrid}>
          <StatsCard
            title="Total Workouts"
            value={<Text style={styles.gold}>{totalWorkouts}</Text>}
            icon={<Zap color={appColors.gold} size={18} />}
          />
          <StatsCard
            title="This Week"
            value={<Text style={styles.gold}>{thisWeekCount}</Text>}
            icon={<Calendar color={appColors.gold} size={18} />}
          />
        </View>
        <View style={styles.statsGrid}>
          <StatsCard
            title="Current Goal"
            value={
              <Text style={styles.gold}>
                {(user?.userGoal && goalLabels[user.userGoal]) || user?.userGoal || "-"}
              </Text>
            }
            icon={<Target color={appColors.gold} size={18} />}
          />
          <StatsCard
            title="Streak"
            value={<Text style={styles.gold}>{streak} {streak === 1 ? "week" : "weeks"}</Text>}
            caption={`${Math.min(daysThisWeek, STREAK_DAYS_PER_WEEK)}/${STREAK_DAYS_PER_WEEK} days this week`}
            icon={<TrendingUp color={appColors.gold} size={18} />}
          />
        </View>

        {insights.map((insight) => (
          <View key={insight.id} style={styles.insightRow}>
            <AlertTriangle color={appColors.gold} size={18} />
            <View style={{ flex: 1 }}>
              {insight.exerciseName && (
                <Text style={styles.insightExercise}>{insight.exerciseName}</Text>
              )}
              <Text style={styles.insightMessage}>{insight.message}</Text>
              <View style={styles.insightActions}>
                <TouchableOpacity onPress={() => askCoachAboutInsight(insight)}>
                  <Text style={styles.insightActionGold}>Ask Coach</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => dismissInsight(insight)}>
                  <Text style={styles.insightActionMuted}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            {recentWorkouts.length > 0 && (
              <TouchableOpacity onPress={() => router.push("/workout")}>
                <Text style={styles.sectionLink}>View all</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.card}>
            {recentWorkouts.length > 0 ? (
              recentWorkouts.map((entry, index) => (
                <View key={entry.workoutEntryId}>
                  <View style={styles.listRow}>
                    <View style={styles.listIconBadge}>
                      <Dumbbell color={appColors.gold} size={16} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recentWorkoutName}>{entry.workoutName}</Text>
                      <Text style={styles.muted}>{formatRelativeDate(entry.completedAt)}</Text>
                    </View>
                    <Text style={styles.listMetaMuted}>{entry.totalSets} sets</Text>
                  </View>
                  {index < recentWorkouts.length - 1 && <View style={styles.listDivider} />}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.plusCircle}>
                  <Plus color={appColors.muted} size={28} />
                </View>
                <Text style={styles.emptyTitle}>Add a workout</Text>
                <Text style={styles.muted}>Start your fitness journey!</Text>
              </View>
            )}
          </View>
        </View>

        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent PRs</Text>
            {recentPRs.length > 0 && (
              <TouchableOpacity onPress={() => router.push("/personal-records")}>
                <Text style={styles.sectionLink}>View all</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.card}>
            {recentPRs.length > 0 ? (
              recentPRs.map((pr, index) => (
                <View key={pr.exerciseId}>
                  <View style={styles.listRow}>
                    <View style={styles.listIconBadge}>
                      <Zap color={appColors.gold} size={16} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recentWorkoutName}>{pr.exerciseName}</Text>
                      <Text style={styles.muted}>{formatRelativeDate(pr.achievedAt)}</Text>
                    </View>
                    <Text style={styles.recentWorkoutMeta}>
                      {pr.weight}kg x {pr.reps}
                    </Text>
                  </View>
                  {index < recentPRs.length - 1 && <View style={styles.listDivider} />}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.plusCircle}>
                  <Award color={appColors.muted} size={28} />
                </View>
                <Text style={styles.emptyTitle}>No PRs yet</Text>
                <Text style={styles.muted}>Log a heavy set to set your first record!</Text>
              </View>
            )}
          </View>
        </View>
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
    padding: 20,
    gap: 16,
  },
  h1: {
    color: appColors.white,
    fontSize: 22,
    fontWeight: "600",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  brandWordmark: {
    width: 130,
    height: 52,
  },
  h2: {
    color: appColors.gold,
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 8,
  },
  muted: {
    color: appColors.muted,
  },
  gold: {
    color: appColors.gold,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  card: {
    backgroundColor: appColors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: goldAlpha(0.1),
    padding: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 6,
  },
  plusCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#3f3f46",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    color: appColors.ink,
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    color: appColors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  sectionLink: {
    color: appColors.gold,
    fontSize: 13,
    fontWeight: "500",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  listIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: goldAlpha(0.15),
    alignItems: "center",
    justifyContent: "center",
  },
  listDivider: {
    height: 1,
    backgroundColor: goldAlpha(0.08),
  },
  listMetaMuted: {
    color: appColors.muted,
    fontSize: 12.5,
  },
  recentWorkoutName: {
    color: appColors.ink,
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 2,
  },
  recentWorkoutMeta: {
    color: appColors.gold,
    fontWeight: "600",
    fontSize: 13,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderColor: goldAlpha(0.15),
    borderRadius: 10,
    padding: 12,
  },
  insightExercise: {
    color: appColors.ink,
    fontWeight: "600",
    marginBottom: 2,
  },
  insightMessage: {
    color: appColors.muted,
    fontSize: 13,
  },

  insightActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  insightActionGold: {
    color: appColors.gold,
    fontSize: 12.5,
    fontWeight: "600",
  },
  insightActionMuted: {
    color: appColors.mutedDark,
    fontSize: 12.5,
  },
});
