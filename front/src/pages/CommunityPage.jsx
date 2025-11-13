import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import BoardPage from "../components/community/BoardPage";
import PostDetailPage from "../components/community/PostDetailPage";
import WritePost from "../components/community/WritePost";
import Login from "../components/community/Login";
import Register from "../components/community/Register";
import AdminPage from "../components/community/AdminPage";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "../styles/community.css";

function initializeAdminAccount() {
  const usersJson = localStorage.getItem("users");
  const users = usersJson ? JSON.parse(usersJson) : [];
  const adminExists = users.some((u) => u.username === "admin1");
  if (!adminExists) {
    users.push({ username: "admin1", password: "1234" });
    localStorage.setItem("users", JSON.stringify(users));
  }
}

function CommunityPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() =>
    localStorage.getItem("currentUser")
  );
  const [showRegister, setShowRegister] = useState(false);
  const adminId = "admin1";
  
  // 검색 및 필터 상태
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchBy, setSearchBy] = useState("all");
  const [sortFilter, setSortFilter] = useState("latest"); // latest, popular, top
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [previousPath, setPreviousPath] = useState(""); // 이전 경로 추적

  useEffect(() => {
    initializeAdminAccount();
    const stored = localStorage.getItem("currentUser");
    if (stored) setCurrentUser(stored);
  }, []);

  // 경로 변경 시 카테고리 및 검색어 초기화
  useEffect(() => {
    const path = location.pathname;
    const boardPaths = ['/community', '/community/free', '/community/guide', '/community/lolmuncheol', '/community/highrecommend'];
    const nonBoardPaths = ['/community/login', '/community/register', '/community/admin', '/community/write', '/community/post/'];
    
    // 게시판 목록 페이지로 이동하는 경우
    if (boardPaths.includes(path)) {
      // 경로에 따라 카테고리 설정
      if (path === '/community/free') {
        setSelectedCategory('free');
      } else if (path === '/community/guide') {
        setSelectedCategory('guide');
      } else if (path === '/community/lolmuncheol') {
        setSelectedCategory('lolmuncheol');
      } else if (path === '/community/highrecommend') {
        setSelectedCategory('all'); // 추천글은 카테고리 선택과 무관
      } else if (path === '/community') {
        setSelectedCategory('all');
      }
      
      // Header 탭 클릭으로 인한 이동인지 확인
      const shouldClearSearch = sessionStorage.getItem('clearSearchOnNavigate') === 'true';
      
      // 게시판 목록이 아닌 다른 페이지에서 돌아온 경우
      const cameFromNonBoardPage = previousPath && 
        (nonBoardPaths.some(nonBoardPath => previousPath.startsWith(nonBoardPath)) || 
         !boardPaths.includes(previousPath));
      
      // 다른 게시판 탭으로 이동한 경우
      const switchedBoardTab = previousPath && previousPath !== path && boardPaths.includes(previousPath);
      
      // 검색어 초기화 조건:
      // 1. Header 탭 클릭
      // 2. 다른 페이지에서 돌아옴
      // 3. 다른 게시판 탭으로 이동
      if (shouldClearSearch || cameFromNonBoardPage || switchedBoardTab) {
        setSearchKeyword("");
        setSearchBy("all");
        sessionStorage.removeItem('clearSearchOnNavigate'); // 플래그 제거
        
        // 검색 초기화 이벤트 전달 (일반 목록 불러오기)
        const event = new CustomEvent('communitySearch', { 
          detail: { keyword: "", searchBy: "all", sortFilter: sortFilter } 
        });
        window.dispatchEvent(event);
      }
    } else {
      // 게시판 목록이 아닌 페이지로 이동할 때 플래그 제거 (검색 유지를 위해)
      sessionStorage.removeItem('clearSearchOnNavigate');
    }
    
    // 현재 경로를 이전 경로로 저장
    setPreviousPath(path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // sortFilter를 의존성에서 제거하여 경로 변경만 감지

  const handleLogin = (username) => setCurrentUser(username);
  const toggleRegister = () => setShowRegister((prev) => !prev);

  const handleForceLogout = (username) => {
    if (username === currentUser) {
      alert("본인이 강제 탈퇴 당했습니다. 로그아웃 처리 됩니다.");
      localStorage.removeItem("currentUser");
      setCurrentUser(null);
    }
  };

  // 게시판 목록 페이지인지 확인
  const isBoardPage = () => {
    const path = location.pathname;
    return path === '/community' || 
           path === '/community/free' || 
           path === '/community/guide' || 
           path === '/community/lolmuncheol' || 
           path === '/community/highrecommend';
  };

  // 검색 핸들러
  const handleSearch = () => {
    // BoardPage에서 검색 처리하도록 커스텀 이벤트 전달
    const event = new CustomEvent('communitySearch', { 
      detail: { keyword: searchKeyword, searchBy, sortFilter } 
    });
    window.dispatchEvent(event);
  };

  // 필터 변경 핸들러
  const handleFilterChange = (filter) => {
    // TOP 버튼을 다시 클릭하면 정렬 방향 토글
    if (filter === 'top' && sortFilter === 'top') {
      filter = 'top-desc'; // 내림차순 → 오름차순
    } else if (filter === 'top' && sortFilter === 'top-desc') {
      filter = 'top'; // 오름차순 → 내림차순
    }
    
    // 필터 변경 시 검색어 초기화하고 일반 목록 불러오기
    setSearchKeyword("");
    setSearchBy("all");
    setSortFilter(filter);
    
    // BoardPage에서 검색 없이 정렬만 적용하도록 커스텀 이벤트 전달
    const event = new CustomEvent('communitySearch', { 
      detail: { keyword: "", searchBy: "all", sortFilter: filter } 
    });
    window.dispatchEvent(event);
  };

  // 카테고리 변경 핸들러
  const handleCategoryChange = (category) => {
    // 카테고리 변경 시 검색어 초기화
    setSearchKeyword("");
    setSearchBy("all");
    setSelectedCategory(category);
    
    if (category === 'all') {
      navigate('/community');
    } else if (category === 'free') {
      navigate('/community/free');
    } else if (category === 'guide') {
      navigate('/community/guide');
    } else if (category === 'lolmuncheol') {
      navigate('/community/lolmuncheol');
    }
    
    // 검색 초기화 이벤트 전달 (경로 변경 useEffect에서도 처리되지만 명시적으로 처리)
    setTimeout(() => {
      const event = new CustomEvent('communitySearch', { 
        detail: { keyword: "", searchBy: "all", sortFilter: sortFilter } 
      });
      window.dispatchEvent(event);
    }, 100);
  };

  // 현재 경로에 따라 렌더링할 컴포넌트 결정
  const renderContent = () => {
    const path = location.pathname;
    
    if (path === '/community/login') {
      return showRegister ? (
        <Register onRegister={toggleRegister} />
      ) : (
        <Login onLogin={handleLogin} onShowRegister={toggleRegister} />
      );
    }
    
    if (path === '/community/register') {
      return <Register onRegister={() => setShowRegister(false)} />;
    }
    
    if (path === '/community/admin') {
      return <AdminPage currentUser={currentUser} onForceLogout={handleForceLogout} />;
    }
    
    if (path === '/community/write') {
      return <WritePost currentUser={currentUser} />;
    }
    
    if (path.startsWith('/community/post/')) {
      const id = path.split('/')[3];
      return <PostDetailPage currentUser={currentUser} adminId={adminId} postId={id} />;
    }
    
    // 게시판 목록
    return renderBoardPage();
  };

  // 게시판 목록
  const renderBoardPage = () => {
    let category = "all";
    const path = location.pathname;
    if (path === '/community') {
      category = selectedCategory;
    } else if (path === '/community/free') {
      category = "free";
    } else if (path === '/community/guide') {
      category = "guide";
    } else if (path === '/community/lolmuncheol') {
      category = "lolmuncheol";
    } else if (path === '/community/highrecommend') {
      category = "highrecommend";
    }
    
    return <BoardPage 
      category={category} 
      searchKeyword={searchKeyword}
      searchBy={searchBy}
      sortFilter={sortFilter}
    />;
  };

  return (
    <>
      <Header />
      <hr className="community-page-hr" />
      
      {isBoardPage() && (
        <div className="community-top-navigation">
          <div className="community-nav-left">
            <select 
              className="community-category-select"
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="all">전체</option>
              <option value="free">자유</option>
              <option value="guide">공략</option>
              <option value="lolmuncheol">롤문철</option>
            </select>
            
            <div className="community-filter-tabs">
              <button 
                className={`community-filter-tab ${sortFilter === 'latest' ? 'active' : ''}`}
                onClick={() => handleFilterChange('latest')}
              >
                최신
              </button>
              <button 
                className={`community-filter-tab ${sortFilter === 'popular' ? 'active' : ''}`}
                onClick={() => handleFilterChange('popular')}
              >
                <span>인기</span>
                <span className="filter-icon">🔥</span>
              </button>
              <button 
                className={`community-filter-tab ${sortFilter === 'top' || sortFilter === 'top-desc' ? 'active' : ''}`}
                onClick={() => handleFilterChange('top')}
              >
                TOP
                <span className="filter-icon">{sortFilter === 'top-desc' ? '▼' : '▲'}</span>
              </button>
            </div>
          </div>
          
          <div className="community-nav-center">
            <select 
              className="community-search-select"
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value)}
            >
              <option value="all">제목+내용</option>
              <option value="title">제목</option>
              <option value="content">내용</option>
              <option value="writer">작성자</option>
            </select>
            <div className="community-search-wrapper">
              <input
                type="text"
                className="community-search-input"
                placeholder="검색"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="community-search-button" onClick={handleSearch}>
                🔍
              </button>
            </div>
          </div>
          
          <div className="community-nav-right">
            {currentUser ? (
              <Link to="/community/write" className="community-write-button">
                ✏️
              </Link>
            ) : (
              <button 
                className="community-write-button" 
                disabled 
                title="로그인 후 이용 가능"
              >
                ✏️
              </button>
            )}
          </div>
        </div>
      )}

      <div className="community-page-content">
        {renderContent()}
      </div>
      <Footer />
    </>
  );
}

export default CommunityPage;


