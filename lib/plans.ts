import { PRICE_PLANS } from "@/constants";
import { toast } from "sonner";

export const getPlanByPriceId = (priceId?: string) => {
  if (!priceId) {
    toast.error("Price ID is required");
    return null;
  }

  return (
    PRICE_PLANS.find((plan) =>
      Object.values(plan.pricing).some((p) => p.priceId === priceId),
    ) ?? null
  );
};
