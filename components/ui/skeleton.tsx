// Shadcn UI Skeleton Component
// BidDeed.AI - Loading States
// Author: Ariel Shapira, Solo Founder, Everest Capital USA

import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-700", className)}
      {...props}
    />
  )
}

export { Skeleton }
