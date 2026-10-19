
# Kaizen

**Kaizen** is a smart analytics platform engineered to eliminate guesswork from progressive overload. Built for continuous progression, it tracks, analyzes, and predicts your training metrics to optimize your strength journey. A web app for powerlifters, aspiring powerlifters, powerbuilders, or just people who want to track their SBD progression.

# Key Features

• RPE & Load Prediction: Calculates dynamic training targets based on recent session volume, recovery, and RPE history.

• Comprehensive Ledger: Detailed historical tracking for compound movements with visual trend trajectories.

• Relative Strength Index: Benchmarks your big three lifts against your current body weight to scale performance tiers.

<img width="1916" height="771" alt="image" src="https://github.com/user-attachments/assets/3247f605-f199-4256-9797-584a6873ead3" />
<img width="1920" height="926" alt="image" src="https://github.com/user-attachments/assets/021423b8-a395-495d-853e-e03b54b15b64" />
<img width="1904" height="927" alt="image" src="https://github.com/user-attachments/assets/19b0d69c-3068-4d1e-8999-e198b7f8932a" />


# Relative Strength Tracking via DOTS

To fairly evaluate strength progression across different body sizes, Kaizen implements the DOTS (Dynamic Objective Team Scoring) Coefficient. Introduced as a modern standard in powerlifting, the DOTS formula acts as a mathematical equalizer.
Instead of just looking at raw weight lifted, the platform calculates a score by multiplying your total compound lifting volume (Squat + Bench Press + Deadlift) by a gender-specific, weight-dependent polynomial coefficient:
<img width="476" height="98" alt="image" src="https://github.com/user-attachments/assets/b5bb83b6-71d0-4c33-a64a-35a7e92a177a" />


**Performance Tiers Evaluated:**

The platform uses this score to categorize your current physical performance tier:
• **Elite:** 500+ points
• **Advanced**: 400 - 500 points
• **Intermediate**: 300 - 400 points
• **Novice**: 200 - 300 points


**Tech Stack**

• Frontend: Next.js, TypeScript, Tailwind CSS
• Backend & Database: Supabase

# Getting Started


**Prerequisites**

Ensure you have Node.js (v18.0 or higher) installed.

**Installation & Setup**

1. Clone the repository:bash
git clone https://github.com/LightWater123/kaizen-app

2. Navigate into the directory:bash
cd kaizen-app

3. Install dependencies
npm install

4. Run the development server:bash
npm run dev

Open http://localhost:3000 in your browser to view the application.
