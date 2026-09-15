import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CalendarDays, MapPin } from 'lucide-react';
import { useContent, useEvents, useResearch } from '@/hooks/useApi';
import { resolveMediaUrl } from '@/lib/media';
import { Button } from '@/components/ui/button';
import { Img } from '@/components/ui/image';
import { Badge } from '@/components/ui/badge';
import { AnimatedCounter } from '@/components/ui/counter';
import { Reveal, RevealGroup, revealItem } from '@/components/ui/reveal';
import { SkeletonCard } from '@/components/ui/skeleton';
import { ImageGallery } from '@/components/ui/image-gallery';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { motion } from 'framer-motion';

const HomePage = () => {
  const { data: home } = useContent('home');
  const research = useResearch();
  const events = useEvents('upcoming');

  const heroCtas =
    home?.heroCtas?.length
      ? home.heroCtas
      : [
          { label: 'View Research', href: '/research' },
          { label: 'Invite for Speaking', href: '/contact' },
        ];

  // "Research Projects" is always the live published count — the editable
  // content stat only acts as a fallback while that request is in flight.
  const liveResearchCount = research.data?.length;
  const stats = [
    { label: 'Years Experience', value: home?.stats?.yearsExperience || 15, plus: true },
    { label: 'Leadership Roles', value: home?.stats?.rolesHandled || 6, plus: true },
    {
      label: 'Research Projects',
      value: liveResearchCount ?? home?.stats?.researchCount ?? 0,
      plus: false,
    },
    { label: 'Countries Impacted', value: home?.stats?.countriesImpacted || 7, plus: true },
  ];

  const photo = resolveMediaUrl(home?.profilePhoto);
  const featured = (research.data ?? []).slice(0, 4);
  const upcoming = (events.data ?? []).slice(0, 3);

  return (
    <>
      <Helmet>
        <title>Nor Haji Osman | HMIS specialist </title>
        <meta
          name="description"
          content="Nor Haji Osman partners with ministries, donors, and global agencies to strengthen health information systems, disease surveillance, and data use across the Horn of Africa."
        />
        <meta property="og:title" content="Nor Haji Osman | HMIS specialist " />
        <meta
          property="og:description"
          content="Data-driven leadership for resilient health systems across the Horn of Africa."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Hero */}
      <section className="relative -mx-6 overflow-hidden px-6 pb-16 pt-6 md:pt-10">
        <div aria-hidden className="bg-mesh pointer-events-none absolute inset-0 -z-10" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-10 -z-10 h-72 w-72 rounded-full border border-primary/10"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="eyebrow"
            >
              HMIS Specialist
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-4 font-display text-4xl leading-[1.08] tracking-tight text-foreground md:text-6xl"
            >
              {home?.heroHeadline ? (
                home.heroHeadline
              ) : (
                <>
                  Strengthening health systems with{' '}
                  <span className="text-gradient">data-driven leadership.</span>
                </>
              )}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
              className="mt-5 max-w-xl text-lg text-muted-foreground"
            >
              {home?.heroSubtext ||
                'Nor Haji Osman partners with ministries, donors, and global agencies to advance HMIS, IDSR, immunization, and data use initiatives.'}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              {heroCtas.map((cta, i) => {
                const external = cta.href.startsWith('http');
                return (
                  <Button
                    key={cta.label}
                    asChild
                    variant={i === 0 ? 'default' : 'outline'}
                    size="lg"
                  >
                    {external ? (
                      <a href={cta.href} target="_blank" rel="noreferrer">
                        {cta.label}
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : (
                      <Link to={cta.href}>
                        {cta.label}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </Button>
                );
              })}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative mx-auto w-full max-w-sm"
          >
            <div className="absolute -inset-3 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 blur-xl" />
            <Img
              src={photo}
              alt="Nor Haji Osman"
              fallbackLabel="Portrait coming soon"
              wrapperClassName="aspect-[4/5] w-full rounded-[1.75rem] border border-border shadow-lifted"
              loading="eager"
            />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <RevealGroup className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={revealItem}
            className="group relative bg-card p-6 transition-colors hover:bg-surface-muted"
          >
            <p className="font-display text-4xl font-semibold text-foreground md:text-5xl">
              <AnimatedCounter value={Number(stat.value) || 0} />
              {stat.plus && Number(stat.value) > 0 && <span className="text-gradient">+</span>}
            </p>
            <p className="mt-1.5 text-xs uppercase tracking-[0.15em] text-muted-foreground">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </RevealGroup>

      {/* Featured research */}
      <section className="mt-20">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-foreground md:text-3xl">Highlighted Research</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Peer-reviewed work on HMIS, surveillance, and data use.
            </p>
          </div>
          <Link
            to="/research"
            className="shrink-0 text-sm font-semibold text-primary hover:underline"
          >
            View all
          </Link>
        </Reveal>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {research.isLoading &&
            Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}

          {research.isError && (
            <ErrorState className="md:col-span-2" onRetry={() => research.refetch()} />
          )}

          {!research.isLoading &&
            !research.isError &&
            featured.map((item, i) => (
              <Reveal key={item._id} delay={i * 0.05}>
                <article className="group h-full rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lifted">
                  {item.topic && (
                    <Badge variant="secondary" className="uppercase tracking-wide">
                      {item.topic}
                    </Badge>
                  )}
                  <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
                  {item.journal && (
                    <p className="text-sm text-muted-foreground">
                      {item.journal} · {item.year}
                    </p>
                  )}
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{item.summary}</p>
                  {(item.externalLink || item.pdfUrl) && (
                    <a
                      href={resolveMediaUrl(item.externalLink || item.pdfUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
                    >
                      Read more <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
                </article>
              </Reveal>
            ))}

          {!research.isLoading && !research.isError && featured.length === 0 && (
            <EmptyState
              className="md:col-span-2"
              title="Research is on the way"
              description="Publications will appear here as they are added."
            />
          )}
        </div>
      </section>

      {/* Upcoming events */}
      <section className="mt-20">
        <Reveal className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-foreground md:text-3xl">Upcoming Engagements</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Seminars, donor briefings, and training missions.
            </p>
          </div>
          <Link to="/events" className="shrink-0 text-sm font-semibold text-primary hover:underline">
            View calendar
          </Link>
        </Reveal>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {events.isLoading &&
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}

          {events.isError && (
            <ErrorState className="md:col-span-3" onRetry={() => events.refetch()} />
          )}

          {!events.isLoading &&
            !events.isError &&
            upcoming.map((event, i) => (
              <Reveal key={event._id} delay={i * 0.05}>
                <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-lifted">
                  {(event.images?.length || event.imageUrl) && (
                    <ImageGallery
                      images={event.images?.length ? event.images : [event.imageUrl!]}
                      alt={event.name}
                      layout="grid"
                      className="mb-4"
                    />
                  )}
                  <p className="line-clamp-2 text-xs uppercase tracking-wide text-secondary">{event.role}</p>
                  <h3 className="mt-1 line-clamp-2 font-semibold text-foreground">{event.name}</h3>
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
                </article>
              </Reveal>
            ))}

          {!events.isLoading && !events.isError && upcoming.length === 0 && (
            <EmptyState
              className="md:col-span-3"
              title="No engagements scheduled"
              description="Check back soon for upcoming seminars and trainings."
              icon={<CalendarDays className="h-5 w-5" />}
            />
          )}
        </div>
      </section>
    </>
  );
};

export default HomePage;
