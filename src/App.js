// src/App.js

import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Import Navbar
import Navbar from './components/navbar';

// Import features
// import ChatbotAdvisor from './features/chatbot/ChatbotAdvisor';
import BudgetPlanner from './features/budgetplanner/budgetplanner';
// import DocumentTranscriber from './features/documentTranscriber/DocumentTranscriber';

import { translateText } from './utils/huggingfaceapi';

// ----------------- Home Component -----------------

function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem("selectedLanguage") || "en"
  );

  const [translatedContent, setTranslatedContent] = useState({
    title: "Welcome to Suraksha",
    subtitle: "Use these tools to take control of your finances, grow your business, and secure your future.",
    trust: "🌸 Trusted by women across cities and villages, built by women, for women.",
    features: [
      "Ask questions about savings, business, or laws in your language and get instant guidance.",
      "Easily track expenses, set goals for your children's education, and plan your business growth.",
      "Digitize handwritten bills, forms, or receipts in your language to manage paperwork easily."
    ]
  });

  const handleLanguageSelect = (lang, label) => {
    setSelectedLanguage(lang);
    localStorage.setItem("selectedLanguage", lang);
    alert(`Language switched to ${label}`);
  };

  useEffect(() => {
    const translateContent = async () => {
      if (selectedLanguage === "en") {
        setTranslatedContent({
          title: "Welcome to Suraksha",
          subtitle: "Use these tools to take control of your finances, grow your business, and secure your future.",
          trust: "🌸 Trusted by women across cities and villages, built by women, for women.",
          features: [
            "Ask questions about savings, business, or laws in your language and get instant guidance.",
            "Easily track expenses, set goals for your children's education, and plan your business growth.",
            "Digitize handwritten bills, forms, or receipts in your language to manage paperwork easily."
          ]
        });
        return;
      }

      try {
        const [title, subtitle, trust, f1, f2, f3] = await Promise.all([
          translateText("Welcome to Suraksha", "en", selectedLanguage),
          translateText("Use these tools to take control of your finances, grow your business, and secure your future.", "en", selectedLanguage),
          translateText("🌸 Trusted by women across cities and villages, built by women, for women.", "en", selectedLanguage),
          translateText("Ask questions about savings, business, or laws in your language and get instant guidance.", "en", selectedLanguage),
          translateText("Easily track expenses, set goals for your children's education, and plan your business growth.", "en", selectedLanguage),
          translateText("Digitize handwritten bills, forms, or receipts in your language to manage paperwork easily.", "en", selectedLanguage),
        ]);

        setTranslatedContent({
          title,
          subtitle,
          trust,
          features: [f1, f2, f3]
        });
      } catch (error) {
        console.error("Translation failed:", error);
      }
    };

    translateContent();
  }, [selectedLanguage]);

  return (
    <div className="home-container">
      <h1>{translatedContent.title}</h1>

      {/* Language Selector */}
      <div className="language-selector">
        <button onClick={() => handleLanguageSelect("en", "English")}>English</button>
        <button onClick={() => handleLanguageSelect("hi", "हिंदी")}>हिंदी</button>
        <button onClick={() => handleLanguageSelect("ta", "தமிழ்")}>தமிழ்</button>
        <button onClick={() => handleLanguageSelect("bn", "বাংলা")}>বাংলা</button>
      </div>

      <p className="home-subtitle">{translatedContent.subtitle}</p>

      <div className="voice-hint">
        <span>Try using your voice for navigation and asking questions!</span>
      </div>

      {/* Feature Cards */}
      <div className="feature-cards">
        <FeatureCard
          title="🤖 AI Chatbot Advisor"
          description={translatedContent.features[0]}
          link="/chatbot"
        />
        <FeatureCard
          title="📊 Smart Budget Planner"
          description={translatedContent.features[1]}
          link="/budgetplanner"
        />
        <FeatureCard
          title="📝 Document Transcriber"
          description={translatedContent.features[2]}
          link="/documenttranscriber"
        />
      </div>

      <p className="trust-tagline">{translatedContent.trust}</p>
    </div>
  );
}

// ----------------- FeatureCard Component -----------------

function FeatureCard({ title, description, link }) {
  return (
    <Link to={link} className="feature-card">
      <h2>{title}</h2>
      <p>{description}</p>
    </Link>
  );
}

// ----------------- App Component -----------------

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/chatbot" element={<ChatbotAdvisor />} /> */}
          <Route path="/budgetplanner" element={<BudgetPlanner />} />
          {/* <Route path="/documenttranscriber" element={<DocumentTranscriber />} /> */}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
