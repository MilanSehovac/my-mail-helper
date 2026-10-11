import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Auth pages
import Auth from './pages/Auth';

// App pages
import Home from './pages/Home';
import Agency from './pages/Agency';
import Templates from './pages/Templates';
import CreateAgency from './pages/CreateAgency';
import Contacts from './pages/Contacts';
import Campaigns from './pages/Campaigns';
import Settings from './pages/Settings';
import CreateTemplate from './pages/CreateTemplate';
import CreateContact from './pages/CreateContact';
import CreateCampaign from './pages/CreateCampaign';

function App() {
    return (
        <div className="min-h-screen bg-[#020817] font-['Inter',sans-serif]">
            <Router>
                <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/" element={<Navigate to="/auth" replace />} />
                    {/* Agency rute */}
                    <Route
                        path="/agencies"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <Home />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/agency/:id"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <Agency />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/agencies/create"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <CreateAgency />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    {/* Template rute */}
                    <Route
                        path="/templates"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <Templates />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/templates/create"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <CreateTemplate />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    {/* Contact rute */}
                    <Route
                        path="/contacts"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <Contacts />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/contacts/create"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <CreateContact />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    {/* Campaign rute */}
                    <Route
                        path="/campaigns"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <Campaigns />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/campaigns/create"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <CreateCampaign />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    {/* Settings ruta */}
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <AppLayout>
                                    <Settings />
                                </AppLayout>
                            </ProtectedRoute>
                        }
                    />
                    {/* Fallback - ako nema rute, idi na auth */}
                    <Route path="*" element={<Navigate to="/auth" replace />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;