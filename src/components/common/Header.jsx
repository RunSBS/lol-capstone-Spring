import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { normalizeRiotIdQuery } from '../../data/normalize.js'
import AutocompleteSearch from './AutocompleteSearch.jsx'

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const isSummonerPage = location.pathname.startsWith('/summoner')

  useEffect(() => {
    const user = localStorage.getItem('currentUser')
    if (user) {
      setCurrentUser(user)
    }
    
    // 로그인 상태 변경을 감지하는 이벤트 리스너
    const handleStorageChange = () => {
      const user = localStorage.getItem('currentUser')
      setCurrentUser(user)
    }
    
    // storage 이벤트 리스너 등록 (다른 탭에서의 변경 감지)
    window.addEventListener('storage', handleStorageChange)
    
    // 커스텀 이벤트 리스너 등록 (같은 탭에서의 변경 감지)
    window.addEventListener('loginStateChanged', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('loginStateChanged', handleStorageChange)
    }
  }, [])
  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
    // 로그인 상태 변경 이벤트 발생
    window.dispatchEvent(new Event('loginStateChanged'))
  }
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="top-bar">
          <div className="top-bar-left">
            <Link to="/" className="logo">DJ.GG</Link>
            <nav className="top-bar-nav">
              <a href="#">전적</a>
              <a href="#">이스포츠</a>
            </nav>
          </div>
          {!currentUser ? (
            <button 
              className="login-button"
              onClick={() => navigate('/community/login')}
            >
              로그인
            </button>
          ) : (
            <>
              <span style={{ color: "#cdd2e2", fontSize: "14px", marginRight: "-600px" }}>
                {currentUser}님
                {currentUser === "admin1" && (
                  <span style={{ color: "#e8a53e", marginLeft: "8px" }}>(관리자)</span>
                )}
              </span>
              <button 
                className="login-button"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </>
          )}
        </div>
      </div>
      <nav className="main-nav">
        <div className="main-nav-content">
          <div className="main-nav-links">
            <Link to="/">홈</Link>
            <Link to="/community">커뮤니티</Link>
            <Link to="/community/free">자유게시판</Link>
            <Link to="/community/guide">공략</Link>
            <Link to="/community/lolmuncheol">롤문철</Link>
            <Link to="/community/highrecommend">추천글</Link>
          </div>
          {currentUser ? (
            <a href={`/user/${currentUser}`} target="_blank" rel="noopener noreferrer">마이페이지</a>
          ) : (
            <a href="#" onClick={() => navigate('/community/login')}>마이페이지</a>
          )}
        </div>
      </nav>
      {isSummonerPage && (
        <div className="header-container">
          <div className="search-section">
            <div className="country-selector">국가 Korea</div>
            <div className="search-bar">
              <AutocompleteSearch placeholder="플레이어 이름 + #KR1" />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header


