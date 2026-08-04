"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Smartphone, RefreshCw, CheckCircle, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function RatePhonePage() {
  const supabase = useMemo(() => createClient(), []);
  const [phoneModel, setPhoneModel] = useState("");
  const [phoneNumber, setPhoneNumber] = useState('');
  const [condition, setCondition] = useState("Good");
  const [requestType, setRequestType] = useState<"sell" | "swap">("sell");
  const [targetPhone, setTargetPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  type FileKey = "front" | "back" | "settings" | "receipt";

  // File states for our 4 required photos
  const [files, setFiles] = useState<Record<FileKey, File | null>>({
    front: null,
    back: null,
    settings: null,
    receipt: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: FileKey) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (selectedFile) {
      setFiles((prev) => ({ ...prev, [key]: selectedFile }));
    } 
  };

  const uploadToSupabase = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split(".").pop() ?? "jpg";
    const fileName = `${folder}_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `requests/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("phone-valuations")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("phone-valuations").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Verify user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        alert("Please log in to submit a valuation request!");
        setLoading(false);
        return;
      }

      // 2. Ensure all 4 images are uploaded
      if (!files.front || !files.back || !files.settings || !files.receipt) {
        alert("Please upload all 4 required photos before submitting.");
        setLoading(false);
        return;
      }

      // 3. Upload images to our new bucket
      const frontUrl = await uploadToSupabase(files.front, "front");
      const backUrl = await uploadToSupabase(files.back, "back");
      const settingsUrl = await uploadToSupabase(files.settings, "settings");
      const receiptUrl = await uploadToSupabase(files.receipt, "receipt");

      // 4. Save metadata to valuation_requests table
      const { error } = await supabase.from("valuation_requests").insert({
        user_id: session.user.id,
        phone_model: phoneModel,
        condition,
        phone_number: phoneNumber,
        request_type: requestType,
        target_phone: requestType === "swap" ? targetPhone : null,
        image_front: frontUrl,
        image_back: backUrl,
        image_settings: settingsUrl,
        image_receipt: receiptUrl,
        status: "pending",
      });

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      alert(`Error submitting request: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0d0f12] text-white flex flex-col items-center justify-center p-6">
        <div className="bg-[#161a20] p-8 rounded-2xl border border-gray-800 text-center max-w-md w-full shadow-2xl">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
          <p className="text-gray-400 mb-6">
            We&apos;ve received your request to {requestType === "sell" ? "sell" : "swap"} your {phoneModel}. 
            Our team will review the device photos and receipt manually and update your dashboard with our direct valuation rate.
          </p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-[#3b82f6] hover:bg-blue-600 font-semibold rounded-xl transition-all">
            Check Offer <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-white pb-12">
      {/* Dynamic Header */}
      <div className="border-b border-zinc-900 bg-[#12161a]/85 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all duration-300 text-sm font-bold hover:scale-[1.01] active:scale-[0.99] interactive-bounce">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <span className="text-sm text-blue-500 font-bold tracking-wider uppercase">Device Valuation</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 mt-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight">Rate Your Device</h1>
          <p className="text-zinc-450 mt-2">Submit your details, we&apos;ll manually review the condition, and offer you a direct rate to Buy or Swap.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8 bg-[#12161a] p-8 rounded-2xl border border-zinc-850 shadow-xl glass-panel animate-fade-in">
          
          {/* 1. Toggle between Selling and Swapping */}
          <div className="grid grid-cols-2 gap-4 p-1.5 bg-[#0d0f12]/60 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setRequestType("sell")}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-lg font-bold transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] interactive-bounce ${
                requestType === "sell" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Smartphone className="w-4 h-4" /> Sell Phone
            </button>
            <button
              type="button"
              onClick={() => setRequestType("swap")}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-lg font-bold transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] interactive-bounce ${
                requestType === "swap" ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <RefreshCw className="w-4 h-4" /> Swap Phone
            </button>
          </div>

          {/* 2. Basic Info Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Phone Name & Model</label>
              <input
                type="text"
                required
                placeholder="e.g., iPhone 13 Pro Max (256GB)"
                value={phoneModel}
                onChange={(e) => setPhoneModel(e.target.value)}
                className="w-full bg-[#0d0f12]/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 hover:border-zinc-700"
              />

            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">WhatsApp / Phone Number</label>
              <input
                type="tel"
                required
                placeholder="e.g., +234..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-[#0d0f12]/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 hover:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Est. Body Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-[#0d0f12]/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 hover:border-zinc-700"
              >
                <option value="Mint" className="bg-zinc-950">Mint (Like New, No Scratches)</option>
                <option value="Good" className="bg-zinc-950">Good (Minor signs of use)</option>
                <option value="Fair" className="bg-zinc-950">Fair (Scratch marks/dents on corners)</option>
                <option value="Broken" className="bg-zinc-950">Broken (Cracked screen or back glass)</option>
              </select>
            </div>

            {/* Dynamic Target Phone Field for Swaps */}
            {requestType === "swap" && (
              <div className="animate-fade-in">
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Phone You Want to Swap to</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., iPhone 15 Pro Max"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  className="w-full bg-[#0d0f12]/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300 hover:border-zinc-700"
                />
              </div>
            )}
           
          </div>

          {/* 3. The 4 Mandatory Photo Upload Boxes */}
          <div>
            <label className="block text-sm font-semibold text-zinc-350 mb-4">Upload the 4 Required Photos</label>
            <div className="grid grid-cols-2 gap-4">
              {([
                { key: "front", label: "Front of Phone", desc: "No filters, screen off" },
                { key: "back", label: "Back of Phone", desc: "Take case off to show body" },
                { key: "settings", label: "General Settings Screenshot", desc: "Show Serial & IMEI" },
                { key: "receipt", label: "Proof of Purchase/Receipt", desc: "Verifies safe ownership" },
              ] as const).map((item) => {
                const fileKey: FileKey = item.key;
                const isAttached = !!files[fileKey];
                return (
                  <div 
                    key={fileKey} 
                    className={`p-4 rounded-xl border flex flex-col justify-between h-40 relative transition-all duration-300 ${
                      isAttached 
                        ? "bg-emerald-950/15 border-emerald-500/30" 
                        : "bg-[#0d0f12]/50 border-zinc-850 hover:border-zinc-750"
                    }`}
                  >
                    <div>
                      <span className={`block text-xs font-extrabold uppercase tracking-wider ${isAttached ? "text-emerald-400" : "text-blue-500"}`}>{item.label}</span>
                      <span className="block text-[11px] text-zinc-500 mt-1">{item.desc}</span>
                    </div>
                    <label className={`cursor-pointer flex items-center justify-center gap-2 border py-2 rounded-xl text-xs font-bold mt-auto transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] interactive-bounce ${
                      isAttached 
                        ? "bg-emerald-600/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20" 
                        : "bg-[#161a20] hover:bg-[#1c2229] border-zinc-700 text-zinc-300 hover:text-white"
                    }`}>
                      <Upload className="w-3.5 h-3.5" />
                      {isAttached ? "Change Photo" : "Upload Photo"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, fileKey)}
                        className="hidden"
                      />
                    </label>
                    {isAttached && (
                      <div className="absolute top-3 right-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider animate-fade-in">
                        Attached
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 active-press interactive-bounce"
          >
            {loading ? "Uploading Verification Images..." : "Submit for Official Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
