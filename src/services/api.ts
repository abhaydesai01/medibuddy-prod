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

interface UpdateProfileData {
  name?: string;
  email?: string;
  age?: string;
  blood_group?: string;
  gender?: "male" | "female" | "other";
  preferences?: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
    };
  };
  reminders_enabled?: boolean;
  daily_tips_enabled?: boolean;
  daily_tips_delivery_time?: string;
}

// Patients API
export const patientsAPI = {
  getMappedPatients: (doctorPhone: string) =>
    api.get(`/patients/mapped/${encodeURIComponent(doctorPhone)}`),
};

// Health Logs API
export const healthLogsAPI = {
  getLogsByPhone: (phone: string) =>
    api.get(`/health-logs/${encodeURIComponent(phone)}`), // returns mealLogs + vitalLogs
};


// Auth API
export const authAPI = {
  register: (userData: {
    name: string;
    email: string;
    password?: string;
    phone: string;
    age?: number;
    gender?: string;
    location?: {
      type: string;
      coordinates: [number, number];
      address: string;
    };
    mpin?: string;
  }) => api.post("/auth/register", userData),

  login: (credentials: { email: string; password: string }) =>
    api.post("/auth/login", credentials),

  // --- NEW: OTP Login Endpoints ---
  sendOtp: (phone: string) => api.post("/auth/send-otp", { phone }),

  sendOtpRegister : (phone: string) => api.post("/auth/send-otp-registration", { phone }),

  verifyOtp: (phone: string, otp: string) =>
    api.post("/auth/verify-otp", { phone, otp }),

  verifyOtpRegister: (phone: string, otp: string) =>
    api.post("/auth/verify-otp-registration", { phone, otp }),

  checkUserExists: (phone: string) =>
    api.get("/auth/profile", { params: { phone } }),

  getPatientByPhone: (phone: string) =>
    api.get(`/auth/patient/${encodeURIComponent(phone)}`),

  // Accept Terms & Conditions
  acceptTnC: (phone: string) => api.post("/auth/accept-tnc", { phone }),
};

// --- MODIFIED: Profile API ---
export const profileAPI = {
  /**
   * Fetches the profile of the currently authenticated user.
   */
  getProfile: () => api.get("/auth/profile"),

  /**
   * Fetches a user's profile by their ID or phone number.
   * @param params - e.g., { id: "some-id" } or { phone: "+91..." }
   */
  getProfileByIdentifier: (params: { id?: string; phone?: string }) =>
    api.get("/auth/profile", { params }),

  /**
   * Updates the profile of the currently authenticated user.
   * @param profileData - An object containing the fields to update.
   */
  updateProfile: (profileData: UpdateProfileData) =>
    api.put("/auth/profile", profileData),
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

  analyzeMealTrends: (foodLogs: any[]) =>
    api.post("/ai/analyze-meal-trends", { foodLogs }),
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
  const phone = localStorage.getItem("patientPhone");

  if (!phone) {
    return Promise.reject(new Error("Patient phone not found"));
  }

  return api.get(
    `/reports/phone/${encodeURIComponent(phone)}`,
    { params }
  );
},


  
  // getReports: (params?: any) => {
  //   const userId = getUserId();
  //   if (!userId) return Promise.reject(new Error("User not logged in"));
  //   return api.get(`/reports/${userId}`, { params });
  // },
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
  // Get phone from localStorage / user details
  const { phone } = getUserDetails();

  if (!phone) {
    return Promise.reject(new Error("User phone number not found."));
  }

  // Phone goes in URL, only pagination/filters in params
  return api.get(
    `/reports/prescriptions/${encodeURIComponent(phone)}`,
    { params }
  );
},


  uploadPrescription: (formData: FormData) => {
    const { id: userId } = getUserDetails(); // Only get the ID for the URL
    if (!userId) return Promise.reject(new Error("User not logged in"));

    // DO NOT add user_phone here again. Just send the formData as is.
    return api.post(`/reports/prescriptions/upload/${userId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deletePrescription: (id: string) => {
    const { phone } = getUserDetails();
    if (!phone) return Promise.reject(new Error("User phone not found"));
    // Send phone in request body to avoid URL encoding issues
    return api.post(`/reports/prescriptions/delete/${id}`, { user_phone: phone });
  },
};

// Doctor APIS

// ... (keep your existing code)

// Create a separate axios instance for doctor APIs
const doctorAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add doctor token to requests
doctorAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("doctorToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Doctor Authentication API
export const doctorAuthAPI = {
  register: (doctorData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    specialization: string;
    licenseNumber: string;
    hospital?: string;
    experience?: number;
  }) => doctorAPI.post("/doctor/auth/register", doctorData),

  login: (credentials: { email: string; password: string }) =>
    doctorAPI.post("/doctor/auth/login", credentials),

  getProfile: () => doctorAPI.get("/doctor/auth/profile"),

  updateProfile: (profileData: {
    name?: string;
    phone?: string;
    specialization?: string;
    hospital?: string;
    experience?: number;
  }) => doctorAPI.put("/doctor/auth/profile", profileData),

  sendOtp: (data: { phone: string }) =>
  doctorAPI.post("/doctor/auth/send-otp", data),

verifyOtp: (data: { phone: string; otp: string }) =>
  doctorAPI.post("/doctor/auth/verify-otp", data),

  // Accept Terms & Conditions
  acceptTnC: (phone: string) => doctorAPI.post("/doctor/auth/accept-tnc", { phone }),
};

// Doctor Availability API
export const doctorAvailabilityAPI = {
  // Set / Update today's availability
  setTodayAvailability: (data: {
    phone: string;
    hospitals: Record<string, string[]>;
  }) =>
    doctorAPI.post("/doctors/availability/today", data),

getTodayAvailability: (phone: string) =>
  doctorAPI.get("/doctors/availability/today", {
    params: { phone },
  }),
};

// Appointments API
export const appointmentAPI = {
  // Get all appointments for a doctor (path param)
  getByDoctorPhone: (doctorPhone: string) =>
    api.get(
      `/doctors/appointments/${encodeURIComponent(doctorPhone)}`
    ),
};

// Doctors API
export const doctorsAPI = {
  // Get doctor by phone number
  getByPhone: (phone: string) =>
    api.get(`/doctors/by-phone/${encodeURIComponent(phone)}`),
};



// Vault API
export const vaultAPI = {
  // Search patients by MPIN
  searchByMpin: (mpin: string, doctorPhone: string) =>
    doctorAPI.post("/doctor/vault/search-by-mpin", { mpin, doctorPhone }),

  // Access records by patient ID (after selection)
  accessByPatient: (patientId: string, doctorPhone: string) =>
    doctorAPI.post("/doctor/vault/access-by-patient", { patientId, doctorPhone }),

  // Update prescription medications
  updatePrescription: (prescriptionId: string, medications: any[]) =>
    doctorAPI.put(`/doctor/vault/prescription/${prescriptionId}`, { medications }),

  // Legacy methods (kept for compatibility)
  accessRecords: (email: string, mpin: string, doctorPhone: string) =>
    doctorAPI.post("/doctor/vault/access", { email, mpin, doctorPhone }),

  filterRecords: (email: string, mpin: string, doctorPhone: string, recordType?: string) =>
    doctorAPI.post("/doctor/vault/access/filter", { email, mpin, doctorPhone, recordType }),

  createMedicalRecord: (data: {
    patientPhone: string;
    patientName: string;
    patientEmail?: string;
    dateOfBirth?: string;
    bloodGroup?: string;
    allergies?: string[];
    chronicConditions?: string[];
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  }) => doctorAPI.post("/doctor/vault/create", data),

  addRecord: (
    email: string,
    mpin: string,
    doctorPhone: string,
    record: {
      type: string;
      title: string;
      description?: string;
      doctorName?: string;
      hospitalName?: string;
      files?: Array<{ url: string; filename: string }>;
      date?: string;
      notes?: string;
    }
  ) => doctorAPI.post("/doctor/vault/add-record", { email, mpin, doctorPhone, record }),
};

// Vault Pin API(patient side)
export const vaultPinAPI = {
  // Check if user has a vault PIN set up
  checkStatus: () => api.get("/vault-pin/status"),

  // Create/Setup a new vault PIN
  setupPin: (pin: string, confirmPin: string) =>
    api.post("/vault-pin/setup", { pin, confirmPin }),

  // Update existing vault PIN
  updatePin: (oldPin: string, newPin: string, confirmNewPin: string) =>
    api.put("/vault-pin/update", { oldPin, newPin, confirmNewPin }),

  // Remove/Disable vault PIN
  removePin: (pin: string) =>
    api.delete("/vault-pin/remove", { data: { pin } }),

  // Verify PIN (for testing)
  verifyPin: (pin: string) => api.post("/vault-pin/verify", { pin }),
};

// // Update the existing vaultAPI to keep using PIN
// export const vaultAPI = {
//   accessRecords: (pin: string) =>
//     doctorAPI.post("/doctor/vault/access", { pin }),

//   filterRecords: (pin: string, recordType?: string) =>
//     doctorAPI.post("/doctor/vault/access/filter", { pin, recordType }),
// };

export default api;
