import React from "react";

interface AddStudentModalProps {
  open: boolean;
  formData: {
    name: string;
    email: string;
    phone: string;
    cfHandle: string;
  };
  formErrors: {
    name?: string;
    email?: string;
    phone?: string;
    cfHandle?: string;
  };
  submitError: string | null;
  formLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({
  open,
  formData,
  formErrors,
  submitError,
  formLoading,
  onInputChange,
  onClose,
  onSubmit,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-10">
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
              onChange={onInputChange}
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
              onChange={onInputChange}
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
              onChange={onInputChange}
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
              onChange={onInputChange}
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
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={formLoading}
          >
            {formLoading ? (
              <div>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                <span className="ml-2">Adding...</span>
              </div>
            ) : (
              'Add Student'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStudentModal;