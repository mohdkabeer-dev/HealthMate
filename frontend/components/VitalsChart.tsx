"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function VitalsChart({ data }: any) {
  if (!data || data.length === 0) {
    return <p className="text-gray-500">No data for chart</p>;
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="sugar" />
          <Line type="monotone" dataKey="weight" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}