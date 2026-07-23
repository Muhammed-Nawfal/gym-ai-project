import { Check, ChevronDown } from "lucide-react-native";
import React, { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { appColors, blackAlpha, goldAlpha, whiteAlpha } from "../constants/appColors";

interface DropDownTextFieldOption {
  value: string;
  label: string;
}

interface SingleSelectProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: DropDownTextFieldOption[];
  editable?: boolean;
  multiSelect?: false;
}

interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: DropDownTextFieldOption[];
  editable?: boolean;
  multiSelect: true;
}

type DropDownTextFieldProps = SingleSelectProps | MultiSelectProps;

// The web version used HeadlessUI's Listbox (a dropdown that opens inline).
// RN has no floating/absolute-positioned popover primitive like the web DOM,
// so the natural RN equivalent is a full-screen Modal that pops up a list to
// pick from - same underlying behavior (pick one/many options), different look.
const DropDownTextField: React.FC<DropDownTextFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  options,
  editable = true,
  multiSelect = false,
}) => {
  const [open, setOpen] = useState(false);

  const displayText = multiSelect
    ? (value as string[]).length > 0
      ? (value as string[])
          .map((v) => options.find((o) => o.value === v)?.label)
          .join(", ")
      : placeholder || "Select options"
    : options.find((o) => o.value === (value as string))?.label ||
      placeholder ||
      "Select an option";

  const isSelected = (optionValue: string) =>
    multiSelect ? (value as string[]).includes(optionValue) : value === optionValue;

  const handleSelect = (optionValue: string) => {
    if (multiSelect) {
      const current = value as string[];
      const next = current.includes(optionValue)
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue];
      (onChange as (v: string[]) => void)(next);
    } else {
      (onChange as (v: string) => void)(optionValue);
      setOpen(false);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable
        style={styles.trigger}
        onPress={() => editable && setOpen(true)}
        disabled={!editable}
      >
        <Text style={styles.triggerText} numberOfLines={1}>
          {displayText}
        </Text>
        <ChevronDown size={16} color={appColors.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable style={styles.option} onPress={() => handleSelect(item.value)}>
                  <Text style={styles.optionText}>{item.label}</Text>
                  {isSelected(item.value) && <Check size={16} color={appColors.gold} />}
                </Pressable>
              )}
            />
            {multiSelect && (
              <Pressable style={styles.doneButton} onPress={() => setOpen(false)}>
                <Text style={styles.doneButtonText}>Done</Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    color: appColors.ink,
  },
  trigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: goldAlpha(0.1),
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  triggerText: {
    color: appColors.white,
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: blackAlpha(0.6),
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#111112",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "60%",
    paddingBottom: 24,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: whiteAlpha(0.05),
  },
  optionText: {
    color: appColors.ink,
    fontSize: 15,
  },
  doneButton: {
    marginTop: 8,
    marginHorizontal: 20,
    backgroundColor: appColors.gold,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
  },
  doneButtonText: {
    color: appColors.black,
    fontWeight: "600",
  },
});

export default DropDownTextField;
