import { Routes, Route } from 'react-router'
import { Navbar } from "./components/landing/Navbar";
import { Hero } from "./components/landing/Hero";
import { Ticker } from "./components/landing/Ticker";
import { MoversSection } from "./components/landing/MoversSection";
import { Highlights } from "./components/landing/Highlights";
import { AIFeatureBanner } from "./components/landing/AIFeatureBanner";
import { FeaturedCoins } from "./components/landing/FeaturedCoins";
import { MarketOverview } from "./components/landing/MarketOverview";
import { CTA } from "./components/landing/CTA";
import { Footer } from "./components/landing/Footer";
import LoginSignup from './components/auth/LoginSignup'
import { AIChatbot } from './components/chatbot/AIChatbot'
import Dashboard from './components/dashboard/MainPage'

function Landing() {
  return (
    <>
      <Navbar />
      <Hero />
      <Ticker />
      <MoversSection />
      <Highlights />
      <AIFeatureBanner />
      <FeaturedCoins />
      <MarketOverview />
      <CTA />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<LoginSignup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <AIChatbot />
    </main>
  );
}

