

const Home = () => {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-2xl text-center rounded-lg p-8 bg-card/80 backdrop-blur-md shadow-lg">
        {/* Logo / Name */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
          ServiceResolve
        </h1>

        {/* Tagline */}
        <p className="text-lg md:text-xl text-foreground/70 mb-6">
          Real-time guest experience & service recovery platform for hospitality enterprises.
        </p>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-500 text-sm font-medium mb-8">
          🚧 Currently in development
        </div>

        {/* Description */}
        <p className="text-foreground/60 leading-relaxed mb-10">
          ServiceResolve is being built to help large hospitality groups monitor,
          manage, and resolve guest issues in real time — improving service
          quality, staff accountability, and guest satisfaction.
        </p>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            disabled
            className="px-6 py-3 rounded-lg bg-muted text-muted-foreground cursor-not-allowed transition"
          >
            Launching Soon
          </button>

          <a
            href="mailto:zmalgas69@gmail.com"
            className="px-6 py-3 rounded-lg border border-border hover:bg-muted/30 transition"
          >
            Request Early Access
          </a>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-sm text-foreground/50">
          © {new Date().getFullYear()} ServiceResolve. All rights reserved.
        </footer>
      </div>
    </main>

  )
}

export default Home