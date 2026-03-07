import { Badge } from "../ui/badge";

export function EmptyState({ message, icon: Icon }: { message: string; icon: React.ElementType }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Icon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    );
}

export function SectionHeader({
    title,
    count,
    variant,
}: {
    title: string;
    count: number;
    variant: "pending" | "verified";
}) {
    return (
        <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">{title}</h2>
            <Badge
                className={
                    variant === "pending"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                        : "bg-green-100 text-green-800 border-green-200"
                }
            >
                {count}
            </Badge>
        </div>
    );
}