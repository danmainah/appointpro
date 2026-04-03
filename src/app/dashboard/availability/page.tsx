"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Clock, Save } from "lucide-react";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  day: number;
  enabled: boolean;
  slots: TimeSlot[];
}

function defaultSchedule(): DaySchedule[] {
  return Array.from({ length: 7 }, (_, i) => ({
    day: i,
    enabled: i >= 1 && i <= 5, // Mon-Fri
    slots: i >= 1 && i <= 5 ? [{ start: "09:00", end: "17:00" }] : [],
  }));
}

export default function AvailabilityPage() {
  const { data: session } = useSession();
  const [schedule, setSchedule] = useState<DaySchedule[]>(defaultSchedule());
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session) return;
    async function fetchAvailability() {
      try {
        const res = await fetch("/api/availability");
        if (res.status === 404) {
          // No availability set yet, use defaults
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (data.availability) {
          setSchedule(data.availability.weeklySchedule);
          setTimezone(data.availability.timezone);
          setBufferMinutes(data.availability.bufferMinutes);
        }
      } catch {
        toast.error("Failed to load availability");
      } finally {
        setLoading(false);
      }
    }
    fetchAvailability();
  }, [session]);

  function toggleDay(dayIndex: number) {
    setSchedule((prev) =>
      prev.map((d) =>
        d.day === dayIndex
          ? {
              ...d,
              enabled: !d.enabled,
              slots: !d.enabled && d.slots.length === 0
                ? [{ start: "09:00", end: "17:00" }]
                : d.slots,
            }
          : d
      )
    );
  }

  function updateSlot(
    dayIndex: number,
    slotIndex: number,
    field: "start" | "end",
    value: string
  ) {
    setSchedule((prev) =>
      prev.map((d) =>
        d.day === dayIndex
          ? {
              ...d,
              slots: d.slots.map((s, i) =>
                i === slotIndex ? { ...s, [field]: value } : s
              ),
            }
          : d
      )
    );
  }

  function addSlot(dayIndex: number) {
    setSchedule((prev) =>
      prev.map((d) =>
        d.day === dayIndex
          ? { ...d, slots: [...d.slots, { start: "09:00", end: "17:00" }] }
          : d
      )
    );
  }

  function removeSlot(dayIndex: number, slotIndex: number) {
    setSchedule((prev) =>
      prev.map((d) =>
        d.day === dayIndex
          ? { ...d, slots: d.slots.filter((_, i) => i !== slotIndex) }
          : d
      )
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timezone,
          weeklySchedule: schedule,
          bufferMinutes,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      toast.success("Availability saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save availability");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
          <p className="text-muted-foreground">
            Set your weekly availability for bookings.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-1 size-4" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Settings Row */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="e.g. Africa/Nairobi"
              className="w-64"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buffer">Buffer between bookings (min)</Label>
            <Input
              id="buffer"
              type="number"
              min={0}
              max={120}
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(parseInt(e.target.value) || 0)}
              className="w-32"
            />
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="size-4" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {schedule.map((day, dayIdx) => (
            <div key={day.day}>
              <div className="flex items-start gap-4 py-3">
                <div className="flex w-32 shrink-0 items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={() => toggleDay(day.day)}
                    className="size-4"
                  />
                  <span className="text-sm font-medium">
                    {DAY_NAMES[day.day]}
                  </span>
                </div>

                {day.enabled ? (
                  <div className="flex flex-1 flex-col gap-2">
                    {day.slots.map((slot, slotIdx) => (
                      <div key={slotIdx} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) =>
                            updateSlot(day.day, slotIdx, "start", e.target.value)
                          }
                          className="w-32"
                        />
                        <span className="text-sm text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(e) =>
                            updateSlot(day.day, slotIdx, "end", e.target.value)
                          }
                          className="w-32"
                        />
                        {day.slots.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSlot(day.day, slotIdx)}
                          >
                            <Trash2 className="size-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-fit"
                      onClick={() => addSlot(day.day)}
                    >
                      <Plus className="mr-1 size-3" />
                      Add slot
                    </Button>
                  </div>
                ) : (
                  <p className="pt-1 text-sm text-muted-foreground">
                    Unavailable
                  </p>
                )}
              </div>
              {dayIdx < 6 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
