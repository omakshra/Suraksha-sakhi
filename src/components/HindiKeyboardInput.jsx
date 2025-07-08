import React, { useState, useRef, useEffect } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import "./HindiKeyboardInput.css";

const HindiKeyboardInput = ({ value, setValue }) => {
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef();
  const wrapperRef = useRef();

  const onKeyPress = (button) => {
    if (button === "{bksp}") {
      setValue((prev) => prev.slice(0, -1));
    } else if (button === "{space}") {
      setValue((prev) => prev + " ");
    } else if (button === "{enter}") {
      setValue((prev) => prev + "\n");
    } else {
      setValue((prev) => prev + button);
    }
  };

  const handleFocus = () => {
    setShowKeyboard(true);
  };

  // 👇 Close keyboard when clicking outside input + keyboard
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setShowKeyboard(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="hindi-input-container" ref={wrapperRef}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={handleFocus}
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
          onKeyPress={onKeyPress}
          theme="hg-theme-default myTheme"
        />
      )}
    </div>
  );
};

export default HindiKeyboardInput;
