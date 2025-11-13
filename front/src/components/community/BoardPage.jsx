import React, { useEffect, useState } from "react";
import boardApi from "../../data/communityApi";
import commentApi from "../../data/commentApi";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/community.css";

function BoardPage({ category, searchKeyword: propSearchKeyword, searchBy: propSearchBy, sortFilter: propSortFilter }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [searchKeyword, setSearchKeyword] = useState(propSearchKeyword || "");
  const [searchBy, setSearchBy] = useState(propSearchBy || "all");
  const [sortFilter, setSortFilter] = useState(propSortFilter || "latest");
  const [searching, setSearching] = useState(false);
  
  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10); // 페이지당 기본 10개

  // 상대 시간 포맷 함수
  const formatTimeAgo = (dateString) => {
    if (!dateString) return '시간 정보 없음';
    
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMs = now - postDate;
    
    if (diffInMs < 0) return '시간 정보 없음'; // 미래 시간인 경우
    
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) {
      return '방금 전';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else {
      return `${diffInDays}일 전`;
    }
  };

  // 카테고리를 한글로 변환하는 함수
  const getCategoryKoreanName = (category) => {
    const categoryMap = {
      'free': '자유',
      'guide': '공략',
      'lolmuncheol': '롤문철',
      'highrecommend': '추천글'
    };
    return categoryMap[category] || category;
  };

  // 게시글 내용에서 첫 번째 이미지 URL 추출
  const extractFirstImage = (content) => {
    if (!content) return null;
    
    try {
      // HTML content에서 img 태그의 src 속성 추출
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
      const match = content.match(imgRegex);
      
      if (match && match[1]) {
        const imageUrl = match[1];
        // base64 이미지나 서버 파일 URL 모두 허용
        if (imageUrl.startsWith('data:image/') || imageUrl.startsWith('/api/files/') || imageUrl.startsWith('http')) {
          return imageUrl;
        }
      }
      
      // data-media-type="image" 속성이 있는 img 태그도 확인
      const mediaImgRegex = /<img[^>]+data-media-type=["']image["'][^>]+src=["']([^"']+)["'][^>]*>/i;
      const mediaMatch = content.match(mediaImgRegex);
      
      if (mediaMatch && mediaMatch[1]) {
        const imageUrl = mediaMatch[1];
        if (imageUrl.startsWith('data:image/') || imageUrl.startsWith('/api/files/') || imageUrl.startsWith('http')) {
          return imageUrl;
        }
      }
    } catch (error) {
      console.error('이미지 추출 오류:', error);
    }
    
    return null;
  };

  // props 변경 시 상태 업데이트
  useEffect(() => {
    if (propSearchKeyword !== undefined) {
      setSearchKeyword(propSearchKeyword);
    }
    if (propSearchBy !== undefined) {
      setSearchBy(propSearchBy);
    }
    if (propSortFilter !== undefined) {
      setSortFilter(propSortFilter);
    }
  }, [propSearchKeyword, propSearchBy, propSortFilter]);

  // 커스텀 이벤트 리스너 (CommunityPage에서 검색 트리거)
  useEffect(() => {
    const handleSearchEvent = async (event) => {
      const { keyword, searchBy: eventSearchBy, sortFilter: eventSortFilter } = event.detail;
      setSearchKeyword(keyword || "");
      setSearchBy(eventSearchBy || "all");
      setSortFilter(eventSortFilter || "latest");
      if (keyword && keyword.trim()) {
        await performSearch(keyword, eventSearchBy || "all", eventSortFilter || "latest");
      } else {
        setCurrentPage(0);
        setSearching(false);
        await loadPostsAndComments(0, eventSortFilter || "latest");
      }
    };

    window.addEventListener('communitySearch', handleSearchEvent);
    return () => {
      window.removeEventListener('communitySearch', handleSearchEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // sortFilter 변경 시 정렬 적용 (props에서 직접 변경될 때)
  useEffect(() => {
    if (posts.length > 0 && !searching && propSortFilter && propSortFilter !== sortFilter) {
      const sorted = applySortFilter([...posts], propSortFilter, true);
    }
  }, [propSortFilter]);

  useEffect(() => {
    // 카테고리 변경 시 검색 상태 초기화 및 첫 페이지로 이동
    setCurrentPage(0);
    setSearching(false);
    setSearchKeyword("");
    setSearchBy("all");
    loadPostsAndComments(0, sortFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  useEffect(() => {
    if (!searching) {
      loadPostsAndComments(currentPage, sortFilter);
    }
  }, [currentPage]);

  // 정렬 함수
  const applySortFilter = (postsToSort, filter, updateState = true) => {
    let sorted = [...postsToSort];
    
    switch (filter) {
      case 'popular':
        // 추천수(like) 기준으로 정렬
        sorted.sort((a, b) => {
          const aLike = typeof a.like === 'number' ? a.like : parseInt(a.like) || 0;
          const bLike = typeof b.like === 'number' ? b.like : parseInt(b.like) || 0;
          return bLike - aLike;
        });
        break;
      case 'top':
        // 추천수와 시간을 종합하여 정렬 (추천수 우선, 같은 추천수면 최신순) - 내림차순
        sorted.sort((a, b) => {
          const aLike = typeof a.like === 'number' ? a.like : parseInt(a.like) || 0;
          const bLike = typeof b.like === 'number' ? b.like : parseInt(b.like) || 0;
          if (bLike !== aLike) {
            return bLike - aLike;
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        break;
      case 'top-desc':
        // 추천수와 시간을 종합하여 정렬 (추천수 낮은 순 우선, 같은 추천수면 오래된 순) - 오름차순
        sorted.sort((a, b) => {
          const aLike = typeof a.like === 'number' ? a.like : parseInt(a.like) || 0;
          const bLike = typeof b.like === 'number' ? b.like : parseInt(b.like) || 0;
          if (aLike !== bLike) {
            return aLike - bLike;
          }
          return new Date(a.createdAt) - new Date(b.createdAt);
        });
        break;
      case 'latest':
      default:
        // 최신순 (기본값)
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    
    if (updateState) {
      setPosts(sorted);
    }
    return sorted;
  };

  const loadPostsAndComments = async (page = 0, filter = "latest") => {
    try {
      console.log('커뮤니티 탭 로드 시작, category:', category, 'page:', page, 'filter:', filter)
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
        let filteredPosts = allPosts
          .filter(post => {
            const likeCount = typeof post.like === 'number' ? post.like : parseInt(post.like) || 0;
            return likeCount >= 3;
          });
        
        // 정렬 적용
        filteredPosts = applySortFilter(filteredPosts, filter);
        
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
        
        // 정렬 적용
        posts = applySortFilter(posts, filter);
        
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

  const performSearch = async (keyword, searchByParam, filterParam = "latest") => {
    if (!keyword || !keyword.trim()) {
      setCurrentPage(0);
      setSearching(false);
      await loadPostsAndComments(0, filterParam);
      return;
    }

    try {
      console.log('검색 수행:', { keyword, searchByParam, category, filterParam });
      
      let searchResults = [];
      
      if (category === "highrecommend") {
        // 추천글 검색: 모든 카테고리에서 검색
        const categories = ["free", "guide", "lolmuncheol"];
        let allResults = [];
        for (const cat of categories) {
          try {
            const res = await boardApi.searchPosts(keyword, cat);
            allResults = allResults.concat(res || []);
          } catch (error) {
            console.error(`카테고리 ${cat} 검색 실패:`, error);
          }
        }
        searchResults = allResults;
        
        // 추천수 3개 이상 필터링
        searchResults = searchResults.filter(post => {
          const likeCount = typeof post.like === 'number' ? post.like : parseInt(post.like) || 0;
          return likeCount >= 3;
        });
      } else {
        // 일반 검색
        try {
          searchResults = await boardApi.searchPosts(keyword, category);
        } catch (error) {
          console.error('검색 실패:', error);
          searchResults = [];
        }
      }
      
      // 검색 옵션에 따라 추가 필터링
      if (searchByParam !== "all" && searchResults.length > 0) {
        searchResults = searchResults.filter(post => {
          switch (searchByParam) {
            case "writer":
              return post.writer && post.writer.includes(keyword);
            case "title":
              return post.title && post.title.includes(keyword);
            case "content":
              return (post.content && post.content.includes(keyword)) || 
                     (post.contentB && post.contentB.includes(keyword));
            default:
              return true;
          }
        });
      }
      
      // 정렬 적용
      searchResults = applySortFilter(searchResults, filterParam, false);
      
      // 검색 결과 설정
      setPosts(searchResults);
      setSearching(true);
      setCurrentPage(0);
      setTotalPages(0);
      setTotalElements(searchResults.length);

      // 댓글 수 조회
      const counts = {};
      await Promise.all(searchResults.map(async (post) => {
        try {
          counts[post.id] = await commentApi.getCommentCountByPostId(post.id);
        } catch (error) {
          console.error(`댓글 수 조회 실패 postId=${post.id}:`, error);
          counts[post.id] = 0;
        }
      }));
      setCommentCounts(counts);
      
      console.log('검색 완료:', searchResults.length, '개 결과');
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
      setPosts([]);
      setCommentCounts({});
      setSearching(false);
      setTotalPages(0);
      setTotalElements(0);
    }
  };

  // 제목을 회색으로 표시할지 판단하는 함수
  const shouldShowGrayTitle = (post) => {
    // 롤문철 글에서 내기자B가 아직 본문을 작성하지 않은 경우
    if (post.category === "lolmuncheol" && post.writerB && (!post.contentB || post.contentB.trim() === "")) {
      return true;
    }
    
    // 투표가 마감되어 정산이 끝난 경우
    if (post.vote && post.vote.endTime) {
      const deadline = new Date(post.vote.endTime);
      const now = new Date();
      // 마감 시간이 지났으면 회색 표시
      if (now > deadline) {
        return true;
      }
    }
    
    return false;
  };

  return (
    <div>
      {posts.map(post => {
        const firstImage = extractFirstImage(post.content);
        const isGrayTitle = shouldShowGrayTitle(post);
        return (
          <div 
            key={post.id} 
            className="board-post-item"
            onClick={() => navigate(`/community/post/${post.id}`)}
          >
            <div className="board-post-content">
              <div className="board-post-title">
                <h4 style={{ color: isGrayTitle ? '#999' : 'inherit' }}>{post.title}</h4>
                <span className="board-post-comment-count-inline">[{commentCounts[post.id] || 0}]</span>
              </div>
            <div className="board-post-meta">
              {post.category === "lolmuncheol" && post.writerB ? (
                <>
                  <a 
                    href={`/user/${encodeURIComponent(post.writer)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {post.writer}
                  </a> vs <a 
                    href={`/user/${encodeURIComponent(post.writerB)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {post.writerB}
                  </a>
                </>
              ) : (
                <a 
                  href={`/user/${encodeURIComponent(post.writer)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {post.writer}
                </a>
              )}
              {" · "}
              {formatTimeAgo(post.createdAt)} · {getCategoryKoreanName(post.category)}
              {post.tags && post.tags.includes("highrecommend") && (
                <span className="board-post-highrecommend-badge">
                  추천글
                </span>
              )}
            </div>
            <div className="board-post-vote-info">
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
                  <div className="board-post-vote-info">
                    <div className="board-post-vote-option">
                      {post.vote.options.map((option, index) => {
                        const votes = getVoteCount(index)
                        const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                        
                        return (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <div className={`board-post-vote-dot option-${index}`} />
                            <span style={{ color: '#666' }}>
                              {percentage}%
                            </span>
                          </div>
                        );
                      })}
                      <span className="board-post-vote-total">
                        총 투표: {totalVotes}표
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
          {firstImage && (
            <div className="board-post-image-banner" onClick={(e) => e.stopPropagation()}>
              <img src={firstImage} alt="게시글 미리보기" />
            </div>
          )}
        </div>
        );
      })}

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
    <div className="pagination-container">
      {/* << 첫 페이지로 */}
      {currentPage > 0 && (
        <button
          onClick={handleFirstPage}
          className="pagination-button"
          title="첫 페이지"
        >
          &lt;&lt;
        </button>
      )}
      
      {/* < 이전 그룹 */}
      {currentGroup > 0 && (
        <button
          onClick={handlePreviousGroup}
          className="pagination-button"
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
          className={`pagination-button ${pageNum === currentPage ? 'active' : ''}`}
        >
          {pageNum + 1}
        </button>
      ))}
      
      {/* > 다음 그룹 */}
      {endPage < totalPages - 1 && (
        <button
          onClick={handleNextGroup}
          className="pagination-button"
          title="다음 페이지 그룹"
        >
          &gt;
        </button>
      )}
      
      {/* >> 마지막 페이지로 */}
      {currentPage < totalPages - 1 && (
        <button
          onClick={handleLastPage}
          className="pagination-button"
          title="마지막 페이지"
        >
          &gt;&gt;
        </button>
      )}
      
      {/* 페이지 정보 */}
      <div className="pagination-info">
        전체 {totalElements}개 ({(currentPage + 1)}/{totalPages} 페이지)
      </div>
    </div>
  );
}

export default BoardPage;

