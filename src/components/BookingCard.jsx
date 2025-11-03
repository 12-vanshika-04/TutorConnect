import React, { useState } from "react";

export default function BookingCard({ booking, role, onAccept, onReject, onComplete }) {
  const [showReasonBox, setShowReasonBox] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // ✅ Safe date parsing + formatting
  let formattedDate = "Invalid Date";
  try {
    const dateTime = new Date(`${booking.date}T${booking.time}`);
    if (!isNaN(dateTime)) {
      formattedDate = dateTime.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    }
  } catch {
    formattedDate = "Invalid Date";
  }

  // ✅ Skip rendering expired bookings (handled at page level too)
  const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
  const isExpired = !isNaN(bookingDateTime) && bookingDateTime < new Date();

  const handleRejectClick = () => {
    if (!showReasonBox) {
      setShowReasonBox(true);
      return;
    }
    if (!rejectReason.trim()) {
      alert("Please enter a reason for rejection.");
      return;
    }
    onReject(booking, rejectReason);
    setShowReasonBox(false);
    setRejectReason("");
  };

  const statusColors = {
    pending: "text-yellow-600 bg-yellow-100",
    accepted: "text-green-600 bg-green-100",
    completed: "text-blue-600 bg-blue-100",
    rejected: "text-red-600 bg-red-100",
    expired: "text-gray-500 bg-gray-100",
  };

  // ⏳ Optional: mark expired ones visually
  const displayStatus = isExpired && booking.status === "pending" ? "expired" : booking.status;

  return (
    <div
      className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition ${
        isExpired ? "opacity-70" : ""
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg text-gray-800">{booking.subject}</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            statusColors[displayStatus] || "bg-gray-100 text-gray-700"
          }`}
        >
          {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-1">
        <strong>Date & Time:</strong> {formattedDate}
      </p>

      {role === "tutor" ? (
        <p className="text-sm text-gray-600 mb-1">
          <strong>Student:</strong> {booking.student_name} ({booking.student_email})
        </p>
      ) : (
        <p className="text-sm text-gray-600 mb-1">
          <strong>Tutor:</strong> {booking.tutor_name} ({booking.tutor_phone})
        </p>
      )}

      {booking.message && (
        <p className="text-sm text-gray-600 mt-2 italic">“{booking.message}”</p>
      )}

      {booking.rejectReason && (
        <p className="text-sm text-red-600 mt-2">
          <strong>Rejection Reason:</strong> {booking.rejectReason}
        </p>
      )}

      {/* 🟢 Tutor Actions */}
      {!isExpired && (
        <div className="mt-4 flex flex-col gap-2">
          {role === "tutor" && booking.status === "pending" && (
            <>
              <button
                onClick={() => onAccept(booking)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
              >
                Accept Booking
              </button>

              {showReasonBox && (
                <div className="animate-fadeIn">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejection"
                    className="border p-2 rounded w-full text-sm focus:ring-2 focus:ring-red-400 outline-none mt-1"
                  />
                </div>
              )}
              <button
                onClick={handleRejectClick}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm"
              >
                {showReasonBox ? "Submit Rejection" : "Reject Booking"}
              </button>
            </>
          )}

          {role === "tutor" && booking.status === "accepted" && (
            <button
              onClick={() => onComplete(booking)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Mark as Completed
            </button>
          )}
        </div>
      )}
    </div>
  );
}
