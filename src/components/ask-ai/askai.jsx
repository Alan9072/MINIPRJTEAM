import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./askai.css";

// Import the CSS file

const AskAI = () => {
    const [userInput, setUserInput] = useState("");
    const [response, setResponse] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchAIResponse = async () => {
        if (!userInput.trim() && !image) {
            setResponse("Please enter a question or upload an image.");
            return;
        }

        setLoading(true);
        try {
            const genAI = new GoogleGenerativeAI("AIzaSyDCvz2XzpESIWiSJE2dxsMrOy2t4olGA1o");
            // Replace with your actual API key
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const parts = [];
            if (userInput.trim()) {
                parts.push({ text: `User question: ${userInput}` });
            }

            if (image) {
                const base64 = await convertImageToBase64(image);
                parts.push({
                    inlineData: { mimeType: image.type, data: base64.split(",")[1] },
                });
            }

            const result = await model.generateContent({
                contents: [{ role: "user", parts }],
            });
            const text = await result.response.text();

            setResponse(text);
        } catch (error) {
            console.error("Error fetching AI response:", error);
            setResponse("Failed to load response. Try again.");
        }
        setLoading(false);
    };

    const convertImageToBase64 = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
        });
    };

    return (
        <div className="chatbot-container">
            <h2 className="chatbot-title">How Can I Help You Today😀!</h2>

            {/* Text Input */}
            <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask a question..."
                className="chatbot-input"
            />

            {/* Image Upload */}
            <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="chatbot-file-input"
            />

            {/* Fetch AI Response Button */}
            <button
                onClick={fetchAIResponse}
                className="chatbot-button"
                disabled={loading}
            >
                {loading ? "Loading..." : "Get Answer"}
            </button>

            {/* Response Display */}
            <div className="chatbot-response">
                <strong>Response:</strong>
                <p>{response}</p>
            </div>
        </div>
    );
};

export default AskAI;
