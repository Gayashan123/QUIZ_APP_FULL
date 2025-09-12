import { useState } from "react";
import { FaUserPlus, FaLock, FaPhone, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";

export default function AddStudentForm({ onAddStudent, onCancel, initialData, isEditMode }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    password: "",
    phone: initialData?.phone || "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.name.trim()) { newErrors.name = "Full name is required"; isValid = false; }
    if (!formData.email.trim()) { newErrors.email = "Email is required"; isValid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { newErrors.email = "Invalid email"; isValid = false; }
    if (!isEditMode && !formData.password) { newErrors.password = "Password is required"; isValid = false; }
    else if (formData.password && formData.password.length < 6) { newErrors.password = "Min 6 characters"; isValid = false; }
    if (!formData.phone.trim()) { newErrors.phone = "Phone number is required"; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    const dataToSend = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      ...(formData.password && { password: formData.password }),
    };

    await onAddStudent(dataToSend);
    setIsSubmitting(false);
  };

  return (
    <form
      className="bg-white border-2 shadow-2xl rounded-3xl p-8 max-w-md mx-auto space-y-6  border-black"
      onSubmit={handleSubmit}
    >
      <h2 className="text-3xl font-semibold text-gray-900 text-center">
        {isEditMode ? "Update Student" : "Add New Student"}
      </h2>

      {/* Name */}
      <div className="relative">
        <FaUserPlus className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition text-gray-900"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Email */}
      <div className="relative">
        <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition text-gray-900"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Password with Show/Hide */}
      <div className="relative">
        <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder={isEditMode ? "Leave blank to keep current password" : "Password"}
          className="w-full pl-12 pr-12 py-3 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition text-gray-900"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
      </div>

      {/* Phone */}
      <div className="relative">
        <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone Number"
          className="w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition text-gray-900"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center gap-2 font-medium shadow-md hover:from-blue-600 hover:to-blue-700 transition"
        >
          {isSubmitting && (
            <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
          )}
          {isEditMode ? "Update" : "Add"}
        </button>
      </div>
    </form>
  );
}
