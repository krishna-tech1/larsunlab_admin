"use client";

import {
  Search,
  Bell,
  Plus,
  MapPin,
  Clock,
  Pencil,
  Trash2,
  X as CloseIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    location: "",
    exp: "",
    type: "Full Time",
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const getAuthHeader = () => {
    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find((row) => row.startsWith("admin-token="));
    const token = tokenCookie ? tokenCookie.split("=")[1] : "";
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`);
      const data = await response.json();
      if (response.ok) {
        setJobs(data);
      }
    } catch (error) {
      console.error("Fetch jobs error:", error);
      toast.error("Failed to load clinical postings");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // ➕ ADD / UPDATE
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const url = editId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${editId}` 
        : `${process.env.NEXT_PUBLIC_API_URL}/api/jobs`;
      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getAuthHeader(),
        body: JSON.stringify(form),
      });

      if (response.ok) {
        toast.success(editId ? "Position refined" : "Position broadcasted");
        fetchJobs();
        setOpenModal(false);
        resetForm();
      } else {
        const err = await response.json();
        toast.error(err.error || "Operation failed");
      }
    } catch (error) {
      toast.error("Network synchronization error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      location: "",
      exp: "",
      type: "Full Time",
    });
    setErrors({});
    setEditId(null);
  };

  // ✏️ EDIT OPEN
  const handleEdit = (job: any) => {
    setForm({
      title: job.title,
      location: job.location,
      exp: job.exp,
      type: job.type,
    });
    setEditId(job.id);
    setOpenModal(true);
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${deleteId}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      if (response.ok) {
        toast.success("Posting removed");
        fetchJobs();
      }
    } catch (error) {
        toast.error("Failed to delete posting");
    } finally {
        setDeleteId(null);
    }
  };

  // 🔁 TOGGLE STATUS
  const toggleStatus = async (job: any) => {
    const newStatus = job.status === "ACTIVE" ? "DRAFT" : "ACTIVE";
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs/${job.id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        fetchJobs();
      }
    } catch (error) {
        toast.error("Status update failed");
    }
  };

  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    let newErrors: any = {};

    if (!form.title) newErrors.title = "Job name is required";
    if (!form.location) newErrors.location = "Location is required";
    if (!form.exp) newErrors.exp = "Experience is required";
    if (!form.type) newErrors.type = "Contract type is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      {/* TOP NAVBAR */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center mb-10 gap-4 md:gap-0">
        <div className="flex items-center bg-white px-5 py-2.5 rounded-xl shadow-sm w-full md:w-[450px] ring-1 ring-gray-100">
          <Search size={18} className="mr-3 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="outline-none text-sm w-full bg-transparent font-medium text-gray-700 placeholder:text-gray-400"
            placeholder="Search roles or locations..."
          />
        </div>

        <div className="flex gap-6 items-center w-full md:w-auto justify-end">
          <div className="bg-white p-2.5 rounded-xl shadow-sm ring-1 ring-gray-100 relative hidden md:block">
             <Bell size={20} className="text-gray-500" />
             <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-[#2B176F]">Pharma Admin</p>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">System Active</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-[#2B176F] to-[#4B2FD1] rounded-xl flex items-center justify-center text-white font-bold shrink-0">L</div>
          </div>
        </div>
      </div>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-5 md:gap-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#2B176F]">Careers Center</h1>
          </div>
          <p className="text-sm text-gray-500 max-w-[600px] leading-relaxed">
            Architect your clinical future. Register new positions, monitor recruitment status, and expand your scientific workforce globally.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setOpenModal(true);
          }}
          className="w-full md:w-auto justify-center bg-gradient-to-r from-[#2B176F] to-[#4B2FD1] text-white px-8 py-4 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
        >
          <Plus size={20} /> Register New Job
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="space-y-6">
        {fetching ? (
          <div className="space-y-4">
             {[1,2,3].map(n => (
               <div key={n} className="h-24 bg-white rounded-[24px] animate-pulse ring-1 ring-gray-100" />
             ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-[40px] p-24 text-center ring-1 ring-gray-100 border-2 border-dashed border-gray-200">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <Search size={48} className="text-gray-200" />
             </div>
             <h3 className="text-2xl font-bold text-[#2B176F] mb-3">Postings Database Empty</h3>
             <p className="text-gray-400 max-w-[400px] mx-auto text-base leading-relaxed">Prepare for clinical expansion by registering your first job opening in the Larsun Labs network.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {paginatedJobs.map((job) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-[24px] px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm ring-1 ring-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 gap-6 md:gap-0"
                >
                  <div className="flex flex-col md:flex-row md:gap-6 items-start md:items-center w-full md:w-auto">
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center text-2xl shadow-inner border border-indigo-50 shrink-0">
                        🧪
                      </div>
                      <h3 className="text-xl font-bold text-[#2B176F] md:hidden">
                        {job.title}
                      </h3>
                    </div>

                    <div className="mt-4 md:mt-0 w-full md:w-auto">
                      <h3 className="text-xl font-bold text-[#2B176F] mb-2 hidden md:block">
                        {job.title}
                      </h3>

                      <div className="flex flex-wrap gap-4 md:gap-6 text-[13px] text-gray-500 font-medium">
                        <span className="flex items-center gap-2">
                          <MapPin size={14} className="text-orange-500" /> {job.location}
                        </span>
                        <span className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-300 rounded-full" /> {job.exp}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock size={14} className="text-blue-500" /> {job.type}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] px-4 py-1 rounded-full mt-4 md:mt-0 md:ml-4 font-black uppercase tracking-widest inline-block ${
                        job.status === "ACTIVE"
                          ? "bg-green-100 text-green-600 border border-green-200"
                          : "bg-gray-100 text-gray-500 border border-gray-200"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 md:gap-10 w-full md:w-auto justify-between md:justify-end pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 mt-2 md:mt-0">
                    <div className="flex gap-4 md:gap-6 text-gray-300 border-r border-gray-100 pr-4 md:pr-10">
                      <Pencil
                        onClick={() => handleEdit(job)}
                        className="cursor-pointer hover:text-[#2B176F] transition-colors"
                        size={20}
                      />
                      <Trash2
                        onClick={() => confirmDelete(job.id)}
                        className="cursor-pointer hover:text-red-500 transition-colors"
                        size={20}
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-[#2B176F] uppercase tracking-tighter">
                        {job.status === "ACTIVE" ? "UNPUBLISH" : "PUBLISH"}
                      </span>

                      <div
                        onClick={() => toggleStatus(job)}
                        className={`w-12 h-6 flex items-center rounded-full p-[2px] cursor-pointer transition-all duration-300 ${
                          job.status === "ACTIVE" ? "bg-[#2B176F]" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`bg-white w-5 h-5 rounded-full shadow-lg transform transition-transform duration-300 ${
                            job.status === "ACTIVE"
                              ? "translate-x-6"
                              : "translate-x-0"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="flex justify-between items-center py-8">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                Portfolio: {jobs.length} Positions Tracked
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white ring-1 ring-gray-100 text-gray-500 hover:bg-[#2B176F] hover:text-white transition-all shadow-sm disabled:opacity-30"
                  disabled={currentPage === 1}
                >
                  ‹
                </button>

                {Array.from({
                  length: Math.ceil(jobs.length / itemsPerPage),
                }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                      currentPage === i + 1
                        ? "bg-[#2B176F] text-white shadow-lg shadow-indigo-100"
                        : "bg-white text-gray-600 ring-1 ring-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(p + 1, Math.ceil(jobs.length / itemsPerPage)),
                    )
                  }
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white ring-1 ring-gray-100 text-gray-500 hover:bg-[#2B176F] hover:text-white transition-all shadow-sm disabled:opacity-30"
                  disabled={currentPage === Math.ceil(jobs.length / itemsPerPage)}
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* NEW PREMIUM MODAL */}
      <AnimatePresence>
        {openModal && (
          <motion.div
            className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 40, opacity: 0 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
              className="bg-white rounded-[32px] w-full max-w-[500px] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* MODAL HEADER */}
              <div className="bg-gradient-to-r from-[#2B176F] to-[#4B2FD1] px-6 py-6 md:px-10 md:py-8 text-white relative">
                <button 
                   onClick={() => setOpenModal(false)}
                   className="absolute top-6 right-6 md:right-8 text-white/50 hover:text-white transition"
                >
                   <CloseIcon size={24} />
                </button>
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-white/10 rounded-[20px] flex items-center justify-center backdrop-blur-md">
                      <Plus size={28} />
                   </div>
                   <div>
                      <h2 className="text-2xl font-bold">
                        {editId !== null ? "Refine Position" : "Register Position"}
                      </h2>
                      <p className="text-sm text-white/60 font-medium">Recruitment Asset Management</p>
                   </div>
                </div>
              </div>

              {/* MODAL BODY */}
              <div className="px-6 py-6 md:p-10 space-y-6">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Job Name / Title</label>
                  <input
                    value={form.title}
                    maxLength={500}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Senior Medical Consultant"
                    className={`w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-[#2B176F]/20 outline-none transition-all placeholder:font-medium placeholder:text-gray-400 ${
                      errors.title ? "ring-2 ring-red-500/20" : ""
                    }`}
                  />
                  {errors.title && <p className="text-[10px] text-red-500 mt-2 ml-1 font-bold">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Experience</label>
                    <input
                      value={form.exp}
                      maxLength={500}
                      onChange={(e) => setForm({ ...form, exp: e.target.value })}
                      placeholder="e.g. 5+ Years"
                      className={`w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-[#2B176F]/20 outline-none transition-all placeholder:text-gray-400 ${
                        errors.exp ? "ring-2 ring-red-500/20" : ""
                      }`}
                    />
                    {errors.exp && <p className="text-[10px] text-red-500 mt-2 ml-1 font-bold">{errors.exp}</p>}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Location</label>
                    <input
                      value={form.location}
                      maxLength={500}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. Remote"
                      className={`w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-[#2B176F]/20 outline-none transition-all placeholder:text-gray-400 ${
                        errors.location ? "ring-2 ring-red-500/20" : ""
                      }`}
                    />
                    {errors.location && <p className="text-[10px] text-red-500 mt-2 ml-1 font-bold">{errors.location}</p>}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Contract Classification</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {["Full Time", "Part Time", "Contract"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm({ ...form, type })}
                        className={`py-3 rounded-xl text-xs font-bold transition-all border-2 ${
                          form.type === type 
                            ? "border-[#2B176F] bg-[#2B176F]/5 text-[#2B176F]" 
                            : "border-gray-50 bg-gray-50 text-gray-400"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="px-6 py-6 md:px-10 md:py-8 bg-gray-50 border-t flex gap-4">
                <button
                  onClick={() => setOpenModal(false)}
                  className="flex-1 py-4 text-sm font-bold text-gray-400 bg-white ring-1 ring-gray-100 rounded-2xl hover:bg-gray-100 transition shadow-sm"
                  disabled={loading}
                >
                  Discard
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-[1.5] py-4 text-sm font-extrabold text-white bg-gradient-to-r from-[#2B176F] to-[#4B2FD1] rounded-2xl hover:shadow-xl hover:shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "Synchronizing..." : editId !== null ? "Sync Updates" : "Broadcast Job"}
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
                  <CloseIcon size={20} />
                </button>
                <div className="w-20 h-20 bg-red-50 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100 rotate-3">
                  <Trash2 size={32} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-[#2B176F] mb-3">Remove Listing?</h3>
                <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-[280px] mx-auto">
                  Are you absolutely certain? This job posting will be fully unpublished and permanently purged.
                </p>
              </div>
              <div className="flex gap-4 px-8 py-6 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3.5 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition shadow-sm"
                >
                  Keep Role
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
