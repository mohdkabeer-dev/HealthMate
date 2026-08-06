"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import VitalsChart from "@/components/VitalsChart";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getStatusColor = (status: string) => {
  if (status === "high") return "text-red-600";
  if (status === "low") return "text-yellow-600";
  return "text-green-600";
};

const ReportPage = () => {
  const params = useParams();
  const id = params.id;

  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    const fetchReport = async () => {
      const res = await fetch(`${API_URL}/report/${id}`, {
        credentials: "include",
      });

      const data = await res.json();
      setReport(data.report);
    };

    if (id) fetchReport();
  }, [id]);

  if (!report) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* TITLE */}
      <div className="bg-white shadow-md rounded-xl p-5">
        <h1 className="text-2xl font-bold mb-2">
          {report.report_type}
        </h1>
        <p className="text-gray-600">{report.summary}</p>
      </div>

      {/* VITALS */}
      <div className="bg-white shadow-md rounded-xl p-5">
        <h2 className="text-xl font-semibold mb-4">Vitals</h2>

        {report.vitals?.length === 0 ? (
          <p className="text-gray-500">No vitals detected</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {report.vitals.map((v: any, i: number) => (
              <div
                key={i}
                className="border rounded-lg p-3 flex flex-col"
              >
                <span className="font-medium">{v.name}</span>
                <span className="text-lg">
                  {v.value} {v.unit}
                </span>
                <span className={`text-sm ${getStatusColor(v.status)}`}>
                  {v.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RISK FLAGS */}
      <div className="bg-white shadow-md rounded-xl p-5">
        <h2 className="text-xl font-semibold mb-4">Risk Flags</h2>

        {report.risk_flags?.length === 0 ? (
          <p className="text-green-600 font-medium">
            ✅ No major risks detected
          </p>
        ) : (
          <ul className="space-y-2">
            {report.risk_flags.map((r: string, i: number) => (
              <li
                key={i}
                className="bg-red-100 text-red-700 p-3 rounded-md"
              >
                {r}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* RECOMMENDATIONS */}
      <div className="bg-white shadow-md rounded-xl p-5">
        <h2 className="text-xl font-semibold mb-4">Recommendations</h2>

        {report.recommendations?.length === 0 ? (
          <p className="text-gray-500">No recommendations</p>
        ) : (
          <ul className="space-y-2">
            {report.recommendations.map((rec: string, i: number) => (
              <li
                key={i}
                className="bg-blue-100 text-blue-700 p-3 rounded-md"
              >
                {rec}
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
};

export default ReportPage;