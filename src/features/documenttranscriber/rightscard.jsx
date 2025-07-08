import React, { useState, useEffect } from 'react';

const RightsCard = ({ selectedLanguage ,cardClass, buttonClass, contentClass }) => {
  const [expanded, setExpanded] = useState(false);
  const [labels, setLabels] = useState({
    showRights: "⚖️ Show Your Rights",
    hideRights: "⚖️ Hide Your Rights",
    rights: [
      "You have the right to ask questions before signing any document.",
      "You have the right to get documents translated into a language you understand.",
      "You have the right to get a copy of what you sign.",
      "You can consult a trusted person before agreeing to any financial terms."
    ]
  });

  useEffect(() => {
    if (selectedLanguage === "hi") {
      setLabels({
        showRights: " अपने अधिकार दिखाएं",
        hideRights: " अपने अधिकार छुपाएं",
        rights: [
          "आपके पास किसी भी दस्तावेज़ पर हस्ताक्षर करने से पहले प्रश्न पूछने का अधिकार है।",
          "आपके पास दस्तावेज़ों को ऐसी भाषा में अनुवादित करवाने का अधिकार है जिसे आप समझते हैं।",
          "आपके पास उस दस्तावेज़ की एक प्रति प्राप्त करने का अधिकार है जिस पर आप हस्ताक्षर करते हैं।",
          "आप किसी भी वित्तीय शर्त पर सहमत होने से पहले किसी विश्वसनीय व्यक्ति से सलाह ले सकते हैं।"
        ]
      });
    } else {
      setLabels({
        showRights: " Show Your Rights",
        hideRights: " Hide Your Rights",
        rights: [
          "You have the right to ask questions before signing any document.",
          "You have the right to get documents translated into a language you understand.",
          "You have the right to get a copy of what you sign.",
          "You can consult a trusted person before agreeing to any financial terms."
        ]
      });
    }
  }, [selectedLanguage]);

  return (
    <div className={cardClass ?? "info-card"}>
      <button onClick={() => setExpanded(!expanded)} className={buttonClass ?? "info-card-button"}>
        {expanded ? labels.hideRights : labels.showRights}
      </button>
      {expanded && (
        <div className={contentClass ?? "info-card-content"}>
          <ul>
            {labels.rights.map((right, index) => (
              <li key={index}>{right}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RightsCard;
