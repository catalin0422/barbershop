import { redirect } from "next/navigation";
import {
  CalendarRange,
  LayoutDashboard,
  Scissors,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Programări", icon: CalendarRange },
  { href: "/admin/barbers", label: "Frizeri", icon: Users },
  { href: "/admin/services", label: "Servicii", icon: Scissors },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if ((profile as any)?.role !== "owner") {
    redirect((profile as any)?.role === "barber" ? "/dashboard" : "/login");
  }

  return (
    <DashboardShell
      title="Admin"
      user={{ name: (profile as any).full_name, role: (profile as any).role }}
      nav={NAV}
    >
      {children}
    </DashboardShell>
  );
}
