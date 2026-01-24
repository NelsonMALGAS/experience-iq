import InstallPrompt from "@/components/InstallPrompt"
import LandingPage from "@/components/LandingPage"


const Home = () => {
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
