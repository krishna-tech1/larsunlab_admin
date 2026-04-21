"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Bell,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Upload,
  X as CloseIcon,
  Info,
  DollarSign,
  Package,
  Filter,
  Beaker,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const itemsPerPage = 8;
  const categories = [
    "All",
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Gastroenterology",
    "Diabetology",
    "Immunology",
  ];

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`);
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Fetch products error:", error);
      toast.error("Failed to load products");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const [form, setForm] = useState({
    name: "",
    description: "",
    packSize: "",
    dosage: "",
    modeOfAction: "",
    indication: "",
    usageInstruction: "",
    precautions: "",
    storage: "",
    disclaimer: "",
    category: "Cardiology",
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [removeImageIds, setRemoveImageIds] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);

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
      if (selectedImages.length + existingImages.length + files.length > 7) {
        toast.error("Total images cannot exceed 7");
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

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      packSize: "",
      dosage: "",
      modeOfAction: "",
      indication: "",
      usageInstruction: "",
      precautions: "",
      storage: "",
      disclaimer: "",
      category: "Cardiology",
    });
    setSelectedImages([]);
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews([]);
    setRemoveImageIds([]);
    setExistingImages([]);
    setEditId(null);
  };

  const handleSubmit = async () => {
    const isInvalid = !form.name || !form.category || !form.description || !form.packSize || !form.dosage || !form.modeOfAction || !form.indication || !form.usageInstruction || !form.precautions || !form.storage || !form.disclaimer;

    if (isInvalid) {
      toast.error("All clinical and logistics data points are mandatory");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("packSize", form.packSize);
      formData.append("dosage", form.dosage);
      formData.append("modeOfAction", form.modeOfAction);
      formData.append("indication", form.indication);
      formData.append("usageInstruction", form.usageInstruction);
      formData.append("precautions", form.precautions);
      formData.append("storage", form.storage);
      formData.append("disclaimer", form.disclaimer);
      formData.append("category", form.category);

      selectedImages.forEach((file) => {
        formData.append("images", file);
      });

      if (editId && removeImageIds.length > 0) {
        formData.append("removeImageIds", JSON.stringify(removeImageIds));
      }

      const url = editId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/products/${editId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/products`;
      const method = editId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getAuthHeader(),
        body: formData,
      });

      if (response.ok) {
        toast.success(editId ? "Product updated" : "Product created");
        setOpenModal(false);
        resetForm();
        fetchProducts();
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

  const handleEdit = (p: any) => {
    setForm({
      name: p.name,
      description: p.description || "",
      packSize: p.packSize || "",
      dosage: p.dosage || "",
      modeOfAction: p.modeOfAction || "",
      indication: p.indication || "",
      usageInstruction: p.usageInstruction || "",
      precautions: p.precautions || "",
      storage: p.storage || "",
      disclaimer: p.disclaimer || "",
      category: p.category,
    });
    setExistingImages(p.images || []);
    setRemoveImageIds([]);
    setSelectedImages([]);
    setImagePreviews([]);
    setEditId(p.id);
    setOpenModal(true);
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${deleteId}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      if (response.ok) {
        toast.success("Product deleted");
        fetchProducts();
      }
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setDeleteId(null);
    }
  };

  const filteredProducts = products.filter(p => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search);

    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="p-6 bg-[#F6F7FB] min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 md:gap-0">
        <div className="flex items-center bg-white px-5 py-2.5 rounded-xl shadow-sm w-full md:w-[400px] ring-1 ring-gray-100">
          <Search size={18} className="text-gray-400 mr-3 shrink-0" />
          <input
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search pharmaceutical..."
            className="outline-none text-sm w-full bg-transparent text-gray-700 placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <div className="bg-white p-2.5 rounded-xl shadow-sm ring-1 ring-gray-100 relative hidden md:block">
            <Bell size={20} className="text-gray-500" />
            <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-[#2B176F]">Pharma Admin</p>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide">Sync Live</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-[#2B176F] to-[#4B2FD1] rounded-xl flex items-center justify-center text-white font-bold shrink-0">L</div>
          </div>
        </div>
      </div>

      {/* DASHBOARD TITLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-5 md:gap-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-6 md:h-8 bg-[#F97316] rounded-full"></div>
            <h1 className="text-[28px] md:text-4xl font-extrabold text-[#2B176F]">Product Pipeline</h1>
          </div>
          <p className="text-sm text-gray-500 max-w-[500px] leading-relaxed">
            Curate and manage your pharmaceutical assets. Sync new breakthroughs directly to the distribution network.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setOpenModal(true);
          }}
          className="w-full md:w-auto bg-gradient-to-r from-[#2B176F] to-[#4B2FD1] text-white px-6 py-3.5 rounded-2xl flex justify-center items-center gap-3 text-sm font-bold shadow-lg shadow-indigo-100 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
        >
          <Plus size={20} /> Register New Molecule
        </button>
      </div>

      {/* CATEGORY FILTER */}
      <div className="flex justify-between items-center mb-8 bg-white p-2 rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-x-auto">
        <div className="flex gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${selectedCategory === cat
                ? "bg-[#2B176F] text-white shadow-md shadow-indigo-100"
                : "text-gray-500 hover:bg-gray-50"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="px-6 border-l border-gray-100 hidden md:block">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Filter size={14} /> Total Products: {products.length}
          </div>
        </div>
      </div>

      {/* PRODUCTS LIST */}
      {fetching ? (
        <div className="bg-white rounded-[32px] p-20 animate-pulse ring-1 ring-gray-100 min-h-[400px]" />
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-[32px] p-20 text-center ring-1 ring-gray-100 border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-[#2B176F] mb-2">No Molecules Registered</h3>
          <p className="text-gray-400 max-w-[300px] mx-auto text-sm">Every great clinical trial starts with a single entry. Add your first product today.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedProducts.map((p) => (
            <motion.div
              layout
              key={p.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[24px] overflow-hidden shadow-sm ring-1 ring-gray-100 group hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col h-full"
            >
              <div className="relative h-[220px]">
                <Image
                  src={p.images?.[0]?.url || "/products/placeholder.jpg"}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <span className="absolute top-4 left-4 text-[10px] px-3 py-1 font-bold rounded-lg border backdrop-blur-md bg-[#2B176F]/10 text-[#2B176F] border-[#2B176F]/20">
                  {p.category.toUpperCase()}
                </span>

                <div className="absolute top-4 right-4 flex gap-2 opacity-100 translate-y-0 md:opacity-0 md:translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <Link
                    href={`${process.env.NEXT_PUBLIC_USER_SITE_URL || "http://localhost:3001"}/products/${p.id}`}
                    target="_blank"
                    className="p-2.5 bg-white/90 rounded-xl text-gray-700 hover:text-[#2B176F] shadow-sm transition"
                  >
                    <Eye size={16} />
                  </Link>
                  <button
                    onClick={() => handleEdit(p)}
                    className="p-2.5 bg-white/90 rounded-xl text-gray-700 hover:text-orange-500 shadow-sm transition"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => confirmDelete(p.id)}
                    className="p-2.5 bg-white/90 rounded-xl text-gray-700 hover:text-red-500 shadow-sm transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white text-[10px] font-bold flex items-center gap-2 md:opacity-0 opacity-100 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/40 px-2 py-1 rounded-md backdrop-blur-md">
                    {p.images?.length} Product Visuals
                  </div>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="mb-3">
                  <h3 className="font-bold text-[#2B176F] text-xl line-clamp-1 truncate">
                    {p.name}
                  </h3>
                </div>

                <p className="text-xs text-gray-400 line-clamp-2 mb-4 font-medium italic">
                  "{p.description || "Synthesizing excellence through state-of-the-art laboratory clinical trials and molecular research."}"
                </p>

                <div className="mt-auto pt-4 border-t border-gray-50">
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-xs font-black text-[#2B176F] hover:text-orange-500 transition-colors uppercase tracking-widest"
                  >
                    View & Edit →
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {filteredProducts.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-2 md:gap-4 mt-12 bg-white w-fit mx-auto px-4 md:px-6 py-3 rounded-2xl shadow-sm ring-1 ring-gray-100">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30"
          >
            ‹
          </button>

          <div className="flex gap-2">
            {Array.from({ length: Math.ceil(filteredProducts.length / itemsPerPage) }).map((_, i) => (
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
            disabled={currentPage === Math.ceil(filteredProducts.length / itemsPerPage)}
            onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(filteredProducts.length / itemsPerPage)))}
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
              className="bg-white rounded-[32px] w-full max-w-[800px] max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
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
                    <Package size={28} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {editId ? "Update Molecule" : "Register Molecule"}
                    </h2>
                    <p className="text-sm text-white/60 font-medium">Precision Pharmaceutical Management</p>
                  </div>
                </div>
              </div>

              {/* MODAL BODY */}
              <div className="p-6 md:p-10 space-y-10 overflow-y-auto custom-scrollbar">

                {/* SECTION 1: IDENTITY & BASIC SPECS */}
                <div className="space-y-6">
                  <div className="flex gap-2 items-center text-[#2B176F] font-black text-[10px] uppercase tracking-[2px] mb-2 ml-1">
                    <Info size={14} /> Basic Identity & Logistics
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="col-span-2 md:col-span-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Molecule Name</label>
                      <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Cardiopress XL 50mg"
                        maxLength={500}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-[#2B176F]/20 outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
                      />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Pack Size</label>
                      <input
                        value={form.packSize}
                        onChange={(e) => setForm({ ...form, packSize: e.target.value })}
                        placeholder="e.g. 10x10 Tablets"
                        maxLength={500}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-[#2B176F]/20 outline-none transition-all placeholder:font-medium placeholder:text-gray-400"
                      />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Medical Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-[#2B176F]/20 outline-none appearance-none cursor-pointer"
                      >
                        {categories.filter(c => c !== "All").map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: CLINICAL DETAILS */}
                <div className="space-y-6">
                  <div className="flex gap-2 items-center text-[#2B176F] font-black text-[10px] uppercase tracking-[2px] mb-2 ml-1">
                    <Beaker size={14} className="text-[#2B176F]" /> Clinical Profile
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Dosage</label>
                      <textarea
                        value={form.dosage}
                        onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                        placeholder="Administration details..."
                        maxLength={5000}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-[#2B176F]/20 outline-none resize-none placeholder:text-gray-400"
                        rows={2}
                      />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Mode of Action</label>
                      <textarea
                        value={form.modeOfAction}
                        onChange={(e) => setForm({ ...form, modeOfAction: e.target.value })}
                        placeholder="How the molecule interacts..."
                        maxLength={5000}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-[#2B176F]/20 outline-none resize-none placeholder:text-gray-400"
                        rows={2}
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Indication</label>
                      <textarea
                        value={form.indication}
                        onChange={(e) => setForm({ ...form, indication: e.target.value })}
                        placeholder="What conditions is this for?"
                        maxLength={5000}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-[#2B176F]/20 outline-none resize-none placeholder:text-gray-400"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: USAGE & SAFETY */}
                <div className="space-y-6">
                  <div className="flex gap-2 items-center text-[#2B176F] font-black text-[10px] uppercase tracking-[2px] mb-2 ml-1">
                    <ShieldCheck size={14} className="text-[#2B176F]" /> Safety & Usage
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Usage Instruction</label>
                      <textarea
                        value={form.usageInstruction}
                        onChange={(e) => setForm({ ...form, usageInstruction: e.target.value })}
                        placeholder="Steps for patient use..."
                        maxLength={5000}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-[#2B176F]/20 outline-none resize-none placeholder:text-gray-400"
                        rows={2}
                      />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Precautions</label>
                      <textarea
                        value={form.precautions}
                        onChange={(e) => setForm({ ...form, precautions: e.target.value })}
                        placeholder="Warnings and risks..."
                        maxLength={5000}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-[#2B176F]/20 outline-none resize-none placeholder:text-gray-400"
                        rows={2}
                      />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Storage</label>
                      <textarea
                        value={form.storage}
                        onChange={(e) => setForm({ ...form, storage: e.target.value })}
                        placeholder="Temperature and environmental needs..."
                        maxLength={5000}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-[#2B176F]/20 outline-none resize-none placeholder:text-gray-400"
                        rows={2}
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Disclaimer</label>
                      <textarea
                        value={form.disclaimer}
                        onChange={(e) => setForm({ ...form, disclaimer: e.target.value })}
                        placeholder="Legal/medical disclaimer..."
                        maxLength={5000}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-[#2B176F]/20 outline-none resize-none italic placeholder:text-gray-400"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: WEB DESCRIPTION & GALLERY */}
                <div className="space-y-10 pt-4">
                  <div className="flex gap-2 items-center text-[#2B176F] font-black text-[10px] uppercase tracking-[2px] mb-2 ml-1">
                    <Eye size={14} className="text-[#2B176F]" /> Public Presentation
                  </div>

                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block ml-1">Web Description</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Detailed synthesis breakthroughs for public catalog..."
                      maxLength={5000}
                      className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-[#2B176F] focus:ring-2 focus:ring-[#2B176F]/20 outline-none resize-none min-h-[100px] placeholder:text-gray-400"
                      rows={3}
                    />
                  </div>

                  <div className="pt-6 border-t border-gray-50">
                    <div className="flex justify-between items-center mb-6">
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Product Media Asset Gallery (Max 7)</label>
                      <span className={`text-[10px] font-extrabold ${selectedImages.length + existingImages.length === 7 ? 'text-red-500' : 'text-gray-400'}`}>
                        {selectedImages.length + existingImages.length}/7 UPLOADED
                      </span>
                    </div>

                    <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                      {/* EXISTING IMAGES */}
                      {existingImages.map((img) => (
                        <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden ring-1 ring-gray-100 shadow-sm border-2 border-white group">
                          <Image src={img.url} alt="existing" fill sizes="10vw" className="object-cover" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <button
                            onClick={() => removeExistingImage(img.id)}
                            className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition shadow-sm"
                          >
                            <CloseIcon size={10} />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-green-500/80 px-1 rounded text-[8px] text-white font-bold">Saved</div>
                        </div>
                      ))}

                      {/* NEW PREVIEWS */}
                      {imagePreviews.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden ring-1 ring-gray-100 shadow-sm border-2 border-white group">
                          <Image src={url} alt="preview" fill sizes="10vw" className="object-cover" />
                          <button
                            onClick={() => removeSelectedImage(i)}
                            className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition shadow-sm"
                          >
                            <CloseIcon size={10} />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-orange-500/80 px-1 rounded text-[8px] text-white font-bold">New</div>
                        </div>
                      ))}

                      {selectedImages.length + existingImages.length < 7 && (
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
              </div>

              {/* FOOTER */}
              <div className="px-6 md:px-10 py-6 md:py-8 bg-gray-50 border-t flex gap-4">
                <button
                  disabled={loading}
                  onClick={() => setOpenModal(false)}
                  className="flex-1 py-4 text-sm font-bold text-gray-500 bg-white ring-1 ring-gray-200 rounded-2xl hover:bg-gray-100 transition disabled:opacity-50"
                >
                  Discard
                </button>
                <button
                  disabled={loading}
                  onClick={handleSubmit}
                  className="flex-[1.5] py-4 text-sm font-extrabold text-white bg-gradient-to-r from-[#2B176F] to-[#4B2FD1] rounded-2xl hover:shadow-xl hover:shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <> {editId ? "Sync Inventory" : "Register Logic"} </>
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
                  <CloseIcon size={20} />
                </button>
                <div className="w-20 h-20 bg-red-50 rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100 rotate-3">
                  <Trash2 size={32} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-[#2B176F] mb-3">Drop Molecule?</h3>
                <p className="text-[13px] text-gray-500 font-medium leading-relaxed max-w-[280px] mx-auto">
                  Are you absolutely certain? This clinical asset and its media files will be permanently purged.
                </p>
              </div>
              <div className="flex gap-4 px-8 py-6 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3.5 text-sm font-bold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition shadow-sm"
                >
                  Keep Asset
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3.5 text-sm font-black text-white bg-red-500 rounded-xl hover:bg-red-600 transition tracking-wide shadow-md shadow-red-200 active:scale-[0.98]"
                >
                  Yes, Drop
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
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
