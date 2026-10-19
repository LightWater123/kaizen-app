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
          "flex aspect-video justify-center text-xs text-zinc-500 dark:text-zinc-400 [&_.recharts-cartesian-grid-horizontal_line]:stroke-zinc-200 dark:[&_.recharts-cartesian-grid-horizontal_line]:stroke-zinc-800/80 [&_.recharts-cartesian-grid-vertical_line]:stroke-zinc-200 dark:[&_.recharts-cartesian-grid-vertical_line]:stroke-zinc-800/80 [&_.recharts-curve_path.recharts-tooltip-cursor]:stroke-zinc-300 dark:[&_.recharts-curve_path.recharts-tooltip-cursor]:stroke-zinc-700 [&_.recharts-dot]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-sector]:outline-none [&_.recharts-surface]:overflow-visible [&_.recharts-surface]:outline-none [&_.recharts-tooltip-cursor]:stroke-zinc-300 dark:[&_.recharts-tooltip-cursor]:stroke-zinc-700",
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
      color?: string
      stroke?: string
      fill?: string
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
        "rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 shadow-xl space-y-1.5 min-w-[130px]",
        className
      )}
    >
      {!hideLabel && payload[0]?.payload?.date && (
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {payload[0].payload.date}
        </p>
      )}
      
      {/* Dynamic multi-line or single-line payload rendering */}
      <div className="space-y-1">
        {payload.map((item, index) => {
          const strokeColor = item.color || item.stroke || item.fill || "#f59e0b"
          const exerciseLabel = item.name ? String(item.name).toUpperCase() : ""

          return (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <div 
                  className="h-2 w-2 rounded-full" 
                  style={{ backgroundColor: strokeColor }} 
                />
                {exerciseLabel && (
                  <span className="text-[10px] font-bold uppercase text-zinc-500 dark:text-zinc-400">
                    {exerciseLabel}
                  </span>
                )}
              </div>
              <p className="text-xs font-black text-zinc-900 dark:text-zinc-50 font-mono">
                {item.value}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"