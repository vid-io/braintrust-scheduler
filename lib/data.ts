import { createClient } from "@supabase/supabase-js"
import { addDays, format, nextTuesday, nextThursday, isTuesday, isThursday, startOfDay, endOfDay } from "date-fns"
import { Slot } from "./types"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

export async function getSlots(): Promise<Slot[]> {
  console.log("Fetching slots from database...")
  
  // Fetch all slots from database
  const { data: dbSlots, error: slotsError } = await supabase
    .from("slots")
    .select("*")
    .order("date")

  if (slotsError) {
    console.error("Error fetching slots:", slotsError)
    return []
  }

  console.log(`Retrieved ${dbSlots?.length || 0} slots from database`)
  
  // Generate the next 4 upcoming meeting dates (including today if applicable)
  const today = endOfDay(new Date()) // Use end of day to include today's meetings
  const upcomingDates = getUpcomingMeetingDates(today, 4)
  
  // For each upcoming date, check if we have enough slots
  // If not, create virtual slots (not in DB yet)
  const virtualSlots: Slot[] = []
  
  for (const upcomingDate of upcomingDates) {
    const formattedDate = format(upcomingDate, "yyyy-MM-dd")
    const existingSlots = dbSlots?.filter(slot => slot.date === formattedDate) || []
    
    // If we have less than 3 slots for this date, create virtual ones
    const slotsNeeded = 3 - existingSlots.length
    if (slotsNeeded > 0) {
      for (let i = 0; i < slotsNeeded; i++) {
        virtualSlots.push({
          id: `virtual-slot-${i}-${formattedDate}`,
          date: formattedDate,
          presenter_name: null,
          topic: null,
        })
      }
    }
  }

  // Combine existing and virtual slots and sort by date
  const allSlots = [...(dbSlots || []), ...virtualSlots].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  
  return allSlots
}

// Function to get upcoming meeting dates
function getUpcomingMeetingDates(startDate: Date, count: number): Date[] {
  const dates: Date[] = []
  const today = startOfDay(startDate) // Keep using startOfDay for date calculations
  
  // Find the next Tuesday and Thursday
  let nextTues = nextTuesday(today)
  let nextThurs = nextThursday(today)
  
  // If today is Tuesday or Thursday, use today's date instead of next occurrence
  if (isTuesday(today)) {
    nextTues = today
  }
  if (isThursday(today)) {
    nextThurs = today
  }
  
  // Add dates to the array and sort
  dates.push(nextTues, nextThurs)
  
  // Calculate additional dates to reach the desired count
  while (dates.length < count) {
    nextTues = addDays(nextTues, 7)
    nextThurs = addDays(nextThurs, 7)
    dates.push(nextTues, nextThurs)
  }
  
  // Sort dates and return only the requested count
  return dates
    .sort((a, b) => a.getTime() - b.getTime())
    .slice(0, count)
}

interface SignUpResult {
  success: boolean;
  message: string;
}

export async function signUpForSlot(
  date: string,
  slotId: string | null,
  name: string,
  topic: string
): Promise<SignUpResult> {
  try {
    console.log("signUpForSlot called with:", { date, slotId, name, topic })
    
    // If we have a virtual slot ID, we need to create a real slot
    if (!slotId || slotId.startsWith('virtual-slot-')) {
      console.log("Creating new slot for date:", date)
      // Create a new slot
      const { data: newSlot, error: slotError } = await supabase
        .from("slots")
        .insert({ 
          date: date,
          presenter_name: name,
          topic: topic
        })
        .select("*")
        .single()
      
      if (slotError || !newSlot) {
        console.error("Error creating slot:", slotError)
        return {
          success: false,
          message: `Failed to create slot: ${slotError?.message || "Unknown error"}`,
        }
      }
      
      return {
        success: true,
        message: "Successfully signed up for the presentation slot!",
      }
    }
    
    // Otherwise update the existing slot
    console.log("Updating existing slot:", slotId)
    const { error: updateError } = await supabase
      .from("slots")
      .update({
        presenter_name: name,
        topic: topic,
      })
      .eq("id", slotId)
      
    if (updateError) {
      console.error("Error updating slot:", updateError)
      return {
        success: false,
        message: `Failed to sign up for the slot: ${updateError.message}`,
      }
    }
    
    return {
      success: true,
      message: "Successfully signed up for the presentation slot!",
    }
  } catch (error) {
    console.error("Error in signUpForSlot:", error)
    return {
      success: false, 
      message: error instanceof Error ? error.message : "An unexpected error occurred"
    }
  }
}

