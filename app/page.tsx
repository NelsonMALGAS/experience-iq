import InstallPrompt from "@/components/InstallPrompt";
import LandingPage from "@/components/LandingPage";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/db/server";

const Home = async () => {
  const cookieStore = await cookies();
  const session = cookieStore.get("_SESSION_")?.value;

  // 👤 No session → public landing page
  if (!session) {
    return (
      <>
        <main className="min-h-screen flex items-center justify-center px-6">
          <LandingPage />
        </main>
        <InstallPrompt />
      </>
    );
  }

  // 🔐 Verify session
  const decoded = await auth?.verifySessionCookie(session, true);

  if (!decoded) {
    redirect(`/login?role=""`);
  }

  const role = decoded.role;

  // ✅ Authenticated users go to their dashboard
  redirect(`/${role}`);
};

export default Home;
