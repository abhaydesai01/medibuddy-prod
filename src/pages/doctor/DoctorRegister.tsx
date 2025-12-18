import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { doctorAuthAPI , authAPI } from "../../services/api";
import { Stethoscope } from "lucide-react";
import Logo from "../../assets/logo.png";

const DoctorRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    licenseNumber: "",
    hospital: "",
    experience: "",
  });
  const InputField = ({ id, label, type = "text", value, onChange, name, required = false, placeholder = "", }: { id: string; label: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; name: string; required?: boolean; placeholder?: string; }) => { return ( <div> <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1" > {label} </label> <input id={id} name={name} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition text-sm" /> </div> ); };

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ----------------------------
  // HANDLE INPUT CHANGE
  // ----------------------------
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ----------------------------
  // SEND OTP
  // ----------------------------
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const { name, email, phone, specialization, licenseNumber } = formData;

    if (!name || !email || !phone || !specialization || !licenseNumber) {
      toast.error("Please fill all required fields.");
      return;
    }

    const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone}`;

    setLoading(true);
    const loadingToastId = toast.loading("Sending OTP...");

    try {
      await authAPI.sendOtpRegister(formattedPhone);

      toast.success("OTP sent successfully!", { id: loadingToastId });
      setOtpSent(true);

    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to send OTP.", {
        id: loadingToastId,
      });
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // VERIFY OTP & REGISTER DOCTOR
  // ----------------------------
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Enter the OTP");
      return;
    }

    const formattedPhone = formData.phone.startsWith("+91")
      ? formData.phone
      : `+91${formData.phone}`;

    setLoading(true);
    const loadingToastId = toast.loading("Verifying OTP...");

    try {
      // Verify OTP
      await authAPI.verifyOtpRegister(formattedPhone , otp);

      // Register doctor
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formattedPhone,
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
      };

      if (formData.hospital) payload.hospital = formData.hospital;
      if (formData.experience)
        payload.experience = parseInt(formData.experience);

      await doctorAuthAPI.register(payload);

      toast.success("Registration successful!", {
        id: loadingToastId,
      });

      navigate("/doctor/login");

    } catch (err: any) {
      toast.error(err.response?.data?.error || "Invalid OTP.", {
        id: loadingToastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      <Toaster position="top-right" />

      {/* LEFT PANEL */}
      <div className="relative hidden w-full flex-col justify-between bg-gradient-to-br from-teal-900 to-cyan-900 p-8 text-white lg:flex">
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-500/30 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2">
            <img src={Logo} className="h-8 w-8" />
            <span className="text-2xl font-bold">MediiMate</span>
          </Link>

          <div className="mt-12 flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <Stethoscope className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Join Our Doctor Network
            </h1>
          </div>

          <p className="mt-4 text-lg text-teal-200">
            Register to access our secure medical records vault and care for your patients better.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex w-full flex-col py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <div className="mx-auto w-full max-w-md">

          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Create Doctor Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join our network of healthcare professionals
            </p>
          </div>

          {/* FORM */}
          <form
            className="space-y-4"
            onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
            noValidate
          >
            {/* SHOW ALL FIELDS BEFORE OTP */}
            {!otpSent && (
              <>
                <InputField
                  id="name"
                  name="name"
                  label="Full Name *"
                  placeholder="Dr. John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />

                <InputField
                  id="email"
                  name="email"
                  label="Email *"
                  type="email"
                  placeholder="doctor@hospital.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border bg-gray-50 text-gray-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      className="w-full h-11 px-4 border rounded-r-lg focus:ring-2 focus:ring-teal-500"
                      placeholder="98XXXXXXXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <InputField
                  id="specialization"
                  name="specialization"
                  label="Specialization *"
                  placeholder="Cardiology"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  required
                />

                <InputField
                  id="licenseNumber"
                  name="licenseNumber"
                  label="Medical License Number *"
                  placeholder="e.g., MED12345"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  required
                />

                <InputField
                  id="hospital"
                  name="hospital"
                  label="Hospital/Clinic"
                  placeholder="Your workplace"
                  value={formData.hospital}
                  onChange={handleInputChange}
                />

                <InputField
                  id="experience"
                  name="experience"
                  type="number"
                  label="Years of Experience"
                  placeholder="0"
                  value={formData.experience}
                  onChange={handleInputChange}
                />
              </>
            )}

            {/* OTP FIELD */}
            {otpSent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full h-12 px-4 text-center border rounded-lg tracking-[0.5em]"
                  placeholder="••••••"
                />
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : otpSent
                ? "Verify OTP & Register"
                : "Send OTP"}
            </button>

            {/* Back to edit phone */}
            {otpSent && (
              <div className="text-center text-sm mt-3">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-teal-600 hover:underline"
                >
                  Use a different number
                </button>
              </div>
            )}

            <p className="text-center text-sm text-gray-600 pt-2">
              Already have an account?{" "}
              <Link
                to="/doctor/login"
                className="font-medium text-teal-600 underline"
              >
                Sign in
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegister;
