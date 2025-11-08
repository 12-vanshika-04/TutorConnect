// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import img1 from "../assets/class.jpg";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { checkGoogleUser } from "../features/auth/authSlice";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, role } = useSelector((state) => state.auth);

  // Fetch current user on page load
  useEffect(() => {
    dispatch(checkGoogleUser());
  }, [dispatch]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return alert("Please enter a subject or location");
    navigate(`/find-tutors?query=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section
        className="relative flex flex-col md:flex-row items-center justify-between px-8 md:px-20 py-20 text-white"
        style={{
          backgroundImage: `url(${img1})`,
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>

        <div className="relative z-10 md:w-1/2">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
            <span className="text-purple-400">Tutor</span>Connect
          </h1>
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Find Trusted Tutors Near You
          </h2>
          <p className="text-lg mb-6 max-w-lg text-gray-100">
            Discover verified tutors in your area for academics, languages, and hobbies — 
            all verified. Learn and grow confidently with TutorConnect.
          </p>

          {/* Search Bar */}
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Search by subject or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-3 rounded-lg text-gray-800 w-72 md:w-96 focus:outline-none shadow-md"
            />
            <button
              onClick={handleSearch}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition w-36 text-center"
            >
              Search
            </button>
          </div>

          {/* Welcome message */}
          {role && user && (
            <p className="mt-4 text-lg text-gray-200">
              {role === "student"
                ? "You are logged in as a Student."
                : "You are logged in as a Tutor."}
            </p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-8 md:px-20 py-16">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
          Why Choose TutorConnect?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <img
              src="https://cdn-icons-png.flaticon.com/512/992/992651.png"
              alt="verified"
              className="w-16 mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-center text-purple-700 mb-2">
              Verified Tutors
            </h3>
            <p className="text-center text-gray-600">
              Each tutor’s identity and documents are verified.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2995/2995464.png"
              alt="location"
              className="w-16 mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-center text-purple-700 mb-2">
              Local & Home Tutors
            </h3>
            <p className="text-center text-gray-600">
              Find tutors near your home or within your locality.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3468/3468377.png"
              alt="subjects"
              className="w-16 mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-center text-purple-700 mb-2">
              Wide Range of Subjects
            </h3>
            <p className="text-center text-gray-600">
              From academics to hobbies — find tutors for math, dance, coding, art, and more!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
