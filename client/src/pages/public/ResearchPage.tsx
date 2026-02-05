import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useResearch } from '@/hooks/useApi';

const ResearchPage = () => {
  const [topic, setTopic] = useState('');
  const [year, setYear] = useState('');

  // Fetch all research data (no filters)
  const { data: allResearch, isLoading } = useResearch();

  // Extract unique topics and years from ALL data
  const topics = useMemo(() => 
    Array.from(new Set((allResearch ?? []).map((item) => item.topic).filter(Boolean))).sort(),
    [allResearch]
  );
  
  const years = useMemo(() => 
    Array.from(new Set((allResearch ?? []).map((item) => item.year))).sort((a, b) => b - a),
    [allResearch]
  );

  // Filter data client-side based on selection
  const filteredData = useMemo(() => {
    if (!allResearch) return [];
    return allResearch.filter(item => {
      const matchesTopic = !topic || item.topic === topic;
      const matchesYear = !year || item.year === Number(year);
      return matchesTopic && matchesYear;
    });
  }, [allResearch, topic, year]);

  return (
    <>
      <Helmet>
        <title>Research & Publications | Nour Haji</title>
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
          <div className="relative w-full sm:w-64">
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm outline-none focus:border-primary"
            >
              <option value="">All Topics</option>
              {topics.map((item) => (
                <option key={item} value={item || ''}>
                  {item}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

          <div className="relative w-full sm:w-48">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm outline-none focus:border-primary"
            >
              <option value="">All Years</option>
              {years.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {isLoading && <p>Loading research...</p>}
          {!isLoading &&
            filteredData.map((item) => (
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
          {!isLoading && !filteredData.length && (
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





