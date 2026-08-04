'use client';

import { useState } from 'react';
import { ShoppingBag, X, Clock, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function OrderTrackingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { orders, cancelOrder, confirmDelivery } = useApp();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans">
      
      {/* Expanded Order Ledger Panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 max-h-125 bg-zinc-950/95 backdrop-blur-xl border border-zinc-850 rounded-2xl shadow-2xl p-5 flex flex-col overflow-hidden mb-2 animate-fade-in glass-panel">
          <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-blue-500" />
              <h3 className="font-bold text-sm text-zinc-100">Escrow Secure Orders ({orders.length})</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-all duration-205 hover:scale-110">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* List Tracker Grid */}
          <div className="overflow-y-auto py-3 space-y-4 flex-1 custom-scrollbar">
            {orders.length === 0 ? (
              <div className="text-center py-8 text-zinc-650 text-xs">
                No active orders found. Secure an escrow item to initialize automated logistics routing.
              </div>
            ) : (
              orders.map((order) => {
                const isVerified = ["Verified", "In Transit", "Ready for Pickup", "Completed"].includes(order.status);
                return (
                  <div 
                    key={order.id} 
                    className={`bg-zinc-900/30 border rounded-xl p-4 space-y-3 transition-all duration-300 ${
                      isVerified 
                        ? "border-emerald-500/30 bg-emerald-950/5 shadow-[0_0_12px_rgba(16,185,129,0.03)]" 
                        : "border-zinc-900/80 hover:border-zinc-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                          {order.id}
                        </span>
                        {/* Reads productTitle or title string safely */}
                        <h4 className="text-xs font-semibold text-zinc-200 mt-1.5 line-clamp-2">{order.productTitle}</h4>
                      </div>
                      {/* Formats number prices cleanly or grabs raw text */}
                      <span className="text-xs font-bold text-zinc-100 shrink-0">
                        {order.formattedPrice || `$${order.price}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-900">
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        <span>{order.eta || 'Processing'}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-[11px] font-semibold justify-end ${
                        isVerified ? "text-emerald-400" : "text-blue-400"
                      }`}>
                        <ShieldCheck className={`h-3 w-3 ${isVerified ? "text-emerald-400" : "text-blue-400"}`} />
                        <span>{order.status}</span>
                      </div>
                    </div>
                    
                    {(order.deliveryAddress || order.address) && (
                      <p className="text-[10px] text-zinc-500 truncate">
                        📍 Destination: <span className="text-zinc-400">{order.deliveryAddress || order.address}</span>
                      </p>
                    )}

                    <div className="flex justify-end gap-2 pt-1.5 border-t border-zinc-900/60 mt-2">
                      {/* Cancel order button: only allowed before transit / pickup readiness */}
                      {(order.status === 'Funds Locked' || order.status === 'Verified') && (
                        <button 
                          type="button"
                          onClick={() => {
                            if(confirm("Are you sure you want to cancel this order and refund your wallet?")) {
                                cancelOrder(order.id);
                            }
                          }}
                          className="text-[10px] font-bold text-zinc-500 hover:text-red-400 hover:bg-red-500/5 px-2.5 py-1 rounded-lg border border-transparent hover:border-red-500/10 transition-all duration-300"
                        >
                          Cancel Order
                        </button>
                      )}

                      {order.status === 'Ready for Pickup' && order.deliveryMethod === 'pickup' && (
                        <button 
                          type="button"
                          onClick={() => {
                            if(confirm("Confirm that you have collected your store pickup? This will complete the pickup order.")) {
                                confirmDelivery(order.id);
                            }
                          }}
                          className="text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 active:scale-[0.98]"
                        >
                          Confirm Pickup
                        </button>
                      )}

                      {order.status === 'In Transit' && order.deliveryMethod === 'delivery' && (
                        <button 
                          type="button"
                          onClick={() => {
                            if(confirm("Verify that you have received your order safely? This will release the escrow funds to the seller.")) {
                                confirmDelivery(order.id);
                            }
                          }}
                          className="text-[10px] font-bold text-emerald-400 hover:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 active:scale-[0.98]"
                        >
                          Delivery Confirmed
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="border-t border-zinc-900/60 pt-3 text-center text-[10px] text-zinc-500">
            🔒 Protected by automated multi-vendor escrow settlement.
          </div>
        </div>
      )}

      {/* Floating Interactive Action Trigger Buttons Container */}
      {/* Independent Floating Order Monitor Trigger */}
      <div className="fixed bottom-6 right-22 z-50 font-sans">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative h-12 w-12 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:scale-110 active:scale-95 active-press group interactive-bounce glow-hover"
        >
          {orders.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-500 text-[10px] font-black rounded-full flex items-center justify-center scale-100 animate-pulse">
              {orders.length}
            </span>
          )}
          <ShoppingBag className="h-5 w-5 text-zinc-300 group-hover:scale-110 transition" />
        </button>
      </div>
    </div>
  );
}