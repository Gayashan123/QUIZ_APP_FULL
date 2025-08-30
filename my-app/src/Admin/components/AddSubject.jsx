import { useState, useEffect } from "react";

export default function AddSubjectForm({ 
  onAddSubject, 
  onCancel, 
  initialData, 
  isEditMode,
  error,
  setError
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    code: initialData?.code || ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setError(null);
  }, [setError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!formData.name.trim() || !formData.code.trim()) {
      setError('Name and code are required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      await onAddSubject(formData);
      if (!isEditMode) {
        setFormData({ name: "", code: "" });
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError('Something went wrong!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="bg-white shadow-sm rounded-2xl p-6 max-w-md mx-auto space-y-6"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-semibold text-gray-900">{isEditMode ? "Update Subject" : "Add New Subject"}</h2>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>
      )}

      {/* Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code*</label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          placeholder="Enter subject code"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm text-gray-900 placeholder-gray-400 transition"
        />
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name*</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter subject name"
          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm text-gray-900 placeholder-gray-400 transition"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition flex items-center justify-center"
        >
          {isSubmitting && (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {isEditMode ? (isSubmitting ? 'Updating...' : 'Update Subject') : (isSubmitting ? 'Adding...' : 'Add Subject')}
        </button>
      </div>
    </form>
  );
}
