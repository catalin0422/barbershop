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
            Gestionează profilurile frizerilor. Conturile noi sunt create de
            owner direct în Supabase Auth — pagina aceasta editează profilul.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarbersManager profiles={(profiles ?? []) as Profile[]} />
        </CardContent>
      </Card>
    </div>
  );
}
