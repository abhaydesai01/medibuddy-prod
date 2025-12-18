import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "../store/store";
import { Stethoscope, ArrowRight } from "lucide-react";
import { healthLogsAPI } from "../services/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";


const Dashboard: React.FC = () => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [logs, setLogs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [caloriesData, setCaloriesData] = useState<any[]>([]);
  const [bpData, setBpData] = useState<any[]>([]);
  const [weightData, setWeightData] = useState<any[]>([]);



  // Hardcoded patient phone for now
  const patientPhone = localStorage.getItem("patientPhone") ?? "";

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await healthLogsAPI.getLogsByPhone(patientPhone);
        setLogs(res.data);

        /** ------------------------
         *  CALORIES TREND
         -------------------------*/
        const calorieEntries: any[] = [];

        res.data.mealLogs.forEach((log: any) => {
          calorieEntries.push({
            date: log.date,
            calories: log.total_calories,
          });
        });

        res.data.vitalLogs.forEach((log: any) => {
          if (log.calories_consumed) {
            calorieEntries.push({
              date: log.date,
              calories: log.calories_consumed,
            });
          }
        });

        calorieEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setCaloriesData(calorieEntries);


        /** ------------------------
         *  BP TREND
         -------------------------*/
        const bpEntries: any[] = [];

        res.data.vitalLogs.forEach((log: any) => {
          if (log.type === "bp" && log.systolic && log.diastolic) {
            bpEntries.push({
              date: log.date,
              systolic: log.systolic,
              diastolic: log.diastolic,
            });
          }
        });

        bpEntries.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setBpData(bpEntries);



        /** ------------------------
         *  WEIGHT TREND
         -------------------------*/
        const weightEntries: any[] = [];

        res.data.vitalLogs.forEach((log: any) => {
          if (log.type === "weight" && log.value) {
            weightEntries.push({
              date: log.date,
              weight: parseFloat(log.value),
            });
          }
        });

        weightEntries.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setWeightData(weightEntries);


      } catch (err) {
        console.error("Error fetching logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [patientPhone]);


  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="space-y-8 p-2 md:p-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-1 text-gray-500">
          Here's your latest health activity summary
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">

          <section>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Your Recent Health Logs
            </h2>

            {/* CHARTS SECTION */}
            <div className="space-y-10">

              {/* CALORIES CHART */}
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  🔥 Calories Trend
                </h2>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  {caloriesData.length === 0 ? (
                    <p className="text-gray-500 text-sm">No calorie data available.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={caloriesData}>
                        <defs>
                          <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.7} />
                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>

                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="calories"
                          stroke="#0284c7"
                          fill="url(#colorCal)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* BP CHART */}
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  ❤️ Blood Pressure Trend
                </h2>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  {bpData.length === 0 ? (
                    <p className="text-gray-500 text-sm">No BP data available.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={bpData}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />

                        {/* Normal BP reference lines */}
                        <ReferenceLine
                          y={120}
                          stroke="#22c55e"
                          strokeDasharray="6 4"
                          label={{ value: "Normal Systolic (120)", position: "right", fill: "#16a34a", fontSize: 12 }}
                        />

                        <ReferenceLine
                          y={80}
                          stroke="#22c55e"
                          strokeDasharray="6 4"
                          label={{ value: "Normal Diastolic (80)", position: "right", fill: "#16a34a", fontSize: 12 }}
                        />

                        {/* Actual BP lines */}
                        <Line
                          type="monotone"
                          dataKey="systolic"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={false}
                        />

                        <Line
                          type="monotone"
                          dataKey="diastolic"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>

                  )}
                </div>
              </div>

              {/* WEIGHT CHART */}
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  ⚖️ Weight Trend
                </h2>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  {weightData.length === 0 ? (
                    <p className="text-gray-500 text-sm">No weight data available.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={weightData}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />

                        <Line
                          type="monotone"
                          dataKey="weight"
                          stroke="#10b981"  /* green */
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>


            </div>

            {/* LOGS */}
            {loading ? (
              <div className="p-6 text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading logs…</p>
              </div>
            ) : logs ? (
              <div className="space-y-10">

                {/* KEEP YOUR EXACT EXISTING MEAL + VITAL LOGS COMPONENT HERE */}

                {/* COPY YOUR ORIGINAL MEAL LOG BLOCK AND PASTE HERE */}
                {/* COPY YOUR ORIGINAL VITAL LOG BLOCK AND PASTE HERE */}

              </div>
            ) : (
              <p className="text-gray-500">No logs found.</p>
            )}
          </section>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
