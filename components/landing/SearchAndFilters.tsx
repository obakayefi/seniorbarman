"use client";

import React from "react";
import { EventSearchBar } from "@/components/ui/EventSearchBar";

const dateFilters = [
    { label: "All", value: "" },
    { label: "This Week", value: "this-week" },
    { label: "This Month", value: "this-month" },
];

interface SearchAndFiltersProps {
    onFilterChange?: (filter: string) => void;
    activeFilter?: string;
}

export default function SearchAndFilters({ onFilterChange, activeFilter = "" }: SearchAndFiltersProps) {
    return (
        <div className="w-full max-w-6xl mx-auto px-4">
            {/* Search Bar Row with Date Filters inline */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1">
                    <EventSearchBar placeholder="What are you looking for?" />
                </div>

                {/* Inline Date Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                    {dateFilters.map((filter) => {
                        const isActive = activeFilter === filter.value;
                        return (
                            <button
                                key={filter.value}
                                type="button"
                                onClick={() => onFilterChange?.(filter.value)}
                                className={`flex-shrink-0 px-4 py-3 rounded-sm text-xs font-extrabold transition-all duration-200 cursor-pointer border uppercase tracking-wider ${
                                    isActive
                                        ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-950/40"
                                        : "bg-card text-card-foreground border-border hover:bg-muted hover:text-foreground"
                                }`}
                            >
                                {filter.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
