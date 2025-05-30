import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function Profile() {
  let session = getSession();

  if (!session) {
    const refreshRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/refresh`,
      {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      },
    );

    if (refreshRes.ok) {
      session = getSession();
    }

    if (!session) {
      redirect("/sign-in");
    }
  }

  return (
    <div className="h-screen flex justify-center items-center">
      <p className="text-white">Profile</p>
    </div>
  );
}
