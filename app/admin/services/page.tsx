import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { ServicesManager } from "@/components/admin/services-manager";
import type { Service } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const supabase = createClient();
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("price");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Servicii</CardTitle>
          <CardDescription>
            Catalogul de servicii oferite. Modificările sunt vizibile imediat
            în pagina publică.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServicesManager services={(services ?? []) as Service[]} />
        </CardContent>
      </Card>
    </div>
  );
}
