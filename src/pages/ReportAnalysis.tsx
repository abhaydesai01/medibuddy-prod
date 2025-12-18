import React, { useState, useEffect, useCallback, useRef } from "react";
import { reportAPI } from "../services/api";
import {
  Upload,
  FileText,
  Brain,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Plus,
  Search,
  BarChart3,
  Clock,
  AlertTriangle,
  Info,
  Trash2,
  RefreshCw,
  FileX,
  Loader2,
  ChevronDown,
  Star,
  Zap,
  HeartPulse,
  X,
} from "lucide-react";

// --- Type Interfaces (from original code) ---
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
  title: string;
  reportType: string;
  processingStatus: "uploaded" | "processing" | "analyzed" | "failed";
  createdAt: string;
  testResults: TestResult[];
  aiAnalysis?: AIAnalysis;
  fileInfo?: {
    originalName?: string;
    size?: number;
    mimeType?: string;
    uploadedAt?: string;
  };
  trends?: Array<{
    parameter: string;
    trend: "improving" | "declining" | "stable";
    description: string;
  }>;
  reportDate?: string;
  labName?: string;
  tags?: string[];
  originalFileName?: string;
}

// --- Reusable UI Components ---
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

// --- Main Report Analysis Component ---
const ReportAnalysis: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [deletingReport, setDeletingReport] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [reportType, setReportType] = useState("");
  const [reportTitle, setReportTitle] = useState("");
  const [reportNotes, setReportNotes] = useState("");

  const reportTypes = [
    "Blood Test",
    "Urine Test",
    "X-Ray",
    "MRI",
    "CT Scan",
    "Ultrasound",
    "Other",
  ];

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await reportAPI.getReports();
      const reportsData = response.data?.reports ?? [];

      const normalizedReports: Report[] = reportsData.map((r: any) => {
        // 🔥 Normalize TEST RESULTS
        const normalizedTestResults: TestResult[] = (
          r.testResults?.length
            ? r.testResults
            : r.test_results || []
        ).map((tr: any) => {
          // Parse reference range safely
          let min = "";
          let max = "";
          let description = "";

          if (typeof tr.reference_range === "string") {
            if (tr.reference_range.includes("-")) {
              [min, max] = tr.reference_range.split("-").map((s: string) => s.trim());
            } else {
              description = tr.reference_range;
            }
          }

          return {
            parameter: tr.name || "Unknown",
            value: tr.value ?? "",
            unit: tr.unit ?? "",
            normalRange: {
              min,
              max,
              description,
            },
            status: tr.status || "normal",
            description: "",          // backend doesn’t provide this
            category: "General",      // backend doesn’t provide categories
          };
        });

        return {
          _id: r._id,
          title: r.title || r.originalFileName || "Untitled Report",
          reportType: r.reportType || "Other",
          processingStatus: r.processingStatus || "uploaded",

          // dates
          createdAt: r.createdAt || r.created_at,
          reportDate: r.reportDate || r.report_date,

          // normalized arrays
          testResults: normalizedTestResults,
          trends: r.trends || [],
          tags: r.tags || [],

          aiAnalysis: r.ai_analysis_summary ||
            r.key_findings ||
            r.recommendations ||
            r.follow_up_actions ||
            r.potential_risk_factors
            ? {
              summary: r.ai_analysis_summary || r.summary || "",
              keyFindings: (r.key_findings || []).map((k: string, i: number) => ({
                parameter: `Finding ${i + 1}`,
                value: "",
                status: "abnormal",
                description: k,
              })),
              recommendations: r.recommendations || [],
              followUpActions: r.follow_up_actions || [],
              riskFactors: r.potential_risk_factors || [],
              overallAssessment:
                r.ai_analysis_summary
                  ? "AI-generated assessment available"
                  : "Assessment pending",
              urgencyLevel: "medium", // backend doesn't provide this yet
            }
            : undefined,

          labName: r.labName,

          fileInfo: {
            originalName:
              r.fileInfo?.originalName ||
              r.originalFileName ||
              "Unknown file",
            size: r.fileInfo?.size,
            mimeType: r.fileInfo?.mimeType,
            uploadedAt: r.fileInfo?.uploadedAt,
          },
        };
      });

      // ✅ sorting now works
      normalizedReports.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setReports(normalizedReports);
    } catch (error: any) {
      setError(
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch reports"
      );
    } finally {
      setLoading(false);
    }
  }, []);



  useEffect(() => {
    fetchReports();
    const intervalId = setInterval(fetchReports, 30000);
    return () => clearInterval(intervalId);
  }, [fetchReports]);

  const handleFileUpload = async () => {
    if (!uploadFile || !reportType) {
      setError("Please select a file and report type.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("reportFile", uploadFile);
      formData.append("reportType", reportType);
      if (reportTitle) formData.append("title", reportTitle);
      if (reportNotes) formData.append("notes", reportNotes);

      const response = await reportAPI.uploadReport(formData);

      setUploadFile(null);
      setReportType("");
      setReportTitle("");
      setReportNotes("");
      setShowUploadModal(false);

      await fetchReports();

      if (response.data.report) {
        setSelectedReport(response.data.report);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to upload report");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    setDeletingReport(reportId);
    try {
      await reportAPI.deleteReport(reportId);
      setReports((prev) => prev.filter((report) => report._id !== reportId));
      if (selectedReport?._id === reportId) {
        setSelectedReport(null);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to delete report");
    } finally {
      setDeletingReport(null);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (["application/pdf", "text/plain"].includes(file.type)) {
        setUploadFile(file);
        if (!reportTitle) setReportTitle(file.name.replace(/\.[^/.]+$/, ""));
      } else {
        setError("Please upload a PDF or text file.");
      }
    }
  };

  const getStatusDisplay = (status: string) => {
    const statusMap = {
      uploaded: {
        text: "Uploaded",
        color: "text-purple-700",
        bg: "bg-purple-50",
        icon: Clock,
      },
      processing: {
        text: "Processing",
        color: "text-yellow-700",
        bg: "bg-yellow-50",
        icon: Loader2,
      },
      analyzed: {
        text: "Analyzed",
        color: "text-green-700",
        bg: "bg-green-50",
        icon: CheckCircle,
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

  const filteredReports = reports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedResults = selectedReport?.testResults?.reduce((acc, result) => {
    const category = result.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(result);
    return acc;
  }, {} as Record<string, TestResult[]>);

  return (
    <div className="p-4 md:p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          AI Medical Report Analysis
        </h1>
        <p className="mt-1 text-gray-500">
          Upload your medical reports for AI-powered insights and detailed
          analysis.
        </p>
      </div>

      <div
        className={`grid gap-8 transition-all duration-300 ${selectedReport ? "lg:grid-cols-3 xl:grid-cols-4" : "lg:grid-cols-1"
          }`}
      >
        <div
          className={`${selectedReport ? "lg:col-span-1 xl:col-span-1" : "lg:col-span-1"
            }`}
        >
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full h-12 px-5 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={18} /> Upload Report
              </button>
              <button
                onClick={fetchReports}
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
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 min-h-[400px] overflow-y-auto -mr-2 pr-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-700 mb-2" />
                  <p>Loading reports...</p>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
                  <FileX className="h-12 w-12 mb-2 text-gray-300" />
                  <p className="font-semibold">No reports found.</p>
                  <p className="text-sm">
                    Upload your first report to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredReports.map((report) => {
                    const status = getStatusDisplay(report.processingStatus);
                    const Urgency = getUrgencyDisplay(
                      report.aiAnalysis?.urgencyLevel || ""
                    );
                    return (
                      <div
                        key={report._id}
                        onClick={() => setSelectedReport(report)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedReport?._id === report._id
                            ? "bg-blue-50 border-blue-700"
                            : "bg-white border-gray-200 hover:border-blue-400"
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {report.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {report.reportType} &bull;{" "}
                              {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteReport(report._id);
                            }}
                            disabled={deletingReport === report._id}
                            className="p-1.5 rounded-md hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            {deletingReport === report._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs font-medium">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${status.bg} ${status.color}`}
                          >
                            <status.icon
                              size={12}
                              className={
                                report.processingStatus === "processing"
                                  ? "animate-spin"
                                  : ""
                              }
                            />{" "}
                            {status.text}
                          </span>
                          {report.aiAnalysis && (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${Urgency.bg} ${Urgency.color}`}
                            >
                              {Urgency.text}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedReport && (
          <div className="lg:col-span-2 xl:col-span-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedReport.title}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedReport.reportType} &bull; Lab:{" "}
                  {selectedReport.labName || "N/A"} &bull; Date:{" "}
                  {selectedReport.reportDate
                    ? new Date(selectedReport.reportDate).toLocaleDateString()
                    : new Date(selectedReport.createdAt).toLocaleDateString()}
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
                        {selectedReport.aiAnalysis.summary ||
                          "No summary available"}
                      </p>
                      <div className="mt-3 flex items-center gap-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-semibold ${getUrgencyDisplay(
                            selectedReport.aiAnalysis.urgencyLevel || "low"
                          ).bg
                            } ${getUrgencyDisplay(
                              selectedReport.aiAnalysis.urgencyLevel || "low"
                            ).color
                            }`}
                        >
                          {
                            getUrgencyDisplay(
                              selectedReport.aiAnalysis.urgencyLevel || "low"
                            ).text
                          }
                        </span>
                        <span className="text-xs text-gray-500">
                          Overall:{" "}
                          <span className="font-semibold text-gray-700">
                            {selectedReport.aiAnalysis.overallAssessment ||
                              "Assessment pending"}
                          </span>
                        </span>
                      </div>
                    </InfoCard>

                    <InfoCard
                      icon={<Star size={20} className="text-yellow-600" />}
                      title="Key Findings"
                    >
                      {selectedReport.aiAnalysis.keyFindings?.length ? (
                        <div className="space-y-3">
                          {selectedReport.aiAnalysis.keyFindings.map((f) => (
                            <div
                              key={f.parameter}
                              className="flex items-start gap-3"
                            >
                              <div className="flex-1">
                                <div className="flex items-baseline justify-between">
                                  <div className="font-semibold text-gray-800">
                                    {f.parameter}
                                  </div>
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
                      ) : (
                        <p className="text-sm text-gray-500">
                          No key findings identified.
                        </p>
                      )}
                    </InfoCard>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoCard
                        icon={
                          <HeartPulse size={20} className="text-green-600" />
                        }
                        title="Recommendations"
                      >
                        {selectedReport.aiAnalysis.recommendations?.length ? (
                          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                            {selectedReport.aiAnalysis.recommendations.map(
                              (r, i) => (
                                <li key={i}>{r}</li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No recommendations.
                          </p>
                        )}
                      </InfoCard>

                      <InfoCard
                        icon={
                          <CheckCircle size={20} className="text-indigo-600" />
                        }
                        title="Follow-Up Actions"
                      >
                        {selectedReport.aiAnalysis.followUpActions?.length ? (
                          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                            {selectedReport.aiAnalysis.followUpActions.map(
                              (a, i) => (
                                <li key={i}>{a}</li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No follow-up actions suggested.
                          </p>
                        )}
                      </InfoCard>
                    </div>

                    <InfoCard
                      icon={
                        <AlertTriangle size={20} className="text-orange-600" />
                      }
                      title="Potential Risk Factors"
                    >
                      {selectedReport.aiAnalysis.riskFactors?.length ? (
                        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                          {selectedReport.aiAnalysis.riskFactors.map(
                            (risk, i) => (
                              <li key={i}>{risk}</li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">
                          No risk factors identified.
                        </p>
                      )}
                    </InfoCard>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-white/60 to-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-sm text-gray-500">
                            Report Status
                          </h4>
                          <div className="mt-2 flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded-md text-xs font-semibold ${getStatusDisplay(
                                selectedReport.processingStatus
                              ).bg
                                } ${getStatusDisplay(
                                  selectedReport.processingStatus
                                ).color
                                }`}
                            >
                              {
                                getStatusDisplay(
                                  selectedReport.processingStatus
                                ).text
                              }
                            </span>
                            {selectedReport.tags &&
                              selectedReport.tags.length > 0 && (
                                <span className="text-xs text-gray-500">
                                  Tags:{" "}
                                  <span className="font-medium text-gray-700">
                                    {selectedReport.tags.join(", ")}
                                  </span>
                                </span>
                              )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>Uploaded</div>
                          <div className="font-medium text-gray-700">
                            {new Date(
                              selectedReport.createdAt
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        <div>
                          Overall assessment:{" "}
                          <span className="font-semibold text-gray-700">
                            {selectedReport.aiAnalysis.overallAssessment ||
                              "Assessment pending"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <InfoCard
                      icon={<FileText size={18} className="text-gray-600" />}
                      title="File Info"
                    >
                      <div className="text-sm text-gray-700">
                        <div>
                          <span className="text-gray-500">Name:</span>{" "}
                          {selectedReport.fileInfo?.originalName ||
                            selectedReport.originalFileName ||
                            "N/A"}
                        </div>
                        <div>
                          <span className="text-gray-500">Type:</span>{" "}
                          {selectedReport.fileInfo?.mimeType || "N/A"}
                        </div>
                        <div>
                          <span className="text-gray-500">Size:</span>{" "}
                          {selectedReport.fileInfo?.size
                            ? `${(selectedReport.fileInfo.size / 1024).toFixed(
                              1
                            )} KB`
                            : "N/A"}
                        </div>
                        <div>
                          <span className="text-gray-500">Uploaded:</span>{" "}
                          {selectedReport.fileInfo?.uploadedAt
                            ? new Date(
                              selectedReport.fileInfo.uploadedAt
                            ).toLocaleString()
                            : new Date(
                              selectedReport.createdAt
                            ).toLocaleString()}
                        </div>
                      </div>
                    </InfoCard>

                    <InfoCard
                      icon={<Info size={18} className="text-gray-600" />}
                      title="Metadata"
                    >
                      <div className="text-sm text-gray-700">
                        <div>
                          <span className="text-gray-500">Type:</span>{" "}
                          {selectedReport.reportType}
                        </div>
                        <div>
                          <span className="text-gray-500">Lab:</span>{" "}
                          {selectedReport.labName || "N/A"}
                        </div>
                        <div>
                          <span className="text-gray-500">Report Date:</span>{" "}
                          {selectedReport.reportDate
                            ? new Date(
                              selectedReport.reportDate
                            ).toLocaleDateString()
                            : "N/A"}
                        </div>
                      </div>
                    </InfoCard>
                  </div>
                </div>

                {selectedReport.trends && selectedReport.trends.length > 0 && (
                  <InfoCard
                    icon={<BarChart3 size={20} className="text-purple-600" />}
                    title="Trends vs. Previous Reports"
                  >
                    <div className="space-y-3">
                      {selectedReport.trends.map((trend) => (
                        <div
                          key={trend.parameter}
                          className="flex items-center gap-3 text-sm"
                        >
                          {getTrendIcon(trend.trend)}
                          <div>
                            <div className="font-semibold text-gray-700">
                              {trend.parameter}
                            </div>
                            <div className="text-gray-500 text-sm">
                              {trend.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </InfoCard>
                )}

                {groupedResults && Object.keys(groupedResults).length > 0 && (
                  <h3 className="text-xl font-bold text-gray-800 pt-4 border-t border-gray-200">
                    Detailed Test Results
                  </h3>
                )}
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
                          className={`transition-transform ${expandedCategories.has(category) ? "rotate-180" : ""
                            }`}
                        />
                      </button>
                      {expandedCategories.has(category) && (
                        <div className="mt-2 border border-gray-100 rounded-lg overflow-hidden">
                          <div className="hidden md:grid md:grid-cols-12 gap-4 p-3 bg-gray-100 font-semibold text-xs text-gray-600 uppercase tracking-wider">
                            <div className="col-span-4">Parameter</div>
                            <div className="col-span-2 text-center">
                              Your Value
                            </div>
                            <div className="col-span-3 text-center">
                              Normal Range
                            </div>
                            <div className="col-span-3 text-center">Status</div>
                          </div>
                          {results.map((result) => {
                            const colors = getTestResultColor(result.status);
                            return (
                              <div
                                key={result.parameter}
                                className={`grid grid-cols-1 md:grid-cols-12 gap-y-2 gap-x-4 p-3 border-t border-gray-100 text-sm items-center`}
                              >
                                <div className="col-span-full md:col-span-4 font-semibold text-gray-800">
                                  {result.parameter}
                                </div>
                                <div className="col-span-full md:col-span-2 text-left md:text-center font-bold text-gray-900">
                                  {result.value} {result.unit}
                                </div>
                                <div className="col-span-full md:col-span-3 text-left md:text-center text-gray-500">
                                  {result.normalRange.min &&
                                    result.normalRange.max
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
            ) : (
              <div className="text-center py-20 text-gray-500">
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-700" />
                <p className="mt-4 font-semibold">Processing Report...</p>
                <p className="text-sm">
                  The AI is analyzing your results. This may take a moment.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800">
                Upload Medical Report
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Upload a PDF or text file for AI analysis.
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
                      Supports PDF, TXT up to 10MB
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
                  id="file-upload"
                  accept=".pdf,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setUploadFile(f);
                      if (!reportTitle)
                        setReportTitle(f.name.replace(/\.[^/.]+$/, ""));
                    }
                  }}
                  className="hidden"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Report Type *
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type...</option>
                    {reportTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Report Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="e.g., Annual Bloodwork"
                    className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Notes (Optional)
                </label>
                <textarea
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  rows={2}
                  placeholder="Add any notes..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                disabled={!uploadFile || !reportType || uploading}
                className="h-11 px-5 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 flex items-center justify-center gap-2 disabled:bg-gray-400"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Zap size={16} /> Upload & Analyze
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportAnalysis;
