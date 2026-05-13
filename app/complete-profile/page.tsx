export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CompleteProfileForm from "./CompleteProfileForm";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function CompleteProfilePage({ searchParams }: Props) {
    const auth = await getAuthUser();
    if (!auth) redirect("/login");

    const user = await prisma.user.findUnique({ where: { id: auth.userId } });
    if (!user) redirect("/login");

    const params = await searchParams;
    const nextUrl = params.next?.startsWith("/") ? params.next : "/profile";

    // Already complete — skip straight to destination
    if (user.name && user.phone) redirect(nextUrl);

    return <CompleteProfileForm nextUrl={nextUrl} email={user.email} />;
}
