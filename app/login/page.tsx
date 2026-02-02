import AuthForm from "@/components/AuthForm"
import { roles } from "@/constants";
// import { auth } from "@/db/server";
import { Role } from "@/types";
// import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type LoginPageProps = {
    searchParams: Promise<{
        role: Role;
    }>;
};

const LoginPage = async ({ searchParams }: LoginPageProps) => {

    const role: Role = (await searchParams).role;

    // const cookieStore = await cookies();
    // const session = cookieStore?.get("_SESSION_")?.value;


    // if (!session) redirect(`/login?role=${role}`);

    // const decoded = await auth?.verifySessionCookie(session, true);

    // if (!decoded) redirect(`/login?role=${role}`)
    // const uid = decoded.uid;

    // if (uid) redirect(`/${role}`)

    if (!roles.includes(role)) redirect("/")

    return (
        <div className="mt-24">
            <AuthForm role={role} />
        </div>
    )
}

export default LoginPage