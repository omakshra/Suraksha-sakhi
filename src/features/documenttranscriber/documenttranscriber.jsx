import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import {
  FaCopy, FaLanguage, FaSpinner, FaUndo, FaTrash,
  FaFilePdf, FaVolumeUp, FaStop, FaWhatsapp, FaMagic
} from 'react-icons/fa';
import './documenttranscriber.css';
import { translateTextWithHF } from '../../utils/huggingfaceapi';
import jsPDF from 'jspdf';
import useTextToSpeech from '../../utils/useTextToSpeech';
import { summarizeTextWithHF } from '../../utils/summarizewithHF';
import GlossaryCard from './glossarycard';
import RightsCard from './rightscard';
import { sendTextToChatbotForSummary } from "./sendtexttochatbot"; // adjust path if needed


const DocumentTranscriber = ({ selectedLanguage }) => {
  const [labels, setLabels] = useState({
    heading: "📄 AI-Powered Document Transcriber",
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
    showAdvanced: "⚙️ Show Advanced",
hideAdvanced: "⚙️ Hide Advanced",

  });

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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [simplifiedTextEn, setSimplifiedTextEn] = useState('');

  useEffect(() => {
    if (!image) setFileName(labels.noFile);
  }, [labels]);

  useEffect(() => {
    if (selectedLanguage === "hi") {
      setLabels({
        heading: "📄 एआई-पावर्ड दस्तावेज़ ट्रांसक्राइबर",
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
        showAdvanced: "⚙️ उन्नत विकल्प दिखाएं",
hideAdvanced: "⚙️ उन्नत विकल्प छुपाएं",

      });
    } else {
      setLabels({
        heading: "📄 AI-Powered Document Transcriber",
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
        showAdvanced: "⚙️ Show Advanced",
hideAdvanced: "⚙️ Hide Advanced",

      });
    }
  }, [selectedLanguage]);

  const cleanExtractedText = (text) =>
    text.replace(/-\n/g, '').replace(/\n{2,}/g, '\n').replace(/[ \t]+/g, ' ').trim();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setImage(file);
      handleOCR(file);
    } else {
      setFileName(labels.noFile);
    }
    setExtractedText('');
    setTranslatedText('');
    setSimplifiedText('');
    setIsSimplified(false);
    setIsTranslated(false);
  };

  const handleOCR = (file) => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    Tesseract.recognize(file, 'eng+hin', {
      logger: (m) => m.status === 'recognizing text' && setProgress(Math.floor(m.progress * 100)),
    })
      .then(({ data: { text } }) => {
        setExtractedText(cleanExtractedText(text));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        alert("OCR failed. Please try again.");
        setLoading(false);
      });
  };

 const handleTranslate = async () => {
    const baseText = isSimplified ? simplifiedText : extractedText;

    if (!baseText.trim()) {
        alert("No text available for translation.");
        return;
    }

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

        let finalTranslatedText = translatedChunks.join('\n\n');

        // ✅ Remove English words but preserve structure
        const cleanedLines = finalTranslatedText.split('\n').map(line =>
            line.replace(/\b[a-zA-Z]+\b/g, '').replace(/\s{2,}/g, ' ').trim()
        );
        finalTranslatedText = cleanedLines.join('\n');

        setTranslatedText(finalTranslatedText);
        setIsTranslated(true);

        if (isSimplified) {
            setSimplifiedText(finalTranslatedText);
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
  // If simplified, revert it to English simplified text
  if (isSimplified && simplifiedTextEn) {
    setSimplifiedText(simplifiedTextEn);
  }
};


  const handleExportPDF = () => {
    const doc = new jsPDF();
    const content = isSimplified ? simplifiedText : translatedText || extractedText;
    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 15, 20);
    doc.save('transcribed_document.pdf');
  };

  const cleanHindiTextForSpeech = (text) => {
  return text
    .split('\n')
    .map(line => line.replace(/\b[a-zA-Z]+\b/g, '').replace(/[0-9]/g, '').trim())
    .filter(line => line.length > 0)
    .join('\n')
    .trim();
};

const handleReadAloud = () => {
  const textToRead = isSimplified ? simplifiedText : translatedText || extractedText;

  if (!textToRead.trim()) {
    alert("No text to read aloud.");
    return;
  }

  let textToSpeak = textToRead;
  let preferredLang = "en-US";

  if (isTranslated) {
    textToSpeak = cleanHindiTextForSpeech(textToRead);
    preferredLang = "hi-IN";
  } else if (/[\u0900-\u097F]/.test(textToRead)) { // Detect Devanagari
    textToSpeak = cleanHindiTextForSpeech(textToRead);
    preferredLang = "hi-IN";
  }

  speak(textToSpeak, preferredLang);
};

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(isSimplified ? simplifiedText : translatedText || extractedText);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(isSimplified ? simplifiedText : translatedText || extractedText);
    alert(labels.copyAlert);
  };
const handleSimplifyToggle = async () => {
    const baseText = extractedText;

    if (isSimplified) {
        // Revert
        setSimplifiedText('');
        setSimplifiedTextEn('');
        setIsSimplified(false);
    } else {
        if (!baseText.trim()) {
            alert("No text to summarize.");
            return;
        }

        setLoading(true);
        try {
            const summary = await sendTextToChatbotForSummary(baseText);
            setSimplifiedText(summary);
            setSimplifiedTextEn(summary);
            setIsSimplified(true);
        } catch (error) {
            console.error(error);
            alert("Simplification failed. Please try again.");
        }
        setLoading(false);
    }
};

  return (
    <div className="transcriber-container">
      <h2 className="transcriber-heading">{labels.heading}</h2>

      <div className="transcriber-file-upload">
        <input type="file" accept="image/*" id="fileInput" onChange={handleFileChange} style={{ display: "none" }} />
        <label htmlFor="fileInput" className="transcriber-button">{labels.chooseFile}</label>
        <button onClick={() => {
          setImage(null);
          setFileName(labels.noFile);
          setExtractedText('');
          setTranslatedText('');
          setSimplifiedText('');
          setIsSimplified(false);
          setIsTranslated(false);
          setProgress(0);
        }} className="transcriber-button"><FaTrash style={{ marginRight: "6px" }} /> {labels.clearFile}</button>
        <span className="file-name">{fileName}</span>
      </div>

      {loading && (
        <div className="transcriber-loader">
          <FaSpinner className="spin" /> {labels.processing}
          <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${progress}%` }}></div></div>
        </div>
      )}

      {(extractedText || translatedText || simplifiedText) && !loading && (
        <>
          <textarea
            className="transcriber-textarea"
            rows="18"
            value={isSimplified ? simplifiedText : translatedText || extractedText}
            onChange={(e) => {
              if (isSimplified) setSimplifiedText(e.target.value);
              else if (isTranslated) setTranslatedText(e.target.value);
              else setExtractedText(e.target.value);
            }}
            placeholder={labels.placeholder}
          ></textarea>

          <div className="transcriber-button-group">
            <button onClick={handleSimplifyToggle} className="transcriber-button">
              <FaMagic style={{ marginRight: "6px" }} /> {isSimplified ? labels.revertSimplify : labels.simplifyText}
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

            {!speaking ? (
              <button onClick={handleReadAloud} className="transcriber-button">
                <FaVolumeUp style={{ marginRight: "6px" }} /> {labels.readAloud}
              </button>
            ) : (
              <button onClick={stop} className="transcriber-button">
                <FaStop style={{ marginRight: "6px" }} /> {labels.stopReading}
              </button>
            )}

            <button onClick={() => setShowAdvanced(!showAdvanced)} className="transcriber-button">
  {showAdvanced ? labels.hideAdvanced : labels.showAdvanced}
</button>

          </div>

          {showAdvanced && (
            <div className="transcriber-button-group">
              <button onClick={handleCopy} className="transcriber-button">
                <FaCopy style={{ marginRight: "6px" }} /> {labels.copy}
              </button>
              <button onClick={handleExportPDF} className="transcriber-button">
                <FaFilePdf style={{ marginRight: "6px" }} /> {labels.exportPdf}
              </button>
              <button onClick={handleWhatsAppShare} className="transcriber-button">
                <FaWhatsapp style={{ marginRight: "6px" }} /> {labels.shareWhatsapp}
              </button>
            </div>
          )}
        </>
      )}

       {(translatedText || extractedText) && (
        <>
          <GlossaryCard
            text={translatedText || extractedText}
            selectedLanguage={selectedLanguage}
            cardClass="transcriber-info-card"
            buttonClass="transcriber-info-card-button"
            contentClass="transcriber-info-card-content"
          />
          <RightsCard
            selectedLanguage={selectedLanguage}
            cardClass="transcriber-info-card"
            buttonClass="transcriber-info-card-button"
            contentClass="transcriber-info-card-content"
          />
        </>
      )}
    </div>
  );
};

export default DocumentTranscriber;
