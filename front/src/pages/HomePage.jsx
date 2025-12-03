import Header from '../components/common/Header.jsx'
import '../styles/summoner.css'
import PopularPosts from '../components/homepage/PopularPosts.jsx'
import TokenRanking from '../components/homepage/TokenRanking.jsx'
import Footer from '../components/common/Footer.jsx'
import AutocompleteSearch from '../components/common/AutocompleteSearch.jsx'
import Chatbot from "../components/homepage/Chatbot.jsx";

function HomePage() {

  return (
    <>
      <Header />
      <div style={{ maxWidth: 1080, margin: '60px auto', padding: '0 24px' }}>
        {/* DJGG 로고 - 검색바 위에 가운데 정렬 */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '64px', 
            fontWeight: 'bold', 
            margin: 0,
            color: 'var(--text-primary)',
            letterSpacing: '2px'
          }}>
            DJ.GG
          </h1>
        </div>
        
        {/* 검색바 - 크기 증가 */}
        <div style={{ 
          maxWidth: '900px', 
          margin: '0 auto',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          padding: '28px 32px',
          backgroundColor: 'var(--card-bg-light)',
          borderRadius: '16px',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div className="country-selector" style={{ 
            fontSize: '18px',
            padding: '20px 28px',
            minWidth: '160px',
            textAlign: 'center',
            flexShrink: 0,
            fontWeight: '500'
          }}>국가 Korea</div>
          <div className="search-bar" style={{ 
            padding: '20px 28px',
            fontSize: '18px',
            flex: 1
          }}>
            <AutocompleteSearch placeholder="소환사 닉네임 + #KR1" />
          </div>
        </div>
        <div className="home-sections" style={{ marginTop: '60px' }}>
          <div>
            <PopularPosts />
          </div>
          <aside className="home-ad">
            <TokenRanking />
          </aside>
        </div>
      </div>
      <Footer />

        {/* 챗봇 추가 */}
        <Chatbot/>
    </>
  )
}

export default HomePage


