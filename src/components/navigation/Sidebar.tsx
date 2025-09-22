import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import {
  LayoutDashboard,
  HeartPulse,
  Stethoscope,
  Building,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Heart,
  ClipboardPlus, // 1. Import a suitable icon
} from "lucide-react";

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const navItems = [
    {
      to: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
    },
    {
      to: "/symptom-checker",
      icon: <HeartPulse size={20} />,
      label: "Symptom Checker",
    },
    { to: "/treatments", icon: <Stethoscope size={20} />, label: "Treatments" },
    { to: "/hospitals", icon: <Building size={20} />, label: "Hospitals" },
    {
      to: "/report-analysis",
      icon: <FileText size={20} />,
      label: "Report Analysis",
    },
    // 2. Add the new "Prescriptions" item to the array
    {
      to: "/prescriptions",
      icon: <ClipboardPlus size={20} />,
      label: "Prescriptions",
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside
      className={`relative h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-5 right-0 translate-x-1/2 bg-white border border-gray-300 rounded-full p-1.5 z-10 hidden lg:block hover:bg-gray-50 transition-all"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div
        className={`h-16 flex items-center border-b border-gray-200 ${
          isCollapsed ? "justify-center" : "px-6"
        }`}
      >
        <div className="flex items-center gap-2">
          <Heart
            className={`h-8 w-8 text-blue-600 transition-all ${
              isCollapsed ? "" : "mr-2"
            }`}
          />
          {!isCollapsed && (
            <span className="text-xl font-bold text-gray-800">MediiMate</span>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center p-2 rounded-md transition-colors ${
                isActive
                  ? "bg-blue-800 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              } ${isCollapsed ? "justify-center" : ""}`
            }
            title={isCollapsed ? item.label : undefined}
          >
            {item.icon}
            {!isCollapsed && (
              <span className="ml-4 text-sm font-medium">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`flex items-center p-2 text-sm mt-3 rounded-md hover:cursor-pointer transition-colors w-full text-gray-500 hover:bg-red-50 hover:text-red-600 ${
            isCollapsed ? "justify-center" : ""
          }`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut size={18} />
          {!isCollapsed && <span className="ml-4 font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
