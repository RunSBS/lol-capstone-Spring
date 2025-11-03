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

  useEffect(() => {
    loadPostsAndComments();
  }, [category]);

  const loadPostsAndComments = async () => {
    let posts = [];
    if (category === "highrecommend") {
      const categories = ["free", "guide", "lolmuncheol"];
      let allPosts = [];
      for (const cat of categories) {
        const data = await boardApi.getPosts(0, 1000, cat);
        allPosts = allPosts.concat(data.content);
      }
      posts = allPosts
        .filter(post => post.tags && post.tags.includes("highrecommend"))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      const data = await boardApi.getPosts(0, 100, category);
      posts = data.content;
    }

    setPosts(posts);
    setSearching(false);
    setSearchKeyword("");
    setSearchBy("all");

    const counts = {};
    await Promise.all(posts.map(async (post) => {
      counts[post.id] = await commentApi.getCommentCountByPostId(post.id);
    }));
    setCommentCounts(counts);
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      await loadPostsAndComments();
      return;
    }

    if (category === "highrecommend") {
      const categories = ["free", "guide", "lolmuncheol"];
      let allResults = [];
      for (const cat of categories) {
        const res = await boardApi.searchPosts(searchKeyword, cat);
        allResults = allResults.concat(res);
      }
      const filteredPosts = allResults.filter(post => post.tags && post.tags.includes("highrecommend"));
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
              <a href={`/user/${encodeURIComponent(post.writer)}`} target="_blank" rel="noopener noreferrer">{post.writer}</a> · {new Date(post.createdAt).toLocaleString()} · {post.category}
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
              {post.vote && post.vote.results && post.vote.options && (
                <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {post.vote.options.map((option, index) => {
                      const votes = post.vote.results[index] || 0;
                      const totalVotes = Object.values(post.vote.results).reduce((sum, count) => sum + count, 0);
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
                      총 투표: {Object.values(post.vote.results).reduce((sum, count) => sum + count, 0)}표
                    </span>
                  </div>
                </div>
              )}
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
    </div>
  );
}

export default BoardPage;
