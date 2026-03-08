import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Sparkles } from 'lucide-react';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAppContext } from '../context/AppContext';
import './ChatPage.css';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");





interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    type?: 'text' | 'human-in-loop';
}



const ChatPage = () => {
    const { knowledgeBase, saveEmail } = useAppContext();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello 👋 I’m Omkar Arali’s AI assistant. I can help you explore his professional profile, including:\n\n• Process Excellence & Industrial Engineering experience\n• Six Sigma & data-driven projects\n• Logistics & operations optimization initiatives\n• Key achievements and impact delivered\n\nFeel free to ask questions like: “What projects has Omkar led?” or “What are his core skills?”",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);

    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [questionCount, setQuestionCount] = useState(0);
    const [emailProvided, setEmailProvided] = useState(false);
    const [isHumanInLoop, setIsHumanInLoop] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);



    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const generateAIResponse = async (userText: string) => {
        const text = userText.toLowerCase();

        // Lead capture logic remains high priority
        if (!emailProvided && (text.includes('contact') || text.includes('email') || text.includes('phone') || text.includes('reach'))) {
            return {
                text: "I can provide you with Omkar's contact details! Please type your email address here so he can follow up with you directly."
            };
        }


        if (isHumanInLoop) {
            return {
                text: "I've already notified Omkar that you'd like to connect. He'll get back to you as soon as possible! In the meantime, feel free to use the WhatsApp button to send him an immediate alert."
            };
        }


        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const isPlaceholder = !apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || apiKey.includes('placeholder');

        if (isPlaceholder) {
            const found = knowledgeBase.find(entry =>
                text.includes(entry.title.toLowerCase()) ||
                text.includes(entry.category.toLowerCase())
            );
            return {
                text: found ? found.content : "I'm still using basic mode because the Gemini API key is missing. Please add your key to the .env file."
            };
        }

        try {
            const kbContext = knowledgeBase.map(e => `[${e.category}] ${e.title}: ${e.content}`).join('\n');
            const prompt = `
                You are Omkar's AI Assistant. You are professional, concise, and helpful.
                Below is Omkar's professional knowledge base (KB):
                ${kbContext}

                User asked: "${userText}"
                
                Guidelines:
                1. PRIORITIZE the provided KB for all answers.
                2. If the specific technical answer isn't in the KB but the topic is DIRECTLY related to Omkar's professional domains (Process Excellence, Six Sigma, Logistics, Industrial Engineering, RPA, Supply Chain, Optimization), you may use your internal AI knowledge to provide a professional, helpful answer as if it were part of Omkar's expertise.
                3. If the user expresses a desire to "connect", "meet", "speak with", "talk to", or "get a call from" Omkar directly, append "[INTENT:CONNECT]" at the very beginning of your response.
                4. If the question is UNRELATED to professional recruitment or Omkar's domains (e.g., sports, cooking, personal non-work questions), politely state that you are an AI assistant focusing on Omkar's professional profile.
                5. Keep answers concise (2-3 sentences).
                6. Tone: Helpful and recruiters-friendly.
            `;



            // List of models to try in order of preference
            const modelsToTry = [
                'gemini-2.5-flash',
                'gemini-2.5-flash-lite'
            ];

            let aiText = "";
            let lastError = null;

            for (const modelName of modelsToTry) {
                try {
                    const currentModel = genAI.getGenerativeModel({ model: modelName });
                    const result = await currentModel.generateContent(prompt);
                    aiText = result.response.text();
                    break;
                } catch (err: any) {
                    lastError = err;
                    continue;
                }
            }

            if (!aiText && lastError) throw lastError;

            // Handle HIL Intent
            if (aiText.includes('[INTENT:CONNECT]')) {
                const cleanText = aiText.replace('[INTENT:CONNECT]', '').trim();
                setIsHumanInLoop(true);
                return {
                    text: `${cleanText}\n\nI've prepared a way for you to connect! Please use the button below to message Omkar directly on LinkedIn. He'll be notified and can jump into the chat!`,
                    type: 'human-in-loop' as const
                };
            }



            // Smart Lead Capture logic: trigger on the 3rd question if email not provided

            if (questionCount >= 2 && !emailProvided) {
                return {
                    text: `${aiText}\n\nI hope that was helpful! I'd love to share Omkar’s full resume and contact details with you. Please share your email address here so I can send it over!`
                };
            }


            return { text: aiText };

        } catch (error: any) {

            console.error("Gemini Final Error:", error);
            if (error?.message?.includes('not found') || error?.message?.includes('supported')) {
                return { text: "The AI models seem to be unavailable for your API key or region. Please ensure your API key is correctly setup in Google AI Studio and that you have enabled the Gemini API." };
            }
            if (error?.message?.includes('API_KEY_INVALID')) {
                return { text: "It seems the Gemini API key is invalid. Please double-check your .env file." };
            }
            return { text: "I'm having a brief technical moment connecting to my AI brain. Omkar is an expert in Process Excellence—feel free to ask about his specific projects while I recover!" };
        }


    };



    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMessage: Message = {
            id: Math.random().toString(36).substr(2, 9),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };


        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);
        setQuestionCount(prev => prev + 1);

        // Auto-detect email in user input
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
        const matches = userMessage.text.match(emailRegex);
        if (matches && matches.length > 0) {
            console.log('Detected emails:', matches);
            matches.forEach(email => saveEmail(email));
            setEmailProvided(true);

            // Add a small confirmation message immediately or let AI handle it
            setTimeout(() => {
                const confirmMsg: Message = {
                    id: Math.random().toString(36).substr(2, 9),
                    text: "Got it! Noted down your email. Omkar's email is Omkararali25@gmail.com and you can also find him on LinkedIn: https://linkedin.com/in/omkar-arali-5402a2150",
                    sender: 'bot',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, confirmMsg]);
            }, 500);
        }


        const response = await generateAIResponse(userMessage.text);


        const botMessage: Message = {
            id: Math.random().toString(36).substr(2, 9),
            text: response.text,
            sender: 'bot',
            timestamp: new Date(),
            type: response.type
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
    };


    return (

        <div className="chat-page">
            <div className="chat-container glass glass-shadow">
                <div className="chat-header">
                    <div className="bot-info">
                        <div className="bot-avatar">
                            <Sparkles size={20} color="var(--primary)" />
                        </div>
                        <div>
                            <h3>Process Excellence Manager</h3>
                            <span className="status">Omkar's AI Assistant</span>
                        </div>
                    </div>
                </div>

                <div className="messages-list">
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`message-wrapper ${msg.sender}`}
                            >
                                <div className="message-icon">
                                    {msg.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
                                </div>
                                <div className="message-bubble glass">
                                    <p>{msg.text}</p>
                                    {msg.type === 'human-in-loop' && (
                                        <div className="hil-actions">
                                            <a
                                                href="https://linkedin.com/in/omkar-arali-5402a2150"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="linkedin-btn"
                                            >
                                                💼 Message Omkar on LinkedIn
                                            </a>
                                        </div>
                                    )}

                                    <span className="timestamp">

                                        {msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="message-wrapper bot"
                            >
                                <div className="message-bubble typing glass">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-area">

                    <input
                        type="text"
                        placeholder={isHumanInLoop ? "Waiting for Omkar..." : "Ask me something about Omkar..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        className="btn-primary"
                        onClick={handleSend}
                        disabled={!input.trim()}
                    >

                        <Send size={18} />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ChatPage;
