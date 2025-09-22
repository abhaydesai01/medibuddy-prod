import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../navigation/Sidebar";
import Navbar from "../Navbar";

const SharedLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar (as an overlay) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          {/* Sidebar */}
          <div className="relative h-full w-64 bg-white">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Desktop Sidebar (fixed and part of the layout) */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* The actual page content, which will be scrollable */}
        <main className="overflow-hidden overflow-y-auto p-4 md:p-2 mt-15">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SharedLayout;
