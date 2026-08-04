"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ShieldCheck, Truck, PackageCheck, PhoneCall, MapPin } from "lucide-react";


// 1. Add your admin email here!
const ADMIN_EMAILS = ["montanadavid380@gmail.com"]; 

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone_model: string;
  price: number;
  fulfillment_method: string;
  shipping_address?: string;
  recipient_phone: string;
  status: string;
}

export default function AdminOrderPanel() {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

// 1. Declare fetchOrders FIRST with useCallback so it is stable
  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders") // Double check this matches your exact order table name
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data);
    }
    setLoading(false);
  }, [supabase]); // It only re-creates if the stable supabase client changes

  // 2. Put the useEffect below the functions it needs to call
  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const userEmail = session?.user?.email;

      if (!session || !userEmail || !ADMIN_EMAILS.includes(userEmail)) {
        // Not authorized? Send them packing to the homepage
        router.push("/");
        return;
      }

      setIsAdmin(true);
      fetchOrders(); // Safe to call now!
    };

    checkAdminAccess();
  }, [router, fetchOrders, supabase]); // React linter is now 100% happy!

  // 2. Function to update the order status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const confirmChange = window.confirm(`Mark this order as ${newStatus}?`);
    if (!confirmChange) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      alert("Failed to update status: " + error.message);
    } else {
      alert(`Order successfully marked as ${newStatus}!`);
      fetchOrders(); // Refresh lists
    }
  };

  // 3. Function to permanently delete an order from the database
  const handleDeleteOrder = async (orderId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete this order? This action cannot be undone.");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      alert("Failed to delete order: " + error.message);
    } else {
      alert("Order successfully deleted!");
      fetchOrders(); // Refresh lists
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <p className="text-sm font-semibold tracking-wide animate-pulse">Verifying Admin Access...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-8 border-b border-zinc-800 pb-4">
          <ShieldCheck className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold">David Gadgets Admin Console</h1>
        </div>

        <div className="space-y-6">
          {orders.length === 0 ? (
            <p className="text-zinc-500 text-sm">No incoming escrow orders found.</p>
          ) : (
            orders.map((order) => {
              const isVerified = ["verified", "shipped", "ready_for_pickup", "completed"].includes(order.status);
              return (
                <div 
                  key={order.id} 
                  className={`p-5 bg-zinc-900 border rounded-2xl shadow-lg transition-all duration-300 ${
                    isVerified 
                      ? "border-emerald-500/40 bg-emerald-950/10 shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
                      : "border-zinc-800"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-blue-600/20 text-blue-400 text-xs px-2.5 py-1 rounded-full font-bold">
                          {order.order_number}
                        </span>
                        {isVerified && (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10.5px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Seen & Verified
                          </span>
                        )}
                      </div>
                      <h2 className="text-lg font-bold mt-2">{order.phone_model}</h2>
                      <p className="text-sm text-zinc-400">Customer: {order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-emerald-400">
                        ₦{order.price.toLocaleString()}
                      </span>
                      <p className="text-xs text-zinc-500 mt-1 capitalize">Status: {order.status}</p>
                    </div>
                  </div>

                  {/* Shipping & Contact info card */}
                  <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-zinc-500" />
                      <div>
                        <span className="text-zinc-500 block uppercase font-bold">Fulfillment</span>
                        <span className="text-sm font-semibold capitalize text-zinc-200">
                          {order.fulfillment_method}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <PhoneCall className="w-4 h-4 text-zinc-500" />
                      <div>
                        <span className="text-zinc-500 block uppercase font-bold">Contact Phone</span>
                        <span className="text-sm font-semibold text-zinc-200">
                          {order.recipient_phone || "No phone provided"}
                        </span>
                      </div>
                    </div>
                    {order.fulfillment_method === "delivery" && order.shipping_address && (
                      <div className="col-span-1 md:col-span-2 flex items-start gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800/40">
                        <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-zinc-500 block uppercase font-bold">Delivery Address</span>
                          <span className="text-sm text-zinc-300">{order.shipping_address}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Dynamic Action Buttons */}
                  <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                    
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="px-3.5 py-2 bg-red-950/40 hover:bg-red-650 text-red-400 hover:text-white text-xs font-bold rounded-xl border border-red-500/10 hover:border-transparent transition-all active:scale-[0.98]"
                    >
                      Delete Order
                    </button>

                    <div className="flex gap-2">
                      {order.status === "pending" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "verified")}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-600/15"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Verify & Confirm Order
                        </button>
                      )}

                      {order.status === "verified" && (
                        <>
                          {order.fulfillment_method === "delivery" ? (
                            <button
                              onClick={() => handleUpdateStatus(order.id, "shipped")}
                              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all"
                            >
                              <Truck className="w-3.5 h-3.5" /> Dispatch / Ship Item
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(order.id, "ready_for_pickup")}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all"
                            >
                              <PackageCheck className="w-3.5 h-3.5" /> Ready for Pickup
                            </button>
                          )}
                        </>
                      )}

                      {order.status === "shipped" && (
                        <span className="text-xs text-zinc-500 italic">Awaiting customer delivery confirmation...</span>
                      )}
                      {order.status === "ready_for_pickup" && (
                        <span className="text-xs text-zinc-500 italic">Awaiting customer collection confirmation...</span>
                      )}
                      {order.status === "completed" && (
                        <span className="text-xs text-emerald-500 font-semibold">✓ Funds Released & Completed</span>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
