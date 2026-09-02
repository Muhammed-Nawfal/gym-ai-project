import { Calendar, Plus, Target, TrendingUp, Zap } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import client from "../../api/client";
import QuickActionItem from "../../components/QuickActionItem";
import StatsCard from "../../components/StatsCard";
import { useAuth } from "../../context/AuthContext";
import { appColors, goldAlpha } from "../../constants/appColors";

const goalLabels: Record<string, string> = {
  CUTTING: "Cutting",
  BULKING: "Bulking (Muscle Gain)",
  BODY_RECOMPOSITION: "Body Recomposition",
};

export default function Home() {
  // AuthContext already fetches the current user on login (see
  // AuthContext.tsx's /api/users/me effect), so unlike the web version we
  // reuse that instead of fetching the same profile again here.
  const { token, user } = useAuth();
  const [totalWorkouts, setTotalWorkouts] = useState<number>(0);

  useEffect(() => {
    if (!user?.id) return;

    client
      .get(`/api/workout-entry/count/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setTotalWorkouts(res.data))
      .catch((err) => console.error("Failed to fetch the count:", err));
  }, [user?.id]);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
      <View>
        <Text style={styles.h1}>
          Welcome back, {user?.firstName} {user?.lastName}!
        </Text>
        <Text style={styles.muted}>Ready to crush your fitness goals?</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatsCard
          title="Total Workouts"
          value={<Text style={styles.gold}>{totalWorkouts}</Text>}
          icon={<Zap color={appColors.gold} size={26} />}
        />
        <StatsCard
          title="This Week"
          value={<Text style={styles.gold}>0</Text>}
          icon={<Calendar color={appColors.gold} size={26} />}
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
          icon={<Target color={appColors.gold} size={26} />}
        />
        <StatsCard
          title="Streak"
          value={<Text style={styles.gold}>7 days</Text>}
          icon={<TrendingUp color={appColors.gold} size={26} />}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>Recent Workouts</Text>
        <View style={styles.emptyState}>
          <View style={styles.plusCircle}>
            <Plus color={appColors.muted} size={28} />
          </View>
          <Text style={styles.emptyTitle}>Add a workout</Text>
          <Text style={styles.muted}>Start your fitness journey!</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>Quick Actions</Text>
        <View style={{ gap: 10, marginTop: 8 }}>
          <QuickActionItem title="Start New Workout" description="Begin logging your exercises" />
          <QuickActionItem title="View Progress" description="Check your fitness journey" />
          <QuickActionItem title="Update Profile" description="Edit your fitness goals" />
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
});
