"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PageSizeSelectProps {
  value: number;
  options?: number[];
}

export function PageSizeSelect({ value, options = [5, 10, 20] }: PageSizeSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (newVal: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    params.set("pageSize", newVal);
    params.set("page", "1"); // reset to first page on page size change
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={String(value)} onValueChange={onChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Taille" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={String(opt)}>{opt} / page</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


