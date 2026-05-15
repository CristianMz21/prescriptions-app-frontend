"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";

type AllowedKeys<T> = ReadonlyArray<keyof T & string>;

export function useTypedFilters<TSchema extends z.ZodObject<z.ZodRawShape>>(
  schema: TSchema,
  allowedKeys: AllowedKeys<z.infer<TSchema>>,
) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();

  const values = useMemo((): Partial<z.infer<TSchema>> => {
    const raw = {} as Partial<z.infer<TSchema>>;
    for (const key of allowedKeys as readonly string[]) {
      const v = params.get(key);
      if (v !== null && v !== "") {
        (raw as Record<string, unknown>)[key] = v;
      }
    }
    const result = schema.partial().safeParse(raw);
    return result.success ? result.data : ({} as z.infer<TSchema>);
  }, [params, allowedKeys, schema]);

  const setFilters = useCallback(
    (patch: Partial<z.infer<TSchema>>) => {
      const merged = schema.partial().safeParse({ ...values, ...patch });
      if (!merged.success) return;

      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(merged.data)) {
        if (v === undefined || v === "" || v === null) {
          next.delete(k);
        } else {
          next.set(k, String(v));
        }
      }
      next.set("page", "1");
      router.push(`${pathname}?${next.toString()}`);
    },
    [values, params, pathname, router, schema],
  );

  const clear = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  return { values, setFilters, clear };
}
