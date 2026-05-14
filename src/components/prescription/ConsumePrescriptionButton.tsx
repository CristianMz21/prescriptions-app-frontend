import { Button } from '@/components/ui/button'
import { routes } from '@/lib/routes'

interface ConsumePrescriptionButtonProps {
  prescriptionId: string
}

export function ConsumePrescriptionButton({
  prescriptionId,
}: ConsumePrescriptionButtonProps) {
  return (
    <form action={routes.patient.consume(prescriptionId)} method="post">
      <Button type="submit" variant="default" size="default">
        <span className="material-symbols-outlined text-lg">check</span>
        Mark as Consumed
      </Button>
    </form>
  )
}
