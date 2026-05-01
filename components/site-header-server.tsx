import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";

export async function SiteHeaderServer() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  return (
    <SiteHeader
      authUser={
        user && profile
          ? { name: profile.full_name, role: profile.role }
          : null
      }
    />
  );
}
