"use client";

import { useEffect, useState, useCallback } from "react";


interface DisplayOrder {
  id:          string;
  tokenNumber: string | null;
  status:      string;
  createdAt:   string;
}

interface DisplayData {
  preparing: DisplayOrder[];
  ready:     DisplayOrder[];
}

function tokenLabel(order: DisplayOrder) {
  return order.tokenNumber ?? order.id.slice(-4).toUpperCase();
}

function TokenCard({ order, highlight }: { order: DisplayOrder; highlight: boolean }) {
  return (
    <div
      className={`
        flex items-center justify-center rounded-2xl border-2 transition-all duration-700
        ${highlight
          ? "border-green-400 bg-green-950/60 shadow-[0_0_32px_rgba(74,222,128,0.35)]"
          : "border-amber-500/40 bg-black/40"}
      `}
      style={{ minWidth: 120, minHeight: 96, padding: "12px 20px" }}
    >
      <span
        className={`font-mono font-black tracking-tight select-none tabular-nums leading-none
          ${highlight ? "text-green-300" : "text-amber-400"}
        `}
        style={{
          fontSize: "clamp(2.5rem, 6vw, 5rem)",
          textShadow: highlight
            ? "0 0 20px rgba(74,222,128,0.8), 0 0 40px rgba(74,222,128,0.4)"
            : "0 0 16px rgba(251,191,36,0.7), 0 0 32px rgba(251,191,36,0.3)",
        }}
      >
        {tokenLabel(order)}
      </span>
    </div>
  );
}

function Column({
  title,
  subtitle,
  orders,
  highlight,
  accentClass,
  glowColor,
}: {
  title:       string;
  subtitle:    string;
  orders:      DisplayOrder[];
  highlight:   boolean;
  accentClass: string;
  glowColor:   string;
}) {
  return (
    <div className="flex flex-col flex-1 min-w-0">
      {/* Column header */}
      <div
        className={`rounded-2xl mb-6 px-6 py-5 border ${accentClass}`}
        style={{ boxShadow: `0 0 24px ${glowColor}` }}
      >
        <h2
          className="font-black uppercase tracking-widest text-center"
          style={{
            fontSize: "clamp(1.1rem, 2.5vw, 2rem)",
            textShadow: `0 0 12px ${glowColor}`,
          }}
        >
          {title}
        </h2>
        <p className="text-center text-xs mt-1 opacity-60 tracking-widest uppercase font-semibold">
          {subtitle}
        </p>
      </div>

      {/* Token grid */}
      {orders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center opacity-20">
          <span className="font-mono text-2xl tracking-widest">— — —</span>
        </div>
      ) : (
        <div
          className="flex flex-wrap gap-4 content-start justify-center"
          style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}
        >
          {orders.map((order) => (
            <TokenCard key={order.id} order={order} highlight={highlight} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DisplayBoard() {
  const [data,      setData]      = useState<DisplayData>({ preparing: [], ready: [] });
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [, setTick] = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      const res  = await fetch("/api/display/orders", { cache: "no-store" });
      const json = await res.json() as DisplayData;
      setData(json);
      setLastFetch(new Date());
    } catch {
      // silent retry
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const poll  = setInterval(fetchOrders, 5000);
    const clock = setInterval(() => setTick((t) => t + 1), 1000);
    return () => { clearInterval(poll); clearInterval(clock); };
  }, [fetchOrders]);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <main
      className="min-h-screen w-full flex flex-col overflow-hidden select-none"
      style={{
        background: "radial-gradient(ellipse at top, #0a0f1a 0%, #000000 70%)",
        fontFamily: "'Courier New', Courier, monospace",
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-8 py-4 border-b border-white/5"
        style={{ background: "rgba(0,0,0,0.6)" }}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/30 bg-amber-950/40 flex items-center justify-center">
            <span className="text-amber-400 font-black text-sm tracking-tight">TBC</span>
          </div>
          <div>
            <p
              className="font-black tracking-widest uppercase text-amber-400"
              style={{ fontSize: "clamp(0.75rem, 1.5vw, 1.1rem)", textShadow: "0 0 10px rgba(251,191,36,0.5)" }}
            >
              The Biryani Canteen
            </p>
            <p className="text-white/30 text-xs tracking-widest uppercase">Order Display</p>
          </div>
        </div>

        <div className="text-right">
          <p
            className="font-mono font-black text-amber-300 tabular-nums"
            style={{ fontSize: "clamp(1.2rem, 2.5vw, 2rem)", textShadow: "0 0 16px rgba(251,191,36,0.6)" }}
          >
            {timeStr}
          </p>
          {lastFetch && (
            <p className="text-white/25 text-xs font-mono">
              Updated {Math.round((now.getTime() - lastFetch.getTime()) / 1000)}s ago
            </p>
          )}
        </div>
      </div>

      {/* Board */}
      <div className="flex flex-1 gap-6 p-6 overflow-hidden">
        {/* Divider line */}
        <div className="relative flex flex-1 gap-6 w-full">
          <div className="flex-1">
            <Column
              title="Preparing"
              subtitle="Your order is being prepared"
              orders={data.preparing}
              highlight={false}
              accentClass="border-amber-500/40 text-amber-400 bg-amber-950/20"
              glowColor="rgba(251,191,36,0.2)"
            />
          </div>

          {/* Center divider */}
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="w-px flex-1 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          </div>

          <div className="flex-1">
            <Column
              title="Ready to Collect"
              subtitle="Please collect your order at the counter"
              orders={data.ready}
              highlight={true}
              accentClass="border-green-500/50 text-green-400 bg-green-950/20"
              glowColor="rgba(74,222,128,0.2)"
            />
          </div>
        </div>
      </div>

      {/* Bottom ticker */}
      <div
        className="px-6 py-3 border-t border-white/5 flex items-center gap-3"
        style={{ background: "rgba(0,0,0,0.7)" }}
      >
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: "0 0 8px rgba(74,222,128,0.8)" }} />
        <p className="text-white/30 text-xs font-mono tracking-widest uppercase">
          Auto-refreshes every 5 seconds · Show this screen at the counter
        </p>
      </div>
    </main>
  );
}
