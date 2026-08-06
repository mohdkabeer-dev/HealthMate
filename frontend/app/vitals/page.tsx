"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Swal from "sweetalert2";
import VitalsChart from "@/components/VitalsChart";

import {
  FaTrash,
  FaHeartbeat,
  FaTint,
  FaWeight,
  FaPlus,
  FaChartLine,
} from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Vital {
  _id: string;
  bp?: string;
  sugar?: string;
  weight?: string;
  note?: string;
  date: string;
}

export default function Vitals() {
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const [form, setForm] = useState({
    bp: "",
    sugar: "",
    weight: "",
    note: "",
  });

  // ✅ FIX: define BEFORE usage
  const groupVitals = (vitals: Vital[]) => {
    const groups: Record<string, Vital[]> = {};

    vitals.forEach((v) => {
      const date = new Date(v.date);
      const key = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (!groups[key]) groups[key] = [];
      groups[key].push(v);
    });

    return groups;
  };

  // ✅ Chart Data
  const parseVitalsForChart = (vitals: Vital[]) => {
    return vitals.map((v) => ({
      date: new Date(v.date).toLocaleDateString(),
      sugar: v.sugar ? Number(v.sugar) : null,
      weight: v.weight ? Number(v.weight) : null,
    }));
  };

  // ✅ Trend Logic
  const getTrend = (values: number[]) => {
    if (values.length < 2) return null;
    const last = values[0];
    const prev = values[1];
    if (last > prev) return "up";
    if (last < prev) return "down";
    return "same";
  };

  // ✅ KPI
  const getKPI = () => {
    if (!vitals.length) return null;

    const sugars = vitals.filter((v) => v.sugar).map((v) => Number(v.sugar));
    const weights = vitals.filter((v) => v.weight).map((v) => Number(v.weight));

    const avgSugar =
      sugars.length > 0
        ? (sugars.reduce((a, b) => a + b, 0) / sugars.length).toFixed(1)
        : null;

    const avgWeight =
      weights.length > 0
        ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)
        : null;

    const sugarTrend = getTrend(sugars);

    return { avgSugar, avgWeight, sugarTrend };
  };

  const kpi = getKPI();

  // ✅ Fetch
  const fetchVitals = async () => {
    try {
      const res = await fetch(`${API_URL}/vitals/myvitals`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch vitals");

      const data = await res.json();
      setVitals(data.vitals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: CALL API
  useEffect(() => {
    fetchVitals();
  }, []);

  // ✅ useMemo AFTER function exists
  const groupedVitals = useMemo(() => groupVitals(vitals), [vitals]);

  // ✅ FIX: open first group correctly
  useEffect(() => {
    if (vitals.length > 0 && !openGroup) {
      const firstGroup = Object.keys(groupedVitals)[0];
      setOpenGroup(firstGroup);
    }
  }, [vitals, groupedVitals, openGroup]);

  // ✅ Add
  const handleAdd = async () => {
    if (!form.bp && !form.sugar && !form.weight)
      return Swal.fire("Error", "At least one vital is required", "error");

    try {
      const res = await fetch(`${API_URL}/vitals/add`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setVitals([data.vitals, ...vitals]);

      setForm({ bp: "", sugar: "", weight: "", note: "" });
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    }
  };

  // ✅ Delete
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete?",
      text: "This cannot be undone",
      icon: "warning",
      showCancelButton: true,
    });

    if (!result.isConfirmed) return;

    await fetch(`${API_URL}/vitals/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    setVitals(vitals.filter((v) => v._id !== id));
  };

  if (loading) {
    return <p className="text-center py-8">Loading vitals...</p>;
  }
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">

      <h2 className="text-2xl font-bold">Your Vitals</h2>

      {/* KPI */}
      {kpi && (
        <div className="grid md:grid-cols-3 gap-4">

          {/* Sugar */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Sugar</p>
              <p className={`text-xl font-semibold ${Number(kpi.avgSugar) > 120
                ? "text-red-600"
                : "text-green-600"
                }`}>
                {kpi.avgSugar || "--"}
              </p>
              <p className="text-xs text-gray-400">
                {kpi.sugarTrend === "up" && "⬆ Increasing"}
                {kpi.sugarTrend === "down" && "⬇ Improving"}
                {kpi.sugarTrend === "same" && "➖ Stable"}
              </p>
            </div>
            <FaTint className="text-green-400 text-lg" />
          </div>

          {/* Weight */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Weight</p>
              <p className="text-xl font-semibold text-blue-600">
                {kpi.avgWeight || "--"}
              </p>
            </div>
            <FaWeight className="text-blue-400 text-lg" />
          </div>

          {/* Status */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Health Status</p>
              <p className={`font-semibold flex items-center gap-2 ${Number(kpi.avgSugar) > 120
                ? "text-red-600"
                : "text-green-600"
                }`}>
                <FaHeartbeat />
                {Number(kpi.avgSugar) > 120
                  ? "Needs Attention"
                  : "Stable"}
              </p>
            </div>
          </div>

        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="md:col-span-2 space-y-6">

          {/* FORM */}
          <Card className="rounded-2xl shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaPlus /> Add New Vital
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">

              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-200"
                placeholder="BP"
                value={form.bp}
                onChange={(e) =>
                  setForm({ ...form, bp: e.target.value })
                }
              />

              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-200"
                placeholder="Sugar"
                value={form.sugar}
                onChange={(e) =>
                  setForm({ ...form, sugar: e.target.value })
                }
              />

              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-200"
                placeholder="Weight"
                value={form.weight}
                onChange={(e) =>
                  setForm({ ...form, weight: e.target.value })
                }
              />

              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-200"
                placeholder="Note"
                value={form.note}
                onChange={(e) =>
                  setForm({ ...form, note: e.target.value })
                }
              />

              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl"
                onClick={handleAdd}
              >
                <FaPlus className="mr-2" />
                Add Vitals
              </Button>

            </CardContent>
          </Card>

          {/* CHART */}
          {vitals.length > 0 && (
            <Card className="rounded-2xl shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaChartLine /> Vitals Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VitalsChart data={parseVitalsForChart(vitals)} />
              </CardContent>
            </Card>
          )}

        </div>

        {/* RIGHT */}
        <div className="space-y-4 sticky top-6 h-[80vh] overflow-y-auto pr-2">

          <h3 className="font-semibold text-gray-800">
            Vitals History
          </h3>

          {Object.entries(groupedVitals).map(([group, items], index) => {
            const isOpen = openGroup === group || (openGroup === null && index === 0);

            return (
              <div
                key={group}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm"
              >
                {/* HEADER */}
                <div
                  onClick={() => setOpenGroup(isOpen ? null : group)}
                  className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-gray-50 rounded-t-2xl"
                >
                  <p className="text-sm font-medium text-gray-700">
                    {group} ({items.length})
                  </p>

                  <span
                    className={`text-gray-400 transition ${isOpen ? "rotate-180" : ""
                      }`}
                  >
                    ▼
                  </span>
                </div>

                {/* BODY */}
                {isOpen && (
                  <div className="p-3 space-y-3 border-t border-gray-100 max-h-[350px] overflow-y-auto">

                    {items.map((v) => (
                      <div
                        key={v._id}
                        className="relative p-3 border border-gray-100 rounded-xl hover:shadow-sm transition"
                      >
                        {/* DATE */}
                        <p className="text-xs text-gray-400">
                          {new Date(v.date).toLocaleDateString()}
                        </p>

                        {/* VITALS */}
                        <div className="flex gap-2 mt-2 flex-wrap">

                          {v.bp && (
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {v.bp}
                            </span>
                          )}

                          {v.sugar && (
                            <span
                              className={`px-2 py-1 rounded text-xs ${Number(v.sugar) > 120
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-600"
                                }`}
                            >
                              {v.sugar}
                            </span>
                          )}

                          {v.weight && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                              {v.weight}
                            </span>
                          )}

                        </div>

                        {/* NOTE */}
                        {v.note && (
                          <p className="text-xs text-gray-500 mt-1">
                            {v.note}
                          </p>
                        )}

                        {/* DELETE */}
                        <button
                          onClick={() => handleDelete(v._id)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-md"
                        >
                          <FaTrash className="text-[10px]" />
                        </button>

                      </div>
                    ))}

                  </div>
                )}
              </div>
            );
          })}

        </div>

      </div>

    </main>
  );
}