// src/document-transcriber/documentTranscriber.jsx

import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { FaUpload, FaCopy, FaLanguage, FaSpinner } from 'react-icons/fa';

const DocumentTranscriber = () => {
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState('');

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
    setExtractedText('');
    setTranslatedText('');
  };

  const handleOCR = () => {
    if (!image) return;
    setLoading(true);

    Tesseract.recognize(image, 'eng', {
      logger: (m) => console.log(m),
    })
      .then(({ data: { text } }) => {
        setExtractedText(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText || translatedText);
    alert('Text copied to clipboard!');
  };

  const handleTranslate = async () => {
    if (!extractedText) return;
    setLoading(true);
    try {
      // replace this with your pipeline:
      const translated = extractedText.split(' ').reverse().join(' '); // placeholder reverse for demo
      setTranslatedText(translated);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📄 AI-Powered Document Transcriber</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={styles.fileInput}
      />

      <button onClick={handleOCR} style={styles.button}>
        <FaUpload style={{ marginRight: '8px' }} /> Extract Text
      </button>

      {loading && (
        <div style={styles.loader}>
          <FaSpinner className="spin" /> Processing...
        </div>
      )}

      {(extractedText || translatedText) && (
        <>
          <textarea
            style={styles.textarea}
            rows="12"
            value={translatedText || extractedText}
            onChange={(e) =>
              translatedText
                ? setTranslatedText(e.target.value)
                : setExtractedText(e.target.value)
            }
          ></textarea>

          <div style={styles.buttonGroup}>
            <button onClick={handleCopy} style={styles.button}>
              <FaCopy style={{ marginRight: '6px' }} /> Copy Text
            </button>
            <button onClick={handleTranslate} style={styles.button}>
              <FaLanguage style={{ marginRight: '6px' }} /> Translate
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #5e35b1, #7e57c2)',
    borderRadius: '16px',
    color: 'white',
    textAlign: 'center',
    fontFamily: 'sans-serif',
  },
  heading: {
    marginBottom: '1rem',
  },
  fileInput: {
    margin: '1rem 0',
  },
  button: {
    background: '#9575cd',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    margin: '0.5rem',
  },
  loader: {
    margin: '1rem',
    fontSize: '1rem',
  },
  textarea: {
    width: '100%',
    padding: '1rem',
    borderRadius: '8px',
    border: 'none',
    marginTop: '1rem',
    fontSize: '1rem',
  },
  buttonGroup: {
    marginTop: '1rem',
  },
};

export default DocumentTranscriber;
