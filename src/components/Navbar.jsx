// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout, updateRole } from "../features/auth/authSlice";

export default function Navbar() {
  const { user, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentRole, setCurrentRole] = useState(role || "");

  useEffect(() => {
    setCurrentRole(role);
  }, [role]);

  /* ------------------ Role Change ------------------ */
  const handleRoleChange = async (newRole) => {
    setCurrentRole(newRole);
    if (!user) return;

    try {
      // Update role in Appwrite DB via Redux thunk
      await dispatch(updateRole({ userId: user.$id, role: newRole })).unwrap();
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  /* ------------------ Logout ------------------ */
  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md flex justify-between items-center px-8 py-4">
      {/* Left side */}
      <div className="flex items-center gap-5">
        <h1
          className="text-2xl font-bold text-purple-600 cursor-pointer"
          onClick={() => navigate("/")}
        >
          TutorConnect
        </h1>

        {/* Role-based action */}
        {currentRole === "tutor" && (
          <Link
            to="/register-tutor"
            className="bg-purple-600 hover:bg-purple-400 text-white font-bold px-4 py-2 rounded-lg transition"
          >
            Register as Tutor
          </Link>
        )}
        {(currentRole === "student" || currentRole === "admin") && (
          <Link
            to="/find-tutors"
            className="bg-purple-600 hover:bg-purple-400 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            Find Tutors
          </Link>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-5">
        <Link to="/" className="hover:text-purple-600 font-medium">
          Home
        </Link>
        <Link to="/about" className="hover:text-purple-600 font-medium">
          About
        </Link>

        {/* Role Dropdown */}
        {user && (
          <select
            value={currentRole}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="border px-2 py-1 rounded text-gray-800"
          >
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
          </select>
        )}

        {/* Dashboard Links */}
        {currentRole === "student" && user && (
          <Link
            to="/student-dashboard"
            className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
          >
            Student Dashboard
          </Link>
        )}
        {currentRole === "tutor" && user && (
          <Link
            to="/tutor-dashboard"
            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
          >
            Tutor Dashboard
          </Link>
        )}
        {currentRole === "admin" && user && (
          <Link
            to="/admin-verify"
            className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600"
          >
            Admin Panel
          </Link>
        )}

        {/* Auth buttons */}
        {!user ? (
          <>
            <Link
              to="/login"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-purple-200 text-purple-800 px-4 py-2 rounded-lg hover:bg-purple-300 transition"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <span className="font-semibold text-purple-600">
              Hi, {user.name || "User"}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
