"use client";

type LoadingStateProps = {
    message?: string;
};

const LoadingState = ({ message = "Loading..." }: LoadingStateProps) => {
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center gap-3 text-foreground animate-fade-in">
            {/* Spinner */}
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />

            {/* Message */}
            <p className="text-sm text-muted-foreground">
                {message}
            </p>
        </div>
    );
};

export default LoadingState;
