import React, { useState, useEffect } from 'react';

const glossaryData = {
  "collateral": "Something pledged as security for repayment of a loan.",
  "principal": "The original sum of money borrowed.",
  "interest": "The cost you pay for borrowing money.",
  "installment": "A regular payment towards a larger debt.",
  "default": "Failure to repay a loan as agreed.",
  "foreclosure": "When a lender takes back property if you fail to repay.",
  "grace period": "Time after the due date when payment can still be made without penalty."
};

const glossaryDataHi = {
  "collateral": "ऋण चुकाने के लिए गिरवी रखा गया कोई वस्तु।",
  "principal": "उधार ली गई मूल राशि।",
  "interest": "पैसे उधार लेने की लागत।",
  "installment": "बड़े कर्ज की ओर नियमित भुगतान।",
  "default": "समझौते के अनुसार ऋण चुकाने में विफलता।",
  "foreclosure": "यदि आप ऋण चुकाने में विफल होते हैं तो ऋणदाता द्वारा संपत्ति वापस लेना।",
  "grace period": "वह समय जब देय तिथि के बाद भी बिना जुर्माने के भुगतान किया जा सकता है।"
};

const GlossaryCard = ({ text, selectedLanguage , cardClass, buttonClass, contentClass}) => {
  const [expanded, setExpanded] = useState(false);
  const [labels, setLabels] = useState({
    showGlossary: " Show Financial Terms Glossary",
    hideGlossary: " Hide Financial Terms",
    noTerms: "No common financial terms detected in this document."
  });

  useEffect(() => {
    if (selectedLanguage === "hi") {
      setLabels({
        showGlossary: " वित्तीय शब्दावली दिखाएं",
        hideGlossary: " वित्तीय शब्दावली छिपाएं",
        noTerms: "इस दस्तावेज़ में कोई सामान्य वित्तीय शब्द नहीं मिले।"
      });
    } else {
      setLabels({
        showGlossary: " Show Financial Terms Glossary",
        hideGlossary: " Hide Financial Terms",
        noTerms: "No common financial terms detected in this document."
      });
    }
  }, [selectedLanguage]);

  const foundTerms = Object.keys(glossaryData).filter(term =>
    text.toLowerCase().includes(term)
  );

  return (
    <div className={cardClass ?? "info-card"}>
      <button onClick={() => setExpanded(!expanded)} className={buttonClass ?? "info-card-button"}>
        {expanded ? labels.hideGlossary : labels.showGlossary}
      </button>
      {expanded && (
        <div className={contentClass ?? "info-card-content"}>
          {foundTerms.length > 0 ? (
            foundTerms.map(term => (
              <div key={term}>
                <strong>{term}:</strong> {selectedLanguage === "hi" ? glossaryDataHi[term] : glossaryData[term]}
              </div>
            ))
          ) : (
            <p>{labels.noTerms}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GlossaryCard;
