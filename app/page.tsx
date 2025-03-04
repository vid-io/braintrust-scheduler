import { MeetingSchedule } from "@/components/meeting-schedule"
import { getSlots } from "@/lib/data"

export default async function Home() {
  // Get all slots
  const slots = await getSlots()

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">vidIQ Brain Trust Meetings</h1>
      <p className="text-muted-foreground mb-8">
        Inspired by Pixar's Brain Trust, these meetings provide a forum for sharing ideas and getting feedback from the
        team.
      </p>

      <MeetingSchedule initialSlots={slots} />
    </div>
  )
}

