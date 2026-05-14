'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { routes } from '@/lib/routes'

interface ConsumePrescriptionButtonProps {
  prescriptionId: string
}

export function ConsumePrescriptionButton({
  prescriptionId,
}: ConsumePrescriptionButtonProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button type="button" variant="default" size="default">
            <span className="material-symbols-outlined text-lg">check</span>
            Mark as Consumed
          </Button>
        }
      />
      <PopoverContent className="w-80 p-4">
        <form
          action={routes.patient.consume(prescriptionId)}
          method="post"
          className="flex flex-col gap-3"
        >
          <Label htmlFor="consume-reason" className="label-uppercase">
            Reason (optional)
          </Label>
          <Textarea
            id="consume-reason"
            name="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you marking this as consumed?"
            rows={3}
            maxLength={500}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              <span className="material-symbols-outlined text-base">check</span>
              Confirm
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  )
}
