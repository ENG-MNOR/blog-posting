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
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02]">
    <div className={`rounded-xl p-3 ${colorClass}`}>
      <Icon size={26} />
    </div>
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
        {label}
      </p>
      <p className="mt-1 text-3xl font-bold text-slate-800">{value}</p>
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
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800"><CheckCircle size={10} /> Published</span>;
      case 'pending_review':
        return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-medium text-yellow-800"><Clock size={10} /> Pending</span>;
      default:
        return <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-800"><File size={10} /> Draft</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-primary/70 font-semibold">
          Overview
        </p>
        <h1 className="text-3xl font-bold text-slate-800 mt-1">Welcome back, {user?.name}</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Research Entries"
          value={research?.length ?? 0}
          icon={FileSearch}
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Unread Messages"
          value={unreadMessages.length}
          icon={MessageCircleMore}
          colorClass="bg-purple-50 text-purple-600"
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

        {user?.role === 'admin' ? (
           <StatCard
            label="Total Users"
            value={users?.length ?? 0}
            icon={Users}
            colorClass="bg-emerald-50 text-emerald-600"
          />
        ) : (
          <StatCard
            label="Past Events"
            value={past?.length ?? 0}
            icon={History}
            colorClass="bg-slate-100 text-slate-600"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Recent Messages */}
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Recent Unread Messages</h2>
                    <Link to="/admin/messages" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                        View All <ArrowRight size={12} />
                    </Link>
                </div>
                <div className="divide-y divide-slate-100">
                {unreadMessages.slice(0, 3).map((msg) => (
                    <article key={msg._id} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800">{msg.name}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">{msg.requestType}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{msg.email}</p>
                        </div>
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(msg.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{msg.message}</p>
                    
                    {replyingTo === msg._id ? (
                        <div className="mt-4 bg-white border border-slate-200 rounded-lg p-3">
                            <textarea 
                                className="w-full text-sm border-0 focus:ring-0 p-0 resize-none text-slate-700 placeholder:text-slate-400"
                                rows={3}
                                placeholder={`Reply to ${msg.name}...`}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-100">
                                <button 
                                    onClick={() => { setReplyingTo(null); setReplyContent(""); }}
                                    className="text-xs px-3 py-1.5 rounded-md text-slate-600 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => handleReply(msg._id)}
                                    className="text-xs px-3 py-1.5 rounded-md bg-primary text-white hover:bg-primary/90 flex items-center gap-1"
                                >
                                    <Send size={12} /> Send Reply
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setReplyingTo(msg._id)}
                            className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                        >
                            <MessageCircleMore size={14} /> Reply
                        </button>
                    )}
                    </article>
                ))}
                {!unreadMessages.length && (
                    <div className="p-8 text-center text-slate-500 text-sm">
                        No new unread messages.
                    </div>
                )}
                </div>
            </section>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-8">
             {/* Recent Researchers Panel */}
             <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-semibold text-slate-800">Recent Research</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {recentResearch.map((item) => (
                        <div key={item._id} className="p-4 hover:bg-slate-50 transition-colors group">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <Link to="/admin/research" className="font-medium text-sm text-slate-800 line-clamp-2 group-hover:text-primary transition-colors">
                                    {item.title}
                                </Link>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-slate-500">{new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
                                {getStatusBadge(item.status || 'draft')}
                            </div>
                            {item.author && (
                                <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-100 flex items-center gap-1">
                                    <Users size={10} /> {typeof item.author === 'object' ? item.author.name : 'Unknown'}
                                </p>
                            )}
                        </div>
                    ))}
                    {!recentResearch.length && (
                         <div className="p-6 text-center text-slate-500 text-xs">
                            No recent research items.
                        </div>
                    )}
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                    <Link to="/admin/research" className="text-xs font-medium text-primary hover:underline">
                        View All Research
                    </Link>
                </div>
             </div>

             {/* System Status / Quick Info (Placeholder for Future Features) */}
             <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                <h3 className="font-semibold mb-2 relative z-10">System Status</h3>
                <div className="space-y-2 relative z-10">
                    <div className="flex justify-between text-xs text-slate-300">
                        <span>Server Status</span>
                        <span className="text-green-400 font-medium">Online</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                        <span>Database</span>
                        <span className="text-green-400 font-medium">Connected</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300">
                        <span>Last Backup</span>
                        <span>Today, 04:00 AM</span>
                    </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
