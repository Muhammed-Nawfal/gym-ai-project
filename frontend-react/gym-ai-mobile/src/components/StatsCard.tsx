import React from "react";
import { StyleSheet, Text, View } from "react-native";

type StatsCardProps = {
  title: string;
  value: React.ReactNode;
  caption?: string;
  icon?: React.ReactNode;
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, caption, icon }) => {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.textCol}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        </View>
        {icon ? <View>{icon}</View> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0a0a0a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.1)",
    padding: 18,
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  textCol: {
    gap: 6,
  },
  title: {
    color: "#a1a1aa",
    fontSize: 13,
  },
  value: {
    color: "#d4af37",
    fontSize: 22,
    fontWeight: "600",
  },
  caption: {
    color: "#a1a1aa",
    fontSize: 13,
  },
});

export default StatsCard;
