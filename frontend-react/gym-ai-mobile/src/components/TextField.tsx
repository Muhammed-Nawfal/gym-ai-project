import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

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
        placeholderTextColor="#71717a"
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
    color: "#e4e4e7",
  },
  input: {
    width: "100%",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.1)",
  },
});

export default TextField;
