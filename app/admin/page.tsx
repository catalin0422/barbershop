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

  const [todays, all, recent] = await Promise.all([
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
  ]);

  const counts = (rows: { status: AppointmentStatus }[] | null) =>
    (rows ?? []).reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {});

  return {
    today: todays.data ?? [],
    todayCounts: counts(todays.data),
    allCounts: counts(all.data),
    totalCount: all.data?.length ?? 0,
    recent: recent.data ?? [],
  };
}

export default async function AdminOverviewPage() {
  const { todayCounts, allCounts, totalCount, today, recent } =
    await loadStats();

  const stats = [
    {
      label: "Programări astăzi",
      value: today.length,
      icon: Calendar,
    },
    {
      label: "Pending",
      value: todayCounts.pending ?? 0,
      icon: Hourglass,
    },
    {
      label: "Confirmate",
      value: todayCounts.confirmed ?? 0,
      icon: CheckCircle2,
    },
    {
      label: "Total all-time",
      value: totalCount,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8">
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

      <Card>
        <CardHeader>
          <CardTitle>Distribuție statusuri</CardTitle>
          <CardDescription>Toate programările</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-4 gap-3">
          <StatusTile
            label="Pending"
            value={allCounts.pending ?? 0}
            icon={Hourglass}
            tone="warning"
          />
          <StatusTile
            label="Confirmate"
            value={allCounts.confirmed ?? 0}
            icon={Clock}
            tone="default"
          />
          <StatusTile
            label="Finalizate"
            value={allCounts.completed ?? 0}
            icon={CheckCircle2}
            tone="success"
          />
          <StatusTile
            label="Anulate"
            value={allCounts.cancelled ?? 0}
            icon={XCircle}
            tone="destructive"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activitate recentă</CardTitle>
          <CardDescription>Ultimele programări creste</CardDescription>
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
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Nu există programări încă.
                  </TableCell>
                </TableRow>
              )}
              {recent.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="font-medium">{r.client_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.client_phone}
                    </div>
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

function StatusTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone: "default" | "warning" | "success" | "destructive";
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-background/40 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 flex items-end gap-2">
        <div className="font-display text-3xl">{value}</div>
        <Badge variant={tone}>·</Badge>
      </div>
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
