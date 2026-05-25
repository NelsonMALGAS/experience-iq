import { toast } from "sonner";
import { months } from "@/constants";
import { Shift, StaffMember } from "@/types";

export const useExportRoster = (
  uid: string,
  selectedMonth: number,
  selectedYear: number,
  shifts: Shift[],
  staffMembers: StaffMember[],
) => {
  const getShiftsForStaff = (staffId: string) =>
    shifts.filter((s) => s.staffId === staffId);

  const exportRoster = () => {
    if (!uid) return;

    const monthName = months[selectedMonth];

    const getDuration = (start: string, end: string) => {
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      const mins = eh * 60 + em - (sh * 60 + sm);
      return `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}m` : ""}`;
    };

    const getTotalHours = (staffShifts: Shift[]) => {
      const totalMins = staffShifts.reduce((acc, s) => {
        const [sh, sm] = s.startTime.split(":").map(Number);
        const [eh, em] = s.endTime.split(":").map(Number);
        return acc + (eh * 60 + em - (sh * 60 + sm));
      }, 0);
      return `${Math.floor(totalMins / 60)}h${totalMins % 60 > 0 ? ` ${totalMins % 60}m` : ""}`;
    };

    const cell = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;
    const rows: string[] = [];

    rows.push([cell("Roster"), cell(`${monthName} ${selectedYear}`)].join(","));
    rows.push(
      [
        cell("Generated"),
        cell(new Date().toLocaleDateString("en-US", { dateStyle: "long" })),
      ].join(","),
    );
    rows.push([cell("Created By"), cell(uid)].join(","));
    rows.push([cell("Created At"), cell(new Date().toISOString())].join(","));
    rows.push([cell("Total Shifts"), cell(shifts.length)].join(","));
    rows.push("");

    rows.push([cell("SUMMARY"), "", "", ""].join(","));
    rows.push(
      [
        cell("Staff Member"),
        cell("Department"),
        cell("Shifts"),
        cell("Total Hours"),
      ].join(","),
    );
    staffMembers.forEach((staff) => {
      const staffShifts = getShiftsForStaff(staff.id);
      if (staffShifts.length === 0) return;
      rows.push(
        [
          cell(staff.name),
          cell(staff.department ?? "other"),
          cell(staffShifts.length),
          cell(getTotalHours(staffShifts)),
        ].join(","),
      );
    });
    rows.push("");

    rows.push([cell("SHIFTS DETAIL"), "", "", "", "", "", ""].join(","));
    rows.push(
      [
        cell("Staff Member"),
        cell("Department"),
        cell("Date"),
        cell("Start"),
        cell("End"),
        cell("Duration"),
        cell("Notes"),
      ].join(","),
    );
    staffMembers.forEach((staff) => {
      const staffShifts = getShiftsForStaff(staff.id).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      if (staffShifts.length === 0) return;
      staffShifts.forEach((shift) => {
        rows.push(
          [
            cell(staff.name),
            cell(staff.department ?? "other"),
            cell(
              new Date(shift.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              }),
            ),
            cell(shift.startTime),
            cell(shift.endTime),
            cell(getDuration(shift.startTime, shift.endTime)),
            cell(shift.notes ?? ""),
          ].join(","),
        );
      });
    });

    const csvContent = rows.join("\n");
    const dataUri =
      "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csvContent);
    const exportFileDefaultName = `Roster-${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}.csv`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success("Success", { description: "Roster exported as CSV." });
  };

  return { exportRoster };
};
