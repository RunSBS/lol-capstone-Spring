import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { normalizeRiotIdQuery } from '../../data/normalize.js'
import AutocompleteSearch from './AutocompleteSearch.jsx'

function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [theme, setTheme] = useState(() => {
    // localStorage에서 테마 가져오기 (기본값: 'dark')
    return localStorage.getItem('theme') || 'dark'
  })
  const isSummonerPage = location.pathname.startsWith('/summoner')
  const isCommunityPage = location.pathname.startsWith('/community')

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

  // 테마 변경 시 document에 클래스 적용
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }
  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
    // 로그인 상태 변경 이벤트 발생
    window.dispatchEvent(new Event('loginStateChanged'))
  }
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="unified-nav-bar">
          <div className="unified-nav-left">
            <Link to="/" className="logo">DJ.GG</Link>
            <nav className="main-nav-links">
              <Link to="/">홈</Link>
              <Link 
                to="/community"
                onClick={() => {
                  sessionStorage.setItem('clearSearchOnNavigate', 'true');
                  const event = new CustomEvent('communitySearch', { 
                    detail: { keyword: "", searchBy: "all", sortFilter: "latest" } 
                  });
                  window.dispatchEvent(event);
                }}
              >
                커뮤니티
              </Link>
              <Link 
                to="/community/free"
                onClick={() => {
                  sessionStorage.setItem('clearSearchOnNavigate', 'true');
                  const event = new CustomEvent('communitySearch', { 
                    detail: { keyword: "", searchBy: "all", sortFilter: "latest" } 
                  });
                  window.dispatchEvent(event);
                }}
              >
                자유게시판
              </Link>
              <Link 
                to="/community/guide"
                onClick={() => {
                  sessionStorage.setItem('clearSearchOnNavigate', 'true');
                  const event = new CustomEvent('communitySearch', { 
                    detail: { keyword: "", searchBy: "all", sortFilter: "latest" } 
                  });
                  window.dispatchEvent(event);
                }}
              >
                공략
              </Link>
              <Link 
                to="/community/lolmuncheol"
                onClick={() => {
                  sessionStorage.setItem('clearSearchOnNavigate', 'true');
                  const event = new CustomEvent('communitySearch', { 
                    detail: { keyword: "", searchBy: "all", sortFilter: "latest" } 
                  });
                  window.dispatchEvent(event);
                }}
              >
                투표게시판
              </Link>
              <Link 
                to="/community/highrecommend"
                onClick={() => {
                  sessionStorage.setItem('clearSearchOnNavigate', 'true');
                  const event = new CustomEvent('communitySearch', { 
                    detail: { keyword: "", searchBy: "all", sortFilter: "latest" } 
                  });
                  window.dispatchEvent(event);
                }}
              >
                추천글
              </Link>
            </nav>
          </div>
          <div className="unified-nav-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                padding: '6px 12px',
                cursor: 'pointer',
                color: 'white',
                fontSize: '14px'
              }}
              title={theme === 'dark' ? '화이트모드로 전환' : '다크모드로 전환'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {!currentUser ? (
  <button 
    className="login-button"
    onClick={() => navigate('/community/login')}
  >
    로그인
  </button>
) : (
  <>
    <span style={{ color: "white", fontSize: "14px", marginRight: "8px" }}>
      {currentUser}님
      {currentUser === "admin1" && (
        <span style={{ color: "#e8a53e", marginLeft: "8px" }}>(관리자)</span>
      )}
    </span>
    <button
      className="login-button"
      onClick={() => navigate(`/user/${currentUser}`)}
    >
      마이페이지
    </button>
    <button 
      className="login-button"
      onClick={handleLogout}
      style={{ marginLeft: "4px" }}
    >
      로그아웃
    </button>
  </>
)}
          </div>
        </div>
      </div>
      {(isSummonerPage || isCommunityPage) && (
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


