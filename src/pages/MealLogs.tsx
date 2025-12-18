import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "../store/store";
import { healthLogsAPI } from "../services/api";



const MealLogs: React.FC = () => {
    const { user, isAuthenticated } = useSelector(
        (state: RootState) => state.auth
    );

    const [logs, setLogs] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const patientPhone = localStorage.getItem("patientPhone") ?? "";

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await healthLogsAPI.getLogsByPhone(patientPhone);
                setLogs(res.data);

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
                    Here are your Meal logs, {user?.name}!
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className="lg:col-span-2 space-y-8">

                    <section>


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



                    {loading ? (
                        <div className="p-6 text-center">
                            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-gray-500 mt-2">Loading logs…</p>
                        </div>
                    ) : logs ? (
                        <div className="space-y-10">

                            {/* Meal Logs */}
                            <div>
  {/* <h3 className="text-lg font-semibold text-gray-800 mb-4">
    🍽️ Meal Logs
  </h3> */}

  {logs.mealLogs.length === 0 ? (
    <p className="text-gray-500 text-sm">No meal logs found.</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {logs.mealLogs.map((log: any) => (
        <div
          key={log._id}
          className="
  bg-white border border-gray-200 rounded-xl shadow-sm p-5
  transition-all duration-100 ease-out
  hover:shadow-lg hover:scale-[1.09]
"

        >
          {/* Header */}
          <div className="mb-2">
            <p className="font-semibold text-gray-800">
              {log.meal_type}
            </p>
            <p className="text-xs text-gray-500">
              {log.date} • {log.time?.slice(0, 5)}
            </p>
          </div>

          {/* Description */}
          {log.description && (
            <p className="text-sm text-gray-700 mb-3">
              {log.description}
            </p>
          )}

          {/* Nutrition */}
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <p><strong>Calories:</strong> {log.total_calories}</p>
            <p><strong>Health:</strong> {log.health_score}</p>
            <p><strong>Carbs:</strong> {log.carbs_g}g</p>
            <p><strong>Protein:</strong> {log.protein_g}g</p>
            <p><strong>Fats:</strong> {log.fats_g}g</p>
          </div>

          {/* Items */}
          {log.items?.length > 0 && (
            <p className="mt-3 text-xs text-gray-600">
              <strong>Items:</strong> {log.items.join(", ")}
            </p>
          )}

          {/* AI Analysis */}
          {log.analysis?.brief_assessment && (
            <p className="mt-3 text-xs text-gray-700">
              <strong>Assessment:</strong> {log.analysis.brief_assessment}
            </p>
          )}

          {log.analysis?.top_suggestion && (
            <p className="mt-1 text-xs text-gray-700">
              <strong>Suggestion:</strong> {log.analysis.top_suggestion}
            </p>
          )}
        </div>
      ))}
    </div>
  )}
</div>


                            {/* Vital Logs */}
                            {/* <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                    📊 Vital Logs
                                </h3>

                                {logs.vitalLogs.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No vital logs found.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {logs.vitalLogs.map((log: any) => (
                                            <div
                                                key={log._id}
                                                className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm"
                                            >
                                                <p className="text-base font-semibold text-gray-800">
                                                    {log.date} — {log.time}
                                                </p>

                                                <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-700">
                                                    <p><strong>Type:</strong> {log.type}</p>
                                                    <p><strong>Input:</strong> {log.input_type}</p>
                                                </div>

                                                {log.description && (
                                                    <p className="mt-2 text-gray-700 text-sm">
                                                        <strong>Description:</strong> {log.description}
                                                    </p>
                                                )}

                                                <div className="grid grid-cols-2 md:grid-cols-3 mt-3 gap-2 text-sm text-gray-700">
                                                    <p><strong>Calories:</strong> {log.calories_consumed}</p>
                                                    <p><strong>Carbs:</strong> {log.carbs_g}g</p>
                                                    <p><strong>Protein:</strong> {log.protein_g}g</p>
                                                    <p><strong>Fats:</strong> {log.fats_g}g</p>
                                                    <p><strong>Health Score:</strong> {log.health_score}</p>
                                                </div>

                                                {log.items?.length > 0 && (
                                                    <p className="mt-3 text-sm text-gray-700">
                                                        <strong>Items:</strong> {log.items.join(", ")}
                                                    </p>
                                                )}

                                                {log.analysis?.brief_assessment && (
                                                    <p className="mt-3 text-sm text-gray-700">
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
                                )}
                            </div> */}

                        </div>
                    ) : (
                        <p className="text-gray-500">No logs found.</p>
                    )}

                </div>
            </div>
        </div>
    );
};

export default MealLogs;
