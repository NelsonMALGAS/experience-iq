import InstallPrompt from "@/components/InstallPrompt"
import LandingPage from "@/components/LandingPage"
import { requireAuth } from "./actions/requireAuth"
import { redirect } from "next/navigation"


const Home = async () => {

  const { role, uid } = await requireAuth()

  if (uid) redirect(`/${role || "guest"}`)
  return (
    <>
      <main className="min-h-screen flex items-center justify-center px-6">
        <LandingPage />
      </main>
      <InstallPrompt />
    </>

  )
}

export default Home
