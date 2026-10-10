"use client"

import React, { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { calculateE1RM, calculateSBDTotal } from "@/utils/formulas"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/chart"
import { TrendingUp, Activity, ChevronDown, ChevronUp, Dumbbell, Trophy, Table, Trash2 } from "lucide-react"
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
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  // FIXED: Type expanded to explicitly support "all"
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
    // Step A: Chronologically sort logs from oldest to newest so lines draw forward in time
    const sortedLogs = [...historyLogs].sort(
      (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
    );

    if (selectedExercise !== "all") {
      // Single Lift Mode: Return simple sequential list matching old functionality
      return sortedLogs
        .filter((log) => log.exercise === selectedExercise)
        .map((log) => ({
          date: new Date(log.logged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          weight: log.weight,
        }));
    }

    // Bulk Multi-line Mode: Group workouts occurring on the exact same calendar day
    const groupedByDate: Record<string, { date: string; squat?: number; bench?: number; deadlift?: number }> = {};

    sortedLogs.forEach((log) => {
      const dateKey = new Date(log.logged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { date: dateKey };
      }

      // Explicitly assign the correct key based on the exercise string value
      if (log.exercise === "squat") groupedByDate[dateKey].squat = log.weight;
      if (log.exercise === "bench") groupedByDate[dateKey].bench = log.weight;
      if (log.exercise === "deadlift") groupedByDate[dateKey].deadlift = log.weight;
    });

    return Object.values(groupedByDate);
  }, [historyLogs, selectedExercise]);

  // 5. Build full spreadsheet table records list (Handles 'all' fallback perfectly)
  const filteredTableLogs = React.useMemo(() => {
    if (selectedExercise === "all") return historyLogs
    return historyLogs.filter((log) => log.exercise === selectedExercise)
  }, [historyLogs, selectedExercise])

  // Checkbox management handlers
  const handleSelectAllToggle = () => {
    if (selectedLogIds.length === filteredTableLogs.length) {
      setSelectedLogIds([]) // Clear selection if everything is checked
    } else {
      setSelectedLogIds(filteredTableLogs.map(log => log.id)) // Select all visible ids
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
      setSelectedLogIds([]) // Clear checkboxes on complete context execution
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to wipe data matrix logs.")
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const chartConfig: ChartConfig = {
    weight: {
      label: `Weight Lifted (${unit})`,
      color: "#3b82f6",
    },
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 text-slate-50 shadow-xl p-6 transition-all duration-300">
      
      {/* Overview Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-800/60 gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-lg tracking-tight flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            Performance & Analytics
          </h3>
          <p className="text-xs text-slate-400">
            Weekly log metrics and total strength summary indices.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl self-start">
          <Trophy className="h-4 w-4 text-amber-500" />
          <div className="text-right">
            <p className="text-[10px] uppercase font-black tracking-wider text-slate-500 leading-none">SBD Total</p>
            <p className="text-sm font-black text-slate-100 mt-0.5">{sbdTotal} <span className="text-xs font-normal text-slate-400">{unit}</span></p>
          </div>
        </div>
      </div>

      {/* Lifts of the Week Container */}
      <div className="py-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <Dumbbell className="h-3.5 w-3.5 text-slate-500" />
          Lifts of the Week (Trailing 7 Days)
        </h4>

        {weeklyLogs.length === 0 ? (
          <p className="text-sm text-slate-500 italic bg-slate-950/20 rounded-xl p-4 text-center border border-dashed border-slate-800/50">
            No exercises recorded yet this week. Fire up the input tab to log data!
          </p>
        ) : (
          <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {weeklyLogs.map((log, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-950/40 border border-slate-800/40 rounded-xl px-4 py-2.5">
                <div>
                  <p className="text-sm font-bold text-slate-200 capitalize">{log.exercise === 'bench' ? 'Bench Press' : log.exercise}</p>
                  <p className="text-[11px] text-slate-500">{new Date(log.logged_at).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-blue-400">{log.weight}{unit} <span className="text-xs font-normal text-slate-400">x {log.reps}</span></p>
                  <p className="text-[10px] text-slate-500 font-medium">Est. 1RM: {Math.round(calculateE1RM(log.weight, log.reps))}{unit}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accordion Toggle Switch Button */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold tracking-wide hover:bg-slate-800/50 hover:text-white transition group"
      >
        <span>{isExpanded ? "Collapse Detailed Records" : "Expand Historical Data & Timeline"}</span>
        {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>

      {/* Expanded Segmented Trajectory Layout Section */}
      {isExpanded && (
        <div className="pt-6 mt-4 border-t border-slate-800/60 space-y-6 animate-in fade-in duration-200">
          
          {/* Controls Menu with updated 'all' toggle variant */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Lift Workspace
            </p>
            <div className="inline-flex h-8 items-center justify-center rounded-lg bg-slate-950 p-1 text-slate-400 border border-slate-800/60 scale-95 origin-right">
              {(["all", "squat", "bench", "deadlift"] as const).map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => { setSelectedExercise(ex); setSelectedLogIds([]); }} // Clear selections on swap
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide transition-all ${
                    selectedExercise === ex ? "bg-slate-800 text-slate-50 shadow-sm" : "hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  {ex === "bench" ? "Bench" : ex}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Timeline Graph Displaying Actual Weights Lifted */}
          <div className="py-2">
            <div className="flex justify-between items-center mb-2">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Timeline Vector ({unit})</h5>
              
              {/* CUSTOM TIMELINE LEGEND KEY */}
              {selectedExercise === "all" && (
                <div className="flex gap-3 text-[10px] uppercase font-black tracking-wider bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 block" /> Squat</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 block" /> Bench</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 block" /> Deadlift</div>
                </div>
              )}
            </div>

            {chartData.length === 0 ? (
              <div className="h-[180px] flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl bg-slate-950/20 text-center p-4">
                <p className="text-xs font-medium text-slate-400">Data Pipeline Empty</p>
              </div>
            ) : (
              <div className="h-[180px] w-full bg-slate-950/20 p-2 rounded-xl border border-slate-800/40">
                {/* 1. FIXED: Removed explicit tight config typing on ChartContainer to handle union types */}
                <ChartContainer config={chartConfig} className="h-full w-full">
                  {/* 2. FIXED: Explicitly cast data to a permissive object record array to satisfy Recharts internal typing */}
                  <LineChart 
                    data={chartData as Record<string, unknown>[]} 
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b/40" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} dy={8} />
                    <YAxis tickLine={false} axisLine={false} domain={["dataMin - 15", "dataMax + 15"]} />
                    
                    {/* 3. FIXED: Re-mapped Formatter return types using standard primitive fallbacks */}
                    <ChartTooltip
                      formatter={(value: unknown, name: unknown) => {
                        const stringName = typeof name === 'string' ? name : String(name || '');
                        const capitalizedName = stringName.charAt(0).toUpperCase() + stringName.slice(1);
                        return [`${value} ${unit}`, capitalizedName];
                      }}
                      content={<ChartTooltipContent />}
                    />
                    
                    {/* SQUAT MOVEMENT VECTOR LINE (Red) */}
                    {(selectedExercise === "all" || selectedExercise === "squat") && (
                      <Line
                        type="monotone"
                        dataKey={selectedExercise === "all" ? "squat" : "weight"}
                        name="squat"
                        stroke="#ef4444" 
                        strokeWidth={2}
                        connectNulls 
                        dot={{ fill: "#0f172a", stroke: "#ef4444", strokeWidth: 2, r: 3.5 }}
                        activeDot={{ fill: "#ef4444", stroke: "#0f172a", strokeWidth: 2, r: 5 }}
                      />
                    )}

                    {/* BENCH PRESS MOVEMENT VECTOR LINE (Green) */}
                    {(selectedExercise === "all" || selectedExercise === "bench") && (
                      <Line
                        type="monotone"
                        dataKey={selectedExercise === "all" ? "bench" : "weight"}
                        name="bench"
                        stroke="#10b981" 
                        strokeWidth={2}
                        connectNulls
                        dot={{ fill: "#0f172a", stroke: "#10b981", strokeWidth: 2, r: 3.5 }}
                        activeDot={{ fill: "#10b981", stroke: "#0f172a", strokeWidth: 2, r: 5 }}
                      />
                    )}

                    {/* DEADLIFT MOVEMENT VECTOR LINE (Yellow) */}
                    {(selectedExercise === "all" || selectedExercise === "deadlift") && (
                      <Line
                        type="monotone"
                        dataKey={selectedExercise === "all" ? "deadlift" : "weight"}
                        name="deadlift"
                        stroke="#eab308" 
                        strokeWidth={2}
                        connectNulls
                        dot={{ fill: "#0f172a", stroke: "#eab308", strokeWidth: 2, r: 3.5 }}
                        activeDot={{ fill: "#eab308", stroke: "#0f172a", strokeWidth: 2, r: 5 }}
                      />
                    )}
                  </LineChart>
                </ChartContainer>
              </div>
            )}
          </div>

          {/* INTEGRATED SPREADSHEET LEDGER CONTAINER WITH BULK CONTROLS */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Table className="h-3.5 w-3.5 text-slate-500" />
                Spreadsheet View Ledger {selectedExercise !== 'all' && `(${selectedExercise})`}
              </h5>
              
              {/* Dynamic Action Trigger Bar for checked entries */}
              {selectedLogIds.length > 0 && (
                <button
                  type="button"
                  disabled={isBulkDeleting}
                  onClick={handleBulkDeleteExecute}
                  className="px-2.5 py-1 text-[10px] bg-red-950/40 border border-red-900 text-red-400 font-bold uppercase rounded-lg hover:bg-red-900 hover:text-white transition flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2 duration-150"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete Selected ({selectedLogIds.length})
                </button>
              )}
            </div>
            
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/20 shadow-inner">
              {/* Table Headers featuring master select input box */}
              <div className="grid grid-cols-12 gap-2 p-3 bg-slate-900/60 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 items-center">
                <div className="col-span-1 flex items-center pl-1">
                  <input
                    type="checkbox"
                    checked={filteredTableLogs.length > 0 && selectedLogIds.length === filteredTableLogs.length}
                    onChange={handleSelectAllToggle}
                    className="w-3.5 h-3.5 rounded bg-slate-950 border border-slate-800 checked:bg-blue-500 text-blue-500 cursor-pointer accent-blue-500"
                  />
                </div>
                <div className="col-span-3">Lift</div>
                <div className="col-span-2">Weight</div>
                <div className="col-span-2">Reps</div>
                <div className="col-span-2">RPE</div>
                <div className="col-span-2">Date</div>
              </div>

              {/* Hybrid Row Mapping List */}
              <div className="divide-y divide-slate-800/40 max-h-[240px] overflow-y-auto custom-scrollbar">
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
                  <p className="text-xs text-slate-500 text-center py-8 italic">
                    No logged {selectedExercise === 'all' ? 'workout' : selectedExercise} sets found in history.
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span>Translating raw relational grid records directly into client metrics curves.</span>
          </div>

        </div>
      )}
    </div>
  )
}