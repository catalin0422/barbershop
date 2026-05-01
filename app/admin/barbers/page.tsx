import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { BarbersManager } from "@/components/admin/barbers-manager";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminBarbersPage() {
  const supabase = createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Frizeri</CardTitle>
          <CardDescription>
            Creează conturi noi de frizer sau owner direct din aplicație și editează profilurile existente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarbersManager profiles={(profiles ?? []) as Profile[]} />
        </CardContent>
      </Card>
    </div>
  );
}
