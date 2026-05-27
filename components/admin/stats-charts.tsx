"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  monthlyData: { month: string; revenue: number; count: number }[];
  barberData: { barber: string; count: number; revenue: number }[];
  hourData: { hour: string; count: number }[];
}

const INK = "#18181b";
const INK_DIM = "#71717a";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-zinc-900 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-zinc-600">
          {p.name}: <span className="font-semibold text-zinc-900">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function StatsCharts({ monthlyData, barberData, hourData }: Props) {
  return (
    <div className="space-y-6">
      {/* Monthly revenue */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Venit lunar — ultimele 6 luni</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: INK_DIM, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: INK_DIM, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} width={48} />
              <Tooltip
                content={({ active, payload, label }) => (
                  <ChartTooltip
                    active={active}
                    label={label}
                    payload={payload?.map((p: any) => ({ ...p, name: "Venit", value: `${p.value} LEI` }))}
                  />
                )}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Bar dataKey="revenue" name="Venit" fill={INK} radius={[4, 4, 0, 0]} maxBarSize={52} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Per barber */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Programări per frizer</CardTitle>
          </CardHeader>
          <CardContent>
            {barberData.length === 0 ? (
              <p className="text-sm text-zinc-400 py-10 text-center">Nu există date încă.</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barberData} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: INK_DIM, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis dataKey="barber" type="category" tick={{ fill: INK_DIM, fontSize: 12 }} axisLine={false} tickLine={false} width={110} />
                  <Tooltip
                    content={({ active, payload, label }) => (
                      <ChartTooltip
                        active={active}
                        label={label}
                        payload={payload?.map((p: any) => ({ ...p, name: "Programări" }))}
                      />
                    )}
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  />
                  <Bar dataKey="count" name="Programări" fill={INK} radius={[0, 4, 4, 0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Busy hours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ore aglomerate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hourData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="hour" tick={{ fill: INK_DIM, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: INK_DIM, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <ChartTooltip
                      active={active}
                      label={label}
                      payload={payload?.map((p: any) => ({ ...p, name: "Programări" }))}
                    />
                  )}
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                />
                <Bar dataKey="count" name="Programări" fill={INK_DIM} radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Legacy chart components used by /admin/page.tsx ──────────────────────────

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

import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
} from "recharts";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-zinc-900 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-zinc-600">
          {p.name}: <span className="font-semibold text-zinc-900">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function AppointmentsBarChart({ data }: { data: DailyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis dataKey="day" tick={{ fill: INK_DIM, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: INK_DIM, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.03)" }} />
        <Bar dataKey="appointments" name="Programări" fill={INK} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RevenueLineChart({ data }: { data: DailyData[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis dataKey="day" tick={{ fill: INK_DIM, fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: INK_DIM, fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="revenue" name="Venit (LEI)" stroke={INK} strokeWidth={2} dot={{ fill: INK, r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function StatusPieChart({ data }: { data: StatusData[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload as StatusData;
            return (
              <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs shadow-lg">
                <p style={{ color: d.color }} className="font-semibold">{d.name}: {d.value}</p>
              </div>
            );
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
