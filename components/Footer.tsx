import Image from 'next/image'


const Footer = () => {
    return (
        <>
            {/* Footer */}
            <footer className="py-8 border-t border-border">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/60 flex items-center justify-center">
                            <Image
                                src="/images/experienceIQ.png"
                                alt="ExperienceIQ Logo"
                                height={32}
                                width={32}
                                className="h-8 w-8 text-primary"
                                priority
                            />
                        </div>
                        <span className="font-display font-semibold text-foreground">Experience<span className='text-primary'>IQ</span></span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Experience<span>IQ</span>. Premium Guest Experience Platform.
                    </p>
                </div>
            </footer>
        </>
    )
}

export default Footer