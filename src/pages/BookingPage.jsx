// src/pages/BookingPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { databases, account, ID } from "../utils/appwrite";
import ButtonLoader from "../components/ButtonLoader";

const DB = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const TUTORS = import.meta.env.VITE_APPWRITE_TUTORS_TABLE_ID;
const BOOKINGS = import.meta.env.VITE_APPWRITE_BOOKINGS_TABLE_ID;

export default function BookingPage() {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setIsSubmitting(true);
      const student = await account.get();
      if (!tutor) throw new Error("Tutor details missing!");

      // ✅ New logic: no date/time yet — tutor will choose later
      const payload = {
        tutorId: tutor.user_id,
        tutor_name: tutor.name,
        tutor_phone: String(tutor.phone || ""),
        tutor_email: tutor.email,
        studentId: student.$id,
        student_name: student.name || student.email,
        student_email: student.email,
        subject: data.subject || tutor.subject || "Not specified",
        date: null, // will be set by tutor later
        time: null, // will be set by tutor later
        message: data.message || "",
        status: "pending",
      };

      await databases.createDocument(DB, BOOKINGS, ID.unique(), payload);

      alert("🎉 Booking request sent successfully!");
      reset();
      navigate("/student-dashboard");
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Failed to send booking: " + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!tutor) return <div className="p-6">Loading tutor details...</div>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-2xl shadow-md mt-6">
      <h2 className="text-2xl font-semibold mb-2 text-purple-700">
        Book {tutor.name}
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        {tutor.subject} • {tutor.location}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <textarea
          {...register("message")}
          placeholder="Write a short note to your tutor (optional)..."
          className="border rounded w-full p-2"
          
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex justify-center items-center bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition ${
            isSubmitting ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? <ButtonLoader size={18} /> : "Send Request"}
        </button>
      </form>
    </div>
  );
}
