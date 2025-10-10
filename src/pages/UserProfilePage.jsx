import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function loadUser(username) {
  const usersJson = localStorage.getItem("users") || "[]";
  const users = JSON.parse(usersJson);
  return users.find(u => u.username === username) || { username, password: "", bio: "", tokens: 0, avatar: "" };
}

function saveUser(user) {
  const usersJson = localStorage.getItem("users") || "[]";
  const users = JSON.parse(usersJson);
  const idx = users.findIndex(u => u.username === user.username);
  if (idx >= 0) users[idx] = user; else users.push(user);
  localStorage.setItem("users", JSON.stringify(users));
}

export default function UserProfilePage() {
  const { username } = useParams();
  const currentUser = localStorage.getItem("currentUser");
  const [user, setUser] = useState(() => loadUser(username));
  const [editing, setEditing] = useState(false);
  const isOwner = currentUser === username;

  useEffect(() => {
    setUser(loadUser(username));
  }, [username]);

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = { ...user, avatar: reader.result };
      setUser(next);
      saveUser(next);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    saveUser(user);
    setEditing(false);
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 20 }}>
      <h2>{username}님의 프로필</h2>
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 12 }}>
        <div>
          {user.avatar ? (
            <img src={user.avatar} alt="avatar" style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: "1px solid #ddd" }} />
          ) : (
            <div style={{ width: 96, height: 96, borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", border: "1px solid #ddd" }}>No Image</div>
          )}
          {isOwner && (
            <div style={{ marginTop: 8 }}>
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: 8 }}>
            <b>닉네임:</b> {user.username}
          </div>
          <div style={{ marginBottom: 8 }}>
            <b>토큰 보유수:</b> {user.tokens || 0}
          </div>
          <div>
            <b>소개글:</b>
            {editing ? (
              <div>
                <textarea
                  value={user.bio || ""}
                  onChange={(e) => setUser(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  style={{ width: "100%", marginTop: 6 }}
                />
                <button onClick={handleSave} style={{ marginTop: 6 }}>저장</button>
                <button onClick={() => setEditing(false)} style={{ marginTop: 6, marginLeft: 6 }}>취소</button>
              </div>
            ) : (
              <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{user.bio || "소개글이 없습니다."}</div>
            )}
          </div>
          {isOwner && !editing && (
            <button onClick={() => setEditing(true)} style={{ marginTop: 10 }}>소개글 수정</button>
          )}
        </div>
      </div>
    </div>
  );
}


