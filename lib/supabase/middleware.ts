import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: object }[]) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as any),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const path = url.pathname;
  const isAdminPath = path.startsWith("/admin");
  const isDashboardPath = path.startsWith("/dashboard");

  if ((isAdminPath || isDashboardPath) && !user) {
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  if (user && (isAdminPath || isDashboardPath)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = (profile as any)?.role as string | undefined;

    if (isAdminPath && role !== "owner") {
      url.pathname = role === "barber" ? "/dashboard" : "/login";
      return NextResponse.redirect(url);
    }
    if (isDashboardPath && role !== "barber" && role !== "owner") {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return response;
}
