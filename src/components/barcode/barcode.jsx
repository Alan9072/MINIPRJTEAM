import { useEffect, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";
import "./barcode.css";

const BarcodeScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Loading state
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
          fetchProductDetails(result.text);
          codeReader.reset();
        }
        if (err) {
          console.warn("Scanning error:", err);
        }
      })
      .catch((err) => setError("Camera initialization failed: " + err));
  };

  const fetchProductDetails = async (barcode) => {
    setIsLoading(true); // Start loading
    setProductDetails(null); // Reset previous product details
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const fooddata = await response.json();

      if (fooddata.product && fooddata.product.product_name) {
        const productInfo = fooddata.product.brands
          ? `${fooddata.product.product_name}, ${fooddata.product.brands}`
          : fooddata.product.product_name;

        setProductDetails(productInfo);
      } else {
        setProductDetails(false);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      setProductDetails(false);
    } finally {
      setIsLoading(false); // Stop loading after fetching
    }
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

          {isLoading ? (
            <p>Fetching product details...</p>
          ) : productDetails ? (
            <p>{productDetails}</p>
          ) : (
            <div style={{width:"100%",position:"relative"}}>
              <p style={{color:"red",width:"100%"}}>Product details not found</p>
              <a className="ocrlink" href="/ocr">OCR</a>
            </div>
          )}

          <button
            onClick={() => {
              setScanResult(null);
              setProductDetails(null);
              setIsLoading(false);
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