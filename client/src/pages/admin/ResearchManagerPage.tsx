import { useState } from "react";
import { useForm } from "react-hook-form";
import { useResearch, useMutateResearch } from "@/hooks/useApi";
import { Research } from "@/types";
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
} from "lucide-react";

type ResearchFormValues = {
  title: string;
  year: number;
  journal: string;
  topic: string;
  summary: string;
  pdfUrl: string;
  externalLink: string;
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
  const { data } = useResearch();
  const mutations = useMutateResearch();
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ResearchFormValues>();

  const onSubmit = async (values: ResearchFormValues) => {
    const loadingToast = toast.loading("Processing...");
    try {
      if (editingId) {
        await mutations.update.mutateAsync({ id: editingId, data: values });
        toast.success("Research has been Updated Successfully.");
      } else {
        await mutations.create.mutateAsync(values);
        toast.success("Research has been Created Successfully.");
      }
      reset();
      setEditingId(null);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleEdit = (item: Research) => {
    setEditingId(item._id);
    setValue("title", item.title || "");
    setValue("year", item.year || 0);
    setValue("journal", item.journal || "");
    setValue("topic", item.topic || "");
    setValue("summary", item.summary || "");
    setValue("pdfUrl", item.pdfUrl || "");
    setValue("externalLink", item.externalLink || "");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this research item?")) return;

    const loadingToast = toast.loading("Deleting...");
    try {
      await mutations.remove.mutateAsync(id);
      toast.success("Research has been Deleted Successfully!");
      if (editingId === id) {
        reset();
        setEditingId(null);
      }
    } catch {
      toast.error("Failed to delete.");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
      {/* --- LEFT LIST --- */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-dark">Research Catalog</h2>

          <button
            onClick={() => {
              reset();
              setEditingId(null);
            }}
            className="flex items-center gap-1 text-sm text-primary"
          >
            <Plus size={16} /> Add New
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {data?.map((item) => (
            <article
              key={item._id}
              className="rounded-2xl border border-slate-100 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-secondary">
                    {item.topic}
                  </p>
                  <h3 className="text-lg font-semibold text-dark">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {item.journal} · {item.year}
                  </p>
                </div>

                <div className="flex gap-2 text-sm">
                  <button
                    className="flex items-center gap-1 text-primary"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit size={16} /> Edit
                  </button>

                  <button
                    className="flex items-center gap-1 text-red-500"
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}

          {!data?.length && (
            <p className="text-sm text-slate-500">No research entries yet.</p>
          )}
        </div>
      </section>

      {/* --- RIGHT FORM --- */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-dark flex items-center gap-2">
          {editingId ? <Edit size={18} /> : <Plus size={18} />}
          {editingId ? "Edit Research" : "Add Research"}
        </h2>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          {/* Title */}
          <InputField icon={Book}>
            <input
              placeholder="Title"
              className={`w-full rounded-xl border px-10 py-2 text-sm outline-none focus:border-primary ${
                errors.title ? "border-red-500" : "border-slate-200"
              }`}
              {...register("title", { required: "Title is required" })}
            />
          </InputField>
          {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}

          {/* Year */}
          <InputField icon={Calendar}>
            <input
              type="number"
              placeholder="Year"
              className={`w-full rounded-xl border px-10 py-2 text-sm outline-none focus:border-primary ${
                errors.year ? "border-red-500" : "border-slate-200"
              }`}
              {...register("year", { required: "Year is required", valueAsNumber: true })}
            />
          </InputField>
          {errors.year && <p className="text-red-600 text-sm">{errors.year.message}</p>}

          {/* Journal */}
          <InputField icon={Library}>
            <input
              placeholder="Journal"
              className={`w-full rounded-xl border px-10 py-2 text-sm outline-none focus:border-primary ${
                errors.journal ? "border-red-500" : "border-slate-200"
              }`}
              {...register("journal", { required: "Journal is required" })}
            />
          </InputField>
          {errors.journal && <p className="text-red-600 text-sm">{errors.journal.message}</p>}

          {/* Topic */}
          <InputField icon={Tag}>
            <input
              placeholder="Topic"
              className={`w-full rounded-xl border px-10 py-2 text-sm outline-none focus:border-primary ${
                errors.topic ? "border-red-500" : "border-slate-200"
              }`}
              {...register("topic", { required: "Topic is required" })}
            />
          </InputField>
          {errors.topic && <p className="text-red-600 text-sm">{errors.topic.message}</p>}

          {/* Summary */}
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <textarea
              rows={4}
              placeholder="Summary"
              className={`w-full rounded-xl border px-10 py-2 text-sm outline-none focus:border-primary ${
                errors.summary ? "border-red-500" : "border-slate-200"
              }`}
              {...register("summary", { required: "Summary is required" })}
            />
          </div>
          {errors.summary && <p className="text-red-600 text-sm">{errors.summary.message}</p>}

          {/* PDF URL */}
          <InputField icon={LinkIcon}>
            <input
              placeholder="PDF URL"
              className={`w-full rounded-xl border px-10 py-2 text-sm outline-none focus:border-primary ${
                errors.pdfUrl ? "border-red-500" : "border-slate-200"
              }`}
              {...register("pdfUrl", { required: "PDF URL is required" })}
            />
          </InputField>
          {errors.pdfUrl && <p className="text-red-600 text-sm">{errors.pdfUrl.message}</p>}

          {/* External Link */}
          <InputField icon={LinkIcon}>
            <input
              placeholder="External Link"
              className="w-full rounded-xl border px-10 py-2 text-sm outline-none focus:border-primary"
              {...register("externalLink")}
            />
          </InputField>
          {errors.externalLink && <p className="text-red-600 text-sm">{errors.externalLink.message}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-primary py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
          >
            {editingId ? "Update Research" : "Create Research"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default ResearchManagerPage;


