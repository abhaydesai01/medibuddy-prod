import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Lock,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Stethoscope,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { doctorLogout } from "../../store/slices/doctorAuthSlice";
import { useNavigate } from "react-router-dom";
import { type RootState } from "../../store/store";
import Logo from "../../assets/logo.png";

const DoctorSidebar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { doctor } = useSelector((state: RootState) => state.doctorAuth);

  const handleLogout = () => {
    dispatch(doctorLogout());
    navigate("/doctor/login");
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/doctor/dashboard",
    },
    {
      name: "Vault",
      icon: <Lock size={20} />,
      path: "/doctor/vault",
      badge: "PIN",
    },
    {
      name: "Patients",
      icon: <Users size={20} />,
      path: "/doctor/patients",
    },
    {
      name: "Appointments",
      icon: <Calendar size={20} />,
      path: "/doctor/appointments",
    },

  ];

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
      {/* Logo Section */}
      <div className="flex items-center gap-3 p-6 border-b border-gray-200">
        <img src={Logo} alt="MediiMate Logo" className="h-8 w-8" />
        <div>
          <h1 className="text-xl font-bold text-gray-800">MediiMate</h1>
          <p className="text-xs text-teal-600 font-medium">Doctor Portal</p>
        </div>
      </div>

      {/* Doctor Info */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="flex items-center gap-3">
          <div className="bg-teal-600 text-white h-10 w-10 rounded-full flex items-center justify-center font-bold">
            {doctor?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">
              Dr. {doctor?.name}
            </p>
            <p className="text-xs text-gray-600 truncate">
              {doctor?.specialization}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-teal-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
            {item.badge && (
              <span className="ml-auto bg-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        <NavLink
          to="/doctor/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive
                ? "bg-teal-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`
          }
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default DoctorSidebar;
