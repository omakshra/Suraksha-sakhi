import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { FaUpload, FaCopy, FaLanguage, FaSpinner, FaUndo } from 'react-icons/fa';
import './documenttranscriber.css';
import { translateTextWithHF } from '../../utils/huggingfaceapi';

const DocumentTranscriber = () => {
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslated, setIsTranslated] = useState(false);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
    setExtractedText('');
    setTranslatedText('');
    setIsTranslated(false);
  };

  const cleanExtractedText = (text) => {
    return text
      .replace(/-\n/g, '')             // remove hyphenated line breaks
      .replace(/\n{2,}/g, '\n')        // collapse multiple newlines
      .replace(/[ \t]+/g, ' ')         // collapse multiple spaces
      .trim();
  };

  const handleOCR = () => {
    if (!image) return;
    setLoading(true);

    Tesseract.recognize(image, 'eng', {
      logger: (m) => console.log(m),
    })
      .then(({ data: { text } }) => {
        const cleaned = cleanExtractedText(text);
        setExtractedText(cleaned);
        setTranslatedText('');
        setIsTranslated(false);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        alert("OCR failed. Please try again.");
        setLoading(false);
      });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText || extractedText);
    alert('Text copied to clipboard!');
  };

  const handleTranslate = async () => {
    if (!extractedText) return;
    setLoading(true);
    try {
      // Split into chunks for better translation accuracy
      const chunks = extractedText.split(/\n+/).filter(line => line.trim() !== '');
      const translatedChunks = [];

      for (const chunk of chunks) {
        const translated = await translateTextWithHF(chunk, "en", "hi");
        translatedChunks.push(translated);
      }

      setTranslatedText(translatedChunks.join('\n\n'));
      setIsTranslated(true);
    } catch (error) {
      console.error(error);
      alert("Translation failed. Please try again.");
    }
    setLoading(false);
  };

  const handleRevert = () => {
    setTranslatedText('');
    setIsTranslated(false);
  };

  return (
    <div className="transcriber-container">
      <h2 className="transcriber-heading">📄 AI-Powered Document Transcriber</h2>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="transcriber-file-input"
      />
      <button onClick={handleOCR} className="transcriber-button">
        <FaUpload style={{ marginRight: '8px' }} /> Extract Text
      </button>

      {loading && (
        <div className="transcriber-loader">
          <FaSpinner className="spin" /> Processing...
        </div>
      )}

      {(extractedText || translatedText) && !loading && (
        <>
          <textarea
            className="transcriber-textarea"
            rows="18"
            value={translatedText || extractedText}
            onChange={(e) =>
              isTranslated
                ? setTranslatedText(e.target.value)
                : setExtractedText(e.target.value)
            }
          ></textarea>

          <div className="transcriber-button-group">
            <button onClick={handleCopy} className="transcriber-button">
              <FaCopy style={{ marginRight: '6px' }} /> Copy Text
            </button>
            {!isTranslated ? (
              <button onClick={handleTranslate} className="transcriber-button">
                <FaLanguage style={{ marginRight: '6px' }} /> Translate to Hindi
              </button>
            ) : (
              <button onClick={handleRevert} className="transcriber-button">
                <FaUndo style={{ marginRight: '6px' }} /> Revert to English
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentTranscriber;
