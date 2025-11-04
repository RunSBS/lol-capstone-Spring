import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../styles/community.css";

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
      <div className="admin-container admin-access-denied">
        <h2>접근 권한이 없습니다.</h2>
        <p>관리자만 접근할 수 있는 페이지입니다.</p>
        <Link to="/community/free">
          <button className="admin-button">
            커뮤니티로 돌아가기
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h2 className="admin-title">관리자 페이지</h2>
      
      <div className="admin-section">
        <h3 className="admin-section-title">사용자 관리</h3>
        
        <button
          onClick={() => setShowUserList(!showUserList)}
          className="admin-button"
        >
          {showUserList ? "사용자 목록 숨기기" : "사용자 목록 보기"}
        </button>

        {showUserList && (
          <div>
            <h4 className="admin-section-title admin-user-list-title">등록된 사용자 ({users.length}명)</h4>
            <div className="admin-user-list-container">
              {users.map((user, index) => (
                <div
                  key={index}
                  className="user-list-item"
                >
                  <div className="user-info">
                    <span className="user-name-bold">
                      {user.username}
                    </span>
                    {user.username === "admin1" && (
                      <span className="admin-badge">
                        (관리자)
                      </span>
                    )}
                  </div>
                  <div className="user-actions">
                    {user.username !== "admin1" && (
                      <button
                        onClick={() => handleDeleteUser(user.username)}
                        className="user-ban-button"
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

      <div className="admin-section">
        <h3 className="admin-section-title">게시글 관리</h3>
        <p className="admin-section-text">
          게시글 관리 기능은 각 게시글에서 직접 삭제/수정할 수 있습니다.
        </p>
      </div>

      <div className="admin-actions">
        <Link to="/community/free">
          <button className="admin-back-button">
            커뮤니티로 돌아가기
          </button>
        </Link>
      </div>
    </div>
  );
}

export default AdminPage;
