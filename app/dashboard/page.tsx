import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PredictionCard from '@/components/PredictionCard'
import TabsContainer from '@/components/TabsContainer'
import RelativePerformanceCard from '@/components/RelativePerformanceCard'
import { predictNextTarget, LiftLog } from '@/utils/formulas'
import ProgressionChart from '@/components/ProgressionChart'
import WeightCheckIn from '@/components/WeightCheckIn'
import Header from '@/components/Header'
import AboutSection from '@/components/AboutSection'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Authenticate session
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/')
  }

  // 2. Fetch user profile config
  const { data: profile } = await supabase
    .from('profiles')
    .select('preferred_unit, experience_level, gender, current_weight, display_name')
    .eq('id', user.id)
    .single()

  const unit = profile?.preferred_unit || 'lbs'
  const experienceLevel = profile?.experience_level || 'intermediate'
  const gender = (profile?.gender || 'male') as 'male' | 'female'
  const currentBodyweight = profile?.current_weight || 75
  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Athlete'

  // 3. Query historical data for the big three lifts
  const fetchLiftHistory = async (exercise: 'squat' | 'bench' | 'deadlift') => {
    const { data } = await supabase
      .from('lift_logs')
      .select('weight, reps, rpe, logged_at')
      .eq('user_id', user.id)
      .eq('exercise', exercise)
      .order('logged_at', { ascending: false })

    return (data || []) as (LiftLog & { logged_at: string })[]
  }

  const [squatHistory, benchHistory, deadliftHistory] = await Promise.all([
    fetchLiftHistory('squat'),
    fetchLiftHistory('bench'),
    fetchLiftHistory('deadlift'),
  ])

  // 4. Calculate Absolute SBD Total
  const maxSquat = squatHistory.length > 0 ? Math.max(...squatHistory.map((l) => l.weight)) : 0
  const maxBench = benchHistory.length > 0 ? Math.max(...benchHistory.map((l) => l.weight)) : 0
  const maxDeadlift = deadliftHistory.length > 0 ? Math.max(...deadliftHistory.map((l) => l.weight)) : 0
  const sbdTotal = maxSquat + maxBench + maxDeadlift

  // 5. Query recent 10 logs for spreadsheet view
  const { data: recentHistory } = await supabase
    .from('lift_logs')
    .select('id, exercise, weight, reps, rpe, notes, logged_at')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(10)

  const historyLogs = recentHistory || []

  // 6. Predict targets
  const squatTarget = predictNextTarget({ history: squatHistory.slice(0, 4), experienceLevel, exercise: 'squat', unit })
  const benchTarget = predictNextTarget({ history: benchHistory.slice(0, 4), experienceLevel, exercise: 'bench', unit })
  const deadliftTarget = predictNextTarget({ history: deadliftHistory.slice(0, 4), experienceLevel, exercise: 'deadlift', unit })

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header
        userEmail={user.email ?? ''}
        displayName={displayName}
        preferredUnit={unit}
        experienceLevel={experienceLevel}
      />

      <main className="p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
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
              previousLift={
                squatHistory[0]
                  ? `${squatHistory[0].weight}${unit} × ${squatHistory[0].reps} (RPE ${squatHistory[0].rpe})`
                  : null
              }
              previousDate={
                squatHistory[0]
                  ? new Date(squatHistory[0].logged_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : null
              }
            />
            <PredictionCard
              exerciseName="Bench Press"
              targetWeight={benchTarget.targetWeight}
              targetReps={benchTarget.targetReps}
              message={benchTarget.message}
              isFirstSession={benchTarget.isFirstSession}
              isDeload={benchTarget.isDeload}
              unit={unit}
              previousLift={
                benchHistory[0]
                  ? `${benchHistory[0].weight}${unit} × ${benchHistory[0].reps} (RPE ${benchHistory[0].rpe})`
                  : null
              }
              previousDate={
                benchHistory[0]
                  ? new Date(benchHistory[0].logged_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : null
              }
            />
            <PredictionCard
              exerciseName="Deadlift"
              targetWeight={deadliftTarget.targetWeight}
              targetReps={deadliftTarget.targetReps}
              message={deadliftTarget.message}
              isFirstSession={deadliftTarget.isFirstSession}
              isDeload={deadliftTarget.isDeload}
              unit={unit}
              previousLift={
                deadliftHistory[0]
                  ? `${deadliftHistory[0].weight}${unit} × ${deadliftHistory[0].reps} (RPE ${deadliftHistory[0].rpe})`
                  : null
              }
              previousDate={
                deadliftHistory[0]
                  ? new Date(deadliftHistory[0].logged_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : null
              }
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
              <WeightCheckIn currentWeight={currentBodyweight} unit={unit} />
            </div>
          </div>

          {/* Analytics & Input Panels */}
          <div id="analytics" className="grid grid-cols-1 lg:grid-cols-2 gap-8 scroll-mt-24">
            <ProgressionChart historyLogs={historyLogs} unit={unit} />
            <TabsContainer unit={unit} historyLogs={historyLogs} />
          </div>

          <AboutSection/>
        </div>
      </main>
    </div>
  )
}