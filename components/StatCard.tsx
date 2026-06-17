"use client";

import { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: ReactNode;
  hint?: string;
  color?: string;
};

export default function StatCard({ label, value, icon, hint, color = "rose" }: StatCardProps) {
  const colors: Record<string, string> = {
    rose: "from-rose-50 to-rose-100 text-rose-600",
    blue: "from-blue-50 to-blue-100 text-blue-600",
    green: "from-green-50 to-green-100 text-green-600",
    yellow: "from-yellow-50 to-yellow-100 text-yellow-600",
    purple: "from-purple-50 to-purple-100 text-purple-600",
    indigo: "from-indigo-50 to-indigo-100 text-indigo-600",
  };
  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
          {hint && <p className="text-xs text-gray-400 mt-2">{hint}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
