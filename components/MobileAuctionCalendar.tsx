"use client";

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import { createClient } from "@supabase/supabase-js";

// Import FullCalendar CSS
import "@fullcalendar/core/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/list/main.css";
import "../styles/fullcalendar-dark.css";

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mocerqjnksmhcjzxrewo.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

interface AuctionEvent {
  id: string;
  title: string;
  start: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    address: string;
    judgment_amount: number;
    max_bid: number;
    recommendation: string;
    case_number: string;
    plaintiff: string;
    ml_probability: number;
  };
}

const getEventColor = (recommendation: string) => {
  switch (recommendation) {
    case "BID": return { bg: "#22c55e", border: "#16a34a", text: "#ffffff" };
    case "REVIEW": return { bg: "#f59e0b", border: "#d97706", text: "#000000" };
    case "SKIP": return { bg: "#ef4444", border: "#dc2626", text: "#ffffff" };
    default: return { bg: "#6b7280", border: "#4b5563", text: "#ffffff" };
  }
};

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount || 0);

export default function MobileAuctionCalendar() {
  const [events, setEvents] = useState<AuctionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<AuctionEvent | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchAuctions() {
      try {
        const { data, error } = await supabase
          .from("auction_results")
          .select("*")
          .gte("auction_date", new Date().toISOString().split("T")[0])
          .order("auction_date", { ascending: true });

        if (error) throw error;

        const calendarEvents: AuctionEvent[] = (data || []).map((auction: any) => {
          const colors = getEventColor(auction.recommendation);
          return {
            id: auction.id,
            title: `${auction.recommendation}: ${auction.address?.split(",")[0] || "Property"}`,
            start: auction.auction_date,
            backgroundColor: colors.bg,
            borderColor: colors.border,
            textColor: colors.text,
            extendedProps: {
              address: auction.address,
              judgment_amount: auction.judgment_amount,
              max_bid: auction.max_bid,
              recommendation: auction.recommendation,
              case_number: auction.case_number,
              plaintiff: auction.plaintiff,
              ml_probability: auction.ml_probability,
            },
          };
        });

        setEvents(calendarEvents);
      } catch (err) {
        console.error("Error fetching auctions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAuctions();
  }, []);

  const handleEventClick = (info: any) => {
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.startStr,
      backgroundColor: info.event.backgroundColor,
      borderColor: info.event.borderColor,
      textColor: info.event.textColor,
      extendedProps: info.event.extendedProps,
    });
  };

  const closeModal = () => setSelectedEvent(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-indigo-400">BidDeed.AI</h1>
            <p className="text-xs text-gray-400">Auction Calendar</p>
          </div>
          <div className="flex gap-1">
            <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400">BID</span>
            <span className="px-2 py-1 text-xs rounded bg-amber-500/20 text-amber-400">REVIEW</span>
            <span className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400">SKIP</span>
          </div>
        </div>
      </header>

      {/* Calendar */}
      <div className="p-2 sm:p-4">
        <div className="bg-gray-800 rounded-lg p-2 sm:p-4 border border-gray-700">
          <FullCalendar
            plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
            initialView={isMobile ? "listWeek" : "dayGridMonth"}
            events={events}
            eventClick={handleEventClick}
            headerToolbar={{
              left: "prev,next",
              center: "title",
              right: isMobile ? "listWeek,dayGridMonth" : "dayGridMonth,dayGridWeek,listWeek",
            }}
            height="auto"
            contentHeight="auto"
            dayMaxEvents={isMobile ? 2 : 4}
            eventDisplay="block"
            nowIndicator={true}
            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
              list: "List"
            }}
          />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {events.filter(e => e.extendedProps.recommendation === "BID").length}
            </div>
            <div className="text-xs text-gray-400">BID</div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">
              {events.filter(e => e.extendedProps.recommendation === "REVIEW").length}
            </div>
            <div className="text-xs text-gray-400">REVIEW</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-400">
              {events.filter(e => e.extendedProps.recommendation === "SKIP").length}
            </div>
            <div className="text-xs text-gray-400">SKIP</div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-4">
          <div className="bg-gray-800 rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto border border-gray-700">
            {/* Modal Header */}
            <div 
              className="sticky top-0 px-4 py-3 border-b border-gray-700 flex items-center justify-between rounded-t-2xl"
              style={{ backgroundColor: selectedEvent.backgroundColor }}
            >
              <span className="font-bold text-white">{selectedEvent.extendedProps.recommendation}</span>
              <button 
                onClick={closeModal}
                className="text-white/80 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4">
              {/* Address */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Property Address</p>
                <p className="text-white font-medium">{selectedEvent.extendedProps.address || "N/A"}</p>
              </div>

              {/* Case Number */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Case Number</p>
                <p className="text-gray-300">{selectedEvent.extendedProps.case_number || "N/A"}</p>
              </div>

              {/* Financial Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Judgment</p>
                  <p className="text-lg font-bold text-white">
                    {formatCurrency(selectedEvent.extendedProps.judgment_amount)}
                  </p>
                </div>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <p className="text-xs text-green-400">Max Bid</p>
                  <p className="text-lg font-bold text-green-400">
                    {formatCurrency(selectedEvent.extendedProps.max_bid)}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Plaintiff</p>
                  <p className="text-gray-300 text-sm">{selectedEvent.extendedProps.plaintiff || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">ML Probability</p>
                  <p className="text-gray-300 text-sm">
                    {selectedEvent.extendedProps.ml_probability 
                      ? `${(selectedEvent.extendedProps.ml_probability * 100).toFixed(1)}%` 
                      : "N/A"}
                  </p>
                </div>
              </div>

              {/* Auction Date */}
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3">
                <p className="text-xs text-indigo-400 uppercase tracking-wide">Auction Date</p>
                <p className="text-white font-medium">
                  {new Date(selectedEvent.start).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 p-4 border-t border-gray-700 bg-gray-800 rounded-b-2xl">
              <button
                onClick={closeModal}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA Bottom Nav Spacer */}
      <div className="h-20 sm:hidden"></div>
    </div>
  );
}
