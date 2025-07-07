import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import {
  FaUpload, FaCopy, FaLanguage, FaSpinner, FaUndo, FaTrash,
  FaFilePdf, FaVolumeUp, FaStop, FaWhatsapp, FaMagic
} from 'react-icons/fa';
import './documenttranscriber.css';
import { translateTextWithHF } from '../../utils/huggingfaceapi';
import jsPDF from 'jspdf';
import useTextToSpeech from '../../utils/useTextToSpeech';

const DocumentTranscriber = ({ selectedLanguage }) => {
  const [labels, setLabels] = useState({
    heading: "📄 AI-Powered Document Transcriber",
    extractBtn: "Extract Text",
    translateBtn: "Translate to Hindi",
    revertBtn: "Revert to English",
    copyAlert: "Text copied to clipboard!",
    processing: "Processing...",
    placeholder: "The extracted or translated text will appear here...",
    chooseFile: "📁 Choose File",
    noFile: "No file chosen",
    clearFile: "🗑️ Clear File",
    exportPdf: "📄 Export as PDF",
    readAloud: "🔊 Read Aloud",
    stopReading: "⛔ Stop Reading",
    shareWhatsapp: "📲 Share on WhatsApp",
    simplifyText: "✨ Simplify Text",
    revertSimplify: "↩️ Revert Simplify",
    copy: "Copy",

  });

  // ✅ Update labels dynamically based on language
  useEffect(() => {
    if (selectedLanguage === "hi") {
      setLabels({
        heading: "📄 एआई-पावर्ड दस्तावेज़ ट्रांसक्राइबर",
        extractBtn: "पाठ निकालें",
        translateBtn: "हिंदी में अनुवाद करें",
        revertBtn: "अंग्रेज़ी में वापस जाएं",
        copyAlert: "पाठ क्लिपबोर्ड में कॉपी हो गया!",
        processing: "प्रक्रिया में...",
        placeholder: "यहां निकाला या अनुवादित पाठ दिखाई देगा...",
        chooseFile: "📁 फ़ाइल चुनें",
        noFile: "कोई फ़ाइल चुनी नहीं गई",
        clearFile: "🗑️ फ़ाइल हटाएँ",
        exportPdf: "📄 पीडीएफ के रूप में निर्यात करें",
        readAloud: "🔊 पढ़ें",
        stopReading: "⛔ पढ़ना रोकें",
        shareWhatsapp: "📲 व्हाट्सएप पर साझा करें",
        simplifyText: "✨ पाठ सरल करें",
        revertSimplify: "↩️ सरलता वापस लें",
        copy: "कॉपी करें",

      });
    } else {
      setLabels({
        heading: "📄 AI-Powered Document Transcriber",
        extractBtn: "Extract Text",
        translateBtn: "Translate to Hindi",
        revertBtn: "Revert to English",
        copyAlert: "Text copied to clipboard!",
        processing: "Processing...",
        placeholder: "The extracted or translated text will appear here...",
        chooseFile: "📁 Choose File",
        noFile: "No file chosen",
        clearFile: "🗑️ Clear File",
        exportPdf: "📄 Export as PDF",
        readAloud: "🔊 Read Aloud",
        stopReading: "⛔ Stop Reading",
        shareWhatsapp: "📲 Share on WhatsApp",
        simplifyText: "✨ Simplify Text",
        revertSimplify: "↩️ Revert Simplify",
        copy: "Copy",
      });
    }
  }, [selectedLanguage]);

  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState(labels.noFile);
  const [extractedText, setExtractedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [simplifiedText, setSimplifiedText] = useState('');
  const [isTranslated, setIsTranslated] = useState(false);
  const [isSimplified, setIsSimplified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { speak, stop, speaking } = useTextToSpeech();

  // ✅ All your remaining logic remains unchanged (OCR, handleTranslate, etc.)

  // ✅ Ensure `fileName` updates label correctly on language change:
  useEffect(() => {
    if (!image) {
      setFileName(labels.noFile);
    }
  }, [labels]);

  const cleanExtractedText = (text) =>
    text.replace(/-\n/g, '')
      .replace(/\n{2,}/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

  const simplifyText = (text) => {
    const skipWords = ["लेसर", "लेसोर", "lessor", "lessee", "borrower", "lender", "date", "signature"];
    const lines = text.split('\n').map(line => line.trim()).filter(line =>
      line.length > 10 &&
      !skipWords.some(word => line.toLowerCase().includes(word))
    );
    return lines.join('\n\n');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setImage(file);
    } else {
      setFileName(labels.noFile);
    }
    setExtractedText('');
    setTranslatedText('');
    setSimplifiedText('');
    setIsSimplified(false);
    setIsTranslated(false);
  };

  const handleClearFile = () => {
    setImage(null);
    setFileName(labels.noFile);
    setExtractedText('');
    setTranslatedText('');
    setSimplifiedText('');
    setIsSimplified(false);
    setIsTranslated(false);
    setProgress(0);
  };

  const handleOCR = () => {
    if (!image) return;
    setLoading(true);
    setProgress(0);

    Tesseract.recognize(image, 'eng+hin', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          setProgress(Math.floor(m.progress * 100));
        }
      },
    })
      .then(({ data: { text } }) => {
        const cleaned = cleanExtractedText(text);
        setExtractedText(cleaned);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        alert("OCR failed. Please try again.");
        setLoading(false);
      });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      isSimplified ? simplifiedText :
      translatedText || extractedText
    );
    alert(labels.copyAlert);
  };

  const handleTranslate = async () => {
  const baseText = isSimplified ? simplifiedText : extractedText;
  if (!baseText) return;
  setLoading(true);
  setProgress(0);

  try {
    const chunks = baseText.split(/\n+/).filter(line => line.trim() !== '');
    const translatedChunks = [];

    for (let i = 0; i < chunks.length; i++) {
      const translated = await translateTextWithHF(chunks[i], "en", "hi");
      translatedChunks.push(translated);
      setProgress(Math.floor(((i + 1) / chunks.length) * 100));
    }

    const finalTranslated = translatedChunks.join('\n\n');
    setTranslatedText(finalTranslated);
    setIsTranslated(true);

    if (isSimplified) {
      setSimplifiedText(simplifyText(finalTranslated));
    }
  } catch (error) {
    console.error(error);
    alert("Translation failed. Please try again.");
  }
  setLoading(false);
};

  const handleRevert = () => {
    setTranslatedText('');
    setIsTranslated(false);
    if (isSimplified) {
      setSimplifiedText(simplifyText(extractedText));
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const content = isSimplified ? simplifiedText : translatedText || extractedText || "";
    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 15, 20);
    doc.save('transcribed_document.pdf');
  };

  const handleReadAloud = () => {
    const textToRead = isSimplified ? simplifiedText : translatedText || extractedText;
    const ttsLang = isTranslated ? "hi-IN" : "en-US";
    speak(textToRead, ttsLang);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(isSimplified ? simplifiedText : translatedText || extractedText);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSimplifyToggle = () => {
    if (isSimplified) {
      setSimplifiedText('');
      setIsSimplified(false);
    } else {
      const baseText = translatedText || extractedText;
      const simplified = simplifyText(baseText);
      setSimplifiedText(simplified);
      setIsSimplified(true);
    }
  };

  return (
    <div className="transcriber-container">
      <h2 className="transcriber-heading">{labels.heading}</h2>

      <div className="transcriber-file-upload">
        <input
          type="file"
          accept="image/*"
          id="fileInput"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <label htmlFor="fileInput" className="transcriber-button">
          {labels.chooseFile}
        </label>
        <button onClick={handleClearFile} className="transcriber-button">
          <FaTrash style={{ marginRight: "6px" }} /> {labels.clearFile}
        </button>
        <span className="file-name">{fileName}</span>
      </div>

      <button onClick={handleOCR} className="transcriber-button">
        <FaUpload style={{ marginRight: "8px" }} /> {labels.extractBtn}
      </button>

      {loading && (
        <div className="transcriber-loader">
          <FaSpinner className="spin" /> {labels.processing}
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {(extractedText || translatedText || simplifiedText) && !loading && (
        <>
          <textarea
            className="transcriber-textarea"
            rows="18"
            value={
              isSimplified ? simplifiedText :
              translatedText || extractedText
            }
            onChange={(e) => {
              if (isSimplified) {
                setSimplifiedText(e.target.value);
              } else if (isTranslated) {
                setTranslatedText(e.target.value);
              } else {
                setExtractedText(e.target.value);
              }
            }}
            placeholder={labels.placeholder}
          ></textarea>

          <div className="transcriber-button-group">
            <button onClick={handleCopy} className="transcriber-button">
              <FaCopy style={{ marginRight: "6px" }} /> {labels.copy}
            </button>

            {!isTranslated ? (
              <button onClick={handleTranslate} className="transcriber-button">
                <FaLanguage style={{ marginRight: "6px" }} /> {labels.translateBtn}
              </button>
            ) : (
              <button onClick={handleRevert} className="transcriber-button">
                <FaUndo style={{ marginRight: "6px" }} /> {labels.revertBtn}
              </button>
            )}

            <button onClick={handleExportPDF} className="transcriber-button">
              <FaFilePdf style={{ marginRight: "6px" }} /> {labels.exportPdf}
            </button>

            {!speaking ? (
              <button onClick={handleReadAloud} className="transcriber-button">
                <FaVolumeUp style={{ marginRight: "6px" }} /> {labels.readAloud}
              </button>
            ) : (
              <button onClick={stop} className="transcriber-button">
                <FaStop style={{ marginRight: "6px" }} /> {labels.stopReading}
              </button>
            )}

            <button onClick={handleWhatsAppShare} className="transcriber-button">
              <FaWhatsapp style={{ marginRight: "6px" }} /> {labels.shareWhatsapp}
            </button>

            <button onClick={handleSimplifyToggle} className="transcriber-button">
              <FaMagic style={{ marginRight: "6px" }} /> 
              {isSimplified ? labels.revertSimplify : labels.simplifyText}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentTranscriber;
