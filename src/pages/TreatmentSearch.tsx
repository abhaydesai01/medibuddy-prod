import React, { useState, useEffect } from "react";
import { authAPI, doctorsAPI } from "../services/api";
import { User, Phone, Building, Calendar, Loader2, UserCircle, Mail, Clock, X, MapPin } from "lucide-react";

interface MappedDoctor {
  doctor_phone: string;
  clinic: string;
  mapped_at: string;
}

interface Patient {
  name: string;
  phone: string;
  mapped_doctors: MappedDoctor[];
  age?: number;
  blood_group?: string;
  avatar?: string;
  condition?: string;
}

interface DoctorDetails {
  _id: string;
  name: string;
  phone: string;
  specialization: string;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  hospital: {
    name?: string;
    hospital_id?: string;
  };
  experience_years?: number;
  consultation_fee?: number;
  todays_availability?: Map<string, {
    hospitals: Map<string, string[]>;
    slots: string[];
    set_at: Date;
  }>;
}

interface DoctorWithDetails extends MappedDoctor {
  details?: DoctorDetails;
  loading?: boolean;
  error?: string;
}

const TreatmentSearch: React.FC = () => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<DoctorWithDetails[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithDetails | null>(null);
  const [showAvailability, setShowAvailability] = useState(false);

  const patientPhone = localStorage.getItem("patientPhone") || "";

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!patientPhone) {
        setError("Patient phone not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await authAPI.getPatientByPhone(patientPhone);
        setPatient(response.data.patient);
        
        // Initialize doctors array with mapped doctors, filtering out the specific phone number
        const mappedDoctors = response.data.patient.mapped_doctors || [];
        const filteredDoctors = mappedDoctors.filter(
          (doc: MappedDoctor) => doc.doctor_phone !== "+919620417711"
        );
        
        // Initialize doctors with loading state
        const initialDoctors = filteredDoctors.map((doc: MappedDoctor) => ({ 
          ...doc, 
          loading: true 
        }));
        setDoctors(initialDoctors);
        
        // Fetch details for all doctors in parallel
        const doctorDetailsPromises = filteredDoctors.map(async (doc: MappedDoctor, index: number) => {
          try {
            const detailsResponse = await doctorsAPI.getByPhone(doc.doctor_phone);
            return { 
              ...doc, 
              details: detailsResponse.data.doctor, 
              loading: false,
              error: undefined 
            };
          } catch (err) {
            console.error(`Error fetching details for doctor ${doc.doctor_phone}:`, err);
            return { 
              ...doc, 
              loading: false, 
              error: "Failed to load details" 
            };
          }
        });
        
        const doctorsWithDetails = await Promise.all(doctorDetailsPromises);
        setDoctors(doctorsWithDetails);
        
        setError(null);
      } catch (err: any) {
        console.error("Error fetching patient data:", err);
        setError(err.response?.data?.error || "Failed to fetch patient data");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientPhone]);

  const fetchDoctorDetails = async (doctorPhone: string, index: number) => {
    try {
      // Update loading state for this doctor
      setDoctors(prev => prev.map((doc, i) => 
        i === index ? { ...doc, loading: true } : doc
      ));

      const response = await doctorsAPI.getByPhone(doctorPhone);
      const doctorDetails = response.data.doctor;

      // Update doctor with details
      setDoctors(prev => prev.map((doc, i) => 
        i === index ? { ...doc, details: doctorDetails, loading: false, error: undefined } : doc
      ));
    } catch (err: any) {
      console.error("Error fetching doctor details:", err);
      setDoctors(prev => prev.map((doc, i) => 
        i === index ? { ...doc, loading: false, error: "Failed to load doctor details" } : doc
      ));
    }
  };

  const handleDoctorClick = async (doctor: DoctorWithDetails, index: number) => {
    // Details should already be loaded, just show the modal
    setSelectedDoctor(doctor);
    setShowAvailability(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your doctors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <UserCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Your Doctors</h1>
        <p className="mt-1 text-gray-500">
          Doctors mapped to your account
        </p>
      </div>

      {/* Patient Info Card */}
      {patient && (
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl border border-teal-200 p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-2xl">
              {patient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{patient.name}</h2>
              <p className="text-gray-600 flex items-center gap-2">
                <Phone size={16} />
                {patient.phone}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mapped Doctors Section */}
      {doctors.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded"></div>
            <h2 className="text-xl font-bold text-gray-800">
              Mapped Doctors ({doctors.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:border-teal-300 transition-all cursor-pointer"
                onClick={() => handleDoctorClick(doctor, index)}
              >
                {doctor.loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                  </div>
                ) : (
                  <>
                    {/* Doctor Avatar */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                        {doctor.details?.name ? doctor.details.name.charAt(0).toUpperCase() : <User size={24} />}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">
                          {doctor.details?.name || "Doctor"}
                        </h3>
                        <p className="text-sm text-teal-600">
                          {doctor.details?.specialization || "Healthcare Provider"}
                        </p>
                      </div>
                    </div>

                    {/* Doctor Details */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Phone size={18} className="text-teal-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Phone Number</p>
                          <p className="font-semibold text-gray-800">{doctor.doctor_phone}</p>
                        </div>
                      </div>

                      {doctor.details?.contact?.email ? (
                        <div className="flex items-start gap-3">
                          <Mail size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-semibold text-gray-800 text-sm break-all">
                              {doctor.details.contact.email}
                            </p>
                          </div>
                        </div>
                      ) : null}

                      <div className="flex items-start gap-3">
                        <Building size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Clinic/Hospital</p>
                          <p className="font-semibold text-gray-800">
                            {doctor.details?.hospital?.name || doctor.clinic || "Not specified"}
                          </p>
                        </div>
                      </div>

                      {doctor.details?.experience_years ? (
                        <div className="flex items-start gap-3">
                          <Calendar size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500">Experience</p>
                            <p className="font-semibold text-gray-800">
                              {doctor.details.experience_years} years
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium text-sm flex items-center justify-center gap-2">
                        <Clock size={16} />
                        View Availability
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <UserCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No Doctors Mapped
          </h3>
          <p className="text-gray-500">
            You don't have any doctors mapped to your account yet.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Contact your healthcare provider to get mapped.
          </p>
        </div>
      )}

      {/* Availability Modal */}
      {showAvailability && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {selectedDoctor.details?.name?.charAt(0).toUpperCase() || "D"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedDoctor.details?.name || "Doctor"}
                  </h2>
                  <p className="text-sm text-teal-600">
                    {selectedDoctor.details?.specialization || "Healthcare Provider"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAvailability(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Doctor Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Phone size={20} className="text-teal-600" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-semibold text-gray-800">{selectedDoctor.doctor_phone}</p>
                  </div>
                </div>
                {selectedDoctor.details?.contact?.email ? (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail size={20} className="text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-semibold text-gray-800 text-sm break-all">
                        {selectedDoctor.details.contact.email}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Today's Availability */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-teal-600" />
                  Today's Availability
                </h3>

                {selectedDoctor.details?.todays_availability && 
                 Object.keys(selectedDoctor.details.todays_availability).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(selectedDoctor.details.todays_availability).map(([date, availability]: [string, any]) => (
                      <div key={date} className="border border-gray-200 rounded-lg p-4">
                        <p className="font-semibold text-gray-800 mb-3">
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>

                        {/* Hospitals and Slots */}
                        {availability.hospitals && Object.keys(availability.hospitals).length > 0 ? (
                          <div className="space-y-3">
                            {Object.entries(availability.hospitals).map(([hospital, slots]: [string, any]) => (
                              <div key={hospital} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <MapPin size={16} className="text-purple-600" />
                                  <p className="font-semibold text-gray-700">{hospital}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {Array.isArray(slots) && slots.length > 0 ? (
                                    slots.map((slot: string, idx: number) => (
                                      <span
                                        key={idx}
                                        className="px-3 py-1 bg-white border border-teal-200 text-teal-700 rounded-full text-sm font-medium"
                                      >
                                        {slot}
                                      </span>
                                    ))
                                  ) : (
                                    <p className="text-sm text-gray-500">No slots available</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : availability.slots && availability.slots.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {availability.slots.map((slot: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 rounded-full text-sm font-medium"
                              >
                                {slot}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No availability set for this date</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Clock size={48} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No availability set for today</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Please contact the doctor directly to schedule an appointment
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAvailability(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Close
                </button>
                <button className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-medium">
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentSearch;
