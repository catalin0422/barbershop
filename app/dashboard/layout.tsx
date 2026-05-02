import { redirect } from "next/navigation";
import { CalendarDays, CalendarOff, LayoutDashboard, Settings, User } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

const BASE_NAV = [
  { href: "/dashboard", label: "Programări", icon: CalendarDays },
  { href: "/dashboard/schedule", label: "Programul meu", icon: CalendarOff },
  { href: "/dashboard/profile", label: "Profilul meu", icon: User },
  { href: "/", label: "Site public", icon: LayoutDashboard },
];

const OWNER_NAV = [
  ...BASE_NAV,
  { href: "/admin", label: "Admin Panel", icon: Settings },
];

export default async function BarberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile as any)?.role;

  if (role !== "barber" && role !== "owner") {
    redirect("/login");
  }

  return (
    <DashboardShell
      title="Dashboard frizer"
      user={{ name: (profile as any).full_name, role }}
      nav={role === "owner" ? OWNER_NAV : BASE_NAV}
    >
      {children}
    </DashboardShell>
  );
}
