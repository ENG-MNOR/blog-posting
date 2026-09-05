import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { formatDistanceToNow } from 'date-fns';
import { Mail, MailOpen, Reply, Search, Send, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMessages, useMutateMessages } from '@/hooks/useApi';
import { toApiError } from '@/api/client';
import type { Message } from '@/types';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { SkeletonCard } from '@/components/ui/skeleton';
import { EmptyState, ErrorState } from '@/components/ui/states';
import { ConfirmDialog, useConfirm } from '@/components/ui/confirm-dialog';

const MessageCard = ({ message }: { message: Message }) => {
  const mutations = useMutateMessages();
  const [replyOpen, setReplyOpen] = useState(false);
  const [reply, setReply] = useState('');
  const confirm = useConfirm<Message>();

  const send = async () => {
    if (reply.trim().length < 2) return;
    try {
      await mutations.reply.mutateAsync({ id: message._id, message: reply.trim() });
      toast.success('Reply sent');
      setReply('');
      setReplyOpen(false);
    } catch (error) {
      toast.error(toApiError(error).message);
    }
  };

  return (
    <article
      className={`rounded-2xl border bg-card p-5 shadow-soft transition-colors ${
        message.status === 'unread' ? 'border-primary/40' : 'border-border'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{message.name}</span>
            <Badge variant="outline">{message.requestType}</Badge>
            {message.status === 'unread' && <Badge variant="warning">Unread</Badge>}
            {message.status === 'replied' && <Badge variant="success">Replied</Badge>}
          </div>
          <a href={`mailto:${message.email}`} className="text-xs text-primary hover:underline">
            {message.email}
          </a>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
        </span>
      </div>

      <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{message.message}</p>

      {message.replies && message.replies.length > 0 && (
        <div className="mt-4 space-y-2 border-l-2 border-border pl-3">
          {message.replies.map((r, i) => (
            <div key={i} className="rounded-lg bg-muted/60 p-3 text-sm">
              <p className="whitespace-pre-line text-foreground">{r.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Sent {formatDistanceToNow(new Date(r.sentAt), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      )}

      {replyOpen && (
        <div className="mt-4 rounded-xl border border-border p-3">
          <Textarea
            rows={3}
            autoFocus
            placeholder={`Reply to ${message.name}…`}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setReplyOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={send} disabled={mutations.reply.isPending || reply.trim().length < 2}>
              {mutations.reply.isPending ? <Spinner /> : <Send size={14} />}
              Send reply
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!replyOpen && (
          <Button variant="outline" size="sm" onClick={() => setReplyOpen(true)}>
            <Reply size={14} /> Reply
          </Button>
        )}
        {message.status === 'unread' ? (
          <Button variant="ghost" size="sm" onClick={() => mutations.markRead.mutate(message._id)}>
            <MailOpen size={14} /> Mark read
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => mutations.markUnread.mutate(message._id)}>
            <Mail size={14} /> Mark unread
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10"
          onClick={() => confirm.ask(message)}
        >
          <Trash2 size={14} /> Delete
        </Button>
      </div>

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(o) => !o && confirm.close()}
        title="Delete this message?"
        description="This removes the message and its replies permanently."
        confirmLabel="Delete"
        destructive
        loading={confirm.loading}
        onConfirm={() =>
          confirm.run(async (m) => {
            try {
              await mutations.remove.mutateAsync(m._id);
              toast.success('Message deleted');
            } catch (error) {
              toast.error(toApiError(error).message);
              throw error;
            }
          })
        }
      />
    </article>
  );
};

const MessageCenterPage = () => {
  const { data, isLoading, isError, refetch } = useMessages();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...(data ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return q
      ? list.filter((m) => [m.name, m.email, m.message].some((f) => f?.toLowerCase().includes(q)))
      : list;
  }, [data, query]);

  const buckets = {
    all: filtered,
    unread: filtered.filter((m) => m.status === 'unread'),
    replied: filtered.filter((m) => m.status === 'replied'),
  };

  const renderList = (list: Message[], emptyLabel: string) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      );
    }
    if (isError) return <ErrorState onRetry={() => refetch()} />;
    if (list.length === 0) {
      return <EmptyState title={emptyLabel} icon={<Mail className="h-5 w-5" />} />;
    }
    return (
      <div className="space-y-4">
        {list.map((m) => (
          <MessageCard key={m._id} message={m} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Messages · Admin</title>
      </Helmet>
      <PageHeader
        eyebrow="Inbox"
        title="Messages"
        description="Requests submitted from the public contact form."
        actions={
          <Input
            icon={<Search />}
            placeholder="Search messages…"
            className="w-48 sm:w-64"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        }
      />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({buckets.all.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({buckets.unread.length})</TabsTrigger>
          <TabsTrigger value="replied">Replied ({buckets.replied.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all">{renderList(buckets.all, 'Inbox is empty')}</TabsContent>
        <TabsContent value="unread">{renderList(buckets.unread, 'Nothing unread')}</TabsContent>
        <TabsContent value="replied">{renderList(buckets.replied, 'No replies sent yet')}</TabsContent>
      </Tabs>
    </div>
  );
};

export default MessageCenterPage;
