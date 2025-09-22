import axios from "axios";

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_APP_BACKEND_BASE_API_URL) {
    return import.meta.env.VITE_APP_BACKEND_BASE_API_URL;
  }

  if (import.meta.env.MODE === "production") {
    return "https://web-production-4fc87.up.railway.app/api";
  }

  return "http://localhost:3000/api";
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Helper function to get the user ID ---
const getUserId = (): string | null => {
  const userString = localStorage.getItem("user");
  if (userString) {
    try {
      const user = JSON.parse(userString);
      return user?.id || null; // Or user?._id depending on your object structure
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
      return null;
    }
  }
  return null;
};

// Auth API
export const authAPI = {
  register: (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    age?: number;
    gender?: string;
    location?: {
      type: string;
      coordinates: [number, number];
      address: string;
    };
  }) => api.post("/auth/register", userData),

  login: (credentials: { email: string; password: string }) =>
    api.post("/auth/login", credentials),

  // --- NEW: OTP Login Endpoints ---
  sendOtp: (phone: string) => api.post("/auth/send-otp", { phone }),

  verifyOtp: (phone: string, otp: string) =>
    api.post("/auth/verify-otp", { phone, otp }),
};

// AI API
export const aiAPI = {
  analyzeSymptoms: (
    symptoms: string[],
    additionalInfo?: string,
    userLocation?: any
  ) =>
    api.post("/ai/analyze-symptoms-simple", {
      symptoms,
      additionalInfo,
      userLocation,
    }),

  getDiseaseDetails: (
    diseaseName: string,
    userSymptoms?: string[],
    userLocation?: any
  ) =>
    api.post("/ai/disease-details", {
      diseaseName,
      userSymptoms,
      userLocation,
    }),

  getUserLocation: () => api.get("/ai/user-location"),

  recommendTreatments: (condition: string, location?: string) =>
    api.post("/ai/recommend-treatments", { condition, location }),

  findHospitals: (treatmentType: string, location: string, radius?: number) =>
    api.post("/ai/find-hospitals", { treatmentType, location, radius }),

  analyzeReport: (reportText: string, reportType?: string) =>
    api.post("/ai/analyze-report", { reportText, reportType }),

  sendChatMessage: (message: string, userLocation?: any) =>
    api.post("/ai/chatbot", { message, userLocation }),
};

// Treatments API
export const treatmentsAPI = {
  search: (params: {
    query?: string;
    category?: string;
    priceRange?: { min: number; max: number };
    location?: string;
    page?: number;
    limit?: number;
  }) => api.get("/treatments/search", { params }),

  getById: (id: string) => api.get(`/treatments/${id}`),

  getCategories: () => api.get("/treatments/categories"),
};

// Hospitals API
export const hospitalsAPI = {
  search: (params: {
    location?: string;
    specialization?: string;
    rating?: number;
    radius?: number;
    page?: number;
    limit?: number;
  }) => api.get("/hospitals/search", { params }),

  getById: (id: string) => api.get(`/hospitals/${id}`),

  getNearby: (coordinates: [number, number], radius: number = 10) =>
    api.get("/hospitals/nearby", {
      params: {
        longitude: coordinates[0],
        latitude: coordinates[1],
        radius,
      },
    }),
};

// Location API
export const locationAPI = {
  getCurrentLocation: () => api.get("/location/current"),

  geocode: (address: string) => api.post("/location/geocode", { address }),

  reverseGeocode: (lat: number, lng: number) =>
    api.post("/location/reverse-geocode", { lat, lng }),

  searchPlaces: (query: string, limit?: number) =>
    api.get("/location/search", { params: { query, limit } }),

  getNearbyHospitals: (
    lat: number,
    lng: number,
    radius?: number,
    specialty?: string,
    limit?: number
  ) =>
    api.get("/location/nearby-hospitals", {
      params: { lat, lng, radius, specialty, limit },
    }),

  getNearbyDoctors: (
    lat: number,
    lng: number,
    radius?: number,
    specialization?: string,
    limit?: number
  ) =>
    api.get("/location/nearby-doctors", {
      params: { lat, lng, radius, specialization, limit },
    }),

  getNearbyHealthcare: (
    lat: number,
    lng: number,
    radius?: number,
    specialty?: string,
    specialization?: string,
    hospitalLimit?: number,
    doctorLimit?: number
  ) =>
    api.get("/location/nearby-healthcare", {
      params: {
        lat,
        lng,
        radius,
        specialty,
        specialization,
        hospitalLimit,
        doctorLimit,
      },
    }),

  getUserLocation: () => api.get("/location/user"),

  updateUserLocation: (location: {
    type: string;
    coordinates: [number, number];
    address: string;
  }) => api.put("/location/user", { location }),
};

// Hospital API
export const hospitalAPI = {
  getHospitalDetails: (hospitalId: string) =>
    api.get(`/hospitals/${hospitalId}`),
  getDoctorDetails: (doctorId: string) =>
    api.get(`/hospitals/doctor/${doctorId}`),
};

// Report API
export const reportAPI = {
  uploadReport: (formData: FormData) => {
    const userId = getUserId();
    if (!userId) return Promise.reject(new Error("User not logged in"));
    return api.post(`/reports/upload/${userId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getReports: (params?: any) => {
    const userId = getUserId();
    if (!userId) return Promise.reject(new Error("User not logged in"));
    return api.get(`/reports/${userId}`, { params });
  },
  getReport: (id: string) => {
    const userId = getUserId();
    if (!userId) return Promise.reject(new Error("User not logged in"));
    return api.get(`/reports/${userId}/${id}`);
  },
  updateReport: (id: string, data: any) => {
    const userId = getUserId();
    if (!userId) return Promise.reject(new Error("User not logged in"));
    return api.put(`/reports/${userId}/${id}`, data);
  },
  deleteReport: (id: string) => {
    const userId = getUserId();
    if (!userId) return Promise.reject(new Error("User not logged in"));
    return api.delete(`/reports/${userId}/${id}`);
  },
  reprocessReport: (id: string) => {
    const userId = getUserId();
    if (!userId) return Promise.reject(new Error("User not logged in"));
    return api.post(`/reports/${userId}/${id}/reprocess`);
  },
  getAnalytics: () => {
    const userId = getUserId();
    if (!userId) return Promise.reject(new Error("User not logged in"));
    return api.get(`/reports/${userId}/analytics/dashboard`);
  },
};

// --- NEW: Prescription API ---
export const prescriptionAPI = {
  getPrescriptions: (params?: any) => {
    const userId = getUserId();
    if (!userId) return Promise.reject(new Error("User not logged in"));
    // The backend route is /prescriptions/:uid, so we pass userId
    return api.get(`/reports/prescriptions/${userId}`, { params });
  },
  uploadPrescription: (formData: FormData) => {
    const userId = getUserId();
    if (!userId) return Promise.reject(new Error("User not logged in"));
    // Assuming an upload endpoint similar to reports for consistency
    return api.post(`/reports/prescriptions/upload/${userId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deletePrescription: (id: string) => {
    const userId = getUserId();
    if (!userId) return Promise.reject(new Error("User not logged in"));
    // Assuming a delete endpoint similar to reports
    return api.delete(`/reports/prescriptions/${userId}/${id}`);
  },
};

export default api;
