import {
  Calendar,
  CheckCircle2,
  Clock,
  Hourglass,
  TrendingUp,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppointmentsBarChart, RevenueLineChart, StatusPieChart } from "@/components/admin/stats-charts";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import type { AppointmentStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

async function loadStats() {
  const supabase = createClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  // Last 30 days for charts
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [todays, all, recent, last30] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, status")
      .gte("start_time", startOfDay.toISOString())
      .lt("start_time", endOfDay.toISOString()),
    supabase.from("appointments").select("id, status"),
    supabase
      .from("appointments")
      .select(
        "id, client_name, client_phone, start_time, status, barber:profiles!appointments_barber_id_fkey(full_name), service:services(name, price)",
      )
      .order("start_time", { ascending: false })
      .limit(8),
    supabase
      .from("appointments")
      .select("start_time, status, service:services(price)")
      .gte("start_time", thirtyDaysAgo.toISOString())
      .neq("status", "cancelled"),
  ]);

  const counts = (rows: { status: AppointmentStatus }[] | null) =>
    (rows ?? []).reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {});

  // Build daily chart data (last 14 days shown in chart)
  const dailyMap = new Map<string, { appointments: number; revenue: number }>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
    dailyMap.set(key, { appointments: 0, revenue: 0 });
  }
  for (const apt of last30.data ?? []) {
    const d = new Date((apt as any).start_time);
    const key = d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
    if (dailyMap.has(key)) {
      const entry = dailyMap.get(key)!;
      entry.appointments += 1;
      entry.revenue += Number((apt as any).service?.price ?? 0);
    }
  }
  const dailyData = Array.from(dailyMap.entries()).map(([day, v]) => ({
    day,
    ...v,
  }));

  const totalRevenue = (all.data ?? []).reduce((sum, a: any) => {
    if (a.status === "completed") return sum;
    return sum;
  }, 0);

  return {
    today: todays.data ?? [],
    todayCounts: counts(todays.data),
    allCounts: counts(all.data),
    totalCount: all.data?.length ?? 0,
    recent: recent.data ?? [],
    dailyData,
  };
}

export default async function AdminOverviewPage() {
  const { todayCounts, allCounts, totalCount, today, recent, dailyData } =
    await loadStats();

  const stats = [
    { label: "Programări astăzi", value: today.length, icon: Calendar },
    { label: "Pending azi", value: todayCounts.pending ?? 0, icon: Hourglass },
    { label: "Confirmate azi", value: todayCounts.confirmed ?? 0, icon: CheckCircle2 },
    { label: "Total all-time", value: totalCount, icon: TrendingUp },
  ];

  const pieData = [
    { name: "Pending", value: allCounts.pending ?? 0, color: "#f59e0b" },
    { name: "Confirmed", value: allCounts.confirmed ?? 0, color: "#d4af37" },
    { name: "Completed", value: allCounts.completed ?? 0, color: "#10b981" },
    { name: "Cancelled", value: allCounts.cancelled ?? 0, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{label}</CardDescription>
              <Icon className="h-4 w-4 text-gold-400" />
            </CardHeader>
            <CardContent>
              <div className="font-display text-3xl">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Programări / zi</CardTitle>
            <CardDescription>Ultimele 14 zile</CardDescription>
          </CardHeader>
          <CardContent>
            <AppointmentsBarChart data={dailyData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuție statusuri</CardTitle>
            <CardDescription>Toate programările</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <>
                <StatusPieChart data={pieData} />
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 justify-center">
                  {pieData.map((d) => (
                    <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ background: d.color }} />
                      {d.name} ({d.value})
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[200px] grid place-items-center text-sm text-muted-foreground">
                Nicio programare încă
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Venit / zi (RON)</CardTitle>
          <CardDescription>Ultimele 14 zile (servicii confirmate + finalizate)</CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueLineChart data={dailyData} />
        </CardContent>
      </Card>

      {/* Recent activity table */}
      <Card>
        <CardHeader>
          <CardTitle>Activitate recentă</CardTitle>
          <CardDescription>Ultimele 8 programări</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Frizer</TableHead>
                <TableHead>Serviciu</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Preț</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    Nu există programări încă.
                  </TableCell>
                </TableRow>
              )}
              {recent.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{r.client_name}</div>
                    <div className="text-xs text-muted-foreground">{r.client_phone}</div>
                  </TableCell>
                  <TableCell>{r.barber?.full_name ?? "—"}</TableCell>
                  <TableCell>{r.service?.name ?? "—"}</TableCell>
                  <TableCell>
                    {new Date(r.start_time).toLocaleString("ro-RO", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {r.service ? formatPrice(Number(r.service.price)) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const map: Record<AppointmentStatus, { variant: any; label: string }> = {
    pending: { variant: "warning", label: "Pending" },
    confirmed: { variant: "default", label: "Confirmed" },
    completed: { variant: "success", label: "Completed" },
    cancelled: { variant: "destructive", label: "Cancelled" },
  };
  const conf = map[status];
  return <Badge variant={conf.variant}>{conf.label}</Badge>;
}
