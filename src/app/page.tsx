import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth/server";
import { getRedirectPath, routes } from "@/lib/routes";

export default async function HomePage() {
  const auth = await getAuth();
  if (!auth) redirect(routes.login);
  redirect(getRedirectPath(auth.role));
}
