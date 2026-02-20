import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import PatientDashboard from './pages/patient/PatientDashboard'
import RehabProgram from './pages/patient/RehabProgram'
import DailyCheckin from './pages/patient/DailyCheckin'
import SymptomReport from './pages/patient/SymptomReport'
import Medications from './pages/patient/Medications'
import Messages from './pages/patient/Messages'
import Education from './pages/patient/Education'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import PatientDetail from './pages/doctor/PatientDetail'
import ProgramManager from './pages/doctor/ProgramManager'
import Alerts from './pages/doctor/Alerts'
import DoctorMessages from './pages/doctor/DoctorMessages'

function ProtectedRoute({ children, role }) {
    const { user, profile, loading } = useAuth()

    if (loading) {
        return (
            <div className="loading-page">
                <div className="spinner" />
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Loading...</p>
            </div>
        )
    }

    if (!user) return <Navigate to="/login" replace />
    if (role && profile?.role !== role) {
        return <Navigate to={profile?.role === 'doctor' ? '/doctor' : '/patient'} replace />
    }
    if (user && profile && !profile.onboarding_completed) {
        return <Navigate to="/onboarding" replace />
    }
    return children
}

function AuthRoute({ children }) {
    const { user, profile, loading } = useAuth()
    if (loading) return null
    if (user && profile?.onboarding_completed) {
        return <Navigate to={profile.role === 'doctor' ? '/doctor' : '/patient'} replace />
    }
    return children
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
                    <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
                    <Route path="/onboarding" element={<Onboarding />} />

                    {/* Patient routes */}
                    <Route path="/patient" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
                    <Route path="/patient/program" element={<ProtectedRoute role="patient"><RehabProgram /></ProtectedRoute>} />
                    <Route path="/patient/checkin" element={<ProtectedRoute role="patient"><DailyCheckin /></ProtectedRoute>} />
                    <Route path="/patient/symptoms" element={<ProtectedRoute role="patient"><SymptomReport /></ProtectedRoute>} />
                    <Route path="/patient/medications" element={<ProtectedRoute role="patient"><Medications /></ProtectedRoute>} />
                    <Route path="/patient/messages" element={<ProtectedRoute role="patient"><Messages /></ProtectedRoute>} />
                    <Route path="/patient/education" element={<ProtectedRoute role="patient"><Education /></ProtectedRoute>} />

                    {/* Doctor routes */}
                    <Route path="/doctor" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
                    <Route path="/doctor/patients/:id" element={<ProtectedRoute role="doctor"><PatientDetail /></ProtectedRoute>} />
                    <Route path="/doctor/programs" element={<ProtectedRoute role="doctor"><ProgramManager /></ProtectedRoute>} />
                    <Route path="/doctor/alerts" element={<ProtectedRoute role="doctor"><Alerts /></ProtectedRoute>} />
                    <Route path="/doctor/messages" element={<ProtectedRoute role="doctor"><DoctorMessages /></ProtectedRoute>} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}
