import React, { useState, useEffect, useCallback, useRef } from "react";
import { prescriptionAPI } from "../services/api";
import {
  Upload,
  FileText,
  Search,
  Trash2,
  RefreshCw,
  FileX,
  Loader2,
  X,
  ClipboardPlus,
  Stethoscope,
  CalendarDays,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

// --- Type Interfaces ---
interface Medication {
  medicine: string;
  dosage: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  food_relation?: string;
  // Legacy fields for backward compatibility
  frequency_per_day?: number;
  duration_days?: number;
  meal_instruction?: string;
  timings?: string[];
}


interface Prescription {
  _id: string;
  summary: string;
  medications: Medication[];
  prescription_date: string;
  status: "active" | "inactive" | "archived" | "processing" | "failed";
  createdAt: string;
  doctorName?: string;
  originalFileName?: string;
}

// --- Helper Functions ---
const getUserDetails = (): { id: string | null; phone: string | null } => {
  const userString = localStorage.getItem("user");
  if (userString) {
    try {
      const user = JSON.parse(userString);
      return { id: user?.id || null, phone: user?.phone || null };
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
    }
  }
  return { id: null, phone: null };
};

// --- Main Component ---
const PrescriptionManager: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for the custom delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] =
    useState<Prescription | null>(null);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [prescriptionTitle, setPrescriptionTitle] = useState("");
  const [prescriptionNotes, setPrescriptionNotes] = useState("");

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await prescriptionAPI.getPrescriptions();
      const data = response.data.prescriptions || response.data || [];
      const sorted = data.sort(
        (a: Prescription, b: Prescription) =>
          new Date(b.prescription_date || b.createdAt).getTime() - new Date(a.prescription_date || a.createdAt).getTime()
      );
      setPrescriptions(sorted);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        err.message ||
        "Failed to fetch prescriptions"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrescriptions();
    const intervalId = setInterval(fetchPrescriptions, 30000); // Auto-refresh
    return () => clearInterval(intervalId);
  }, [fetchPrescriptions]);

  // In your PrescriptionManager.tsx file

  const handleFileUpload = async () => {
    if (!uploadFile) {
      setError("Please select a file to upload.");
      return;
    }

    const { phone } = getUserDetails();

    if (!phone) {
      setError("User phone number not found. Please log in again.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("prescriptionFile", uploadFile);

      // --- FIX: Use formData.set() to prevent duplicates ---
      // This ensures that if user_phone is ever added twice,
      // the last one set is the only one that gets sent.
      formData.set("user_phone", phone);

      if (prescriptionTitle) formData.set("title", prescriptionTitle);
      if (prescriptionNotes) formData.set("notes", prescriptionNotes);

      const response = await prescriptionAPI.uploadPrescription(formData);

      setUploadFile(null);
      setPrescriptionTitle("");
      setPrescriptionNotes("");
      setShowUploadModal(false);

      await fetchPrescriptions();

      if (response.data.prescription) {
        setSelectedPrescription(response.data.prescription);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to upload prescription");
    } finally {
      setUploading(false);
    }
  };

  // When trash icon is clicked, open the modal
  const handleDeleteClick = (prescription: Prescription) => {
    setPrescriptionToDelete(prescription);
    setShowDeleteModal(true);
  };

  // When "Delete" is confirmed in the modal, run the API call
  const confirmDelete = async () => {
    if (!prescriptionToDelete) return;

    setDeletingId(prescriptionToDelete._id);
    setShowDeleteModal(false);

    try {
      await prescriptionAPI.deletePrescription(prescriptionToDelete._id);
      setPrescriptions((prev) =>
        prev.filter((p) => p._id !== prescriptionToDelete._id)
      );
      if (selectedPrescription?._id === prescriptionToDelete._id) {
        setSelectedPrescription(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete prescription");
    } finally {
      setDeletingId(null);
      setPrescriptionToDelete(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      if (["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
        setUploadFile(file);
        if (!prescriptionTitle)
          setPrescriptionTitle(file.name.replace(/\.[^/.]+$/, ""));
      } else {
        setError("Please upload a PDF, JPG, or PNG file.");
      }
    }
  };

  const getStatusDisplay = (status: string) => {
    const statusMap = {
      active: {
        text: "Active",
        color: "text-green-700",
        bg: "bg-green-50",
        icon: CheckCircle,
      },
      inactive: {
        text: "Inactive",
        color: "text-gray-700",
        bg: "bg-gray-100",
        icon: AlertCircle,
      },
      processing: {
        text: "Processing",
        color: "text-yellow-700",
        bg: "bg-yellow-50",
        icon: Loader2,
      },
      failed: {
        text: "Failed",
        color: "text-red-700",
        bg: "bg-red-50",
        icon: AlertCircle,
      },
    };
    return (
      statusMap[status as keyof typeof statusMap] || {
        text: "Unknown",
        color: "text-gray-700",
        bg: "bg-gray-100",
        icon: FileX,
      }
    );
  };

  const filteredPrescriptions = prescriptions.filter(
    (p) =>
      p.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.doctorName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Prescription Management
        </h1>
        <p className="mt-1 text-gray-500">
          Upload and manage your medical prescriptions.
        </p>
      </div>

      <div
        className={`grid gap-8 transition-all duration-300 ${selectedPrescription
            ? "lg:grid-cols-3 xl:grid-cols-4"
            : "lg:grid-cols-1"
          }`}
      >
        <div
          className={`${selectedPrescription
              ? "lg:col-span-1 xl:col-span-1"
              : "lg:col-span-1"
            }`}
        >
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full h-12 px-5 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 flex items-center justify-center gap-2 transition-colors"
              >
                <ClipboardPlus size={18} /> Add Prescription
              </button>
              <button
                onClick={fetchPrescriptions}
                disabled={loading}
                className="w-full sm:w-auto h-12 px-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 min-h-[400px] overflow-y-auto -mr-2 pr-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-700 mb-2" />
                  <p>Loading prescriptions...</p>
                </div>
              ) : filteredPrescriptions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                  <FileX className="h-12 w-12 mb-2 text-gray-300" />
                  <p className="font-semibold">No prescriptions found.</p>
                  <p className="text-sm">Add your first one to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPrescriptions.map((p) => {
                    const status = getStatusDisplay(p.status);
                    return (
                      <div
                        key={p._id}
                        onClick={() => setSelectedPrescription(p)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedPrescription?._id === p._id
                            ? "bg-blue-50 border-blue-700"
                            : "bg-white border-gray-200 hover:border-blue-400"
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">
                              Prescription from{" "}
                              {new Date(
                                p.prescription_date
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {p.medications.length} medication(s)
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(p);
                            }}
                            disabled={deletingId === p._id}
                            className="p-1.5 rounded-md hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            {deletingId === p._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
                          >
                            <status.icon
                              size={12}
                              className={
                                p.status === "processing" ? "animate-spin" : ""
                              }
                            />
                            {status.text}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedPrescription && (
          <div className="lg:col-span-2 xl:col-span-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Prescription Details
                </h2>
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={14} />
                    {new Date(
                      selectedPrescription.prescription_date
                    ).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Stethoscope size={14} />
                    Dr. {selectedPrescription.doctorName || "N/A"}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedPrescription(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Medications
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="hidden md:grid md:grid-cols-12 gap-4 p-3 bg-gray-50 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                    <div className="col-span-3">Medicine</div>
                    <div className="col-span-2">Dosage</div>
                    <div className="col-span-2">Frequency</div>
                    <div className="col-span-2">Duration</div>
                    <div className="col-span-3">Instructions</div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {selectedPrescription.medications
                      .filter((med) => {
                        // Filter out rows where frequency or duration is 0
                        const freqNum = parseInt((med.frequency || "").match(/(\d+)/)?.[1] || med.frequency_per_day?.toString() || "1");
                        const durNum = parseInt((med.duration || "").match(/(\d+)/)?.[1] || med.duration_days?.toString() || "1");
                        return freqNum > 0 && durNum > 0;
                      })
                      .map((med) => {
                        // Helper to extract number from frequency/duration strings
                        const getFrequencyNumber = (freq: string | undefined, freqPerDay?: number) => {
                          if (freqPerDay) return freqPerDay.toString();
                          if (!freq) return "";
                          const match = freq.match(/(\d+)/);
                          return match ? match[1] : "";
                        };
                        const getDurationNumber = (dur: string | undefined, durDays?: number) => {
                          if (durDays) return durDays.toString();
                          if (!dur) return "";
                          const match = dur.match(/(\d+)/);
                          return match ? match[1] : "";
                        };

                        const freqDisplay = getFrequencyNumber(med.frequency, med.frequency_per_day);
                        const durDisplay = getDurationNumber(med.duration, med.duration_days);

                        return (
                      <div
                        key={med.medicine}
                        className="grid grid-cols-1 md:grid-cols-12 gap-y-2 gap-x-4 p-3 text-sm items-center"
                      >
                        <div className="col-span-full md:col-span-3 font-semibold text-gray-800">
                          {med.medicine}
                        </div>
                        <div className="col-span-full md:col-span-2 text-gray-600">
                          {med.dosage || "—"}
                        </div>
                        <div className="col-span-full md:col-span-2 text-gray-600">
                          {freqDisplay ? `${freqDisplay}× daily` : "—"}
                        </div>
                        <div className="col-span-full md:col-span-2 text-gray-600">
                          {durDisplay ? `${durDisplay} days` : "—"}
                        </div>
                        <div className="col-span-full md:col-span-3 text-gray-600">
                          {med.food_relation || med.instructions || med.meal_instruction || "—"}
                        </div>
                      </div>
                        );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                Upload Prescription
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Upload a PDF or image of your prescription.
              </p>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${dragActive
                    ? "border-blue-700 bg-blue-50"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                  }`}
              >
                {!uploadFile ? (
                  <div>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="mt-2 font-semibold text-gray-700">
                      Drop your file here or{" "}
                      <span className="text-blue-700 font-bold">browse</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports PDF, JPG, PNG up to 10MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <FileText className="h-12 w-12 text-blue-700 mx-auto" />
                    <p className="mt-2 font-semibold text-gray-700">
                      {uploadFile.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(uploadFile.size / 1024).toFixed(1)} KB
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadFile(null);
                      }}
                      className="mt-2 text-xs text-red-600 hover:underline"
                    >
                      Remove file
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setUploadFile(f);
                      if (!prescriptionTitle)
                        setPrescriptionTitle(f.name.replace(/\.[^/.]+$/, ""));
                    }
                  }}
                  className="hidden"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={prescriptionTitle}
                  onChange={(e) => setPrescriptionTitle(e.target.value)}
                  placeholder="e.g., Prescription from Dr. Smith"
                  className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}
            </div>
            <div className="p-6 border-t flex justify-end gap-4 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowUploadModal(false)}
                className="h-11 px-5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleFileUpload}
                disabled={!uploadFile || uploading}
                className="h-11 px-5 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 flex items-center justify-center gap-2 disabled:bg-gray-400"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Uploading...
                  </>
                ) : (
                  "Upload Prescription"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && prescriptionToDelete && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Delete Prescription"
          message={`Are you sure you want to permanently delete the prescription from ${new Date(
            prescriptionToDelete.prescription_date
          ).toLocaleDateString()}? This action cannot be undone.`}
          confirmText="Delete"
          isConfirming={deletingId === prescriptionToDelete._id}
        />
      )}
    </div>
  );
};

// --- Reusable Confirmation Modal Component ---
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  isConfirming: boolean;
}> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  isConfirming,
}) => {
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                <p className="text-sm text-gray-500 mt-2">{message}</p>
              </div>
            </div>
          </div>
          <div className="p-4 border-t flex justify-end gap-4 bg-gray-50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="h-10 px-5 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isConfirming}
              className="h-10 px-5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center justify-center gap-2 disabled:bg-gray-400"
            >
              {isConfirming ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Deleting...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

export default PrescriptionManager;
