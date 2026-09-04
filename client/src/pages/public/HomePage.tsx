import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useContent, useEvents, useResearch } from '@/hooks/useApi';
import { ExternalLink } from 'lucide-react';

const Stat = ({ label, value }: { label: string; value: number | string | undefined }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-colors">
    <p className="text-3xl font-semibold text-primary dark:text-sky-400">{value ?? '—'}</p>
    <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
  </div>
);

const HomePage = () => {
  const { data: homeContent } = useContent('home');
  const { data: research } = useResearch();
  const { data: events } = useEvents('upcoming');

  const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(
    /\/api\/?$/,
    ''
  );
  const getImageSrc = (path?: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${apiBaseUrl}${path}`;
  };

  const heroCtas = homeContent?.heroCtas ?? [
    { label: 'View Research', href: '/research' },
    { label: 'Invite for Speaking', href: '/contact' }
  ];

  return (
    <>
      <Helmet>
        <title>Nor Haji Osman | Public Health Expert</title>
        <meta
          name="description"
          content="Building resilient health information systems across the Horn of Africa."
        />
      </Helmet>

      {/* ---------------- HERO SECTION WITH LARGE PHOTO ---------------- */}
      <section className="grid gap-10 md:grid-cols-2 md:items-center py-10">
        {/* Text Section */}
        <div className="space-y-5">
          <p className="text-sm uppercase tracking-[0.6em] text-primary/80 dark:text-sky-400/80">
            Public Health Expert
          </p>

          <h1 className="font-display text-4xl leading-tight text-slate-900 dark:text-white md:text-5xl">
            {homeContent?.heroHeadline ||
              'Strengthening health systems with data-driven leadership.'}
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-300">
            {homeContent?.heroSubtext ||
              'Nor Haji Osman partners with ministries, donors, and global agencies to advance HMIS, IDSR, immunization, and data use initiatives.'}
          </p>

          <div className="flex flex-wrap gap-3">
            {heroCtas.map((cta) =>
              cta.href.startsWith('http') ? (
                <a
                  key={cta.label}
                  href={cta.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90 dark:bg-sky-600 dark:hover:bg-sky-500 transition-colors"
                >
                  {cta.label}
                </a>
              ) : (
                <Link
                  key={cta.label}
                  to={cta.href}
                  className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90 dark:bg-sky-600 dark:hover:bg-sky-500 transition-colors"
                >
                  {cta.label}
                </Link>
              )
            )}
          </div>
        </div>

        {/* Photo Section */}
        <div className="flex justify-center md:justify-end">
          {getImageSrc(homeContent?.profilePhoto) ? (
            <img
              src={getImageSrc(homeContent?.profilePhoto)}
              alt="Nor Haji Osman"
              className="w-full max-w-md rounded-3xl shadow-lg object-cover"
            />
          ) : (
            <div className="w-full max-w-md rounded-3xl shadow-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center aspect-[3/4]">
              <p className="text-slate-400 dark:text-slate-500 text-sm">No image uploaded</p>
            </div>
          )}
        </div>
      </section>

      {/* ---------------- STATS SECTION ---------------- */}
      <section className="grid gap-4 md:grid-cols-4 mb-16">
        <Stat label="Years Experience" value={homeContent?.stats?.yearsExperience ?? 15} />
        <Stat label="Roles Led" value={homeContent?.stats?.rolesHandled ?? 6} />
        <Stat label="Research Projects" value={homeContent?.stats?.researchCount ?? 40} />
        <Stat label="Countries Impacted" value={homeContent?.stats?.rolesHandled ?? 7} />
      </section>

      {/* ---------------- HIGHLIGHTED RESEARCH ---------------- */}
      <section className="mt-10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Highlighted Research</h2>
          <Link to="/research" className="text-sm font-semibold text-primary hover:underline dark:text-sky-400">
            View all
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {research?.slice(0, 4).map((item) => (
            <article key={item._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow transition-colors dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs uppercase tracking-wide text-secondary dark:text-teal-400">{item.topic}</p>
              <h3 className="mt-2 font-semibold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.journal}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.summary}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{item.year}</span>
                {item.externalLink && (
                  <a
                    href={item.externalLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary dark:text-sky-400"
                  >
                    Read more →
                  </a>
                )}
              </div>
            </article>
          ))}

          {!research?.length && (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
              Research items will appear here once added from the admin dashboard.
            </p>
          )}
        </div>
      </section>

      {/* ---------------- UPCOMING EVENTS ---------------- */}
      <section className="mt-16 space-y-6 mb-20">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Upcoming Engagements</h2>
          <Link to="/events" className="text-sm font-semibold text-primary hover:underline dark:text-sky-400">
            View calendar
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
         {events?.slice(0, 4).map((event) => (
  <article
    key={event._id}
    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-slate-800"
  >
    <div className="flex-1 min-w-0 space-y-1">
      <p className="text-xs uppercase tracking-wide text-secondary dark:text-teal-400">{event.role}</p>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{event.name}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {new Date(event.date).toLocaleDateString()} · {event.location}
      </p>
      {event.description && (
        <p className="text-sm text-slate-600 line-clamp-2 dark:text-slate-300">{event.description}</p>
      )}

      <div className="mt-2 flex flex-wrap gap-3">
        {event.link && (
          <a
            href={event.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline dark:text-sky-400"
          >
            <ExternalLink size={12} />
            Link
          </a>
        )}
        {event.materialsUrl && (
          <a
            href={event.materialsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline dark:text-sky-400"
          >
            <ExternalLink size={12} />
            Materials
          </a>
        )}
      </div>

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
                className="h-24 w-24 rounded-xl object-cover border border-slate-200 shadow-sm dark:border-slate-700"
              />
            ))}
          </div>
        ) : null;
      })()}
    </div>
  </article>
))}


          {!events?.length && (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
              No events yet. Add upcoming seminars and trainings from the admin dashboard.
            </p>
          )}
        </div>
      </section>
    </>
  );
};

export default HomePage;
