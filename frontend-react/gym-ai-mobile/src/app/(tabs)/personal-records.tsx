import { ChevronLeft, ChevronRight, Dumbbell, Search, Trophy, TrendingUp } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import client from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import type { PersonalRecordDto, PersonalRecordHistoryDto, PersonalRecordStatsDto } from "../../api/types";
import { appColors, goldAlpha, whiteAlpha } from "../../constants/appColors";

export default function PersonalRecordScreen() {

    const { token, user } = useAuth();
    const userId = user ? user.id : null;

    const [records, setRecords] = useState<PersonalRecordDto[]>([]);
    const [stats, setStats] = useState<PersonalRecordStatsDto | null>(null);
    const [search, setSearch] = useState("");

    const [view, setView] = useState<"list" | "detail">("list");
    const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
    const [history, setHistory] = useState<PersonalRecordHistoryDto[]>([]);
    const [metric, setMetric] = useState<"weight" | "volume">("weight");

  const fetchRecords = async () => {
    const res = await client.get<PersonalRecordDto[]>(`/api/personal-records/user/${userId}`, { headers: { Authorization: `Bearer ${token}` }});
    setRecords(res.data || []);
  };

  const fetchStats = async () => {
    const res = await client.get<PersonalRecordStatsDto>(`/api/personal-records/user/${userId}/stats`, { headers: { Authorization: `Bearer ${token}` }});
    setStats(res.data);
  };

  useEffect(() => {
    if(!userId) return;
    fetchRecords();
    fetchStats();
  }, [userId]);

  const openDetail = async (exerciseId : number) => {
    setSelectedExerciseId(exerciseId);
    setMetric("weight");
    setView("detail");

    const res = await client.get<PersonalRecordHistoryDto[]>(
    `/api/personal-records/user/${userId}/exercise/${exerciseId}/history`,
    { headers: { Authorization: `Bearer ${token}` }});

    setHistory(res.data || []);
  };

  const backToList = () => setView("list");

    const RECENT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
    const isRecent = (achievedAt: string) => Date.now() - new Date(achievedAt).getTime() <= RECENT_WINDOW_MS;

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return records;

        return records.filter((r) => r.exerciseName.toLowerCase().includes(q));
    }, [records, search]);

    const groups = useMemo(() => {
        if (search.trim()) {
            return [{ label: `Results (${filtered.length})`, items: filtered }];
        }
        const recent = [...filtered.filter((r) => isRecent(r.achievedAt))].sort(
            (a, b) => new Date(b.achievedAt).getTime() - new Date(a.achievedAt).getTime()
        );
        const rest = [...filtered.filter((r) => !isRecent(r.achievedAt))].sort((a, b) =>
            a.exerciseName.localeCompare(b.exerciseName)
        );
        return [
            { label: "Recently Improved", items: recent },
            { label: "All Exercises", items: rest },
        ].filter((g) => g.items.length > 0);
    }, [filtered, search]);

  const selectedExercise = records.find((r) => r.exerciseId === selectedExerciseId) ?? null;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  const formatVolume = (kg: number) => (kg >= 1000 ? `${(kg / 1000).toFixed(1)}t` : `${Math.round(kg)}kg`);

  const chartSeries = useMemo(() => {
    return [...history].reverse().map((h) => ({
      value: metric === "weight" ? h.weight : h.volume,
      date: new Date(h.achievedAt).getTime(),
    }));
  }, [history, metric]);

  const CHART_WIDTH = 300;
  const CHART_HEIGHT = 150;
  const PLOT_LEFT = 10;
  const PLOT_RIGHT = 290;
  const PLOT_TOP = 14;
  const PLOT_BOTTOM = 110;

  const chartGeometry = useMemo(() => {
    if (chartSeries.length === 0) return null;

    const values = chartSeries.map((p) => p.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const valueRange = maxVal - minVal || 1;
    const paddedMin = minVal - valueRange * 0.15;
    const paddedMax = maxVal + valueRange * 0.15;
    const paddedRange = paddedMax - paddedMin;

    const dates = chartSeries.map((p) => p.date);
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const dateRange = maxDate - minDate || 1; // avoid divide-by-zero with only one PR ever

    const points = chartSeries.map((p, i) => {
      const xRatio = chartSeries.length === 1 ? 0.5 : (p.date - minDate) / dateRange;
      const x = PLOT_LEFT + xRatio * (PLOT_RIGHT - PLOT_LEFT);
      const yRatio = (p.value - paddedMin) / paddedRange;
      const y = PLOT_TOP + (1 - yRatio) * (PLOT_BOTTOM - PLOT_TOP); // inverted: SVG y grows downward
      return { x, y, value: p.value, isLatest: i === chartSeries.length - 1 };
    });

    const pathD = points.map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x},${pt.y}`).join(" ");

    return { points, pathD, minVal, maxVal };
  }, [chartSeries]);

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      {view === "list" ? (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={{ marginBottom: 14 }}>
            <Text style={styles.h1}>Personal Records</Text>
            <Text style={styles.subtitle}>Your all-time best lifts</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Trophy color={appColors.gold} size={18} />
              <Text style={styles.statLabel}>Heaviest Lift</Text>
              <Text style={styles.statValue}>
                {stats?.heaviestWeight != null ? `${stats.heaviestWeight}kg` : "—"}
              </Text>
              <Text style={styles.statCaption} numberOfLines={1}>
                {stats?.heaviestExerciseName ?? "No PRs yet"}
              </Text>
            </View>

            <View style={styles.statCard}>
              <TrendingUp color={appColors.gold} size={18} />
              <Text style={styles.statLabel}>Most Improved</Text>
              <Text style={styles.statValue}>
                {stats?.mostImprovedPercent != null ? `+${Math.round(stats.mostImprovedPercent)}%` : "—"}
              </Text>
              <Text style={styles.statCaption} numberOfLines={1}>
                {stats?.mostImprovedExerciseName ? `${stats.mostImprovedExerciseName} · 3mo` : "Not enough data"}
              </Text>
            </View>

            <View style={styles.statCard}>
              <Trophy color={appColors.gold} size={18} />
              <Text style={styles.statLabel}>Total PRs</Text>
              <Text style={styles.statValue}>{stats?.totalThisMonth ?? 0}</Text>
              <Text style={styles.statCaption}>this month</Text>
            </View>
          </View>

          <View style={styles.searchRow}>
            <Search color={appColors.mutedDark} size={15} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search exercises..."
              placeholderTextColor={appColors.mutedDark}
              style={styles.searchInput}
            />
          </View>

          {groups.map((group) => (
            <View key={group.label} style={{ marginBottom: 20 }}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              <View style={{ gap: 10 }}>
                {group.items.map((item) => (
                  <TouchableOpacity
                    key={item.exerciseId}
                    style={styles.prCard}
                    onPress={() => openDetail(item.exerciseId)}
                  >
                    <View style={styles.prCardHeader}>
                      <View style={styles.prCardIcon}>
                        <Dumbbell color={appColors.gold} size={15} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.prCardNameRow}>
                          <Text style={styles.prCardName}>{item.exerciseName}</Text>
                          {isRecent(item.achievedAt) && <View style={styles.newDot} />}
                        </View>
                      </View>
                      <ChevronRight color={appColors.mutedDark} size={16} />
                    </View>

                    <View style={styles.prCardStatsRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.prCardStatLabel}>Heaviest</Text>
                        <Text style={styles.prCardStatValue}>{item.weight}kg</Text>
                      </View>
                      <View style={styles.prCardDivider} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.prCardStatLabel}>Best Set</Text>
                        <Text style={styles.prCardStatValue}>
                          {item.weight}kg × {item.reps}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {records.length === 0 && (
            <Text style={styles.muted}>No personal records yet — complete a workout to start tracking.</Text>
          )}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.detailHeaderRow}>
            <TouchableOpacity style={styles.backButton} onPress={backToList}>
              <ChevronLeft color={whiteAlpha(0.8)} size={18} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailName}>{selectedExercise?.exerciseName ?? "Exercise"}</Text>
            </View>
          </View>

          {selectedExercise && (
            <View style={styles.detailStatsRow}>
              <View style={styles.detailStatBox}>
                <Text style={styles.detailStatValue}>{selectedExercise.weight}kg</Text>
                <Text style={styles.detailStatLabel}>heaviest</Text>
              </View>
              <View style={styles.detailStatDivider} />
              <View style={styles.detailStatBox}>
                <Text style={[styles.detailStatValue, { color: appColors.gold }]}>
                  {selectedExercise.weight}kg × {selectedExercise.reps}
                </Text>
                <Text style={styles.detailStatLabel}>best set</Text>
              </View>
            </View>
          )}

          <View style={styles.chartCard}>
            <View style={styles.chartHeaderRow}>
              <Text style={styles.chartTitle}>Progress</Text>
              <View style={styles.metricToggle}>
                <TouchableOpacity
                  style={[styles.metricButton, metric === "weight" && styles.metricButtonActive]}
                  onPress={() => setMetric("weight")}
                >
                  <Text style={[styles.metricButtonText, metric === "weight" && styles.metricButtonTextActive]}>
                    Weight
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.metricButton, metric === "volume" && styles.metricButtonActive]}
                  onPress={() => setMetric("volume")}
                >
                  <Text style={[styles.metricButtonText, metric === "volume" && styles.metricButtonTextActive]}>
                    Volume
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.chartSubtitle}>Last 3 months</Text>

            {chartGeometry && chartGeometry.points.length > 0 ? (
              <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
                <Line
                  x1={PLOT_LEFT} y1={PLOT_TOP} x2={PLOT_RIGHT} y2={PLOT_TOP}
                  stroke={whiteAlpha(0.08)} strokeWidth={1} strokeDasharray="3,4"
                />
                <Line
                  x1={PLOT_LEFT} y1={PLOT_BOTTOM} x2={PLOT_RIGHT} y2={PLOT_BOTTOM}
                  stroke={whiteAlpha(0.08)} strokeWidth={1} strokeDasharray="3,4"
                />
                <SvgText x={PLOT_RIGHT + 4} y={PLOT_TOP + 3} textAnchor="end" fontSize={9} fill={appColors.mutedDark}>
                  {metric === "weight" ? `${Math.round(chartGeometry.maxVal)}kg` : formatVolume(chartGeometry.maxVal)}
                </SvgText>
                <SvgText x={PLOT_RIGHT + 4} y={PLOT_BOTTOM + 3} textAnchor="end" fontSize={9} fill={appColors.mutedDark}>
                  {metric === "weight" ? `${Math.round(chartGeometry.minVal)}kg` : formatVolume(chartGeometry.minVal)}
                </SvgText>

                <Path
                  d={chartGeometry.pathD}
                  fill="none"
                  stroke={appColors.gold}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {chartGeometry.points.map((pt, i) =>
                  pt.isLatest ? (
                    <Circle key={i} cx={pt.x} cy={pt.y} r={5.5} fill={appColors.gold} stroke={appColors.black} strokeWidth={2} />
                  ) : (
                    <Circle key={i} cx={pt.x} cy={pt.y} r={3.5} fill={appColors.black} stroke={appColors.gold} strokeWidth={1.8} />
                  )
                )}

                <SvgText
                  x={chartGeometry.points[chartGeometry.points.length - 1].x - 8}
                  y={chartGeometry.points[chartGeometry.points.length - 1].y - 10}
                  textAnchor="end"
                  fontSize={10}
                  fontWeight="700"
                  fill={appColors.gold}
                >
                  {metric === "weight"
                    ? `${chartGeometry.points[chartGeometry.points.length - 1].value}kg`
                    : formatVolume(chartGeometry.points[chartGeometry.points.length - 1].value)}
                </SvgText>
              </Svg>
            ) : (
              <Text style={styles.muted}>Not enough data yet.</Text>
            )}
          </View>

          <Text style={styles.groupLabel}>Recent Records</Text>
          <View style={{ gap: 8 }}>
            {history.map((ev, idx) => {
              const prev = history[idx + 1];
              const delta = prev ? ev.weight - prev.weight : null;
              return (
                <View key={`${ev.achievedAt}-${idx}`} style={styles.eventRow}>
                  <Text style={styles.eventDate}>{formatDate(ev.achievedAt)}</Text>
                  <Text style={styles.eventValue}>
                    {ev.weight}kg × {ev.reps}
                  </Text>
                  {delta != null && (
                    <Text style={styles.eventDelta}>
                      {delta > 0 ? "+" : ""}
                      {delta}kg
                    </Text>
                  )}
                </View>
              );
            })}
            {history.length === 0 && <Text style={styles.muted}>No history yet.</Text>}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: appColors.black },
  content: { padding: 20, paddingBottom: 40 },
  h1: { color: appColors.white, fontSize: 22, fontWeight: "600" },
  subtitle: { color: appColors.muted, fontSize: 13, marginTop: 2 },
  muted: { color: appColors.muted },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  statCard: {
    flex: 1,
    backgroundColor: appColors.cardBg,
    borderWidth: 1,
    borderColor: goldAlpha(0.1),
    borderRadius: 12,
    padding: 12,
  },
  statLabel: { color: appColors.muted, fontSize: 11, marginTop: 8 },
  statValue: { color: appColors.gold, fontSize: 17, fontWeight: "700", marginTop: 2 },
  statCaption: { color: appColors.mutedDark, fontSize: 11, marginTop: 1 },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: whiteAlpha(0.05),
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 18,
  },
  searchInput: { flex: 1, color: appColors.white, fontSize: 14 },

  groupLabel: {
    color: appColors.mutedDark,
    fontSize: 11.5,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  prCard: {
    backgroundColor: appColors.cardBg,
    borderWidth: 1,
    borderColor: goldAlpha(0.1),
    borderRadius: 12,
    padding: 14,
  },
  prCardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  prCardIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: goldAlpha(0.1),
    alignItems: "center",
    justifyContent: "center",
  },
  prCardNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  prCardName: { color: appColors.white, fontSize: 15, fontWeight: "600" },
  newDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: appColors.gold },
  prCardStatsRow: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: whiteAlpha(0.06),
  },
  prCardStatLabel: { color: appColors.mutedDark, fontSize: 11 },
  prCardStatValue: { color: appColors.white, fontSize: 15, fontWeight: "700", marginTop: 2 },
  prCardDivider: { width: 1, backgroundColor: whiteAlpha(0.08) },

  detailHeaderRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: whiteAlpha(0.1),
    alignItems: "center",
    justifyContent: "center",
  },
  detailName: { color: appColors.gold, fontSize: 18, fontWeight: "600" },

  detailStatsRow: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: appColors.cardBg,
    borderWidth: 1,
    borderColor: goldAlpha(0.1),
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 18,
  },
  detailStatBox: { flex: 1, alignItems: "center" },
  detailStatValue: { color: appColors.white, fontSize: 17, fontWeight: "700" },
  detailStatLabel: { color: appColors.mutedDark, fontSize: 11, marginTop: 3 },
  detailStatDivider: { width: 1, backgroundColor: whiteAlpha(0.08) },

  chartCard: {
    backgroundColor: appColors.cardBg,
    borderWidth: 1,
    borderColor: goldAlpha(0.1),
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
  },
  chartHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  chartTitle: { color: appColors.white, fontSize: 14, fontWeight: "600" },
  chartSubtitle: { color: appColors.mutedDark, fontSize: 11.5, marginBottom: 8 },
  metricToggle: { flexDirection: "row", backgroundColor: whiteAlpha(0.05), borderRadius: 8, padding: 2 },
  metricButton: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 6 },
  metricButtonActive: { backgroundColor: appColors.gold },
  metricButtonText: { color: appColors.muted, fontSize: 12, fontWeight: "600" },
  metricButtonTextActive: { color: appColors.black },

  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: appColors.cardBg,
    borderWidth: 1,
    borderColor: goldAlpha(0.1),
    borderRadius: 10,
    padding: 12,
  },
  eventDate: { color: appColors.mutedDark, fontSize: 12, width: 56 },
  eventValue: { flex: 1, color: appColors.ink, fontSize: 13.5, fontWeight: "600" },
  eventDelta: { color: appColors.gold, fontSize: 12.5, fontWeight: "700" },
});
