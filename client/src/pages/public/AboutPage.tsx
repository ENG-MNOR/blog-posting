import { Helmet } from 'react-helmet-async';
import { CheckCircle2 } from 'lucide-react';
import { useContent } from '@/hooks/useApi';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/ui/reveal';
import { SkeletonText } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/states';

const FALLBACK = {
  intro:
    'Nor Haji Osman is a seasoned HMIS specialist helping governments translate data into decisive action across HMIS, IDSR, and immunization programs.',
  roles: [
    'Director, Health Information Systems',
    'Advisor, WHO Horn of Africa',
    'Lead, National IDSR Rollout',
  ],
  expertise: [
    'HMIS',
    'Integrated Disease Surveillance',
    'Immunization',
    'Data Use & Governance',
    'Capacity Building',
  ],
  bio: 'Nor has led national health information system transformations, deployed IDSR platforms, and mentored emerging data leaders across East Africa. He specialises in aligning donors, ministries, and frontline teams around a common data vision.',
};

const AboutPage = () => {
  const { data, isLoading, isError, refetch } = useContent('about');

  const intro = data?.intro || FALLBACK.intro;
  const roles = data?.roles?.length ? data.roles : FALLBACK.roles;
  const expertise = data?.expertise?.length ? data.expertise : FALLBACK.expertise;
  const bio = data?.bio || FALLBACK.bio;

  return (
    <>
      <Helmet>
        <title>About | Nor Haji Osman</title>
        <meta
          name="description"
          content="Nor Haji Osman is an HMIS specialist focused on health information systems, disease surveillance, and data use."
        />
      </Helmet>

      <div className="space-y-14">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-primary">About</p>
          <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
            Driving data-driven health systems
          </h1>
          {isLoading ? (
            <SkeletonText lines={2} className="mt-5 max-w-2xl" />
          ) : (
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{intro}</p>
          )}
        </Reveal>

        {isError && <ErrorState onRetry={() => refetch()} />}

        {!isError && (
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <article className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-foreground">Key Roles &amp; Experience</h2>
                <ul className="mt-4 space-y-3">
                  {roles.map((role) => (
                    <li key={role} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                      <span>{role}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>

            <Reveal delay={0.05}>
              <article className="h-full rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-foreground">Areas of Expertise</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {expertise.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </article>
            </Reveal>
          </div>
        )}

        {!isError && (
          <Reveal>
            <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-secondary/10 p-8 shadow-soft">
              <h2 className="font-display text-2xl text-foreground">Full Biography</h2>
              {isLoading ? (
                <SkeletonText lines={5} className="mt-4" />
              ) : (
                <div className="prose prose-slate mt-4 max-w-none text-muted-foreground dark:prose-invert">
                  {bio.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}
            </section>
          </Reveal>
        )}
      </div>
    </>
  );
};

export default AboutPage;
