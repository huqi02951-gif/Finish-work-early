import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, PackageCheck, RefreshCw, Send, ShieldCheck, XCircle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useToast } from '../components/common/Toast';
import {
  connectPantrySocket,
  DirectMessage,
  OrderStatus,
  pantryApi,
  PantryConversation,
  PantryNotification,
  TradeOrder,
} from '../services/pantryApi';
import { getBestToken } from '../services/authService';

const Messages: React.FC = () => {
  const toast = useToast();
  const [tab, setTab] = useState<'messages' | 'orders' | 'notifications'>('messages');
  const [conversations, setConversations] = useState<PantryConversation[]>([]);
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [notifications, setNotifications] = useState<PantryNotification[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    if (!getBestToken()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [rows, orderRows, notificationRows] = await Promise.all([
        pantryApi.listConversations(),
        pantryApi.listMyOrders({ take: 80 }),
        pantryApi.listNotifications(80),
      ]);
      setConversations(rows);
      setOrders(orderRows);
      setNotifications(notificationRows);
      if (!activeId && rows[0]) setActiveId(rows[0].id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '消息加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const socket = connectPantrySocket();
    if (!socket) return undefined;
    socket.on('connect', loadAll);
    socket.on('conversation:update', loadAll);
    socket.on('order:update', loadAll);
    socket.on('pantry:notification', loadAll);
    socket.on('message:new', (payload: { conversationId?: number; message?: DirectMessage }) => {
      if (payload.conversationId === activeId && payload.message) {
        setMessages((prev) => [...prev, payload.message as DirectMessage]);
      }
      loadAll();
    });
    return () => {
      socket.disconnect();
    };
  }, [activeId]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    pantryApi.getMessages(activeId)
      .then(setMessages)
      .catch((err) => toast.error(err instanceof Error ? err.message : '会话加载失败'));
  }, [activeId]);

  const send = async () => {
    if (!activeId || !draft.trim()) return;
    try {
      const message = await pantryApi.sendMessage(activeId, draft.trim());
      setMessages((prev) => [...prev, message]);
      setDraft('');
      await loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '发送失败');
    }
  };

  const updateOrder = async (orderId: number, status: OrderStatus) => {
    try {
      await pantryApi.updateOrderStatus(orderId, status);
      await loadAll();
      toast.success('订单状态已更新');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '订单更新失败');
    }
  };

  const markRead = async (notification: PantryNotification) => {
    if (notification.readAt) return;
    try {
      await pantryApi.markNotificationRead(notification.id);
      await loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '通知更新失败');
    }
  };

  const active = conversations.find((item) => item.id === activeId);
  const unreadMessages = conversations.reduce((sum, item) => sum + (item.unreadCount || 0), 0);
  const unreadNotifications = notifications.filter((item) => !item.readAt).length;
  const activeOrders = orders.filter((item) => !['COMPLETED', 'CANCELLED'].includes(item.status)).length;

  return (
    <AppLayout title="消息">
      <div className="px-4 py-5 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'notifications', label: '系统通知', icon: ShieldCheck, count: unreadNotifications },
            { key: 'orders', label: '黑市订单', icon: PackageCheck, count: activeOrders },
            { key: 'messages', label: '茶水间私信', icon: Bell, count: unreadMessages },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setTab(item.key as 'messages' | 'orders' | 'notifications')}
              className={`relative bg-white rounded-2xl border p-4 text-center shadow-sm ${tab === item.key ? 'border-brand-dark/30' : 'border-brand-border/10'}`}
            >
              {item.count > 0 && <span className="absolute right-3 top-3 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white">{item.count}</span>}
              <item.icon className="mx-auto mb-2 text-brand-dark" size={20} />
              <p className="text-[11px] font-bold text-brand-gray">{item.label}</p>
            </button>
          ))}
        </div>

        {tab === 'orders' ? (
          <div className="bg-white border border-brand-border/10 rounded-2xl overflow-hidden shadow-sm p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-black text-brand-dark">黑市暗单订单</h3>
              <button onClick={loadAll} className="text-brand-gray hover:text-brand-dark">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {orders.length === 0 ? (
                <div className="col-span-full p-8 text-center text-xs text-brand-gray">暂无订单。可从地下茶水间黑市暗单发起交易。</div>
              ) : orders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-brand-border/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-brand-dark">{order.listingTitle}</p>
                      <p className="mt-1 text-xs text-brand-gray">对方：{order.counterpartyAlias}</p>
                    </div>
                    <span className="rounded-full bg-brand-light-gray px-2 py-1 text-[10px] font-black text-brand-dark">{ORDER_LABELS[order.status]}</span>
                  </div>
                  {order.note && <p className="mt-3 text-xs text-brand-gray">备注：{order.note}</p>}
                  {order.offPlatformNote && <p className="mt-2 text-xs text-brand-gray">线下付款：{order.offPlatformNote}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {order.status === 'REQUESTED' && (
                      <>
                        <button onClick={() => updateOrder(order.id, 'ACCEPTED')} className="rounded-xl bg-brand-dark px-3 py-2 text-xs font-black text-white">接单</button>
                        <button onClick={() => updateOrder(order.id, 'CANCELLED')} className="rounded-xl border border-brand-border/20 px-3 py-2 text-xs font-black text-brand-gray">取消</button>
                      </>
                    )}
                    {order.status === 'ACCEPTED' && (
                      <>
                        <button onClick={() => updateOrder(order.id, 'PAID_OFF_PLATFORM')} className="rounded-xl bg-brand-dark px-3 py-2 text-xs font-black text-white">标记线下付款</button>
                        <button onClick={() => updateOrder(order.id, 'DISPUTED')} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-black text-red-600">纠纷</button>
                      </>
                    )}
                    {order.status === 'PAID_OFF_PLATFORM' && (
                      <>
                        <button onClick={() => updateOrder(order.id, 'COMPLETED')} className="rounded-xl bg-green-600 px-3 py-2 text-xs font-black text-white">确认完成</button>
                        <button onClick={() => updateOrder(order.id, 'DISPUTED')} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-black text-red-600">纠纷</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : tab === 'notifications' ? (
          <div className="bg-white border border-brand-border/10 rounded-2xl overflow-hidden shadow-sm p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-black text-brand-dark">茶水间通知</h3>
              <button onClick={loadAll} className="text-brand-gray hover:text-brand-dark">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-brand-gray">暂无通知。</div>
              ) : notifications.map((notification) => (
                <button key={notification.id} onClick={() => markRead(notification)} className="w-full rounded-2xl border border-brand-border/10 p-4 text-left hover:bg-brand-light-gray/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-brand-dark">{notification.title}</p>
                      <p className="mt-1 text-xs text-brand-gray">{notification.body || '状态有更新'}</p>
                    </div>
                    {notification.readAt ? <CheckCircle2 size={16} className="text-green-600" /> : <XCircle size={16} className="text-red-500" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
        <div className="bg-white border border-brand-border/10 rounded-2xl overflow-hidden shadow-sm min-h-[520px] grid md:grid-cols-[280px_1fr]">
          <aside className="border-b md:border-b-0 md:border-r border-brand-border/10">
            <div className="p-4 flex items-center justify-between">
              <h3 className="text-sm font-black text-brand-dark">茶水间会话</h3>
              <button onClick={loadAll} className="text-brand-gray hover:text-brand-dark">
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="divide-y divide-brand-border/10">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-brand-gray">暂无私信。可从二手黑市集下单后自动创建会话。</div>
              ) : conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setActiveId(conversation.id)}
                  className={`w-full text-left p-4 hover:bg-brand-light-gray/40 ${activeId === conversation.id ? 'bg-brand-light-gray/60' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-black" style={{ color: conversation.otherColor }}>{conversation.otherAlias}</p>
                    <span className="flex items-center gap-1 text-[10px] text-brand-gray">
                      {(conversation.unreadCount || 0) > 0 && <span className="rounded-full bg-red-500 px-1.5 py-0.5 font-black text-white">{conversation.unreadCount}</span>}
                      {new Date(conversation.lastAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-brand-gray line-clamp-1">{conversation.lastMessage || '还没有消息'}</p>
                </button>
              ))}
            </div>
          </aside>

          <section className="flex flex-col min-h-[520px]">
            <div className="p-4 border-b border-brand-border/10">
              <h3 className="text-sm font-black text-brand-dark">{active ? active.otherAlias : '选择一个会话'}</h3>
              <p className="text-[11px] text-brand-gray mt-1">实时私信，断线时会回退为刷新拉取。</p>
            </div>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-brand-light-gray/20">
              {messages.map((message) => (
                <div key={message.id} className="bg-white border border-brand-border/10 rounded-2xl p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black" style={{ color: message.aliasColor }}>{message.anonymousAlias}</span>
                    <span className="text-[10px] text-brand-gray">{new Date(message.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-brand-dark whitespace-pre-wrap">{message.content}</p>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-brand-border/10 flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                disabled={!activeId}
                placeholder={activeId ? '输入私信内容' : '先选择一个会话'}
                className="flex-1 rounded-xl border border-brand-border/20 px-4 py-2 text-sm outline-none focus:border-brand-dark disabled:bg-brand-light-gray"
              />
              <button disabled={!activeId || !draft.trim()} onClick={send} className="rounded-xl bg-brand-dark text-white px-4 disabled:opacity-40">
                <Send size={18} />
              </button>
            </div>
          </section>
        </div>
        )}
      </div>
    </AppLayout>
  );
};

const ORDER_LABELS: Record<OrderStatus, string> = {
  REQUESTED: '待接单',
  ACCEPTED: '已接单',
  PAID_OFF_PLATFORM: '已线下付款',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  DISPUTED: '纠纷中',
};

export default Messages;
