import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaSortUp, FaSortDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../common/api';

// Lazy load components
const Sidebar = lazy(() => import("../components/Sidebar"));
const AddTeacherForm = lazy(() => import("../components/AddTeacher"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Error display component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="text-center py-8">
    <div className="text-red-600 mb-4">{message}</div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Try Again
      </button>
    )}
  </div>
);

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('teachers');
      const data = response.data;
      const list = Array.isArray(data) ? data : data.data || [];
      setTeachers(list);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch teachers';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleAddOrUpdateTeacher = async (formData) => {
    setError(null);
    try {
      if (isEditMode && selectedTeacher) {
        await api.put(`teachers/${selectedTeacher.id}`, formData);
        toast.success('Teacher updated successfully!');
      } else {
        await api.post('teachers', formData);
        toast.success('Teacher added successfully!');
      }
      
      setShowForm(false);
      setIsEditMode(false);
      setSelectedTeacher(null);
      await fetchTeachers();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save teacher';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      await api.delete(`teachers/${id}`);
      toast.success('Teacher deleted successfully!');
      await fetchTeachers();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete teacher';
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setIsEditMode(true);
    setError(null);
    setShowForm(true);
  };

  const handleAddClick = () => {
    setShowForm(true);
    setIsEditMode(false);
    setSelectedTeacher(null);
    setError(null);
  };

  const handleSort = () => setSortAsc(!sortAsc);

  const filteredTeachers = teachers
    .filter(
      (t) =>
        (t.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (t.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (t.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const nameA = (a.name || '').toUpperCase();
      const nameB = (b.name || '').toUpperCase();
      return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
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
        
        <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900">Teacher Management</h1>
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition px-5 py-2 rounded-full text-white font-semibold shadow-md"
              aria-label="Add Teacher"
            >
              <FaPlus /> Add Teacher
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search teachers"
            />
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchTeachers} />
          ) : filteredTeachers.length > 0 ? (
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="w-full border-collapse">
                <thead className="bg-blue-50 text-blue-700 font-semibold">
                  <tr>
                    <th 
                      className="p-3 border-b border-blue-200 cursor-pointer flex items-center gap-2" 
                      onClick={handleSort}
                      aria-sort={sortAsc ? "ascending" : "descending"}
                    >
                      Name {sortAsc ? <FaSortUp /> : <FaSortDown />}
                    </th>
                    <th className="p-3 border-b border-blue-200">Email</th>
                    <th className="p-3 border-b border-blue-200">Phone</th>
                    <th className="p-3 border-b border-blue-200">Created At</th>
                    <th className="p-3 border-b border-blue-200 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-blue-50 transition">
                      <td className="p-3 border-b border-blue-200 font-medium">{teacher.name}</td>
                      <td className="p-3 border-b border-blue-200">{teacher.email}</td>
                      <td className="p-3 border-b border-blue-200">{teacher.phone}</td>
                      <td className="p-3 border-b border-blue-200">
                        {teacher.created_at ? new Date(teacher.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3 border-b border-blue-200 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => handleEdit(teacher)} 
                            className="text-blue-600 hover:text-blue-800 transition"
                            aria-label={`Edit ${teacher.name}`}
                          >
                            <FaEdit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(teacher.id)} 
                            className="text-red-600 hover:text-red-800 transition"
                            aria-label={`Delete ${teacher.name}`}
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
              {searchTerm ? 'No teachers match your search' : 'No teachers found'}
            </div>
          )}

          {/* Modal Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-40"
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
                    <AddTeacherForm
                      initialData={selectedTeacher}
                      onAddTeacher={handleAddOrUpdateTeacher}
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