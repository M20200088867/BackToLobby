"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: 16, md: 20, lg: 24 } as const;

export function StarRating({ value, onChange, size = "md" }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const interactive = !!onChange;
  const displayValue = hoverValue ?? value;
  const px = sizeMap[size];

  return (
    <div
      className="inline-flex items-center gap-0.5"
      onMouseLeave={() => interactive && setHoverValue(null)}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const starIndex = i + 1;
        const fillLevel =
          displayValue >= starIndex
            ? "full"
            : displayValue >= starIndex - 0.5
              ? "half"
              : "empty";

        if (!interactive) {
          return (
            <span key={i} className="relative inline-block" style={{ width: px, height: px }}>
              <Star
                className="absolute inset-0 text-white/20"
                size={px}
                strokeWidth={1.5}
              />
              {fillLevel !== "empty" && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: fillLevel === "half" ? "50%" : "100%" }}
                >
                  <Star
                    className="text-yellow-400"
                    size={px}
                    fill="currentColor"
                    strokeWidth={1.5}
                  />
                </span>
              )}
            </span>
          );
        }

        return (
          <span key={i} className="relative inline-flex" style={{ width: px, height: px }}>
            {/* Background empty star */}
            <Star
              className="absolute inset-0 text-white/20"
              size={px}
              strokeWidth={1.5}
            />
            {/* Filled overlay */}
            {fillLevel !== "empty" && (
              <span
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: fillLevel === "half" ? "50%" : "100%" }}
              >
                <Star
                  className="text-yellow-400"
                  size={px}
                  fill="currentColor"
                  strokeWidth={1.5}
                />
              </span>
            )}
            {/* Left half click zone */}
            <button
              type="button"
              className={cn(
                "absolute left-0 top-0 h-full w-1/2 z-10 cursor-pointer",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50 rounded-l"
              )}
              onMouseEnter={() => setHoverValue(starIndex - 0.5)}
              onClick={() => onChange(starIndex - 0.5)}
              aria-label={`Rate ${starIndex - 0.5} out of 5`}
            />
            {/* Right half click zone */}
            <button
              type="button"
              className={cn(
                "absolute right-0 top-0 h-full w-1/2 z-10 cursor-pointer",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/50 rounded-r"
              )}
              onMouseEnter={() => setHoverValue(starIndex)}
              onClick={() => onChange(starIndex)}
              aria-label={`Rate ${starIndex} out of 5`}
            />
          </span>
        );
      })}
    </div>
  );
}
