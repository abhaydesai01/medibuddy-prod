import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { authAPI } from "../services/api";
import Logo from "../assets/logo.png";
import { Heart } from "lucide-react";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    mpin: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ----------------------------
  // HANDLE CHANGE
  // ----------------------------
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    // Force MPIN to be only digits
    if (name === "mpin") {
      if (!/^\d{0,4}$/.test(value)) return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ----------------------------
  // SEND OTP
  // ----------------------------
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, phone, mpin } = formData;

    if (!name || !email || !phone || !mpin) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (mpin.length !== 4) {
      toast.error("MPIN must be exactly 4 digits.");
      return;
    }

    const formattedPhone = phone.startsWith("+91")
      ? phone
      : `+91${phone}`;

    setLoading(true);
    const loadingToastId = toast.loading("Sending OTP...");

    try {
      await authAPI.sendOtpRegister(formattedPhone);

      toast.success("OTP sent!", { id: loadingToastId });
      setOtpSent(true);

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send OTP.", {
        id: loadingToastId,
      });
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // VERIFY OTP & REGISTER
  // ----------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, phone, mpin } = formData;
    const formattedPhone = phone.startsWith("+91")
      ? phone
      : `+91${phone}`;

    if (!otp) {
      toast.error("Enter the OTP");
      return;
    }

    if (mpin.length !== 4) {
      toast.error("MPIN must be exactly 4 digits.");
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading("Verifying OTP...");

    try {
      // Verify OTP
      await authAPI.verifyOtpRegister(formattedPhone, otp);

      // Register patient
      await authAPI.register({
        name,
        email,
        phone: formattedPhone,
        mpin,
      });

      toast.success("Registration successful!", {
        id: loadingToastId,
      });

      navigate("/login");

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP", {
        id: loadingToastId,
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="h-screen bg-white overflow-hidden lg:grid lg:grid-cols-2">
      <Toaster position="top-right" />

      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-slate-900 to-blue-900 p-8 text-white relative">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <img src={Logo} className="h-8 w-8" />
            <span className="text-2xl font-bold">MediiMate • Patients</span>
          </div>

          <h1 className="mt-12 text-4xl font-bold tracking-tight">
            Create Your Patient Account
          </h1>

          <p className="mt-4 text-lg text-blue-200">
            Sign up securely with OTP & MPIN authentication.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex w-full h-full flex-col justify-center p-8 overflow-y-auto">
        <div className="mx-auto w-full max-w-sm">

          <h2 className="text-3xl font-bold text-gray-900">
            Patient Registration
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Already a member?{" "}
            <Link to="/login" className="font-medium text-blue-600">
              Login here
            </Link>
          </p>

          {/* FORM */}
          <form
            className="mt-8 space-y-6"
            onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
          >
            {/* NAME */}
            {!otpSent && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 border rounded-lg"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 border rounded-lg"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="flex">
                    <span className="px-3 flex items-center border rounded-l-lg bg-gray-50">
                      +91
                    </span>
                    <input
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 border rounded-r-lg"
                      placeholder="98XXXXXXXX"
                    />
                  </div>
                </div>

                {/* MPIN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Create MPIN (4-digit)
                  </label>
                  <input
                    name="mpin"
                    type="password"
                    maxLength={4}
                    required
                    value={formData.mpin}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 text-center tracking-[0.4em] border rounded-lg"
                    placeholder="••••"
                  />
                </div>
              </>
            )}

            {/* OTP INPUT */}
            {otpSent && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Enter OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full h-12 px-4 text-center tracking-[0.6em] border rounded-lg"
                  placeholder="••••••"
                />
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 text-white rounded-lg font-semibold"
            >
              {loading
                ? "Please wait..."
                : otpSent
                ? "Verify OTP & Register"
                : "Send OTP"}
            </button>

            {/* Change phone */}
            {otpSent && (
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-blue-600"
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

export default Register;
