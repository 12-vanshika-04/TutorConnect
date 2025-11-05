import React, { useState } from "react";
import ButtonLoader from "./ButtonLoader";

export default function BookingCard({ booking, role, onAccept, onReject, onComplete }) {
  const [loadingAction, setLoadingAction] = useState(null); // "accept" | "reject" | "complete"

  // Format date & time
  let formattedDate = "Not Scheduled";
  try {
    const dateTime = new Date(`${booking.date}T${booking.time}`);
    if (!isNaN(dateTime)) {
      formattedDate = dateTime.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    }
  } catch {}

  // Check for expired bookings
  const bookingDateTime = new Date(`${booking.date}T${booking.time}`);
  const isExpired = !isNaN(bookingDateTime) && bookingDateTime < new Date();

  const handleAcceptClick = async () => {
    if (!onAccept) return;
    try {
      setLoadingAction("accept");
      await onAccept(booking);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRejectClick = async () => {
    if (!onReject) return;
    try {
      setLoadingAction("reject");
      await onReject(booking);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCompleteClick = async () => {
    if (!onComplete) return;
    try {
      setLoadingAction("complete");
      await onComplete(booking);
    } finally {
      setLoadingAction(null);
    }
  };

  // Status colors
  const statusColors = {
    pending: "text-yellow-600 bg-yellow-100",
    accepted: "text-green-600 bg-green-100",
    completed: "text-blue-600 bg-blue-100",
    rejected: "text-red-600 bg-red-100",
    expired: "text-gray-500 bg-gray-100",
  };

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
      {role === "tutor" && (
  <p className="text-sm text-gray-600 mb-1">
    <strong>Student:</strong> {booking.student_name} <br />
    <strong>Email:</strong> <span className="text-gray-500">{booking.student_email}</span>
  </p>
)}

{role === "student" && (
  <p className="text-sm text-gray-600 mb-1">
    <strong>Tutor:</strong> {booking.tutor_name} <br />
    <strong>Email:</strong> <span className="text-gray-500">{booking.tutor_email || booking.tutor_phone}</span>
  </p>
)}

      {booking.message && (
        <p className="text-sm text-gray-600 mt-2 italic">“{booking.message}”</p>
      )}

      {booking.rejectReason && (
        <p className="text-sm text-red-400 mt-2">
          <strong>Rejection Reason:</strong> {booking.rejectReason}
        </p>
      )}

      {/* Actions row */}
      {!isExpired && (
        <div className="mt-4 flex gap-2 flex-wrap">
          {role === "tutor" && booking.status === "pending" && (
            <>
              <button
                onClick={handleAcceptClick}
                disabled={loadingAction === "accept"}
                className="flex-1 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition text-sm flex justify-center items-center gap-2"
              >
                {loadingAction === "accept" ? <><ButtonLoader size={16} color="white" /> Accepting...</> : "Accept"}
              </button>
              <button
                onClick={handleRejectClick}
                disabled={loadingAction === "reject"}
                className="flex-1 bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition text-sm flex justify-center items-center gap-2"
              >
                {loadingAction === "reject" ? <><ButtonLoader size={16} color="white" /> Rejecting...</> : "Reject"}
              </button>
            </>
          )}

          {role === "tutor" && booking.status === "accepted" && onComplete && (
            <button
              onClick={handleCompleteClick}
              disabled={loadingAction === "complete"}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm flex justify-center items-center gap-2"
            >
              {loadingAction === "complete" ? <><ButtonLoader size={16} color="white" /> Completing...</> : "Mark as Completed"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
