import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import "./ChatWidget.css";
import { getSessionId } from "../../utils/session";


export default function ChatWidget() {
    const token = localStorage.getItem("token");
    type ChatMessage = {
        sender: "user" | "bot";
        text: string;
        link?: string;
    };
    const location = useLocation();
    const isDiscover = location.pathname === "/discover";
    const [heroVisible, setHeroVisible] = useState(false);
    useEffect(() => {
        const hero = document.querySelector(".hero");

        if (!hero) {
            setHeroVisible(false);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                setHeroVisible(entry.isIntersecting);
            },
            {
                threshold: 0.2
            }
        );

        observer.observe(hero);

        return () => observer.disconnect();

    }, []);

    const [isOpen, setIsOpen] = useState(false);
    const [showBubble, setShowBubble] = useState(true);
    const [bubbleLeaving, setBubbleLeaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const [showAdmin, setShowAdmin] = useState(false);
    const [adminMinimized, setAdminMinimized] = useState(false);
    const [adminAttention, setAdminAttention] = useState(false);
    const [showBuyLoading, setShowBuyLoading] = useState(false);

    function triggerAdminButton() {
        setShowAdmin(true);
        setAdminAttention(true);

        // เด้ง (attention)
        setTimeout(() => {
            setAdminAttention(false);
        }, 2000);

        // ย่อเป็นไอคอน
        setTimeout(() => {
            setAdminMinimized(true);
        }, 8000);
    }

    function hideBubble() {

        setBubbleLeaving(true);

        setTimeout(() => {

            setShowBubble(false);

        }, 350); // เท่ากับ animation

    }

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([

        {

            sender: "bot",

            text:
                "สวัสดีจ้า มีอะไรให้ลุงช่วยไหมจ๊ะ 😊"

        }

    ]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    };


    useEffect(() => {

        const timer = setTimeout(() => {
            hideBubble();
        }, 5000);


        return () => clearTimeout(timer);

    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth"
            });
        }, 50);

        return () => clearTimeout(timer);
    }, [messages, loading]);

    const handleContactAdmin = async () => {

        try {

            const response = await fetch(
                "http://localhost:3000/contact-admin",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token ?? ""}`
                    },
                    body: JSON.stringify({

                        guestId: getSessionId()

                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.log(response);

                alert("ส่งข้อมูลไม่สำเร็จ");

                return;

            }

            // แสดงข้อความในแชท
            setMessages(prev => [

                ...prev,

                {
                    sender: "bot",

                    text:
                        `ลุงส่งเรื่องให้ทีมงานแล้ว 😊\n\n` +
                        `รหัสอ้างอิง : ${data.reference}\n\n` +
                        `กรุณาส่งรหัสนี้ให้ทีมงานใน LINE`
                }

            ]);

            // เปิด LINE OA
            window.open(data.line, "_blank");

        } catch (err) {

            console.error(err);

            alert("เกิดข้อผิดพลาด");

        }

    };

    async function sendMessage() {

        if (!message.trim()) return;

        const userText = message;

        // 1. add user message
        setMessages(prev => [
            ...prev,
            {
                sender: "user",
                text: userText
            }
        ]);

        setMessage("");
        setLoading(true);

        try {

            console.log(localStorage.getItem("token"));
            const res = await fetch("http://localhost:3000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                     Authorization: `Bearer ${token ?? ""}`
                },
                body: JSON.stringify({
                    guestId: getSessionId(),
                    message: userText
                })
            });

            const data = await res.json();
            if (data.showAdmin) { triggerAdminButton(); }

            // 2. add bot response
            setMessages(prev => [
                ...prev,
                {
                    sender: "bot",
                    text: data.answer,
                    link: data.link
                }
            ]);

            // 3. handle link 
            if (data.link) {
                setShowBuyLoading(true);

                setTimeout(() => {
                    setShowBuyLoading(false);
                    window.open(data.link, "_blank");
                }, 3000);
            }

        } catch (err) {

            setMessages(prev => [
                ...prev,
                {
                    sender: "bot",
                    text: "ลุงยุ่งนิดหน่อย ลองถามใหม่อีกทีนะหลานๆ"
                }
            ]);

        } finally {
            setLoading(false);
        }
    }
    return (
        <>

            {/* Bubble */}
            {showBubble && (
                <div
                    className={`auto-message
            ${bubbleLeaving ? "hide" : "show"}
            ${heroVisible ? "auto-message--hero" : ""}
        `}
                >
                    สวัสดีจ้า มีอะไรให้ลุงช่วยไหมจ๊ะ 😊
                </div>
            )}

            {/* Contact Admin */}

            {/* {showAdmin && (
                <a
                    href="https://www.facebook.com/LearnDoClub/"
                    className={`admin-btn 
            ${adminAttention ? "attention" : ""} 
            ${adminMinimized ? "small" : ""}
        `}
                    target="_blank"
                    rel="noreferrer"
                >
                    {adminMinimized ? "💬" : "💬 ติดต่อทีมงาน"}
                </a>
            )} */}

            {showAdmin && (
                <button
                    className={`admin-btn 
            ${adminAttention ? "attention" : ""} 
            ${adminMinimized ? "small" : ""}
        `}
                    rel="noreferrer"
                    onClick={handleContactAdmin}
                >
                    {adminMinimized ? "💬" : "💬 ติดต่อทีมงาน"}
                </button>
            )}

            {/* Floating Button */}

            <button
                className={`chat-btn ${heroVisible ? "chat-btn--hero" : ""
                    }`}
                onClick={() => {

                    setIsOpen(!isOpen);

                    // setShowBubble(false);
                    hideBubble();

                }}
            >

                <img
                    src={
                        heroVisible
                            ? "../../../img/uncle.png"
                            : "../../../img/uncleMini.png"
                    }
                    alt="chat"
                />

            </button>

            {/* Chat Box */}

            <div
                className={`chat-box ${isOpen ? "" : "hidden"}`}
            >

                <div className="chat-header">

                    <span>

                        ลุงพาเที่ยว

                    </span>

                    <button
                        className="close-chat"
                        onClick={() => setIsOpen(false)}
                    >
                        ✕
                    </button>

                </div>

                <div className="messages">

                    {/* {messages.map((msg, index) => (

                        <div

                            key={index}

                            className={
                                msg.sender === "user"
                                    ? "user-message"
                                    : "bot-message"
                            }

                        >

                            {msg.text}

                        </div>


                    ))} */}
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={
                                msg.sender === "user"
                                    ? "user-message"
                                    : "bot-message"
                            }
                        >
                            <div>{msg.text}</div>

                            {msg.link && (
                                <a
                                    href={msg.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="buy-link"
                                >
                                    🛒 ไปยังหน้าสินค้า
                                </a>
                            )}
                        </div>
                    ))}


                    {loading && (
                        <div className="bot-message typing">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                        </div>
                    )}


                    {/* บังคับ scroll */}
                    <div ref={messagesEndRef} />

                </div>

                <div className="chat-input">

                    <input

                        value={message}

                        placeholder="พิมพ์ข้อความ..."

                        onChange={(e) =>
                            setMessage(e.target.value)
                        }

                        onKeyDown={(e) => {

                            if (e.key === "Enter") {

                                sendMessage();

                            }

                        }}

                    />

                    <button
                        onClick={sendMessage}
                    >

                        ส่ง

                    </button>
                </div>

            </div>


            {showBuyLoading && (
                <div className="buy-overlay">
                    <div className="buy-box">
                        <div className="spinner"></div>
                        <div>ลุงกำลังพาหลานไปนะ...</div>
                    </div>
                </div>
            )}

        </>

    );

}