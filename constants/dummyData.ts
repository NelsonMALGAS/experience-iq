import { AIInsight, CriticalAlert, ExperienceMetrics } from ".";

const insights: ExperienceMetrics = {
  overallSatisfaction: 4.6,
  satisfactionTrend: 3,
  activeAlerts: 3,
  avgResponseTime: 8,
  responseTimeTrend: -12,
  sentimentRisk: "medium",
};

const criticalAlerts: CriticalAlert[] = [
  {
    id: "alert_001",
    guest: "John Matthews",
    roomNumber: "204",
    issue: "Air conditioning not working",
    severity: "high",
    reportedMinutesAgo: 12,
    category: "maintenance",
    status: "pending",
  },
  {
    id: "alert_002",
    guest: "Sarah Mokoena",
    roomNumber: "118",
    issue: "Slow room service",
    severity: "medium",
    reportedMinutesAgo: 35,
    category: "service",
    status: "in_progress",
  },
  {
    id: "alert_003",
    guest: "David Chen",
    roomNumber: "312",
    issue: "Noisy neighbors complaint",
    severity: "high",
    reportedMinutesAgo: 8,
    category: "noise",
    status: "pending",
  },
];

const aiInsights: AIInsight[] = [
  {
    id: "insight_001",
    insight: "Rooms 200–220 show recurring maintenance complaints.",
    priority: "high",
    category: "operations",
    actionable: true,
  },
  {
    id: "insight_002",
    insight: "Evening shift response times are 22% slower than morning shift.",
    priority: "high",
    category: "performance",
    actionable: true,
  },
  {
    id: "insight_003",
    insight: "Check-in feedback dropped slightly over the past 7 days.",
    priority: "medium",
    category: "trends",
    actionable: true,
  },
];

export { aiInsights, insights, criticalAlerts };
