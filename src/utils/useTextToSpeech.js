// utils/useTextToSpeech.js
import { useState } from 'react';

const useTextToSpeech = () => {
  const [speaking, setSpeaking] = useState(false);

  const speak = (text, lang = 'hi-IN') => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onend = () => setSpeaking(false);
    setSpeaking(true);
    speechSynthesis.speak(utterance);
  };

  const stop = () => {
    speechSynthesis.cancel();
    setSpeaking(false);
  };

  return { speak, stop, speaking };
};

export default useTextToSpeech;
