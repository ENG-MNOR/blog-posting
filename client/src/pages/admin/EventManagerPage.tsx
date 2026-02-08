import { useState } from "react";
import { useForm } from "react-hook-form";
import { useEvents, useMutateEvents } from "@/hooks/useApi";
import { EventItem } from "@/types";
import toast from "react-hot-toast";
import {
  Edit,
  Trash2,
  Plus,
  Link as LinkIcon,
  MapPin,
  ImageIcon,
  Calendar,
  FileText,
  User,
  Briefcase,
  X,
} from "lucide-react";

type EventFormValues = {
  name: string;
  role: string;
  date: string;
  location: string;
  description: string;
  materialsUrl: string;
  link?: string;
};

const EventManagerPage = () => {
  const { data } = useEvents();
  const mutations = useMutateEvents();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);

  const apiBaseUrl =
    (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(
      /\/api\/?$/,
      ""
    );

  const getImageSrc = (path?: string) => {
    if (!path) return "";
    return path.startsWith("http") ? path : `${apiBaseUrl}${path}`;
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>();

  const onSubmit = async (values: EventFormValues) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("role", values.role);
      formData.append("date", values.date);
      formData.append("location", values.location);
      formData.append("description", values.description);
      formData.append("materialsUrl", values.materialsUrl || "");
      if (values.link) formData.append("link", values.link);

      // If no new images are selected, send existing images to preserve/update them
      if (existingImages.length > 0) {
        existingImages.forEach(img => formData.append("existingImages", img));
      } else {
        // Explicitly signal to clear images if needed, or if we just want to ensure the backend knows we have no existing images
        formData.append("clearImages", "true");
      }

      if (selectedImages?.length) {
        Array.from(selectedImages)
          .forEach((file) => formData.append("images", file));
      }

      if (editingId) {
        await mutations.update.mutateAsync({ id: editingId, data: formData });
        toast.success("Event has been Updated Successfully.");
      } else {
        await mutations.create.mutateAsync(formData);
        toast.success("Event has been Created Successfully.");
      }
      reset();
      setEditingId(null);
      setSelectedImages([]);
      setExistingImages([]);
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  const handleEdit = (item: EventItem) => {
    setEditingId(item._id);
    setValue("name", item.name || "");
    setValue("role", item.role || "");
    setValue("date", item.date?.slice(0, 10) || "");
    setValue("location", item.location || "");
    setValue("description", item.description || "");
    setValue("materialsUrl", item.materialsUrl || "");
    setValue("link", item.link || "");
    setExistingImages(item.images || (item.imageUrl ? [item.imageUrl] : []));
    setSelectedImages([]);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await mutations.remove.mutateAsync(id);
        toast.success("Event has been Deleted Successfully!");
        if (editingId === id) {
          reset();
          setEditingId(null);
          setSelectedImages([]);
          setExistingImages([]);
        }
      } catch (error) {
        toast.error("Failed to delete event.");
      }
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
      {/* Left: Events List */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-dark">Events</h2>

          <button
            className="flex items-center gap-1 text-sm text-primary"
            onClick={() => {
              reset();
              setEditingId(null);
              setSelectedImages([]);
              setExistingImages([]);
            }}
          >
            <Plus size={16} /> Add New
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {data?.map((event) => (
            <article
              key={event._id}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary dark:bg-primary/20 dark:text-sky-400">
                      {event.role}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${new Date(event.date) >= new Date() ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {new Date(event.date) >= new Date() ? 'Upcoming' : 'Past'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {event.name}
                  </h3>

                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={15} className="text-slate-400" />
                      {new Date(event.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={15} className="text-slate-400" />
                      {event.location}
                    </div>
                  </div>
                  
                  {event.description && (
                    <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                      {event.description}
                    </p>
                  )}

                  {event.link && (
                    <a 
                      href={event.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline dark:text-sky-400"
                    >
                      <LinkIcon size={14} />
                      External Link
                    </a>
                  )}

                  {/* Images Preview Row */}
                  {(() => {
                    const imgs = event.images?.length
                      ? event.images
                      : event.imageUrl
                      ? [event.imageUrl]
                      : [];

                    return imgs.length ? (
                      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                        {imgs.map((img) => (
                          <img
                            key={img}
                            src={getImageSrc(img)}
                            alt={event.name}
                            className="h-16 w-16 flex-none rounded-lg object-cover border border-slate-100 shadow-sm dark:border-slate-800"
                          />
                        ))}
                      </div>
                    ) : null;
                  })()}
                </div>

                {/* Actions */}
                <div className="flex flex-row gap-2 sm:flex-col sm:border-l sm:border-slate-100 sm:pl-4 sm:dark:border-slate-800">
                  <button
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-primary/10 hover:text-primary dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 sm:flex-none"
                    onClick={() => handleEdit(event)}
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>

                  <button
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 sm:flex-none"
                    onClick={() => handleDelete(event._id)}
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
          {!data?.length && (
            <p className="text-sm text-slate-500">No events recorded yet.</p>
          )}
        </div>
      </section>

      {/* Right: Form */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-dark flex items-center gap-2">
          {editingId ? <Edit size={18} /> : <Plus size={18} />}
          {editingId ? "Edit Event" : "Add Event"}
        </h2>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          {/** Name */}
          <div>
            <div
              className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${
                errors.name ? "border-red-500" : "border-slate-200"
              }`}
            >
              <User size={18} className="text-slate-500" />
              <input
                placeholder="Name"
                className="w-full outline-none text-sm"
                {...register("name", { required: "Name is required" })}
              />
            </div>
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/** Role */}
          <div>
            <div
              className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${
                errors.role ? "border-red-500" : "border-slate-200"
              }`}
            >
              <Briefcase size={18} className="text-slate-500" />
              <input
                placeholder="Role"
                className="w-full outline-none text-sm"
                {...register("role", { required: "Role is required" })}
              />
            </div>
            {errors.role && (
              <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          {/** Date */}
          <div>
            <div
              className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${
                errors.date ? "border-red-500" : "border-slate-200"
              }`}
            >
              <Calendar size={18} className="text-slate-500" />
              <input
                type="date"
                className="w-full outline-none text-sm"
                {...register("date", { required: "Date is required" })}
              />
            </div>
            {errors.date && (
              <p className="text-red-600 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          {/** Location */}
          <div>
            <div
              className={`flex items-center gap-2 border rounded-xl px-3 py-2 ${
                errors.location ? "border-red-500" : "border-slate-200"
              }`}
            >
              <MapPin size={18} className="text-slate-500" />
              <input
                placeholder="Location"
                className="w-full outline-none text-sm"
                {...register("location", { required: "Location is required" })}
              />
            </div>
            {errors.location && (
              <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
            )}
          </div>

          {/** Link */}
          <div>
            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2">
              <LinkIcon size={18} className="text-slate-500" />
              <input
                type="url"
                placeholder="External Link (URL)"
                className="w-full outline-none text-sm"
                {...register("link")}
              />
            </div>
          </div>

          {/** Description */}
          <div>
            <div
              className={`flex items-start gap-2 border rounded-xl px-3 py-2 ${
                errors.description ? "border-red-500" : "border-slate-200"
              }`}
            >
              <FileText size={18} className="mt-1 text-slate-500" />
              <textarea
                placeholder="Description"
                rows={3}
                className="w-full outline-none text-sm"
                {...register("description", { required: "Description is required" })}
              />
            </div>
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/** Images Upload */}
          <div>
            <label className="flex items-center gap-2 border rounded-xl px-3 py-2 border-slate-200 cursor-pointer hover:bg-slate-50 transition">
              <ImageIcon size={18} className="text-slate-500" />
              <span className="text-sm text-slate-500">Upload Images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setSelectedImages((prev) => [
                      ...prev,
                      ...Array.from(e.target.files!),
                    ]);
                  }
                }}
              />
            </label>
            
            {(selectedImages.length > 0 || existingImages.length > 0) && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {/* New Images Preview */}
                {selectedImages.map((file, idx) => (
                  <div key={idx} className="relative aspect-square group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="h-full w-full rounded-lg object-cover border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedImages((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                
                {/* Existing Images (always show, allow delete) */}
                {existingImages.map((src, idx) => (
                    <div key={src} className="relative aspect-square group">
                      <img
                        src={getImageSrc(src)}
                        alt="Existing"
                        className="h-full w-full rounded-lg object-cover border border-slate-200"
                      />
                       <button
                        type="button"
                        onClick={() =>
                          setExistingImages((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
            {selectedImages.length > 0 && existingImages.length > 0 && (
               <p className="text-xs text-slate-500 mt-2">
                 New images will be appended to existing ones.
               </p>
            )}
          </div>

          {/** Materials/Link URL */}
          <div>
            <div className="flex items-center gap-2 border rounded-xl px-3 py-2 border-slate-200">
              <LinkIcon size={18} className="text-slate-500" />
              <input
                placeholder="Materials Link URL"
                className="w-full outline-none text-sm"
                {...register("materialsUrl")}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-primary py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
            disabled={isSubmitting}
          >
            {editingId ? "Update Event" : "Create Event"}
          </button>
        </form>
      </section>
    </div>
  );
};

export default EventManagerPage;


