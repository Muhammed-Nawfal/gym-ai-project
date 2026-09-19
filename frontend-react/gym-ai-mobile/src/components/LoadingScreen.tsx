import React from "react";
import { ActivityIndicator, View } from "react-native";
import { appColors } from "../constants/appColors";

export default function LoadingScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: appColors.black }}>
      <ActivityIndicator color={appColors.gold} size="large" />
    </View>
  );
}
