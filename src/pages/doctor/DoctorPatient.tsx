import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { patientsAPI , healthLogsAPI } from "../../services/api";
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  FileText,
  Heart,
  TrendingUp,
  Clock,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface Patient {
  id: string;
  name: string;
  phone: string;
  bloodGroup?: string;
  lastVisit?: string;
  condition?: string;
  status?: "stable" | "critical" | "recovering";
  avatar?: string;
}

const DoctorPatients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
const [logs, setLogs] = useState<any>(null);
const [showModal, setShowModal] = useState(false);
const [logsLoading, setLogsLoading] = useState(false);


  // Fetch real patients mapped to this doctor
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("doctorToken");
        if (!token) return;

        const decoded: any = jwtDecode(token);

        const doctorInfo = localStorage.getItem("doctorInfo");
        const doctorPhone = doctorInfo ? JSON.parse(doctorInfo).phone : null;

        const response = await patientsAPI.getMappedPatients(doctorPhone);

        // Transform backend structure into UI-friendly structure
        const formattedPatients = response.data.data.map((p: any) => ({
          id: p._id,
          name: p.name,
          phone: p.phone,
          bloodGroup: p.blood_group || "Unknown",
          lastVisit: "2025-11-10", // you can update this when backend provides it
          condition: "General Checkup", // placeholder until backend provides it
          status: "stable", // placeholder
          avatar: `https://i.pravatar.cc/150?u=${p._id}`,
        }));

        setPatients(formattedPatients);
      } catch (err) {
        console.error("Error fetching patients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const openPatientLogs = async (patient: Patient) => {
  try {
    setSelectedPatient(patient);
    setShowModal(true);
    setLogsLoading(true);

    const res = await healthLogsAPI.getLogsByPhone(patient.phone);

    const vital = res.data.vitalLogs.map((log: any) => ({
      ...log,
      log_type: log.type, // "food", "bp", "weight"
    }));

    // ---------------------------
    // GROUP LOGS BY DATE
    // ---------------------------
    const grouped: Record<string, any[]> = {};

    vital.forEach((log : any) => {
      const date = log.date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(log);
    });

    // Sort each date's logs by time
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => {
        const t1 = new Date(`${a.date} ${a.time}`).getTime();
        const t2 = new Date(`${b.date} ${b.time}`).getTime();
        return t2 - t1;
      });
    });

    // Order the dates descending (newest → oldest)
    const sortedDates = Object.keys(grouped).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

// ---------------------------
// CALORIES TREND (Aggregated per date)
// ---------------------------
const calorieMap: Record<string, number> = {};

vital
  .filter((v : any) => v.type === "food" && v.calories_consumed != null)
  .forEach((v : any) => {
    const date = v.created_at.split("T")[0];
    calorieMap[date] = (calorieMap[date] || 0) + v.calories_consumed;
  });

const calorieData = Object.entries(calorieMap)
  .map(([date, calories]) => ({ date, calories }))
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


    // ---------------------------
    // BLOOD PRESSURE TREND
    // ---------------------------
    const bpData: any[] = vital
      .filter((v : any) => v.type === "bp")
      .map((v : any) => ({
        date: v.created_at.split("T")[0],
        systolic: v.systolic,
        diastolic: v.diastolic,
      }))
      .sort((a : any, b : any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // ---------------------------
    // WEIGHT TREND
    // ---------------------------
    const weightData: any[] = vital
      .filter((v : any) => v.type === "weight")
      .map((v : any) => ({
        date: v.created_at.split("T")[0],
        weight: parseFloat(v.value),
      }))
      .sort((a : any, b : any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // ---------------------------
    // SET LOGS (FINAL OBJECT)
    // ---------------------------
    setLogs({
      groupedLogs: grouped,
      orderedDates: sortedDates,
      calorieData,
      bpData,
      weightData,
    });

  } catch (err) {
    console.error("Error fetching logs:", err);
  } finally {
    setLogsLoading(false);
  }
};




  const getStatusColor = (status: string) => {
    switch (status) {
      case "stable":
        return "bg-green-100 text-green-700 border-green-200";
      case "recovering":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "critical":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    {
      label: "Total Patients",
      value: patients.length,
      icon: <Users className="h-5 w-5" />,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Needs Attention",
      value: patients.filter((p) => p.status === "critical").length,
      icon: <Heart className="h-5 w-5" />,
      color: "text-red-600 bg-red-100",
    },
    {
      label: "Recovering",
      value: patients.filter((p) => p.status === "recovering").length,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      label: "Stable",
      value: patients.filter((p) => p.status === "stable").length,
      icon: <FileText className="h-5 w-5" />,
      color: "text-green-600 bg-green-100",
    },
  ];

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-600 mt-3">Loading patients...</p>
      </div>
    );
  }

 return (
  <div className="space-y-6 p-4 md:p-6">
    {/* Header */}
    <div>
      <h1 className="text-3xl font-bold text-gray-800">My Patients</h1>
      <p className="mt-1 text-gray-500">Manage and monitor your patient records</p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition"
        >
          <div className="flex items-center justify-between">
            <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </div>
          <p className="text-sm text-gray-600 mt-3">{stat.label}</p>
        </div>
      ))}
    </div>

    {/* Search + Filter */}
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-11 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Status</option>
            <option value="stable">Stable</option>
            <option value="recovering">Recovering</option>
            <option value="critical">Needs Attention</option>
          </select>
        </div>
      </div>
    </div>

    {/* Patient List */}
    <div className="grid grid-cols-1 gap-4">
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No patients found</p>
        </div>
      ) : (
        filteredPatients.map((patient) => (
          <div
            key={patient.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition cursor-pointer"
            onClick={() => openPatientLogs(patient)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{patient.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        patient.status || "stable"
                      )}`}
                    >
                      {(patient.status || "stable").charAt(0).toUpperCase() +
                        (patient.status || "stable").slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Phone size={16} />
                      <span>{patient.phone}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Heart size={16} className="text-red-500" />
                      <span>{patient.bloodGroup}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Last Visit: {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <FileText size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-700">
                      <strong>Condition:</strong> {patient.condition || "General Checkup"}
                    </span>
                  </div>
                </div>
              </div>

              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <ChevronRight size={20} className="text-gray-400" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>

    {/* MODAL */}
    {showModal && selectedPatient && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-lg relative">

          {/* Close Button */}
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>

          <h2 className="text-xl font-bold mb-3">
            Logs for {selectedPatient.name}
          </h2>

          {/* LOADING */}
          {logsLoading ? (
            <div className="text-center p-6">
              <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-500 mt-2">Loading logs…</p>
            </div>
          ) : logs ? (
            <div className="space-y-6 max-h-[75vh] overflow-y-auto">

              {/* =======================
                  🔥 CALORIES TREND
              ======================== */}
              <div>
                <h3 className="text-lg font-semibold mb-2">🔥 Calories Trend</h3>
                <div className="bg-white p-4 border rounded-xl shadow-sm h-64">
                  {logs.calorieData?.length === 0 ? (
                    <p className="text-gray-500 text-sm">No calorie data available.</p>
                  ) : (
<ResponsiveContainer width="100%" height="100%">
  <AreaChart data={logs.calorieData}>
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Area
      type="monotone"
      dataKey="calories"
      stroke="#0284c7"
      fill="#bae6fd"
    />

    {/* Average calories line */}
    <Line
      type="monotone"
      dataKey={() => logs.avgCalories}
      stroke="#ef4444"
      strokeDasharray="5 5"
      dot={false}
    />
  </AreaChart>
</ResponsiveContainer>

                  )}
                </div>
              </div>

              {/* =======================
                  ❤️ BLOOD PRESSURE TREND
              ======================== */}
              <div>
                <h3 className="text-lg font-semibold mb-2">❤️ Blood Pressure</h3>
                <div className="bg-white p-4 border rounded-xl shadow-sm h-64">
                  {logs.bpData?.length === 0 ? (
                    <p className="text-gray-500 text-sm">No BP data available.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={logs.bpData}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} />
                        <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* =======================
                  ⚖️ WEIGHT CHART
              ======================== */}
              <div>
                <h3 className="text-lg font-semibold mb-2">⚖️ Weight Trend</h3>
                <div className="bg-white p-4 border rounded-xl shadow-sm h-64">
                  {logs.weightData?.length === 0 ? (
                    <p className="text-gray-500 text-sm">No weight data available.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={logs.weightData}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* =======================
                  📅 LOGS GROUPED BY DATE
              ======================== */}
              <div>
                <h3 className="text-lg font-semibold mb-3">🗂️ Logs (Grouped by Date)</h3>

                {logs.orderedDates.length === 0 ? (
                  <p className="text-gray-500 text-sm">No logs found.</p>
                ) : (
                  logs.orderedDates.map((date: string) => (
                    <div key={date} className="mb-6">
                      <h4 className="text-md font-bold text-gray-800 mb-2">{date}</h4>

                      {logs.groupedLogs[date].map((log: any) => (
                        <div
                          key={log._id}
                          className="border rounded-lg p-4 mb-3 bg-gray-50"
                        >
                          <p className="text-sm text-gray-700 font-semibold">
                            {log.time} — {log.log_type === "meal" ? "🍽️ Meal" : "📊 Vital"}
                          </p>

                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-700">
                            <p><strong>Calories:</strong> {log.total_calories ?? log.calories_consumed}</p>
                            <p><strong>Carbs:</strong> {log.carbs_g}</p>
                            <p><strong>Protein:</strong> {log.protein_g}</p>
                            <p><strong>Fats:</strong> {log.fats_g}</p>
                            <p><strong>Health Score:</strong> {log.health_score}</p>
                          </div>

                          {log.items?.length > 0 && (
                            <p className="mt-2 text-sm"><strong>Items:</strong> {log.items.join(", ")}</p>
                          )}

                          {log.analysis?.brief_assessment && (
                            <p className="mt-2 text-sm text-gray-700">
                              <strong>Assessment:</strong> {log.analysis.brief_assessment}
                            </p>
                          )}

                          {log.analysis?.top_suggestion && (
                            <p className="mt-1 text-sm text-gray-700">
                              <strong>Suggestion:</strong> {log.analysis.top_suggestion}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>

            </div>
          ) : (
            <p className="text-gray-500">No logs found.</p>
          )}

        </div>
      </div>
    )}

  </div>
);

};

export default DoctorPatients;
