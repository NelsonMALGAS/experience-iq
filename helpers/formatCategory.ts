import { IssueCategory } from "@/types";

export function formatIssueCategory(category: IssueCategory): string {
  const categoryMap: Record<IssueCategory, string> = {
    roomIssue: "Room Issue",
    housekeeping: "Housekeeping",
    maintenance: "Maintenance",
    foodAndBeverage: "Food & Beverage",
    noiseComplaint: "Noise Complaint",
    checkInOut: "Check-In / Check-Out",
    billingPayment: "Billing / Payment",
    staffService: "Staff Service",
    amenitiesFacilities: "Amenities / Facilities",
    wifiInternet: "WiFi / Internet",
    securitySafety: "Security / Safety",
    casinoGaming: "Casino / Gaming",
    parkingTransport: "Parking / Transport",
    other: "Other",
  };

  return categoryMap[category] ?? "Other";
}
