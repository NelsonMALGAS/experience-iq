import { Sparkles } from 'lucide-react'


const Footer = () => {
    return (
        <div>
            {/* Footer */}
            <footer className="py-8 border-t border-border">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-display font-semibold text-foreground">ServiceResolve</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} ServiceResolve. Premium Guest Experience Platform.
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default Footer