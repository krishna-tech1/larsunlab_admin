"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Bell,
  Plus,
  MapPin,
  Calendar,
  Pencil,
  Trash2,
  Eye,
  X,
  Upload,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function EventsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [openModal, setOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    endDate: "",
    type: "Conference",
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [removeImageIds, setRemoveImageIds] = useState<string[]>([]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`);
      const data = await response.json();
      if (response.ok) {
        setEvents(data);
      }
    } catch (error) {
      console.error("Fetch events error:", error);
      toast.error("Failed to load events");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getAuthHeader = () => {
    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find((row) => row.startsWith("admin-token="));
    const token = tokenCookie ? tokenCookie.split("=")[1] : "";
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (selectedImages.length + existingImages.length + files.length > 5) {
        toast.error("You can only upload up to 5 images");
        return;
      }
      setSelectedImages([...selectedImages, ...files]);

      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews([...imagePreviews, ...newPreviews]);
    }
  };

  const removeSelectedImage = (index: number) => {
    const updatedImages = [...selectedImages];
    updatedImages.splice(index, 1);
    setSelectedImages(updatedImages);

    const updatedPreviews = [...imagePreviews];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    setImagePreviews(updatedPreviews);
  };

  const removeExistingImage = (id: string) => {
    setRemoveImageIds([...removeImageIds, id]);
    setExistingImages(existingImages.filter(img => img.id !== id));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.date || !form.location || !form.description || !form.type) {
      toast.error("All event details must be provided");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("location", form.location);
      formData.append("date", form.date);
      if (form.endDate) {
        if (new Date(form.endDate) < new Date(form.date)) {
          toast.error("End date cannot be earlier than start date");
          setLoading(false);
          return;
        }
        formData.append("endDate", form.endDate);
      }
      formData.append("type", form.type);

      selectedImages.forEach((file) => {
        formData.append("images", file);
      });

      if (editId && removeImageIds.length > 0) {
        formData.append("removeImageIds", JSON.stringify(removeImageIds));
      }

      const url = editId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/events/${editId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/events`;
      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getAuthHeader(),
        body: formData,
      });

      if (response.ok) {
        toast.success(editId ? "Event updated" : "Event created");
        setOpenModal(false);
        resetForm();
        fetchEvents();
      } else {
        const err = await response.json();
        toast.error(err.error || "Operation failed");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      location: "",
      date: "",
      endDate: "",
      type: "Conference",
    });
    setSelectedImages([]);
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews([]);
    setExistingImages([]);
    setRemoveImageIds([]);
    setEditId(null);
  };

  const handleEdit = (event: any) => {
    setForm({
      title: event.title,
      description: event.description || "",
      location: event.location,
      date: event.date,
      endDate: event.endDate || "",
      type: event.type,
    });
    setExistingImages(event.images || []);
    setRemoveImageIds([]);
    setSelectedImages([]);
    setImagePreviews([]);
    setEditId(event.id);
    setOpenModal(true);
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${deleteId}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      if (response.ok) {
        toast.success("Event deleted");
        fetchEvents();
      }
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setDeleteId(null);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "Conference": return "bg-[#2B176F]/10 text-[#2B176F] border-[#2B176F]/20";
      case "Seminar": return "bg-orange-50 text-orange-600 border-orange-200";
      case "Exhibition": return "bg-blue-50 text-blue-600 border-blue-200";
      default: return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const filteredEvents = activeFilter === "All"
    ? events
    : events.filter((e) => e.type === activeFilter);

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="p-6 bg-[#F6F7FB] min-h-screen">
      {/* TOP HEADER */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center mb-8 gap-4 md:gap-0">
        <div className="flex items-center bg-white px-5 py-2.5 rounded-xl shadow-sm w-full md:w-[400px] ring-1 ring-gray-100">
          <Search size={18} className="text-gray-400 mr-3" />
          <input
            placeholder="Search scientific events..."
            className="outline-none text-sm w-full bg-transparent text-gray-700 placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-5 w-full md:w-auto justify-end">
          <div className="bg-white p-2.5 rounded-xl shadow-sm ring-1 ring-gray-100 relative hidden md:block">
            <Bell size={20} className="text-gray-500" />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-[#2B176F]">Scientific Admin</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Cloud Connected</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-[#2B176F] to-[#4B2FD1] rounded-xl flex items-center justify-center text-white font-bold shrink-0">L</div>
          </div>
        </div>
      </div>

      {/* TITLE SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-5 md:gap-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 bg-[#F97316] rounded-full"></div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#2B176F]">Events Hub</h1>
          </div>
          <p className="text-sm text-gray-500 max-w-[600px] leading-relaxed">
            Organize clinical seminars, global conferences, and laboratory exhibitions.
            Sync breakthroughs with the Larsun Labs global network.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setOpenModal(true);
          }}
          className="w-full md:w-auto justify-center bg-gradient-to-r from-[#2B176F] to-[#4B2FD1] text-white px-6 py-3 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
        >
          <Plus size={20} /> Schedule New Event
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-2 rounded-2xl shadow-sm ring-1 ring-gray-100 gap-4 md:gap-0">
        <div className="flex gap-1 overflow-x-auto w-full md:w-auto hide-scrollbar">
          {["All", "Conference", "Seminar", "Exhibition"].map((item) => (
            <button
              key={item}
              onClick={() => {
                setActiveFilter(item);
                setCurrentPage(1);
              }}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeFilter === item
                ? "bg-[#2B176F] text-white shadow-md shadow-indigo-100"
                : "text-gray-500 hover:bg-gray-50"
                }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="pr-4 hidden md:block">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            Online Tracker: {events.length} Events
          </div>
        </div>
      </div>

      {/* EVENTS GRID */}
      {fetching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-[24px] h-[340px] animate-pulse ring-1 ring-gray-100" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-[32px] p-20 text-center ring-1 ring-gray-100 border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-[#2B176F] mb-2">No Scheduled Events</h3>
          <p className="text-gray-400 max-w-[300px] mx-auto text-sm">Create a new scientific gathering to share breakthroughs with your audience.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedEvents.map((e) => (
            <motion.div
              layout
              key={e.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[24px] overflow-hidden shadow-sm ring-1 ring-gray-100 group hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <div className="relative h-[180px]">
                <Image
                  src={e.images?.[0]?.url || "/events/placeholder.jpg"}
                  alt={e.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw, 25vw"
                  style={{ width: "100%", height: "100%" }}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <span className={`absolute top-4 left-4 text-[10px] px-3 py-1 font-bold rounded-lg border backdrop-blur-md ${getBadgeColor(e.type)}`}>
                  {e.type.toUpperCase()}
                </span>

                <div className="absolute top-4 right-4 flex gap-2 translate-y-0 opacity-100 md:translate-y-2 md:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <Link
                    href={`${process.env.NEXT_PUBLIC_USER_SITE_URL || "http://localhost:3001"}/eventss/${e.id}`}
                    target="_blank"
                    className="p-2 bg-white/90 rounded-lg text-gray-700 hover:text-[#2B176F] shadow-sm transition"
                  >
                    <Eye size={14} />
                  </Link>
                  <button
                    onClick={() => handleEdit(e)}
                    className="p-2 bg-white/90 rounded-lg text-gray-700 hover:text-orange-500 shadow-sm transition"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => confirmDelete(e.id)}
                    className="p-2 bg-white/90 rounded-lg text-gray-700 hover:text-red-500 shadow-sm transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white text-[10px] font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex -space-x-1.5">
                    {e.images?.length > 1 && Array(Math.min(e.images.length - 1, 3)).fill(0).map((_, idx) => (
                      <div key={idx} className="w-5 h-5 rounded-full border border-white bg-gray-600 flex items-center justify-center text-[8px]">
                        +{idx + 1}
                      </div>
                    ))}
                  </div>
                  <span>{e.images?.length} Gallery Images</span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-[#2B176F] text-lg mb-3 line-clamp-1 truncate">
                  {e.title}
                </h3>

                <div className="space-y-2 text-xs text-gray-500 mb-4 font-medium">
                  <p className="flex items-center gap-2">
                    <MapPin size={14} className="text-orange-500" />
                    {e.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar size={14} className="text-orange-500" />
                    {e.endDate ? `${e.date} - ${e.endDate}` : e.date}
                  </p>
                </div>

                <p className="text-[11px] text-gray-400 line-clamp-2 h-8 leading-relaxed mb-4">
                  {e.description || "No description provided for this scientific clinical gathering."}
                </p>

                <button
                  onClick={() => handleEdit(e)}
                  className="w-full py-2.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold hover:bg-[#2B176F] hover:text-white transition-colors"
                >
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {filteredEvents.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-4 mt-12 bg-white w-fit mx-auto px-6 py-3 rounded-2xl shadow-sm ring-1 ring-gray-100">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30"
          >
            ‹
          </button>

          <div className="flex gap-2">
            {Array.from({ length: Math.ceil(filteredEvents.length / itemsPerPage) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-9 h-9 rounded-xl font-bold text-sm transition-all ${currentPage === i + 1 ? "bg-[#2B176F] text-white shadow-md" : "text-gray-400 hover:bg-gray-50"
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            disabled={currentPage === Math.ceil(filteredEvents.length / itemsPerPage)}
            onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(filteredEvents.length / itemsPerPage)))}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30"
          >
            ›
          </button>
        </div>
      )}

      {/* MODAL */}
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
              className="bg-white rounded-[32px] w-full max-w-[640px] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* MODAL HEADER */}
              <div className="bg-gradient-to-r from-[#2B176F] to-[#4B2FD1] px-6 py-6 md:px-10 md:py-8 text-white relative">
                <button
                  onClick={() => setOpenModal(false)}
                  className="absolute top-6 right-6 md:right-8 text-white/50 hover:text-white transition"
                >
                  <X size={24} />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/10 rounded-[20px] flex items-center justify-center backdrop-blur-md">
                    <Calendar size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {editId ? "Refine Event" : "Schedule Event"}
                    </h2>
                    <p className="text-sm text-white/60 font-medium">Coordinate your global clinical network</p>
                  </div>
                </div>
              </div>

              {/* MODAL BODY */}
              <div className="px-6 py-6 md:p-10 space-y-8 overflow-y-auto custom-scrollbar">

                {/* SECTION 1: BASICS */}
                <div className="space-y-5">
                  <div className="flex gap-2 items-center text-[#2B176F] font-bold text-xs uppercase tracking-widest mb-2">
                    <Info size={14} /> Basic Information
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                      <div className="flex justify-between items-center mb-2 ml-1">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Event Title</label>
                        <span className={`text-[9px] font-black ${form.title.length >= 70 ? 'text-red-500' : 'text-gray-400'}`}>
                          {form.title.length}/70
                        </span>
                      </div>
                      <input
                        value={form.title}
                        maxLength={70}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Molecular Frontiers 2024"
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-[#2B176F]/20 outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2 ml-1">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Regional Location</label>
                        <span className={`text-[9px] font-black ${form.location.length >= 40 ? 'text-red-500' : 'text-gray-400'}`}>
                          {form.location.length}/40
                        </span>
                      </div>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-4 top-4 text-orange-500" />
                        <input
                          value={form.location}
                          maxLength={40}
                          onChange={(e) => setForm({ ...form, location: e.target.value })}
                          placeholder="e.g. Trichy Hub"
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-[#2B176F]/20 outline-none transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Start Date</label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-4 top-4 text-orange-500" />
                        <input
                          type="date"
                          value={form.date}
                          onChange={(e) => setForm({ ...form, date: e.target.value })}
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#2B176F]/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">End Date (Optional)</label>
                      <div className="relative">
                        <Calendar size={16} className="absolute left-4 top-4 text-orange-500" />
                        <input
                          type="date"
                          value={form.endDate}
                          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                          className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#2B176F]/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: DESCRIPTION & TYPE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-1">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Classification</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-[#2B176F]/20 outline-none appearance-none cursor-pointer"
                    >
                      <option value="Conference">Conference</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Exhibition">Exhibition</option>
                    </select>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <div className="flex justify-between items-center mb-2 ml-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Event Essence (Description)</label>
                      <span className={`text-[9px] font-black ${form.description.length >= 1000 ? 'text-red-500' : 'text-gray-400'}`}>
                        {form.description.length}/1000
                      </span>
                    </div>
                    <textarea
                      value={form.description}
                      maxLength={1000}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Highlight the clinical breakthroughs being presented..."
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-[#2B176F]/20 outline-none resize-none min-h-[100px] whitespace-pre-wrap placeholder:text-gray-400"
                      rows={4}
                    />
                  </div>
                </div>

                {/* SECTION 3: IMAGE GALLERY */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Scientific Asset Gallery (Max 5)</label>
                    <span className={`text-[10px] font-extrabold ${selectedImages.length + existingImages.length === 5 ? 'text-red-500' : 'text-gray-400'}`}>
                      {selectedImages.length + existingImages.length}/5 UPLOADED
                    </span>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {/* EXISTING IMAGES */}
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden ring-1 ring-gray-100 shadow-sm border-2 border-white group">
                        <Image src={img.url} alt="existing" fill sizes="10vw" style={{ width: "100%", height: "100%" }} className="object-cover" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button
                          onClick={() => removeExistingImage(img.id)}
                          className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition shadow-sm"
                        >
                          <X size={10} />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-green-500/80 px-1 rounded text-[8px] text-white font-bold">Saved</div>
                      </div>
                    ))}

                    {/* NEW PREVIEWS */}
                    {imagePreviews.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-2xl overflow-hidden ring-1 ring-gray-100 shadow-sm border-2 border-white group">
                        <Image src={url} alt="preview" fill sizes="10vw" style={{ width: "100%", height: "100%" }} className="object-cover" />
                        <button
                          onClick={() => removeSelectedImage(i)}
                          className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={10} />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-orange-500/80 px-1 rounded text-[8px] text-white font-bold">New</div>
                      </div>
                    ))}

                    {selectedImages.length + existingImages.length < 5 && (
                      <label className="aspect-square flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all group">
                        <Upload size={18} className="text-gray-400 group-hover:text-orange-500 mb-1" />
                        <span className="text-[8px] font-bold text-gray-400 uppercase">Attach</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="px-6 py-6 md:px-10 md:py-8 bg-gray-50 border-t flex gap-4">
                <button
                  disabled={loading}
                  onClick={() => setOpenModal(false)}
                  className="flex-1 py-4 text-sm font-bold text-gray-500 bg-white ring-1 ring-gray-200 rounded-2xl hover:bg-gray-100 transition disabled:opacity-50"
                >
                  Discard Changes
                </button>
                <button
                  disabled={loading}
                  onClick={handleSubmit}
                  className="flex-[1.5] py-4 text-sm font-extrabold text-white bg-gradient-to-r from-[#2B176F] to-[#4B2FD1] rounded-2xl hover:shadow-xl hover:shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <> {editId ? "Sync Updates" : "Broadcast Event"} </>
                  )}
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
                  <X size={20} />
                </button>
                <div className="w-20 h-20 bg-red-50 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100 rotate-3">
                  <Trash2 size={32} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-[#2B176F] mb-3">Cancel Event?</h3>
                <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-[280px] mx-auto">
                  Are you absolutely certain? This event and its gallery files will be permanently purged.
                </p>
              </div>
              <div className="flex gap-4 px-8 py-6 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3.5 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition shadow-sm"
                >
                  Keep Event
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3.5 text-sm font-black text-white bg-red-500 rounded-xl hover:bg-red-600 transition tracking-wide shadow-md shadow-red-200 active:scale-[0.98]"
                >
                  Yes, Cancel It
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
