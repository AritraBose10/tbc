// Auth redirect is handled by middleware — no cookie reads here.
export const dynamic = "force-dynamic";

import LoginForm from "./LoginForm";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
    const params = await searchParams;
    const nextUrl =
        typeof params.next === "string" && params.next.startsWith("/")
            ? params.next
            : "/profile";

    return <LoginForm nextUrl={nextUrl} />;
}
