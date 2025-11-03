import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { databases } from "../utils/appwrite";
import { Query } from "appwrite";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        if (!user?.$id) return;

        const res = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_USERS_TABLE_ID,
          [Query.equal("userId", user.$id)]
        );

        if (res.documents.length > 0) {
          setRole(res.documents[0].role);
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
      }
    };

    fetchUserRole();
  }, [user]);

  const handleLogout = async () => {
    await dispatch(logout());
    setRole(null); // 👈 Clear role on logout
    navigate("/");
  };
  

  return (
    <nav className="bg-white shadow-md flex justify-between items-center px-8 py-4">
      <div className="flex items-center gap-5">
      {/* Logo */}
      <h1
        className="text-2xl font-bold text-purple-600 cursor-pointer"
        onClick={() => navigate("/")}
      >
        TutorConnect
      </h1>

      {/* Left-side Action Buttons */}
      
        {/* Tutor: show Register as Tutor */}
        {role === "tutor" && (
          <Link
            to="/register-tutor"
            className="bg-purple-600 hover:bg-purple-400 text-white font-bold px-4 py-2 rounded-lg transition"
          >
            Register as Tutor
          </Link>
        )}

        {/* Student & Admin: show Find Tutors */}
        {(role === "student" || role === "admin") && (
          <Link
            to="/find-tutors"
            className="bg-purple-600 hover:bg-purple-400 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            Find Tutors
          </Link>
        )}
      </div>

      {/* Right-side Navigation */}
      <div className="flex items-center space-x-5">
        <Link to="/" className="hover:text-purple-600 font-medium">
          Home
        </Link>
        <Link to="/about" className="hover:text-purple-600 font-medium">
          About
        </Link>

        {/* ---- Role-based Dashboards ---- */}
        {role === "student" && (
          <Link
            to="/student-dashboard"
            className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
          >
            Student Dashboard
          </Link>
        )}

        {role === "tutor" && (
          <Link
            to="/tutor-dashboard"
            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
          >
            Tutor Dashboard
          </Link>
        )}

        {role === "admin" && (
          <>
            <Link
              to="/tutor-dashboard"
              className="bg-blue-100 text-blue-800 px-3 py-2 rounded hover:bg-blue-200"
            >
              Tutor Dashboard
            </Link>
            <Link
              to="/student-dashboard"
              className="bg-green-100 text-green-800 px-3 py-2 rounded hover:bg-green-200"
            >
              Student Dashboard
            </Link>
            <Link
              to="/register-tutor"
              className="bg-purple-100 text-purple-700 px-3 py-2 rounded hover:bg-purple-200"
            >
              Register as Tutor
            </Link>
            <Link
              to="/find-tutors"
              className="bg-green-100 text-green-700 px-3 py-2 rounded hover:bg-green-200"
            >
              Find Tutors
            </Link>
            <Link
              to="/admin-verify"
              className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600"
            >
              Admin Panel
            </Link>
          </>
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
