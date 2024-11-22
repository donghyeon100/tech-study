import React, { useState, useEffect, useContext } from 'react';
import './ProblemSolver.css';
import axios from 'axios';
import { CommonContext } from '../App';

const ProblemSolver = (props) => {
  const { baseUrl } = useContext(CommonContext);  // 공통 컨텍스트에서 baseUrl 가져오기

  const { questions, resetTrigger, onQuestionSubmit, selectedCategory } = props;  // 부모 컴포넌트로부터 props 받기
  
  // localStorage에서 저장된 상태를 불러와 초기값으로 설정
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const saved = localStorage.getItem(`currentQuestionIndex-${selectedCategory}`);
    return saved ? parseInt(saved) : 0;  // 저장된 인덱스가 있으면 사용, 없으면 0
  });
  
  const [showSolution, setShowSolution] = useState(() => {
    const saved = localStorage.getItem(`showSolution-${selectedCategory}`);
    return saved ? JSON.parse(saved) : false;  // 저장된 값이 있으면 사용, 없으면 false
  });
  
  const [inputAnswer, setInputAnswer] = useState(() => {
    const saved = localStorage.getItem(`inputAnswer-${selectedCategory}`);
    return saved || '';  // 저장된 답안이 있으면 사용, 없으면 빈 문자열
  });
  
  const [judgement, setJudgement] = useState(() => {
    const saved = localStorage.getItem(`judgement-${selectedCategory}`);
    return saved ? parseInt(saved) : 0;  // 저장된 판단이 있으면 사용, 없으면 0
  });
  
  const [explanation, setExplanation] = useState(() => {
    const saved = localStorage.getItem(`explanation-${selectedCategory}`);
    return saved || '';  // 저장된 해설이 있으면 사용, 없으면 빈 문자열
  });

  const [reason, setReason] = useState(() => {
    const saved = localStorage.getItem(`reason-${selectedCategory}`);
    return saved || '';  // 저장된 이유가 있으면 사용, 없으면 빈 문자열
  });
  
  const [loading, setLoading] = useState(false);  // 로딩 상태 관리

  // 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    localStorage.setItem(`currentQuestionIndex-${selectedCategory}`, currentQuestionIndex);
    localStorage.setItem(`showSolution-${selectedCategory}`, JSON.stringify(showSolution));
    localStorage.setItem(`inputAnswer-${selectedCategory}`, inputAnswer);
    localStorage.setItem(`judgement-${selectedCategory}`, judgement);
    localStorage.setItem(`explanation-${selectedCategory}`, explanation);
    localStorage.setItem(`reason-${selectedCategory}`, reason);
  }, [currentQuestionIndex, showSolution, inputAnswer, judgement, explanation, reason, selectedCategory]);

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

  // 상태가 변경될 때마다 onQuestionSubmit 호출
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('ct');

    if (categoryParam && judgement !== null && explanation !== '' && reason !== '') {
      onQuestionSubmit({
        question: questions[currentQuestionIndex].questionContent,
        userAnswer: inputAnswer,
        isCorrect: judgement,
        explanation: explanation,
        reason: reason
      });
    }
  }, [judgement, explanation, reason]); // 상태가 변경될 때마다 실행

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
        Q: questions[currentQuestionIndex].questionContent,  // 현재 질문의 내용
        A: inputAnswer  // 사용자가 입력한 답안
      });

      let data = result.data;
      if(typeof result.data === 'string') {
        data = result.data.replace('```json', '').replace('```', '');
        data = JSON.parse(data);  // JSON 문자열을 객체로 변환
      } else {
        data = result.data;
      }
      setJudgement(data.judgement);  // 서버로부터 받은 판단 결과 설정
      setExplanation(data.answer);  // 서버로부터 받은 해설 설정
      setReason(data.reason);  // 서버로부터 받은 이유 설정

    } catch (error) {
      console.error('Error fetching answer:', error);
    } finally {
      setLoading(false);
      
      // onQuestionSubmit({
      //   question: questions[currentQuestionIndex].questionContent,  // 현재 질문의 내용
      //   userAnswer: inputAnswer,  // 사용자가 입력한 답안
      //   isCorrect: judgement,  // 판단 결과
      //   explanation: explanation,  // 해설
      //   reason: reason  // 이유
      // });
    }
  };

  /**
   * 다음 문제 버튼 클릭 이벤트
   */
  const handleNextQuestion = () => {
    setShowSolution(false);
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % questions.length);  // 다음 문제로 이동
    setInputAnswer('');
    // 다음 문제로 넘어갈 때 이전 답안 관련 데이터 초기화
    setJudgement(0);
    setExplanation('');
    setReason('');

    // onQuestionSubmit({
    //   question: questions[currentQuestionIndex].questionContent,  // 현재 질문의 내용
    //   userAnswer: inputAnswer,  // 사용자가 입력한 답안
    //   isCorrect: judgement,  // 판단 결과
    //   explanation: explanation,  // 해설
    //   reason: reason  // 이유
    // });
  };

  return (
    <div className="problem-container">
      <div className="problem-box">
        <h2 className="problem-title">문제</h2>
        <div className="problem-content">
          {questions[currentQuestionIndex]?.questionContent || '카테고리를 선택해주세요'}  {/* 현재 질문의 내용 표시 */}
        </div>
      </div>
      
      <div className="answer-box">
        <h3 className="answer-title">답안 작성</h3>
        <textarea 
          className="answer-input"
          placeholder="답안을 입력해주세요..."
          rows={5}
          value={inputAnswer}
          onChange={(e) => setInputAnswer(e.target.value)}  // 답안 입력 시 상태 업데이트
        />
        <button 
          className="submit-button"
          onClick={handleSubmit}
          disabled={showSolution}  // 해설이 표시 중일 때 버튼 비활성화
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
              {explanation}  {/* 해설 내용 표시 */}
            </div>
          </div>
          <div className="reason-section">
            <h3 className="solution-title">판별 이유</h3>
            <div className="reason-content">{reason}  {/* 이유 내용 표시 */}</div>
          </div>
          <button 
            className="next-button"
            onClick={handleNextQuestion}  // 다음 문제로 이동
          >
            다음 문제
          </button>
        </div>
      )}
    </div>
  );
}

export default ProblemSolver;