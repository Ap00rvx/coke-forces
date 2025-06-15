import { useState, useEffect } from "react";
import type { UpdateStudentRequest } from "../../interface/interface";



interface UpdateStudentModalProps {
  open: boolean;
  initialData: UpdateStudentRequest;
  onClose: () => void;
  onSubmit: (data: UpdateStudentRequest) => void;
  loading: boolean;
  error?: string | null;
}

const UpdateStudentModal = ({
  open,
  initialData,
  onClose,
  onSubmit,
  loading,
  error,
}: UpdateStudentModalProps) => {
  const [form, setForm] = useState<UpdateStudentRequest>(initialData);
  const [formErrors, setFormErrors] = useState<{ [k: string]: string }>({});

  useEffect(() => {
    if (open) {
      setForm(initialData);
      setFormErrors({});
    }
  }, [open, initialData]);

  const validate = () => {
    const errors: { [k: string]: string } = {};
    if (!form.name?.trim()) errors.name = "Name is required";
    if (!form.email?.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Invalid email";
    if (!form.phone?.trim()) errors.phone = "Phone is required";
    else if (!/^\+?\d{10,15}$/.test(form.phone.replace(/\s/g, ""))) errors.phone = "Invalid phone";
    if (!form.cfHandle?.trim()) errors.cfHandle = "CF Handle is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormErrors((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [e.target.name]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Update Student</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name<span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                formErrors.name ? "border-red-500" : "border-gray-300"
              } dark:bg-gray-700 dark:text-gray-100`}
              disabled={loading}
            />
            {formErrors.name && <span className="text-xs text-red-500">{formErrors.name}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email<span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              value={form.email || ""}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                formErrors.email ? "border-red-500" : "border-gray-300"
              } dark:bg-gray-700 dark:text-gray-100`}
              disabled={loading}
              type="email"
            />
            {formErrors.email && <span className="text-xs text-red-500">{formErrors.email}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone<span className="text-red-500">*</span>
            </label>
            <input
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                formErrors.phone ? "border-red-500" : "border-gray-300"
              } dark:bg-gray-700 dark:text-gray-100`}
              disabled={loading}
              type="tel"
              maxLength={15}
            />
            {formErrors.phone && <span className="text-xs text-red-500">{formErrors.phone}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CF Handle<span className="text-red-500">*</span>
            </label>
            <input
              name="cfHandle"
              value={form.cfHandle || ""}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 ${
                formErrors.cfHandle ? "border-red-500" : "border-gray-300"
              } dark:bg-gray-700 dark:text-gray-100`}
              disabled={loading}
            />
            {formErrors.cfHandle && <span className="text-xs text-red-500">{formErrors.cfHandle}</span>}
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateStudentModal;