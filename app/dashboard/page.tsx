import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PredictionCard from '@/components/PredictionCard'
import LoggingForm from '@/components/LoggingForm'
import TabsContainer from '@/components/TabsContainer'
import RelativePerformanceCard from '@/components/RelativePerformanceCard'
import { predictNextTarget, LiftLog } from '@/utils/formulas'
import ProgressionChart from '@/components/ProgressionChart'
import WeightCheckIn from '@/components/WeightCheckIn'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Authenticate the user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/')
  }

  // 2. Fetch the user's profile configuration settings
  // UPDATED: Now capturing gender and current_weight alongside old fields
  const { data: profile } = await supabase
    .from('profiles')
    .select('preferred_unit, experience_level, gender, current_weight')
    .eq('id', user.id)
    .single()

  const unit = profile?.preferred_unit || 'lbs'
  const experienceLevel = profile?.experience_level || 'intermediate'
  const gender = (profile?.gender || 'male') as 'male' | 'female'
  const currentBodyweight = profile?.current_weight || 75 // Fallback baseline if empty

  // 3. Query historical data arrays for the big three lifts
  const fetchLiftHistory = async (exercise: 'squat' | 'bench' | 'deadlift') => {
    const { data } = await supabase
      .from('lift_logs')
      .select('weight, reps, rpe, logged_at')
      .eq('user_id', user.id)
      .eq('exercise', exercise)
      .order('logged_at', { ascending: false })
      
    return (data || []) as (LiftLog & { logged_at: string })[]
  }

  const squatHistory = await fetchLiftHistory('squat')
  const benchHistory = await fetchLiftHistory('bench')
  const deadliftHistory = await fetchLiftHistory('deadlift')

  // 4. Calculate Absolute SBD Total based on maximum logged weights
  // This looks at your entire history arrays and extracts the heaviest single values logged
  const maxSquat = squatHistory.length > 0 ? Math.max(...squatHistory.map(l => l.weight)) : 0
  const maxBench = benchHistory.length > 0 ? Math.max(...benchHistory.map(l => l.weight)) : 0
  const maxDeadlift = deadliftHistory.length > 0 ? Math.max(...deadliftHistory.map(l => l.weight)) : 0
  const sbdTotal = maxSquat + maxBench + maxDeadlift

  // 5. Query the last 10 logs total for the history log spreadsheet layout view
  const { data: recentHistory } = await supabase
    .from('lift_logs')
    .select('id, exercise, weight, reps, rpe, notes, logged_at')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(10)

  const historyLogs = recentHistory || []

  // 6. Pass historical tracking vectors into our prediction calculation engine
  const squatTarget = predictNextTarget({ history: squatHistory.slice(0, 4), experienceLevel, exercise: 'squat', unit })
  const benchTarget = predictNextTarget({ history: benchHistory.slice(0, 4), experienceLevel, exercise: 'bench', unit })
  const deadliftTarget = predictNextTarget({ history: deadliftHistory.slice(0, 4), experienceLevel, exercise: 'deadlift', unit })

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Dashboard Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">KAIZEN DASHBOARD</h1>
            <p className="text-slate-400 text-sm mt-1">
              Progress one step at a time.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider text-slate-400 uppercase">
            <span>Unit: {unit}</span>
            <span className="text-slate-700">|</span>
            <span>Level: {experienceLevel}</span>
          </div>
        </div>

        {/* Actionable Prediction Cards Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PredictionCard 
            exerciseName="Squat"
            targetWeight={squatTarget.targetWeight}
            targetReps={squatTarget.targetReps}
            message={squatTarget.message}
            isFirstSession={squatTarget.isFirstSession}
            isDeload={squatTarget.isDeload}
            unit={unit}
            previousLift={squatHistory[0] ? `${squatHistory[0].weight}${unit} × ${squatHistory[0].reps} (RPE ${squatHistory[0].rpe})` : null}
            previousDate={squatHistory[0] ? new Date(squatHistory[0].logged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null}
            
          />
          <PredictionCard 
            exerciseName="Bench Press"
            targetWeight={benchTarget.targetWeight}
            targetReps={benchTarget.targetReps}
            message={benchTarget.message}
            isFirstSession={benchTarget.isFirstSession}
            isDeload={benchTarget.isDeload}
            unit={unit}
            previousLift={benchHistory[0] ? `${benchHistory[0].weight}${unit} × ${benchHistory[0].reps} (RPE ${benchHistory[0].rpe})` : null}
            previousDate={benchHistory[0] ? new Date(benchHistory[0].logged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null}
          />
          <PredictionCard 
            exerciseName="Deadlift"
            targetWeight={deadliftTarget.targetWeight}
            targetReps={deadliftTarget.targetReps}
            message={deadliftTarget.message}
            isFirstSession={deadliftTarget.isFirstSession}
            isDeload={deadliftTarget.isDeload}
            unit={unit}
            previousLift={deadliftHistory[0] ? `${deadliftHistory[0].weight}${unit} × ${deadliftHistory[0].reps} (RPE ${deadliftHistory[0].rpe})` : null}
            previousDate={deadliftHistory[0] ? new Date(deadliftHistory[0].logged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <RelativePerformanceCard 
            sbdTotal={sbdTotal}
            currentBodyweight={currentBodyweight}
            gender={gender}
            unit={unit}
          />
        </div>
        <div className="md:col-span-1">
          <WeightCheckIn 
            currentWeight={currentBodyweight} 
            unit={unit} 
          />
        </div>
      </div>

        {/* Analytics & Input Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProgressionChart historyLogs={historyLogs} unit={unit} />
          <TabsContainer unit={unit} historyLogs={historyLogs} />
        </div>

      </div>
    </main>
  )
}