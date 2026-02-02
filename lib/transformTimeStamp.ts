import { Timestamp } from "firebase/firestore";

/**
 * Recursively transforms Firestore Timestamps into ISO strings
 * @param obj - Any object containing Firestore Timestamps
 * @returns A plain object with timestamps converted to strings
 */
export function transformFirebaseDates(value: unknown): unknown {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(transformFirebaseDates);
  }

  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const key in value) {
      result[key] = transformFirebaseDates(
        (value as Record<string, unknown>)[key],
      );
    }
    return result;
  }

  return value;
}

type SerializedTimestamp = {
  _seconds: number;
  _nanoseconds?: number;
};

function isSerializedTimestamp(value: unknown): value is SerializedTimestamp {
  return (
    typeof value === "object" &&
    value !== null &&
    "_seconds" in value &&
    typeof (value as { _seconds?: unknown })._seconds === "number"
  );
}

export const getTimeAgo = (
  value: Date | Timestamp | string | SerializedTimestamp | null | undefined,
) => {
  if (!value) return "";

  let date: Date;

  if (value instanceof Date) {
    date = value;
  } else if (value instanceof Timestamp) {
    date = value.toDate();
  } else if (typeof value === "string") {
    date = new Date(value);
  } else if (isSerializedTimestamp(value)) {
    date = new Date(value._seconds * 1000);
  } else {
    return "";
  }

  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) return "Just now";

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};
