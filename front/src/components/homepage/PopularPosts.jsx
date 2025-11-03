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
      console.log('인기글 로드 시작: lolmuncheol 카테고리')
      
      // API 호출 방식 수정
      const response = await boardApi.getPosts(0, 50, 'lolmuncheol')
      console.log('인기글 API 응답:', response)
      
      const posts = (response && response.content) ? response.content : (Array.isArray(response) ? response : [])
      console.log('파싱된 게시글 수:', posts.length)
      
      if (!Array.isArray(posts)) {
        console.error('posts가 배열이 아닙니다:', typeof posts, posts)
        setLolmuncheolPosts([])
        return
      }
      
      // 각 게시글의 vote 정보 확인
      posts.forEach(post => {
        console.log(`게시글 ${post.id} (${post.title}):`, {
          category: post.category,
          hasVote: !!post.vote,
          voteType: typeof post.vote,
          vote: post.vote,
          hasResults: !!(post.vote && post.vote.results),
          hasOptions: !!(post.vote && post.vote.options)
        })
      })
      
      // 투표 데이터를 포함한 글들만 필터링하고 투표 점수로 정렬
      // 롤문철 카테고리이고 vote 정보가 있는 경우만 포함
      const postsWithVotes = posts.filter(post => {
        // category가 lolmuncheol이고 vote가 있고 results와 options가 있는 경우만
        if (post.category === 'lolmuncheol') {
          const hasVote = post && post.vote && post.vote.results && post.vote.options
          if (!hasVote) {
            console.log('투표 없는 롤문철 글 필터링됨:', post.id, post.title, 'vote:', post.vote)
          }
          return hasVote
        }
        return false
      })
      console.log('투표 있는 글 수:', postsWithVotes.length)
      const sortedPosts = postsWithVotes
        .map(post => {
          // Map이 JSON으로 변환되면 키가 문자열일 수 있으므로 안전하게 처리
          const results = post.vote.results || {}
          const voteResults = typeof results === 'object' && !Array.isArray(results) ? results : {}
          
          // 숫자 키로 접근 (문자열 키도 허용)
          const getVoteCount = (index) => {
            return voteResults[index] || voteResults[String(index)] || voteResults[`${index}`] || 0
          }
          
          const votes0 = getVoteCount(0)
          const votes1 = getVoteCount(1)
          const totalVotes = votes0 + votes1
          const voteOptions = post.vote.options || []
          
          // 각 옵션별 득표수와 비율 계산
          const voteStats = voteOptions.map((option, index) => {
            const votes = getVoteCount(index)
            return {
              option: option,
              votes: votes,
              percentage: totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
            }
          })
          
          return {
            ...post,
            totalVotes,
            voteStats
          }
        })
        .sort((a, b) => b.totalVotes - a.totalVotes) // 총 투표수로 정렬
        .slice(0, 5)
      
      console.log('정렬된 인기글 수:', sortedPosts.length)
      setLolmuncheolPosts(sortedPosts)
    } catch (error) {
      console.error('롤문철 글 로드 실패:', error)
      console.error('에러 상세:', error.message, error.stack)
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
              {formatTimeAgo(post.createdAt)} {
                post.category === "lolmuncheol" && post.writerB 
                  ? `${post.writer || '작성자 없음'} vs ${post.writerB}`
                  : (post.writer || '작성자 없음')
              }
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


