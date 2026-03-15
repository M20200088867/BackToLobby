"use client";

import { useState } from "react";
import { ChevronsUpDown, Check, X } from "lucide-react";
import { Command } from "cmdk";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { countries, type Country } from "@/lib/countries";

interface CountryComboboxProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export function CountryCombobox({ value, onChange, disabled }: CountryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = countries.find((c) => c.code === value);

  const filtered = search
    ? countries.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    : countries;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between glass border-white/10 rounded-xl h-10 font-normal"
        >
          {selected ? (
            <span className="flex items-center gap-2 truncate">
              <span>{selected.flag}</span>
              <span>{selected.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Select country...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command className="bg-transparent" shouldFilter={false}>
          <div className="flex items-center border-b border-white/[0.08] px-3">
            <Command.Input
              placeholder="Search countries..."
              value={search}
              onValueChange={setSearch}
              className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                  setSearch("");
                }}
                className="ml-1 p-1 rounded hover:bg-white/10"
                aria-label="Clear country"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          <Command.List className="max-h-[200px] overflow-y-auto p-1">
            {filtered.length === 0 && (
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                No country found.
              </Command.Empty>
            )}
            {filtered.map((country: Country) => (
              <Command.Item
                key={country.code}
                value={country.code}
                onSelect={() => {
                  onChange(country.code === value ? "" : country.code);
                  setOpen(false);
                  setSearch("");
                }}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm cursor-pointer hover:bg-white/10 data-[selected=true]:bg-white/10"
              >
                <span>{country.flag}</span>
                <span className="flex-1 truncate">{country.name}</span>
                <Check
                  className={cn(
                    "h-4 w-4 shrink-0",
                    value === country.code ? "opacity-100" : "opacity-0"
                  )}
                />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
