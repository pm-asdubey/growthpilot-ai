import { GitMerge, Share2, Users } from 'lucide-react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/Dashboard'
import { LeadIntelligencePage } from '@/pages/LeadIntelligence'
import { ComingSoonPage } from '@/pages/ComingSoon'
import { SettingsPage } from '@/pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="lead-intelligence" element={<LeadIntelligencePage />} />
          <Route
            path="funnel"
            element={
              <ComingSoonPage
                icon={GitMerge}
                moduleName="Funnel Analysis"
                description="Visualise every stage of your acquisition funnel, pinpoint where prospects disengage, and understand what drives visitors to become customers."
                capabilities={[
                  'Stage-by-stage conversion visualisation',
                  'Drop-off rate analysis',
                  'Time-to-convert by stage',
                  'Funnel comparison across cohorts',
                  'AI-generated improvement recommendations',
                  'Exportable funnel report',
                ]}
              />
            }
          />
          <Route
            path="attribution"
            element={
              <ComingSoonPage
                icon={Share2}
                moduleName="Attribution Analysis"
                description="Understand which marketing channels and touchpoints drive conversion. Compare first-touch, last-touch, and multi-touch attribution models."
                capabilities={[
                  'First-touch attribution model',
                  'Last-touch attribution model',
                  'Linear multi-touch attribution',
                  'Channel revenue contribution',
                  'Campaign performance breakdown',
                  'AI-generated attribution insights',
                ]}
              />
            }
          />
          <Route
            path="segmentation"
            element={
              <ComingSoonPage
                icon={Users}
                moduleName="Segmentation"
                description="Automatically cluster your customer base by firmographic and behavioural attributes to reveal high-value segments and prioritise outreach."
                capabilities={[
                  'Automatic behavioural clustering',
                  'Firmographic segmentation',
                  'Segment size and conversion rates',
                  'High-value segment identification',
                  'Segment comparison charts',
                  'AI-generated segment profiles',
                ]}
              />
            }
          />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
