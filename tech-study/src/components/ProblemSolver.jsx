import React, { useState, useEffect, useContext } from 'react';
import './ProblemSolver.css';
import axios from 'axios';
import { CommonContext } from '../App';

const ProblemSolver = (props) => {
  const { baseUrl } = useContext(CommonContext);  

  const { questions, resetTrigger, onQuestionSubmit } = props;
  
  // localStorage에서 저장된 상태를 불러와 초기값으로 설정
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const saved = localStorage.getItem('currentQuestionIndex');
    return saved ? parseInt(saved) : 0;
  });
  
  const [showSolution, setShowSolution] = useState(() => {
    const saved = localStorage.getItem('showSolution');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [inputAnswer, setInputAnswer] = useState(() => {
    const saved = localStorage.getItem('inputAnswer');
    return saved || '';
  });
  
  const [judgement, setJudgement] = useState(() => {
    const saved = localStorage.getItem('judgement');
    return saved ? parseInt(saved) : 0;
  });
  
  const [explanation, setExplanation] = useState(() => {
    const saved = localStorage.getItem('explanation');
    return saved || '';
  });

  const [reason, setReason] = useState(() => {
    const saved = localStorage.getItem('reason');
    return saved || '';
  });
  
  const [loading, setLoading] = useState(false);

  // 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('currentQuestionIndex', currentQuestionIndex);
    localStorage.setItem('showSolution', JSON.stringify(showSolution));
    localStorage.setItem('inputAnswer', inputAnswer);
    localStorage.setItem('judgement', judgement);
    localStorage.setItem('explanation', explanation);
    localStorage.setItem('reason', reason);
  }, [currentQuestionIndex, showSolution, inputAnswer, judgement, explanation, reason]);

  // resetTrigger가 변경될 때마다 첫 번째 문제로 초기화
  useEffect(() => {
    if (resetTrigger > 0) {
      setCurrentQuestionIndex(0);
      setShowSolution(false);
      setInputAnswer('');
      setJudgement(0);
      setExplanation('');
      setReason('');
    }
  }, [resetTrigger]);

  /**
   * 답안 제출 버튼 클릭 이벤트
   */
  const handleSubmit = async () => {
    if(inputAnswer.trim() === '') {
      alert('답안을 입력해주세요.');
      return;
    }

    setShowSolution(true);
    setLoading(true);

    try {
      const result = await axios.post(`${baseUrl}/answer`, {
        Q: questions[currentQuestionIndex].questionContent,
        A: inputAnswer
      });

      let data = result.data;
      if(typeof result.data === 'string') {
        data = result.data.replace('```json', '').replace('```', '');
        data = JSON.parse(data);
      }else{
        data = result.data;
      }
      setJudgement(data.judgement);
      setExplanation(data.answer);
      setReason(data.reason);

    } catch (error) {
      console.error('Error fetching answer:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 다음 문제 버튼 클릭 이벤트
   */
  const handleNextQuestion = () => {
    setShowSolution(false);
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % questions.length);
    setInputAnswer('');
    // 다음 문제로 넘어갈 때 이전 답안 관련 데이터 초기화
    setJudgement(0);
    setExplanation('');
    setReason('');

    onQuestionSubmit({
      question: questions[currentQuestionIndex].questionContent,
      userAnswer: inputAnswer,
      isCorrect: judgement,
      explanation: explanation,
      reason: reason
    });
  };

  return (
    <div className="problem-container">
      <div className="problem-box">
        <h2 className="problem-title">문제</h2>
        <div className="problem-content">
          {questions[currentQuestionIndex]?.questionContent || '문제가 없습니다.'}
        </div>
      </div>
      
      <div className="answer-box">
        <h3 className="answer-title">답안 작성</h3>
        <textarea 
          className="answer-input"
          placeholder="답안을 입력해주세요..."
          rows={5}
          value={inputAnswer}
          onChange={(e) => setInputAnswer(e.target.value)}
        />
        <button 
          className="submit-button"
          onClick={handleSubmit}
          disabled={showSolution}
        >
          답안 제출
        </button>
      </div>

      {showSolution && (
        <div className={`solution-box ${loading ? 'loading' : ''}`}>
          {loading && <div className="loading-spinner"></div>}
          <div className="accuracy-section">
            <h3 className="solution-title">
              정답여부 : 
                <span  className={`judgement-result ${judgement === 0 ? 'answer-correct' : judgement === 1 ? 'answer-need-to-improve' : 'answer-incorrect'}`}>{judgement === 0 ? '정답' : judgement === 1 ? '보충 필요' : '오답'}</span>
            </h3>
          </div>
          <div className="explanation-section">
            <h3 className="solution-title">문제 해설</h3>
            <div className="solution-content">
              {explanation}
            </div>
          </div>
          <div className="reason-section">
            <h3 className="solution-title">판별 이유</h3>
            <div className="reason-content">{reason}</div>
          </div>
          <button 
            className="next-button"
            onClick={handleNextQuestion}
          >
            다음 문제
          </button>
        </div>
      )}
    </div>
  );
}

export default ProblemSolver; 