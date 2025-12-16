import Head from "next/head";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with FullCalendar
const MobileAuctionCalendar = dynamic(
  () => import("../components/MobileAuctionCalendar"),
  { ssr: false, loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
    </div>
  )}
);

export default function CalendarPage() {
  return (
    <>
      <Head>
        <title>Auction Calendar | BidDeed.AI</title>
        <meta name="description" content="View upcoming Brevard County foreclosure auctions with AI-powered BID/REVIEW/SKIP recommendations" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#1a1a2e" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <MobileAuctionCalendar />
    </>
  );
}
