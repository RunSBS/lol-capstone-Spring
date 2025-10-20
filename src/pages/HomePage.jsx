import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/common/Header.jsx'
import '../styles/summoner.css'
import PopularPosts from '../components/homepage/PopularPosts.jsx'
import Footer from '../components/common/Footer.jsx'
import { normalizeRiotIdQuery } from '../data/normalize.js'

function HomePage() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const q = normalizeRiotIdQuery(nickname)
    if (!q) return
    navigate(`/summoner/${encodeURIComponent(q)}`)
  }

  return (
    <>
      <Header />
      <div style={{ width: '100%', height: 260, backgroundImage: 'url(https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1600&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ maxWidth: 1080, margin: '40px auto', padding: 24 }}>
        <h1 style={{ marginBottom: 16 }}>DJ.GG</h1>
        <div className="search-section">
          <div className="country-selector">국가 Korea</div>
          <div className="search-bar">
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <input
                placeholder="소환사 닉네임 + #KR1"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </form>
          </div>
        </div>
        <div className="home-sections" style={{ marginTop: 24 }}>
          <div>
            <PopularPosts />
          </div>
          <aside className="home-ad">
            <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop" alt="광고" />
          </aside>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default HomePage


