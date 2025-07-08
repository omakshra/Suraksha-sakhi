import React, { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/navbar';
import BudgetApp from './features/budgetplanner/BudgetApp';
import ChatbotAdvisor from './features/chatbot/ChatbotAdvisor';
import DocumentTranscriber from './features/documenttranscriber/documenttranscriber';

import { translations } from './translation';

// ----------------- Home Component -----------------

function Home({ selectedLanguage, setSelectedLanguage }) {
  const content = translations[selectedLanguage] || translations.en;

  const handleLanguageSelect = (lang, label) => {
    if (lang === "ta" || lang === "bn") {
      alert(`${label} support is coming soon!`);
      return;
    }
    setSelectedLanguage(lang);
    localStorage.setItem("selectedLanguage", lang);
    alert(`Language switched to ${label}`);
  };

  return (
    <div className="home-container">
      <h1>{content.title}</h1>
      <p className="tagline">{content.tagline}</p>

      <div className="language-selector">
        <button onClick={() => handleLanguageSelect("en", "English")}>English</button>
        <button onClick={() => handleLanguageSelect("hi", "हिंदी")}>हिंदी</button>
        <button onClick={() => handleLanguageSelect("ta", "தமிழ்")}>தமிழ்</button>
        <button onClick={() => handleLanguageSelect("bn", "বাংলা")}>বাংলा</button>
      </div>

      <p className="current-language">
        {content.currentLanguageLabel}: {selectedLanguage.toUpperCase()}
      </p>
      <p className="home-subtitle">{content.subtitle}</p>

      <div className="feature-cards">
        <FeatureCard
          title={content.featureCardTitles[0]}
          description={content.features[0]}
          link="/chatbot"
        />
        <FeatureCard
          title={content.featureCardTitles[1]}
          description={content.features[1]}
          link="/budgetplanner/dashboard"
        />
        <FeatureCard
          title={content.featureCardTitles[2]}
          description={content.features[2]}
          link="/documenttranscriber"
        />
      </div>

      <div className="feedback-section">
        <h3>{content.feedbackHeader}</h3>
        <p>{content.feedbackDescription}</p>
        <a href="mailto:contact@suraksha.ai" className="feedback-button">
          {content.feedbackButton}
        </a>
      </div>
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
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem("selectedLanguage") || "en"
  );

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <Home
                selectedLanguage={selectedLanguage}
                setSelectedLanguage={setSelectedLanguage}
              />
            }
          />
          <Route
            path="/chatbot"
            element={<ChatbotAdvisor selectedLanguage={selectedLanguage} />}
          />
          <Route path="/budgetplanner/*" element={<BudgetApp />} />
          <Route
            path="/documenttranscriber"
            element={<DocumentTranscriber selectedLanguage={selectedLanguage} />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
