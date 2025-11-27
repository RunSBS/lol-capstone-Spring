import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAutocompleteKeywords } from '../../data/api.js'
import { normalizeRiotIdQuery } from '../../data/normalize.js'

function AutocompleteSearch({ 
  placeholder = "플레이어 이름 (태그는 자동으로 #KR1이 추가됩니다)",
  onSummonerSelect = null
}) {
  const [keyword, setKeyword] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [currentPage, setCurrentPage] = useState(0)
  const [rateLimitError, setRateLimitError] = useState(false)
  const ITEMS_PER_PAGE = 5 // 한 페이지에 표시할 항목 수
  
  const navigate = useNavigate()
  const debounceRef = useRef(null)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  // 디바운싱된 API 호출 함수
  const debouncedFetchSuggestions = useCallback((query) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    debounceRef.current = setTimeout(async () => {
      if (query && query.length >= 2) {
        setLoading(true)
        try {
          // 태그가 포함된 경우와 그렇지 않은 경우 모두 처리
          let searchQuery = query
          let targetTag = 'KR1' // 기본 태그
          
          if (query.includes('#')) {
            // 사용자가 태그를 입력한 경우
            const [name, tag] = query.split('#')
            searchQuery = name.trim()
            targetTag = tag.trim().toUpperCase()
          }
          
          // API 호출 시도
          let data = []
          try {
            data = await fetchAutocompleteKeywords(searchQuery)
            setRateLimitError(false) // 성공 시 rate limit 에러 초기화
          } catch (apiError) {
            // Rate limit 에러인 경우 특별 처리
            if (apiError?.message?.includes('RATE_LIMIT') || apiError?.message?.includes('429')) {
              setRateLimitError(true)
              console.warn('Rate limit exceeded')
            } else {
              setRateLimitError(false)
            }
            // API 호출 실패 시 빈 배열 반환
            data = []
          }
          // 같은 이름의 소환사들을 그룹화
          const grouped = groupByGameName(data)
          setSuggestions(grouped)
          setShowSuggestions(true)
          setSelectedIndex(-1)
          setCurrentPage(0) // 새 검색 시 첫 페이지로
        } catch (error) {
          // 최종 폴백으로 빈 배열 반환
          setSuggestions([])
          setShowSuggestions(false)
          setSelectedIndex(-1)
          setCurrentPage(0)
        } finally {
          setLoading(false)
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }, 300) // 300ms 디바운싱
  }, [])

  // 키워드 변경 핸들러
  const handleInputChange = (e) => {
    const value = e.target.value
    setKeyword(value)
    debouncedFetchSuggestions(value)
  }

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch(keyword)
      }
      return
    }

    const currentPageItems = getPaginatedSuggestions()
    const maxIndexInPage = currentPageItems.length - 1
    const startIndex = currentPage * ITEMS_PER_PAGE

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => {
          const relativeIndex = prev >= startIndex ? prev - startIndex : -1
          if (relativeIndex < maxIndexInPage) {
            return startIndex + relativeIndex + 1
          } else if (currentPage < totalPages - 1) {
            // 현재 페이지의 마지막 항목이면 다음 페이지로
            setCurrentPage(currentPage + 1)
            return (currentPage + 1) * ITEMS_PER_PAGE
          }
          return prev
        })
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => {
          const relativeIndex = prev >= startIndex ? prev - startIndex : maxIndexInPage + 1
          if (relativeIndex > 0) {
            return startIndex + relativeIndex - 1
          } else if (currentPage > 0) {
            // 현재 페이지의 첫 항목이면 이전 페이지로
            setCurrentPage(currentPage - 1)
            return (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE - 1
          }
          return -1
        })
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= startIndex && selectedIndex < startIndex + currentPageItems.length) {
          const relativeIndex = selectedIndex - startIndex
          const selectedGroup = currentPageItems[relativeIndex]
          if (selectedGroup && selectedGroup.items && selectedGroup.items.length > 0) {
            handleGroupClick(selectedGroup)
          }
        } else {
          handleSearch(keyword)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
      case 'ArrowLeft':
        if (currentPage > 0) {
          e.preventDefault()
          setCurrentPage(prev => prev - 1)
          setSelectedIndex(prev => {
            const newStartIndex = (currentPage - 1) * ITEMS_PER_PAGE
            const relativeIndex = prev >= startIndex ? prev - startIndex : 0
            return newStartIndex + Math.min(relativeIndex, ITEMS_PER_PAGE - 1)
          })
        }
        break
      case 'ArrowRight':
        if (currentPage < totalPages - 1) {
          e.preventDefault()
          setCurrentPage(prev => prev + 1)
          setSelectedIndex(prev => {
            const newStartIndex = (currentPage + 1) * ITEMS_PER_PAGE
            const relativeIndex = prev >= startIndex ? prev - startIndex : 0
            return newStartIndex + Math.min(relativeIndex, ITEMS_PER_PAGE - 1)
          })
        }
        break
    }
  }

  // 검색 실행
  const handleSearch = (searchTerm) => {
    let finalQuery = searchTerm.trim()
    
    // 태그가 없는 경우 기본 태그 추가
    if (!finalQuery.includes('#')) {
      finalQuery = `${finalQuery}#KR1`
    }
    
    const normalizedQuery = normalizeRiotIdQuery(finalQuery)
    if (!normalizedQuery) return
    
    setShowSuggestions(false)
    setSuggestions([])
    
    // 콜백이 있으면 콜백 호출, 없으면 기본 동작 (페이지 이동)
    if (onSummonerSelect) {
      const [name, tag] = normalizedQuery.split('#')
      onSummonerSelect({ gameName: name, tagLine: tag || 'KR1', fullName: normalizedQuery, suggestion: null })
    } else {
      navigate(`/summoner/${encodeURIComponent(normalizedQuery)}`)
    }
  }

  // 자동완성 항목 클릭 핸들러 (그룹화된 항목용)
  const handleGroupClick = (group) => {
    // 첫 번째 항목을 기본으로 선택
    if (group.items && group.items.length > 0) {
      const firstItem = group.items[0]
      const fullName = `${firstItem.name}#${firstItem.tag}`
      setKeyword(fullName)
      setShowSuggestions(false)
      setSuggestions([])
      
      if (onSummonerSelect) {
        onSummonerSelect({ 
          gameName: firstItem.name, 
          tagLine: firstItem.tag, 
          fullName: fullName, 
          suggestion: firstItem 
        })
      } else {
        setTimeout(() => {
          handleSearch(fullName)
        }, 100)
      }
    }
  }

  // 특정 태그 항목 클릭 핸들러
  const handleTagItemClick = (group, item) => {
    const fullName = `${item.name}#${item.tag}`
    setKeyword(fullName)
    setShowSuggestions(false)
    setSuggestions([])
    
    if (onSummonerSelect) {
      onSummonerSelect({ 
        gameName: item.name, 
        tagLine: item.tag, 
        fullName: fullName, 
        suggestion: item 
      })
    } else {
      setTimeout(() => {
        handleSearch(fullName)
      }, 100)
    }
  }

  // 외부 클릭 시 자동완성 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 같은 이름의 소환사들을 그룹화하는 함수
  const groupByGameName = (data) => {
    const grouped = {}
    data.forEach(item => {
      const name = item.name
      if (!grouped[name]) {
        grouped[name] = {
          name: name,
          items: [],
          totalCount: 0
        }
      }
      grouped[name].items.push(item)
      grouped[name].totalCount++
    })
    return Object.values(grouped)
  }

  // 페이지네이션된 데이터 가져오기
  const getPaginatedSuggestions = () => {
    const startIndex = currentPage * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return suggestions.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(suggestions.length / ITEMS_PER_PAGE)

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className="autocomplete-search-container" style={{ width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={keyword}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        style={{
          fontSize: '18px',
          padding: '0',
          width: '100%',
          background: 'none',
          border: 'none',
          outline: 'none',
          color: 'var(--text-primary)'
        }}
      />
      {loading && <div className="search-loading">검색 중...</div>}
      {rateLimitError && (
        <div className="rate-limit-warning" style={{ 
          padding: '8px 12px', 
          backgroundColor: 'rgba(232, 64, 87, 0.1)', 
          color: 'var(--color-loss)', 
          fontSize: '12px',
          borderRadius: '4px',
          marginTop: '4px',
          border: '1px solid rgba(232, 64, 87, 0.3)'
        }}>
          ⚠️ API 요청 한도 초과로 인해 제한된 결과만 표시됩니다. 잠시 후 다시 시도해주세요.
        </div>
      )}
      
      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="autocomplete-suggestions">
          <div className="suggestions-header">
            Summoner Profiles
            <span className="total-count">(총 {suggestions.length}개)</span>
          </div>
          <div className="suggestions-list">
            {getPaginatedSuggestions().map((group, groupIndex) => {
              const globalIndex = currentPage * ITEMS_PER_PAGE + groupIndex
              const isExpanded = selectedIndex === globalIndex
              
              return (
                <div key={group.name} className="suggestion-group">
                  <div
                    className={`suggestion-item suggestion-group-header ${globalIndex === selectedIndex ? 'selected' : ''}`}
                    onClick={() => {
                      if (isExpanded) {
                        setSelectedIndex(-1)
                      } else {
                        setSelectedIndex(globalIndex)
                      }
                    }}
                  >
                    <div className="suggestion-profile-icon">
                      {group.items[0] && (
                        <img
                          src={`https://ddragon.leagueoflegends.com/cdn/${group.items[0].ddVer || '15.18.1'}/img/profileicon/${group.items[0].profileIconId || 5465}.png`}
                          alt="Profile Icon"
                        />
                      )}
                    </div>
                    <div className="suggestion-content">
                      <div className="suggestion-name">
                        <span className="name-text">{group.name}</span>
                        <span className="tag-count">(총 {group.totalCount}명)</span>
                      </div>
                      <div className="suggestion-details">
                        {group.items[0]?.tier && group.items[0]?.rank && group.items[0]?.lp !== null 
                          ? `${group.items[0].tier} ${group.items[0].rank} - ${group.items[0].lp}LP`
                          : group.items[0]?.level 
                          ? `Level ${group.items[0].level}`
                          : ''
                        }
                      </div>
                    </div>
                    <div className="expand-indicator">
                      {isExpanded ? '▼' : '▶'}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="suggestion-group-items">
                      {group.items.map((item, itemIndex) => (
                        <div
                          key={`${item.name}-${item.tag}-${itemIndex}`}
                          className="suggestion-item suggestion-tag-item"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleTagItemClick(group, item)
                          }}
                        >
                          <div className="suggestion-content">
                            <div className="suggestion-name">
                              <span className="name-text">{item.name}</span>
                              <span className="tag-text">#{item.tag}</span>
                            </div>
                            <div className="suggestion-details">
                              {item.tier && item.rank && item.lp !== null 
                                ? `${item.tier} ${item.rank} - ${item.lp}LP`
                                : item.level 
                                ? `Level ${item.level}`
                                : ''
                              }
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {totalPages > 1 && (
            <div className="suggestions-pagination">
              <button
                className="page-button"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
              >
                이전
              </button>
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i).map(pageNum => (
                  <button
                    key={pageNum}
                    className={`page-number ${pageNum === currentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum + 1}
                  </button>
                ))}
              </div>
              <button
                className="page-button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                다음
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AutocompleteSearch
