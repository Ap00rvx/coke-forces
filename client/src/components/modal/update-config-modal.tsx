import React, { useState, useEffect } from "react";

interface UpdateConfigModalProps {
  open: boolean;
  initialCron: string;
  onClose: () => void;
  onSubmit: (cron: string) => void;
  loading?: boolean;
  error?: string | null;
}

const frequencyOptions = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

function getDefaultTimeFromCron(cron: string) {
  // cron format: "0 2 * * *" => hour: 2, minute: 0
  const [min, hour] = cron.split(" ");
  return {
    hour: hour ? String(hour).padStart(2, "0") : "02",
    minute: min ? String(min).padStart(2, "0") : "00",
  };
}

function getDefaultFrequencyFromCron(cron: string) {
  // "0 2 * * *" => daily, "0 2 * * 0" => weekly, "0 2 1 * *" => monthly
  const parts = cron.split(" ");
  if (parts[4] && parts[4] !== "*" && parts[2] === "*") return "weekly";
  if (parts[2] && parts[2] !== "*" && parts[4] === "*") return "monthly";
  return "daily";
}

function buildCron(minute: string, hour: string, frequency: string) {
  if (frequency === "daily") return `${minute} ${hour} * * *`;
  if (frequency === "weekly") return `${minute} ${hour} * * 0`;
  if (frequency === "monthly") return `${minute} ${hour} 1 * *`;
  return `${minute} ${hour} * * *`;
}

const UpdateConfigModal: React.FC<UpdateConfigModalProps> = ({
  open,
  initialCron,
  onClose,
  onSubmit,
  loading,
  error,
}) => {
  const [hour, setHour] = useState("02");
  const [minute, setMinute] = useState("00");
  const [frequency, setFrequency] = useState("daily");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const { hour: h, minute: m } = getDefaultTimeFromCron(initialCron);
      setHour(h);
      setMinute(m);
      setFrequency(getDefaultFrequencyFromCron(initialCron));
      setLocalError(null);
    }
  }, [open, initialCron]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      isNaN(Number(hour)) ||
      isNaN(Number(minute)) ||
      Number(hour) < 0 ||
      Number(hour) > 23 ||
      Number(minute) < 0 ||
      Number(minute) > 59
    ) {
      setLocalError("Please enter a valid time.");
      return;
    }
    const cron = buildCron(
      String(Number(minute)).padStart(2, "0"),
      String(Number(hour)).padStart(2, "0"),
      frequency
    );
    onSubmit(cron);
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
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Update Data Sync Schedule
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time of Day <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                max={23}
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-16 px-2 py-1 border rounded dark:bg-gray-700 dark:text-gray-100"
                disabled={loading}
                placeholder="HH"
              />
              <span className="self-center">:</span>
              <input
                type="number"
                min={0}
                max={59}
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="w-16 px-2 py-1 border rounded dark:bg-gray-700 dark:text-gray-100"
                disabled={loading}
                placeholder="MM"
              />
              <span className="self-center text-gray-500 dark:text-gray-400">24-hour format</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Frequency <span className="text-red-500">*</span>
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-gray-100"
              disabled={loading}
            >
              {frequencyOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {(localError || error) && (
            <div className="text-red-500 text-sm">{localError || error}</div>
          )}
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

export default UpdateConfigModal;