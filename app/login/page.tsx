import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import LoginForm from "./LoginForm";

// searchParams is a Promise in Next.js 15+
type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
    const user = await getAuthUser();
    if (user) redirect("/profile");

    const params = await searchParams;
    // Only allow relative paths as redirect targets to prevent open-redirect
    const nextUrl =
        typeof params.next === "string" && params.next.startsWith("/")
            ? params.next
            : "/profile";

    return <LoginForm nextUrl={nextUrl} />;
}
