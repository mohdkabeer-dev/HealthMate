"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaCircle } from "react-icons/fa";
import {
  FaHeartbeat,
  FaExclamationTriangle,
  FaCheckCircle,
  FaLightbulb,
  FaChartLine,
} from "react-icons/fa";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Vital {
  name: string;
  value: string;
  status: string;
  interpretation?: string;
}

interface Insight {
  _id: string;
  reportTitle: string;
  summary: string;
  vitals: Vital[];
  risk_flags: string[];

  report_type?: string;
  date?: string;
  key_findings?: string[];
  recommendations?: string[];
}

export default function Insights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("new");

  useEffect(() => {
    if (insights.length > 0 && !openId) {
      setOpenId(insights[0]._id);
    }
  }, [insights]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch(`${API_URL}/report/insights`, {
          credentials: "include",
        });

        const text = await res.text(); // 👈 ALWAYS SAFE

        console.log("RAW RESPONSE:", text);

        let data;

        try {
          data = JSON.parse(text);
        } catch (err) {
          console.error("❌ Not JSON:", text);
          return;
        }

        console.log("API Response:", data);

        setInsights(data.insights || []);

      } catch (err) {
        console.error("Fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) return <p className="text-center py-8">Loading insights...</p>;

  // 🔥 HEALTH SCORE CALCULATION
  const calculateHealthScore = (vitals: any[]) => {
    if (!vitals || vitals.length === 0) return 100;

    let score = 100;

    vitals.forEach((v) => {
      if (v.status === "high" || v.status === "low") {
        score -= 8; // penalty
      }
    });

    return Math.max(score, 50); // minimum cap
  };

  // 🔥 CHART DATA
  const getChartData = (vitals: any[] = []) => {
    if (!Array.isArray(vitals) || vitals.length === 0) {
      return [
        { name: "Normal", value: 1 },
        { name: "Abnormal", value: 0 },
      ];
    }

    let normal = 0;
    let abnormal = 0;

    vitals.forEach((v) => {
      if (v?.status === "normal") normal++;
      else if (v?.status) abnormal++;
    });

    // if everything somehow zero, force a tiny slice
    if (normal === 0 && abnormal === 0) {
      return [
        { name: "Normal", value: 1 },
        { name: "Abnormal", value: 0 },
      ];
    }

    return [
      { name: "Normal", value: normal },
      { name: "Abnormal", value: abnormal },
    ];
  };
  // 🔮 PREDICTION ENGINE (simple but powerful)
  const getHealthPrediction = (vitals: any[], risks: string[]) => {
    const abnormalCount = vitals.filter(
      (v) => v.status === "high" || v.status === "low"
    ).length;

    const riskCount = risks?.length || 0;

    if (risks.length > 0 || abnormalCount >= 3) {
      return {
        level: "high",
        message: "High risk detected. Medical consultation recommended.",
      };
    }

    if (abnormalCount > 0) {
      return {
        level: "medium",
        message: "Some abnormalities detected. Monitor regularly.",
      };
    }

    return {
      level: "low",
      message: "All vitals look stable. Maintain your lifestyle.",
    };
  };


  const filteredInsights = insights
    .filter((ins) =>
      (ins.reportTitle || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter((ins) => {
      if (filter === "all") return true;

      const abnormal = ins.vitals?.some(
        (v) => v.status === "high" || v.status === "low"
      );

      return filter === "risk" ? abnormal : !abnormal;
    })
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;

      return sort === "new" ? dateB - dateA : dateA - dateB;
    });

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-3xl font-bold">AI Health Insights</h2>
      {insights.length === 0 && !loading && (
        <p className="text-gray-500">No insights available</p>
      )}


      {/* 🔍 SEARCH + FILTER BAR */}
      <div className="flex items-center gap-3 bg-white/70 backdrop-blur-md border border-gray-100 rounded-3xl px-4 py-3 shadow-sm">

        {/* 🔍 SEARCH (slightly reduced dominance) */}
        <div className="flex items-center flex-[2] bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-gray-300">
          <FaChartLine className="text-gray-400 text-sm mr-3" />

          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none text-sm bg-transparent text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* 🎯 FILTER TABS */}
        <div className="flex items-center bg-gray-100 rounded-2xl p-1">

          {["all", "normal", "risk"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as "all" | "normal" | "risk")}
              className={`px-4 py-1.5 text-sm rounded-xl transition-all capitalize ${filter === type
                ? "bg-white shadow-sm text-gray-900 font-medium"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {type === "risk" ? "High Risk" : type}
            </button>
          ))}

        </div>

        {/* 🔽 SORT (integrated look) */}
        <div className="flex items-center gap-2 ml-auto">

          <span className="text-xs text-gray-400 hidden md:block">Sort</span>

          <div className="flex bg-gray-100 rounded-2xl p-1">

            {/* NEWEST */}
            <button
              onClick={() => setSort("new")}
              className={`px-4 py-1.5 text-sm rounded-xl transition-all ${sort === "new"
                ? "bg-white shadow-sm text-gray-900 font-medium"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Newest
            </button>

            {/* OLDEST */}
            <button
              onClick={() => setSort("old")}
              className={`px-4 py-1.5 text-sm rounded-xl transition-all ${sort === "old"
                ? "bg-white shadow-sm text-gray-900 font-medium"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Oldest
            </button>

          </div>

        </div>
      </div>

      {filteredInsights.map((ins) => {
        const isOpen = openId === ins._id;
        return (
          <div
            key={ins._id}
            className="border border-gray-100 rounded-2xl bg-white shadow-sm overflow-hidden my-4"
          >
            {/* HEADER */}
            <div
              onClick={() => setOpenId(isOpen ? null : ins._id)}
              className="cursor-pointer p-4 flex justify-between items-center hover:bg-gray-50 transition"
            >
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">
                  {ins.reportTitle &&
                    !ins.reportTitle.toLowerCase().includes("screenshot")
                    ? ins.reportTitle
                    : ins.report_type || "Medical Report"}
                </h3>

                <p className="text-xs text-gray-400">
                  {ins.date
                    ? new Date(ins.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                    : "No date available"}
                </p>
              </div>

              {/* 🔥 Chevron (rotates smoothly) */}
              <FaChevronDown
                className={`text-gray-400 text-sm transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                  }`}
              />
            </div>

            {/* CONTENT */}
            {isOpen && (
              <div className="p-5 border-t border-gray-100 space-y-6">

                {/* 🧠 KEY FINDINGS */}
                {Array.isArray(ins.key_findings) && ins.key_findings.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">
                      Key Findings
                    </p>
                    <ul className="space-y-1">

                      {ins.key_findings.map((f, i) => (
                        <li key={i} className="text-gray-700 text-sm">
                          • {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 📊 VITAL STATUS (ONLY ONE CLEAN VERSION) */}
                {(() => {
                  const normal = ins.vitals.filter(v => v.status === "normal").length;
                  const abnormal = ins.vitals.length - normal;
                  const total = ins.vitals.length || 1;

                  const normalPercent = (normal / total) * 100;
                  const abnormalPercent = (abnormal / total) * 100;

                  return (
                    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaHeartbeat className="text-green-500" />
                          <p className="text-sm font-medium">Vitals Status</p>
                        </div>

                        <p className="text-sm text-gray-500">
                          {normal} Normal • {abnormal} Abnormal
                        </p>
                      </div>

                      <div className="w-full h-2 rounded-full overflow-hidden flex">
                        <div
                          className="bg-green-500"
                          style={{ width: `${normalPercent}%` }}
                        />
                        <div
                          className="bg-red-500"
                          style={{ width: `${abnormalPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* 💊 VITAL CARDS */}
                <div className="grid md:grid-cols-3 gap-5">
                  {ins.vitals.map((v, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition"
                    >
                      <p className="text-xs text-gray-400 uppercase tracking-wide">
                        {v.name}
                      </p>

                      <p className="text-2xl font-semibold mt-1">{v.value}</p>

                      <span
                        className={`inline-block mt-2 text-xs px-2 py-1 rounded-full font-medium ${v.status === "high"
                          ? "bg-red-100 text-red-600"
                          : v.status === "low"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-green-100 text-green-600"
                          }`}
                      >
                        {v.status}
                      </span>

                      <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                        {v.interpretation}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 🚨 RISK FLAGS */}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    Risk Alerts
                  </p>

                  {ins.risk_flags?.length > 0 ? (
                    <div className="space-y-2">
                      {ins.risk_flags.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                        >
                          <FaExclamationTriangle />
                          {r}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                      <FaCheckCircle />
                      No major risks detected
                    </div>
                  )}
                </div>

                {/* 💡 RECOMMENDATIONS */}
                <div className="space-y-3">
                  {Array.isArray(ins.recommendations) && ins.recommendations.length > 0 ? (
                    ins.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-700"
                      >
                        <FaLightbulb className="text-yellow-500 mt-1" />
                        {rec}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">No recommendations available</p>
                  )}
                </div>

                {/* 🔮 AI PREDICTION */}
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-2">
                    AI Prediction
                  </p>

                  {(() => {
                    const prediction = getHealthPrediction(
                      ins.vitals || [],
                      ins.risk_flags || []
                    );

                    return (
                      <div
                        className={`p-4 rounded-lg border ${prediction.level === "high"
                          ? "bg-red-100 border-red-300 text-red-700"
                          : prediction.level === "medium"
                            ? "bg-yellow-100 border-yellow-300 text-yellow-700"
                            : "bg-green-100 border-green-300 text-green-700"
                          }`}
                      >
                        <strong className="capitalize">
                          {prediction.level} Risk:
                        </strong>{" "}
                        {prediction.message}
                      </div>
                    );
                  })()}
                </div>

                {/* 📝 SUMMARY */}
                <div>
                  <p className="text-sm text-gray-500">Summary</p>
                  <p className="text-gray-700">{ins.summary}</p>
                </div>

              </div>
            )}
          </div>
        );
      })}
    </main>
  );
}

