import { getSchedule } from "@/lib/api";
import ScheduleClient from "@/components/ScheduleClient";

export default async function SchedulePage() {
    const scheduleData = await getSchedule();

    return <ScheduleClient scheduleData={scheduleData} />;
}
