import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { appColors, goldAlpha } from "../constants/appColors";

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange?: (value: string) => void;
  editable?: boolean;
  type?: string;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  editable = false,
  type = "text",
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor={appColors.mutedDark}
        secureTextEntry={type === "password"}
        keyboardType={
          type === "number" ? "numeric" : type === "email" ? "email-address" : "default"
        }
        autoCapitalize="none"
      />
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
  input: {
    width: "100%",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: appColors.white,
    borderWidth: 1,
    borderColor: goldAlpha(0.1),
  },
});

export default TextField;
