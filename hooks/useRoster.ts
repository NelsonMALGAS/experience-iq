"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  addShiftToRoster,
  createRoster,
  removeShiftFromRoster,
} from "@/app/actions/rosterActions";
import { fetchRosterByMonthYear } from "@/app/actions/roster";
import { months, staffColorPalette } from "@/constants";
import { IssueCategory, Role, Shift, StaffMember } from "@/types";

export type NewStaffType = {
  name: string;
  email: string;
  department: IssueCategory;
  role: Role;
};

export const useRoster = (
  initialStaff: StaffMember[],
  existingRosterId: string | undefined,
  uid: string,
) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(initialStaff);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [rosterId, setRosterId] = useState<string | undefined>(
    existingRosterId,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRefreshNudge, setShowRefreshNudge] = useState(false);
  const [newStaffData, setNewStaffData] = useState<NewStaffType>({
    name: "",
    email: "",
    department: "other",
    role: "staff",
  });

  // Load roster when month/year changes
  useEffect(() => {
    const loadRoster = async () => {
      setIsLoading(true);
      try {
        const result = await fetchRosterByMonthYear(
          months[selectedMonth],
          selectedYear,
        );
        if (result.success && result.data) {
          setRosterId(result.data.id);
          setShifts(result.data.shifts || []);
          toast.success("Roster Loaded", {
            description: `Loaded ${result.data.shifts?.length || 0} shifts for ${months[selectedMonth]} ${selectedYear}`,
          });
        } else {
          setRosterId(undefined);
          setShifts([]);
          toast.info(
            `No roster found for ${months[selectedMonth]} ${selectedYear}`,
          );
        }
      } catch (error) {
        console.error("Error loading roster:", error);
        toast.error("Error", {
          description: "Failed to load roster. You can still create a new one.",
        });
        setRosterId(undefined);
        setShifts([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadRoster();
  }, [selectedMonth, selectedYear]);

  const getShiftsForDate = (date: string) =>
    shifts.filter((s) => s.date === date);
  const getShiftsForStaff = (staffId: string) =>
    shifts.filter((s) => s.staffId === staffId);

  const addShift = async (
    staffId: string,
    date: string,
    startTime: string,
    endTime: string,
    notes?: string,
  ) => {
    if (!uid) {
      toast.error("Access Denied", {
        description: "Only administrators can create shifts.",
      });
      return;
    }
    const staffMember = staffMembers.find((s) => s.id === staffId);
    if (!staffMember) {
      toast.error("Error", { description: "Invalid staff member selected." });
      return;
    }

    let currentRosterId = rosterId;
    if (!currentRosterId) {
      const result = await createRoster({
        month: months[selectedMonth],
        year: selectedYear,
        shifts: [],
      });
      if (result.success && result.data) {
        currentRosterId = result.data.id;
        setRosterId(result.data.id);
        toast.success("Roster ready", {
          description: "Now adding your shift...",
        });
      } else {
        toast.error("Error", { description: result.message });
        return;
      }
    }

    const newShift: Shift = {
      id: crypto.randomUUID(),
      staffId,
      date,
      startTime,
      endTime,
      notes,
    };
    setShifts((prev) => [...prev, newShift]);

    try {
      const result = await addShiftToRoster(currentRosterId!, {
        staffId,
        date,
        startTime,
        endTime,
        notes,
      });
      if (!result.success) {
        setShifts((prev) => prev.filter((s) => s.id !== newShift.id));
        toast.error("Error", { description: result.message });
      } else {
        toast.success("Success", { description: "Shift added successfully." });
        setShowRefreshNudge(true);
      }
    } catch (error) {
      console.error("Error adding shift:", error);
      setShifts((prev) => prev.filter((s) => s.id !== newShift.id));
      toast.error("Error", { description: "Failed to add shift." });
    }
  };

  const removeShift = async (shiftId: string) => {
    if (!uid) {
      toast.error("Access Denied", {
        description: "Only administrators can remove shifts.",
      });
      return;
    }
    if (!rosterId) {
      toast.error("Error", { description: "Roster ID not found." });
      return;
    }

    const originalShifts = [...shifts];
    setShifts(shifts.filter((s) => s.id !== shiftId));

    try {
      const result = await removeShiftFromRoster(rosterId, shiftId);
      if (!result.success) {
        setShifts(originalShifts);
        toast.error("Error", { description: result.message });
      } else {
        toast.success("Success", {
          description: "Shift removed successfully.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setShifts(originalShifts);
      toast.error("Error", { description: "Failed to remove shift." });
    }
  };

  const handleNotesUpdated = (shiftId: string, notes: string) => {
    setShifts((prev) =>
      prev.map((s) =>
        s.id === shiftId ? { ...s, notes: notes.trim() || undefined } : s,
      ),
    );
  };

  const saveRoster = async () => {
    if (!uid) {
      toast.error("Access Denied", {
        description: "Only administrators can save rosters.",
      });
      return;
    }
    setIsSaving(true);
    try {
      if (!rosterId) {
        const result = await createRoster({
          month: months[selectedMonth],
          year: selectedYear,
          shifts,
        });
        if (result.success && result.data) {
          setRosterId(result.data.id);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          toast.success("Success", {
            description:
              "Roster created successfully. Please refresh & add shifts!",
            duration: 5000,
          });
        } else {
          toast.error("Error", { description: result.message });
        }
      } else {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        toast.success("Success", { description: "Roster saved successfully." });
      }
    } catch (error) {
      console.error("Error saving roster:", error);
      toast.error("Error", { description: "Failed to save roster." });
    } finally {
      setIsSaving(false);
    }
  };

  const copyPreviousMonth = () => {
    if (!uid) {
      toast.error("Access Denied", {
        description: "Only administrators can copy rosters.",
      });
      return;
    }
    toast.info("Info", {
      description: "Copy previous month feature coming soon.",
    });
  };

  const addStaffMember = (disabled = true) => {
    if (!uid) {
      toast.error("Access Denied", {
        description: "Only administrators can add staff members.",
      });
      return;
    }
    if (disabled) {
      toast.error("Action Disabled", {
        description:
          "Staff members are automatically added when they are verified",
      });
      return;
    }
    if (
      newStaffData.name &&
      newStaffData.email &&
      newStaffData.department &&
      newStaffData.role
    ) {
      const newStaff: StaffMember = {
        id: Date.now().toString(),
        name: newStaffData.name,
        email: newStaffData.email,
        department: newStaffData.department,
        color:
          staffColorPalette[staffMembers.length % staffColorPalette.length],
        isVerified: false,
        role: newStaffData.role,
        ownerId: null,
      };
      setStaffMembers((prev) => [...prev, newStaff]);
      setNewStaffData({
        name: "",
        email: "",
        department: "other",
        role: "staff",
      });
      toast.success("Success", {
        description: "Staff member added successfully.",
      });
    }
  };

  return {
    // Month/year
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    // Staff
    staffMembers,
    newStaffData,
    setNewStaffData,
    addStaffMember,
    // Shifts
    shifts,
    rosterId,
    getShiftsForDate,
    getShiftsForStaff,
    addShift,
    removeShift,
    handleNotesUpdated,
    // Roster ops
    saveRoster,
    copyPreviousMonth,
    // UI state
    isSaving,
    isLoading,
    showSuccess,
    showRefreshNudge,
    setShowRefreshNudge,
  };
};
