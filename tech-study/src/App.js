import React, { useState, useEffect, createContext } from 'react';
import axios from 'axios';
import './App.css';
import ProblemSolver from './components/ProblemSolver';
import HistoryList from './components/HistoryList';
import HistoryModal from './components/HistoryModal';
import CategorySelector from './components/CategorySelector';

// const baseUrl = 'http://khj-1.xyz:8080';
const baseUrl = 'http://localhost:8080';  // API 요청을 위한 기본 URL

// 공통 컨텍스트 생성
export const CommonContext = createContext();

function App() {
  const [questions, setQuestions] = useState([]);  // 질문 목록 상태
  const [loading, setLoading] = useState(false);  // 로딩 상태
  const [resetTrigger, setResetTrigger] = useState(0);  // 초기화 트리거
  
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);  // 선택된 히스토리 항목
  const [selectedCategory, setSelectedCategory] = useState( () => {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const typeNo = urlSearchParams.get('ct');
      return typeNo ? parseInt(typeNo) : 0;
    }
  ); // 0은 전체 카테고리

  // 로컬스토리지에서 히스토리 불러오기
  // const [history, setHistory] = useState([]);  
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem(`questionHistory-${selectedCategory}`);
    return savedHistory ? JSON.parse(savedHistory) : [];  
  });  


  //  히스토리 변경 시 로컬스토리지에 저장
  useEffect(() => {
    localStorage.setItem(`questionHistory-${selectedCategory}`, JSON.stringify(history)); 
  }, [history, selectedCategory]);


  // 서버에서 질문 목록 가져오는 함수
  const fetchQuestions = async (typeNo) => {


    // // 전체 카테고리 선택 시
    // if(typeNo === 0){
      
    //   // 로컬스토리지에 저장된 문제 모두 얻어와 하나의 배열로 만들기
    //   let allQuestions = [];
    //   for(let i = 1; i <= 9; i++){
    //     const savedQuestions = JSON.parse(localStorage.getItem(`questions-${i}`));
    //     if(savedQuestions){
    //       allQuestions = [...allQuestions, ...savedQuestions];
    //     }
    //   }
    //   setQuestions(allQuestions);

    //   return;
    // }


    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/questions/${typeNo}`);  // 서버에서 질문 목록 가져오기

      // console.log(response.data);
      setQuestions(response.data);  // 질문 목록 상태 업데이트

      // 서버에서 읽어온 문제를 로컬스토리지에 저장
      localStorage.setItem(`questions-${typeNo}`, JSON.stringify(response.data));

      // 문제를 초기화할 때 관련된 로컬스토리지 데이터도 모두 초기화
      localStorage.removeItem(`currentQuestionIndex-${typeNo}`);
      localStorage.removeItem(`showSolution-${typeNo}`);
      localStorage.removeItem(`inputAnswer-${typeNo}`);
      localStorage.removeItem(`judgement-${typeNo}`);
      localStorage.removeItem(`explanation-${typeNo}`);
      localStorage.removeItem(`reason-${typeNo}`);
      localStorage.removeItem(`questionHistory-${typeNo}`);

      // 초기화 트리거 증가
      setResetTrigger(prev => prev + 1);
      setHistory([]);  // 히스토리 초기화
      localStorage.removeItem(`questionHistory-${typeNo}`);

    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadQuestions = async () => {

      // 카테고리 미선택 시
      if(selectedCategory === 0){
        return;
      }
      const savedQuestions = JSON.parse(localStorage.getItem(`questions-${selectedCategory}`));
      // console.log(savedQuestions);
      if (savedQuestions) {
        setQuestions(savedQuestions);  // 로컬스토리지에서 질문 불러오기
        return;
      }
      await fetchQuestions(selectedCategory);  // 로컬스토리지에 없으면 서버에서 질문 가져오기
    };

    loadQuestions();
  }, [selectedCategory]);

  // useEffect(() => {
  //   console.log(questions);  // 질문 목록 상태 변경 시 콘솔에 출력
  // }, [questions]);

  const handleReset = () => {
    if (window.confirm('문제를 초기화하시겠습니까?')) {
      fetchQuestions(selectedCategory);  // 문제 초기화
      // fetchQuestions();  // 문제 초기화
    }
  };

  // 질문 제출 핸들러
  const handleQuestionSubmit = async (questionData) => {
    setHistory(prev => [...prev, questionData]);  // 제출된 질문 데이터를 히스토리에 추가
  };


  // 카테고리 변경 핸들러
  const handleCategoryChange = (typeNo) => {
    setSelectedCategory(typeNo);

    // 로컬 스토리지에 문제가 있으면 얻어오기
    const savedQuestions = JSON.parse(localStorage.getItem(`questions-${typeNo}`));

    if(savedQuestions){
      setQuestions(savedQuestions);
      // return;
    }else{
      fetchQuestions(typeNo);
    }

    // 로컬 스토리지에 히스토리가 있으면 얻어오기
    const savedHistory = localStorage.getItem(`questionHistory-${typeNo}`);
    setHistory(savedHistory ? JSON.parse(savedHistory) : []);  

    // setResetTrigger(prev => prev + 1); // 문제 초기화
  };

  return (
    <CommonContext.Provider value={{ baseUrl }}>
      <div className="App">
        <div className="tooltip">문제 안보이면 오른쪽 초기화 버튼 클릭해보세요!</div>

        <button
          className="reset-button"
          onClick={handleReset}
          disabled={loading}  // 로딩 중일 때 버튼 비활성화
        >
          {loading ? '로딩 중...' : '문제 초기화'}
        </button>
        
        {/* 카테고리 선택기 추가 */}
        <CategorySelector 
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        <div className="content-wrapper">
          <ProblemSolver
            selectedCategory={selectedCategory}
            questions={questions} 
            resetTrigger={resetTrigger}
            onQuestionSubmit={handleQuestionSubmit}
          />
          <HistoryList
            history={history}
            onItemClick={setSelectedHistoryItem}  // 히스토리 항목 클릭 시 선택된 항목 설정
          />
        </div>
        {selectedHistoryItem && (
          <HistoryModal
            item={selectedHistoryItem}
            onClose={() => setSelectedHistoryItem(null)}  // 모달 닫기 시 선택된 항목 초기화
          />
        )}
      </div>
    </CommonContext.Provider>
  );
}

export default App;
