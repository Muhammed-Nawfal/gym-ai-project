import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { appColors, goldAlpha } from "../constants/appColors";

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
    backgroundColor: appColors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: goldAlpha(0.1),
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
    color: appColors.muted,
    fontSize: 13,
  },
  value: {
    color: appColors.gold,
    fontSize: 22,
    fontWeight: "600",
  },
  caption: {
    color: appColors.muted,
    fontSize: 13,
  },
});

export default StatsCard;
