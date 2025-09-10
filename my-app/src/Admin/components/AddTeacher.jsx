import { useState, useEffect } from "react";
import { FaUserTie, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function AddTeacherForm({ onAddTeacher, onCancel, initialData, isEditMode, error, setError }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    password: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 toggle state

  useEffect(() => {
    setError(null);
  }, [setError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name || !formData.email || !formData.phone || (!isEditMode && !formData.password)) {
      setError("All required fields must be filled");
      setIsSubmitting(false);
      return;
    }

    try {
      await onAddTeacher(formData);
      if (!isEditMode) setFormData({ name: "", email: "", phone: "", password: "" });
    } catch {
      setError("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="bg-white shadow-xl rounded-2xl p-6 max-w-md mx-auto space-y-5" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold">
        {isEditMode ? "Update Teacher" : "Add New Teacher"}
      </h2>
      {error && <div className="p-2 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}

      {/* Name */}
      <div className="relative">
        <FaUserTie className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
        />
      </div>

      {/* Email */}
      <div className="relative">
        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
        />
      </div>

      {/* Phone */}
      <div className="relative">
        <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
        />
      </div>

      {/* Password with toggle */}
      <div className="relative">
        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={isEditMode ? "Leave blank to keep password" : "Password"}
          className="w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition"
        >
          {isSubmitting && (
            <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
          )}
          {isEditMode ? "Update Teacher" : "Add Teacher"}
        </button>
      </div>
    </form>
  );
}
