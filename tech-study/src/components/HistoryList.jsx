import React from 'react';

function HistoryList({ history, onItemClick }) {
  return (
    <div className="history-list">
      {history.map((item, index) => (
        <div 
          key={index} 
          className="history-item"
          onClick={() => onItemClick(item)}
        >
          <span className="history-number">{item.question}</span>
          <span className={`history-result ${item.isCorrect === 0 ? 'correct' : item.isCorrect === 1 ? 'answer-need-to-improve' : 'incorrect'}`}>
            {item.isCorrect === 0 ? '정답' : item.isCorrect === 1 ? '보충 필요' : '오답'}
          </span>
        </div>
      ))}
    </div>
  );
}

export default HistoryList; 