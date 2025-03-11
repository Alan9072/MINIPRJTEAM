"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./scan.css";

function ScannerApp() {
  const [activeScanner, setActiveScanner] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeScanner === "barcode") {
      console.log("Navigating to Barcode Scanner...");
      navigate("/barcode");
    } else if (activeScanner === "ocr") {
      console.log("Navigating to OCR Scanner...");
      navigate("/ocr");
    }
  }, [activeScanner, navigate]);

  const handleScannerSelect = (type) => {
    console.log(`Scanner Selected: ${type}`);
    setActiveScanner(type);
  };

  return (
    <div className="scanner-container">
      <div className="scanner-option-wrapper">
        {/* Barcode Scanner Option */}
        <div
          className={`scanner-option ${activeScanner === "barcode" ? "active" : ""}`}
          onClick={() => handleScannerSelect("barcode")}
        >
          <div className="scanner-title">70% Accuracy Barcode</div>
          <div className="barcode-container">
            <div className="barcode-box">
              <div className="barcode-background">
                <div className="barcode-lines">
                  {Array(12)
                    .fill()
                    .map((_, i) => (
                      <div key={i} className={`barcode-line ${i % 3 === 0 ? "green" : "black"}`}></div>
                    ))}
                </div>
              </div>
            </div>
            <div className="scanner-frame">
              <div className="scanner-line"></div>
            </div>
          </div>
        </div>

        {/* OCR Scanner Option */}
        <div
          className={`scanner-option ${activeScanner === "ocr" ? "active" : ""}`}
          onClick={() => handleScannerSelect("ocr")}
        >
          <div className="scanner-title">90% Accuracy OCR</div>
          <div className="ocr-container">
            <div className="ocr-box">
              <div className="ocr-text">OCR</div>
              <div className="ocr-frame">
                <div className="corner top-left"></div>
                <div className="corner top-right"></div>
                <div className="corner bottom-left"></div>
                <div className="corner bottom-right"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ScannerApp;
