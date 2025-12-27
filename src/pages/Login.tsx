import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/slices/authSlice";
// Assuming profileAPI is added to your services/api file
import { authAPI, profileAPI } from "../services/api";
import { Heart } from "lucide-react";
import TermsAndConditionsModal from "../components/TermsAndConditionsModal";

const Login: React.FC = () => {
  // --- State Management for Multi-Step Flow ---
  const [step, setStep] = useState<"phone" | "register" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState(""); // For new users
  const [email, setEmail] = useState(""); // For new users
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState<{ user: any; token: string } | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- Step 1: Check if user exists and send OTP ---
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phoneNumber)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading("Checking your number...");
    const fullPhoneNumber = `+91${phoneNumber}`;

    try {
      // API call to check if user exists
      // const response = await profileAPI.getProfileByIdentifier({
      //   phone: fullPhoneNumber,
      // });



      // If user is found (API returns success)
      // if (response.data.user) {
        toast.loading("Sending OTP to existing user...", {
          id: loadingToastId,
        });
        await authAPI.sendOtp(fullPhoneNumber);
        toast.success("OTP sent successfully!", { id: loadingToastId });
        setStep("otp");
      // }
    } catch (error: any) {
      // If user is not found (API returns 404), move to registration
      if (error.response?.status === 404) {
        toast.success("Welcome! Please tell us a bit about yourself.", {
          id: loadingToastId,
        });
        setStep("register");
      } else {
        toast.error(error.response?.data?.message || "Something went wrong.", {
          id: loadingToastId,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Step 2 (New Users): Register and send OTP ---
  const handleRegisterAndSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please enter your name and email.");
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading("Creating your account...");
    const fullPhoneNumber = `+91${phoneNumber}`;

    try {
      // NOTE: This assumes you have a new 'register' endpoint that also sends an OTP
      await authAPI.register({
        name,
        email,
        phone: fullPhoneNumber,
        password: `otp-user-${Date.now()}`, // Or handle this differently on the backend
      });
      toast.loading("Sending OTP...", { id: loadingToastId });
      await authAPI.sendOtp(fullPhoneNumber);
      toast.success("Account created! OTP sent.", { id: loadingToastId });
      setStep("otp");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Registration failed.", {
        id: loadingToastId,
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Step 3: Verify OTP and complete login ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhoneNumber = `+91${phoneNumber}`;
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading("Verifying OTP...");

    try {
      const response = await authAPI.verifyOtp(fullPhoneNumber, otp);
      toast.success("OTP Verified!", { id: loadingToastId });
      
      const userData = {
        user: response.data.user,
        token: response.data.token,
      };
      
      localStorage.setItem("patientPhone", fullPhoneNumber);
      
      // Check if user has already accepted T&C
      if (response.data.user.hasAcceptedTnC) {
        // User already accepted, proceed directly
        dispatch(setCredentials(userData));
        toast.success("Login Successful! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 500);
      } else {
        // Show T&C modal for first-time acceptance
        setPendingLoginData(userData);
        setShowTermsModal(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP.", {
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
        const fullPhoneNumber = `+91${phoneNumber}`;
        // Update T&C acceptance in backend
        await authAPI.acceptTnC(fullPhoneNumber);
        
        dispatch(setCredentials(pendingLoginData));
        toast.success("Login Successful! Redirecting...");
        setShowTermsModal(false);
        setTimeout(() => navigate("/dashboard"), 500);
      } catch (error) {
        console.error("Failed to save T&C acceptance:", error);
        // Still allow login even if T&C save fails
        dispatch(setCredentials(pendingLoginData));
        toast.success("Login Successful! Redirecting...");
        setShowTermsModal(false);
        setTimeout(() => navigate("/dashboard"), 500);
      }
    }
  };

  // Handle T&C decline
  const handleTermsDecline = () => {
    setShowTermsModal(false);
    setPendingLoginData(null);
    localStorage.removeItem("patientPhone");
    toast.error("You must accept the Terms & Conditions to continue.");
    setStep("phone");
    setOtp("");
  };

  const renderFormContent = () => {
    switch (step) {
      // --- PHONE INPUT FORM ---
      case "phone":
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900">
              Login with Phone
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your number to login or create an account.
            </p>
            <form className="mt-8 space-y-6" onSubmit={handlePhoneSubmit}>
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    id="phoneNumber"
                    className="w-full h-12 px-4 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your 10-digit phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </form>
          </>
        );

      // --- NEW USER REGISTRATION FORM ---
      case "register":
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900">
              Complete your Profile
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Since you're new, we just need a few more details.
            </p>
            <form
              className="mt-8 space-y-6"
              onSubmit={handleRegisterAndSendOtp}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-lg bg-blue-600 text-white font-semibold"
                >
                  {loading ? "Saving..." : "Register & Send OTP"}
                </button>
              </div>
            </form>
          </>
        );

      // --- OTP VERIFICATION FORM ---
      case "otp":
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900">
              Verify your Phone
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter the 6-digit code sent to +91 {phoneNumber}.
            </p>
            <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  One-Time Password (OTP)
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    maxLength={6}
                    className="w-full h-12 px-4 text-center tracking-[1em] border rounded-lg"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-lg bg-blue-600 text-white font-semibold"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </button>
              </div>
            </form>
            <div className="mt-4 text-center text-sm">
              <button
                onClick={() => setStep("phone")}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Use a different number
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-white overflow-hidden lg:grid lg:grid-cols-2">
      <Toaster position="top-right" reverseOrder={false} />
      
      {/* Terms & Conditions Modal */}
      <TermsAndConditionsModal
        isOpen={showTermsModal}
        onAccept={handleTermsAccept}
        onDecline={handleTermsDecline}
      />
      
      {/* Left Panel */}
      <div className="relative hidden w-full h-full flex-col justify-between bg-gradient-to-br from-slate-900 to-blue-900 p-8 text-white lg:flex">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl opacity-50"></div>
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold">MediiMate</span>
          </Link>
          <h1 className="mt-12 text-4xl font-bold tracking-tight">
            Secure & Seamless Access.
          </h1>
          <p className="mt-4 text-lg text-blue-200">
            Log in instantly and securely with a one-time password sent to your
            phone.
          </p>
        </div>
        <div className="relative z-10 mt-auto">
          <div className="rounded-xl bg-black/20 p-6 backdrop-blur-sm">
            <blockquote>
              "The OTP login is so convenient and secure. I no longer have to
              worry about forgetting my password."
            </blockquote>
            <footer className="mt-4 flex items-center gap-4">
              <img
                className="h-12 w-12 rounded-full object-cover"
                src="https://i.pravatar.cc/150?img=7"
                alt="David M."
              />
              <div>
                <p className="font-semibold text-white">David M.</p>
                <p className="text-sm text-blue-200">Verified User</p>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex w-full h-full flex-col justify-center p-8 overflow-y-auto">
        <div className="mx-auto w-full max-w-sm">
          {renderFormContent()}
          
        </div>
      </div>
    </div>
  );
};

export default Login;
