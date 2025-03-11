import { useEffect, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import "./barcode.css";
const BarcodeScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const codeReader = new BrowserMultiFormatReader();

  useEffect(() => {
    codeReader
      .getVideoInputDevices()
      .then((videoInputDevices) => {
        if (videoInputDevices.length > 0) {
          let backCamera = videoInputDevices.find((device) =>
            device.label.toLowerCase().includes("back")
          );

          let selectedDevice = backCamera
            ? backCamera.deviceId
            : videoInputDevices[0].deviceId; // Fallback to first camera if no back camera found

          startScanner(selectedDevice);
        } else {
          setError("No camera found!");
        }
      })
      .catch((err) => setError("Error accessing camera: " + err));

    return () => {
      codeReader.reset();
    };
  }, []);

  const startScanner = (videoInputId) => {
    codeReader
      .decodeFromVideoDevice(videoInputId, "video", (result, err) => {
        if (result) {
          setScanResult(result.text);
          codeReader.reset(); // Stop scanning after a successful scan
        }
        if (err) {
          console.warn("Scanning error:", err);
        }
      })
      .catch((err) => setError("Camera initialization failed: " + err));
  };

  return (
    <div className="scanner-container">
      <h2>Scan a Barcode</h2>

      {error && <p className="error-message">{error}</p>}

      {!scanResult ? (
        <div>
          <video id="video" className="scanner-box"></video>
        </div>
      ) : (
        <div className="scan-result">
          <h3>Scanned Code:</h3>
          <p>{scanResult}</p>
          <button
            onClick={() => {
              setScanResult(null);
              window.location.reload(); // Reload page to restart scanning properly
            }}
            className="scan-again-btn"
          >
            Scan Again
          </button>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
