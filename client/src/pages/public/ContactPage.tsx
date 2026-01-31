import { useForm } from "react-hook-form";
import { Helmet } from "react-helmet-async";
import { useContactMutation } from "@/hooks/useApi";
import toast from "react-hot-toast";

type ContactFormValues = {
  name: string;
  email: string;
  requestType: string;
  message: string;
};

const requestTypes = [
  "speaking",
  "training",
  "research",
  "consultation",
  "other",
];

const ContactPage = () => {
  const mutation = useContactMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    defaultValues: {
      name: "",
      email: "",
      requestType: "speaking",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    const loadingToast = toast.loading("Sending message...");

    try {
      await mutation.mutateAsync(values);
      toast.success("Message has been Sent Successfully.");
      reset();
    } catch (err) {
      toast.error("Failed to send message. Try again.");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact | Dr. Nour Haji</title>
      </Helmet>

      <div className="grid gap-10 md:grid-cols-2">
        <section>
          <p className="text-sm uppercase tracking-[0.4em] text-primary/80">
            Contact
          </p>
          <h1 className="font-display text-4xl text-dark">Invite Dr. Nour</h1>

          <p className="mt-4 text-lg text-slate-600">
            Share details about your seminar, training, or advisory need. Dr.
            Nour responds within 2–3 business days.
          </p>

          <div className="mt-8 space-y-4 text-slate-600">
            <p>
              Email:{" "}
              <a
                className="text-primary"
                href="mailto:connect@nourhaji.org"
              >
                connect@nourhaji.org
              </a>
            </p>
            <p>Location: Nairobi, supporting the Horn of Africa.</p>
          </div>
        </section>

        {/* Form */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm font-semibold text-slate-600">  
                Name
              </label>
              <input
                placeholder="Please enter your name"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-primary"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Email
              </label>
              <input
                type="email"
                placeholder="Please enter your email"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-primary"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Invalid email",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Request Type
              </label>
              <select
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-primary"
                {...register("requestType")}
              >
                {requestTypes.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Message
              </label>
              <textarea
                placeholder="Please enter your message"
                rows={5}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-primary"
                {...register("message", { required: "Message is required" })}
              />
              {errors.message && (
                <p className="text-sm text-red-500">
                  {errors.message.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-white shadow hover:bg-primary/90 disabled:opacity-50"
            >
              {mutation.isPending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </section>
      </div>
    </>
  );
};

export default ContactPage;


