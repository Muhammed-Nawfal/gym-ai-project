import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

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
    borderColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: 10,
    padding: 14,
    gap: 4,
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
});

export default QuickActionItem;
