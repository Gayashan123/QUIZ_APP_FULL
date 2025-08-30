import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSearch, FaSortUp, FaSortDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddTeacherForm from '../components/AddTeacher';
import { apiurl, token } from '../common/Http';

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${token()}`,
  };

  const fetchTeachers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiurl}teachers`, { method: 'GET', headers });
      if (!res.ok) throw new Error('Failed to fetch teachers');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || [];
      setTeachers(list);
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAddOrUpdateTeacher = async (formData) => {
  setError(null);
  try {
    const url = isEditMode && selectedTeacher
      ? `${apiurl}teachers/${selectedTeacher.id}`
      : `${apiurl}teachers`;

    const res = await fetch(url, {
      method: isEditMode && selectedTeacher ? "PUT" : "POST",
      headers: {
        'Content-Type': 'application/json', // needed for JSON
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify(formData), // convert object to JSON
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to save teacher');
    }

    toast.success(isEditMode ? 'Teacher updated successfully!' : 'Teacher added successfully!');
    setShowForm(false);
    setIsEditMode(false);
    setSelectedTeacher(null);
    await fetchTeachers();
  } catch (err) {
    setError(err.message);
    toast.error(`Error: ${err.message}`);
  }
};


  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      const res = await fetch(`${apiurl}teachers/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to delete teacher');
      toast.success('Teacher deleted successfully!');
      await fetchTeachers();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white p-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar closeOnClick pauseOnHover draggable />
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">Teacher Management</h1>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition px-5 py-2 rounded-full text-white font-semibold shadow-md"
          >
            <FaPlus /> Add Teacher
          </button>
        </div>

        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          className="w-full border border-gray-300 rounded-full p-3 mb-6 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {isLoading ? (
          <div className="text-center py-12 text-blue-600 font-semibold text-lg">Loading teachers...</div>
        ) : filteredTeachers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse shadow-md rounded-lg overflow-hidden">
              <thead className="bg-blue-50 text-blue-700 font-semibold text-left">
                <tr>
                  <th className="p-3 border-b border-blue-200 cursor-pointer flex items-center gap-2" onClick={handleSort}>
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
                    <td className="p-3 border-b border-blue-200">{new Date(teacher.created_at).toLocaleDateString()}</td>
                    <td className="p-3 border-b border-blue-200 text-right flex justify-end gap-3">
                      <button onClick={() => handleEdit(teacher)} className="text-blue-600 hover:text-blue-800" title="Edit">
                        <FaEdit size={18} />
                      </button>
                      <button onClick={() => handleDelete(teacher.id)} className="text-red-600 hover:text-red-800" title="Delete">
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 font-semibold">No teachers found</div>
        )}

        {/* Modal Form */}
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
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4 overflow-y-auto max-h-[90vh]"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <AddTeacherForm
                  initialData={selectedTeacher}
                  onAddTeacher={handleAddOrUpdateTeacher}
                  onCancel={() => setShowForm(false)}
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
