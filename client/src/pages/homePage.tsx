import { useState, useEffect } from 'react';
import studentService from '../service/studentService';
import type { StudentListResponse } from '../interface/interface';
import Navbar from '../components/navbar';
import { ContainerTextFlip } from '../components/containerFlip';
import { MdDeleteForever, MdOutlineEdit } from 'react-icons/md';

const StudentList = () => {
  const [students, setStudents] = useState<StudentListResponse>({
    students: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalStudents: 0,
      limit: 7,
    },
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    cfHandle: string;
  }>({
    name: '',
    email: '',
    phone: '',
    cfHandle: '',
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    cfHandle?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchStudents = async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await studentService.getAllStudent({
        page: pageNum,
        limit: students.pagination.limit,
        minRating: 0,
      });
      setStudents(response);
    } catch (err: unknown) {
      console.error('Error fetching student data:', err);
      setError('Failed to fetch student data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(page);
  }, [page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const validateForm = () => {
    const errors: { name?: string; email?: string; phone?: string; cfHandle?: string } = {};
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?\d{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Invalid phone number (10-15 digits)';
    }
    if (!formData.cfHandle.trim()) {
      errors.cfHandle = 'Codeforces handle is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleAddStudent = async () => {
    setFormLoading(true);
    if (!validateForm()) {
      setFormLoading(false);
      return; 
    }

    try {
      await studentService.createStudentDetails(formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', cfHandle: '' });
      setFormErrors({});
      setSubmitError(null);
      setFormLoading(false);
      fetchStudents(page); // Refresh the student list
    } catch (err: unknown) {
      console.error('Error adding student:', err);
      setFormLoading(false);
      setSubmitError('Failed to add student. Please try again.');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setFormData({ name: '', email: '', phone: '', cfHandle: '' });
    setFormErrors({});
    setSubmitError(null);
  };

  const renderPagination = () => {
    const { currentPage, totalPages, totalStudents } = students.pagination;
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`mx-1 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            currentPage === i
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex flex-col items-center mt-6 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            First
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Previous
          </button>
          {pages}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Next
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Last
          </button>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Showing {(currentPage - 1) * students.pagination.limit + 1} to{' '}
          {Math.min(currentPage * students.pagination.limit, totalStudents)} of {totalStudents}{' '}
          students
        </span>
      </div>
    );
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <Navbar />
      <div className="mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-8">
          <ContainerTextFlip />
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer text-sm font-medium"
          >
            + Add Student
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-3a1 1 0 112 0 1 1 0 01-2 0zm0-9a1 1 0 011 1v4a1 1 0 11-2 0V7a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          {loading ? (
            <div>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20"></th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                    Phone
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    CF Handle
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rating / Max
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                    Rank
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                    Synced at
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell justify-end items-end"></th>
                </tr>
              </thead>
             
              </table>
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                <p className='ml-4 text-gray-500 dark:text-gray-400'>
                  Loading Students </p>
                
              </div>
            </div>
            
            
          ) : students.students.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No students found.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20"></th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                    Phone
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    CF Handle
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rating / Max
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                    Rank
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                    Synced at
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell justify-end items-end"></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {students.students.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={student.titlePhoto}
                        alt={student.name}
                        className="h-10 w-10 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            student.name
                          )}`;
                        }}
                      />
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {student.name}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {student.email ? student.email : 'No email provided'}
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {student.phone}
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <a
                        href={`https://codeforces.com/profile/${student.cfHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {student.cfHandle}
                      </a>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white font-bold">
                        {student.rating} /
                        <span className="text-red-400 dark:text-blue-500 font-normal ml-1">
                          {student.maxRating}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div
                        className={`text-sm capitalize font-semibold ${
                          student.rank === 'legendary grandmaster'
                            ? 'text-[#FF8C00]'
                            : student.rank === 'international grandmaster'
                            ? 'text-red-600'
                            : student.rank === 'grandmaster'
                            ? 'text-red-500'
                            : student.rank === 'international master'
                            ? 'text-orange-500'
                            : student.rank === 'master'
                            ? 'text-orange-400'
                            : student.rank === 'candidate master'
                            ? 'text-purple-500'
                            : student.rank === 'expert'
                            ? 'text-blue-600'
                            : student.rank === 'specialist'
                            ? 'text-cyan-600'
                            : student.rank === 'pupil'
                            ? 'text-green-600'
                            : student.rank === 'newbie'
                            ? 'text-gray-500 dark:text-gray-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {student.rank}
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(student.updatedAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false,
                        })}
                      </div>
                    </td>
                    <td className="px-2 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex justify-start items-center">
                        <button
                          onClick={() => {}}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-xs font-medium"
                        >
                          View Profile
                        </button>
                        <MdDeleteForever
                          className="text-red-600 hover:text-red-800 cursor-pointer ml-4 text-lg"
                        />
                        <MdOutlineEdit
                          className="text-blue-700 hover:text-blue-900 cursor-pointer ml-4 text-lg"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {students.pagination.totalPages > 0 && renderPagination()}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-10">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Add New Student
              </h2>
              {submitError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-3a1 1 0 112 0 1 1 0 01-2 0zm0-9a1 1 0 011 1v4a1 1 0 11-2 0V7a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {submitError}
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter email"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter phone number"
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Codeforces Handle
                  </label>
                  <input
                    type="text"
                    name="cfHandle"
                    value={formData.cfHandle}
                    onChange={handleInputChange}
                    className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter Codeforces handle"
                  />
                  {formErrors.cfHandle && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.cfHandle}</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleModalClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStudent}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {
                    formLoading ? (
                      <div>
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      <span className="ml-2">Adding...</span>
                      </div>
                  
                    ):(
                      'Add Student'
                    )
                  }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;