'use client';

import { useApp } from '@/context/AppContext';
import { ShoppingBag, Clock, ShieldCheck, ArrowLeft, PackageCheck, Truck } from 'lucide-react';
import Link from 'next/link';

const statusConfig: Record<string, { color: string; icon: typeof ShieldCheck }> = {
  'Funds Locked': { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: ShieldCheck },
  'Verified': { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: ShieldCheck },
  'In Transit': { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Truck },
  'Ready for Pickup': { color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', icon: PackageCheck },
  'Completed': { color: 'text-green-400 bg-green-500/10 border-green-500/20', icon: PackageCheck },
};

export default function OrdersPage() {
  const { orders, cancelOrder, confirmDelivery, clearCompletedOrders } = useApp();

  const orderCount = orders.length;

  return (
    <main className="min-h-screen bg-black text-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-450 hover:text-white active:text-white/90 transition-all duration-300 text-sm mb-8 group hover:scale-[1.01] active:scale-[0.99] interactive-bounce"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Page Header */}
        <div className="border-b border-zinc-900/60 pb-8 mb-10">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-blue-500" />
              <h1 className="text-3xl font-extrabold tracking-tight">Your Orders</h1>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('Clear the completed order history from your saved records?')) {
                  void clearCompletedOrders();
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 active:scale-[0.98] interactive-bounce"
            >
              Delete Completed History
            </button>
          </div>
          <p className="text-sm text-zinc-450 mt-2">
            {orderCount === 1
              ? 'You have 1 active order.'
              : `You have ${orderCount} active orders.`}
          </p>
        </div>

        {/* Empty State */}
        {orderCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingBag className="h-16 w-16 text-zinc-800 mb-6" />
            <h2 className="text-2xl font-bold text-zinc-300 mb-2">No orders yet</h2>
            <p className="text-zinc-500 text-sm max-w-sm mb-8">
              Start shopping and your orders will appear here. Every transaction is protected by our escrow system.
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-550 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] interactive-bounce glow-hover"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse Marketplace
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-6">
            {orders.map((order) => {
              const statusInfo = statusConfig[order.status] || statusConfig['Funds Locked'];
              const StatusIcon = statusInfo.icon;
              const isVerified = ['Verified', 'In Transit', 'Ready for Pickup', 'Completed'].includes(order.status);

              return (
                <div
                  key={order.id}
                  className={`glass-panel border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 ${
                    isVerified
                      ? 'border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.04)]'
                      : 'border-zinc-900/80 hover:border-zinc-700/60 hover:shadow-[0_8px_25px_rgba(0,0,0,0.4)]'
                  }`}
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-md">
                        {order.id}
                      </span>
                      <h3 className="text-base font-bold text-zinc-150 line-clamp-1">{order.productTitle}</h3>
                    </div>
                    <span className="text-lg font-extrabold text-zinc-100 shrink-0">
                      {order.formattedPrice || `₦${order.price.toLocaleString()}`}
                    </span>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-zinc-950/60 p-4 rounded-xl border border-zinc-900/70">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${statusInfo.color.split(' ')[0]}`} />
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${statusInfo.color}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Delivery Method */}
                    <div className="flex items-center gap-1.5 text-[13px] text-zinc-400">
                      {order.deliveryMethod === 'pickup' ? (
                        <>
                          <PackageCheck className="h-4 w-4 text-purple-400" />
                          <span>In-Store Pickup</span>
                        </>
                      ) : (
                        <>
                          <Truck className="h-4 w-4 text-amber-400" />
                          <span>Home Delivery</span>
                        </>
                      )}
                    </div>

                    {/* ETA */}
                    <div className="flex items-center gap-1.5 text-[13px] text-zinc-400">
                      <Clock className="h-4 w-4 text-zinc-500" />
                      <span>{order.eta || 'Processing'}</span>
                    </div>
                  </div>

                  {/* Delivery Address (if applicable) */}
                  {(order.deliveryAddress || order.address) && order.deliveryMethod === 'delivery' && (
                    <p className="mt-3 text-xs text-zinc-500 flex items-center gap-1.5">
                      <span>📍</span>
                      <span className="text-zinc-400 truncate">{order.deliveryAddress || order.address}</span>
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-zinc-900/60">
                    {(order.status === 'Funds Locked' || order.status === 'Verified') && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Are you sure you want to cancel this order? Your wallet will be refunded.')) {
                            cancelOrder(order.id);
                          }
                        }}
                        className="text-xs font-bold text-zinc-500 hover:text-red-400 hover:bg-red-500/5 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-500/10 transition-all duration-300 active:scale-[0.98] interactive-bounce"
                      >
                        Cancel Order
                      </button>
                    )}

                    {order.status === 'Ready for Pickup' && order.deliveryMethod === 'pickup' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Have you picked up your store order? Confirming pickup will complete this order and release escrow settlement.')) {
                            confirmDelivery(order.id);
                          }
                        }}
                        className="text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 active:scale-[0.98] interactive-bounce"
                      >
                        Confirm Pickup
                      </button>
                    )}

                    {order.status === 'In Transit' && order.deliveryMethod === 'delivery' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Have you received your order safely? Confirming will release escrow funds to the seller.')) {
                            confirmDelivery(order.id);
                          }
                        }}
                        className="text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 active:scale-[0.98] interactive-bounce"
                      >
                        Confirm Delivery
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Note */}
        {orderCount > 0 && (
          <div className="mt-12 pt-6 border-t border-zinc-900/60 text-center">
            <p className="text-xs text-zinc-500 flex items-center justify-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
              All orders are protected by automated multi-vendor escrow settlement.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}