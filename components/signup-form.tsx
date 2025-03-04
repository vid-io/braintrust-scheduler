"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"
import { signUpForSlot } from "@/lib/data"
import { useRouter } from "next/navigation"
import { Slot } from "@/lib/types"

interface SignupFormProps {
  selectedDate: string;
  selectedSlot: Slot;
  onSuccess?: (slot: Slot) => void;
}

export function SignupForm({ selectedDate, selectedSlot, onSuccess }: SignupFormProps) {
  const [name, setName] = useState("")
  const [topic, setTopic] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const meetingDate = format(new Date(selectedDate), "EEEE, MMMM d")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      console.log("Submitting sign-up request:", {
        date: selectedDate,
        slotId: selectedSlot.id,
        name,
        topic
      })

      const result = await signUpForSlot(
        selectedDate,
        selectedSlot.id,
        name,
        topic
      )

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
          action: <ToastAction altText="Close">Close</ToastAction>,
        })

        // Update the slot data optimistically
        const updatedSlot = {
          ...selectedSlot,
          presenter_name: name,
          topic,
        }

        // Reset form
        setName("")
        setTopic("")

        // Refresh the page data
        router.refresh()

        if (onSuccess) onSuccess(updatedSlot)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
          action: <ToastAction altText="Close">Close</ToastAction>,
        })
      }
    } catch (error) {
      console.error("Error in form submission:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
        action: <ToastAction altText="Close">Close</ToastAction>,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <CardHeader className="px-0 pt-0">
        <CardTitle>Sign Up to Present</CardTitle>
        <CardDescription>
          {meetingDate}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <Textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Brief description of what you'll present"
            required
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => {
            if (onSuccess) onSuccess(selectedSlot)
          }}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Sign Up"}
          </Button>
        </div>
      </form>
      <Toaster />
    </>
  )
}

