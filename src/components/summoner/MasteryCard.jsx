// 우측 숙련도 섹션
function MasteryCard({ data }) {
  return (
    <div className="info-card">
      <h3>숙련도</h3>
      <div className="mastery-champions">
        {data.map((champ, index) => (
          <div key={index} className="mastery-champion-item">
            <img src={champ.imageUrl} alt={champ.name} />
            <p className="mastery-points">{champ.points} p</p>
          </div>
        ))}
      </div>
      <a href="#" className="view-more-link">더 보기 <i className="fa-solid fa-chevron-right"></i></a>
    </div>
  )
}

export default MasteryCard


