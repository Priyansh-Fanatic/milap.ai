import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

const UpdateProfile = () => {
  const [form, setForm] = useState({ name: ""});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("token");
    if (!storedUser || !token) {
      navigate("/login");
      return;
    }
    try {
      const user = JSON.parse(storedUser);
      setForm({
        name: user.name || ""
      });
    } catch (err) {
      sessionStorage.clear();
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "adhaarNumber" ? value.replace(/\D/g, '').slice(0, 12) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!form.name) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(`${API_URL}/update-profile`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUser = { ...JSON.parse(sessionStorage.getItem("user")), ...response.data.user };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-1" htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {error && <div className="text-red-600 dark:text-red-400 text-center text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
        <button
          className="mt-4 w-full py-2 px-4 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          onClick={() => navigate("/profile")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default UpdateProfile; 