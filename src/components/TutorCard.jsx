import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function TutorCard({ tutor }) {
  const {
    $id,
    name = "Unnamed Tutor",
    subject = "Subject not specified",
    standard,
    gender,
    bio,
    experience,
    qualification,
    location = "Location not available",
    fees,
    verified,
    distance,
    latitude,
    longitude,
  } = tutor || {};

  // ✅ Format standard
  const displayStandard =
    typeof standard === "string"
      ? standard.replace(/class\s*/i, "Class ")
      : standard
      ? `Class ${standard}`
      : "N/A";

  // ✅ Format gender
  const displayGender = gender
    ? gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()
    : null;

  // ✅ Format experience
  const displayExperience =
    experience !== undefined && experience !== null
      ? `${experience} experience`
      : null;

  // ✅ Open Google Maps
  const openRoute = () => {
    if (latitude && longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
        "_blank"
      );
    } else {
      alert("No geolocation found for this tutor.");
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 border border-gray-100 flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg text-purple-700 flex items-center gap-2">
            {name}
            {verified && (
              <span className="flex items-center text-blue-600 text-sm font-medium">
                <CheckCircle size={16} className="text-blue-600" />
                <span className="ml-1 hidden sm:inline">Verified</span>
              </span>
            )}
          </h3>
        </div>

        {/* Subject + Class + Gender */}
        <p className="text-sm text-gray-700 mb-1 font-medium">
          {subject} • {displayStandard}
          {displayGender && ` • ${displayGender}`}
        </p>

        {/* Qualification */}
        {qualification && (
          <p className="text-sm text-gray-600 mb-1 italic">
            🎓 {qualification}
          </p>
        )}

        {/* Experience */}
{displayExperience && (
  <p className="text-sm text-gray-600 mb-1">
    🧠 {displayExperience}
  </p>
)}
        {/* Bio */}
{bio && (
  <p className="text-sm text-gray-600 mb-2 leading-snug">
    💬 {bio.length > 100 ? bio.slice(0, 100) + "..." : bio}
  </p>
)}


        {/* Location */}
        <p className="text-sm text-gray-700 mb-1">📍 {location}</p>

        {/* Fees */}
        {fees && (
          <p className="text-sm text-gray-800 font-semibold mb-1">
            💰 ₹{fees}/month
          </p>
        )}

        {/* Distance */}
        {typeof distance === "number" && (
          <p className="text-xs text-gray-500 mb-3">
            {distance.toFixed(1)} km away
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="mt-3 flex justify-center items-center gap-3">
        <Link
          to={`/book/${$id}`}
          className="bg-purple-500 text-white text-center text-md font-medium px-5 py-2 rounded-lg hover:bg-purple-600 transition w-full"
        >
          Book
        </Link>
      </div>
    </div>
  );
}
