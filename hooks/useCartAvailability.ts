"use client";

import { useEffect, useRef, useState } from "react";
import { useCartStore } from "@/store/useCartStore";

type SlimMenuItem = { petpoojaId: string; variants: { petpoojaId: string }[] };

function buildAvailableSet(menuItems: SlimMenuItem[]): Set<string> {
  const s = new Set<string>();
  for (const m of menuItems) {
    s.add(m.petpoojaId);
    for (const v of m.variants) s.add(v.petpoojaId);
  }
  return s;
}

export function useCartAvailability() {
  const items = useCartStore((state) => state.items);
  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);

  const availableRef = useRef<Set<string>>(new Set());
  const [outOfStockIds, setOutOfStockIds] = useState<Set<string>>(new Set());
  const [checking, setChecking] = useState(true);

  function recompute(available: Set<string>) {
    availableRef.current = available;
    setOutOfStockIds(
      new Set(itemsRef.current.map((i) => i.id).filter((id) => !available.has(id))),
    );
  }

  useEffect(() => {
    fetch("/api/menu")
      .then((r) => r.json())
      .then((data: SlimMenuItem[]) => {
        recompute(buildAvailableSet(data));
        setChecking(false);
      })
      .catch(() => setChecking(false));

    const es = new EventSource("/api/menu/events");
    es.addEventListener("menu", (e: MessageEvent) => {
      try {
        recompute(buildAvailableSet(JSON.parse(e.data) as SlimMenuItem[]));
      } catch {}
    });
    return () => es.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recompute when cart changes using the last known available set
  useEffect(() => {
    setOutOfStockIds(
      new Set(items.map((i) => i.id).filter((id) => !availableRef.current.has(id))),
    );
  }, [items]);

  return { outOfStockIds, checking };
}
