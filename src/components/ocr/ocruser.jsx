import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import OCRInput from "./ocrinput";
import "./ocruser.css";

export default function OCRUser() {
    const location = useLocation();
    const { aiResponse } = location.state || { aiResponse: "No AI response available" };
    const [promptResponses, setPromptResponses] = useState(["", "", "", ""]);

    useEffect(() => {
        async function fetchPromptResponses() {
            try {
                const { GoogleGenerativeAI } = await import("@google/generative-ai");
                const genAI = new GoogleGenerativeAI("AIzaSyDCvz2XzpESIWiSJE2dxsMrOy2t4olGA1o");
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                const prompts = [
                    `### **FSSAI Approval Status for Ingredient: "${aiResponse}"**\n\nProvide the FSSAI approval status in one word max.\n- Approved / Restricted / Banned\n- Include regulation number if available.\n- Ensure 95% accuracy strictly based on verified sources.`,
                    `### **Safety Score Evaluation for Ingredient: give score only if FSSAI approval status is approved. Give the answer in one word. "${aiResponse}"**\n\nGive a safety score (1-10) in one word max with consider with FSSAI Standard and Health risk.\n- Justify briefly with sources if possible.\n- Ensure 95% accuracy strictly based on verified sources like FSSAI site:fssai.gov.in.`,
                    `### **Final Verdict on Ingredient: "${aiResponse}"**\n\nSay Safe / Moderate / Unsafe  based on FSSAI standard and Regulation  in one sentences max.\n- Safe / Moderate / Unsafe based on regulations.\n- Ensure 95% accuracy strictly based on verified sources.`,
                    `### **Comprehensive Ingredient Analysis: "${aiResponse}"**\n\nProvide a concise analysis in two sentences max.\n- Mention definition, risks, benefits, and status.\n- Ensure 95% accuracy strictly based on verified sources..\n`
                ];

                // Send four parallel requests
                const responses = await Promise.all(prompts.map(prompt => model.generateContent(prompt)));

                // Extract text responses
                const extractedResponses = responses.map(res => 
                    res.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No response available"
                );
                
                setPromptResponses(extractedResponses);
            } catch (error) {
                console.error("Error fetching AI response:", error);
                setPromptResponses(["Error retrieving information.", "Error retrieving information.", "Error retrieving information.", "Error retrieving information."]);
            }
        }

        fetchPromptResponses();
    }, [aiResponse]);

    const formatResponse = (response, index, title) => (
        <div key={index} className="response-section">
            <h3>{title} {index + 1}</h3>
            <p>{response}</p>
        </div>
    );

    return (
        <div className="ocr-user-container">
            <h1 className="header1">FSSAI Based Analysis Report</h1>
            <OCRInput aiResponse={aiResponse} />
            <div className="ai-explanations">
                <h2>AI Analysis</h2>
                {promptResponses.some(response => response) ? (
                    <>
                        {formatResponse(promptResponses[0], 0, "FSSAI Approval Status:")}
                        {formatResponse(promptResponses[1], 1, "Safety Score Evaluation")}
                        {formatResponse(promptResponses[2], 2, "Final Verdict")}
                        {formatResponse(promptResponses[3], 3, "Comprehensive Analysis")}
                    </>
                ) : (
                    <p className="loading-text">Loading...</p>
                )}
            </div>
        </div>
    );
}