import { useMutateMessages, useMessages } from '@/hooks/useApi';

const MessageCenterPage = () => {
  const { data } = useMessages();
  const mutations = useMutateMessages();

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-dark">Inbox</h1>
        <p className="text-sm text-slate-500">Messages submitted from the public site.</p>
      </div>
      <div className="space-y-4">
        {data?.map((message) => (
          <article
            key={message._id}
            className={`rounded-3xl border p-5 shadow-sm ${
              message.status === 'unread' ? 'border-primary/30 bg-primary/5' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-dark">{message.name}</p>
                <p className="text-sm text-slate-500">
                  {message.email} · {message.requestType}
                </p>
              </div>
              {message.status === 'unread' && (
                <button
                  onClick={() => mutations.markRead.mutate(message._id)}
                  className="rounded-full border border-primary px-4 py-1 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
                >
                  Mark as read
                </button>
              )}
            </div>
            <p className="mt-3 text-slate-600">{message.message}</p>
          </article>
        ))}
        {!data?.length && (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-slate-500">
            Inbox is empty.
          </p>
        )}
      </div>
    </section>
  );
};

export default MessageCenterPage;





