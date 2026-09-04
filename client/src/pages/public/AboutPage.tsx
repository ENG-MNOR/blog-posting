import { Helmet } from 'react-helmet-async';
import { useContent } from '@/hooks/useApi';

const AboutPage = () => {
  const { data } = useContent('about');

  return (
    <>
      <Helmet>
        <title>About Nor Haji Osman</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-primary/80 dark:text-sky-400/80">About</p>
          <h1 className="font-display text-4xl text-slate-900 dark:text-white">Driving data-driven health systems</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            {data?.intro ||
              'Nor is a seasoned public health leader helping governments translate data into decisive action across HMIS, IDSR, and immunization programs.'}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Key Roles & Experience</h2>
            <ul className="mt-4 space-y-2 text-slate-600 dark:text-slate-300">
              {(data?.roles?.length ? data.roles : ['Director, Health Information Systems', 'Advisor, WHO Horn of Africa'])?.map(
                (role) => (
                  <li key={role} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-secondary dark:bg-teal-400" />
                    <span>{role}</span>
                  </li>
                )
              )}
            </ul>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Areas of Expertise</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(data?.expertise?.length
                ? data.expertise
                : ['HMIS', 'Integrated Disease Surveillance', 'Immunization', 'Data Use', 'Capacity Building'])
                ?.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {item}
                  </span>
                ))}
            </div>
          </article>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-primary/10 via-white to-secondary/10 p-8 shadow-inner transition-colors dark:border-slate-800 dark:from-primary/5 dark:via-slate-900 dark:to-secondary/5">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Full Bio</h2>
          <p className="mt-4 leading-7 text-slate-700 whitespace-pre-line dark:text-slate-300">
            {data?.bio ||
              'Nor has led national health information system transformations, deployed IDSR platforms, and mentored emerging data leaders across East Africa. He specializes in aligning donors, ministries, and frontline teams around a common data vision.'}
          </p>
        </section>
      </div>
    </>
  );
};

export default AboutPage;





