"use client";

import { useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useRouter } from "next/navigation";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface ScheduleCalendarProps {
  jobs: Record<string, unknown>[];
}

const statusColors: Record<string, string> = {
  scheduled: "#3b82f6",
  in_progress: "#f59e0b",
  complete: "#1D9E75",
  cancelled: "#9ca3af",
};

export function ScheduleCalendar({ jobs }: ScheduleCalendarProps) {
  const router = useRouter();

  const events = useMemo(
    () =>
      jobs
        .filter((job) => job.scheduled_date)
        .map((job) => {
          const dateStr = job.scheduled_date as string;
          const timeStr = (job.scheduled_time as string) ?? "08:00";
          const start = new Date(`${dateStr}T${timeStr}`);
          const durationMs = ((job.duration_minutes as number) ?? 60) * 60 * 1000;
          const end = new Date(start.getTime() + durationMs);
          const client = job.clients as Record<string, string>;

          return {
            id: job.id,
            title: `${job.title} — ${client?.name ?? ""}`,
            start,
            end,
            resource: { status: job.status, jobId: job.id },
          };
        }),
    [jobs]
  );

  function eventStyleGetter(event: (typeof events)[0]) {
    const color = statusColors[event.resource.status as string] ?? "#1D9E75";
    return {
      style: {
        backgroundColor: color,
        borderRadius: "4px",
        opacity: 0.9,
        color: "#fff",
        border: "none",
        fontSize: "12px",
      },
    };
  }

  return (
    <div className="h-[600px] bg-card rounded-lg border p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        eventPropGetter={eventStyleGetter}
        onSelectEvent={(event) => router.push(`/jobs/${event.resource.jobId}`)}
        defaultView="week"
        views={["month", "week", "day"]}
        step={30}
        timeslots={2}
      />
    </div>
  );
}
