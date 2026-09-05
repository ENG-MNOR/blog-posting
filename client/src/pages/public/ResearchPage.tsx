import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText, Search, ExternalLink } from 'lucide-react';
import { useResearch } from '@/hooks/useApi';
import { Badge } from '@/components/ui/badge';
import { Input, Select } from '@/components/ui/input';
import { Reveal } from '@/components/ui/reveal';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';

const ResearchPage = () => {
  const { data, isLoading, isError, refetch } = useResearch();
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('');
  const [year, setYear] = useState('');

  const topics = useMemo(
    () => Array.from(new Set((data ?? []).map((r) => r.topic).filter(Boolean))).sort() as string[],
    [data],
  );
  const years = useMemo(
    () => Array.from(new Set((data ?? []).map((r) => r.year))).sort((a, b) => b - a),
    [data],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((item) => {
      const matchesQuery =
        !q ||
        [item.title, item.summary, item.journal, item.topic]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(q));
      const matchesTopic = !topic || item.topic === topic;
      const matchesYear = !year || item.year === Number(year);
      return matchesQuery && matchesTopic && matchesYear;
    });
  }, [data, query, topic, year]);

  const hasFilters = Boolean(query || topic || year);

  return (
    <>
      <Helmet>
        <title>Research &amp; Publications | Nor Haji Osman</title>
        <meta
          name="description"
          content="Peer-reviewed research and publications on HMIS, IDSR, immunization, and health data use."
        />
      </Helmet>

      <div className="space-y-8">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-primary">Research</p>
          <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
            Publications &amp; Insights
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Explore peer-reviewed work covering HMIS, IDSR, immunization, and data use.
          </p>
        </Reveal>

        <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:grid-cols-[1fr_auto_auto]">
          <Input
            icon={<Search />}
            placeholder="Search titles, journals, topics…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="sm:w-52"
            aria-label="Filter by topic"
          >
            <option value="">All topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="sm:w-36"
            aria-label="Filter by year"
          >
            <option value="">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-4">
          {isLoading && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}

          {isError && <ErrorState onRetry={() => refetch()} />}

          {!isLoading && !isError && filtered.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
                {hasFilters ? ' · filtered' : ''}
              </p>
              {filtered.map((item, i) => (
                <Reveal key={item._id} delay={Math.min(i * 0.04, 0.2)}>
                  <article className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-lifted">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.topic && (
                        <Badge variant="secondary" className="uppercase tracking-wide">
                          {item.topic}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{item.year}</span>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold text-foreground">{item.title}</h2>
                    {item.journal && (
                      <p className="text-sm text-muted-foreground">{item.journal}</p>
                    )}
                    <p className="mt-3 text-muted-foreground">{item.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-primary">
                      {item.pdfUrl && (
                        <a
                          href={item.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 hover:underline"
                        >
                          <FileText className="h-4 w-4" /> Download PDF
                        </a>
                      )}
                      {item.externalLink && (
                        <a
                          href={item.externalLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" /> View journal
                        </a>
                      )}
                    </div>
                  </article>
                </Reveal>
              ))}
            </>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <EmptyState
              title={hasFilters ? 'No matching research' : 'No publications yet'}
              description={
                hasFilters
                  ? 'Try clearing filters or adjusting your search.'
                  : 'Publications will appear here once added.'
              }
              icon={<FileText className="h-5 w-5" />}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ResearchPage;
