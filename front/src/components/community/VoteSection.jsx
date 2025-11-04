import React, { useState } from "react";
import "../../styles/community.css";

function VoteSection({ voteData, onVoteChange, isEditMode = false, isLolmuncheol = false }) {
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
    // 롤문철에서는 옵션 추가 불가 (항상 2개 고정)
    if (isLolmuncheol) {
      alert("롤문철 투표는 옵션 2개로 고정됩니다.");
      return;
    }
    // 최대 옵션 개수 제한 (10개)
    if (vote.options.length >= 10) {
      alert("투표 옵션은 최대 10개까지 추가할 수 있습니다.");
      return;
    }
    const newOptions = [...vote.options, ""];
    const newVote = { ...vote, options: newOptions };
    setVote(newVote);
    onVoteChange(newVote);
  };

  const removeOption = (index) => {
    // 롤문철에서는 옵션 삭제 불가 (항상 2개 고정)
    if (isLolmuncheol || vote.options.length <= 2) return;
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
      <div className="vote-section-edit-container">
        <h3 className="vote-section-edit-title">📊 투표 설정</h3>
        
        {/* 투표 질문 */}
        <div className="vote-section-edit-form-group">
          <label className="vote-section-edit-label">
            투표 질문
          </label>
          <input
            type="text"
            value={vote.question}
            onChange={handleQuestionChange}
            placeholder="투표 질문을 입력하세요"
            className="vote-section-edit-input"
          />
        </div>

        {/* 투표 옵션들 */}
        <div className="vote-section-edit-form-group">
          <label className="vote-section-edit-label">
            투표 옵션
          </label>
          {vote.options.map((option, index) => (
            <div key={index} className="vote-section-edit-option-row">
              <span className="vote-section-edit-option-number">{index + 1}.</span>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`${index + 1}번 답변을 입력하세요`}
                className="vote-section-edit-option-input"
              />
              {!isLolmuncheol && vote.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="vote-section-edit-remove-button"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 종료 설정 */}
        <div className="vote-section-edit-form-group">
          <label className="vote-section-edit-label">
            종료 설정
          </label>
          <div className="vote-section-edit-radio-group">
            <label className="vote-section-edit-radio-label">
              <input
                type="radio"
                name="endTime"
                checked={!vote.hasEndTime}
                onChange={() => handleEndTimeToggle(false)}
                className="vote-section-edit-radio"
              />
              종료 없음
            </label>
            <label className="vote-section-edit-radio-label">
              <input
                type="radio"
                name="endTime"
                checked={vote.hasEndTime}
                onChange={() => handleEndTimeToggle(true)}
                className="vote-section-edit-radio"
              />
              종료 시간 설정
            </label>
          </div>
          {vote.hasEndTime && (
            <input
              type="datetime-local"
              value={vote.endTime}
              onChange={handleEndTimeChange}
              className="vote-section-edit-datetime-input"
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
    <div className="vote-section-container">
      <h3 className="vote-section-title">📊 투표</h3>
      
      <div className="vote-section-question-section">
        <h4 className="vote-section-question-text">{vote.question}</h4>
        
        {endTimeText && (
          <p className="vote-section-end-time">
            종료 시간: {endTimeText}
          </p>
        )}
        
        {isExpired && (
          <p className="vote-section-expired-message">
            ⏰ 투표가 종료되었습니다.
          </p>
        )}
      </div>

      <div className="vote-section-options-list">
        {vote.options.map((option, index) => (
          <div key={index} className="vote-section-option-item">
            <label className="vote-section-option-label">
              <input
                type="radio"
                name="voteOption"
                value={index}
                disabled={isExpired}
                className="vote-section-option-radio"
              />
              <span>{option}</span>
            </label>
          </div>
        ))}
      </div>

      <button
        disabled={isExpired}
        className="vote-section-submit-button"
      >
        {isExpired ? "투표 종료" : "투표하기"}
      </button>
    </div>
  );
}

export default VoteSection;
