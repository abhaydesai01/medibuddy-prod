import React, { useState } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../../store/store";
import toast from "react-hot-toast";
import { vaultAPI } from "../../services/api";
import PatientAuthModal from "../../components/PatientAuthModal";
import {
  Lock,
  FileText,
  Calendar,
  Heart,
  AlertCircle,
  Phone,
  Download,
  Brain,
  Star,
  HeartPulse,
  CheckCircle,
  AlertTriangle,
  Info,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  ChevronDown,
  Stethoscope,
  CalendarDays,
  ClipboardList,
  X,
  Edit2,
  Save,
} from "lucide-react";

interface PatientOption {
  _id: string;
  name: string;
  phone: string;
  age?: number;
  bloodGroup?: string;
  avatar?: string;
}

interface PatientInfo {
  name: string;
  email?: string;
  phone?: string;
  bloodGroup?: string;
  age?: number;
  allergies?: string[];
  chronicConditions?: any[];
}

interface TestResult {
  parameter: string;
  value: string;
  unit: string;
  normalRange: { min: string; max: string; description: string };
  status: "normal" | "high" | "low" | "critical" | "abnormal";
  description: string;
  category: string;
}

interface AIAnalysis {
  summary: string;
  keyFindings: Array<{
    parameter: string;
    value: string;
    status: string;
    description: string;
  }>;
  recommendations: string[];
  followUpActions: string[];
  riskFactors: string[];
  overallAssessment: string;
  urgencyLevel: "low" | "medium" | "high" | "critical";
}

interface Report {
  _id: string;
  type: string;
  title: string;
  description?: string;
  date: string;
  notes?: string;
  files?: Array<{ url: string; filename: string }>;
  testResults?: TestResult[];
  aiAnalysis?: AIAnalysis;
  trends?: Array<{
    parameter: string;
    trend: "improving" | "declining" | "stable";
    description: string;
  }>;
}

interface Medication {
  medicine: string;
  dosage: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  timing_display?: string;
  suggested_time?: string;
  food_relation?: string;
  // Legacy fields (for backward compatibility)
  frequency_per_day?: number;
  duration_days?: number;
  meal_instruction?: string;
  timings?: string[];
}

interface Prescription {
  _id: string;
  type: string;
  title: string;
  description?: string;
  date: string;
  notes?: string;
  files?: Array<{ url: string; filename: string }>;
  medications?: Medication[];
  summary?: string;
  doctorName?: string;
}

interface MedicalRecord {
  _id: string;
  type: string;
  title: string;
  description?: string;
  doctorName?: string;
  hospitalName?: string;
  date: string;
  notes?: string;
  files?: Array<{ url: string; filename: string }>;
}

// Reusable InfoCard Component
const InfoCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ icon, title, children, className }) => (
  <div
    className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm ${className}`}
  >
    <div className="flex items-center gap-4 mb-4">
      <div className="bg-gray-100 p-3 rounded-lg">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
      {children}
    </div>
  </div>
);

const Vault: React.FC = () => {
  const { doctor } = useSelector((state: RootState) => state.doctorAuth);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"reports" | "prescriptions">("reports");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Edit prescription state
  const [isEditing, setIsEditing] = useState(false);
  const [editedMedications, setEditedMedications] = useState<Medication[]>([]);
  const [savingPrescription, setSavingPrescription] = useState(false);

  // New state for patient selection flow
  const [matchingPatients, setMatchingPatients] = useState<PatientOption[]>([]);
  const [showPatientList, setShowPatientList] = useState(false);

  // Normalize report data like ReportAnalysis.tsx does
  const normalizeReport = (r: any): Report => {
    // Normalize TEST RESULTS
    const normalizedTestResults: TestResult[] = (
      r.testResults?.length ? r.testResults : r.test_results || []
    ).map((tr: any) => {
      let min = "";
      let max = "";
      let description = "";

      // Handle normalRange object or reference_range string
      if (tr.normalRange) {
        min = tr.normalRange.min || "";
        max = tr.normalRange.max || "";
        description = tr.normalRange.description || "";
      } else if (typeof tr.reference_range === "string") {
        if (tr.reference_range.includes("-")) {
          [min, max] = tr.reference_range.split("-").map((s: string) => s.trim());
        } else {
          description = tr.reference_range;
        }
      }

      return {
        parameter: tr.parameter || tr.name || "Unknown",
        value: tr.value ?? "",
        unit: tr.unit ?? "",
        normalRange: { min, max, description },
        status: tr.status || "normal",
        description: tr.description || "",
        category: tr.category || "General",
      };
    });

    // Build AI analysis object
    const aiAnalysis = r.aiAnalysis || r.ai_analysis_summary || r.key_findings
      ? {
          summary: r.aiAnalysis?.summary || r.ai_analysis_summary || r.summary || "",
          keyFindings: (r.aiAnalysis?.keyFindings || r.key_findings || []).map((k: any, i: number) =>
            typeof k === "string"
              ? { parameter: `Finding ${i + 1}`, value: "", status: "abnormal", description: k }
              : k
          ),
          recommendations: r.aiAnalysis?.recommendations || r.recommendations || [],
          followUpActions: r.aiAnalysis?.followUpActions || r.follow_up_actions || [],
          riskFactors: r.aiAnalysis?.riskFactors || r.potential_risk_factors || [],
          overallAssessment: r.aiAnalysis?.overallAssessment || r.ai_analysis_summary || "Assessment available",
          urgencyLevel: r.aiAnalysis?.urgencyLevel || "medium",
        }
      : undefined;

    return {
      _id: r._id,
      type: r.type || r.reportType?.toLowerCase().replace(/\s+/g, "_") || "lab_report",
      title: r.title || r.originalFileName || "Medical Report",
      description: r.description || r.aiAnalysis?.summary || "",
      date: r.date || r.reportDate || r.createdAt,
      notes: r.notes || "",
      files: r.files || [],
      testResults: normalizedTestResults,
      aiAnalysis: aiAnalysis,
      trends: r.trends || [],
    };
  };

  const handleMpinSubmit = async (mpin: string) => {
    setLoading(true);
    try {
      const doctorPhone = localStorage.getItem("doctorPhone");
      if (!doctorPhone) {
        toast.error("Doctor phone not found. Please log in again.");
        return;
      }
      
      const response = await vaultAPI.searchByMpin(mpin, doctorPhone);
      const patients = response.data.patients || [];
      
      if (patients.length === 1) {
        // Only one patient found, directly fetch their records
        await handlePatientSelect(patients[0]._id);
      } else {
        // Multiple patients found, show selection list
        setMatchingPatients(patients);
        setShowPatientList(true);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.error || "Failed to find patients with this MPIN"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = async (patientId: string) => {
    setLoading(true);
    try {
      const doctorPhone = localStorage.getItem("doctorPhone");
      if (!doctorPhone) {
        toast.error("Doctor phone not found. Please log in again.");
        return;
      }
      
      const response = await vaultAPI.accessByPatient(patientId, doctorPhone);
      
      // Normalize the records - separate reports and prescriptions
      const rawRecords = response.data.records || [];
      const normalizedRecords = rawRecords.map((r: any) => {
        if (r.type === "prescription") {
          return r; // Prescriptions are already formatted correctly
        }
        return normalizeReport(r);
      });
      
      setPatientInfo(response.data.patientInfo);
      setRecords(normalizedRecords);
      setIsAuthModalOpen(false);
      setShowPatientList(false);
      setMatchingPatients([]);
      toast.success(
        `Records loaded for ${response.data.patientInfo.name} (${response.data.totalRecords} records)`
      );
    } catch (err: any) {
      toast.error(
        err.response?.data?.error || "Failed to access medical records"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsAuthModalOpen(false);
    setShowPatientList(false);
    setMatchingPatients([]);
  };

  const reports = records.filter((r) => r.type !== "prescription") as Report[];
  const prescriptions = records.filter((r) => r.type === "prescription") as Prescription[];

  const getRecordTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      prescription: "bg-blue-100 text-blue-800",
      lab_report: "bg-green-100 text-green-800",
      scan: "bg-purple-100 text-purple-800",
      diagnosis: "bg-red-100 text-red-800",
      vaccination: "bg-yellow-100 text-yellow-800",
      surgery: "bg-orange-100 text-orange-800",
      consultation: "bg-teal-100 text-teal-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[type] || colors.other;
  };

  const getTestResultColor = (status: string) => {
    const colorMap = {
      normal: {
        textColor: "text-green-800",
        bg: "bg-green-50",
        border: "border-green-200",
      },
      high: {
        textColor: "text-orange-800",
        bg: "bg-orange-50",
        border: "border-orange-200",
      },
      low: {
        textColor: "text-blue-800",
        bg: "bg-blue-50",
        border: "border-blue-200",
      },
      critical: {
        textColor: "text-red-800",
        bg: "bg-red-50",
        border: "border-red-200",
      },
      abnormal: {
        textColor: "text-purple-800",
        bg: "bg-purple-50",
        border: "border-purple-200",
      },
    };
    return (
      colorMap[status as keyof typeof colorMap] || {
        textColor: "text-gray-800",
        bg: "bg-gray-50",
        border: "border-gray-200",
      }
    );
  };

  const getUrgencyDisplay = (level: string) => {
    const urgencyMap = {
      low: { text: "Low Priority", color: "text-green-700", bg: "bg-green-50" },
      medium: {
        text: "Medium Priority",
        color: "text-yellow-700",
        bg: "bg-yellow-50",
      },
      high: {
        text: "High Priority",
        color: "text-orange-700",
        bg: "bg-orange-50",
      },
      critical: { text: "Critical", color: "text-red-700", bg: "bg-red-50" },
    };
    return (
      urgencyMap[level as keyof typeof urgencyMap] || {
        text: "Unknown",
        color: "text-gray-700",
        bg: "bg-gray-100",
      }
    );
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "improving")
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === "declining")
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(category)) newExpanded.delete(category);
      else newExpanded.add(category);
      return newExpanded;
    });
  };

  const groupedResults = selectedReport?.testResults?.reduce((acc, result) => {
    const category = result.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(result);
    return acc;
  }, {} as Record<string, TestResult[]>);

  return (
    <div className="space-y-6 p-2 md:p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Medical Vault</h1>
          <p className="mt-1 text-gray-500">
            Securely access patient medical records
          </p>
        </div>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
        >
          <Lock size={20} />
          Access Records
        </button>
      </div>

      {/* No Records State */}
      {!patientInfo && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-teal-100 p-6 rounded-full">
              <Lock className="h-12 w-12 text-teal-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome, Dr. {doctor?.name}
          </h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Enter patient's 6-digit MPIN to securely access their complete
            medical history and records.
          </p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
          >
            <Lock size={20} />
            Enter MPIN to Start
          </button>
        </div>
      )}

      {/* Patient Info & Records */}
      {patientInfo && (
        <>
          {/* Patient Info Card */}
          <div className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">{patientInfo.name}</h2>
                {patientInfo.email && (
                  <p className="text-teal-100">{patientInfo.email}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setPatientInfo(null);
                  setRecords([]);
                  setActiveTab("reports");
                  setSelectedReport(null);
                  setSelectedPrescription(null);
                }}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                Clear
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {patientInfo.phone && (
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone size={16} />
                    <span className="text-xs font-medium">Phone</span>
                  </div>
                  <p className="font-bold text-sm">{patientInfo.phone}</p>
                </div>
              )}
              {patientInfo.bloodGroup && (
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart size={16} />
                    <span className="text-xs font-medium">Blood Group</span>
                  </div>
                  <p className="font-bold">{patientInfo.bloodGroup}</p>
                </div>
              )}
              {patientInfo.age && (
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={16} />
                    <span className="text-xs font-medium">Age</span>
                  </div>
                  <p className="font-bold">{patientInfo.age} years</p>
                </div>
              )}
              {patientInfo.allergies && patientInfo.allergies.length > 0 && (
                <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle size={16} />
                    <span className="text-xs font-medium">Allergies</span>
                  </div>
                  <p className="font-bold text-sm">{patientInfo.allergies.join(", ")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 p-2">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveTab("reports");
                  setSelectedReport(null);
                  setSelectedPrescription(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
                  activeTab === "reports"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <FileText size={18} />
                Reports ({reports.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab("prescriptions");
                  setSelectedReport(null);
                  setSelectedPrescription(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
                  activeTab === "prescriptions"
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <ClipboardList size={18} />
                Prescriptions ({prescriptions.length})
              </button>
            </div>
          </div>

          {/* REPORTS TAB - List View */}
          {activeTab === "reports" && !selectedReport && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Medical Reports ({reports.length})
              </h3>
              {reports.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No reports found</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {reports.map((report) => (
                    <div
                      key={report._id}
                      onClick={() => setSelectedReport(report)}
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getRecordTypeColor(
                                report.type
                              )}`}
                            >
                              {report.type.replace("_", " ").toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(report.date).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-gray-800">
                            {report.title}
                          </h4>
                          {report.description && (
                            <p className="text-gray-600 mt-1">{report.description}</p>
                          )}
                        </div>
                      </div>
                      {report.notes && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700">
                            <strong>Notes:</strong> {report.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* REPORTS TAB - Detail View */}
          {activeTab === "reports" && selectedReport && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedReport.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedReport.type.replace("_", " ").toUpperCase()} • {new Date(selectedReport.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>

              {selectedReport.aiAnalysis ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <InfoCard
                        icon={<Brain size={20} className="text-blue-700" />}
                        title="AI Analysis Summary"
                      >
                        <p className="text-sm text-gray-700">
                          {selectedReport.aiAnalysis.summary || "No summary available"}
                        </p>
                        <div className="mt-3 flex items-center gap-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-semibold ${
                              getUrgencyDisplay(selectedReport.aiAnalysis.urgencyLevel || "low").bg
                            } ${getUrgencyDisplay(selectedReport.aiAnalysis.urgencyLevel || "low").color}`}
                          >
                            {getUrgencyDisplay(selectedReport.aiAnalysis.urgencyLevel || "low").text}
                          </span>
                          <span className="text-xs text-gray-500">
                            Overall:{" "}
                            <span className="font-semibold text-gray-700">
                              {selectedReport.aiAnalysis.overallAssessment || "Assessment pending"}
                            </span>
                          </span>
                        </div>
                      </InfoCard>

                      {selectedReport.aiAnalysis.keyFindings && selectedReport.aiAnalysis.keyFindings.length > 0 && (
                        <InfoCard
                          icon={<Star size={20} className="text-yellow-600" />}
                          title="Key Findings"
                        >
                          <div className="space-y-3">
                            {selectedReport.aiAnalysis.keyFindings.map((f, idx) => (
                              <div key={idx} className="flex items-start gap-3">
                                <div className="flex-1">
                                  <div className="flex items-baseline justify-between">
                                    <div className="font-semibold text-gray-800">{f.parameter}</div>
                                    <div className="text-xs text-gray-500">
                                      {f.value ? `${f.value}` : ""}{" "}
                                      {f.status ? (
                                        <span className="ml-2 text-xs uppercase font-bold text-gray-600">
                                          {f.status}
                                        </span>
                                      ) : null}
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {f.description || "No description provided"}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </InfoCard>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedReport.aiAnalysis.recommendations && selectedReport.aiAnalysis.recommendations.length > 0 && (
                          <InfoCard
                            icon={<HeartPulse size={20} className="text-green-600" />}
                            title="Recommendations"
                          >
                            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                              {selectedReport.aiAnalysis.recommendations.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </InfoCard>
                        )}

                        {selectedReport.aiAnalysis.followUpActions && selectedReport.aiAnalysis.followUpActions.length > 0 && (
                          <InfoCard
                            icon={<CheckCircle size={20} className="text-indigo-600" />}
                            title="Follow-Up Actions"
                          >
                            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                              {selectedReport.aiAnalysis.followUpActions.map((a, i) => (
                                <li key={i}>{a}</li>
                              ))}
                            </ul>
                          </InfoCard>
                        )}
                      </div>

                      {selectedReport.aiAnalysis.riskFactors && selectedReport.aiAnalysis.riskFactors.length > 0 && (
                        <InfoCard
                          icon={<AlertTriangle size={20} className="text-orange-600" />}
                          title="Potential Risk Factors"
                        >
                          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                            {selectedReport.aiAnalysis.riskFactors.map((risk, i) => (
                              <li key={i}>{risk}</li>
                            ))}
                          </ul>
                        </InfoCard>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-white/60 to-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-sm text-gray-500">Report Status</h4>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                Overall assessment:{" "}
                                <span className="font-semibold text-gray-700">
                                  {selectedReport.aiAnalysis.overallAssessment || "Assessment pending"}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedReport.trends && selectedReport.trends.length > 0 && (
                    <InfoCard
                      icon={<BarChart3 size={20} className="text-purple-600" />}
                      title="Trends vs. Previous Reports"
                    >
                      <div className="space-y-3">
                        {selectedReport.trends.map((trend, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm">
                            {getTrendIcon(trend.trend)}
                            <div>
                              <div className="font-semibold text-gray-700">{trend.parameter}</div>
                              <div className="text-gray-500 text-sm">{trend.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </InfoCard>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Info className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No AI analysis available for this report</p>
                  {selectedReport.description && (
                    <div className="mt-4 max-w-2xl mx-auto">
                      <p className="text-sm text-gray-600">{selectedReport.description}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Test Results - Always show if available */}
              {selectedReport.testResults && selectedReport.testResults.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-gray-800 pt-4 border-t border-gray-200 mb-4">
                    Detailed Test Results ({selectedReport.testResults.length} parameters)
                  </h3>
                  {groupedResults &&
                    Object.entries(groupedResults).map(([category, results]) => (
                      <div key={category} className="mb-4">
                        <button
                          onClick={() => toggleCategory(category)}
                          className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100"
                        >
                          <h4 className="font-semibold text-gray-700">
                            {category} ({results.length})
                          </h4>
                          <ChevronDown
                            className={`transition-transform ${
                              expandedCategories.has(category) ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {expandedCategories.has(category) && (
                          <div className="mt-2 border border-gray-100 rounded-lg overflow-hidden">
                            <div className="hidden md:grid md:grid-cols-12 gap-4 p-3 bg-gray-100 font-semibold text-xs text-gray-600 uppercase tracking-wider">
                              <div className="col-span-4">Parameter</div>
                              <div className="col-span-2 text-center">Your Value</div>
                              <div className="col-span-3 text-center">Normal Range</div>
                              <div className="col-span-3 text-center">Status</div>
                            </div>
                            {[...results].sort((a, b) => {
                              const getStatusPriority = (status: string) => {
                                const s = (status || '').toLowerCase().trim();
                                if (s === 'high') return 0;
                                if (s === 'low') return 1;
                                if (s === 'normal') return 2;
                                return 3;
                              };
                              return getStatusPriority(a.status) - getStatusPriority(b.status);
                            }).map((result, idx) => {
                              const colors = getTestResultColor(result.status);
                              return (
                                <div
                                  key={idx}
                                  className={`grid grid-cols-1 md:grid-cols-12 gap-y-2 gap-x-4 p-3 border-t border-gray-100 text-sm items-center`}
                                >
                                  <div className="col-span-full md:col-span-4 font-semibold text-gray-800">
                                    {result.parameter}
                                  </div>
                                  <div className="col-span-full md:col-span-2 text-left md:text-center font-bold text-gray-900">
                                    {result.value} {result.unit}
                                  </div>
                                  <div className="col-span-full md:col-span-3 text-left md:text-center text-gray-500">
                                    {result.normalRange.min && result.normalRange.max
                                      ? `${result.normalRange.min} - ${result.normalRange.max}`
                                      : result.normalRange.description || "N/A"}
                                  </div>
                                  <div className="col-span-full md:col-span-3 flex justify-start md:justify-center">
                                    <span
                                      className={`px-2 py-0.5 text-xs font-bold rounded-full ${colors.bg} ${colors.textColor} border ${colors.border}`}
                                    >
                                      {result.status}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {selectedReport.files && selectedReport.files.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Attached Files</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.files.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 transition"
                      >
                        <Download size={16} />
                        {file.filename}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PRESCRIPTIONS TAB - List View */}
          {activeTab === "prescriptions" && !selectedPrescription && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Prescriptions ({prescriptions.length})
              </h3>
              {prescriptions.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No prescriptions found</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {prescriptions.map((prescription) => (
                    <div
                      key={prescription._id}
                      onClick={() => setSelectedPrescription(prescription)}
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">
                            Prescription from {new Date(prescription.date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {prescription.medications && prescription.medications.length > 0
                              ? `${prescription.medications.length} medication(s)`
                              : "No medications listed"}
                          </p>
                          {prescription.doctorName && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Stethoscope size={12} />
                              Dr. {prescription.doctorName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PRESCRIPTIONS TAB - Detail View */}
          {activeTab === "prescriptions" && selectedPrescription && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Prescription Details
                  </h2>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      {new Date(selectedPrescription.date).toLocaleDateString()}
                    </span>
                    {selectedPrescription.doctorName && (
                      <span className="flex items-center gap-1.5">
                        <Stethoscope size={14} />
                        Dr. {selectedPrescription.doctorName}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        // Deep clone medications to preserve all existing fields
                        setEditedMedications(
                          selectedPrescription.medications 
                            ? selectedPrescription.medications.map(med => ({ ...med }))
                            : []
                        );
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedMedications([]);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          setSavingPrescription(true);
                          try {
                            // Send the full editedMedications - preserve all fields from original
                            // The editedMedications already contains all original fields (deep cloned on edit start)
                            // Only the fields user modified in the inputs are different
                            await vaultAPI.updatePrescription(selectedPrescription._id, editedMedications);
                            // Update local state
                            const updatedPrescription = { ...selectedPrescription, medications: editedMedications };
                            setSelectedPrescription(updatedPrescription);
                            setRecords(prev => prev.map(r => r._id === selectedPrescription._id ? { ...r, medications: editedMedications } as any : r));
                            setIsEditing(false);
                            alert("Prescription updated successfully");
                          } catch (err: any) {
                            toast.error(err.response?.data?.error || "Failed to update prescription");
                          } finally {
                            setSavingPrescription(false);
                          }
                        }}
                        disabled={savingPrescription}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
                      >
                        <Save size={16} />
                        {savingPrescription ? "Saving..." : "Save"}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setSelectedPrescription(null);
                      setIsEditing(false);
                      setEditedMedications([]);
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {selectedPrescription.medications && selectedPrescription.medications.length > 0 && (
                <div className="mb-6">
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
                      {(isEditing ? editedMedications : selectedPrescription.medications.filter((med) => {
                          // Only filter in view mode - hide rows with 0 frequency or duration
                          // Check both string and numeric fields
                          const freqNum = med.frequency_per_day || (med.frequency ? parseInt(med.frequency.match(/(\d+)/)?.[1] || "1") : 1);
                          const durNum = med.duration_days || (med.duration ? parseInt(med.duration.match(/(\d+)/)?.[1] || "1") : 1);
                          return freqNum > 0 && durNum > 0;
                        }))
                        .map((med, idx) => {
                        // Get display values - check both string and numeric fields
                        const getFrequencyDisplay = () => {
                          if (med.frequency_per_day) return med.frequency_per_day.toString();
                          if (med.frequency) {
                            const match = med.frequency.match(/(\d+)/);
                            return match ? match[1] : med.frequency;
                          }
                          return "";
                        };
                        const getDurationDisplay = () => {
                          if (med.duration_days) return med.duration_days.toString();
                          if (med.duration) {
                            const match = med.duration.match(/(\d+)/);
                            return match ? match[1] : med.duration;
                          }
                          return "";
                        };
                        const freqDisplay = getFrequencyDisplay();
                        const durDisplay = getDurationDisplay();
                        const instructionDisplay = med.meal_instruction || med.food_relation || med.instructions || "";
                        
                        return (
                        <div
                          key={idx}
                          className="grid grid-cols-1 md:grid-cols-12 gap-y-2 gap-x-4 p-3 text-sm items-center"
                        >
                          {isEditing ? (
                            <>
                              <div className="col-span-full md:col-span-3">
                                <input
                                  type="text"
                                  value={med.medicine || ""}
                                  onChange={(e) => {
                                    const updated = [...editedMedications];
                                    updated[idx] = { ...updated[idx], medicine: e.target.value };
                                    setEditedMedications(updated);
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div className="col-span-full md:col-span-2">
                                <input
                                  type="text"
                                  value={med.dosage || ""}
                                  onChange={(e) => {
                                    const updated = [...editedMedications];
                                    updated[idx] = { ...updated[idx], dosage: e.target.value };
                                    setEditedMedications(updated);
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div className="col-span-full md:col-span-2">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    value={med.frequency_per_day ?? ""}
                                    onChange={(e) => {
                                      const updated = [...editedMedications];
                                      const val = e.target.value === "" ? undefined : parseInt(e.target.value);
                                      updated[idx] = { ...updated[idx], frequency_per_day: val };
                                      setEditedMedications(updated);
                                    }}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                  />
                                  <span className="text-gray-500 text-xs">× daily</span>
                                </div>
                              </div>
                              <div className="col-span-full md:col-span-2">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    value={med.duration_days ?? ""}
                                    onChange={(e) => {
                                      const updated = [...editedMedications];
                                      const val = e.target.value === "" ? undefined : parseInt(e.target.value);
                                      updated[idx] = { ...updated[idx], duration_days: val };
                                      setEditedMedications(updated);
                                    }}
                                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                  />
                                  <span className="text-gray-500 text-xs">days</span>
                                </div>
                              </div>
                              <div className="col-span-full md:col-span-3">
                                <input
                                  type="text"
                                  value={med.meal_instruction || ""}
                                  onChange={(e) => {
                                    const updated = [...editedMedications];
                                    updated[idx] = { ...updated[idx], meal_instruction: e.target.value };
                                    setEditedMedications(updated);
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="e.g., after food"
                                />
                              </div>
                            </>
                          ) : (
                            <>
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
                                {instructionDisplay || "—"}
                              </div>
                            </>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* {selectedPrescription.files && selectedPrescription.files.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Attached Files</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrescription.files.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 transition"
                      >
                        <Download size={16} />
                        {file.filename}
                      </a>
                    ))}
                  </div>
                </div>
              )} */}
            </div>
          )}
        </>
      )}

      {/* Patient Auth Modal */}
      <PatientAuthModal
        isOpen={isAuthModalOpen}
        onClose={handleModalClose}
        onMpinSubmit={handleMpinSubmit}
        onPatientSelect={handlePatientSelect}
        loading={loading}
        patients={matchingPatients}
        showPatientList={showPatientList}
      />
    </div>
  );
};

export default Vault;
