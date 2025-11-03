// src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookingsByUser } from "../features/bookings/bookingSlice";
import { account } from "../utils/appwrite";

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const { list: bookings, loading } = useSelector((s) => s.bookings);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const load = async () => {
      const user = await account.get();
      setUserId(user.$id);
    };
    load();
  }, []);

  useEffect(() => {
    if (userId) {
      dispatch(fetchBookingsByUser({ userId, role: "student" }));
    }
  }, [dispatch, userId]);

  if (loading) return <p className="p-6">Loading your bookings...</p>;

  const now = new Date();
  const pending = [];
  const upcoming = [];
  const expired = [];
  const rejected = [];

  // ✅ Categorize bookings smartly
  bookings.forEach((b) => {
    const dateTime = new Date(`${b.date}T${b.time}`);

    if (b.status === "rejected") {
      rejected.push(b);
    } else if (b.status === "accepted") {
      // Accepted → future = upcoming, past = expired
      if (dateTime >= now) upcoming.push(b);
      else expired.push(b);
    } else if (b.status === "pending") {
      // Pending → expired if date has passed
      if (dateTime < now) expired.push(b);
      else pending.push(b);
    }
  });

  const format = (d, t) => {
    const dt = new Date(`${d}T${t}`);
    return dt.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  };

  const renderBookingCard = (b) => (
    <div key={b.$id} className="bg-white border rounded-lg p-4 shadow">
      <p><strong>Tutor:</strong> {b.tutor_name}</p>
      <p><strong>Subject:</strong> {b.subject}</p>
      <p><strong>Date & Time:</strong> {format(b.date, b.time)}</p>
      <p>
        <strong>Status:</strong>{" "}
        <span
          className={`capitalize ${
            b.status === "accepted"
              ? "text-green-700"
              : b.status === "pending"
              ? "text-yellow-700"
              : b.status === "rejected"
              ? "text-red-700"
              : "text-gray-600"
          }`}
        >
          {b.status === "pending" && new Date(`${b.date}T${b.time}`) < now
            ? "expired"
            : b.status}
        </span>
      </p>

      {/* 📞 Tutor contact visible only if accepted */}
      {b.status === "accepted" && (
        <>
          <p><strong>Email:</strong> {b.tutor_email}</p>
          {b.tutor_phone && <p><strong>Phone:</strong> {b.tutor_phone}</p>}
        </>
      )}

      {b.rejectReason && (
        <p className="text-red-600 text-sm mt-1">
          <strong>Rejection Note:</strong> {b.rejectReason}
        </p>
      )}
      {b.message && (
        <p className="text-gray-600 text-sm mt-1">
          <strong>Your Note:</strong> {b.message}
        </p>
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h2 className="text-2xl font-bold text-purple-700">Student Dashboard</h2>

      {/* 🟡 Pending Requests */}
      <section>
        <h3 className="text-xl font-semibold mb-3 text-yellow-700">Pending Requests</h3>
        {pending.length ? (
          <div className="grid md:grid-cols-2 gap-4">{pending.map(renderBookingCard)}</div>
        ) : (
          <p>No pending requests.</p>
        )}
      </section>

      {/* 🟢 Upcoming (Accepted) */}
      <section>
        <h3 className="text-xl font-semibold mb-3 text-green-700">Upcoming Bookings</h3>
        {upcoming.length ? (
          <div className="grid md:grid-cols-2 gap-4">{upcoming.map(renderBookingCard)}</div>
        ) : (
          <p>No upcoming bookings yet.</p>
        )}
      </section>

      {/* 🕓 Expired */}
      <section>
        <h3 className="text-xl font-semibold mb-3 text-gray-700">Expired Bookings</h3>
        {expired.length ? (
          <div className="grid md:grid-cols-2 gap-4 opacity-80">{expired.map(renderBookingCard)}</div>
        ) : (
          <p>No expired bookings yet.</p>
        )}
      </section>

      {/* ❌ Rejected */}
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
