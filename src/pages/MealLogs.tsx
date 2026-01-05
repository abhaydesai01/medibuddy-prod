import React, { useEffect, useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { type RootState } from "../store/store";
import { healthLogsAPI, aiAPI } from "../services/api";
import { TrendingUp, Sparkles, CheckCircle, AlertCircle, Loader2, Calendar } from "lucide-react";

interface FoodLog {
    _id: string;
    type: string;
    phone: string;
    date: string;
    time: string;
    meal_type: string;
    input_type: string;
    description: string;
    analysis?: {
        total_calories: number;
        carbs_g: number;
        protein_g: number;
        fats_g: number;
        health_score: number;
        brief_assessment: string;
        top_suggestion: string;
        items: string[];
        success: boolean;
    };
    items: string[];
    calories_consumed: number;
    carbs_g: number;
    protein_g: number;
    fats_g: number;
    health_score: number;
    created_at: string;
}

interface MealTrendAnalysis {
    assessment: string;
    strengths: string[];
    improvements: string[];
    recommendations: string[];
}

interface MealStats {
    totalMeals: number;
    avgCalories: number;
    avgHealthScore: number;
    totalCarbs: number;
    totalProtein: number;
    totalFats: number;
    topItems: string[];
}

const MealLogs: React.FC = () => {
    const { user, isAuthenticated } = useSelector(
        (state: RootState) => state.auth
    );

    const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [trendAnalysis, setTrendAnalysis] = useState<MealTrendAnalysis | null>(null);
    const [stats, setStats] = useState<MealStats | null>(null);

    const patientPhone = localStorage.getItem("patientPhone") ?? "";

    // Group logs by date
    const groupedLogs = useMemo(() => {
        const groups: Record<string, FoodLog[]> = {};
        
        foodLogs.forEach(log => {
            const dateKey = new Date(log.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            
            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(log);
        });

        // Sort dates in descending order (most recent first)
        const sortedKeys = Object.keys(groups).sort((a, b) => 
            new Date(b).getTime() - new Date(a).getTime()
        );

        return sortedKeys.map(date => ({
            date,
            logs: groups[date].sort((a, b) => 
                new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime()
            )
        }));
    }, [foodLogs]);

    // Calculate daily totals for a group
    const getDailyTotals = (logs: FoodLog[]) => {
        return logs.reduce((acc, log) => ({
            calories: acc.calories + (log.calories_consumed || 0),
            carbs: acc.carbs + (log.carbs_g || 0),
            protein: acc.protein + (log.protein_g || 0),
            fats: acc.fats + (log.fats_g || 0),
        }), { calories: 0, carbs: 0, protein: 0, fats: 0 });
    };

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await healthLogsAPI.getLogsByPhone(patientPhone);
                console.log(res.data);
                
                // Filter vitalLogs to get only food type logs
                const foodLogsData = res.data.vitalLogs?.filter(
                    (log: any) => log.type === 'food'
                ) || [];
                
                setFoodLogs(foodLogsData);

                // Automatically analyze trends if there are logs
                if (foodLogsData.length > 0) {
                    analyzeTrends(foodLogsData);
                }

            } catch (err) {
                console.error("Error fetching logs:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [patientPhone]);

    const analyzeTrends = async (logs: FoodLog[]) => {
        if (logs.length === 0) return;

        try {
            setAnalysisLoading(true);
            const response = await aiAPI.analyzeMealTrends(logs);
            setTrendAnalysis(response.data.analysis);
            setStats(response.data.stats);
        } catch (err) {
            console.error("Error analyzing meal trends:", err);
        } finally {
            setAnalysisLoading(false);
        }
    };


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

            {/* AI Trend Analysis Section */}
            {!loading && foodLogs.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50 rounded-2xl border border-purple-200 p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-600 rounded-lg">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">AI Nutrition Insights</h2>
                            <p className="text-sm text-gray-600">Powered by Gemini AI</p>
                        </div>
                    </div>

                    {analysisLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <Loader2 className="h-10 w-10 animate-spin text-purple-600 mx-auto mb-3" />
                                <p className="text-gray-600">Analyzing your meal patterns...</p>
                            </div>
                        </div>
                    ) : trendAnalysis && stats ? (
                        <div className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-xs text-gray-600 mb-1">Total Meals</p>
                                    <p className="text-2xl font-bold text-purple-600">{stats.totalMeals}</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-xs text-gray-600 mb-1">Avg Calories</p>
                                    <p className="text-2xl font-bold text-orange-600">{stats.avgCalories}</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-xs text-gray-600 mb-1">Health Score</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.avgHealthScore}/10</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 shadow-sm">
                                    <p className="text-xs text-gray-600 mb-1">Top Foods</p>
                                    <p className="text-sm font-semibold text-blue-600 truncate">{stats.topItems[0]}</p>
                                </div>
                            </div>

                            {/* Assessment */}
                            <div className="bg-white rounded-xl p-5 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <TrendingUp className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-gray-800 mb-2">Overall Assessment</h3>
                                        <p className="text-gray-700 leading-relaxed">{trendAnalysis.assessment}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Strengths and Improvements */}
                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Strengths */}
                                <div className="bg-white rounded-xl p-5 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <h3 className="font-semibold text-gray-800">Strengths</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {trendAnalysis.strengths.map((strength, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                <span className="text-green-600 mt-0.5">✓</span>
                                                <span>{strength}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Improvements */}
                                <div className="bg-white rounded-xl p-5 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertCircle className="h-5 w-5 text-amber-600" />
                                        <h3 className="font-semibold text-gray-800">Areas to Improve</h3>
                                    </div>
                                    <ul className="space-y-2">
                                        {trendAnalysis.improvements.map((improvement, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                <span className="text-amber-600 mt-0.5">→</span>
                                                <span>{improvement}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Recommendations */}
                            {/* <div className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-xl p-5 shadow-sm text-white">
                                <div className="flex items-center gap-2 mb-3">
                                    <Lightbulb className="h-5 w-5" />
                                    <h3 className="font-semibold">Top Recommendations</h3>
                                </div>
                                <ul className="space-y-2">
                                    {trendAnalysis.recommendations.map((rec, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm">
                                            <span className="font-bold mt-0.5">{idx + 1}.</span>
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div> */}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-600">Unable to generate insights at this time.</p>
                            <button
                                onClick={() => analyzeTrends(foodLogs)}
                                className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                            >
                                Retry Analysis
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Meal History Section Title */}
                    {!loading && foodLogs.length > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded"></div>
                            <h2 className="text-xl font-bold text-gray-800">Your Meal History</h2>
                        </div>
                    )}

                    {loading ? (
                        <div className="p-6 text-center">
                            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-gray-500 mt-2">Loading logs…</p>
                        </div>
                    ) : foodLogs.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <p className="text-gray-500 text-lg">No meal logs found.</p>
                            <p className="text-gray-400 text-sm mt-2">Start logging your meals to see them here!</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {groupedLogs.map(({ date, logs }) => {
                                const dailyTotals = getDailyTotals(logs);
                                return (
                                    <div key={date} className="space-y-4">
                                        {/* Date Header */}
                                        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-4 border border-blue-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-600 rounded-lg">
                                                    <Calendar className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800">{date}</h3>
                                                    <p className="text-xs text-gray-500">{logs.length} meal{logs.length > 1 ? 's' : ''} logged</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 text-sm">
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500">Calories</p>
                                                    <p className="font-bold text-orange-600">{dailyTotals.calories}</p>
                                                </div>
                                                <div className="text-center hidden sm:block">
                                                    <p className="text-xs text-gray-500">Protein</p>
                                                    <p className="font-bold text-green-600">{dailyTotals.protein}g</p>
                                                </div>
                                                <div className="text-center hidden sm:block">
                                                    <p className="text-xs text-gray-500">Carbs</p>
                                                    <p className="font-bold text-blue-600">{dailyTotals.carbs}g</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Meals for this date */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-2">
                                            {logs.map((log) => (
                                                <div
                                                    key={log._id}
                                                    className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 transition-all duration-100 ease-out hover:shadow-lg hover:scale-[1.02]"
                                                >
                                                    {/* Header */}
                                                    <div className="mb-3">
                                                        <p className="font-semibold text-gray-800 capitalize">
                                                            {log.meal_type}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {log.time?.slice(0, 5)}
                                                        </p>
                                                    </div>

                                                    {/* Description */}
                                                    {log.description && (
                                                        <p className="text-sm text-gray-700 mb-3">
                                                            {log.description}
                                                        </p>
                                                    )}

                                                    {/* Nutrition Summary */}
                                                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                                        <div className="bg-orange-50 rounded-lg p-2">
                                                            <p className="text-xs text-gray-600">Calories</p>
                                                            <p className="font-bold text-orange-600">{log.calories_consumed}</p>
                                                        </div>
                                                        <div className="bg-green-50 rounded-lg p-2">
                                                            <p className="text-xs text-gray-600">Health Score</p>
                                                            <p className="font-bold text-green-600">{log.health_score}/10</p>
                                                        </div>
                                                    </div>

                                                    {/* Macros */}
                                                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-700 mb-3">
                                                        <div className="text-center">
                                                            <p className="text-gray-500">Carbs</p>
                                                            <p className="font-semibold">{log.carbs_g}g</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-gray-500">Protein</p>
                                                            <p className="font-semibold">{log.protein_g}g</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-gray-500">Fats</p>
                                                            <p className="font-semibold">{log.fats_g}g</p>
                                                        </div>
                                                    </div>

                                                    {/* Items */}
                                                    {log.items?.length > 0 && (
                                                        <div className="mb-3">
                                                            <p className="text-xs font-semibold text-gray-700 mb-1">Items:</p>
                                                            <div className="flex flex-wrap gap-1">
                                                                {log.items.map((item, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                                                                    >
                                                                        {item}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* AI Analysis */}
                                                    {log.analysis?.brief_assessment && (
                                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                                            <p className="text-xs text-gray-700 mb-2">
                                                                <strong className="text-gray-800">Assessment:</strong>{" "}
                                                                {log.analysis.brief_assessment}
                                                            </p>
                                                            {log.analysis.top_suggestion && (
                                                                <p className="text-xs text-teal-700 bg-teal-50 p-2 rounded">
                                                                    💡 {log.analysis.top_suggestion}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MealLogs;
