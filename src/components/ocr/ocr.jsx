import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./ocr.css";
import OCRInput from "./ocrinput"; // Import the new component

export default function IntegratedScanAI() {
  const webcamRef = useRef(null);
  const [images, setImages] = useState([]);
  const [scannedText, setScannedText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [showWebcam, setShowWebcam] = useState(true);
  const navigate = useNavigate();

  const captureImage = async () => {
    if (!webcamRef.current) return;
    const imgSrc = webcamRef.current.getScreenshot();
    const newImages = [...images, imgSrc];
    setImages(newImages);
    if (newImages.length === 2) {
      setShowWebcam(false);
      await fetchAIResponse(newImages);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imgSrc = reader.result;
        const newImages = [...images, imgSrc];
        setImages(newImages);
        if (newImages.length === 2) {
          setShowWebcam(false);
          await fetchAIResponse(newImages);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchAIResponse = async (imgSrcs) => {
    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI("AIzaSyC1PmlFxhrzSo5cYJj6QhBJqmVYNKw4cv0");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const results = await Promise.all(
        imgSrcs.map(async (imgSrc, index) => {
          const base64Data = imgSrc.split(",")[1];
          const promptText = index === 0 
            ? "Read only the ingredient part from this image." 
            : "Read only the nutritional information part from this image.";
          const result = await model.generateContent({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: promptText,
                  },
                  {
                    inlineData: {
                      mimeType: "image/jpeg",
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
          });
          return result.response.text();
        })
      );

      setAiResponse(results.join("\n"));

      // Optional local OCR
      const ocrResults = await Promise.all(
        imgSrcs.map((imgSrc) =>
          Tesseract.recognize(imgSrc, "eng").then(({ data: { text } }) => text.trim())
        )
      );
      setScannedText(ocrResults.join("\n"));
    } catch (error) {
      console.error(error);
      setAiResponse("Error extracting information.");
    }
    setLoading(false);
  };

  const handleCaptureButtonClick = () => {
    if (images.length >= 2) {
      handleReset();
    } else {
      setShowWebcam(true);
      captureImage();
    }
  };

  const handleReset = () => {
    setImages([]);
    setScannedText("");
    setAiResponse("");
    setShowWebcam(true);
  };

  const handleRedirect = () => {
    navigate("/ocruser", { state: { aiResponse } });
  };

  return (
    <div className="app-container">
      <h1 className="header">AI based OCR</h1>
      <div className="main-content">
        {showWebcam && (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="webcam"
            videoConstraints={{
              facingMode: "environment"
            }}
          />
        )}
        <br />
        <button onClick={handleCaptureButtonClick} disabled={loading} className="capture-button">
          {loading ? "Processing..." : images.length === 0 ? "Capture Ingredient" : images.length === 1 ? "Capture Nutritional Info" : "Restart"}
        </button>
        <br />
        <label className="upload-button">
          <input type="file" accept="image/*" onChange={handleFileUpload} disabled={loading} />
          {loading ? "Uploading..." : "Choose File"}
        </label>
        {images.length > 0 && (
          <div>
            <h2>Captured Images</h2>
            {images.map((img, index) => (
              <img key={index} src={img} alt={`Captured ${index + 1}`} className="preview-image" />
            ))}
          </div>
        )}
        
        <OCRInput scannedText={scannedText} aiResponse={aiResponse} />
        <button onClick={handleRedirect} className="redirect-button result-button">
          AI Analysis
        </button>
      </div>
    </div>
  );
}