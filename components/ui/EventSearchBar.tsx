"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface EventSearchBarProps {
    placeholder?: string;
    initialValue?: string;
    onSearch?: (query: string) => void;
    className?: string;
}

export function EventSearchBar({
    placeholder = "What are you looking for?",
    initialValue = "",
    onSearch,
    className = "",
}: EventSearchBarProps) {
    const [query, setQuery] = useState(initialValue);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (onSearch) {
            onSearch(trimmed);
        } else if (trimmed) {
            router.push(`/events?q=${encodeURIComponent(trimmed)}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors" />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-11 pr-4 py-3 rounded-sm border border-border bg-card text-card-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-[1.5px] focus:ring-orange-500 focus:border-orange-500 shadow-sm transition-all"
            />
        </form>
    );
}
