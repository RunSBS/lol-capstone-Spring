// 우측 숙련도 섹션
function MasteryCard({ data }) {
  // 데이터가 없거나 빈 배열인 경우 디폴트 데이터 사용
  const displayData = data && data.length > 0 ? data : []
  return (
    <div className="info-card">
      <h3>숙련도</h3>
      <div className="mastery-champions">
        {displayData.length > 0 ? (
          displayData.map((champ, index) => (
            <div key={index} className="mastery-champion-item">
              <img src={champ.imageUrl} alt={champ.name} />
              <p className="mastery-points">{champ.points} p</p>
            </div>
          ))
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


