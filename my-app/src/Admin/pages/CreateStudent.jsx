import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEdit, FaSortUp, FaSortDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddStudentForm from '../components/AddStudent';
import { apiurl, token } from '../common/Http';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token()}`,
  };

  const fetchStudents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiurl}students`, { method: 'GET', headers });
      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.data || [];
      setStudents(list);
    } catch (err) {
      setError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddOrUpdateStudent = async (formData) => {
  setError(null);
  try {
    const dataToSend = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      ...(formData.password && { password: formData.password }), // only send password if entered
    };

    const url = isEditMode && selectedStudent
      ? `${apiurl}students/${selectedStudent.id}`
      : `${apiurl}students`;

    const res = await fetch(url, {
      method: isEditMode && selectedStudent ? "PUT" : "POST",
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify(dataToSend),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || 'Failed to save student');
    }

    toast.success(isEditMode ? 'Student updated successfully!' : 'Student added successfully!');
    setShowForm(false);
    setIsEditMode(false);
    setSelectedStudent(null);
    await fetchStudents();
  } catch (err) {
    setError(err.message);
    toast.error(`Error: ${err.message}`);
  }
};


  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    try {
      const res = await fetch(`${apiurl}students/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error('Failed to delete student');
      toast.success('Student deleted successfully!');
      await fetchStudents();
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setIsEditMode(true);
    setError(null);
    setShowForm(true);
  };

  const handleAddClick = () => {
    setShowForm(true);
    setIsEditMode(false);
    setSelectedStudent(null);
    setError(null);
  };

  const handleSort = () => setSortAsc(!sortAsc);

  // Filter & sort students
  const filteredStudents = students
    .filter(
      (s) =>
        (s.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-extrabold text-gray-900">Student Management</h1>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition px-5 py-2 rounded-full text-white font-semibold shadow-md"
          >
            <FaPlus /> Add Student
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
          <div className="text-center py-12 text-blue-600 font-semibold text-lg">Loading students...</div>
        ) : filteredStudents.length > 0 ? (
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
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-blue-50 transition">
                    <td className="p-3 border-b border-blue-200 font-medium">{student.name}</td>
                    <td className="p-3 border-b border-blue-200">{student.email}</td>
                    <td className="p-3 border-b border-blue-200">{student.phone}</td>
                    <td className="p-3 border-b border-blue-200">{new Date(student.created_at).toLocaleDateString()}</td>
                    <td className="p-3 border-b border-blue-200 text-right flex justify-end gap-3">
                      <button onClick={() => handleEdit(student)} className="text-blue-600 hover:text-blue-800" title="Edit">
                        <FaEdit size={18} />
                      </button>
                      <button onClick={() => handleDelete(student.id)} className="text-red-600 hover:text-red-800" title="Delete">
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500 font-semibold">No students found</div>
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
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg mx-4"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
              >
                <AddStudentForm
                  initialData={selectedStudent}
                  onAddStudent={handleAddOrUpdateStudent}
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
