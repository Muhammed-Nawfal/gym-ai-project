import { Search } from "lucide-react-native";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import DropDownTextField from "./DropDownTextField";
import { appColors, blackAlpha, goldAlpha } from "../constants/appColors";

interface FilterOption {
  category: string;
  label: string;
  options: { value: string; label: string }[];
}

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  filters?: Record<string, string>;
  onFilterChange?: (category: string, value: string) => void;
  filterOptions?: FilterOption[];
  placeholder?: string;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  search,
  onSearchChange,
  filters,
  onFilterChange,
  filterOptions,
  placeholder,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <Search size={18} color={appColors.muted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={appColors.mutedDark}
          value={search}
          onChangeText={onSearchChange}
        />
      </View>

      {filterOptions && filters && onFilterChange && (
        <View style={styles.filterRow}>
          {filterOptions.slice(0, 1).map((filter) => (
            <DropDownTextField
              key={filter.category}
              value={filters[filter.category]}
              onChange={(val) => onFilterChange(filter.category, val)}
              options={filter.options}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: goldAlpha(0.15),
    borderRadius: 12,
    padding: 16,
    backgroundColor: blackAlpha(0.5),
    gap: 12,
    marginBottom: 24,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: goldAlpha(0.1),
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    color: appColors.white,
  },
  filterRow: {
    width: "100%",
  },
});

export default SearchFilterBar;
