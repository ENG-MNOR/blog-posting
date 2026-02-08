import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDashboardResearch, useMutateResearch } from "@/hooks/useApi";
import { Research } from "@/types";
import { useAuthStore } from "@/store/auth";
import toast from "react-hot-toast";

// Lucide Icons
import {
  Book,
  Calendar,
  Library,
  Tag,
  FileText,
  Link as LinkIcon,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Clock,
  File,
  AlertCircle
} from "lucide-react";

type ResearchFormValues = {
  title: string;
  year: number;
  journal: string;
  topic: string;
  summary: string;
  pdfUrl: string;
  externalLink: string;
  status: 'draft' | 'pending_review' | 'published';
};

// Reusable input field with icon
const InputField = ({
  icon: Icon,
  children,
}: {
  icon: any;
  children: React.ReactNode;
}) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
    {children}
  </div>
);

const ResearchManagerPage = () => {
  const { data, isLoading } = useDashboardResearch();
  const mutations = useMutateResearch();
  const user = useAuthStore(state => state.user);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResearchFormValues>({
    defaultValues: {
      status: 'draft'
    }
  });

  const onSubmit = async (values: ResearchFormValues) => {
    const loadingToast = toast.loading("Processing...");
    try {
      if (editingId) {
        await mutations.update.mutateAsync({ id: editingId, data: values });
        toast.success("Research updated successfully.");
      } else {
        await mutations.create.mutateAsync(values);
        toast.success("Research created successfully.");
      }
      reset();
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleEdit = (item: Research) => {
    setEditingId(item._id);
    setValue("title", item.title || "");
    setValue("year", item.year || new Date().getFullYear());
    setValue("journal", item.journal || "");
    setValue("topic", item.topic || "");
    setValue("summary", item.summary || "");
    setValue("pdfUrl", item.pdfUrl || "");
    setValue("externalLink", item.externalLink || "");
    setValue("status", item.status || "draft");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this research item?")) return;

    const loadingToast = toast.loading("Deleting...");
    try {
      await mutations.remove.mutateAsync(id);
      toast.success("Research deleted successfully!");
      if (editingId === id) {
        reset();
        setEditingId(null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete.");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"><CheckCircle size={12} /> Published</span>;
      case 'pending_review':
        return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800"><Clock size={12} /> Pending</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800"><File size={12} /> Draft</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Research Management</h1>
          <p className="text-slate-500">Add, edit, and publish research papers</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sticky top-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">
              {editingId ? "Edit Research" : "Add Research"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                <InputField icon={Book}>
                  <input
                    {...register("title", { required: "Title is required" })}
                    className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Research Title"
                  />
                </InputField>
                {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Year</label>
                  <InputField icon={Calendar}>
                    <input
                      type="number"
                      {...register("year", { required: "Year is required" })}
                      className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="2024"
                    />
                  </InputField>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Topic</label>
                  <InputField icon={Tag}>
                    <input
                      {...register("topic")}
                      className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Topic"
                    />
                  </InputField>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Journal</label>
                <InputField icon={Library}>
                  <input
                    {...register("journal")}
                    className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Journal Name"
                  />
                </InputField>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Summary</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <textarea
                    {...register("summary", { required: "Summary is required" })}
                    rows={4}
                    className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Brief summary..."
                  />
                </div>
                {errors.summary && <p className="mt-1 text-xs text-red-500">{errors.summary.message}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">PDF URL</label>
                <InputField icon={LinkIcon}>
                  <input
                    {...register("pdfUrl")}
                    className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="https://..."
                  />
                </InputField>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">External Link</label>
                <InputField icon={LinkIcon}>
                  <input
                    {...register("externalLink")}
                    className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="https://..."
                  />
                </InputField>
              </div>

              {/* Status Field - Only editable by admin or if creating new */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                <div className="relative">
                   <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <select
                    {...register("status")}
                    disabled={user?.role !== 'admin' && editingId !== null} 
                    className="w-full rounded-md border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-slate-100 disabled:text-slate-500"
                   >
                     <option value="draft">Draft</option>
                     <option value="pending_review">Pending Review</option>
                     {user?.role === 'admin' && <option value="published">Published</option>}
                   </select>
                </div>
                {user?.role !== 'admin' && (
                    <p className="mt-1 text-xs text-slate-500">Only admins can publish research.</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {editingId ? <Edit size={16} /> : <Plus size={16} />}
                  {editingId ? "Update Research" : "Add Research"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      setEditingId(null);
                    }}
                    className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
             <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Research Items</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{data?.length || 0} items</span>
             </div>
             <div className="divide-y divide-slate-100">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-500">Loading research...</div>
                ) : data?.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No research items found.</div>
                ) : (
                    data?.map((item) => (
                        <div key={item._id} className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-slate-800 line-clamp-1">{item.title}</h4>
                                        {getStatusBadge(item.status || 'draft')}
                                    </div>
                                    <p className="text-sm text-slate-600 line-clamp-2">{item.summary}</p>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {item.year}</span>
                                        {item.journal && <span className="flex items-center gap-1"><Library size={12} /> {item.journal}</span>}
                                        {item.topic && <span className="flex items-center gap-1"><Tag size={12} /> {item.topic}</span>}
                                        {item.author && (
                                            <span className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-200">
                                                By: {typeof item.author === 'object' ? item.author.name : 'Unknown'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="rounded-md p-2 text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors"
                                        title="Edit"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchManagerPage;
