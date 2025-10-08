function PopularPosts() {
  return (
    <div className="popular-posts" data-name="Left Column - Popular Posts" data-node-id="2:338">
      <p className="popular-title" data-node-id="2:339">OP.GG Talk 인기글</p>
      {[1,2,3,4,5].map((n) => (
        <div key={n} className="popular-item" data-name={`Post Item ${n}`}>
          <p className="popular-rank">{n}</p>
          {n >= 2 && <div className="popular-thumb" />}
          <p className="popular-text">예시 제목 텍스트 [{n * 3}]</p>
          <p className="popular-meta">9시간 전 닉네임</p>
        </div>
      ))}
    </div>
  )
}

export default PopularPosts


