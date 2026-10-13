import { lazy, Suspense } from 'react';
import type { ReactElement } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Auth page stays eager (first paint); the app pages are split into separate chunks.
import Auth from './pages/Auth';

const Home = lazy(() => import('./pages/Home'));
const Agency = lazy(() => import('./pages/Agency'));
const Templates = lazy(() => import('./pages/Templates'));
const CreateAgency = lazy(() => import('./pages/CreateAgency'));
const Contacts = lazy(() => import('./pages/Contacts'));
const Campaigns = lazy(() => import('./pages/Campaigns'));
const CampaignDetail = lazy(() => import('./pages/CampaignDetail'));
const Settings = lazy(() => import('./pages/Settings'));
const CreateTemplate = lazy(() => import('./pages/CreateTemplate'));
const CreateContact = lazy(() => import('./pages/CreateContact'));
const CreateCampaign = lazy(() => import('./pages/CreateCampaign'));

const protectedPage = (page: ReactElement) => (
    <ProtectedRoute>
        <AppLayout>
            <Suspense fallback={<p className="text-sm text-slate-500">Loading…</p>}>{page}</Suspense>
        </AppLayout>
    </ProtectedRoute>
);

function App() {
    return (
        <div className="min-h-screen bg-[#020817] font-['Inter',sans-serif]">
            <Router>
                <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/" element={<Navigate to="/auth" replace />} />
                    <Route path="/agencies" element={protectedPage(<Home />)} />
                    <Route path="/agency/:id" element={protectedPage(<Agency />)} />
                    <Route path="/agencies/create" element={protectedPage(<CreateAgency />)} />
                    <Route path="/templates" element={protectedPage(<Templates />)} />
                    <Route path="/templates/create" element={protectedPage(<CreateTemplate />)} />
                    <Route path="/contacts" element={protectedPage(<Contacts />)} />
                    <Route path="/contacts/create" element={protectedPage(<CreateContact />)} />
                    <Route path="/campaigns" element={protectedPage(<Campaigns />)} />
                    <Route path="/campaigns/create" element={protectedPage(<CreateCampaign />)} />
                    <Route path="/campaigns/:id" element={protectedPage(<CampaignDetail />)} />
                    <Route path="/settings" element={protectedPage(<Settings />)} />
                    {/* Fallback - unknown route goes to auth */}
                    <Route path="*" element={<Navigate to="/auth" replace />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
