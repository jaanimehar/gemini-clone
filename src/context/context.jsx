import { createContext, useState } from "react";
import run from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {

    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);

    // upload image
    const handleGalleryClick = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*"; // Allow only image files
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    setUploadedImage(reader.result); // Store the base64 image
                };
                reader.readAsDataURL(file);
            }
        };
        fileInput.click(); // Programmatically open the file picker
    };



    // Initialize SpeechRecognition
    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US"; // Set language
    recognition.interimResults = false; // Wait for final results

    // Start listening function
    const startListening = () => {
        setIsListening(true);
        recognition.start();
    };

    // Stop listening function
    const stopListening = () => {
        setIsListening(false);
        recognition.stop();
    };

    // Handle recognition results
    recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join("");
        setInput((prev) => `${prev} ${transcript}`.trim()); // Append new speech
    };

    // Handle recognition end
    recognition.onend = () => {
        setIsListening(false);
    };

    // Handle recognition errors
    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
    };



    const delayPara = (index, nextWord) => {
        setTimeout(() => {
            setResultData(prev => prev + nextWord);

        }, 75 * index);

    }
    // new chat
    const newChat = () => {
        setLoading(false);
        setShowResult(false);

    }

    const onSent = async (prompt) => {

        setResultData("")
        setLoading(true)
        setShowResult(true)

        let response;
        if (prompt !== undefined) {
            response = await run(prompt);
            setRecentPrompt(prompt);
        }
        else {
            setPrevPrompts(prev => [...prev, input])
            setRecentPrompt(input)
            response = await run(input);
        }

        let responseArray = response.split("**");
        let newResponse = "";
        for (let i = 0; i < responseArray.length; i++) {
            if (i == 0 || i % 2 !== 1) {
                newResponse += responseArray[i];
            }
            else {
                newResponse += "<b>" + responseArray[i] + "</b>";
            }
        }
        let newResponse2 = newResponse.split("*").join("</br>")
        let newResponseArray = newResponse2.split(" ");
        for (let i = 0; i < newResponseArray.length; i++) {
            const nextWord = newResponseArray[i];
            delayPara(i, nextWord + " ")

        }

        setLoading(false)
        setInput("")

        if (!input && !uploadedImage) {
            alert("Please enter text or upload an image before sending.");
            return;
        }

        // Handle message send (can integrate with backend or state management)
        const messageData = {
            text: input,
            image: uploadedImage,
        };

        // Example of logging or sending messageData
        console.log("Message sent:", messageData);

        // Clear input and image after sending
        setUploadedImage(null);
    };

    const contextValue = {
        prevPrompts,
        setPrevPrompts,
        onSent,
        setRecentPrompt,
        recentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        isListening,
        setIsListening,
        newChat,
        startListening,
        stopListening,
        setUploadedImage,
        handleGalleryClick,
        uploadedImage


    }
    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    )
}

export default ContextProvider
