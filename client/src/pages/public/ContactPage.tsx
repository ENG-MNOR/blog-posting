import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, Mail, MapPin, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useContactMutation } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select, Label } from '@/components/ui/input';
import { Reveal } from '@/components/ui/reveal';
import { Spinner } from '@/components/ui/spinner';

const requestTypes = ['speaking', 'training', 'research', 'consultation', 'other'] as const;

const schema = z.object({
  name: z.string().min(2, 'Please enter your name').max(120),
  email: z.string().email('Enter a valid email address').max(200),
  requestType: z.enum(requestTypes),
  message: z.string().min(10, 'Tell us a little more (10+ characters)').max(4000),
  // Honeypot — real users never fill this.
  company: z.string().max(0).optional(),
});

type ContactValues = z.infer<typeof schema>;

const ContactPage = () => {
  const mutation = useContactMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ContactValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', requestType: 'speaking', message: '', company: '' },
  });

  const onSubmit = async (values: ContactValues) => {
    if (values.company) return; // honeypot tripped
    try {
      await mutation.mutateAsync({
        name: values.name,
        email: values.email,
        requestType: values.requestType,
        message: values.message,
      });
      toast.success('Message sent — Nor will be in touch.');
    } catch {
      toast.error('Could not send your message. Please try again.');
    }
  };

  const succeeded = isSubmitSuccessful && mutation.isSuccess;

  return (
    <>
      <Helmet>
        <title>Contact | Nor Haji Osman</title>
        <meta name="description" content="Invite Nor Haji Osman for speaking, training, research, or advisory engagements." />
      </Helmet>

      <div className="grid gap-12 md:grid-cols-2">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-primary">Contact</p>
          <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">Invite Nor Haji</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Share details about your seminar, training, or advisory need. Nor typically responds
            within 2–3 business days.
          </p>

          <dl className="mt-8 space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-muted p-2 text-primary">
                <Mail className="h-4 w-4" />
              </span>
              <a href="mailto:norhaji@just.edu.so" className="text-primary hover:underline">
                norhaji@just.edu.so
              </a>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-muted p-2 text-primary">
                <MapPin className="h-4 w-4" />
              </span>
              <span className="text-muted-foreground">Nairobi · supporting the Horn of Africa</span>
            </div>
          </dl>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            {succeeded ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="rounded-full bg-success/15 p-3 text-success">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-foreground">Message received</h2>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Thanks for reaching out. You’ll get a reply at the email you provided.
                </p>
                <Button variant="outline" size="sm" className="mt-5" onClick={() => reset()}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your full name" error={errors.name?.message} {...register('name')} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.org"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>
                <div>
                  <Label htmlFor="requestType">Request type</Label>
                  <Select id="requestType" {...register('requestType')}>
                    {requestTypes.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder="Share the context, dates, and audience…"
                    error={errors.message?.message}
                    {...register('message')}
                  />
                </div>

                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden
                  className="hidden"
                  {...register('company')}
                />

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner /> : <Send className="h-4 w-4" />}
                  {isSubmitting ? 'Sending…' : 'Send message'}
                </Button>
              </form>
            )}
          </section>
        </Reveal>
      </div>
    </>
  );
};

export default ContactPage;
