"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Check, Clock, Smartphone, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ValuationRequest {
  id: string;
  phone_model: string;
  condition: string;
  request_type: string;
  target_phone: string;
  status: string;
  offered_rate: number;
}

export default function UserValuationsList() {
  const supabase = useMemo(() => createClient(), []);
  const [requests, setRequests] = useState<ValuationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyRequests = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("valuation_requests")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRequests(data as ValuationRequest[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    void Promise.resolve().then(() => {
      fetchMyRequests();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void Promise.resolve().then(() => {
        fetchMyRequests();
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchMyRequests]);

  const handleAcceptOffer = async (id: string) => {
    const confirm = window.confirm("Are you sure you want to accept this valuation offer?");
    if (!confirm) return;

    const { error } = await supabase
      .from("valuation_requests")
      .update({ status: "accepted" })
      .eq("id", id);

    if (!error) {
      alert("Offer accepted! We will contact you shortly to complete the exchange.");
      fetchMyRequests();
    }
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-12 text-white flex items-center justify-center min-h-[50vh]">
        <div className="text-zinc-550 text-sm flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
          <span>Loading offers...</span>
        </div>
      </main>
    );
  }

  if (requests.length === 0) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-12 text-white animate-fade-in">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-450 hover:text-white transition-all duration-300 text-sm font-bold hover:scale-[1.01] active:scale-[0.99] mb-8 group interactive-bounce">
          <ArrowLeft className="w-4.5 h-4.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
        <div className="bg-zinc-950 border border-zinc-900 p-10 rounded-2xl text-center space-y-5 shadow-xl glass-panel">
          <Clock className="w-12 h-12 text-zinc-700 mx-auto" />
          <h2 className="text-xl font-bold text-zinc-100">No Active Offers Found</h2>
          <p className="text-sm text-zinc-450 max-w-md mx-auto leading-relaxed">
            You have not submitted any device swap or valuation requests yet. Get an instant quote on your device now!
          </p>
          <div className="pt-2">
            <Link href="/rate-phone" className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-xs shadow-lg shadow-blue-600/10 hover:shadow-blue-500/20 active-press interactive-bounce">
              Rate Your Phone
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12 text-white animate-fade-in">
      <Link href="/" className="inline-flex items-center gap-2 text-zinc-450 hover:text-white transition-all duration-300 text-sm font-bold hover:scale-[1.01] active:scale-[0.99] mb-8 group interactive-bounce">
        <ArrowLeft className="w-4.5 h-4.5 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Home</span>
      </Link>

      <div className="space-y-6">
        <h3 className="text-2xl font-extrabold tracking-tight text-white">Your Phone Valuations</h3>
        
        <div className="grid gap-6 md:grid-cols-2">
          {requests.map((req) => (
            <div key={req.id} className="bg-zinc-950 border border-zinc-900/80 p-5 rounded-2xl flex flex-col justify-between hover:border-zinc-800 transition duration-300">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-550">
                    {req.request_type === "swap" ? <RefreshCw className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                    {req.request_type === "swap" ? "Swap Deal" : "Direct Sale"}
                  </span>
                  
                  {/* Status Badges */}
                  {req.status === "pending" && (
                    <span className="flex items-center gap-1 text-xs bg-yellow-500/10 text-yellow-500 px-2.5 py-1 rounded-full font-semibold">
                      <Clock className="w-3 h-3 animate-pulse" /> Under Review
                    </span>
                  )}
                  {req.status === "approved" && (
                    <span className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-semibold">
                      <Check className="w-3 h-3" /> Offer Ready
                    </span>
                  )}
                  {req.status === "accepted" && (
                    <span className="flex items-center gap-1 text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full font-semibold">
                      🎉 Offer Accepted
                    </span>
                  )}
                </div>

                <h4 className="text-lg font-bold text-zinc-150">{req.phone_model}</h4>
                <p className="text-xs text-zinc-500 mt-1">Declared Condition: <span className="text-zinc-350 font-semibold">{req.condition}</span></p>
                
                {req.request_type === "swap" && (
                  <p className="text-xs text-zinc-500">Target Swap: <span className="text-blue-400 font-semibold">{req.target_phone}</span></p>
                )}
              </div>

              {/* Dynamic Offer Section */}
              <div className="mt-6 pt-4 border-t border-zinc-900/60 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Our Offered Rate</span>
                  <span className="text-lg font-extrabold text-white">
                    {req.status === "pending" ? (
                      <span className="text-xs font-semibold text-zinc-450 italic">Calculating...</span>
                    ) : (
                      `₦${Number(req.offered_rate).toLocaleString()}`
                    )}
                  </span>
                </div>

                {req.status === "approved" && (
                  <button
                    onClick={() => handleAcceptOffer(req.id)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] active-press interactive-bounce"
                  >
                    Accept Offer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}