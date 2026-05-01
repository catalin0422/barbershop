import { redirect } from "next/navigation";
import { CalendarDays, CalendarOff, LayoutDashboard, User } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

const NAV = [
  { href: "/dashboard", label: "Programări", icon: CalendarDays },
  { href: "/dashboard/schedule", label: "Programul meu", icon: CalendarOff },
  { href: "/dashboard/profile", label: "Profilul meu", icon: User },
  { href: "/", label: "Site public", icon: LayoutDashboard },
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

  if ((profile as any)?.role !== "barber" && (profile as any)?.role !== "owner") {
    redirect("/login");
  }

  return (
    <DashboardShell
      title="Dashboard frizer"
      user={{ name: (profile as any).full_name, role: (profile as any).role }}
      nav={NAV}
    >
      {children}
    </DashboardShell>
  );
}
