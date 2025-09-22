import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Import the new SharedLayout
import SharedLayout from "./components/layout/SharedLayout";

// Import Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SymptomChecker from "./pages/SymptomChecker";
import TreatmentSearch from "./pages/TreatmentSearch";
import HospitalFinder from "./pages/HospitalFinder";
import ReportAnalysis from "./pages/ReportAnalysis";
import TreatmentJourney from "./pages/TreatmentJourney";
import BookConsultation from "./pages/BookConsultation";
import LocationTest from "./pages/LocationTest";
import LoginWithOtp from "./pages/OTPLogin";
import PrescriptionManager from "./pages/PrescriptionManager";

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Routes WITHOUT Navbar/Footer (Auth Pages) --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/otp-login" element={<LoginWithOtp />} />
        <Route path="/register" element={<Register />} />
        <Route index element={<Home />} />

        {/* --- Routes WITH Navbar/Footer (Shared Layout) --- */}
        <Route path="/" element={<SharedLayout />}>
          {/* `index` specifies the default child route for the parent's path */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="symptom-checker" element={<SymptomChecker />} />
          <Route path="treatments" element={<TreatmentSearch />} />
          <Route path="treatment-journey" element={<TreatmentJourney />} />
          <Route path="book-consultation" element={<BookConsultation />} />
          <Route path="prescriptions" element={<PrescriptionManager />} />
          <Route path="hospitals" element={<HospitalFinder />} />
          <Route path="report-analysis" element={<ReportAnalysis />} />
          <Route path="location-test" element={<LocationTest />} />
        </Route>

        {/* Catch-all route to redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
