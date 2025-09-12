import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSortUp, FaSortDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../common/api';

// Lazy load components
const Sidebar = lazy(() => import("../components/Sidebar"));
const AddSubjectForm = lazy(() => import("../components/AddSubject"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

// Error display component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="text-center py-8">
    <div className="text-red-600 mb-4">{message}</div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
      >
        Try Again
      </button>
    )}
  </div>
);

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('subjects');
      const data = response.data;
      const list = Array.isArray(data) ? data : data.data || [];
      setSubjects(list);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch subjects';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleAddOrUpdateSubject = async (formData) => {
    setError(null);
    try {
      if (isEditMode && selectedSubject) {
        await api.put(`subjects/${selectedSubject.id}`, formData);
        toast.success('Subject updated successfully!');
      } else {
        await api.post('subjects', formData);
        toast.success('Subject added successfully!');
      }
      
      setShowForm(false);
      setIsEditMode(false);
      setSelectedSubject(null);
      await fetchSubjects();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save subject';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    
    try {
      await api.delete(`subjects/${id}`);
      toast.success('Subject deleted successfully!');
      await fetchSubjects();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete subject';
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (subject) => {
    setSelectedSubject(subject);
    setIsEditMode(true);
    setError(null);
    setShowForm(true);
  };

  const handleAddClick = () => {
    setShowForm(true);
    setIsEditMode(false);
    setSelectedSubject(null);
    setError(null);
  };

  const handleSort = () => setSortAsc(!sortAsc);

  // Filter & sort subjects
  const filteredSubjects = subjects
    .filter(
      (s) =>
        (s.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const codeA = (a.code || '').toUpperCase();
      const codeB = (b.code || '').toUpperCase();
      return sortAsc ? codeA.localeCompare(codeB) : codeB.localeCompare(codeA);
    });

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar with Suspense */}
      <Suspense fallback={<div className="w-64 bg-gray-800"></div>}>
        <Sidebar teacherName="Admin" />
      </Suspense>

      <div className="flex-1 p-6">
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        
        <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900">Subject Management</h1>
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition px-5 py-2 rounded-full text-white font-semibold shadow-md"
              aria-label="Add Subject"
            >
              <FaPlus /> Add Subject
            </button>
          </div>

          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search by name or code..."
              className="w-full border border-gray-300 rounded-full pl-4 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search subjects"
            />
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchSubjects} />
          ) : filteredSubjects.length > 0 ? (
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="w-full border-collapse">
                <thead className="bg-indigo-50 text-indigo-700 font-semibold">
                  <tr>
                    <th 
                      className="p-3 border-b border-indigo-200 cursor-pointer flex items-center gap-2" 
                      onClick={handleSort}
                      aria-sort={sortAsc ? "ascending" : "descending"}
                    >
                      Code {sortAsc ? <FaSortUp /> : <FaSortDown />}
                    </th>
                    <th className="p-3 border-b border-indigo-200">Name</th>
                    <th className="p-3 border-b border-indigo-200">Created At</th>
                    <th className="p-3 border-b border-indigo-200">Updated At</th>
                    <th className="p-3 border-b border-indigo-200 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {filteredSubjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-indigo-50 transition">
                      <td className="p-3 border-b border-indigo-200 font-mono">{subject.code}</td>
                      <td className="p-3 border-b border-indigo-200">{subject.name}</td>
                      <td className="p-3 border-b border-indigo-200">
                        {subject.created_at ? new Date(subject.created_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-3 border-b border-indigo-200">
                        {subject.updated_at ? new Date(subject.updated_at).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-3 border-b border-indigo-200 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => handleEdit(subject)} 
                            className="text-indigo-600 hover:text-indigo-800 transition"
                            aria-label={`Edit ${subject.name}`}
                          >
                            <FaEdit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(subject.id)} 
                            className="text-red-600 hover:text-red-800 transition"
                            aria-label={`Delete ${subject.name}`}
                          >
                            <FaTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500 font-semibold">
              {searchTerm ? 'No subjects match your search' : 'No subjects found'}
            </div>
          )}

          {/* Modal Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-transparent "
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowForm(false)}
              >
                <motion.div
                  className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 overflow-y-auto max-h-[90vh]"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Suspense fallback={<LoadingSpinner />}>
                    <AddSubjectForm
                      initialData={selectedSubject}
                      onAddSubject={handleAddOrUpdateSubject}
                      onCancel={() => setShowForm(false)}
                      isEditMode={isEditMode}
                      error={error}
                      setError={setError}
                    />
                  </Suspense>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}