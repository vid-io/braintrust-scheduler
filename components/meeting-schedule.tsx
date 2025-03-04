"use client"

import { useState } from "react"
import { format, isBefore, startOfDay, isTuesday, setHours, setMinutes } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SignupForm } from "@/components/signup-form"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Slot } from "@/lib/types"

// Helper function to get noon PST cutoff time
function getNoonPSTCutoff() {
  const now = new Date()
  // Convert current time to PST (UTC-8)
  const pstOffset = 8 * 60 // 8 hours in minutes
  const localOffset = now.getTimezoneOffset()
  const totalOffsetMinutes = localOffset - pstOffset

  // Create cutoff at noon PST today
  const cutoff = startOfDay(now)
  cutoff.setUTCHours(20) // noon PST = 20:00 UTC
  return cutoff
}

// Helper function to group slots by date
function groupSlotsByDate(slots: Slot[]): Array<{
  date: string;
  day: string;
  slots: Slot[];
}> {
  const grouped = slots.reduce((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) {
      acc[date] = {
        date,
        day: isTuesday(new Date(date)) ? "Tuesday" : "Thursday",
        slots: []
      };
    }
    acc[date].slots.push(slot);
    return acc;
  }, {} as Record<string, { date: string; day: string; slots: Slot[] }>);

  return Object.values(grouped).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function MeetingSchedule({ initialSlots }: { initialSlots: Slot[] }) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [slots, setSlots] = useState<Slot[]>(initialSlots)

  const cutoffTime = getNoonPSTCutoff()
  const now = new Date()
  const groupedSlots = groupSlotsByDate(slots)
  
  const upcomingDates = groupedSlots.filter(group => {
    const meetingDate = new Date(group.date)
    // If it's today and after noon PST, consider it past
    if (format(meetingDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")) {
      return now < cutoffTime
    }
    // Otherwise, compare dates normally
    return !isBefore(meetingDate, now)
  })

  const pastDates = groupedSlots
    .filter(group => {
      const meetingDate = new Date(group.date)
      // If it's today and after noon PST, consider it past
      if (format(meetingDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")) {
        return now >= cutoffTime
      }
      // Otherwise, compare dates normally
      return isBefore(meetingDate, now)
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleSlotClick = (date: string, slot: Slot) => {
    setSelectedDate(date)
    setSelectedSlot(slot)
    setIsDialogOpen(true)
  }

  const handleSignupSuccess = (updatedSlot: Slot) => {
    setSlots(slots.map(slot => 
      slot.id === updatedSlot.id ? updatedSlot : slot
    ))
    setIsDialogOpen(false)
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Meeting Schedule</CardTitle>
          <CardDescription>View upcoming and past brain trust meetings</CardDescription>
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past Meetings</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-4">
              {upcomingDates.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No upcoming meetings scheduled</p>
              ) : (
                <div className="space-y-4">
                  {upcomingDates.map((group) => (
                    <DateCard 
                      key={group.date} 
                      dateGroup={group} 
                      onSlotClick={handleSlotClick} 
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-4">
              {pastDates.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No past meetings</p>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {pastDates.slice(0, 5).map((group) => (
                    <DateCard 
                      key={group.date} 
                      dateGroup={group} 
                      isPast={true} 
                    />
                  ))}
                  {pastDates.length > 5 && (
                    <Button variant="outline" className="w-full" onClick={() => {}}>
                      View All Past Meetings
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedDate && selectedSlot && (
            <SignupForm 
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onSuccess={handleSignupSuccess} 
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

interface DateCardProps {
  dateGroup: {
    date: string;
    day: string;
    slots: Slot[];
  };
  isPast?: boolean;
  onSlotClick?: (date: string, slot: Slot) => void;
}

function DateCard({ dateGroup, isPast = false, onSlotClick }: DateCardProps) {
  const meetingDate = new Date(`${dateGroup.date}T00:00:00`)

  return (
    <Card className={isPast ? "opacity-80" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {format(meetingDate, "EEEE, MMMM d")}
            </span>
          </div>
          <Badge variant={dateGroup.day === "Tuesday" ? "default" : "secondary"}>{dateGroup.day}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {dateGroup.slots.map((slot, index) => (
            <div
              key={slot.id}
              className={`flex items-center gap-3 py-2 border-t ${!isPast && !slot.presenter_name ? "cursor-pointer hover:bg-muted/50 rounded-md transition-colors" : ""}`}
              onClick={() => {
                if (!isPast && !slot.presenter_name && onSlotClick) {
                  onSlotClick(dateGroup.date, slot)
                }
              }}
            >
              <div className="font-medium text-sm w-16">Slot {index + 1}</div>
              {slot.presenter_name ? (
                <div className="flex items-center gap-2 flex-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                    <AvatarFallback>{slot.presenter_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">{slot.presenter_name}</div>
                    <div className="text-xs text-muted-foreground">{slot.topic}</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-sm">
                    {!isPast ? (
                      <>
                        Available <span className="text-xs">(Click to sign up)</span>
                      </>
                    ) : (
                      "Not filled"
                    )}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

