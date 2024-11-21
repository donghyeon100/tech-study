import React, { useEffect } from 'react';
import '../css/CategorySelector.css';

/**
 * 카테고리 선택 컴포넌트
 * @param {number} selectedCategory 선택된 카테고리 번호
 * @param {function} onCategoryChange 카테고리 변경 함수
 * @returns 
 */
function CategorySelector({ selectedCategory, onCategoryChange }) {


  // 카테고리 목록 정의
  const categories = [
    { id: 1, name: 'HTML' },
    { id: 2, name: 'CSS' },
    { id: 3, name: 'JavaScript' },
    { id: 4, name: 'JAVA' },
    { id: 5, name: 'Servlet/JSP' },
    { id: 6, name: 'DB(Oracle)' },
    { id: 7, name: 'Spring' },
    { id: 8, name: 'MyBatis' },
    { id: 9, name: '개발상식' }
  ];

  // 컴포넌트 마운트 시에만 실행되도록 수정
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('ct');
    if (categoryParam && Number(categoryParam) !== selectedCategory) {
      onCategoryChange(Number(categoryParam));
    }
  }, []); // 빈 의존성 배열로 변경

  // 카테고리 변경 핸들러
  const handleCategoryChange = (categoryId) => {
    // 현재 선택된 카테고리와 같으면 변경하지 않음
    if (categoryId === selectedCategory) {
      return;
    }

    // URL 쿼리 파라미터 업데이트
    const url = new URL(window.location.href);
    if (categoryId === 0) {
      url.searchParams.delete('ct');
    } else {
      url.searchParams.set('ct', categoryId);
    }
    window.history.pushState({}, '', url);
    
    // 카테고리 상태 업데이트
    onCategoryChange(categoryId);
  };

  return (
    <div className="category-selector">
      <button 
        className={`category-button ${selectedCategory === 0 ? 'active' : ''}`}
        onClick={() => handleCategoryChange(0)}
      >
        전체
      </button>
      {categories.map(category => (
        <button
          key={category.id}
          className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
          onClick={() => handleCategoryChange(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

export default CategorySelector; 