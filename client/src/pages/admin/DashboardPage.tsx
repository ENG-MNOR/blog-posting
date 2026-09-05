import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CalendarClock,
  FileSearch,
  MailWarning,
  Users as UsersIcon,
  ArrowRight,
} from 'lucide-react';
import { useDashboardResearch, useEvents, useMessages, useUsers } from '@/hooks/useApi';
import { useAuthStore } from '@/store/auth';
import { resolveMediaUrl } from '@/lib/media';
import { useChartTheme } from '@/lib/chart-theme';
import { Img } from '@/components/ui/image';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { ChartCard } from '@/components/admin/ChartCard';
import { EmptyState } from '@/components/ui/states';

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'Pending',
  published: 'Published',
};

const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';
  const chart = useChartTheme();

  const research = useDashboardResearch();
  const events = useEvents();
  const messages = useMessages();
  const users = useUsers({ enabled: isAdmin });

  const researchList = research.data ?? [];
  const eventList = events.data ?? [];
  const messageList = messages.data ?? [];

  const unread = messageList.filter((m) => m.status === 'unread');
  const published = researchList.filter((r) => r.status === 'published');
  const upcoming = eventList.filter(
    (e) => e.category === 'upcoming' || new Date(e.date).getTime() >= Date.now(),
  );

  const statusData = useMemo(() => {
    const counts = researchList.reduce<Record<string, number>>((acc, r) => {
      const key = r.status || 'draft';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([key, value]) => ({
      name: statusLabels[key] ?? key,
      value,
    }));
  }, [researchList]);

  const yearData = useMemo(() => {
    const counts = researchList.reduce<Record<string, number>>((acc, r) => {
      const key = String(r.year ?? '—');
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, count]) => ({ year, count }));
  }, [researchList]);

  const requestTypeData = useMemo(() => {
    const counts = messageList.reduce<Record<string, number>>((acc, m) => {
      const key = m.requestType || 'other';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
    }));
  }, [messageList]);

  const recentMessages = useMemo(
    () =>
      [...messageList]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [messageList],
  );
  const recentResearch = useMemo(
    () =>
      [...researchList]
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
        )
        .slice(0, 5),
    [researchList],
  );
  const recentEvents = useMemo(
    () =>
      [...eventList]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .filter((e) => e.category === 'upcoming' || new Date(e.date).getTime() >= Date.now())
        .slice(0, 5),
    [eventList],
  );

  const anyLoading = research.isLoading || events.isLoading || messages.isLoading;

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Dashboard | Admin</title>
      </Helmet>

      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'Admin'}`}
        description="A snapshot of research, engagements, and inbound requests."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Research entries"
          value={researchList.length}
          hint={`${published.length} published`}
          icon={FileSearch}
          to="/admin/research"
          loading={research.isLoading}
          tone="primary"
        />
        <StatCard
          label="Upcoming events"
          value={upcoming.length}
          hint={`${eventList.length} total`}
          icon={CalendarClock}
          to="/admin/events"
          loading={events.isLoading}
          tone="secondary"
        />
        <StatCard
          label="Unread messages"
          value={unread.length}
          hint={`${messageList.length} total`}
          icon={MailWarning}
          to="/admin/messages"
          loading={messages.isLoading}
          tone={unread.length ? 'warning' : 'success'}
        />
        {isAdmin ? (
          <StatCard
            label="Team members"
            value={users.data?.length ?? 0}
            icon={UsersIcon}
            to="/admin/users"
            loading={users.isLoading}
            tone="success"
          />
        ) : (
          <StatCard
            label="Past events"
            value={eventList.length - upcoming.length}
            icon={CalendarClock}
            to="/admin/events"
            loading={events.isLoading}
            tone="primary"
          />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="Research by status"
          loading={research.isLoading}
          error={research.isError}
          onRetry={() => research.refetch()}
          isEmpty={statusData.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {statusData.map((entry, i) => (
                  <Cell key={entry.name} fill={chart.categorical[i % chart.categorical.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'rgb(var(--color-popover))',
                  border: '1px solid rgb(var(--color-border))',
                  borderRadius: 12,
                  color: 'rgb(var(--color-popover-foreground))',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {statusData.map((entry, i) => (
              <span key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: chart.categorical[i % chart.categorical.length] }}
                />
                {entry.name} ({entry.value})
              </span>
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title="Research by year"
          loading={research.isLoading}
          error={research.isError}
          onRetry={() => research.refetch()}
          isEmpty={yearData.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearData}>
              <CartesianGrid vertical={false} stroke={chart.grid} strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fill: chart.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: chart.axis, fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                cursor={{ fill: 'rgb(var(--color-muted) / 0.6)' }}
                contentStyle={{
                  background: 'rgb(var(--color-popover))',
                  border: '1px solid rgb(var(--color-border))',
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="count" fill={chart.primary} radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Requests by type"
          loading={messages.isLoading}
          error={messages.isError}
          onRetry={() => messages.refetch()}
          isEmpty={requestTypeData.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={requestTypeData} layout="vertical">
              <CartesianGrid horizontal={false} stroke={chart.grid} strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} tick={{ fill: chart.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="type" width={90} tick={{ fill: chart.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgb(var(--color-muted) / 0.6)' }}
                contentStyle={{
                  background: 'rgb(var(--color-popover))',
                  border: '1px solid rgb(var(--color-border))',
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="count" fill={chart.secondary} radius={[0, 6, 6, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-border bg-card shadow-soft">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h3 className="text-sm font-semibold text-foreground">Upcoming events</h3>
            <Link to="/admin/events" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {events.isLoading && !eventList.length ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-5">
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton mt-2 h-3 w-1/3" />
                </div>
              ))
            ) : events.isError ? (
              <div className="p-5">
                <p className="text-sm text-destructive">Could not load events.</p>
              </div>
            ) : recentEvents.length ? (
              recentEvents.map((e) => (
                <article key={e._id} className="flex items-start gap-3 p-5">
                  <Img
                    src={resolveMediaUrl(e.images?.[0] ?? e.imageUrl)}
                    alt=""
                    compact
                    wrapperClassName="h-10 w-10 shrink-0 rounded-lg border border-border"
                  />
                  <div className="min-w-0">
                    <Link
                      to="/admin/events"
                      className="line-clamp-1 text-sm font-medium text-foreground hover:text-primary"
                    >
                      {e.name}
                    </Link>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarClock className="h-3 w-3" />
                      {new Date(e.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {e.location ? ` · ${e.location}` : ''}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <EmptyState
                title="Nothing scheduled"
                className="border-0 bg-transparent"
                icon={<CalendarClock className="h-5 w-5" />}
              />
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card shadow-soft">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h3 className="text-sm font-semibold text-foreground">Recent messages</h3>
            <Link to="/admin/messages" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {anyLoading && !messageList.length ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-5">
                  <div className="skeleton h-4 w-1/3" />
                  <div className="skeleton mt-2 h-3 w-2/3" />
                </div>
              ))
            ) : recentMessages.length ? (
              recentMessages.map((m) => (
                <article key={m._id} className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{m.name}</span>
                      <Badge variant={m.status === 'unread' ? 'warning' : 'muted'}>{m.status}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{m.message}</p>
                </article>
              ))
            ) : (
              <EmptyState title="No messages yet" className="border-0 bg-transparent" icon={<MailWarning className="h-5 w-5" />} />
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card shadow-soft">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h3 className="text-sm font-semibold text-foreground">Recent research</h3>
            <Link to="/admin/research" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {research.isLoading && !researchList.length ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-5">
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton mt-2 h-3 w-1/3" />
                </div>
              ))
            ) : recentResearch.length ? (
              recentResearch.map((r) => (
                <article key={r._id} className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to="/admin/research"
                      className="line-clamp-2 text-sm font-medium text-foreground hover:text-primary"
                    >
                      {r.title}
                    </Link>
                    <Badge
                      variant={
                        r.status === 'published'
                          ? 'success'
                          : r.status === 'pending_review'
                            ? 'warning'
                            : 'muted'
                      }
                    >
                      {statusLabels[r.status] ?? r.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.year}
                    {r.journal ? ` · ${r.journal}` : ''}
                  </p>
                </article>
              ))
            ) : (
              <EmptyState title="No research yet" className="border-0 bg-transparent" icon={<FileSearch className="h-5 w-5" />} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
