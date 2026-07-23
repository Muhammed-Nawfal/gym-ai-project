import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { appColors, blackAlpha, goldAlpha } from "../constants/appColors";

type DialogBoxModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  headerActions?: React.ReactNode;
};

export default function DialogBoxModal({
  open,
  onClose,
  title,
  children,
  icon,
  headerActions,
}: DialogBoxModalProps) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {title && (
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                {icon && <View>{icon}</View>}
                <Text style={styles.headerTitle}>{title}</Text>
              </View>
              {headerActions}
            </View>
          )}
          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 24 }}>
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: blackAlpha(0.6),
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxHeight: "85%",
    flexShrink: 1,
    backgroundColor: appColors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: goldAlpha(0.1),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: appColors.gold,
  },
  body: {
    flexShrink: 1,
    paddingHorizontal: 20,
  },
});
