import { useResearch, useEvents, useMessages } from '@/hooks/useApi';
import {
  FileSearch,
  CalendarDays,
  History,
  MessageCircleMore,
} from 'lucide-react';

// StatCard with icons
const StatCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: any;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4">
    <div className="rounded-xl bg-primary/10 p-3 text-primary">
      <Icon size={26} />
    </div>
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-3xl font-semibold text-primary">{value}</p>
    </div>
  </div>
);

const DashboardPage = () => {
  const { data: research } = useResearch();
  const { data: upcoming } = useEvents('upcoming');
  const { data: past } = useEvents('past');
  const { data: messages } = useMessages();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-primary/70">
          Overview
        </p>
        <h1 className="text-3xl font-semibold text-dark">Welcome back</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Total Research Entries"
          value={research?.length ?? 0}
          icon={FileSearch}
        />
        <StatCard
          label="Total Upcoming Events"
          value={upcoming?.length ?? 0}
          icon={CalendarDays}
        />
        <StatCard
          label="Total Recent Events"
          value={past?.length ?? 0}
          icon={History}
        />
        <StatCard
          label="Total Unread Messages"
          value={messages?.filter((m) => m.status === 'unread').length ?? 0}
          icon={MessageCircleMore}
        />
      </div>

      {/* Recent Messages */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-dark">Recent Messages</h2>
        <div className="mt-4 space-y-3">
          {messages?.slice(0, 5).map((msg) => (
            <article key={msg._id} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-700">{msg.name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(msg.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    •{' '}
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className="text-xs uppercase text-slate-400">
                  {msg.requestType}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{msg.message}</p>
            </article>
          ))}
          {!messages?.length && (
            <p className="text-sm text-slate-500">No messages yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;


