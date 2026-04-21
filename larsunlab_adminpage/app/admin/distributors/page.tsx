"use client";

import { useState } from "react";
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  MapPin,
  User,
  Pencil,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useEffect } from "react";
import toast from "react-hot-toast";

export default function DistributorsPage() {
  const [openRegion, setOpenRegion] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [distributors, setDistributors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    region: "",
  });

  // Fetch distributors from backend
  const fetchDistributors = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/distributors`);
      const data = await response.json();
      if (response.ok) {
        setDistributors(data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load distributors");
    }
  };

  useEffect(() => {
    fetchDistributors();
  }, []);

  // Helper to get auth header
  const getAuthHeader = () => {
    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find((row) => row.startsWith("admin-token="));
    const token = tokenCookie ? tokenCookie.split("=")[1] : "";
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // ================= ADD / UPDATE =================
  const handleSubmit = async () => {
    if (!form.name || !form.region) {
      toast.error("District and Company Name are mandatory");
      return;
    }

    setLoading(true);
    try {
      const url = editId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/distributors/${editId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/distributors`;
      const method = editId ? "PUT" : "POST";

      // Normalize region to Title Case (e.g. chennai -> Chennai) to avoid duplicates
      const normalizedRegion = form.region.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      const submissionData = { ...form, region: normalizedRegion };

      const response = await fetch(url, {
        method,
        headers: getAuthHeader(),
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        toast.success(
          editId
            ? "Distributor updated successfully"
            : "Distributor added successfully",
        );
        setOpenModal(false);
        setEditId(null);
        setForm({
          name: "",
          region: "",
        });
        fetchDistributors();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Operation failed");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ================= EDIT =================
  const handleEdit = (dist: any) => {
    setForm({
      name: dist.name,
      region: dist.region,
    });
    setEditId(dist.id);
    setOpenModal(true);
  };

  // ================= DELETE =================
  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/distributors/${deleteId}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });

      if (response.ok) {
        toast.success("Distributor deleted");
        fetchDistributors();
      } else {
        toast.error("Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Something went wrong");
    } finally {
      setDeleteId(null);
    }
  };

  // Group distributors by region for display
  const groupedDistributors = distributors.reduce((acc: any, dist: any) => {
    // Normalize region key (Title Case) so chennai and Chennai group together
    const regionKey = dist.region.trim().split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    if (!acc[regionKey]) {
      acc[regionKey] = [];
    }
    acc[regionKey].push(dist);
    return acc;
  }, {});

  return (
    <div className="p-6 bg-[#F6F7FB] min-h-screen">
      {/* TOP BAR */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
        <div className="flex items-center bg-white px-4 py-2 rounded-md shadow-sm w-full md:w-[420px]">
          <Search size={16} className="text-gray-400 mr-2" />
          <input
            placeholder="Search distributors, region, contacts..."
            className="outline-none text-sm w-full text-gray-700 placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <Bell size={18} className="text-gray-500 hidden md:block" />
          <div className="text-right">
            <p className="text-sm font-medium text-[#2B176F]">
              Larsun Labs Admin
            </p>
            <p className="text-xs text-gray-400">Session: 4h 12m</p>
          </div>
        </div>
      </div>

      {/* TITLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-[4px] h-[22px] bg-orange-500"></div>
            <h1 className="text-[30px] font-bold text-[#2B176F]">
              Distributors
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage and organize regional distribution partners across Tamil
            Nadu.
          </p>
        </div>

        <button
          onClick={() => {
            setForm({
              name: "",
              region: "",
            });
            setEditId(null);
            setOpenModal(true);
          }}
          className="w-full md:w-auto justify-center bg-[#F97316] text-white px-5 py-2.5 rounded-md flex items-center gap-2 text-sm font-medium hover:bg-orange-600 transition shrink-0"
        >
          <Plus size={16} /> Add Distributor
        </button>
      </div>

      {/* REGIONS */}
      <div className="space-y-4">
        {Object.keys(groupedDistributors).length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
            <MapPin size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No distributors found</p>
            <p className="text-sm">Click "Add Distributor" to get started</p>
          </div>
        ) : (
          Object.keys(groupedDistributors).sort().map((regionName) => {
            const regionDistributors = groupedDistributors[regionName];
            return (
              <div key={regionName} className="bg-white rounded-xl border">
                {/* HEADER */}
                <div
                  onClick={() =>
                    setOpenRegion(openRegion === regionName ? "" : regionName)
                  }
                  className="flex justify-between items-center px-5 py-4 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[#F3F4F6] p-2 rounded-md">
                      <MapPin size={16} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#2B176F]">
                        {regionName} Region
                      </p>
                      <p className="text-xs text-gray-400">
                        {regionDistributors.length} active distributors
                      </p>
                    </div>
                  </div>

                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ease-in-out ${openRegion === regionName ? "rotate-180" : ""
                      }`}
                  />
                </div>

                {/* CONTENT */}
                <AnimatePresence mode="wait">
                  {openRegion === regionName && (
                    <motion.div
                      key={regionName}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="px-5 pb-5"
                    >
                      <motion.div
                        initial="hidden"
                        animate="show"
                        exit="hidden"
                        variants={{
                          hidden: {},
                          show: {
                            transition: {
                              staggerChildren: 0.08,
                            },
                          },
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      >
                        {regionDistributors.map((d: any, i: number) => (
                          <motion.div
                            key={d.id || i}
                            variants={{
                              hidden: { opacity: 0, y: 10 },
                              show: { opacity: 1, y: 0 },
                            }}
                            transition={{ duration: 0.25 }}
                            className="border rounded-xl p-4 relative bg-white transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-[2px]"
                          >
                            {/* ACTIONS */}
                            <div className="absolute right-3 top-3 flex gap-2 text-gray-400">
                              <Pencil
                                size={14}
                                className="cursor-pointer hover:scale-110 transition"
                                onClick={() => handleEdit(d)}
                              />
                              <Trash2
                                size={14}
                                className="cursor-pointer text-red-400 hover:scale-110 transition"
                                onClick={() => confirmDelete(d.id)}
                              />
                            </div>

                            <p className="font-semibold text-[#2B176F] mb-1 truncate pr-12">
                              {d.name}
                            </p>
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {openModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 40, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-xl"
            >
              {/* HEADER */}
              <div className="bg-gradient-to-r from-[#2B176F] to-[#4B2FD1] px-8 py-6 text-white text-center">
                <h2 className="text-2xl font-bold">
                  {editId ? "Edit Distributor" : "Add Distributor"}
                </h2>
                <p className="text-sm opacity-80 mt-1">
                  Connect precision healthcare to regional partners
                </p>
              </div>

              {/* BODY */}
              <div className="p-8 space-y-5">
                {/* DISTRICT / REGION */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#2B176F] uppercase tracking-wider">
                      District (Region)
                    </label>
                    <span className={`text-[10px] ${form.region.length === 500 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                      {form.region.length}/500
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      maxLength={500}
                      placeholder="e.g., Chennai"
                      value={form.region}
                      className="w-full px-4 py-3 bg-[#F3F4F6] border-none rounded-xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-orange-400 outline-none pr-16 placeholder:text-gray-400"
                      onChange={(e) => setForm({ ...form, region: e.target.value })}
                    />
                    <span className="absolute right-4 top-3.2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      Region
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {/* COMPANY NAME */}
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#2B176F] uppercase tracking-wider">
                        Company Name
                      </label>
                      <span className={`text-[10px] ${form.name.length === 500 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                        {form.name.length}/500
                      </span>
                    </div>
                    <input
                      maxLength={500}
                      placeholder="e.g., Vinayaka Pharma"
                      value={form.name}
                      className="w-full px-4 py-3 bg-[#F3F4F6] border-none rounded-xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-orange-400 outline-none placeholder:text-gray-400"
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="flex gap-4 px-8 py-6 bg-gray-50 border-t rounded-b-2xl">
                <button
                  onClick={() => setOpenModal(false)}
                  className="flex-1 py-3 text-sm font-semibold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-3 text-sm font-bold text-white bg-[#FF7A00] rounded-xl hover:bg-[#E66E00] transition shadow-md shadow-orange-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {editId ? "Update Partner" : "Register Partner"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-[400px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center pt-10 relative">
                <button
                  onClick={() => setDeleteId(null)}
                  className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition"
                >
                  <MapPin size={20} />
                </button>
                <div className="w-20 h-20 bg-red-50 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100 rotate-3">
                  <Trash2 size={32} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-[#2B176F] mb-3">Remove Partner?</h3>
                <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-[280px] mx-auto">
                  Are you absolutely certain? This regional distributor will be permanently purged from the system.
                </p>
              </div>
              <div className="flex gap-4 px-8 py-6 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3.5 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition shadow-sm"
                >
                  Keep Partner
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3.5 text-sm font-black text-white bg-red-500 rounded-xl hover:bg-red-600 transition tracking-wide shadow-md shadow-red-200 active:scale-[0.98]"
                >
                  Yes, Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
