import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/navbar';
import BudgetApp from './features/budgetplanner/BudgetApp';
// import ChatbotAdvisor from './features/chatbot/ChatbotAdvisor';
import DocumentTranscriber from './features/documenttranscriber/documenttranscriber';

import { translateTextWithHF } from './utils/huggingfaceapi';

// ----------------- Home Component -----------------

function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem("selectedLanguage") || "en"
  );

  const [translatedContent, setTranslatedContent] = useState({
    title: "Welcome to Suraksha Sakhi",
    subtitle: "Use these tools to take control of your finances, grow your business, and secure your future.",
    tagline: "Empowering women with AI, finance, and knowledge – in your language 🌸",
    features: [
      "Ask questions about savings, business, or laws in your language and get instant guidance.",
      "Easily track expenses, set goals for your children's education, and plan your business growth.",
      "Digitize handwritten bills, forms, or receipts in your language to manage paperwork easily."
    ],
    currentLanguageLabel: "Current Language",
    feedbackHeader: "Have Feedback or Questions?",
    feedbackDescription: "We would love to hear from you to improve Suraksha for your needs.",
    feedbackButton: "Send Feedback ✉️"
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
          tagline: "Empowering women with AI, finance, and knowledge – in your language 🌸",
          features: [
            "Ask questions about savings, business, or laws in your language and get instant guidance.",
            "Easily track expenses, set goals for your children's education, and plan your business growth.",
            "Digitize handwritten bills, forms, or receipts in your language to manage paperwork easily."
          ],
          currentLanguageLabel: "Current Language",
          feedbackHeader: "Have Feedback or Questions?",
          feedbackDescription: "We would love to hear from you to improve Suraksha for your needs.",
          feedbackButton: "Send Feedback ✉️"
        });
        return;
      }

      try {
        setLoading(true);

        const textsToTranslate = [
          // skipping title for manual Hindi translation
          "Use these tools to take control of your finances, grow your business, and secure your future.",
          "Empowering women with AI, finance, and knowledge – in your language 🌸",
          "Ask questions about savings, business, or laws in your language and get instant guidance.",
          "Easily track expenses, set goals for your children's education, and plan your business growth.",
          "Digitize handwritten bills, forms, or receipts in your language to manage paperwork easily.",
          "Current Language",
          "Have Feedback or Questions?",
          "We would love to hear from you to improve Suraksha for your needs.",
          "Send Feedback ✉️"
        ];

        const translatedTexts = await Promise.all(
          textsToTranslate.map(async (text) => {
            const translated = await translateTextWithHF(text, "en", selectedLanguage);
            return translated;
          })
        );

        setTranslatedContent({
          title: selectedLanguage === "hi" ? "सुरक्षा सखी में आपका स्वागत है" : "Welcome to Suraksha Sakhi",
          subtitle: translatedTexts[0],
          tagline: translatedTexts[1],
          features: [translatedTexts[2], translatedTexts[3], translatedTexts[4]],
          currentLanguageLabel: translatedTexts[5],
          feedbackHeader: translatedTexts[6],
          feedbackDescription: translatedTexts[7],
          feedbackButton: translatedTexts[8]
        });

      } catch (error) {
        console.error("Translation failed:", error);
      } finally {
        setLoading(false);
      }
    };

    translateContent();
  }, [selectedLanguage]);

  // Manual Hindi titles
  const featureCardTitles = selectedLanguage === "hi"
    ? [
        "🤖 एआई चैटबॉट सलाहकार",
        "📊 स्मार्ट बजट योजनाकार",
        "📝 दस्तावेज़ ट्रांसक्राइबर"
      ]
    : [
        "🤖 AI Chatbot Advisor",
        "📊 Smart Budget Planner",
        "📝 Document Transcriber"
      ];

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
          <p className="tagline">{translatedContent.tagline}</p>

          {/* Language Selector */}
          <div className="language-selector">
            <button onClick={() => handleLanguageSelect("en", "English")}>English</button>
            <button onClick={() => handleLanguageSelect("hi", "हिंदी")}>हिंदी</button>
            <button onClick={() => handleLanguageSelect("ta", "தமிழ்")}>தமிழ்</button>
            <button onClick={() => handleLanguageSelect("bn", "বাংলা")}>বাংলা</button>
          </div>

          <p className="current-language">
            {translatedContent.currentLanguageLabel}: {selectedLanguage.toUpperCase()}
          </p>
          <p className="home-subtitle">{translatedContent.subtitle}</p>

          {/* Feature Cards */}
          <div className="feature-cards">
            <FeatureCard
              title={featureCardTitles[0]}
              description={translatedContent.features[0]}
              link="/chatbot"
            />
            <FeatureCard
              title={featureCardTitles[1]}
              description={translatedContent.features[1]}
              link="/budgetplanner"
            />
            <FeatureCard
              title={featureCardTitles[2]}
              description={translatedContent.features[2]}
              link="/documenttranscriber"
            />
          </div>

          {/* Feedback Section */}
          <div className="feedback-section">
            <h3>{translatedContent.feedbackHeader}</h3>
            <p>{translatedContent.feedbackDescription}</p>
            <a href="mailto:contact@suraksha.ai" className="feedback-button">
              {translatedContent.feedbackButton}
            </a>
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
          <Route path="/budgetplanner/*" element={<BudgetApp />} />
          <Route path="/documenttranscriber" element={<DocumentTranscriber />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
