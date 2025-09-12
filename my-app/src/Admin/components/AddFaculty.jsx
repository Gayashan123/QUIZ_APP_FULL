import { useState, useEffect } from "react";
import { FaBuilding } from "react-icons/fa";

export default function AddFacultyForm({ onAddFaculty, onCancel, initialData, isEditMode, error, setError }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    code: initialData?.code || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { setError(null); }, [setError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.name.trim() || !formData.code.trim()) {
      setError('Name and code are required');
      setIsSubmitting(false);
      return;
    }

    try {
      await onAddFaculty(formData);
      if (!isEditMode) setFormData({ name: "", code: "" });
    } catch {
      setError('Something went wrong!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="bg-white border-2 border-black shadow-xl rounded-2xl p-6 max-w-md mx-auto space-y-5" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold text-gray-900">{isEditMode ? "Update Faculty" : "Add New Faculty"}</h2>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}

      <div className="relative">
        <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          placeholder="Faculty Code"
          className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
        />
      </div>

      <div className="relative">
        <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Faculty Name"
          className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center gap-2 hover:from-blue-600 hover:to-blue-700 transition">
          {isSubmitting && <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>}
          {isEditMode ? "Update Faculty" : "Add Faculty"}
        </button>
      </div>
    </form>
  );
}
