'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface FilterBarProps {
  children: React.ReactNode
  activeCount?: number
  className?: string
}

export function FilterBar({ children, activeCount = 0, className }: FilterBarProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop: inline */}
      <div className={cn('hidden md:block', className)}>{children}</div>

      {/* Mobile: sheet */}
      <div className={cn('md:hidden w-full')}>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between"
              aria-label={`Filters${activeCount > 0 ? `, ${activeCount} active` : ''}`}
            >
              <span>Filters</span>
              {activeCount > 0 && (
                <Badge variant="default" className="ml-2 text-xs px-1.5 py-0.5">
                  {activeCount}
                </Badge>
              )}
              <span className="material-symbols-outlined ml-2">filter_list</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[80vh] overflow-auto">
            <div className="flex flex-col gap-4 pt-4">{children}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}