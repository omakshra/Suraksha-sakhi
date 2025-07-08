import { useState, useEffect, useRef } from 'react';
import styles from './ChatbotAdvisor.module.css';

function ChatBot({ selectedLanguage }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [labels, setLabels] = useState({
  heading: "💬 Your friendly AI-Chatbot",
  placeholder: "Type or use 🎤 to speak...",
  send: "Send",
  speak: "🎤"
});

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      if (data.reply) {
        setMessages([...newMessages, { sender: 'bot', text: data.reply }]);
      } else {
        setMessages([...newMessages, { sender: 'bot', text: '⚠️ No response from server.' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...newMessages, { sender: 'bot', text: '⚠️ Error talking to the bot.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in your browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      alert('Speech recognition error: ' + event.error);
    };
  };
  useEffect(() => {
  if (selectedLanguage === "hi") {
    setLabels({
      heading: "💬 आपका मित्रवत एआई-चैटबॉट",
      placeholder: "टाइप करें या बोलने के लिए 🎤 का उपयोग करें...",
      send: "भेजें",
      speak: "🎤"
    });
  } else {
    setLabels({
      heading: "💬 Your friendly AI-Chatbot",
      placeholder: "Type or use 🎤 to speak...",
      send: "Send",
      speak: "🎤"
    });
  }
}, [selectedLanguage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={styles['chatbot-sakhi-container']}>
      <h2 className={styles['chatbot-sakhi-title']}>{labels.heading}</h2>
      <div className={styles['chatbot-sakhi-box']}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles['chatbot-message-card']} ${styles[msg.sender]}`}
          >
            {msg.text}
          </div>
        ))}
        {isLoading && (
          <div className={`${styles['chatbot-message-card']} ${styles['bot']}`}>
            ⏳ Bot is typing...
          </div>
        )}
        <div ref={chatEndRef}></div>
      </div>
      <div className={styles['chatbot-sakhi-input-area']}>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={styles['chatbot-language-dropdown']}
        >
          <option value="en-US">English</option>
          <option value="hi-IN">Hindi</option>
        </select>

        <input
          type="text"
          placeholder={labels.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>{labels.send}</button>
        <button onClick={handleVoiceInput}>{labels.speak}</button>
      </div>
    </div>
  );
}

export default ChatBot;
