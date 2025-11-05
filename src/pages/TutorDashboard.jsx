// src/pages/TutorDashboard.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookingsByUser, updateBookingStatus } from "../features/bookings/bookingSlice";
import { account, databases } from "../utils/appwrite";
import BookingCard from "../components/BookingCard";
import { Query } from "appwrite";

const DB = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TUTORS_TABLE = import.meta.env.VITE_APPWRITE_TUTORS_TABLE_ID;

export default function TutorDashboard() {
  const dispatch = useDispatch();
  const { list: bookings, loading, error } = useSelector((s) => s.bookings);
  const userRole = useSelector((s) => s.auth.user?.role);

  const [user, setUser] = useState(null);
  const [tutorDoc, setTutorDoc] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [confirming, setConfirming] = useState(false);

  // Get logged-in user
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

  // Fetch tutor document + bookings
  useEffect(() => {
    const fetchTutorData = async () => {
      if (!user || userRole !== "tutor") return; // only fetch if user is tutor
      try {
        const tutorRes = await databases.listDocuments(DB, TUTORS_TABLE, [
          Query.equal("user_id", user.$id), // safer: match Appwrite user ID
        ]);

        if (tutorRes.documents.length > 0) {
          const tutorRecord = tutorRes.documents[0];
          setTutorDoc(tutorRecord);

          // Fetch bookings using Appwrite user ID
          dispatch(fetchBookingsByUser({ userId: user.$id, role: "tutor" }));
        } else {
          console.error("Tutor document not found for this user.");
          setTutorDoc(null);
        }
      } catch (err) {
        console.error("Error fetching tutor record:", err);
      }
    };
    fetchTutorData();

    // Clear bookings if role is not tutor
    if (userRole !== "tutor") {
      dispatch({ type: "bookings/fetchBookingsByUser/fulfilled", payload: [] });
    }
  }, [user, userRole, dispatch]);

  // Update booking status
  const handleUpdate = async (bookingId, data) => {
    try {
      await dispatch(updateBookingStatus({ bookingId, ...data })).unwrap();
      if (user && userRole === "tutor") {
        dispatch(fetchBookingsByUser({ userId: user.$id, role: "tutor" }));
      }
    } catch (err) {
      console.error("Failed to update booking:", err);
      alert("Failed to update booking.");
    }
  };

  const handleConfirmAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select both date and time");
      return;
    }

    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    if (selectedDateTime <= new Date()) {
      alert("Please select a future date and time.");
      return;
    }

    setConfirming(true);
    try {
      await handleUpdate(selectedBooking.$id, {
        status: "accepted",
        date: selectedDate,
        time: selectedTime,
      });
      setShowModal(false);
      setSelectedDate("");
      setSelectedTime("");
    } finally {
      setConfirming(false);
    }
  };

  const handleAcceptClick = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleRejectClick = (booking) => {
    const reason = prompt("Reason for rejection:");
    if (reason) handleUpdate(booking.$id, { status: "rejected", rejectReason: reason });
  };

  // Format date & time
  const formatDateTime = (d, t) => {
    if (!d || !t) return "Not scheduled yet";
    const dt = new Date(`${d}T${t}`);
    return dt.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  };

  // Categorize bookings
  const now = new Date();
  const processedBookings = bookings.map((b) => {
    const bookingTime = b.date && b.time ? new Date(`${b.date}T${b.time}`) : null;
    let isExpired = false;
    if (b.status === "rejected") isExpired = true;
    else if (bookingTime && bookingTime < now) isExpired = true;
    return { ...b, isExpired };
  });

  const pending = processedBookings.filter((b) => b.status === "pending" && !b.isExpired);
  const accepted = processedBookings.filter((b) => b.status === "accepted" && !b.isExpired);
  const rejected = processedBookings.filter((b) => b.status === "rejected");
  const expired = processedBookings.filter(
    (b) => b.isExpired && ["accepted", "pending", "completed"].includes(b.status)
  );

  if (loading) return <p className="p-6">Loading your bookings...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      <header>
        <h2 className="text-3xl font-bold text-purple-700">Tutor Dashboard</h2>
        {user && <p className="text-gray-600 mt-1">Welcome, <strong>{user.name}</strong> 👋</p>}
      </header>

      {/* Pending Requests */}
      <section>
        <h3 className="text-xl font-semibold mb-3 text-yellow-700">Pending Requests</h3>
        {pending.length ? (
          <div className="grid md:grid-cols-2 gap-4">
            {pending.map((b) => (
              <BookingCard
                key={b.$id}
                booking={b}
                role="tutor"
                onAccept={handleAcceptClick}
                onReject={handleRejectClick}
              />
            ))}
          </div>
        ) : <p>No pending requests.</p>}
      </section>

      {/* Accepted Bookings */}
      <section>
        <h3 className="text-xl font-semibold mb-3 text-green-700">Accepted Bookings</h3>
        {accepted.length ? (
          <div className="grid md:grid-cols-2 gap-4">
            {accepted.map((b) => (
              <BookingCard
                key={b.$id}
                booking={b}
                role="tutor"
                onComplete={(booking) => handleUpdate(booking.$id, { status: "completed" })}
              />
            ))}
          </div>
        ) : <p>No accepted bookings yet.</p>}
      </section>

      {/* Expired Bookings */}
      <section>
        <h3 className="text-xl font-semibold mb-3 text-gray-700">Expired Bookings</h3>
        {expired.length ? (
          <div className="grid md:grid-cols-2 gap-4 opacity-80">
            {expired.map((b) => (
              <BookingCard key={b.$id} booking={b} role="tutor" />
            ))}
          </div>
        ) : <p>No expired bookings yet.</p>}
      </section>

      {/* Rejected Bookings */}
      <section>
        <h3 className="text-xl font-semibold mb-3 text-red-700">Rejected Bookings</h3>
        {rejected.length ? (
          <div className="grid md:grid-cols-2 gap-4">
            {rejected.map((b) => (
              <BookingCard key={b.$id} booking={b} role="tutor" />
            ))}
          </div>
        ) : <p>No rejected bookings yet.</p>}
      </section>

      {/* Accept Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Booking</h3>
            <p className="mb-2"><strong>Student:</strong> {selectedBooking.student_name}</p>
            <p className="mb-4"><strong>Subject:</strong> {selectedBooking.subject}</p>
            <label className="block mb-2">Select Date & Time:</label>
            <input
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
              value={selectedDate && selectedTime ? `${selectedDate}T${selectedTime}` : ""}
              onChange={(e) => {
                const [d, t] = e.target.value.split("T");
                setSelectedDate(d);
                setSelectedTime(t);
              }}
              className="border p-2 rounded w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAppointment}
                disabled={confirming}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {confirming ? "Confirming..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
