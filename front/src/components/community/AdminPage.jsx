import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function AdminPage({ currentUser, onForceLogout }) {
  const [users, setUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const usersJson = localStorage.getItem("users");
    const usersData = usersJson ? JSON.parse(usersJson) : [];
    setUsers(usersData);
  };

  const handleDeleteUser = (username) => {
    if (window.confirm(`${username} 사용자를 삭제하시겠습니까?`)) {
      const updatedUsers = users.filter(user => user.username !== username);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      
      // 삭제된 사용자가 현재 로그인한 사용자라면 로그아웃 처리
      onForceLogout(username);
      
      alert(`${username} 사용자가 삭제되었습니다.`);
    }
  };


  if (currentUser !== "admin1") {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>접근 권한이 없습니다.</h2>
        <p>관리자만 접근할 수 있는 페이지입니다.</p>
        <Link to="/community/free">
          <button style={{ marginTop: "20px", padding: "10px 20px", backgroundColor: "#5383e8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            커뮤니티로 돌아가기
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px" }}>
      <h2 style={{ color: "#cdd2e2", marginBottom: "30px" }}>관리자 페이지</h2>
      
      <div style={{ backgroundColor: "#282e3e", border: "1px solid #31384c", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
        <h3 style={{ color: "#cdd2e2", marginBottom: "15px" }}>사용자 관리</h3>
        
        <button
          onClick={() => setShowUserList(!showUserList)}
          style={{
            backgroundColor: "#5383e8",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
            marginBottom: "15px"
          }}
        >
          {showUserList ? "사용자 목록 숨기기" : "사용자 목록 보기"}
        </button>

        {showUserList && (
          <div>
            <h4 style={{ color: "#cdd2e2", marginBottom: "10px" }}>등록된 사용자 ({users.length}명)</h4>
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {users.map((user, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    backgroundColor: "#1c202d",
                    border: "1px solid #31384c",
                    borderRadius: "4px",
                    marginBottom: "8px"
                  }}
                >
                  <div>
                    <span style={{ color: "#cdd2e2", fontWeight: "bold" }}>
                      {user.username}
                    </span>
                    {user.username === "admin1" && (
                      <span style={{ color: "#e8a53e", marginLeft: "10px", fontSize: "12px" }}>
                        (관리자)
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {user.username !== "admin1" && (
                      <button
                        onClick={() => handleDeleteUser(user.username)}
                        style={{
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ backgroundColor: "#282e3e", border: "1px solid #31384c", borderRadius: "8px", padding: "20px", marginBottom: "20px" }}>
        <h3 style={{ color: "#cdd2e2", marginBottom: "15px" }}>게시글 관리</h3>
        <p style={{ color: "#9e9eb1", fontSize: "14px" }}>
          게시글 관리 기능은 각 게시글에서 직접 삭제/수정할 수 있습니다.
        </p>
      </div>

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <Link to="/community/free">
          <button style={{
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "10px"
          }}>
            커뮤니티로 돌아가기
          </button>
        </Link>
      </div>
    </div>
  );
}

export default AdminPage;
