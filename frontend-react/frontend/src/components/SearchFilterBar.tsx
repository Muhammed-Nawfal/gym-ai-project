import { Filter, Search } from "lucide-react";
import React, { useState } from "react";
import DropDownTextField from "./DropDownTextField";

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
  type?: string;
  placeholder?: string;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  search,
  onSearchChange,
  filters,
  onFilterChange,
  filterOptions,
  placeholder,
  type,
}) => {

    const [showFilters, setShowFilters]= useState(false);

    return(
        <div className="w-full space-y-4 mb-6 border border-brand-goldDark/30 p-5 rounded-lg bg-black/50">
            <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 border border-brand-gold/10 rounded-lg px-3 py-2 bg-black/20">
                    <Search className="w-5 h-5 muted"/>
                    <input
                        type={type}
                        placeholder={placeholder}
                        value={search}
                        onChange={(e)=> onSearchChange(e.target.value)} 
                        className="flex-1 bg-transparent outline-none text-sm"
                    />
                </div>

                <button
                    onClick={()=> setShowFilters((prev)=>!prev)}
                     className={`flex items-center gap-2 px-3 py-2 rounded-md border transition ${
                        showFilters
                        ? "border-brand-gold text-brand-gold"
                        : "border-brand-gold/10 muted hover:border-brand-gold hover:text-brand-gold"
                    }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                </button>
            </div>

            {showFilters && filterOptions && filters && onFilterChange &&(
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-brand-gold/10">
                    {filterOptions?.map((filter) => (
                        <DropDownTextField
                            key={filter.category}
                            label={filter.label}
                            value={filters[filter.category]}
                            onChange={(val) => onFilterChange(filter.category, val)}
                            options={filter.options}
                            />
                    ))}
                </div>
            )}
        </div>
    );

};

export default SearchFilterBar;