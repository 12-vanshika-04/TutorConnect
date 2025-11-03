// src/pages/BookingPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { databases, account, ID } from "../utils/appwrite";

const DB = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TUTORS = import.meta.env.VITE_APPWRITE_TUTORS_TABLE_ID;
const BOOKINGS = import.meta.env.VITE_APPWRITE_BOOKINGS_TABLE_ID;

export default function BookingPage() {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState(null);
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();

  /* ✅ Fetch tutor details */
  useEffect(() => {
    (async () => {
      try {
        const doc = await databases.getDocument(DB, TUTORS, tutorId);
        setTutor(doc);
      } catch (err) {
        console.error("Error fetching tutor details:", err);
      }
    })();
  }, [tutorId]);

  /* ✅ Booking submit logic */
  const onSubmit = async (data) => {
    try {
      const student = await account.get();
      if (!tutor) throw new Error("Tutor details missing!");

      // 🕒 Validate future date/time
      const selectedDateTime = new Date(`${data.date}T${data.time}`);
      const now = new Date();
      if (isNaN(selectedDateTime.getTime()) || selectedDateTime <= now) {
        alert("Please select a valid future date and time.");
        return;
      }

      const formattedDate = selectedDateTime.toISOString().split("T")[0];
      const formattedTime = selectedDateTime
        .toTimeString()
        .split(" ")[0]
        .slice(0, 5);

      // ✅ Prepare booking payload
      const payload = {
        tutorId: tutor.$id,
        tutor_name: tutor.name,
        tutor_phone: String(tutor.phone || ""),
        tutor_email: tutor.email,
        studentId: student.$id,
        student_name: student.name || student.email,
        student_email: student.email,
        subject: data.subject || tutor.subject || "Not specified",
        date: formattedDate,
        time: formattedTime,
        message: data.message || "",
        status: "pending",
      };

      // ✅ Create booking (no permissions)
      await databases.createDocument(DB, BOOKINGS, ID.unique(), payload);

      alert("🎉 Booking request sent successfully!");
      reset();
      navigate("/student-dashboard");
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Failed to book: " + (err.message || err));
    }
  };

  if (!tutor) return <div className="p-6">Loading tutor details...</div>;

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-md mt-6">
      <h2 className="text-2xl font-semibold mb-2 text-purple-700">
        Book {tutor.name}
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        {tutor.subject} • {tutor.location}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            {...register("subject")}
            placeholder="Subject (optional)"
            defaultValue={tutor.subject}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            {...register("date", { required: true })}
            type="date"
            min={today}
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <input
            {...register("time", { required: true })}
            type="time"
            step="900"
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Message (optional)
          </label>
          <textarea
            {...register("message")}
            rows={3}
            placeholder="Any specific instructions or message"
            className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition w-full"
        >
          Request Booking
        </button>
      </form>
    </div>
  );
}
