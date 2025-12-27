import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { setDoctorCredentials } from "../../store/slices/doctorAuthSlice";
import { doctorAuthAPI } from "../../services/api";
import { Stethoscope } from "lucide-react";
import TermsAndConditionsModal from "../../components/TermsAndConditionsModal";

const DoctorLogin: React.FC = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState<{ doctor: any; token: string; phone: string } | null>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/doctor/dashboard";

  // ----------------------------
  // SEND OTP
  // ----------------------------
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone) {
      toast.error("Please enter phone number");
      return;
    }    
    const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;

    setLoading(true);
    const loadingToastId = toast.loading("Sending OTP...");

    try {
      await doctorAuthAPI.sendOtp({ phone : formattedPhone });

      toast.success("OTP sent successfully!", { id: loadingToastId });
      setOtpSent(true);

    }catch (err: any) {
  const status = err.response?.status;
  const msg = err.response?.data?.error;

  if (status === 404) {
    toast.error("Doctor not found. Please register first.", {
      id: loadingToastId,
    });
  } else {
    toast.error(msg || "Failed to send OTP.", {
      id: loadingToastId,
    });
  }
} finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // VERIFY OTP
  // ----------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Enter the OTP");
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading("Verifying OTP...");

    try {
      let formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;
      const response = await doctorAuthAPI.verifyOtp({ phone : formattedPhone, otp });
      console.log(response.data.doctor);
      
      toast.success("OTP Verified!", { id: loadingToastId });
      
      const loginData = {
        doctor: response.data.doctor,
        token: response.data.token,
        phone: formattedPhone,
      };
      
      // Check if doctor has already accepted T&C
      if (response.data.doctor.hasAcceptedTnC) {
        // Doctor already accepted, proceed directly
        localStorage.setItem("doctorToken", loginData.token);
        localStorage.setItem("doctorInfo", JSON.stringify(loginData.doctor));
        localStorage.setItem("doctorPhone", loginData.phone);

        dispatch(
          setDoctorCredentials({
            doctor: loginData.doctor,
            token: loginData.token,
          })
        );

        toast.success("Login successful!");
        navigate(from, { replace: true });
      } else {
        // Show T&C modal for first-time acceptance
        setPendingLoginData(loginData);
        setShowTermsModal(true);
      }

    } catch (err: any) {
      toast.error(err.response?.data?.error || "Invalid OTP.", {
        id: loadingToastId,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle T&C acceptance
  const handleTermsAccept = async () => {
    if (pendingLoginData) {
      try {
        // Update T&C acceptance in backend
        await doctorAuthAPI.acceptTnC(pendingLoginData.phone);
        
        // Save to localStorage
        localStorage.setItem("doctorToken", pendingLoginData.token);
        localStorage.setItem("doctorInfo", JSON.stringify(pendingLoginData.doctor));
        localStorage.setItem("doctorPhone", pendingLoginData.phone);

        // Dispatch to Redux store
        dispatch(
          setDoctorCredentials({
            doctor: pendingLoginData.doctor,
            token: pendingLoginData.token,
          })
        );

        toast.success("Login successful!");
        setShowTermsModal(false);
        navigate(from, { replace: true });
      } catch (error) {
        console.error("Failed to save T&C acceptance:", error);
        // Still allow login even if T&C save fails
        localStorage.setItem("doctorToken", pendingLoginData.token);
        localStorage.setItem("doctorInfo", JSON.stringify(pendingLoginData.doctor));
        localStorage.setItem("doctorPhone", pendingLoginData.phone);

        dispatch(
          setDoctorCredentials({
            doctor: pendingLoginData.doctor,
            token: pendingLoginData.token,
          })
        );

        toast.success("Login successful!");
        setShowTermsModal(false);
        navigate(from, { replace: true });
      }
    }
  };

  // Handle T&C decline
  const handleTermsDecline = () => {
    setShowTermsModal(false);
    setPendingLoginData(null);
    toast.error("You must accept the Terms & Conditions to continue.");
    setOtpSent(false);
    setOtp("");
  };

return (
  <div className="h-screen bg-white overflow-hidden lg:grid lg:grid-cols-2">
    <Toaster position="top-right" />

    {/* Terms & Conditions Modal */}
    <TermsAndConditionsModal
      isOpen={showTermsModal}
      onAccept={handleTermsAccept}
      onDecline={handleTermsDecline}
    />

    {/* LEFT PANEL — Beautiful gradient like sample UI */}
    <div className="relative hidden w-full h-full flex-col justify-between bg-gradient-to-br from-slate-900 to-teal-900 p-8 text-white lg:flex">
      {/* Blurred decoration */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-green-500/30 rounded-full blur-3xl opacity-50"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-8 w-8 text-teal-300" />
          <span className="text-2xl font-bold">MediiMate • Doctors</span>
        </div>

        <h1 className="mt-12 text-4xl font-bold tracking-tight">
          Welcome Back, Doctor.
        </h1>
        <p className="mt-4 text-lg text-teal-200">
          Sign in securely with OTP authentication.
        </p>
      </div>

      <div className="relative z-10 mt-auto">
        <div className="rounded-xl bg-black/20 p-6 backdrop-blur-sm">
          <blockquote>
            "OTP login makes my workflow smoother. No passwords, no hassle."
          </blockquote>
          <footer className="mt-4 flex items-center gap-4">
            <img
              className="h-12 w-12 rounded-full object-cover"
              src="https://i.pravatar.cc/150?img=12"
              alt="Doctor"
            />
            <div>
              <p className="font-semibold text-white">Dr. Alicia</p>
              <p className="text-sm text-teal-200">Verified Practitioner</p>
            </div>
          </footer>
        </div>
      </div>
    </div>

    {/* RIGHT FORM PANEL */}
    <div className="flex w-full h-full flex-col justify-center p-8 overflow-y-auto">
      <div className="mx-auto w-full max-w-sm">

        <h2 className="text-3xl font-bold text-gray-900">
          Doctor Login
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/doctor/register"
            className="font-medium text-teal-600 hover:text-teal-500"
          >
            Register here
          </Link>
        </p>

        {/* --- FORM LOGIC stays SAME --- */}
        <form
          className="mt-8 space-y-6"
          onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
        >
          {/* PHONE INPUT */}
          {!otpSent && (
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>

              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter 10-digit number"
                />
              </div>
            </div>
          )}

          {/* OTP INPUT */}
          {otpSent && (
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700"
              >
                Enter OTP
              </label>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 w-full h-12 px-4 text-center tracking-[0.6em] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="••••••"
              />
            </div>
          )}

          {/* BUTTON */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : otpSent ? (
                "Verify OTP"
              ) : (
                "Send OTP"
              )}
            </button>
          </div>

          {/* Back to phone number */}
          {otpSent && (
            <div className="mt-4 text-center text-sm">
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="font-medium text-teal-600 hover:text-teal-500"
              >
                Use a different number
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  </div>
);

};

export default DoctorLogin;
