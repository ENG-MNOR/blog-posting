import { Helmet } from 'react-helmet-async';
import { useEvents } from '@/hooks/useApi';
import { Calendar, MapPin } from 'lucide-react';

const EventsColumn = ({
  title,
  category
}: {
  title: string;
  category: 'upcoming' | 'past';
}) => {
  const { data, isLoading } = useEvents(category);

  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(
    /\/api\/?$/,
    ''
  );
  const getImageSrc = (path?: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${apiBaseUrl}${path}`;
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-dark">{title}</h2>
      <div className="mt-4 space-y-4">
        {isLoading && <p>Loading {title.toLowerCase()}...</p>}
        {!isLoading &&
          data?.map((event) => (
            // <article
            //   key={event._id}
            //   className="rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-shadow"
            // >
            //   <div className="flex gap-4">
            //     {(() => {
            //       const imgs = event.images?.length
            //         ? event.images.slice(0, 3)
            //         : event.imageUrl
            //         ? [event.imageUrl]
            //         : [];
            //       return imgs.length ? (
            //         <div className="flex-shrink-0 flex gap-2">
            //           {imgs.map((img) => (
            //             <img
            //               key={img}
            //               src={getImageSrc(img)}
            //               alt={event.name}
            //               className="h-20 w-20 rounded-xl object-cover border border-slate-200 shadow-sm"
            //             />
            //           ))}
            //         </div>
            //       ) : null;
            //     })()}
            //     <div className="flex-1 min-w-0">
            //       <p className="text-xs uppercase tracking-wide text-secondary">{event.role}</p>
            //       <h3 className="mt-1 text-lg font-semibold text-dark">{event.name}</h3>
            //       <div className="mt-2 space-y-1">
            //         <p className="text-sm text-slate-500 flex items-center gap-1">
            //           <Calendar size={14} />
            //           {new Date(event.date).toLocaleDateString()}
            //         </p>
            //         {event.location && (
            //           <p className="text-sm text-slate-500 flex items-center gap-1">
            //             <MapPin size={14} />
            //             {event.location}
            //           </p>
            //         )}
            //       </div>
            //       {event.description && (
            //         <p className="mt-2 text-sm text-slate-600 line-clamp-2">{event.description}</p>
            //       )}
            //     </div>
            //   </div>
            // </article>

            <article
  key={event._id}
  className="rounded-2xl border border-slate-100 p-5 hover:shadow-md transition"
>
  {/* Text Content */}
  <div>
    <p className="text-xs uppercase tracking-wide text-secondary">
      {event.role}
    </p>

    <h3 className="mt-1 text-lg font-semibold text-dark">
      {event.name}
    </h3>

    <div className="mt-2 space-y-1">
      <p className="text-sm text-slate-500 flex items-center gap-1">
        <Calendar size={14} />
        {new Date(event.date).toLocaleDateString()}
      </p>

      {event.location && (
        <p className="text-sm text-slate-500 flex items-center gap-1">
          <MapPin size={14} />
          {event.location}
        </p>
      )}
    </div>

    {event.description && (
      <p className="mt-3 text-sm text-slate-600 line-clamp-3">
        {event.description}
      </p>
    )}
  </div>

  {/* Images Below Content */}
  {(() => {
    const imgs = event.images?.length
      ? event.images.slice(0, 3)
      : event.imageUrl
      ? [event.imageUrl]
      : [];

    return imgs.length ? (
      <div className="mt-4 grid grid-cols-3 gap-3">
        {imgs.map((img) => (
          <img
            key={img}
            src={getImageSrc(img)}
            alt={event.name}
            className="h-24 w-full object-cover rounded-xl border border-slate-200 shadow-sm hover:scale-105 transition"
          />
        ))}
      </div>
    ) : null;
  })()}
</article>

          ))}
        {!isLoading && !data?.length && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-500">
            Nothing to show yet.
          </p>
        )}
      </div>
    </section>
  );
};

const EventsPage = () => {
  return (
    <>
      <Helmet>
        <title>Events & Engagements | Dr. Nour Haji</title>
      </Helmet>
      <div className="space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-primary/80">Events</p>
          <h1 className="font-display text-4xl text-dark">Speaking, Trainings & Missions</h1>
          <p className="mt-3 text-lg text-slate-600">
            Follow the seminars, donor briefings, and training missions Dr. Nour is leading across
            the region.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <EventsColumn title="Upcoming Events" category="upcoming" />
          <EventsColumn title="Recent Events" category="past" />
        </div>
      </div>
    </>
  );
};

export default EventsPage;





