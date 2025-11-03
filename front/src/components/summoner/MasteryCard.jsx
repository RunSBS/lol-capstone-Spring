// 우측 숙련도 섹션
import { buildChampionSquareUrl } from '../../data/ddragon.js'
import { useState, useEffect } from 'react'

function MasteryCard({ data }) {
  const [ddVer, setDdVer] = useState('15.18.1')
  
  useEffect(() => {
    // Data Dragon 버전 로드
    fetch('https://ddragon.leagueoflegends.com/api/versions.json')
      .then(res => res.json())
      .then(arr => {
        if (Array.isArray(arr) && arr.length > 0) {
          setDdVer(arr[0])
        }
      })
      .catch(() => {})
  }, [])
  
  // 데이터가 없거나 빈 배열인 경우 디폴트 데이터 사용
  const displayData = data && data.length > 0 ? data : []
  return (
    <div className="info-card">
      <h3>숙련도</h3>
      <div className="mastery-champions">
        {displayData.length > 0 ? (
          displayData.map((champ, index) => {
            const imageUrl = champ.imageUrl || (champ.name ? buildChampionSquareUrl(ddVer, champ.name) : '')
            return (
              <div key={index} className="mastery-champion-item">
                <img src={imageUrl} alt={champ.name || 'Champion'} />
                <p className="mastery-points">{champ.points || '0'} p</p>
              </div>
            )
          })
        ) : (
          <div className="no-data">
            <p>숙련도 데이터가 없습니다.</p>
          </div>
        )}
      </div>
      <a href="#" className="view-more-link">더 보기 <i className="fa-solid fa-chevron-right"></i></a>
    </div>
  )
}

export default MasteryCard


