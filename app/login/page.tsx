import AuthForm from "@/components/AuthForm"
import { roles } from "@/constants";
import { Role } from "@/types";
import { redirect } from "next/navigation";

type LoginPageProps = {
    searchParams: Promise<{
        role: Role;
    }>;
};

const LoginPage = async ({ searchParams }: LoginPageProps) => {

    const role: Role = (await searchParams).role;

    if (!roles.includes(role)) redirect("/login")

    return (
        <div className="mt-24">
            <AuthForm role={role} />
        </div>
    )
}

export default LoginPage