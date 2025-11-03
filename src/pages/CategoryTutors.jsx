// src/pages/CategoryTutors.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTutors } from "../features/tutors/tutorSlice";
import TutorCard from "../components/TutorCard";

export default function CategoryTutors() {
  const { category } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const tutors = useSelector((state) => state.tutors.list);
  const loading = useSelector((state) => state.tutors.loading);

  const [filters, setFilters] = useState({
    standard: "",
    location: "",
    minFees: "",
    maxFees: "",
    gender: "",
    experience: "",
  });

  useEffect(() => {
    // Fetch tutors filtered by category (subject)
    dispatch(fetchTutors({ verified: true, subject: category }));
  }, [dispatch, category]);

  // Local filtering for other inputs
  const filteredTutors = tutors.filter((t) => {
    if (!t.verified) return false;

    if (filters.standard && t.standard) {
      const input = filters.standard.trim().toLowerCase();
      const tutorStandard = String(t.standard).trim().toLowerCase();
      if (!tutorStandard.includes(input)) return false;
    }

    if (
      filters.location &&
      (!t.location ||
        !t.location.toLowerCase().includes(filters.location.toLowerCase()))
    )
      return false;

    if (filters.minFees && Number(t.fees) < Number(filters.minFees)) return false;
    if (filters.maxFees && Number(t.fees) > Number(filters.maxFees)) return false;

    if (
      filters.gender &&
      (!t.gender || t.gender.toLowerCase() !== filters.gender.toLowerCase())
    )
      return false;

    if (filters.experience && Number(t.experience) < Number(filters.experience))
      return false;

    return true;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-semibold text-purple-700">
          {category} Tutors
        </h2>
        <button
          onClick={() => navigate("/find-tutors")}
          className="text-sm text-gray-600 hover:text-purple-600 underline"
        >
          Back to All Tutors
        </button>
      </div>

      {/* Filters */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
        <input
          placeholder="Standard (e.g. 6-8)"
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
          placeholder="Min Fees"
          value={filters.minFees}
          onChange={(e) => setFilters({ ...filters, minFees: e.target.value })}
          className="border p-2 rounded"
        />
        <input
          placeholder="Max Fees"
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
        <input
          placeholder="Min Experience (years)"
          value={filters.experience}
          onChange={(e) =>
            setFilters({ ...filters, experience: e.target.value })
          }
          className="border p-2 rounded"
        />
      </div>

      {/* Tutor List */}
      {loading ? (
        <p>Loading tutors...</p>
      ) : filteredTutors.length === 0 ? (
        <p>No tutors found for this category.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {filteredTutors.map((t) => (
            <TutorCard key={t.$id} tutor={t} />
          ))}
        </div>
      )}
    </div>
  );
}
