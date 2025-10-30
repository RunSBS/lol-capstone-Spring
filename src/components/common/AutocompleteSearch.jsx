import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAutocompleteKeywords } from '../../data/api.js'
import { normalizeRiotIdQuery } from '../../data/normalize.js'
import { searchAutocompleteMockData } from '../../data/mockData.js'

function AutocompleteSearch({ 
  placeholder = "플레이어 이름 (태그는 자동으로 #KR1이 추가됩니다)"
}) {
  const [keyword, setKeyword] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
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
          } catch (apiError) {
            // API 호출 실패 시 목업 데이터 사용
            data = searchAutocompleteMockData(searchQuery)
          }
          setSuggestions(data)
          setShowSuggestions(true)
          setSelectedIndex(-1)
        } catch (error) {
          // 최종 폴백으로 목업 데이터 사용
          const mockData = searchAutocompleteMockData(query)
          setSuggestions(mockData)
          setShowSuggestions(true)
          setSelectedIndex(-1)
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

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex])
        } else {
          handleSearch(keyword)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
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
    navigate(`/summoner/${encodeURIComponent(normalizedQuery)}`)
  }

  // 자동완성 항목 클릭 핸들러
  const handleSuggestionClick = (suggestion) => {
    // 사용자가 입력한 태그가 있으면 그것을 사용, 없으면 제안된 태그 사용
    let finalTag = suggestion.tag
    if (keyword.includes('#')) {
      const [, userTag] = keyword.split('#')
      if (userTag.trim()) {
        finalTag = userTag.trim().toUpperCase()
      }
    }
    
    const fullName = `${suggestion.name}#${finalTag}`
    setKeyword(fullName)
    setShowSuggestions(false)
    setSuggestions([])
    
    // 자동으로 검색 실행
    setTimeout(() => {
      handleSearch(fullName)
    }, 100)
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

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className="autocomplete-search-container">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={keyword}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      {loading && <div className="search-loading">검색 중...</div>}
      
      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="autocomplete-suggestions">
          <div className="suggestions-header">Summoner Profiles</div>
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => {
              // 사용자가 입력한 태그가 있으면 그것을 표시, 없으면 제안된 태그 표시
              let displayTag = suggestion.tag
              if (keyword.includes('#')) {
                const [, userTag] = keyword.split('#')
                if (userTag.trim()) {
                  displayTag = userTag.trim().toUpperCase()
                }
              }
              
              return (
                <div
                  key={suggestion.id}
                  className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="suggestion-profile-icon">
                    <img
                      src={`https://ddragon.leagueoflegends.com/cdn/${suggestion.ddVer}/img/profileicon/${suggestion.profileIconId}.png`}
                      alt="Profile Icon"
                    />
                  </div>
                  <div className="suggestion-content">
                    <div className="suggestion-name">
                      <span className="name-text">{suggestion.name}</span>
                      <span className="tag-text">#{displayTag}</span>
                    </div>
                    <div className="suggestion-details">
                      {suggestion.tier && suggestion.rank && suggestion.lp !== null 
                        ? `${suggestion.tier} ${suggestion.rank} - ${suggestion.lp}LP`
                        : suggestion.level 
                        ? `Level ${suggestion.level}`
                        : ''
                      }
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default AutocompleteSearch
