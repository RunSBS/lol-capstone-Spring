// 파일명: CompanyChatbot.jsx
import React, { useState, useRef, useEffect } from "react";
import { FaComments, FaRobot, FaUser, FaPaperPlane, FaTimes } from "react-icons/fa";


const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const chatLogRef = useRef(null);

    // 스크롤 항상 최신 메시지로 이동
    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages]);

    const appendMessage = (text, role) => {
        setMessages(prev => [...prev, { text, role }]);
    };

    const sendMessage = async () => {
        const msg = input.trim();
        if (!msg) return;

        appendMessage("사용자: " + msg, "user");
        setInput("");

        try {
            const resp = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: msg }),
            });
            const data = await resp.json();

            if (!resp.ok) {
                appendMessage("봇 오류: " + (data.error || "알 수 없는 오류가 발생했다"), "bot");
                return;
            }
            appendMessage("봇: " + data.answer, "bot");
        } catch {
            appendMessage("봇 오류: 서버에 연결할 수 없다", "bot");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") sendMessage();
    };

    return (
        <>
            {/* 플로팅 버튼 */}
            <div
                className="chat-fab"
                title="업무 Q&A 챗봇 열기"
                onClick={() => setIsOpen(prev => !prev)}
                style={{
                    position: "fixed",
                    right: 24,
                    bottom: 24,
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    backgroundColor: "#0056b3",
                    color: "#fff",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                    cursor: "pointer",
                    zIndex: 1000,
                }}
            >
                <FaComments size={28} />
            </div>

            {/* 챗봇 위젯 */}
            {isOpen && (
                <div
                    className="chat-widget"
                    style={{
                        position: "fixed",
                        right: 24,
                        bottom: 100,
                        width: 340,
                        maxHeight: 480,
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 12,
                        overflow: "hidden",
                        boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
                        backgroundColor: "#fff",
                        zIndex: 999,
                    }}
                >
                    {/* 헤더 */}
                    <div
                        className="chat-widget-header"
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 12px",
                            background: "linear-gradient(120deg, #0056b3, #3388ff)",
                            color: "#fff",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div
                                className="chat-widget-avatar"
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <FaRobot />
                            </div>
                            <div>
                                <div style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                                    회사 업무 Q&A 챗봇
                                </div>
                                <div style={{ fontSize: "0.7rem", opacity: 0.9 }}>
                                    인사·총무·IT 등 사내 업무 문의를 안내한다
                                </div>
                            </div>
                        </div>
                        <div
                            className="chat-widget-close"
                            style={{ cursor: "pointer" }}
                            onClick={() => setIsOpen(false)}
                        >
                            <FaXmark size={18} />
                        </div>
                    </div>

                    {/* 채팅 로그 */}
                    <div
                        id="chat-log"
                        ref={chatLogRef}
                        style={{
                            padding: 10,
                            height: 320,
                            overflowY: "auto",
                            backgroundColor: "#f7f7fb",
                        }}
                    >
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`message ${msg.role}-message`}
                                style={{
                                    display: "flex",
                                    marginBottom: 8,
                                    flexDirection: msg.role === "user" ? "row-reverse" : "row",
                                }}
                            >
                                <div
                                    className="avatar"
                                    style={{
                                        width: 30,
                                        height: 30,
                                        borderRadius: "50%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        flexShrink: 0,
                                        fontSize: 16,
                                        backgroundColor: msg.role === "user" ? "#e6ffe6" : "#e6f0ff",
                                        color: msg.role === "user" ? "#008800" : "#004499",
                                    }}
                                >
                                    {msg.role === "user" ? <FaUser /> : <FaRobot />}
                                </div>
                                <div
                                    className="bubble"
                                    style={{
                                        maxWidth: "70%",
                                        padding: "6px 9px",
                                        borderRadius: 10,
                                        fontSize: "0.9rem",
                                        lineHeight: 1.35,
                                        marginLeft: msg.role === "user" ? 0 : 6,
                                        marginRight: msg.role === "user" ? 6 : 0,
                                        backgroundColor: msg.role === "user" ? "#e6ffe6" : "#f0f4ff",
                                        color: msg.role === "user" ? "#004400" : "#002b5c",
                                    }}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 입력 영역 */}
                    <div
                        className="chat-widget-input"
                        style={{
                            padding: 8,
                            borderTop: "1px solid #ddd",
                            backgroundColor: "#fff",
                            display: "flex",
                            gap: 6,
                        }}
                    >
                        <input
                            type="text"
                            id="message"
                            placeholder="회사 규정, 절차, 복지, IT 문의 등을 입력한다"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{ flex: 1, padding: 6, fontSize: "0.9rem" }}
                        />
                        <button
                            id="send-btn"
                            onClick={sendMessage}
                            style={{
                                padding: "6px 12px",
                                fontSize: "0.9rem",
                                cursor: "pointer",
                                border: "none",
                                borderRadius: 6,
                                backgroundColor: "#0056b3",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                            }}
                        >
                            <FaPaperPlane size={12} />
                            전송
                        </button>
                    </div>

                    <div
                        className="chat-widget-footer-text"
                        style={{ fontSize: "0.72rem", color: "#666", padding: "4px 8px 8px 8px" }}
                    >
                        이 챗봇은 회사 업무 지침이 정리된 company_docs.csv(text,intent)에 등록된 내용만
                        바탕으로 답변한다. 업무와 무관한 질문에는 “업무에 관련된 내용이 아니라 답변을 드릴 수
                        없습니다.”라고 응답한다.
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
