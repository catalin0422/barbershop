"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import type { AppointmentStatus } from "@/lib/types";

interface Row {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string | null;
  barber: { id: string; full_name: string } | null;
  service: {
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
  } | null;
}

const STATUS_OPTIONS: AppointmentStatus[] = ["confirmed", "cancelled"];

const STATUS_BADGES: Record<
  AppointmentStatus,
  { variant: any; label: string }
> = {
  pending: { variant: "warning", label: "Confirmată" },
  confirmed: { variant: "default", label: "Confirmată" },
  completed: { variant: "default", label: "Confirmată" },
  cancelled: { variant: "destructive", label: "Anulată" },
};

export function AppointmentsTable({
  appointments,
  allowAllStatusChanges = false,
}: {
  appointments: Row[];
  allowAllStatusChanges?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | AppointmentStatus>("all");

  async function changeStatus(id: string, status: AppointmentStatus) {
    setUpdating(id);
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    if (res.ok) {
      startTransition(() => router.refresh());
    }
  }

  const visible =
    filter === "all"
      ? appointments
      : appointments.filter((a) => a.status === filter);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-muted-foreground">Filtru:</span>
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate</SelectItem>
            <SelectItem value="confirmed">Confirmate</SelectItem>
            <SelectItem value="cancelled">Anulate</SelectItem>
          </SelectContent>
        </Select>
        {pending && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead className="hidden md:table-cell">Frizer</TableHead>
            <TableHead className="hidden md:table-cell">Serviciu</TableHead>
            <TableHead>Când</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground py-12"
              >
                Nu există programări care să se potrivească filtrului.
              </TableCell>
            </TableRow>
          )}
          {visible.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <div className="font-medium">{row.client_name}</div>
                <div className="text-xs text-muted-foreground">
                  {row.client_phone}
                </div>
                {row.notes && (
                  <div className="text-xs text-muted-foreground italic mt-1 max-w-xs line-clamp-2">
                    “{row.notes}”
                  </div>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {row.barber?.full_name ?? "—"}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {row.service?.name ?? "—"}
              </TableCell>
              <TableCell>
                <div>
                  {new Date(row.start_time).toLocaleDateString("ro-RO", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(row.start_time).toLocaleTimeString("ro-RO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </TableCell>
              <TableCell>
                {allowAllStatusChanges ? (
                  <Select
                    value={row.status}
                    disabled={updating === row.id}
                    onValueChange={(v) =>
                      changeStatus(row.id, v as AppointmentStatus)
                    }
                  >
                    <SelectTrigger className="w-36 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_BADGES[s].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={STATUS_BADGES[row.status].variant}>
                    {STATUS_BADGES[row.status].label}
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
