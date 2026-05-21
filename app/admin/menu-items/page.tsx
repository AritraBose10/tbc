"use client";

import { useEffect, useState, useMemo } from "react";

type AdminMenuItem = {
  petpoojaId: string;
  name: string;
  price: number;
  isAvailable: boolean;
  categoryId: string;
  categoryName: string;
};

export default function AdminMenuItemsPage() {
  const [items, setItems] = useState<AdminMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/menu-items")
      .then((r) => {
        if (r.status === 403) throw new Error("Access denied. Admin only.");
        return r.json();
      })
      .then((data: AdminMenuItem[]) => setItems(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const cats: string[] = [];
    for (const item of items) {
      if (item.categoryName && !seen.has(item.categoryName)) {
        seen.add(item.categoryName);
        cats.push(item.categoryName);
      }
    }
    return ["All", ...cats];
  }, [items]);

  const visibleItems = useMemo(() => {
    return activeCategory === "All"
      ? items
      : items.filter((i) => i.categoryName === activeCategory);
  }, [items, activeCategory]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function patchAvailability(ids: string[], available: boolean) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/menu-items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_ids: ids, available }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setItems((prev) =>
        prev.map((item) =>
          ids.includes(item.petpoojaId) ? { ...item, isAvailable: available } : item
        )
      );
      setSelected(new Set());
      showToast(`${ids.length} item(s) turned ${available ? "ON" : "OFF"}`);
    } catch {
      showToast("Error updating items");
    } finally {
      setSaving(false);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    const allIds = visibleItems.map((i) => i.petpoojaId);
    const allSelected = allIds.every((id) => selected.has(id));
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        allIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        allIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }

  async function toggleSingleItem(item: AdminMenuItem) {
    await patchAvailability([item.petpoojaId], !item.isAvailable);
  }

  const allVisibleSelected =
    visibleItems.length > 0 &&
    visibleItems.every((i) => selected.has(i.petpoojaId));

  const categoryAvailability = (cat: string) => {
    const catItems = items.filter((i) => i.categoryName === cat);
    const on = catItems.filter((i) => i.isAvailable).length;
    return { on, total: catItems.length };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF0]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#A31621]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF0]">
        <p className="text-red-600 font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">Dashboard</p>
          <h1 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Menu Item ON / OFF
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            className="text-xs border border-gray-300 rounded px-4 py-2 font-semibold text-gray-600 hover:bg-gray-50"
            disabled
          >
            Addon On/Off
          </button>
          <button
            className="text-xs border border-gray-300 rounded px-4 py-2 font-semibold text-gray-600 hover:bg-gray-50"
            disabled
          >
            Store On/Off
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Bulk action bar */}
        <div className="bg-white rounded-lg border border-red-300 flex items-center justify-between px-5 py-3 mb-4">
          <span className="text-sm text-gray-600">
            {selected.size > 0
              ? `${selected.size} item(s) selected — update availability`
              : "Select item(s) using the check box and update stock availability here"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => selected.size > 0 && patchAvailability(Array.from(selected), false)}
              disabled={saving || selected.size === 0}
              className="px-5 py-1.5 bg-gray-700 text-white text-sm font-bold rounded disabled:opacity-40 hover:bg-gray-800"
            >
              OFF
            </button>
            <button
              onClick={() => selected.size > 0 && patchAvailability(Array.from(selected), true)}
              disabled={saving || selected.size === 0}
              className="px-5 py-1.5 bg-[#A31621] text-white text-sm font-bold rounded disabled:opacity-40 hover:bg-red-800"
            >
              ON
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Category sidebar */}
          <div className="w-56 flex-shrink-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Categories
              </span>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                if (cat === "All") {
                  return (
                    <button
                      key="All"
                      onClick={() => setActiveCategory("All")}
                      className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between border-b border-gray-50 transition-colors ${
                        isActive
                          ? "bg-red-50 text-[#A31621] font-bold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>All</span>
                      <span className="text-xs text-gray-400">{items.length}</span>
                    </button>
                  );
                }
                const { on, total } = categoryAvailability(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between border-b border-gray-50 transition-colors ${
                      isActive
                        ? "bg-red-50 text-[#A31621] font-bold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="truncate mr-2">{cat}</span>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                      {on}/{total}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items panel */}
          <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-12 px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 accent-[#A31621]"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                  <th className="w-24 px-4 py-3 text-center font-semibold text-gray-600">Price</th>
                  <th className="w-28 px-4 py-3 text-center font-semibold text-gray-600">
                    Available
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400 text-sm">
                      No items
                    </td>
                  </tr>
                )}
                {visibleItems.map((item) => (
                  <tr
                    key={item.petpoojaId}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      selected.has(item.petpoojaId) ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(item.petpoojaId)}
                        onChange={() => toggleSelect(item.petpoojaId)}
                        className="w-4 h-4 rounded border-gray-300 accent-[#A31621]"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {item.price > 0 ? `₹${item.price}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleSingleItem(item)}
                        disabled={saving}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                          item.isAvailable ? "bg-green-500" : "bg-gray-300"
                        }`}
                        title={item.isAvailable ? "Click to turn OFF" : "Click to turn ON"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            item.isAvailable ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
