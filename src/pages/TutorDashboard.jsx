// src/pages/TutorDashboard.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookingsByUser, updateBookingStatus } from "../features/bookings/bookingSlice";
import { account, databases } from "../utils/appwrite";
import { Query } from "appwrite";

const DB = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TUTORS_COLLECTION = import.meta.env.VITE_APPWRITE_TUTORS_TABLE_ID;
const USERS_COLLECTION = import.meta.env.VITE_APPWRITE_USERS_TABLE_ID;

export default function TutorDashboard() {
  const dispatch = useDispatch();
  const { list: bookings, loading, error } = useSelector((s) => s.bookings);

  const [user, setUser] = useState(null);
  const [tutorDoc, setTutorDoc] = useState(null);

  // ✅ Get logged-in tutor
  useEffect(() => {
    (async () => {
      try {
        const current = await account.get();
        setUser(current);
      } catch (err) {
        console.error("Error fetching Appwrite user:", err);
      }
    })();
  }, []);

  // ✅ Fetch tutor document + bookings
  useEffect(() => {
    const fetchTutorData = async () => {
      if (!user?.email) return;
      try {
        const tutorRes = await databases.listDocuments(DB, TUTORS_COLLECTION, [
          Query.equal("email", user.email),
        ]);
        const userRes = await databases.listDocuments(DB, USERS_COLLECTION, [
          Query.equal("email", user.email),
        ]);

        const isTutor =
          userRes.documents.length > 0 &&
          userRes.documents[0].role === "tutor";

        if (isTutor && tutorRes.documents.length > 0) {
          const tutorRecord = tutorRes.documents[0];
          setTutorDoc(tutorRecord);
          dispatch(fetchBookingsByUser({ userId: tutorRecord.$id, role: "tutor" }));
        }
      } catch (err) {
        console.error("Error fetching tutor record:", err);
      }
    };
    fetchTutorData();
  }, [user, dispatch]);

  // ✅ Date formatting helper
  const formatDateTime = (d, t) => {
    const dt = new Date(`${d}T${t}`);
    return dt.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  };

// ✅ Categorize bookings properly
const now = new Date();

const processedBookings = bookings.map((b) => {
  const bookingTime = new Date(`${b.date}T${b.time}`);
  let isExpired = false;

  // 🟥 Always expired if rejected
  if (b.status === "rejected") {
    isExpired = true;
  }

  // ⏰ If booking date/time has passed
  else if (bookingTime < now) {
    // Mark as expired (but don't overwrite status)
    isExpired = true;
  }

  return { ...b, isExpired };
});

// ✅ Group by category
const pending = processedBookings.filter(
  (b) => b.status === "pending" && !b.isExpired
);

const accepted = processedBookings.filter(
  (b) => b.status === "accepted" && !b.isExpired
);

const rejected = processedBookings.filter((b) => b.status === "rejected");

// 🕓 Expired Bookings (accepted, pending, or completed — all after date)
const expired = processedBookings.filter(
  (b) =>
    b.isExpired &&
    (b.status === "accepted" ||
      b.status === "pending" ||
      b.status === "completed")
);




  

  const handleUpdate = async (bookingId, data) => {
    try {
      await dispatch(updateBookingStatus({ bookingId, ...data })).unwrap();
      dispatch(fetchBookingsByUser({ userId: tutorDoc.$id, role: "tutor" }));
    } catch (err) {
      console.error("Failed to update booking:", err);
      alert("Failed to update booking.");
    }
  };

  const handleAccept = (b) => handleUpdate(b.$id, { status: "accepted" });
  const handleReject = (b) => {
    const reason = prompt("Reason for rejection:");
    if (reason) handleUpdate(b.$id, { status: "rejected", rejectReason: reason });
  };

  const renderBookingCard = (b) => (
    <div
      key={b.$id}
      className="bg-white border rounded-xl p-4 shadow hover:shadow-md transition"
    >
      <p><strong>Student:</strong> {b.student_name || "N/A"}</p>
      <p><strong>Email:</strong> {b.student_email || "N/A"}</p>
      <p><strong>Subject:</strong> {b.subject || "N/A"}</p>
      <p><strong>Date & Time:</strong> {formatDateTime(b.date, b.time)}</p>
      <p>
        <strong>Status:</strong>{" "}
        <span
          className={`capitalize ${
            b.status === "accepted"
              ? "text-green-600"
              : b.status === "pending"
              ? "text-yellow-600"
              : b.status === "expired"
              ? "text-gray-500"
              : b.status === "rejected"
              ? "text-red-600"
              : ""
          }`}
        >
          {b.status}
        </span>
      </p>

      {b.rejectReason && (
        <p className="text-red-600 text-sm mt-1">
          <strong>Rejection Reason:</strong> {b.rejectReason}
        </p>
      )}
      {b.message && (
        <p className="text-gray-600 text-sm mt-1">
          <strong>Student Message:</strong> {b.message}
        </p>
      )}

      {/* 🟢 Actions */}
      {b.status === "pending" && new Date(`${b.date}T${b.time}`) >= now && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => handleAccept(b)}
            className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700"
          >
            Accept
          </button>
          <button
            onClick={() => handleReject(b)}
            className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );

  if (loading) return <p className="p-6">Loading your bookings...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <header>
        <h2 className="text-3xl font-bold text-purple-700">Tutor Dashboard</h2>
        {user && <p className="text-gray-600 mt-1">Welcome, <strong>{user.name}</strong> 👋</p>}
      </header>

      {/* 🟡 Pending Requests */}
      <section>
        <h3 className="text-xl font-semibold mb-3 text-yellow-700">Pending Requests</h3>
        {pending.length ? (
          <div className="grid md:grid-cols-2 gap-4">{pending.map(renderBookingCard)}</div>
        ) : (
          <p>No pending requests.</p>
        )}
      </section>

      {/* 🟢 Accepted Bookings */}
      <section>
        <h3 className="text-xl font-semibold mb-3 text-green-700">Accepted Bookings</h3>
        {accepted.length ? (
          <div className="grid md:grid-cols-2 gap-4">{accepted.map(renderBookingCard)}</div>
        ) : (
          <p>No accepted bookings yet.</p>
        )}
      </section>

      {/* 🕓 Expired Bookings */}
      <section>
        <h3 className="text-xl font-semibold mb-3 text-gray-700">Expired Bookings</h3>
        {expired.length ? (
          <div className="grid md:grid-cols-2 gap-4 opacity-80">{expired.map(renderBookingCard)}</div>
        ) : (
          <p>No expired bookings yet.</p>
        )}
      </section>

      {/* ❌ Rejected Bookings */}
      <section>
        <h3 className="text-xl font-semibold mb-3 text-red-700">Rejected Bookings</h3>
        {rejected.length ? (
          <div className="grid md:grid-cols-2 gap-4">{rejected.map(renderBookingCard)}</div>
        ) : (
          <p>No rejected bookings yet.</p>
        )}
      </section>
    </div>
  );
}
