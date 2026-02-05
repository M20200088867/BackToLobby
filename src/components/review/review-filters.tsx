"use client";

import { cn } from "@/lib/utils";

export type ReviewSortOption = "newest" | "highest";

interface ReviewFiltersProps {
  value: ReviewSortOption;
  onChange: (value: ReviewSortOption) => void;
}

const FILTER_OPTIONS: { value: ReviewSortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "highest", label: "Highest Rated" },
];

export function ReviewFilters({ value, onChange }: ReviewFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      {FILTER_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-3 py-1.5 text-sm rounded-xl transition-colors",
            value === option.value
              ? "bg-primary text-primary-foreground"
              : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
