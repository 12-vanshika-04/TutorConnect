// src/pages/FindTutors.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { fetchTutors } from "../features/tutors/tutorSlice";
import TutorCard from "../components/TutorCard";

export default function FindTutors() {
  
  const dispatch = useDispatch();
  const tutors = useSelector((s) => s.tutors.list);
  const loading = useSelector((s) => s.tutors.loading);
  const { search } = useLocation();

  // ✅ get ?query= from URL (from Home page)
  const queryParams = new URLSearchParams(search);
  const searchQuery = queryParams.get("query")?.trim().toLowerCase() || "";
  // useEffect(() => {
  //   const params = new URLSearchParams(location.search);
  //   const category = params.get("category");
  //   if (category) {
  //     setFilters((prev) => ({ ...prev, subject: category }));
  //     dispatch(fetchTutors({ subject: category, verified: true }));
  //   } else {
  //     dispatch(fetchTutors({ verified: true }));
  //   }
  // }, [location, dispatch]);

  const [filters, setFilters] = useState({
    subject: "",
    standard: "",
    location: "",
    minFees: "",
    maxFees: "",
    gender: "",
    experience: "",
  });

  const [myLocation, setMyLocation] = useState(null);

  useEffect(() => {
    dispatch(fetchTutors({ verified: true }));
  }, [dispatch]);

  const applyFilters = () => {
    dispatch(fetchTutors({ verified: true }));
  };

  const findNearMe = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition((p) =>
      setMyLocation({
        latitude: p.coords.latitude,
        longitude: p.coords.longitude,
      })
    );
  };

  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lat2) return null;
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // ✅ Filter tutors based on both user filters + search query
  const filtered = tutors.filter((t) => {
    if (!t.verified) return false;

    // ✅ Global Search (from homepage)
    if (searchQuery) {
      const combinedFields = `${t.subject || ""} ${t.location || ""} ${t.standard || ""}`.toLowerCase();
      if (!combinedFields.includes(searchQuery)) return false;
    }

    // ✅ Subject Filter
    if (
      filters.subject &&
      (!t.subject ||
        !t.subject.toLowerCase().includes(filters.subject.toLowerCase()))
    )
      return false;

    // ✅ Improved Standard Filter (supports 6, Class 10, 6-8, Class 6 to 8, etc.)
    if (filters.standard && t.standard) {
      const input = filters.standard.trim().toLowerCase();
      const tutorStandard = String(t.standard).trim().toLowerCase();

      const inputNums = input.match(/\d+/g)?.map(Number) || [];
      const tutorNums = tutorStandard.match(/\d+/g)?.map(Number) || [];

      if (inputNums.length === 2) {
        const [min, max] = inputNums;
        if (tutorNums.length === 1 && (tutorNums[0] < min || tutorNums[0] > max))
          return false;
        if (tutorNums.length === 2 && (tutorNums[1] < min || tutorNums[0] > max))
          return false;
      } else if (inputNums.length === 1) {
        const inputNum = inputNums[0];
        if (
          tutorNums.length === 1
            ? tutorNums[0] !== inputNum
            : tutorNums[0] > inputNum || tutorNums[1] < inputNum
        ) {
          return false;
        }
      } else {
        if (!tutorStandard.includes(input)) return false;
      }
    }

    // ✅ Location Filter
    if (
      filters.location &&
      (!t.location ||
        !t.location.toLowerCase().includes(filters.location.toLowerCase()))
    )
      return false;

    // ✅ Fees Filters
    if (filters.minFees && Number(t.fees) < Number(filters.minFees)) return false;
    if (filters.maxFees && Number(t.fees) > Number(filters.maxFees)) return false;

    // ✅ Gender Filter
    if (
      filters.gender &&
      (!t.gender || t.gender.toLowerCase() !== filters.gender.toLowerCase())
    )
      return false;

    // ✅ Experience Filter
    if (filters.experience && Number(t.experience) < Number(filters.experience))
      return false;

    return true;
  });

  // ✅ Sort by distance (if user location available)
  const sorted = myLocation
    ? filtered
        .map((t) => ({
          ...t,
          distance: getDistanceKm(
            myLocation.latitude,
            myLocation.longitude,
            t.latitude,
            t.longitude
          ),
        }))
        .sort((a, b) => (a.distance || 99999) - (b.distance || 99999))
    : filtered;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-purple-700">
        Find Verified Tutors
      </h2>

      {/* Filter Inputs */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
        <input
          placeholder="Subjects/Hobbies(like singing, dancing...)"
          value={filters.subject}
          onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Standard (e.g. Class 10 or 6-8)"
          value={filters.standard}
          onChange={(e) => setFilters({ ...filters, standard: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="border p-2 rounded"
        />

        <input
          placeholder="Maximum Fees"
          value={filters.maxFees}
          onChange={(e) => setFilters({ ...filters, maxFees: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Gender (Male/Female)"
          value={filters.gender}
          onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
          className="border p-2 rounded"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={applyFilters}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          Apply Filters
        </button>
      </div>

      {/* Tutors List */}
      {loading ? (
        <p>Loading tutors...</p>
      ) : sorted.length === 0 ? (
        <p>No verified tutors found matching your criteria.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {sorted.map((t) => (
            <TutorCard key={t.$id} tutor={t} />
          ))}
        </div>
      )}
    </div>
  );
}
