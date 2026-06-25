"use client";

import { useEffect, useState, useCallback, useRef } from "react";

/* ─── types ─────────────────────────────────────────────────────────── */
interface DisplayOrder {
  tokenNumber: string | null;
  status:      string;
  createdAt:   string;
}
interface DisplayData {
  preparing: DisplayOrder[];
  ready:     DisplayOrder[];
}
interface TransitItem {
  key:   string;   // unique per animation instance
  label: string;
}

/* ─── helpers ────────────────────────────────────────────────────────── */
function tokenLabel(o: DisplayOrder) {
  return o.tokenNumber ?? "----";
}
/** Stable unique key per order — avoids exposing internal UUIDs */
function oKey(o: DisplayOrder) {
  return o.tokenNumber ?? o.createdAt;
}

const TRANSIT_MS   = 2400;   // duration of the fly animation
const LINGER_MS    = 600;    // extra before we remove the overlay entry

/* ─── test / demo data ───────────────────────────────────────────────── */
const DEMO_BASE: DisplayData = {
  preparing: [
    { tokenNumber: "42", status: "preparing", createdAt: "demo-1" },
    { tokenNumber: "43", status: "accepted",  createdAt: "demo-2" },
  ],
  ready: [
    { tokenNumber: "41", status: "ready", createdAt: "demo-3" },
  ],
};

/* ─── transit overlay card ───────────────────────────────────────────── */
function TransitCard({ label, onDone }: { label: string; onDone: () => void }) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), TRANSIT_MS + LINGER_MS);
    return () => clearTimeout(t);
  // empty deps — timer runs once on mount, ref keeps onDone current
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* inject keyframes once per render — idempotent because same id */}
      <style>{`
        @keyframes token-fly {
          0% {
            left: 22%;
            color: #fbbf24;
            border-color: rgba(251,191,36,0.9);
            background: rgba(22,10,0,0.97);
            text-shadow: 0 0 24px #fbbf24, 0 0 48px rgba(251,191,36,0.5);
            box-shadow:
              0   0  40px 8px  rgba(251,191,36,0.95),
              0   0  80px 16px rgba(251,191,36,0.55),
             -24px 0  50px 6px  rgba(251,191,36,0.80),
             -70px 0  70px 10px rgba(251,191,36,0.50),
            -140px 0  90px 14px rgba(251,191,36,0.28),
            -240px 0 110px 18px rgba(251,191,36,0.14),
            -380px 0 130px 22px rgba(251,191,36,0.06);
          }
          48% {
            color: #a3e635;
            border-color: rgba(163,230,53,0.8);
            background: rgba(10,18,4,0.97);
            text-shadow: 0 0 24px #a3e635, 0 0 48px rgba(163,230,53,0.5);
            box-shadow:
              0   0  40px 8px  rgba(163,230,53,0.90),
              0   0  80px 16px rgba(163,230,53,0.50),
             -24px 0  50px 6px  rgba(163,230,53,0.75),
             -70px 0  70px 10px rgba(163,230,53,0.45),
            -140px 0  90px 14px rgba(163,230,53,0.25),
            -240px 0 110px 18px rgba(163,230,53,0.12),
            -380px 0 130px 22px rgba(163,230,53,0.05);
          }
          100% {
            left: 70%;
            color: #4ade80;
            border-color: rgba(74,222,128,0.9);
            background: rgba(0,18,8,0.97);
            text-shadow: 0 0 24px #4ade80, 0 0 48px rgba(74,222,128,0.5);
            box-shadow:
              0   0  40px 8px  rgba(74,222,128,0.95),
              0   0  80px 16px rgba(74,222,128,0.55),
             -24px 0  50px 6px  rgba(74,222,128,0.80),
             -70px 0  70px 10px rgba(74,222,128,0.50),
            -140px 0  90px 14px rgba(74,222,128,0.28),
            -240px 0 110px 18px rgba(74,222,128,0.14),
            -380px 0 130px 22px rgba(74,222,128,0.06);
          }
        }

        @keyframes trail-widen {
          0%   { opacity: 0.7; width: 240px; }
          50%  { opacity: 0.5; width: 320px; }
          100% { opacity: 0;   width: 400px; }
        }
      `}</style>

      {/* flying card */}
      <div
        style={{
          position:        "fixed",
          top:             "50%",
          transform:       "translateY(-50%)",
          width:           148,
          height:          104,
          borderRadius:    18,
          border:          "2px solid",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          fontFamily:      "'Courier New', monospace",
          fontWeight:      900,
          fontSize:        "clamp(2.4rem,5vw,4rem)",
          zIndex:          9999,
          pointerEvents:   "none",
          animation:       `token-fly ${TRANSIT_MS}ms cubic-bezier(0.22,1,0.36,1) forwards`,
        }}
      >
        {label}
      </div>
    </>
  );
}

/* ─── token card (in column) ─────────────────────────────────────────── */
function TokenCard({
  order,
  highlight,
  appearing,
}: {
  order:      DisplayOrder;
  highlight:  boolean;
  appearing?: boolean;
}) {
  const [visible, setVisible] = useState(!appearing);

  useEffect(() => {
    if (!appearing) return;
    // fade in after the transit card arrives
    const t = setTimeout(() => setVisible(true), TRANSIT_MS - 200);
    return () => clearTimeout(t);
  }, [appearing]);

  return (
    <div
      className={`flex items-center justify-center rounded-2xl border-2 transition-all duration-700
        ${highlight
          ? "border-green-400 bg-green-950/60 shadow-[0_0_32px_rgba(74,222,128,0.35)]"
          : "border-amber-500/40 bg-black/40"}`}
      style={{
        minWidth:   120,
        minHeight:  96,
        padding:    "12px 20px",
        opacity:    visible ? 1 : 0,
        transition: `opacity 0.5s ease, border-color 0.7s, box-shadow 0.7s`,
      }}
    >
      <span
        className={`font-mono font-black tracking-tight select-none tabular-nums leading-none
          ${highlight ? "text-green-300" : "text-amber-400"}`}
        style={{
          fontSize:   "clamp(2.5rem, 6vw, 5rem)",
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

/* ─── column ──────────────────────────────────────────────────────────── */
function Column({
  title, subtitle, orders, highlight, accentClass, glowColor, newIds,
}: {
  title:       string;
  subtitle:    string;
  orders:      DisplayOrder[];
  highlight:   boolean;
  accentClass: string;
  glowColor:   string;
  newIds:      Set<string>;
}) {
  return (
    <div className="flex flex-col flex-1 min-w-0">
      <div
        className={`rounded-2xl mb-6 px-6 py-5 border ${accentClass}`}
        style={{ boxShadow: `0 0 24px ${glowColor}` }}
      >
        <h2
          className="font-black uppercase tracking-widest text-center"
          style={{ fontSize: "clamp(1.1rem,2.5vw,2rem)", textShadow: `0 0 12px ${glowColor}` }}
        >
          {title}
        </h2>
        <p className="text-center text-xs mt-1 opacity-60 tracking-widest uppercase font-semibold">
          {subtitle}
        </p>
      </div>

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
            <TokenCard
              key={oKey(order)}
              order={order}
              highlight={highlight}
              appearing={newIds.has(oKey(order))}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── main board ──────────────────────────────────────────────────────── */
export default function DisplayBoard() {
  const [data,         setData]         = useState<DisplayData>(DEMO_BASE);
  const [lastFetch,    setLastFetch]    = useState<Date | null>(null);
  const [transitItems, setTransitItems] = useState<TransitItem[]>([]);
  const [newReadyIds,  setNewReadyIds]  = useState<Set<string>>(new Set());
  const [, setTick] = useState(0);

  // refs to detect transitions between polls
  const prevPreparingIds    = useRef<Set<string>>(new Set(DEMO_BASE.preparing.map(oKey)));
  const prevPreparingOrders = useRef<Map<string, DisplayOrder>>(
    new Map(DEMO_BASE.preparing.map(o => [oKey(o), o]))
  );
  const newReadyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyData = useCallback((incoming: DisplayData) => {
    const newPrepIds  = new Set(incoming.preparing.map(oKey));
    const newReadySet = new Set(incoming.ready.map(oKey));

    // detect orders that moved preparing → ready
    const transitioned: TransitItem[] = [];
    for (const id of prevPreparingIds.current) {
      if (!newPrepIds.has(id) && newReadySet.has(id)) {
        const order = prevPreparingOrders.current.get(id);
        if (order) {
          transitioned.push({ key: `${id}~${Date.now()}`, label: tokenLabel(order) });
        }
      }
    }

    prevPreparingIds.current    = newPrepIds;
    prevPreparingOrders.current = new Map(incoming.preparing.map(o => [oKey(o), o]));

    setData(incoming);

    if (transitioned.length > 0) {
      // mark newly-ready cards so they fade in after transit lands
      setNewReadyIds(new Set(transitioned.map(t => t.key.split("~")[0])));
      setTransitItems(prev => [...prev, ...transitioned]);

      if (newReadyTimer.current) clearTimeout(newReadyTimer.current);
      newReadyTimer.current = setTimeout(() => {
        setNewReadyIds(new Set());
        newReadyTimer.current = null;
      }, TRANSIT_MS + 600);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res  = await fetch("/api/display/orders", { cache: "no-store" });
      const json = await res.json() as DisplayData;
      const hasReal = json.preparing.length > 0 || json.ready.length > 0;
      applyData(hasReal ? json : DEMO_BASE);
      setLastFetch(new Date());
    } catch { /* silent retry */ }
  }, [applyData]);

  useEffect(() => {
    fetchOrders();
    const poll  = setInterval(fetchOrders, 5000);
    const clock = setInterval(() => setTick(t => t + 1), 1000);
    return () => { clearInterval(poll); clearInterval(clock); };
  }, [fetchOrders]);

  /* ── demo ── */
  const demoStep    = useRef(0);
  const demoRunning = useRef(false);

  const runDemo = useCallback(() => {
    if (demoRunning.current) return;
    demoRunning.current = true;

    // reset to full demo base first
    const base: DisplayData = {
      preparing: [
        { tokenNumber: "42", status: "preparing", createdAt: "demo-1" },
        { tokenNumber: "43", status: "accepted",  createdAt: "demo-2" },
      ],
      ready: [
        { tokenNumber: "41", status: "ready", createdAt: "demo-3" },
      ],
    };
    prevPreparingIds.current    = new Set(base.preparing.map(oKey));
    prevPreparingOrders.current = new Map(base.preparing.map(o => [oKey(o), o]));
    setData(base);
    setTransitItems([]);
    setNewReadyIds(new Set());

    const steps: Array<() => DisplayData> = [
      // step 0 → 42 moves to ready
      () => ({
        preparing: [{ tokenNumber: "43", status: "accepted", createdAt: "demo-2" }],
        ready:     [
          { tokenNumber: "41", status: "ready",    createdAt: "demo-3" },
          { tokenNumber: "42", status: "ready",    createdAt: "demo-1" },
        ],
      }),
      // step 1 → 43 moves to ready
      () => ({
        preparing: [],
        ready:     [
          { tokenNumber: "41", status: "ready", createdAt: "demo-3" },
          { tokenNumber: "42", status: "ready", createdAt: "demo-1" },
          { tokenNumber: "43", status: "ready", createdAt: "demo-2" },
        ],
      }),
      // step 2 → reset
      () => {
        prevPreparingIds.current    = new Set(base.preparing.map(oKey));
        prevPreparingOrders.current = new Map(base.preparing.map(o => [oKey(o), o]));
        return base;
      },
    ];

    const tick = () => {
      const step = steps[demoStep.current];
      if (!step) { demoStep.current = 0; demoRunning.current = false; return; }
      applyData(step());
      demoStep.current++;
      if (demoStep.current < steps.length) {
        setTimeout(tick, TRANSIT_MS + 800);
      } else {
        demoStep.current    = 0;
        demoRunning.current = false;
      }
    };

    // small pause before first transition
    setTimeout(tick, 400);
  }, [applyData]);

  const removeTransit = useCallback((key: string) => {
    setTransitItems(prev => prev.filter(t => t.key !== key));
  }, []);

  const restoreDemo = useCallback(() => {
    demoRunning.current = true; // block demo while resetting
    setTransitItems([]);
    setNewReadyIds(new Set());
    prevPreparingIds.current    = new Set(DEMO_BASE.preparing.map(oKey));
    prevPreparingOrders.current = new Map(DEMO_BASE.preparing.map(o => [oKey(o), o]));
    setData(DEMO_BASE);
    demoStep.current    = 0;
    demoRunning.current = false;
  }, []);

  const now     = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <main
      className="min-h-screen w-full flex flex-col overflow-hidden select-none"
      style={{ background: "radial-gradient(ellipse at top, #0a0f1a 0%, #000000 70%)", fontFamily: "'Courier New', Courier, monospace" }}
    >
      {/* transit overlays */}
      {transitItems.map(item => (
        <TransitCard key={item.key} label={item.label} onDone={() => removeTransit(item.key)} />
      ))}

      {/* top bar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/5" style={{ background: "rgba(0,0,0,0.6)" }}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-500/30 bg-amber-950/40 flex items-center justify-center">
            <span className="text-amber-400 font-black text-sm tracking-tight">TBC</span>
          </div>
          <div>
            <p className="font-black tracking-widest uppercase text-amber-400" style={{ fontSize: "clamp(0.75rem,1.5vw,1.1rem)", textShadow: "0 0 10px rgba(251,191,36,0.5)" }}>
              The Biryani Canteen
            </p>
            <p className="text-white/30 text-xs tracking-widest uppercase">Order Display</p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-mono font-black text-amber-300 tabular-nums" style={{ fontSize: "clamp(1.2rem,2.5vw,2rem)", textShadow: "0 0 16px rgba(251,191,36,0.6)" }}>
            {timeStr}
          </p>
          {lastFetch && (
            <p className="text-white/25 text-xs font-mono">
              Updated {Math.round((now.getTime() - lastFetch.getTime()) / 1000)}s ago
            </p>
          )}
        </div>
      </div>

      {/* board */}
      <div className="flex flex-1 gap-6 p-6 overflow-hidden">
        <div className="relative flex flex-1 gap-6 w-full">
          <div className="flex-1">
            <Column
              title="Preparing"
              subtitle="Your order is being prepared"
              orders={data.preparing}
              highlight={false}
              accentClass="border-amber-500/40 text-amber-400 bg-amber-950/20"
              glowColor="rgba(251,191,36,0.2)"
              newIds={newReadyIds}
            />
          </div>

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
              newIds={newReadyIds}
            />
          </div>
        </div>
      </div>

      {/* bottom bar */}
      <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between" style={{ background: "rgba(0,0,0,0.7)" }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" style={{ boxShadow: "0 0 8px rgba(74,222,128,0.8)" }} />
          <p className="text-white/30 text-xs font-mono tracking-widest uppercase">
            Auto-refreshes every 5 seconds · Show this screen at the counter
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={restoreDemo}
            className="text-xs font-mono font-black tracking-widest uppercase px-4 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-all duration-300"
            style={{ letterSpacing: "0.15em" }}
          >
            ↺ RESTORE
          </button>
          <button
            onClick={runDemo}
            className="text-xs font-mono font-black tracking-widest uppercase px-4 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-amber-400 hover:border-amber-500/40 transition-all duration-300"
            style={{ letterSpacing: "0.15em" }}
          >
            ▶ DEMO
          </button>
        </div>
      </div>
    </main>
  );
}
