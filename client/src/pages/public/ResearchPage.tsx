import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useResearch } from '@/hooks/useApi';

const ResearchPage = () => {
  const [topic, setTopic] = useState('');
  const [year, setYear] = useState('');

  const filters = useMemo(
    () => ({
      topic: topic || undefined,
      year: year ? Number(year) : undefined
    }),
    [topic, year]
  );

  const { data, isLoading } = useResearch(filters);

  const topics = Array.from(new Set((data ?? []).map((item) => item.topic).filter(Boolean)));
  const years = Array.from(new Set((data ?? []).map((item) => item.year))).sort((a, b) => b - a);

  return (
    <>
      <Helmet>
        <title>Research & Publications | Dr. Nour Haji</title>
      </Helmet>
      <div className="space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-primary/80">Research</p>
          <h1 className="font-display text-4xl text-dark">Publications & Insights</h1>
          <p className="mt-3 text-lg text-slate-600">
            Explore peer-reviewed work covering HMIS, IDSR, immunization, and data use.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">All Topics</option>
            {topics.map((item) => (
              <option key={item} value={item || ''}>
                {item}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary"
          >
            <option value="">All Years</option>
            {years.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4">
          {isLoading && <p>Loading research...</p>}
          {!isLoading &&
            data?.map((item) => (
              <article key={item._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-secondary">{item.topic}</p>
                <h2 className="mt-2 text-xl font-semibold text-dark">{item.title}</h2>
                <p className="text-sm text-slate-500">
                  {item.journal} · {item.year}
                </p>
                <p className="mt-3 text-slate-600">{item.summary}</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-primary">
                  {item.pdfUrl && (
                    <a href={item.pdfUrl} target="_blank" rel="noreferrer">
                      Download PDF →
                    </a>
                  )}
                  {item.externalLink && (
                    <a href={item.externalLink} target="_blank" rel="noreferrer">
                      View journal →
                    </a>
                  )}
                </div>
              </article>
            ))}
          {!isLoading && !data?.length && (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-slate-500">
              No research items available yet. Please check back soon.
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ResearchPage;





