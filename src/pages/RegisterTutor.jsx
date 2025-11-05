import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { databases, storage, ID } from "../utils/appwrite";
import ButtonLoader from "../components/ButtonLoader";

function RegisterTutor() {
  const { register, handleSubmit, reset } = useForm();
  const [previewIdentity, setPreviewIdentity] = useState(null);
  const [previewQualification, setPreviewQualification] = useState(null);
  const [identityFileName, setIdentityFileName] = useState("");
  const [qualificationFileName, setQualificationFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useSelector((state) => state.auth.user);
  if (!user) return <Navigate to="/login" replace />;

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // ✅ Upload files
      const identityUpload = await storage.createFile(
        import.meta.env.VITE_APPWRITE_BUCKET_ID,
        ID.unique(),
        data.identityProof[0]
      );

      const qualificationUpload = await storage.createFile(
        import.meta.env.VITE_APPWRITE_BUCKET_ID,
        ID.unique(),
        data.qualificationProof[0]
      );

      // ✅ Create Tutor Document
      await databases.createDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_TUTORS_TABLE_ID,
        ID.unique(),
        {
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          phone: parseInt(data.phone),
          subject: data.subject.trim(),
          location: data.location.trim(),
          languages: data.languages || "",
          standard: data.standard.trim(),
          fees: Math.max(0, parseInt(data.fees)), // prevent negatives
          bio: data.bio || "",
          experience: data.experience || "",
          gender: data.gender,
          qualification: data.qualification || "",
          identityProof: identityUpload.$id,
          qualificationProof: qualificationUpload.$id,
          verified: false, // ✅ must be boolean
          user_id: user.$id, // ✅ link with Appwrite user
        }
      );

      alert("Tutor registered successfully! Pending admin verification.");
      reset();
      setPreviewIdentity(null);
      setPreviewQualification(null);
      setIdentityFileName("");
      setQualificationFileName("");
    } catch (error) {
      console.error("❌ Error registering tutor:", error);
      alert("Failed to register tutor: " + (error.message || error));
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const handleIdentityPreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdentityFileName(file.name);
      setPreviewIdentity(URL.createObjectURL(file));
    }
  };

  const handleQualificationPreview = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQualificationFileName(file.name);
      setPreviewQualification(URL.createObjectURL(file));
    }
  };

  const renderPreview = (fileURL, fileName) => {
    if (!fileURL) return null;
    const isPDF = fileName.toLowerCase().endsWith(".pdf");

    return isPDF ? (
      <div className="mt-2">
        <button
          type="button"
          onClick={() => window.open(fileURL, "_blank")}
          className="text-purple-500 underline hover:text-purple-600"
        >
          Preview PDF
        </button>
      </div>
    ) : (
      <img
        src={fileURL}
        alt="Uploaded File Preview"
        className="h-32 rounded mt-2 border shadow-sm"
      />
    );
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-700">
          Register as Tutor
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <input {...register("name")} placeholder="Name" className="input" required />
          <input {...register("email")} type="email" placeholder="Email" className="input" required />
          <input {...register("phone")} type="tel" placeholder="Contact" className="input" required />
          <select {...register("gender")} className="input" required defaultValue="">
            <option value="" disabled>Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input {...register("subject")} placeholder="Subjects (e.g., Math, Dance)" className="input" required />
          <input {...register("location")} placeholder="Location with pincode" className="input" required />
          <input {...register("standard")} placeholder="Standard (e.g., 6–8)" className="input" required />
          <input {...register("qualification")} placeholder="Qualification" className="input" required />

          {/* ✅ Prevent negative values */}
          <input
            {...register("fees", {
              required: "Fees are required",
              min: { value: 0, message: "Fees cannot be negative" },
            })}
            type="number"
            placeholder="Fees per month"
            className="input"
            min="0"
            onInput={(e) => {
              if (e.target.value < 0) e.target.value = 0;
            }}
          />

          <input {...register("experience")} placeholder="Experience" className="input" />
        </div>

        <textarea {...register("bio")} placeholder="Short bio" className="input mt-3" rows={3} />

        {/* ✅ Identity Proof Upload */}
        <label className="block mt-4 font-medium text-gray-700">
          Upload Identity Proof (Aadhar/Passport)
        </label>
        <input
          {...register("identityProof")}
          type="file"
          accept="image/*,.pdf"
          onChange={handleIdentityPreview}
          className="border w-full p-2 rounded"
          required
        />
        {renderPreview(previewIdentity, identityFileName)}

        {/* ✅ Qualification Proof Upload */}
        <label className="block mt-4 font-medium text-gray-700">
          Upload Qualification Document (Marksheets/Degrees)
        </label>
        <input
          {...register("qualificationProof")}
          type="file"
          accept="image/*,.pdf"
          onChange={handleQualificationPreview}
          className="border w-full p-2 rounded"
          required
        />
        {renderPreview(previewQualification, qualificationFileName)}

        <button
  type="submit"
  disabled={isSubmitting}
  className={`w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 rounded mt-6 hover:bg-green-700 transition ${
    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
  }`}
>
  {isSubmitting ? (
    <>
      <ButtonLoader size={18} color="white" />
      <span>Submitting...</span>
    </>
  ) : (
    "Submit"
  )}
</button>
      </form>
    </div>
  );
}

export default RegisterTutor;
