"use client"

import React, { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { calculateE1RM, calculateSBDTotal } from "@/utils/formulas"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/chart"
import { TrendingUp, Activity, Dumbbell, Trophy, Table, Trash2 } from "lucide-react"
import LedgerRow from '@/components/LedgerRow'
import { deleteMultipleLiftLogs } from "@/app/actions/lifts"

interface HistoryItem {
  id: string        
  exercise: string
  weight: number
  reps: number
  rpe: number       
  notes?: string    
  logged_at: string
}

interface ProgressionChartProps {
  historyLogs: HistoryItem[]
  unit: "lbs" | "kg"
}

export default function ProgressionChart({ historyLogs, unit }: ProgressionChartProps) {
  const [selectedExercise, setSelectedExercise] = useState<"all" | "squat" | "bench" | "deadlift">("squat")
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([])
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  const [now] = useState(() => Date.now())

  const sbdTotal = React.useMemo(() => {
    return calculateSBDTotal(historyLogs)
  }, [historyLogs])

  const weeklyLogs = React.useMemo(() => {
    const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000
    const sevenDaysAgo = new Date(now - SEVEN_DAYS_IN_MS)
    return historyLogs.filter((log) => new Date(log.logged_at) >= sevenDaysAgo)
  }, [historyLogs, now])

  // Refocus Chart: Handle multi-line date grouping when "all" workspace is selected
  const chartData = React.useMemo(() => {
    const sortedLogs = [...historyLogs].sort(
      (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
    );

    if (selectedExercise !== "all") {
      return sortedLogs
        .filter((log) => log.exercise === selectedExercise)
        .map((log) => ({
          date: new Date(log.logged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          weight: log.weight,
        }));
    }

    const groupedByDate: Record<string, { date: string; squat?: number; bench?: number; deadlift?: number }> = {};

    sortedLogs.forEach((log) => {
      const dateKey = new Date(log.logged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { date: dateKey };
      }

      if (log.exercise === "squat") groupedByDate[dateKey].squat = log.weight;
      if (log.exercise === "bench") groupedByDate[dateKey].bench = log.weight;
      if (log.exercise === "deadlift") groupedByDate[dateKey].deadlift = log.weight;
    });

    return Object.values(groupedByDate);
  }, [historyLogs, selectedExercise]);

  const filteredTableLogs = React.useMemo(() => {
    if (selectedExercise === "all") return historyLogs
    return historyLogs.filter((log) => log.exercise === selectedExercise)
  }, [historyLogs, selectedExercise])

  const handleSelectAllToggle = () => {
    if (selectedLogIds.length === filteredTableLogs.length) {
      setSelectedLogIds([])
    } else {
      setSelectedLogIds(filteredTableLogs.map(log => log.id))
    }
  }

  const handleRowSelectToggle = (id: string) => {
    setSelectedLogIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleBulkDeleteExecute = async () => {
    if (!confirm(`Are you absolutely sure you want to permanently delete ${selectedLogIds.length} checked logs?`)) return
    setIsBulkDeleting(true)
    try {
      await deleteMultipleLiftLogs(selectedLogIds)
      setSelectedLogIds([])
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to wipe data matrix logs.")
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const chartConfig: ChartConfig = {
    weight: {
      label: `Weight Lifted (${unit})`,
      color: "#f59e0b",
    },
  }

  return (
    <div className="rounded-2xl border border-zinc-200/90 dark:border-white/10 bg-white dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-50 shadow-sm p-6 transition-colors duration-200">
      
      {/* Overview Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-lg tracking-tight flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
            <Activity className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Performance & Analytics
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Weekly log metrics and total strength summary indices.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 px-3.5 py-1.5 rounded-xl self-start shadow-sm">
          <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <div className="text-right">
            <p className="text-[10px] uppercase font-black tracking-wider text-zinc-400 dark:text-zinc-500 leading-none">
              SBD Total
            </p>
            <p className="text-sm font-black text-zinc-900 dark:text-zinc-50 mt-0.5">
              {sbdTotal} <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">{unit}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Trailing 7 Days Section */}
      <div className="py-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-1.5">
          <Dumbbell className="h-3.5 w-3.5 text-zinc-400" />
          Lifts of the Week (Trailing 7 Days)
        </h4>

        {weeklyLogs.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 italic bg-zinc-50 dark:bg-zinc-950/40 rounded-xl p-4 text-center border border-dashed border-zinc-200 dark:border-zinc-800">
            No exercises recorded yet this week. Fire up the input tab to log data!
          </p>
        ) : (
          <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {weeklyLogs.map((log, index) => (
              <div key={index} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 rounded-xl px-4 py-2.5">
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 capitalize">
                    {log.exercise === 'bench' ? 'Bench Press' : log.exercise}
                  </p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    {new Date(log.logged_at).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-amber-600 dark:text-amber-400">
                    {log.weight}{unit} <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">x {log.reps}</span>
                  </p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                    Est. 1RM: {Math.round(calculateE1RM(log.weight, log.reps))}{unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workspace & Chart Section */}
      <div className="pt-6 mt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-6">
        
        {/* Workspace selector tabs */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Select Lift Workspace
          </p>
          <div className="inline-flex h-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-950 p-1 text-zinc-500 border border-zinc-200 dark:border-zinc-800 scale-95 origin-right">
            {(["all", "squat", "bench", "deadlift"] as const).map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => { setSelectedExercise(ex); setSelectedLogIds([]); }}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide transition-all ${
                  selectedExercise === ex 
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm" 
                    : "hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {ex === "bench" ? "Bench" : ex}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Graph */}
        <div className="py-2">
          <div className="flex justify-between items-center mb-2">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Timeline Vector ({unit})
            </h5>
            
            {/* Custom Multi-line Legend */}
            {selectedExercise === "all" && (
              <div className="flex gap-3 text-[10px] uppercase font-bold tracking-wider bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-lg text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100 block" /> Squat</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 block" /> Bench</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-400 block" /> Deadlift</div>
              </div>
            )}
          </div>

          {chartData.length === 0 ? (
            <div className="h-[180px] flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 text-center p-4">
              <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">Data Pipeline Empty</p>
            </div>
          ) : (
            <div className="h-[180px] w-full bg-zinc-50/50 dark:bg-zinc-950/40 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800/80">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <LineChart 
                  data={chartData as Record<string, unknown>[]} 
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-zinc-200 dark:stroke-zinc-800/60" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} dy={8} className="text-zinc-400 dark:text-zinc-500 text-[10px]" />
                  <YAxis tickLine={false} axisLine={false} domain={["dataMin - 15", "dataMax + 15"]} className="text-zinc-400 dark:text-zinc-500 text-[10px]" />
                  
                  <ChartTooltip
                    formatter={(value: unknown, name: unknown) => {
                      const stringName = typeof name === 'string' ? name : String(name || '');
                      const capitalizedName = stringName.charAt(0).toUpperCase() + stringName.slice(1);
                      return [`${value} ${unit}`, capitalizedName];
                    }}
                    content={<ChartTooltipContent />}
                  />
                  
                  {/* SQUAT MOVEMENT LINE */}
                  {(selectedExercise === "all" || selectedExercise === "squat") && (
                    <Line
                      type="monotone"
                      dataKey={selectedExercise === "all" ? "squat" : "weight"}
                      name="squat"
                      stroke="#f4f4f5" 
                      strokeWidth={2}
                      connectNulls 
                      dot={{ fill: "#18181b", stroke: "#f4f4f5", strokeWidth: 2, r: 3.5 }}
                      activeDot={{ fill: "#f4f4f5", stroke: "#18181b", strokeWidth: 2, r: 5 }}
                    />
                  )}

                  {/* BENCH PRESS MOVEMENT LINE */}
                  {(selectedExercise === "all" || selectedExercise === "bench") && (
                    <Line
                      type="monotone"
                      dataKey={selectedExercise === "all" ? "bench" : "weight"}
                      name="bench"
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      connectNulls
                      dot={{ fill: "#18181b", stroke: "#f59e0b", strokeWidth: 2, r: 3.5 }}
                      activeDot={{ fill: "#f59e0b", stroke: "#18181b", strokeWidth: 2, r: 5 }}
                    />
                  )}

                  {/* DEADLIFT MOVEMENT LINE */}
                  {(selectedExercise === "all" || selectedExercise === "deadlift") && (
                    <Line
                      type="monotone"
                      dataKey={selectedExercise === "all" ? "deadlift" : "weight"}
                      name="deadlift"
                      stroke="#71717a" 
                      strokeWidth={2}
                      connectNulls
                      dot={{ fill: "#18181b", stroke: "#71717a", strokeWidth: 2, r: 3.5 }}
                      activeDot={{ fill: "#71717a", stroke: "#18181b", strokeWidth: 2, r: 5 }}
                    />
                  )}
                </LineChart>
              </ChartContainer>
            </div>
          )}
        </div>

        {/* Spreadsheet Ledger Container */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
              <Table className="h-3.5 w-3.5 text-zinc-400" />
              Spreadsheet View Ledger {selectedExercise !== 'all' && `(${selectedExercise})`}
            </h5>
            
            {selectedLogIds.length > 0 && (
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={handleBulkDeleteExecute}
                className="px-2.5 py-1 text-[10px] bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-400 font-bold uppercase rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900 transition flex items-center gap-1.5"
              >
                <Trash2 className="h-3 w-3" />
                Delete Selected ({selectedLogIds.length})
              </button>
            )}
          </div>
          
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/40 shadow-inner">
            {/* Table Header Row */}
            <div className="grid grid-cols-12 gap-2 p-3 bg-zinc-100 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 items-center">
              <div className="col-span-1 flex items-center pl-1">
                <input
                  type="checkbox"
                  checked={filteredTableLogs.length > 0 && selectedLogIds.length === filteredTableLogs.length}
                  onChange={handleSelectAllToggle}
                  className="w-3.5 h-3.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 checked:bg-zinc-900 dark:checked:bg-amber-500 cursor-pointer accent-amber-500"
                />
              </div>
              <div className="col-span-3">Lift</div>
              <div className="col-span-2">Weight</div>
              <div className="col-span-2">Reps</div>
              <div className="col-span-2">RPE</div>
              <div className="col-span-2">Date</div>
            </div>

            {/* Hybrid Row Mapping List */}
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800/60 max-h-[240px] overflow-y-auto custom-scrollbar">
              {filteredTableLogs.map((log) => (
                <LedgerRow 
                  key={log.id} 
                  log={log} 
                  unit={unit}
                  isChecked={selectedLogIds.includes(log.id)}
                  onToggleSelect={() => handleRowSelectToggle(log.id)}
                />
              ))}
              
              {filteredTableLogs.length === 0 && (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center py-8 italic">
                  No logged {selectedExercise === 'all' ? 'workout' : selectedExercise} sets found in history.
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
          <TrendingUp className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span>Translating raw relational grid records directly into client metrics curves.</span>
        </div>

      </div>
    </div>
  )
}