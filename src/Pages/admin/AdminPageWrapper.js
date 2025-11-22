import React, { useEffect } from "react";
import { useAuthContext } from '../../context/AuthContext';
import { useNavigate } from "react-router-dom";
import LogoutButton from '../../Component/adminComp/LogoutButton';
import NewDashboard from "./NewDashboard"; // your current AdminPage component code without auth logic

const AdminPageWrapper = () => {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/dashboardlogin");
    }
  }, [user, loading, navigate]);

  if (!user) return null;

  return (
    <div className="admin-wrapper-with-auth">
      {/* You can optionally show a top header with logout */}
      <header className="admin-header flex justify-between items-center p-4 bg-[#55aa24] text-white">
        <h1>Admin Panel</h1>
        <LogoutButton />
      </header>

      {/* Render the actual admin content */}
      <NewDashboard />
    </div>
  );
};

export default AdminPageWrapper;
