import React, { useState } from "react";

function VoteSection({ voteData, onVoteChange, isEditMode = false }) {
  const [vote, setVote] = useState(voteData || {
    question: "",
    options: ["", ""],
    description: "",
    endTime: null,
    hasEndTime: false
  });

  const handleQuestionChange = (e) => {
    const newVote = { ...vote, question: e.target.value };
    setVote(newVote);
    onVoteChange(newVote);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...vote.options];
    newOptions[index] = value;
    const newVote = { ...vote, options: newOptions };
    setVote(newVote);
    onVoteChange(newVote);
  };

  const addOption = () => {
    const newOptions = [...vote.options, ""];
    const newVote = { ...vote, options: newOptions };
    setVote(newVote);
    onVoteChange(newVote);
  };

  const removeOption = (index) => {
    if (vote.options.length <= 2) return;
    const newOptions = vote.options.filter((_, i) => i !== index);
    const newVote = { ...vote, options: newOptions };
    setVote(newVote);
    onVoteChange(newVote);
  };

  const handleDescriptionChange = (e) => {
    const newVote = { ...vote, description: e.target.value };
    setVote(newVote);
    onVoteChange(newVote);
  };

  const handleEndTimeToggle = (hasEndTime) => {
    const newVote = { ...vote, hasEndTime, endTime: hasEndTime ? new Date().toISOString().slice(0, 16) : null };
    setVote(newVote);
    onVoteChange(newVote);
  };

  const handleEndTimeChange = (e) => {
    const newVote = { ...vote, endTime: e.target.value };
    setVote(newVote);
    onVoteChange(newVote);
  };

  if (isEditMode) {
    return (
      <div style={{ 
        border: "1px solid #ddd", 
        borderRadius: 8, 
        padding: 20, 
        marginBottom: 20,
        backgroundColor: "#f9f9f9"
      }}>
        <h3 style={{ marginBottom: 15, color: "#333" }}>📊 투표 설정</h3>
        
        {/* 투표 질문 */}
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
            투표 질문
          </label>
          <input
            type="text"
            value={vote.question}
            onChange={handleQuestionChange}
            placeholder="투표 질문을 입력하세요"
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 4
            }}
          />
        </div>

        {/* 투표 옵션들 */}
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 10, fontWeight: "bold" }}>
            투표 옵션
          </label>
          {vote.options.map((option, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
              <span style={{ marginRight: 10, minWidth: 20 }}>{index + 1}.</span>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`${index + 1}번 답변을 입력하세요`}
                style={{
                  flex: 1,
                  padding: 8,
                  border: "1px solid #ddd",
                  borderRadius: 4,
                  marginRight: 8,
                  wordWrap: "break-word",
                  wordBreak: "break-word",
                  maxWidth: "100%"
                }}
              />
              {vote.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  삭제
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            style={{
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              marginTop: 8
            }}
          >
            + 답변 추가
          </button>
        </div>

        {/* 추가 설명 */}
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}>
            추가 설명
          </label>
          <textarea
            value={vote.description}
            onChange={handleDescriptionChange}
            placeholder="투표에 대한 세부 설명을 입력하세요"
            rows={3}
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 4,
              resize: "vertical"
            }}
          />
        </div>

        {/* 종료 설정 */}
        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 10, fontWeight: "bold" }}>
            종료 설정
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="radio"
                name="endTime"
                checked={!vote.hasEndTime}
                onChange={() => handleEndTimeToggle(false)}
                style={{ marginRight: 8 }}
              />
              종료 없음
            </label>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="radio"
                name="endTime"
                checked={vote.hasEndTime}
                onChange={() => handleEndTimeToggle(true)}
                style={{ marginRight: 8 }}
              />
              종료 시간 설정
            </label>
          </div>
          {vote.hasEndTime && (
            <input
              type="datetime-local"
              value={vote.endTime}
              onChange={handleEndTimeChange}
              style={{
                marginTop: 10,
                padding: 8,
                border: "1px solid #ddd",
                borderRadius: 4
              }}
            />
          )}
        </div>
      </div>
    );
  }

  // 투표 표시 모드 (읽기 전용)
  if (!vote.question) return null;

  const isExpired = vote.hasEndTime && vote.endTime && new Date() > new Date(vote.endTime);
  const endTimeText = vote.hasEndTime && vote.endTime 
    ? new Date(vote.endTime).toLocaleString() 
    : null;

  return (
    <div style={{ 
      border: "1px solid #ddd", 
      borderRadius: 8, 
      padding: 20, 
      marginBottom: 20,
      backgroundColor: "#f9f9f9"
    }}>
      <h3 style={{ marginBottom: 15, color: "#333" }}>📊 투표</h3>
      
      <div style={{ marginBottom: 15 }}>
        <h4 style={{ marginBottom: 10 }}>{vote.question}</h4>
        {vote.description && (
          <p style={{ color: "#666", marginBottom: 15 }}>{vote.description}</p>
        )}
        
        {endTimeText && (
          <p style={{ color: "#666", fontSize: "0.9em", marginBottom: 15 }}>
            종료 시간: {endTimeText}
          </p>
        )}
        
        {isExpired && (
          <p style={{ color: "#dc3545", fontWeight: "bold", marginBottom: 15 }}>
            ⏰ 투표가 종료되었습니다.
          </p>
        )}
      </div>

      <div style={{ marginBottom: 15 }}>
        {vote.options.map((option, index) => (
          <div key={index} style={{ marginBottom: 8 }}>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input
                type="radio"
                name="voteOption"
                value={index}
                disabled={isExpired}
                style={{ marginRight: 10 }}
              />
              <span>{option}</span>
            </label>
          </div>
        ))}
      </div>

      <button
        disabled={isExpired}
        style={{
          padding: "10px 20px",
          backgroundColor: isExpired ? "#6c757d" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: 4,
          cursor: isExpired ? "not-allowed" : "pointer"
        }}
      >
        {isExpired ? "투표 종료" : "투표하기"}
      </button>
    </div>
  );
}

export default VoteSection;
