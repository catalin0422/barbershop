"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DailyData {
  day: string;
  appointments: number;
  revenue: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

const GOLD = "#d4af37";
const COLORS = {
  pending: "#f59e0b",
  confirmed: "#d4af37",
  completed: "#10b981",
  cancelled: "#ef4444",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gold-500/20 bg-card px-3 py-2 text-xs shadow-xl">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color ?? GOLD }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function AppointmentsBarChart({ data }: { data: DailyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="day" tick={{ fill: "#8a7a6a", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#8a7a6a", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(212,175,55,0.05)" }} />
        <Bar dataKey="appointments" name="Programări" fill={GOLD} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RevenueLineChart({ data }: { data: DailyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="day" tick={{ fill: "#8a7a6a", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#8a7a6a", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="revenue"
          name="Venit (LEI)"
          stroke={GOLD}
          strokeWidth={2}
          dot={{ fill: GOLD, r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function StatusPieChart({ data }: { data: StatusData[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as StatusData;
            return (
              <div className="rounded-lg border border-gold-500/20 bg-card px-3 py-2 text-xs shadow-xl">
                <p style={{ color: d.color }} className="font-semibold">
                  {d.name}: {d.value}
                </p>
              </div>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
