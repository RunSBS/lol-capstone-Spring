import Header from '../components/common/Header.jsx'
import '../styles/summoner.css'
import PopularPosts from '../components/homepage/PopularPosts.jsx'
import TokenRanking from '../components/homepage/TokenRanking.jsx'
import Footer from '../components/common/Footer.jsx'
import AutocompleteSearch from '../components/common/AutocompleteSearch.jsx'

function HomePage() {

  return (
    <>
      <Header />
      <div style={{ width: '100%', height: 260, backgroundImage: 'url(https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1600&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ maxWidth: 1080, margin: '40px auto', padding: 24 }}>
        <h1 style={{ marginBottom: 16 }}>DJ.GG</h1>
        <div className="search-section">
          <div className="country-selector">국가 Korea</div>
          <div className="search-bar">
            <AutocompleteSearch placeholder="소환사 닉네임 + #KR1" />
          </div>
        </div>
        <div className="home-sections" style={{ marginTop: 24 }}>
          <div>
            <PopularPosts />
          </div>
          <aside className="home-ad">
            <TokenRanking />
          </aside>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default HomePage


