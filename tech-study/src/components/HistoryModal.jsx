import React from 'react';

function HistoryModal({ item, onClose }) {
  if (!item) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{item.question}</h3>
        <div className="modal-body">
          <hr />
          <div>
            <h4>제출한 답안</h4>
            <p className="modal-answer">{item.userAnswer}</p>
          </div>
          <hr />
          <div>
            <h4>결과</h4>
            <p className="modal-result">
              결과: <span className={item.isCorrect === 0 ? 'answer-correct' : item.isCorrect === 1 ? 'answer-need-to-improve' : 'answer-incorrect'}>
              {item.isCorrect === 0 ? '정답' : item.isCorrect === 1 ? '보충 필요' : '오답'}
              </span>
            </p>
          </div>
          <hr />
          <div>
            <h4>해설</h4>
            <p className="modal-explanation">{item.explanation}</p>
          </div>
          <hr />
          <div>
            <h4>이유</h4>
            <p className="modal-reason">{item.reason}</p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="modal-close" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  );
}

export default HistoryModal; 