import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import BoardPage from "../components/community/BoardPage";
import PostDetailPage from "../components/community/PostDetailPage";
import WritePost from "../components/community/WritePost";
import Login from "../components/community/Login";
import Register from "../components/community/Register";
import AdminPage from "../components/community/AdminPage";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

function initializeAdminAccount() {
  const usersJson = localStorage.getItem("users");
  const users = usersJson ? JSON.parse(usersJson) : [];
  const adminExists = users.some((u) => u.username === "admin1");
  if (!adminExists) {
    users.push({ username: "admin1", password: "1234" });
    localStorage.setItem("users", JSON.stringify(users));
  }
}

function CommunityPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() =>
    localStorage.getItem("currentUser")
  );
  const [showRegister, setShowRegister] = useState(false);
  const adminId = "admin1";

  useEffect(() => {
    initializeAdminAccount();
    const stored = localStorage.getItem("currentUser");
    if (stored) setCurrentUser(stored);
  }, []);

  const handleLogin = (username) => setCurrentUser(username);
  const toggleRegister = () => setShowRegister((prev) => !prev);

  const handleForceLogout = (username) => {
    if (username === currentUser) {
      alert("본인이 강제 탈퇴 당했습니다. 로그아웃 처리 됩니다.");
      localStorage.removeItem("currentUser");
      setCurrentUser(null);
    }
  };

  // 현재 경로에 따라 렌더링할 컴포넌트 결정
  const renderContent = () => {
    const path = location.pathname;
    
    if (path === '/community/login') {
      return showRegister ? (
        <Register onRegister={toggleRegister} />
      ) : (
        <Login onLogin={handleLogin} onShowRegister={toggleRegister} />
      );
    }
    
    if (path === '/community/register') {
      return <Register onRegister={() => setShowRegister(false)} />;
    }
    
    if (path === '/community/admin') {
      return <AdminPage currentUser={currentUser} onForceLogout={handleForceLogout} />;
    }
    
    if (path === '/community/write') {
      return <WritePost currentUser={currentUser} />;
    }
    
    if (path.startsWith('/community/post/')) {
      const id = path.split('/')[3];
      return <PostDetailPage currentUser={currentUser} adminId={adminId} postId={id} />;
    }
    
    // 게시판 목록
    if (path === '/community') {
      return <BoardPage category="all" />;
    }
    if (path === '/community/free') {
      return <BoardPage category="free" />;
    }
    
    if (path === '/community/guide') {
      return <BoardPage category="guide" />;
    }
    
    if (path === '/community/lolmuncheol') {
      return <BoardPage category="lolmuncheol" />;
    }
    
    if (path === '/community/highrecommend') {
      return <BoardPage category="highrecommend" />;
    }
    
    // 기본값: 자유게시판
    return <BoardPage category="free" />;
  };

  return (
    <>
      <Header />
      <nav
          style={{
            maxWidth: 1080,
            margin: "20px auto",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            {currentUser ? (
              <Link to="/community/write">
                <button>글쓰기</button>
              </Link>
            ) : (
              <button disabled title="로그인 후 이용 가능">
                글쓰기
              </button>
            )}
          </div>

          <div>
            {currentUser === adminId && (
              <>
                <Link to="/community/admin">
                  <button style={{ marginLeft: 10, backgroundColor: "#e8a53e", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}>
                    관리자 페이지
                  </button>
                </Link>
                <span style={{ marginLeft: 20, color: "#444" }}>
                  관리자 권한
                </span>
              </>
            )}
          </div>
        </nav>

        <hr style={{ marginBottom: 20 }} />

        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
          {renderContent()}
        </div>
      <Footer />
    </>
  );
}

export default CommunityPage;


