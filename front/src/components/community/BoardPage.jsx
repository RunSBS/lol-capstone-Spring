import React, { useEffect, useState } from "react";
import boardApi from "../../data/communityApi";
import commentApi from "../../data/commentApi";
import { Link } from "react-router-dom";

function BoardPage({ category }) {
  const [posts, setPosts] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchBy, setSearchBy] = useState("all");
  const [searching, setSearching] = useState(false);
  
  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10); // 페이지당 기본 10개

  useEffect(() => {
    setCurrentPage(0); // 카테고리 변경 시 첫 페이지로 이동
    loadPostsAndComments(0);
  }, [category]);
  
  useEffect(() => {
    if (!searching) {
      loadPostsAndComments(currentPage);
    }
  }, [currentPage]);

  const loadPostsAndComments = async (page = 0) => {
    try {
      console.log('커뮤니티 탭 로드 시작, category:', category, 'page:', page)
      let posts = [];
      let totalPagesValue = 0;
      let totalElementsValue = 0;
      
      if (category === "highrecommend") {
        // 추천글은 기존 방식 유지 (모든 카테고리에서 가져와서 필터링)
        const categories = ["free", "guide", "lolmuncheol"];
        let allPosts = [];
        for (const cat of categories) {
          try {
            const data = await boardApi.getPosts(0, 1000, cat);
            const content = (data && data.content) ? data.content : (Array.isArray(data) ? data : [])
            if (Array.isArray(content)) {
              allPosts = allPosts.concat(content);
            } else {
              console.warn('content가 배열이 아닙니다:', cat, content)
            }
          } catch (error) {
            console.error(`카테고리 ${cat} 로드 실패:`, error)
          }
        }
        
        // 추천수 3개 이상인 글만 필터링
        const filteredPosts = allPosts
          .filter(post => {
            const likeCount = typeof post.like === 'number' ? post.like : parseInt(post.like) || 0;
            return likeCount >= 3;
          })
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // 클라이언트 측 페이징 (추천글은 특수 처리)
        totalElementsValue = filteredPosts.length;
        totalPagesValue = Math.ceil(totalElementsValue / pageSize);
        posts = filteredPosts.slice(page * pageSize, (page + 1) * pageSize);
        
        console.log('최종 필터링된 추천글 수 (추천수 3개 이상):', totalElementsValue, '페이지:', page + 1);
      } else {
        // 일반 게시판: 서버 측 페이징 사용
        const data = await boardApi.getPosts(page, pageSize, category);
        console.log('API 응답:', data)
        
        if (data && typeof data === 'object' && 'content' in data) {
          posts = data.content || [];
          totalPagesValue = data.totalPages || 0;
          totalElementsValue = data.totalElements || 0;
        } else if (Array.isArray(data)) {
          // 호환성: 배열로 반환된 경우
          posts = data;
          totalPagesValue = Math.ceil(posts.length / pageSize);
          totalElementsValue = posts.length;
          posts = posts.slice(page * pageSize, (page + 1) * pageSize);
        } else {
          posts = [];
        }
        
        console.log('파싱된 게시글 수:', posts.length, '총 페이지:', totalPagesValue)
      }
      
      if (!Array.isArray(posts)) {
        console.error('posts가 배열이 아닙니다:', typeof posts, posts)
        posts = []
      }

      setPosts(posts);
      setTotalPages(totalPagesValue);
      setTotalElements(totalElementsValue);
      setSearching(false);
      setSearchKeyword("");
      setSearchBy("all");

      const counts = {};
      await Promise.all(posts.map(async (post) => {
        try {
          counts[post.id] = await commentApi.getCommentCountByPostId(post.id);
        } catch (error) {
          console.error(`댓글 수 조회 실패 postId=${post.id}:`, error)
          counts[post.id] = 0
        }
      }));
      setCommentCounts(counts);
      console.log('커뮤니티 탭 로드 완료, 게시글 수:', posts.length)
    } catch (error) {
      console.error('커뮤니티 탭 로드 실패:', error)
      console.error('에러 상세:', error.message, error.stack)
      setPosts([])
      setCommentCounts({})
      setTotalPages(0)
      setTotalElements(0)
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      setCurrentPage(0);
      await loadPostsAndComments(0);
      return;
    }

    if (category === "highrecommend") {
      const categories = ["free", "guide", "lolmuncheol"];
      let allResults = [];
      for (const cat of categories) {
        const res = await boardApi.searchPosts(searchKeyword, cat);
        allResults = allResults.concat(res);
      }
      // 추천수 3개 이상 필터링 (태그와 관계없이 추천수 기준)
      const filteredPosts = allResults
        .filter(post => {
          const likeCount = typeof post.like === 'number' ? post.like : parseInt(post.like) || 0;
          return likeCount >= 3;
        });
      setPosts(filteredPosts);
      setSearching(true);

      const counts = {};
      await Promise.all(filteredPosts.map(async (post) => {
        counts[post.id] = await commentApi.getCommentCountByPostId(post.id);
      }));
      setCommentCounts(counts);
    } else {
      if (searchBy === "all") {
        const res = await boardApi.searchPosts(searchKeyword, category);
        setPosts(res);
        setSearching(true);

        const counts = {};
        await Promise.all(res.map(async (post) => {
          counts[post.id] = await commentApi.getCommentCountByPostId(post.id);
        }));
        setCommentCounts(counts);
      } else {
        const data = await boardApi.getPosts(0, 100, category);
        let filtered = [];
        switch (searchBy) {
          case "writer":
            filtered = data.content.filter(p => p.writer.includes(searchKeyword));
            break;
          case "title":
            filtered = data.content.filter(p => p.title.includes(searchKeyword));
            break;
          case "content":
            filtered = data.content.filter(p => 
              (p.content && p.content.includes(searchKeyword)) || 
              (p.contentB && p.contentB.includes(searchKeyword))
            );
            break;
          case "comment":
            const commentsJson = localStorage.getItem("dummyComments");
            const comments = JSON.parse(commentsJson || "[]");
            filtered = data.content.filter(p =>
              comments.some(c => c.postId === p.id && c.text.includes(searchKeyword))
            );
            break;
          default:
            filtered = data.content;
        }
        setPosts(filtered);
        setSearching(true);

        const counts = {};
        await Promise.all(filtered.map(async (post) => {
          counts[post.id] = await commentApi.getCommentCountByPostId(post.id);
        }));
        setCommentCounts(counts);
      }
    }
  };

  return (
    <div>
      {posts.map(post => (
        <div key={post.id} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: "1px solid #ddd", padding: "10px 0"
        }}>
          <div>
            <Link to={`/community/post/${post.id}`}>
              <h4>{post.title}</h4>
            </Link>
            <div>
              {post.category === "lolmuncheol" && post.writerB ? (
                <>
                  <a href={`/user/${encodeURIComponent(post.writer)}`} target="_blank" rel="noopener noreferrer">{post.writer}</a> vs <a href={`/user/${encodeURIComponent(post.writerB)}`} target="_blank" rel="noopener noreferrer">{post.writerB}</a>
                </>
              ) : (
                <a href={`/user/${encodeURIComponent(post.writer)}`} target="_blank" rel="noopener noreferrer">{post.writer}</a>
              )}
              {" · "}
              {new Date(post.createdAt).toLocaleString()} · {post.category}
              {post.tags && post.tags.includes("highrecommend") && (
                <span style={{
                  marginLeft: 8, padding: "2px 6px", fontSize: 12,
                  color: "white", backgroundColor: "orange", borderRadius: 4
                }}>
                  추천글
                </span>
              )}
            </div>
            <div style={{ marginTop: 8 }}>
              추천: {post.like || 0} / 반대: {post.dislike || 0}
              {post.vote && post.vote.results && post.vote.options && (() => {
                // Map이 JSON으로 변환되면 키가 문자열일 수 있으므로 안전하게 처리
                const results = post.vote.results || {}
                const getVoteCount = (idx) => {
                  return results[idx] || results[String(idx)] || results[`${idx}`] || 0
                }
                const votes0 = getVoteCount(0)
                const votes1 = getVoteCount(1)
                const totalVotes = votes0 + votes1
                
                return (
                  <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {post.vote.options.map((option, index) => {
                        const votes = getVoteCount(index)
                        const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                        
                        return (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <div 
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: index === 0 ? '#007bff' : '#dc3545'
                              }}
                            />
                            <span style={{ color: '#666' }}>
                              {percentage}%
                            </span>
                          </div>
                        );
                      })}
                      <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                        총 투표: {totalVotes}표
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
          <div style={{
            borderLeft: "1px solid #ccc", paddingLeft: 15, minWidth: 60,
            textAlign: "center", fontWeight: "bold", color: "#555"
          }}>
            댓글 {commentCounts[post.id] || 0}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 20 }}>
        <input
          type="text"
          value={searchKeyword}
          onChange={e => setSearchKeyword(e.target.value)}
          placeholder="검색어 입력"
          style={{ width: 200, marginRight: 10 }}
        />
        <select value={searchBy} onChange={e => setSearchBy(e.target.value)} style={{ marginRight: 10 }}>
          <option value="all">전체</option>
          <option value="writer">작성자</option>
          <option value="title">제목</option>
          <option value="content">본문</option>
          <option value="comment">댓글</option>
        </select>
        <button onClick={handleSearch}>검색</button>
      </div>
      
      {/* 페이징 UI */}
      {!searching && totalPages > 0 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalElements={totalElements}
          pageSize={pageSize}
        />
      )}
    </div>
  );
}

// 페이징 컴포넌트
function Pagination({ currentPage, totalPages, onPageChange, totalElements, pageSize }) {
  // 현재 페이지 그룹 계산 (5개씩)
  const pageGroupSize = 5;
  const currentGroup = Math.floor(currentPage / pageGroupSize);
  const startPage = currentGroup * pageGroupSize;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages - 1);
  
  // 표시할 페이지 번호 배열
  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  
  const handlePreviousGroup = () => {
    if (currentGroup > 0) {
      onPageChange((currentGroup - 1) * pageGroupSize);
    }
  };
  
  const handleNextGroup = () => {
    if (endPage < totalPages - 1) {
      onPageChange((currentGroup + 1) * pageGroupSize);
    }
  };
  
  const handleFirstPage = () => {
    onPageChange(0);
  };
  
  const handleLastPage = () => {
    onPageChange(totalPages - 1);
  };
  
  const handlePageClick = (page) => {
    onPageChange(page);
  };
  
  return (
    <div style={{ 
      marginTop: 30, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      gap: 5,
      flexWrap: 'wrap'
    }}>
      {/* << 첫 페이지로 */}
      {currentPage > 0 && (
        <button
          onClick={handleFirstPage}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: 4,
            backgroundColor: '#fff',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          title="첫 페이지"
        >
          &lt;&lt;
        </button>
      )}
      
      {/* < 이전 그룹 */}
      {currentGroup > 0 && (
        <button
          onClick={handlePreviousGroup}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: 4,
            backgroundColor: '#fff',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          title="이전 페이지 그룹"
        >
          &lt;
        </button>
      )}
      
      {/* 페이지 번호들 */}
      {pageNumbers.map(pageNum => (
        <button
          key={pageNum}
          onClick={() => handlePageClick(pageNum)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: 4,
            backgroundColor: pageNum === currentPage ? '#007bff' : '#fff',
            color: pageNum === currentPage ? '#fff' : '#000',
            cursor: 'pointer',
            fontWeight: pageNum === currentPage ? 'bold' : 'normal',
            fontSize: '14px',
            minWidth: '40px'
          }}
        >
          {pageNum + 1}
        </button>
      ))}
      
      {/* > 다음 그룹 */}
      {endPage < totalPages - 1 && (
        <button
          onClick={handleNextGroup}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: 4,
            backgroundColor: '#fff',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          title="다음 페이지 그룹"
        >
          &gt;
        </button>
      )}
      
      {/* >> 마지막 페이지로 */}
      {currentPage < totalPages - 1 && (
        <button
          onClick={handleLastPage}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: 4,
            backgroundColor: '#fff',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          title="마지막 페이지"
        >
          &gt;&gt;
        </button>
      )}
      
      {/* 페이지 정보 */}
      <div style={{ 
        marginLeft: 20, 
        fontSize: '14px', 
        color: '#666',
        whiteSpace: 'nowrap'
      }}>
        전체 {totalElements}개 ({(currentPage + 1)}/{totalPages} 페이지)
      </div>
    </div>
  );
}

export default BoardPage;
