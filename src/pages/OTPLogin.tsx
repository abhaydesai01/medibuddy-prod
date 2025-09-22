import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
// --- Step 1: Import Redux tools ---
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/slices/authSlice";
import { authAPI } from "../services/api";
import { Heart } from "lucide-react";

const LoginWithOtp: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  // --- Step 2: Initialize dispatch ---
  const dispatch = useDispatch();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhoneNumber = `+91${phoneNumber}`;
    if (!/^\d{10}$/.test(phoneNumber)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading("Sending OTP...");

    try {
      await authAPI.sendOtp(fullPhoneNumber);
      toast.success("OTP sent successfully!", { id: loadingToastId });
      setOtpSent(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP.", {
        id: loadingToastId,
      });
    } finally {
      setLoading(false);
    }
  };

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

      // --- Step 3: Dispatch credentials to the Redux store ---
      // This updates the global state and also handles localStorage.
      dispatch(
        setCredentials({
          user: response.data.user,
          token: response.data.token,
        })
      );

      // NOTE: We no longer need these manual localStorage calls,
      // as the authSlice reducer now handles this for us.
      // localStorage.setItem("token", response.data.token);
      // localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success("Login Successful! Redirecting...", { id: loadingToastId });

      setTimeout(() => {
        navigate("/dashboard"); // Now this will work correctly
      }, 1000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP.", {
        id: loadingToastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-white overflow-hidden lg:grid lg:grid-cols-2">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Left Panel */}
      <div className="relative hidden w-full h-full flex-col justify-between bg-gradient-to-br from-slate-900 to-blue-900 p-8 text-white lg:flex">
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
          {!otpSent ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900">
                Login with Phone
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                We'll send a one-time password to your mobile number.
              </p>
              <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
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
                      className="w-full h-12 px-4 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="98765 43210"
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
                    className="w-full h-12 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900">
                Verify your Phone
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Enter the 6-digit code sent to +91 {phoneNumber}.
              </p>
              <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700"
                  >
                    One-Time Password (OTP)
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="otp"
                      id="otp"
                      maxLength={6}
                      className="w-full h-12 px-4 text-center tracking-[1em] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                    className="w-full h-12 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Verify & Login"
                    )}
                  </button>
                </div>
              </form>
              <div className="mt-4 text-center text-sm">
                <button
                  onClick={() => setOtpSent(false)}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Use a different number
                </button>
              </div>
            </>
          )}
          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <p className="text-center text-sm text-gray-600">
            Login with{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Email & Password
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginWithOtp;
