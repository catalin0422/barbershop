import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import { StatsCharts } from "@/components/admin/stats-charts";
import { TrendingUp, Calendar, Users, Banknote } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminStatsPage() {
  const supabase = createClient();

  const { data: raw } = await supabase
    .from("appointments")
    .select(
      "id, start_time, status, barber:profiles!appointments_barber_id_fkey(full_name), service:services(price, name)",
    )
    .neq("status", "cancelled")
    .order("start_time", { ascending: true });

  const appointments = (raw ?? []) as unknown as {
    id: string;
    start_time: string;
    status: string;
    barber: { full_name: string } | null;
    service: { price: number; name: string } | null;
  }[];

  // Summary stats
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const totalRevenue = appointments.reduce((s, a) => s + Number(a.service?.price ?? 0), 0);
  const thisMonthRevenue = appointments
    .filter((a) => new Date(a.start_time) >= monthStart)
    .reduce((s, a) => s + Number(a.service?.price ?? 0), 0);
  const lastMonthRevenue = appointments
    .filter((a) => {
      const d = new Date(a.start_time);
      return d >= lastMonthStart && d < monthStart;
    })
    .reduce((s, a) => s + Number(a.service?.price ?? 0), 0);
  const avgRevenue = appointments.length > 0 ? totalRevenue / appointments.length : 0;

  // Monthly revenue — last 6 months
  const monthlyMap = new Map<string, { revenue: number; count: number }>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleDateString("ro-RO", { month: "short", year: "2-digit" });
    monthlyMap.set(key, { revenue: 0, count: 0 });
  }
  appointments.forEach((a) => {
    const d = new Date(a.start_time);
    const key = d.toLocaleDateString("ro-RO", { month: "short", year: "2-digit" });
    if (monthlyMap.has(key)) {
      const cur = monthlyMap.get(key)!;
      monthlyMap.set(key, {
        revenue: cur.revenue + Number(a.service?.price ?? 0),
        count: cur.count + 1,
      });
    }
  });
  const monthlyData = Array.from(monthlyMap.entries()).map(([month, v]) => ({
    month,
    ...v,
  }));

  // Per barber
  const barberMap = new Map<string, { count: number; revenue: number }>();
  appointments.forEach((a) => {
    const name = a.barber?.full_name ?? "Necunoscut";
    const cur = barberMap.get(name) ?? { count: 0, revenue: 0 };
    barberMap.set(name, {
      count: cur.count + 1,
      revenue: cur.revenue + Number(a.service?.price ?? 0),
    });
  });
  const barberData = Array.from(barberMap.entries())
    .map(([barber, v]) => ({ barber, ...v }))
    .sort((a, b) => b.count - a.count);

  // Busy hours
  const hourMap = new Map<number, number>();
  for (let h = 8; h <= 20; h++) hourMap.set(h, 0);
  appointments.forEach((a) => {
    const h = new Date(a.start_time).getHours();
    hourMap.set(h, (hourMap.get(h) ?? 0) + 1);
  });
  const hourData = Array.from(hourMap.entries())
    .map(([hour, count]) => ({
      hour: `${String(hour).padStart(2, "0")}:00`,
      count,
    }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Venit total"
          value={formatPrice(totalRevenue)}
          icon={Banknote}
        />
        <StatCard
          label="Luna aceasta"
          value={formatPrice(thisMonthRevenue)}
          sub={lastMonthRevenue > 0 ? `Luna trecută: ${formatPrice(lastMonthRevenue)}` : undefined}
          icon={TrendingUp}
        />
        <StatCard
          label="Total programări"
          value={String(appointments.length)}
          icon={Calendar}
        />
        <StatCard
          label="Medie / programare"
          value={formatPrice(Math.round(avgRevenue))}
          icon={Users}
        />
      </div>

      {/* Charts */}
      <StatsCharts
        monthlyData={monthlyData}
        barberData={barberData}
        hourData={hourData}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-gold-400" />
      </CardHeader>
      <CardContent>
        <div className="font-display text-2xl text-white">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}
