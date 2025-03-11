import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AiOutlineSend } from "react-icons/ai";
import "./askai.css";


const AskAI = () => {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fileUploaded, setFileUploaded] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchAIResponse = async () => {
        if (loading || (!userInput.trim() && !image)) return;

        const userMessage = { text: userInput || "File uploaded", sender: "user", image };
        setMessages((prev) => [...prev, userMessage]);
        setLoading(true);

        try {
            const genAI = new GoogleGenerativeAI("AIzaSyDCvz2XzpESIWiSJE2dxsMrOy2t4olGA1o");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const parts = [];
            if (userInput.trim()) parts.push({ text: userInput });

            if (image) {
                const base64 = await convertImageToBase64(image);
                parts.push({
                    inlineData: { mimeType: image.type, data: base64.split(",")[1] },
                });
            }

            const result = await model.generateContent({
                contents: [{ role: "user", parts }],
            });

            const aiResponse = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to respond.";
            setMessages((prev) => [...prev, { text: aiResponse, sender: "ai" }]);
        } catch (error) {
            console.error("Error fetching AI response:", error);
            setMessages((prev) => [...prev, { text: "Failed to load response.", sender: "ai" }]);
        }
        setLoading(false);
        setUserInput("");
        setImage(null);
        setFileUploaded(false); 
    };

    const convertImageToBase64 = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
        });
    };
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setFileUploaded(true); // Change button text to "File Added"
        }
    };

    return (
        <div className="chat-container">
     <h2
>
     HealthSnap Bot 
</h2>
            <p className="title">What can I help with?</p>

            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender}`}>
                        {msg.image && <img src={URL.createObjectURL(msg.image)} alt="Uploaded" className="chat-image" />}
                        {msg.text}
                    </div>
                ))}
                <div ref={chatEndRef}></div>
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type a message..."
                    disabled={loading}
                />
                <div className="together">
                <label className="upload-button">
                    <span className="file-label">{fileUploaded ? "File Added" : "Add File"}</span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden-file-input"
                    />
                </label>
                <AiOutlineSend color="#6D9D39" style={{marginRight:"10px"}} size={30} onClick={fetchAIResponse} />
                </div>
            </div>
        </div>
    );
};

export default AskAI;