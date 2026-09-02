import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { appColors, goldAlpha } from "../constants/appColors";

type QuickActionItemProps = {
  title: string;
  description: string;
  onPress?: () => void;
};

const QuickActionItem: React.FC<QuickActionItemProps> = ({ title, description, onPress }) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: goldAlpha(0.1),
    borderRadius: 10,
    padding: 14,
    gap: 4,
  },
  title: {
    color: appColors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    color: appColors.muted,
    fontSize: 13,
  },
});

export default QuickActionItem;
