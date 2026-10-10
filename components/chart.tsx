"use client"

import * as React from "react"
import * as Recharts from "recharts"
import { cn } from "@/utils/cn"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"

// Explicit type layout for shadcn config object
export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    color?: string
  }
}

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

export function ChartContainer({
  config,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { config: ChartConfig }) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        className={cn(
          "flex aspect-video justify-center text-xs text-slate-400 [&_.recharts-cartesian-grid-horizontal_line]:stroke-slate-800 [&_.recharts-cartesian-grid-vertical_line]:stroke-slate-800 [&_.recharts-curve_path.recharts-tooltip-cursor]:stroke-slate-800 [&_.recharts-dot]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-sector]:outline-none [&_.recharts-surface]:overflow-visible [&_.recharts-surface]:outline-none [&_.recharts-tooltip-cursor]:stroke-slate-800",
          className
        )}
        {...props}
      >
        <Recharts.ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </Recharts.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

export function ChartTooltip({ ...props }: React.ComponentProps<typeof Recharts.Tooltip>) {
  return <Recharts.Tooltip {...props} />
}

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean
    payload?: Array<{
      value: ValueType
      name: NameType
      payload: any // eslint-disable-line @typescript-eslint/no-explicit-any
    }>
    hideLabel?: boolean
    labelKey?: string
  }
>(({ active, payload, className, hideLabel = false }, ref) => {
  if (!active || !payload?.length) return null

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-slate-800 bg-slate-950 p-3 shadow-md space-y-1 min-w-[120px]",
        className
      )}
    >
      {!hideLabel && (
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          {payload[0].payload.date}
        </p>
      )}
      <div className="flex items-center gap-1.5">
        <div className="h-2 w-2 rounded-full bg-blue-500" />
        <p className="text-sm font-black text-slate-50">
          {payload[0].value} <span className="text-xs font-normal text-slate-500">kgs</span>
        </p>
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"