import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSortUp, FaSortDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddSubjectForm from '../components/AddSubject';
import { apiurl, token } from '../common/Http';
import Sidebar from "../components/Sidebar";

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortAsc, setSortAsc] = useState(true); // sort ascending by default

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token()}`,
  };

  const fetchSubjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiurl}subjects`, { method: 'GET', headers });
      if (!res.ok) throw new Error('Failed to fetch subjects');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || [];
      setSubjects(list);
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleAddOrUpdateSubject = async (formData) => {
    setError(null);
    try {
      let res;
      if (isEditMode && selectedSubject) {
        res = await fetch(`${apiurl}subjects/${selectedSubject.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formData),
        });
      } else {
        res = await fetch(`${apiurl}subjects`, {
          method: 'POST',
          headers,
          body: JSON.stringify(formData),
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save subject');
      }

      toast.success(isEditMode ? 'Subject updated successfully!' : 'Subject added successfully!');
      setShowForm(false);
      setIsEditMode(false);
      setSelectedSubject(null);
      await fetchSubjects();
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subject?')) return;
    try {
      const res = await fetch(`${apiurl}subjects/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to delete subject');
      toast.success('Subject deleted successfully!');
      await fetchSubjects();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
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
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const codeA = a.code.toUpperCase();
      const codeB = b.code.toUpperCase();
      return sortAsc ? codeA.localeCompare(codeB) : codeB.localeCompare(codeA);
    });

  return (
     <div className="flex min-h-screen bg-gray-100">
          {/* Sidebar */}
          <Sidebar teacherName="Admin" />
    
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick pauseOnHover draggable />
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">Subject Management</h1>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition px-5 py-2 rounded-full text-white font-semibold shadow-md"
          >
            <FaPlus /> Add Subject
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by name or code..."
          className="w-full border border-gray-300 rounded-full p-3 mb-6 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {isLoading ? (
          <div className="text-center py-12 text-indigo-600 font-semibold text-lg">Loading subjects...</div>
        ) : filteredSubjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden">
              <thead className="bg-indigo-50 text-indigo-700 font-semibold text-left">
                <tr>
                  <th className="p-3 border-b border-indigo-200 cursor-pointer flex items-center gap-2" onClick={handleSort}>
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
                    <td className="p-3 border-b border-indigo-200">{new Date(subject.created_at).toLocaleString()}</td>
                    <td className="p-3 border-b border-indigo-200">{new Date(subject.updated_at).toLocaleString()}</td>
                    <td className="p-3 border-b border-indigo-200 text-right flex justify-end gap-3">
                      <button onClick={() => handleEdit(subject)} className="text-indigo-600 hover:text-indigo-800" title="Edit">
                        <FaEdit size={18} />
                      </button>
                      <button onClick={() => handleDelete(subject.id)} className="text-red-600 hover:text-red-800" title="Delete">
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 font-semibold">No subjects found</div>
        )}

        <AnimatePresence>
          {showForm && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <AddSubjectForm
                  onAddSubject={handleAddOrUpdateSubject}
                  onCancel={() => setShowForm(false)}
                  initialData={selectedSubject}
                  isEditMode={isEditMode}
                  error={error}
                  setError={setError}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
