import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "../store/store";
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
         *  CALORIES TREND (from vitalLogs only, summed by day)
         -------------------------*/
        const caloriesByDate: Record<string, { calories: number; rawDate: Date }> = {};

        res.data.vitalLogs.forEach((log: any) => {
          if (log.type === "food" && log.calories_consumed) {
            const rawDate = new Date(log.date);
            const dateKey = rawDate.toISOString().split('T')[0]; // YYYY-MM-DD for grouping
            
            if (!caloriesByDate[dateKey]) {
              caloriesByDate[dateKey] = { calories: 0, rawDate };
            }
            caloriesByDate[dateKey].calories += log.calories_consumed;
          }
        });

        // Convert to array, sort by actual date, then format for display
        const calorieEntries = Object.entries(caloriesByDate)
          .sort((a, b) => a[1].rawDate.getTime() - b[1].rawDate.getTime())
          .map(([_, data]) => ({
            date: data.rawDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            calories: data.calories
          }));

        setCaloriesData(calorieEntries);


        /** ------------------------
         *  BP TREND (from vitalLogs)
         -------------------------*/
        const bpEntries = res.data.vitalLogs
          .filter((log: any) => log.type === "bp" && log.systolic && log.diastolic)
          .map((log: any) => ({
            rawDate: new Date(log.date),
            systolic: log.systolic,
            diastolic: log.diastolic,
          }))
          .sort((a: any, b: any) => a.rawDate.getTime() - b.rawDate.getTime())
          .map((entry: any) => ({
            date: entry.rawDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            systolic: entry.systolic,
            diastolic: entry.diastolic,
          }));

        setBpData(bpEntries);


        /** ------------------------
         *  WEIGHT TREND (from vitalLogs)
         -------------------------*/
        const weightEntries = res.data.vitalLogs
          .filter((log: any) => log.type === "weight" && log.value)
          .map((log: any) => ({
            rawDate: new Date(log.date),
            weight: parseFloat(log.value),
          }))
          .sort((a: any, b: any) => a.rawDate.getTime() - b.rawDate.getTime())
          .map((entry: any) => ({
            date: entry.rawDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            weight: entry.weight,
          }));

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
