// src/App.js

import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Link } from "react-router-dom";

// Import Navbar from components
import Navbar from './components/navbar';

// Import feature pages from /features
// import ChatbotAdvisor from './features/chatbot/ChatbotAdvisor';
import BudgetPlanner from './features/budgetplanner/budgetplanner';
// import DocumentTranscriber from './features/documentTranscriber/DocumentTranscriber';

// Simple Home Page
function Home() {
  return (
    <div className="home-container">
      <h1>Welcome to Suraksha</h1>
      <p className="home-subtitle">
        Empowering women through financial literacy, AI-powered tools, and accessible technology.
      </p>
      <p className="home-subsubtitle">
        Explore the features below to transform your financial journey:
      </p>

      <div className="feature-cards">
        <FeatureCard
          title="🤖 AI Chatbot Advisor"
          description="Get budgeting, savings, legal guidance, and business coaching using multilingual AI."
          link="/chatbot"
        />
        <FeatureCard
          title="📊 Smart Budget Planner"
          description="Track expenses, plan goals, and receive reminders for bills and schemes easily."
          link="/budgetplanner"
        />
        <FeatureCard
          title="📝 Document Transcriber"
          description="Digitize handwritten/printed documents and auto-fill forms using OCR easily."
          link="/documenttranscriber"
        />
      </div>
    </div>
  );
}

function FeatureCard({ title, description, link }) {
  return (
    <Link to={link} className="feature-card">
      <h2>{title}</h2>
      <p>{description}</p>
    </Link>
  );
}

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
