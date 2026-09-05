import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CalendarDays, MapPin, ExternalLink, FileText } from 'lucide-react';
import { useEvents } from '@/hooks/useApi';
import type { EventItem } from '@/types';
import { resolveMediaUrl } from '@/lib/media';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Reveal } from '@/components/ui/reveal';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const eventImages = (event: EventItem) =>
  (event.images?.length ? event.images : event.imageUrl ? [event.imageUrl] : []).map(resolveMediaUrl);

const EventCard = ({ event }: { event: EventItem }) => {
  const images = eventImages(event);
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-lifted">
      <p className="text-xs uppercase tracking-wide text-secondary">{event.role}</p>
      <h3 className="mt-1 text-lg font-semibold text-foreground">{event.name}</h3>

      <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" />
          {new Date(event.date).toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        {event.location && (
          <p className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {event.location}
          </p>
        )}
      </div>

      {event.description && (
        <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{event.description}</p>
      )}

      {(event.link || event.materialsUrl) && (
        <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium text-primary">
          {event.link && (
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              <ExternalLink className="h-4 w-4" /> Event link
            </a>
          )}
          {event.materialsUrl && (
            <a
              href={event.materialsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              <FileText className="h-4 w-4" /> Materials
            </a>
          )}
        </div>
      )}

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {images.slice(0, 3).map((img) => (
            <button
              key={img}
              type="button"
              onClick={() => setLightbox(img)}
              className="overflow-hidden rounded-xl border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <img
                src={img}
                alt={event.name}
                loading="lazy"
                className="h-24 w-full object-cover transition-transform hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      <Dialog open={lightbox !== null} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-3xl bg-transparent p-0 shadow-none" hideClose>
          {lightbox && (
            <img
              src={lightbox}
              alt={event.name}
              className="max-h-[80vh] w-full rounded-2xl object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </article>
  );
};

const EventList = ({
  events,
  isLoading,
  isError,
  onRetry,
  emptyLabel,
}: {
  events: EventItem[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  emptyLabel: string;
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }
  if (isError) return <ErrorState onRetry={onRetry} />;
  if (events.length === 0) {
    return (
      <EmptyState
        title={emptyLabel}
        icon={<CalendarDays className="h-5 w-5" />}
        description="This list updates as engagements are scheduled."
      />
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {events.map((event) => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
};

const EventsPage = () => {
  const { data, isLoading, isError, refetch } = useEvents();

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const all = data ?? [];
    return {
      upcoming: all
        .filter((e) => e.category === 'upcoming' || new Date(e.date).getTime() >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      past: all
        .filter((e) => e.category === 'past' || new Date(e.date).getTime() < now)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
  }, [data]);

  return (
    <>
      <Helmet>
        <title>Events &amp; Engagements | Nor Haji Osman</title>
        <meta
          name="description"
          content="Seminars, donor briefings, and training missions led by Nor Haji Osman across the region."
        />
      </Helmet>

      <div className="space-y-8">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-primary">Events</p>
          <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
            Speaking, Trainings &amp; Missions
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Follow the seminars, donor briefings, and training missions Nor is leading across the
            region.
          </p>
        </Reveal>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            <EventList
              events={upcoming}
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
              emptyLabel="No upcoming engagements"
            />
          </TabsContent>
          <TabsContent value="past">
            <EventList
              events={past}
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
              emptyLabel="No past engagements recorded"
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default EventsPage;
