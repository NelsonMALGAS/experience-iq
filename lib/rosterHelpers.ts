export const READ_ISSUE_IDS_KEY = "read_issue_ids";

// Format date helper
export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

// Format time helper
export const formatTime = (time: string) => {
  try {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
};

// Calculate shift duration
export const calculateDuration = (startTime: string, endTime: string) => {
  try {
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    let durationMinutes =
      endHours * 60 + endMinutes - (startHours * 60 + startMinutes);

    // Handle overnight shifts
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60;
    }

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  } catch {
    return "-";
  }
};

export function getLocalReadIssueIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const raw = localStorage.getItem(READ_ISSUE_IDS_KEY);
  return new Set(raw ? JSON.parse(raw) : []);
}

export function addLocalReadIssueId(id: string) {
  const ids = getLocalReadIssueIds();
  ids.add(id);
  localStorage.setItem(READ_ISSUE_IDS_KEY, JSON.stringify([...ids]));
}

export function addAllLocalReadIssueIds(ids: string[]): void {
  const existing = getLocalReadIssueIds();
  ids.forEach((id) => existing.add(id));
  localStorage.setItem(READ_ISSUE_IDS_KEY, JSON.stringify([...existing]));
}

export function clearLocalReadIssueIds(): void {
  localStorage.removeItem("read_issue_ids");
}
