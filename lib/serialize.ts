import { Timestamp } from "firebase-admin/firestore";

export const serializeFirestoreDates = <T extends Record<string, unknown>>(
  obj: T,
): T => {
  return JSON.parse(
    JSON.stringify(obj, (_, value) => {
      if (value instanceof Timestamp) {
        return value.toDate().toISOString();
      }

      // Admin SDK timestamp-like object
      if (value && typeof value === "object" && "_seconds" in value) {
        return new Date(value._seconds * 1000).toISOString();
      }

      return value;
    }),
  );
};
