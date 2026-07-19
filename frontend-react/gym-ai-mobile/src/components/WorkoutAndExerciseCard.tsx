import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type WorkoutAndExerciseCardProps = {
  title: string;
  description?: string | null;
  icon?: React.ReactNode;
  badges?: string[];
  onPress?: () => void;
};

const WorkoutAndExerciseCard: React.FC<WorkoutAndExerciseCardProps> = ({
  title,
  description,
  icon,
  badges = [],
  onPress,
}) => {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.headerRow}>
        {icon}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.description} numberOfLines={1}>
        {description || "No description"}
      </Text>

      {badges.length > 0 && (
        <View style={styles.badgeRow}>
          {badges.map((b, idx) => (
            <View key={`${b}-${idx}`} style={styles.badge}>
              <Text style={styles.badgeText}>{b}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0a0a0a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.1)",
    padding: 16,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    color: "#a1a1aa",
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  badge: {
    borderWidth: 1,
    borderColor: "#8a6d1f",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: "#d4af37",
    fontSize: 11,
  },
});

export default WorkoutAndExerciseCard;
