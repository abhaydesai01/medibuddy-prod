import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// --- Route Protection Components ---
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthenticatedRedirect } from "./components/AuthenticatedRedirect";
import { DoctorProtectedRoute } from "./components/DoctorProtectedRoute";

// --- Layout Components ---
import SharedLayout from "./components/layout/SharedLayout";
import DoctorLayout from "./components/layout/DoctorLayout";

// --- Page Components ---
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SymptomChecker from "./pages/SymptomChecker";
import TreatmentSearch from "./pages/TreatmentSearch";
import HospitalFinder from "./pages/HospitalFinder";
import ReportAnalysis from "./pages/ReportAnalysis";
import MealLogs from "./pages/MealLogs";
import TreatmentJourney from "./pages/TreatmentJourney";
import BookConsultation from "./pages/BookConsultation";
import LoginWithOtp from "./pages/OTPLogin";
import PrescriptionManager from "./pages/PrescriptionManager";
import UserProfilePage from "./pages/UserProfile";

// --- Doctor Page Components ---
import DoctorLogin from "./pages/doctor/DoctorLogin";
import DoctorRegister from "./pages/doctor/DoctorRegister";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import Vault from "./pages/doctor/Vault";
import DoctorPatients from "./pages/doctor/DoctorPatient";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";

// admin components
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminViewDoctors from "./pages/admin/AdminViewDoctors";
import AdminViewPatients from "./pages/admin/AdminViewPatients";
import AdminOnboardDoctor from "./pages/admin/AdminOnboardDoctor";
// A simple component for handling 404 Not Found pages
const NotFoundPage: React.FC = () => <h1>404: Page Not Found</h1>;

function App() {
  return (
    <Router>
      <Routes>
        {/*
          --- Public Routes ---
          These routes are for users who are NOT logged in.
          If a logged-in user tries to access them, they will be
          redirected to the dashboard.
        */}
        <Route
          path="/"
          element={
            <AuthenticatedRedirect>
              <Home />
            </AuthenticatedRedirect>
          }
        />
        <Route
          path="/login"
          element={
            <AuthenticatedRedirect>
              <Login />
            </AuthenticatedRedirect>
          }
        />
        <Route
          path="/otp-login"
          element={
            <AuthenticatedRedirect>
              <LoginWithOtp />
            </AuthenticatedRedirect>
          }
        />
        <Route
          path="/register"
          element={
            <AuthenticatedRedirect>
              <Register />
            </AuthenticatedRedirect>
          }
        />

        {/*
          --- Protected Routes ---
          These routes require the user to be logged in.
          They are nested within the SharedLayout, so they will
          all share the common Navbar and Footer.
        */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <SharedLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="symptom-checker" element={<SymptomChecker />} />
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="treatments" element={<TreatmentSearch />} />
          <Route path="treatment-journey" element={<TreatmentJourney />} />
          <Route path="book-consultation" element={<BookConsultation />} />
          <Route path="prescriptions" element={<PrescriptionManager />} />
          <Route path="hospitals" element={<HospitalFinder />} />
          <Route path="report-analysis" element={<ReportAnalysis />} />
          <Route path="mealLogs" element={<MealLogs />} />
        </Route>

        {/* ============================================
      ADMIN ROUTES
============================================ */}

<Route path="/admin" element={<AdminDashboard />} />
<Route path="/admin/doctors" element={<AdminViewDoctors />} />
<Route path="/admin/patients" element={<AdminViewPatients />} />
<Route path="/admin/onboard-doctor" element={<AdminOnboardDoctor />} />



        {/* ============================================
            DOCTOR ROUTES
        ============================================ */}

        {/* --- Public Doctor Routes --- */}
        <Route path="/doctor/login" element={<DoctorLogin />} />
        <Route path="/doctor/register" element={<DoctorRegister />} />

        



        {/* --- Protected Doctor Routes --- */}
        <Route
          path="/doctor"
          element={
            <DoctorProtectedRoute>
              <DoctorLayout />
            </DoctorProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="vault" element={<Vault />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="prescriptions" element={<DoctorPrescriptions />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          
          {/* Add more doctor routes here as you build them */}
          <Route
            path="patients"
            element={
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-800">
                  Patients Page - Coming Soon
                </h1>
              </div>
            }
          />
          <Route
            path="appointments"
            element={
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-800">
                  Appointments Page - Coming Soon
                </h1>
              </div>
            }
          />
          <Route
            path="prescriptions"
            element={
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-800">
                  Prescriptions Page - Coming Soon
                </h1>
              </div>
            }
          />
          <Route
            path="settings"
            element={
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-800">
                  Settings Page - Coming Soon
                </h1>
              </div>
            }
          />
        </Route>

        {/* --- Catch-all 404 Route --- */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
