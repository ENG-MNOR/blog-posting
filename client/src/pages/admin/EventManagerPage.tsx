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
} from "lucide-react";

type EventFormValues = {
  name: string;
  role: string;
  date: string;
  location: string;
  description: string;
  materialsUrl: string;
};

const EventManagerPage = () => {
  const { data } = useEvents();
  const mutations = useMutateEvents();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);

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

      if (selectedImages?.length) {
        Array.from(selectedImages)
          .slice(0, 3)
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
      setSelectedImages(null);
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
    setExistingImages(item.images || (item.imageUrl ? [item.imageUrl] : []));
    setSelectedImages(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        await mutations.remove.mutateAsync(id);
        toast.success("Event has been Deleted Successfully!");
        if (editingId === id) {
          reset();
          setEditingId(null);
          setSelectedImages(null);
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
              setSelectedImages(null);
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
  className="rounded-2xl border border-slate-100 p-4"
>
  <div className="flex justify-between gap-4">
    {/* Content + images */}
    <div className="flex-1">
      <p className="text-xs uppercase tracking-wide text-secondary">
        {event.role}
      </p>
      <h3 className="text-lg font-semibold text-dark">
        {event.name}
      </h3>

      <p className="text-sm text-slate-500 flex items-center gap-1">
        <Calendar size={14} />
        {new Date(event.date).toLocaleDateString()}
      </p>

      <p className="text-sm text-slate-500 flex items-center gap-1">
        <MapPin size={14} />
        {event.location}
      </p>

      {/* Images BELOW content */}
      {(() => {
        const imgs = event.images?.length
          ? event.images.slice(0, 3)
          : event.imageUrl
          ? [event.imageUrl]
          : [];

        return imgs.length ? (
          <div className="flex gap-2 mt-3">
            {imgs.map((img) => (
              <img
                key={img}
                src={getImageSrc(img)}
                alt={event.name}
                className="h-20 w-20 rounded-xl object-cover border border-slate-200 shadow-sm"
              />
            ))}
          </div>
        ) : null;
      })()}
    </div>

    {/* Buttons */}
    <div className="flex flex-col gap-2 text-sm">
      <button
        className="text-primary flex items-center gap-1"
        onClick={() => handleEdit(event)}
      >
        <Edit size={16} />
        Edit
      </button>

      <button
        className="text-red-500 flex items-center gap-1"
        onClick={() => handleDelete(event._id)}
      >
        <Trash2 size={16} />
        Delete
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
            <label className="flex items-center gap-2 border rounded-xl px-3 py-2 border-slate-200 cursor-pointer">
              <ImageIcon size={18} className="text-slate-500" />
              <input
                type="file"
                accept="image/*"
                multiple
                className="w-full text-sm"
                onChange={(e) => setSelectedImages(e.target.files)}
              />
            </label>
            {(selectedImages?.length || existingImages.length) ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedImages &&
                  Array.from(selectedImages)
                    .slice(0, 3)
                    .map((file) => (
                      <span
                        key={file.name}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                      >
                        {file.name}
                      </span>
                    ))}
                {!selectedImages &&
                  existingImages.map((src) => (
                    <img
                      key={src}
                      src={getImageSrc(src)}
                      alt="Event"
                      className="h-16 w-16 rounded-lg object-cover border border-slate-200"
                    />
                  ))}
              </div>
            ) : null}
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


