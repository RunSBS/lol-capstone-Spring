import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import boardApi from '../../data/communityApi.js'

function PopularPosts() {
  const [lolmuncheolPosts, setLolmuncheolPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLolmuncheolPosts()
  }, [])

  const loadLolmuncheolPosts = async () => {
    try {
      setLoading(true)
      // API 호출 방식 수정
      const response = await boardApi.getPosts(0, 50, 'lolmuncheol')
      const posts = response.content || []
      
      // 투표 데이터를 포함한 글들만 필터링하고 투표 점수로 정렬
      const postsWithVotes = posts.filter(post => post.vote && post.vote.results)
      const sortedPosts = postsWithVotes
        .map(post => {
          const totalVotes = Object.values(post.vote.results).reduce((sum, count) => sum + count, 0)
          const voteResults = post.vote.results
          const voteOptions = post.vote.options || []
          
          // 각 옵션별 득표수와 비율 계산
          const voteStats = voteOptions.map((option, index) => ({
            option: option,
            votes: voteResults[index] || 0,
            percentage: totalVotes > 0 ? Math.round(((voteResults[index] || 0) / totalVotes) * 100) : 0
          }))
          
          return {
            ...post,
            totalVotes,
            voteStats
          }
        })
        .sort((a, b) => b.totalVotes - a.totalVotes) // 총 투표수로 정렬
        .slice(0, 5)
      
      setLolmuncheolPosts(sortedPosts)
    } catch (error) {
      console.error('롤문철 글 로드 실패:', error)
      setLolmuncheolPosts([])
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '시간 정보 없음'
    const now = new Date()
    const postDate = new Date(dateString)
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return '방금 전'
    if (diffInHours < 24) return `${diffInHours}시간 전`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}일 전`
    return postDate.toLocaleDateString()
  }

  const getDisplayTitle = (post) => {
    const title = post.title || '제목 없음'
    const maxLength = 20
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title
  }

  // 5개 슬롯을 만들고 실제 데이터로 채우기
  const renderPosts = () => {
    const slots = []
    
    // 실제 데이터로 채우기
    lolmuncheolPosts.forEach((post, index) => {
      slots.push(
        <Link 
          key={post.id} 
          to={`/community/post/${post.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div className="popular-item" data-name={`Post Item ${index + 1}`}>
            <p className="popular-rank">{index + 1}</p>
            <p className="popular-text">
              {getDisplayTitle(post)}
              <span style={{ color: '#ff6b6b', marginLeft: '5px' }}>
                [{post.like || 0}]
              </span>
            </p>
            <p className="popular-meta">
              {formatTimeAgo(post.createdAt)} {post.writer || '작성자 없음'}
            </p>
            <div style={{ marginTop: '5px', fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* 투표 현황 */}
              <div style={{ display: 'flex', gap: '8px', fontSize: '10px' }}>
                {post.voteStats && post.voteStats.map((stat, statIndex) => (
                  <div key={statIndex} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <div 
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: statIndex === 0 ? '#007bff' : '#dc3545'
                      }}
                    />
                    <span style={{ color: '#666' }}>
                      {stat.percentage}%
                    </span>
                  </div>
                ))}
              </div>
              
              {/* 총 투표수 */}
              <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                총 투표: {post.totalVotes}표
              </span>
            </div>
          </div>
        </Link>
      )
    })
    
    // 빈 슬롯 채우기 (5개까지)
    for (let i = lolmuncheolPosts.length; i < 5; i++) {
      slots.push(
        <div key={`empty-${i}`} className="popular-item" data-name={`Post Item ${i + 1}`}>
          <p className="popular-rank">{i + 1}</p>
          <p className="popular-text" style={{ color: '#999' }}>-</p>
          <p className="popular-meta" style={{ color: '#999' }}>-</p>
        </div>
      )
    }
    
    return slots
  }

  return (
    <div className="popular-posts" data-name="Left Column - Popular Posts" data-node-id="2:338">
      <p className="popular-title" data-node-id="2:339">롤문철 인기글</p>
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          로딩 중...
        </div>
      ) : (
        renderPosts()
      )}
    </div>
  )
}

export default PopularPosts


