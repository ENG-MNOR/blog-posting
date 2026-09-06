import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { CalendarDays, MapPin, ExternalLink, FileText } from 'lucide-react';
import { useEvents } from '@/hooks/useApi';
import type { EventItem } from '@/types';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/ui/reveal';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { ImageGallery } from '@/components/ui/image-gallery';

const eventImages = (event: EventItem) =>
  event.images?.length ? event.images : event.imageUrl ? [event.imageUrl] : [];

const isUpcoming = (event: EventItem) =>
  event.category === 'upcoming' || new Date(event.date).getTime() >= Date.now();

const EventCard = ({ event, featured }: { event: EventItem; featured?: boolean }) => {
  const images = eventImages(event);
  return (
    <article
      className={cn(
        'flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-lifted',
        featured && 'md:col-span-2 md:p-6',
      )}
    >
      {images.length > 0 && (
        <ImageGallery
          images={images}
          alt={event.name}
          layout={featured ? 'feature' : 'grid'}
          className="mb-4"
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <p className="line-clamp-2 text-xs font-medium uppercase tracking-wide text-secondary">
          {event.role}
        </p>
        <Badge variant={isUpcoming(event) ? 'secondary' : 'muted'} className="shrink-0">
          {isUpcoming(event) ? 'Upcoming' : 'Past'}
        </Badge>
      </div>

      <h3 className={cn('mt-1 font-semibold text-foreground', featured ? 'text-xl md:text-2xl' : 'text-lg')}>
        {event.name}
      </h3>

      <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" />
          {new Date(event.date).toLocaleDateString(undefined, {
            weekday: featured ? 'long' : undefined,
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
        <p className={cn('mt-3 text-sm text-muted-foreground', featured ? 'line-clamp-4' : 'line-clamp-3')}>
          {event.description}
        </p>
      )}

      {(event.link || event.materialsUrl) && (
        <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium text-primary">
          {event.link && (
            <a href={event.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:underline">
              <ExternalLink className="h-4 w-4" /> Event link
            </a>
          )}
          {event.materialsUrl && (
            <a href={event.materialsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:underline">
              <FileText className="h-4 w-4" /> Materials
            </a>
          )}
        </div>
      )}
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
      {events.map((event, i) => (
        <EventCard key={event._id} event={event} featured={i === 0} />
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
