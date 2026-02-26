import LoadingState from "@/components/LoadingState";
import PaymentVerifyContent from "@/components/payment/PaymentVerifyContent";
import { Suspense } from "react";


export default function PaymentVerifyPage() {
    return (
        <Suspense fallback={<LoadingState message="Loading..." />}>
            <PaymentVerifyContent />
        </Suspense>
    );
}