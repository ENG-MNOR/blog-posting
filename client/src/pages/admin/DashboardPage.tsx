import { useState } from 'react';
import { useDashboardResearch, useEvents, useMessages, useUsers, useMutateMessages } from '@/hooks/useApi';
import { useAuthStore } from '@/store/auth';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FileSearch,
  CalendarDays,
  History,
  MessageCircleMore,
  Users,
  ArrowRight,
  CheckCircle,
  Clock,
  File,
  Send,
  X
} from 'lucide-react';

// StatCard with icons
const StatCard = ({
  label,
  value,
  icon: Icon,
  colorClass = "bg-primary/10 text-primary"
}: {
  label: string;
  value: number | string;
  icon: any;
  colorClass?: string;
}) => (
  <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:scale-[1.02] dark:border-slate-800 dark:bg-slate-900">
    <div className={`rounded-xl p-3 ${colorClass}`}>
      <Icon size={26} />
    </div>
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
    </div>
  </div>
);

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const { data: research } = useDashboardResearch();
  const { data: upcoming } = useEvents('upcoming');
  const { data: past } = useEvents('past');
  const { data: allEvents } = useEvents();
  const { data: messages } = useMessages();
  const { data: users } = useUsers(); // Will fetch if admin, or fail gracefully/return empty if not authorized (handled by API/hook logic usually, but we should guard)
  
  const messageMutations = useMutateMessages();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const unreadMessages = messages?.filter(m => m.status === 'unread') || [];
  const recentResearch = research ? [...research].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 2) : [];

  const handleReply = async (messageId: string) => {
    if (!replyContent.trim()) return;
    const toastId = toast.loading("Sending reply...");
    try {
      await messageMutations.reply.mutateAsync({ id: messageId, reply: replyContent });
      toast.success("Reply sent successfully");
      setReplyingTo(null);
      setReplyContent("");
    } catch (error) {
      toast.error("Failed to send reply");
    } finally {
      toast.dismiss(toastId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300"><CheckCircle size={10} /> Published</span>;
      case 'pending_review':
        return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"><Clock size={10} /> Pending</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-300"><File size={10} /> Draft</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-primary/70 dark:text-sky-400/70">
          Overview
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-800 dark:text-white">Welcome back, {user?.name}</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Research Entries"
          value={research?.length ?? 0}
          icon={FileSearch}
          colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
        />
        <StatCard
          label="Unread Messages"
          value={unreadMessages.length}
          icon={MessageCircleMore}
          colorClass="bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
        />
     <StatCard
          label="Total Upcoming Events"
          value={upcoming?.length ?? 0}
          icon={CalendarDays}
          colorClass="bg-primary/10 text-primary dark:bg-sky-900/20 dark:text-sky-400"
        />
        <StatCard
          label="Total Recent Events"
          value={past?.length ?? 0}
          icon={History}
          colorClass="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
        />
        <StatCard
          label="Total Unread Messages"
          value={messages?.filter((m) => m.status === 'unread').length ?? 0}
          icon={MessageCircleMore}
          colorClass="bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400"
        />

        {user?.role === 'admin' ? (
           <StatCard
            label="Total Users"
            value={users?.length ?? 0}
            icon={Users}
            colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
          />
        ) : (
          <StatCard
            label="Past Events"
            value={past?.length ?? 0}
            icon={History}
            colorClass="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column (Main Content) */}
        <div className="space-y-8 lg:col-span-2">
            
            {/* Recent Messages */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Recent Unread Messages</h2>
                    <Link to="/admin/messages" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline dark:text-sky-400">
                        View All <ArrowRight size={12} />
                    </Link>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {unreadMessages.slice(0, 3).map((msg) => (
                    <article key={msg._id} className="p-6 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <div className="mb-2 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{msg.name}</span>
                                <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">{msg.requestType}</span>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-400">{msg.email}</p>
                        </div>
                        <span className="whitespace-nowrap text-xs text-slate-400">
                        {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="mb-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{msg.message}</p>
                    
                    {replyingTo === msg._id ? (
                        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
                            <textarea 
                                className="w-full resize-none border-0 p-0 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-0 dark:bg-slate-800 dark:text-slate-200"
                                rows={3}
                                placeholder={`Reply to ${msg.name}...`}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                autoFocus
                            />
                            <div className="mt-2 flex justify-end gap-2 border-t border-slate-100 pt-2 dark:border-slate-700">
                                <button 
                                    onClick={() => { setReplyingTo(null); setReplyContent(""); }}
                                    className="rounded-md px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => handleReply(msg._id)}
                                    className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs text-white hover:bg-primary/90 dark:bg-sky-600 dark:hover:bg-sky-500"
                                >
                                    <Send size={12} /> Send Reply
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setReplyingTo(msg._id)}
                            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 dark:text-sky-400 dark:hover:text-sky-300"
                        >
                            <MessageCircleMore size={14} /> Reply
                        </button>
                    )}
                    </article>
                ))}
                {!unreadMessages.length && (
                    <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        No new unread messages.
                    </div>
                )}
                </div>
            </section>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-8">
             {/* Recent Researchers Panel */}
             <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
                    <h3 className="font-semibold text-slate-800 dark:text-white">Recent Research</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentResearch.map((item) => (
                        <div key={item._id} className="group p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <div className="mb-1 flex items-start justify-between gap-2">
                                <Link to="/admin/research" className="line-clamp-2 text-sm font-medium text-slate-800 transition-colors group-hover:text-primary dark:text-slate-200 dark:group-hover:text-sky-400">
                                    {item.title}
                                </Link>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
                                {getStatusBadge(item.status || 'draft')}
                            </div>
                            {item.author && (
                                <p className="mt-2 flex items-center gap-1 border-t border-slate-100 pt-2 text-xs text-slate-400 dark:border-slate-800">
                                    <Users size={10} /> {typeof item.author === 'object' ? item.author.name : 'Unknown'}
                                </p>
                            )}
                        </div>
                    ))}
                    {!recentResearch.length && (
                         <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                            No recent research items.
                        </div>
                    )}
                </div>
                <div className="border-t border-slate-100 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-800/50">
                    <Link to="/admin/research" className="text-xs font-medium text-primary hover:underline dark:text-sky-400">
                        View All Research
                    </Link>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
