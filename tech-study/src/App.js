import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import ProblemSolver from './components/ProblemSolver';
import HistoryList from './components/HistoryList';
import HistoryModal from './components/HistoryModal';

// const API_URL = 'http://khj-1.xyz:8080';
const API_URL = 'http://localhost:8080';

function App() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem('questionHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);

  useEffect(() => {
    localStorage.setItem('questionHistory', JSON.stringify(history));
  }, [history]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/questions`);

      console.log(response.data)
      setQuestions( response.data );
      
      // 서버에서 읽어온 문제를 로컬스토리지에 저장
      localStorage.setItem('questions', JSON.stringify(response.data));
      
      // 문제를 초기화할 때 관련된 로컬스토리지 데이터도 모두 초기화
      localStorage.removeItem('currentQuestionIndex');
      localStorage.removeItem('showSolution');
      localStorage.removeItem('inputAnswer');
      localStorage.removeItem('judgement');
      localStorage.removeItem('explanation');
      localStorage.removeItem('reason');
      localStorage.removeItem('questionHistory');
      
      // 초기화 트리거 증가
      setResetTrigger(prev => prev + 1);
      setHistory([]);  // 히스토리 초기화
    localStorage.removeItem('questionHistory');  

    } catch(error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadQuestions = async () => {
      const savedQuestions = JSON.parse(localStorage.getItem('questions'));
      if (savedQuestions) {
        setQuestions(savedQuestions);
        return;
      }
      await fetchQuestions();
    };

    loadQuestions();
  }, []);

  useEffect(() => {
    console.log(questions);
  }, [questions]);

  const handleReset = () => {
    if(window.confirm('문제를 초기화하시겠습니까?')) {
      fetchQuestions();
    }
  };

  const handleQuestionSubmit = (questionData) => {
    setHistory(prev => [...prev, questionData]);
  };

  return (
    <div className="App">
      <button 
        className="reset-button"
        onClick={handleReset}
        disabled={loading}
      >
        {loading ? '로딩 중...' : '문제 초기화'}
      </button>
      <div className="content-wrapper">
        <ProblemSolver 
          questions={questions} 
          resetTrigger={resetTrigger}
          onQuestionSubmit={handleQuestionSubmit}
        />
        <HistoryList 
          history={history}
          onItemClick={setSelectedHistoryItem}
        />
      </div>
      {selectedHistoryItem && (
        <HistoryModal
          item={selectedHistoryItem}
          onClose={() => setSelectedHistoryItem(null)}
        />
      )}
    </div>
  );
}

export default App;
