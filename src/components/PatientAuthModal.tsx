import React, { useState, useRef, useEffect } from "react";
import { X, Lock, User, Phone } from "lucide-react";

interface PatientOption {
  _id: string;
  name: string;
  phone: string;
  age?: number;
  bloodGroup?: string;
  avatar?: string;
}

interface PatientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMpinSubmit: (mpin: string) => void;
  onPatientSelect: (patientId: string) => void;
  loading?: boolean;
  patients?: PatientOption[];
  showPatientList?: boolean;
}

const PatientAuthModal: React.FC<PatientAuthModalProps> = ({
  isOpen,
  onClose,
  onMpinSubmit,
  onPatientSelect,
  loading = false,
  patients = [],
  showPatientList = false,
}) => {
  const [mpin, setMpin] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setMpin(["", "", "", "", "", ""]);
    }
  }, [isOpen]);

  const handleMpinChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newMpin = [...mpin];
    newMpin[index] = value;
    setMpin(newMpin);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !mpin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newMpin = [...mpin];
    for (let i = 0; i < pastedData.length; i++) {
      newMpin[i] = pastedData[i];
    }
    setMpin(newMpin);

    // Focus last filled input or first empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = () => {
    const fullMpin = mpin.join("");
    if (fullMpin.length === 6) {
      onMpinSubmit(fullMpin);
    }
  };

  const handleReset = () => {
    setMpin(["", "", "", "", "", ""]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          disabled={loading}
        >
          <X size={24} />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-teal-100 p-4 rounded-full">
            <Lock className="h-8 w-8 text-teal-600" />
          </div>
        </div>

        {/* Show patient list if available */}
        {showPatientList && patients.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Select Patient
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              {patients.length} patient{patients.length > 1 ? "s" : ""} found with this MPIN
            </p>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {patients.map((patient) => (
                <button
                  key={patient._id}
                  onClick={() => onPatientSelect(patient._id)}
                  disabled={loading}
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <img
                    src={patient.avatar || "https://cdn-icons-png.flaticon.com/256/6522/6522516.png"}
                    alt={patient.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <span className="font-semibold text-gray-800">{patient.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Phone size={12} />
                      <span>{patient.phone}</span>
                      {patient.age && <span>• {patient.age} yrs</span>}
                      {patient.bloodGroup && <span>• {patient.bloodGroup}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="w-full mt-4 h-12 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Back
            </button>
          </>
        ) : (
          <>
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Access Patient Records
            </h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Enter patient's 6-digit MPIN
            </p>

            {/* MPIN Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient MPIN
              </label>
              <div className="flex justify-center gap-2">
                {mpin.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="password"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleMpinChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={loading}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 focus:outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={loading || mpin.every((d) => !d)}
                className="flex-1 h-12 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || mpin.some((d) => !d)}
                className="flex-1 h-12 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Search Patients"
                )}
              </button>
            </div>

            {/* Helper Text */}
            <p className="text-xs text-gray-500 text-center mt-6">
              The MPIN is set by the patient during registration. You can only access records of patients mapped to you.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PatientAuthModal;
