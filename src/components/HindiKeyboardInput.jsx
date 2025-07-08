// HindiKeyboardInput.jsx
import React, { useState, useRef } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import "./HindiKeyboardInput.css";

const HindiKeyboardInput = ({ value, setValue }) => {
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef();

  const onChange = (input) => {
    setValue(input);
  };

  const handleFocus = () => {
    setShowKeyboard(true);
  };

  const handleBlur = () => {
    // Delay to allow keyboard click
    setTimeout(() => setShowKeyboard(false), 200);
  };

  return (
    <div className="hindi-input-container">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="यहाँ हिंदी में टाइप करें..."
        className="form-control mb-2"
      />

      {showKeyboard && (
        <Keyboard
          layout={{
            default: [
              "१ २ ३ ४ ५ ६ ७ ८ ९ ० - = {bksp}",
              "ा ि ी ु ू े ै ो ौ ् {enter}",
              "क ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण",
              "त थ द ध न प फ ब भ म य र ल व श",
              "ष स ह ळ क्ष त्र ज्ञ {space}"
            ]
          }}
          display={{
            "{bksp}": "⌫",
            "{enter}": "⏎",
            "{space}": "⎵"
          }}
          onChange={onChange}
          theme="hg-theme-default myTheme"
        />
      )}
    </div>
  );
};

export default HindiKeyboardInput;
