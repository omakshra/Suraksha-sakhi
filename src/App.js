// src/App.js

import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import Navbar from './components/navbar';
import BudgetPlanner from './features/budgetplanner/budgetplanner';
// import ChatbotAdvisor from './features/chatbot/ChatbotAdvisor';
// import DocumentTranscriber from './features/documenttranscriber/documenttranscriber';

import { translateTextWithHF } from './utils/huggingfaceapi';

// ----------------- Home Component -----------------

function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem("selectedLanguage") || "en"
  );

  const [translatedContent, setTranslatedContent] = useState({
    title: "Welcome to Suraksha Sakhi",
    subtitle: "Use these tools to take control of your finances, grow your business, and secure your future.",
    features: [
      "Ask questions about savings, business, or laws in your language and get instant guidance.",
      "Easily track expenses, set goals for your children's education, and plan your business growth.",
      "Digitize handwritten bills, forms, or receipts in your language to manage paperwork easily."
    ]
  });

  const [loading, setLoading] = useState(false);

  const handleLanguageSelect = (lang, label) => {
    if (lang === "ta" || lang === "bn") {
      alert(`${label} support is coming soon!`);
      return;
    }
    setSelectedLanguage(lang);
    localStorage.setItem("selectedLanguage", lang);
    alert(`Language switched to ${label}`);
  };

  useEffect(() => {
    const translateContent = async () => {
      if (selectedLanguage === "en") {
        setTranslatedContent({
          title: "Welcome to Suraksha Sakhi",
          subtitle: "Use these tools to take control of your finances, grow your business, and secure your future.",
          features: [
            "Ask questions about savings, business, or laws in your language and get instant guidance.",
            "Easily track expenses, set goals for your children's education, and plan your business growth.",
            "Digitize handwritten bills, forms, or receipts in your language to manage paperwork easily."
          ]
        });
        return;
      }

      try {
        setLoading(true);

        const textsToTranslate = [
          "Welcome to Suraksha Sakhi",
          "Use these tools to take control of your finances, grow your business, and secure your future.",
          "Ask questions about savings, business, or laws in your language and get instant guidance.",
          "Easily track expenses, set goals for your children's education, and plan your business growth.",
          "Digitize handwritten bills, forms, or receipts in your language to manage paperwork easily."
        ];

        const translatedTexts = await Promise.all(
          textsToTranslate.map(async (text, idx) => {
            const cacheKey = `translation_${selectedLanguage}_${text}`;
            const useCache = false; // set to true later for performance
            if (useCache) {
              const cached = localStorage.getItem(cacheKey);
              if (cached) return cached;
            } else {
              if (selectedLanguage === "hi" && idx === 0) {
                // Fallback manual Hindi for title
                localStorage.setItem(cacheKey, "सुरक्षा सखी में आपका स्वागत है");
                return "सुरक्षा सखी में आपका स्वागत है";
              } else if (selectedLanguage === "hi" && idx === 4) {
                // Fallback manual Hindi for last feature
                localStorage.setItem(cacheKey, "अपने दस्तावेज़ों को प्रबंधित करने के लिए हाथ से लिखे बिल, फॉर्म या रसीदों को डिजिटाइज़ करें।");
                return "अपने दस्तावेज़ों को प्रबंधित करने के लिए हाथ से लिखे बिल, फॉर्म या रसीदों को डिजिटाइज़ करें।";
              } else {
                const translated = await translateTextWithHF(text, "en", selectedLanguage);
                localStorage.setItem(cacheKey, translated);
                return translated;
              }
            }
          })
        );

        setTranslatedContent({
          title: translatedTexts[0],
          subtitle: translatedTexts[1],
          features: [translatedTexts[2], translatedTexts[3], translatedTexts[4]]
        });
      } catch (error) {
        console.error("Translation failed:", error);
      } finally {
        setLoading(false);
      }
    };

    translateContent();
  }, [selectedLanguage]);

  return (
    <div className="home-container">
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Translating, please wait...</p>
        </div>
      ) : (
        <>
          <h1>{translatedContent.title}</h1>
          <p className="tagline">Empowering women with AI, finance, and knowledge – in your language 🌸</p>

          {/* Language Selector */}
          <div className="language-selector">
            <button onClick={() => handleLanguageSelect("en", "English")}>English</button>
            <button onClick={() => handleLanguageSelect("hi", "हिंदी")}>हिंदी</button>
            <button onClick={() => handleLanguageSelect("ta", "தமிழ்")}>தமிழ்</button>
            <button onClick={() => handleLanguageSelect("bn", "বাংলা")}>বাংলা</button>
          </div>

          <p className="current-language">Current Language: {selectedLanguage.toUpperCase()}</p>
          <p className="home-subtitle">{translatedContent.subtitle}</p>

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

          {/* Feedback Section */}
          <div className="feedback-section">
            <h3>Have Feedback or Questions?</h3>
            <p>We would love to hear from you to improve Suraksha for your needs.</p>
            <a href="mailto:contact@suraksha.ai" className="feedback-button">Send Feedback ✉️</a>
          </div>
        </>
      )}
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
