import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import StickerShop from "../components/common/StickerShop";
import StickerInventory from "../components/common/StickerInventory";
import StickerBanner from "../components/common/StickerBanner";
import backendApi from "../data/backendApi";
import { 
  purchaseSticker, 
  useSticker, 
  removeStickerFromBanner, 
  deleteSticker,
  addStickerToBanner,
  removeStickerFromBannerById,
  updateBannerSticker
} from "../utils/stickerUtils";
import { BORDER_ITEM_CODES, BANNER_ITEM_CODES, getStickerItemCode, getFrontendIdFromItemCode } from "../utils/shopItemMapper";

function loadUser(username) {
  const usersJson = localStorage.getItem("users") || "[]";
  const users = JSON.parse(usersJson);
  const user = users.find(u => u.username === username) || { username, password: "", bio: "", tokens: 0, avatar: "" };
  
  // admin1 계정의 토큰을 9999로 설정
  if (username === "admin1") {
    user.tokens = 9999;
  }
  
  // 기본 테두리 설정 (모든 유저에게 공짜로 지급)
  if (!user.borders) {
    user.borders = ["default"];
  }
  
  // 현재 선택된 테두리 설정
  if (!user.currentBorder) {
    user.currentBorder = "default";
  }
  
  return user;
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
  const [showBorderShop, setShowBorderShop] = useState(false);
  const [borderFilter, setBorderFilter] = useState('all'); // all | owned | unowned
  const [showBannerShop, setShowBannerShop] = useState(false);
  const [bannerFilter, setBannerFilter] = useState('all'); // all | owned | unowned
  const [showStickerShop, setShowStickerShop] = useState(false);
  const [showStickerInventory, setShowStickerInventory] = useState(false);
  const [selectedStickerId, setSelectedStickerId] = useState(null);
  const [selectedStickerImageUrl, setSelectedStickerImageUrl] = useState(null);
  const [isStickerEditMode, setIsStickerEditMode] = useState(false);
  const isOwner = currentUser === username;

  // 테두리 상점 데이터
  const borderShop = [
    { id: "default", name: "기본 테두리", price: 0, description: "기본 프로필 테두리", owned: true },
    { id: "gold", name: "골드 테두리", price: 100, description: "화려한 골드 테두리", owned: false },
    { id: "silver", name: "실버 테두리", price: 50, description: "우아한 실버 테두리", owned: false },
    { id: "rainbow", name: "무지개 테두리", price: 200, description: "화려한 무지개 테두리", owned: false },
    { id: "diamond", name: "다이아몬드 테두리", price: 500, description: "고급 다이아몬드 테두리", owned: false },
    { id: "fire", name: "불꽃 테두리", price: 300, description: "타오르는 불꽃 테두리", owned: false },
    { id: "ice", name: "차가운 얼음 테두리", price: 250, description: "차가운 얼음 테두리", owned: false },
    { id: "lightning", name: "번개 테두리", price: 400, description: "번개가 치는 테두리", owned: false }
  ];

  // 배너 상점 데이터 (리그 오브 레전드 스플래시아트)
  const bannerShop = [
    { 
      id: "default", 
      name: "기본 배너", 
      price: 0, 
      description: "기본 프로필 배너", 
      image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg",
      owned: true 
    },
    { 
      id: "ahri", 
      name: "아리 배너", 
      price: 200, 
      description: "구미호 아리의 매혹적인 배너", 
      image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg",
      owned: false 
    },
    { 
      id: "yasuo", 
      name: "야스오 배너", 
      price: 250, 
      description: "바람검사 야스오의 배너", 
      image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Yasuo_0.jpg",
      owned: false 
    },
    { 
      id: "jinx", 
      name: "징크스 배너", 
      price: 180, 
      description: "폭주하는 징크스의 배너", 
      image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg",
      owned: false 
    },
    { 
      id: "thresh", 
      name: "쓰레쉬 배너", 
      price: 300, 
      description: "사슬 감옥수 쓰레쉬의 배너", 
      image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Thresh_0.jpg",
      owned: false 
    },
    { 
      id: "zed", 
      name: "제드 배너", 
      price: 280, 
      description: "그림자 단 제드의 배너", 
      image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Zed_0.jpg",
      owned: false 
    },
    { 
      id: "lux", 
      name: "럭스 배너", 
      price: 150, 
      description: "빛의 소녀 럭스의 배너", 
      image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg",
      owned: false 
    },
    { 
      id: "darius", 
      name: "다리우스 배너", 
      price: 220, 
      description: "녹서스의 손 다리우스의 배너", 
      image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Darius_0.jpg",
      owned: false 
    }
  ];
  useEffect(() => {
    loadUserData();
  }, [username]);

  const loadUserData = async () => {
    // 먼저 로컬 스토리지에서 사용자 로드
    const localUser = loadUser(username);
    setUser(localUser);
    
    // 현재 사용자가 본인이고 로그인된 상태라면 백엔드에서 데이터 가져오기
    const currentLoggedInUser = localStorage.getItem("currentUser");
    if (currentLoggedInUser === username) {
      try {
        const userInfo = await backendApi.getCurrentUser();
        const [myItems, bannerStickerList] = await Promise.all([
          backendApi.getMyItems(),
          backendApi.getBannerStickers().catch(() => [])
        ]);
        
        
        if (userInfo && userInfo.username === username) {
          // 백엔드 데이터를 프론트엔드 형식으로 변환
          const borders = [];
          const banners = [];
          const stickers = {};
          
          myItems.forEach(item => {
            const itemCode = item.shopItem?.itemCode;
            const itemType = item.shopItem?.itemType;
            
            if (itemType === 'BORDER') {
              const borderId = getFrontendIdFromItemCode(itemCode);
              if (!borders.includes(borderId)) {
                borders.push(borderId);
              }
            } else if (itemType === 'BANNER') {
              const bannerId = getFrontendIdFromItemCode(itemCode);
              if (!banners.includes(bannerId)) {
                banners.push(bannerId);
              }
            } else if (itemType === 'STICKER') {
              const stickerId = getFrontendIdFromItemCode(itemCode);
              stickers[stickerId] = (stickers[stickerId] || 0) + item.quantity;
            }
          });

          // 배너 스티커를 프론트 포맷으로 변환
          // 백엔드: positionX/Y (0~1), width/height (px), rotation (0~360)
          // 프론트: x/y (0~100), scale (0.5~2), rotation (0~360)
          const bannerStickers = Array.isArray(bannerStickerList) ? bannerStickerList.map(bs => {
            const itemCode = bs.shopItem?.itemCode;
            const stickerId = itemCode ? getFrontendIdFromItemCode(itemCode) : (bs.stickerId || undefined);
            const image = bs.shopItem?.imageUrl || null;
            const baseSize = 32; // 기본 스티커 크기 (px)
            // width 또는 height를 scale로 변환 (둘 중 큰 값 사용)
            const scale = bs.width && bs.height ? Math.max(bs.width, bs.height) / baseSize : 1;
            return {
              id: bs.id,
              stickerId,
              image,
              x: (bs.positionX || 0) * 100, // 0~1 → 0~100
              y: (bs.positionY || 0) * 100, // 0~1 → 0~100
              scale: Math.max(0.5, Math.min(2, scale)), // 사이즈 제한
              rotation: bs.rotation || 0,
              zIndex: 1
            };
          }) : [];
          
          // 토큰 잔액 처리: 0도 유효한 값이므로 != null 체크
          const tokenBalance = (userInfo.tokenBalance != null && userInfo.tokenBalance !== undefined) 
            ? Number(userInfo.tokenBalance) 
            : localUser.tokens;
          
          setUser(prev => ({
            ...prev,
            tokens: tokenBalance,
            borders: borders.length > 0 ? borders : prev.borders,
            banners: banners.length > 0 ? banners : prev.banners,
            stickers: Object.keys(stickers).length > 0 ? { ...prev.stickers, ...stickers } : prev.stickers,
            bannerStickers: bannerStickers.length > 0 ? bannerStickers : (prev.bannerStickers || []),
            bio: userInfo.bio || prev.bio || "",
            avatar: userInfo.avatarUrl || prev.avatar || "",
            tier: userInfo.tier || prev.tier || "",
            mainChampion: userInfo.mainChampion || prev.mainChampion || ""
          }));
        }
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error.message);
      }
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    // 파일 크기 확인 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert("프로필 이미지는 5MB 이하만 업로드 가능합니다.");
      return;
    }
    
    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }
    
    try {
      // 먼저 미리보기를 위해 로컬 이미지 표시
      const reader = new FileReader();
      reader.onload = async () => {
        const previewUrl = reader.result;
        setUser(prev => ({ ...prev, avatar: previewUrl }));
        
        // 백엔드에 파일 업로드
        try {
          const uploadResult = await backendApi.uploadMedia(file);
          const avatarUrl = uploadResult.url;
          
          // 백엔드에 프로필 업데이트
          await backendApi.updateProfile(undefined, avatarUrl);
          
          // 로컬 상태 업데이트
          setUser(prev => ({ ...prev, avatar: avatarUrl }));
          saveUser({ ...user, avatar: avatarUrl });
          
          alert("프로필 이미지가 업데이트되었습니다.");
        } catch (uploadError) {
          console.error('프로필 이미지 업로드 실패:', uploadError);
          alert("프로필 이미지 업로드에 실패했습니다. 다시 시도해주세요.");
          // 업로드 실패 시 이전 상태로 복구
          const currentLoggedInUser = localStorage.getItem("currentUser");
          if (currentLoggedInUser === username) {
            try {
              const userInfo = await backendApi.getCurrentUser();
              setUser(prev => ({ ...prev, avatar: userInfo.avatarUrl || prev.avatar || "" }));
            } catch (error) {
              // 복구 실패 시 로컬 스토리지에서 가져오기
              const localUser = loadUser(username);
              setUser(prev => ({ ...prev, avatar: localUser.avatar || "" }));
            }
          }
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('프로필 이미지 처리 실패:', error);
      alert("프로필 이미지 업로드에 실패했습니다.");
    }
  };

  const handleSave = async () => {
    const currentLoggedInUser = localStorage.getItem("currentUser");
    
    // 로그인된 사용자이면 백엔드에 저장
    if (currentLoggedInUser === username) {
      try {
        await backendApi.updateProfile(user.bio, undefined, user.tier, user.mainChampion);
        // 백엔드에서 업데이트된 사용자 정보 가져오기
        const userInfo = await backendApi.getCurrentUser();
        setUser(prev => ({
          ...prev,
          bio: userInfo.bio || prev.bio || "",
          tier: userInfo.tier || prev.tier || "",
          mainChampion: userInfo.mainChampion || prev.mainChampion || ""
        }));
        saveUser({ 
          ...user, 
          bio: userInfo.bio || user.bio || "",
          tier: userInfo.tier || user.tier || "",
          mainChampion: userInfo.mainChampion || user.mainChampion || ""
        });
        alert("프로필이 저장되었습니다.");
        setEditing(false);
      } catch (error) {
        console.error('프로필 저장 실패:', error);
        alert("프로필 저장에 실패했습니다: " + (error.message || "알 수 없는 오류"));
      }
    } else {
      // 로컬 스토리지에만 저장 (비로그인 사용자)
      saveUser(user);
      setEditing(false);
    }
  };

  // 테두리 구매 함수
  const buyBorder = async (borderId) => {
    const border = borderShop.find(b => b.id === borderId);
    if (!border) return;
    
    if (user.tokens < border.price) {
      alert("토큰이 부족합니다!");
      return;
    }
    
    try {
      const itemCode = BORDER_ITEM_CODES[borderId] || `border_${borderId}`;
      const result = await backendApi.purchaseItem(itemCode, 1);
      
      // 백엔드에서 업데이트된 사용자 정보 가져오기
      const userInfo = await backendApi.getCurrentUser();
      const myItems = await backendApi.getMyItems();
      
      // 백엔드 데이터에서 borders 배열 재구성
      const borders = [];
      myItems.forEach(item => {
        if (item.shopItem?.itemType === 'BORDER') {
          const id = getFrontendIdFromItemCode(item.shopItem.itemCode);
          if (!borders.includes(id)) {
            borders.push(id);
          }
        }
      });
      
      const updatedUser = {
        ...user,
        tokens: userInfo?.tokenBalance != null ? userInfo.tokenBalance : (result.remainingTokens != null ? result.remainingTokens : user.tokens - border.price),
        borders: borders.length > 0 ? borders : [...(user.borders || []), borderId]
      };
      
      setUser(updatedUser);
      saveUser(updatedUser);
      alert(`${border.name}을(를) 구매했습니다!`);
      } catch (error) {
        alert(error.message || "구매 중 오류가 발생했습니다.");
      }
  };

  // 테두리 적용 함수
  const applyBorder = async (borderId) => {
    if (!user.borders || !user.borders.includes(borderId)) {
      alert("보유하지 않은 테두리입니다!");
      return;
    }
    
    try {
      // 백엔드에서 내 아이템 조회
      const myItems = await backendApi.getMyItems();
      const itemCode = BORDER_ITEM_CODES[borderId] || `border_${borderId}`;
      
      // 해당 아이템 찾기
      const userItem = myItems.find(item => item.shopItem?.itemCode === itemCode);
      if (userItem) {
        // 다른 BORDER 타입 아이템 해제 후 이 아이템 장착
        const borderItems = myItems.filter(item => item.shopItem?.itemType === 'BORDER');
        for (const item of borderItems) {
          if (item.id !== userItem.id && item.isEquipped) {
            await backendApi.equipItem(item.id, false);
          }
        }
        await backendApi.equipItem(userItem.id, true);
      }
      
      const updatedUser = {
        ...user,
        currentBorder: borderId
      };
      
      setUser(updatedUser);
      saveUser(updatedUser);
      alert("테두리가 적용되었습니다!");
    } catch (error) {
      console.error('테두리 적용 실패:', error);
      // 백엔드 연동 실패 시 로컬만 업데이트
      const updatedUser = {
        ...user,
        currentBorder: borderId
      };
      setUser(updatedUser);
      saveUser(updatedUser);
      alert("테두리가 적용되었습니다!");
    }
  };

  // 배너 구매 함수
  const buyBanner = async (bannerId) => {
    const banner = bannerShop.find(b => b.id === bannerId);
    if (!banner) return;
    
    if (user.tokens < banner.price) {
      alert("토큰이 부족합니다!");
      return;
    }
    
    try {
      const itemCode = BANNER_ITEM_CODES[bannerId] || `banner_${bannerId}`;
      const result = await backendApi.purchaseItem(itemCode, 1);
      
      // 백엔드에서 업데이트된 사용자 정보 가져오기
      const userInfo = await backendApi.getCurrentUser();
      const myItems = await backendApi.getMyItems();
      
      // 백엔드 데이터에서 banners 배열 재구성
      const banners = [];
      myItems.forEach(item => {
        if (item.shopItem?.itemType === 'BANNER') {
          const id = getFrontendIdFromItemCode(item.shopItem.itemCode);
          if (!banners.includes(id)) {
            banners.push(id);
          }
        }
      });
      
      const updatedUser = {
        ...user,
        tokens: userInfo?.tokenBalance != null ? userInfo.tokenBalance : (result.remainingTokens != null ? result.remainingTokens : user.tokens - banner.price),
        banners: banners.length > 0 ? banners : [...(user.banners || []), bannerId]
      };
      
      setUser(updatedUser);
      saveUser(updatedUser);
      alert(`${banner.name}을(를) 구매했습니다!`);
    } catch (error) {
      console.error('배너 구매 실패:', error);
      alert(error.message || "구매 중 오류가 발생했습니다.");
    }
  };

  // 배너 적용 함수
  const applyBanner = async (bannerId) => {
    if (!user.banners || !user.banners.includes(bannerId)) {
      alert("보유하지 않은 배너입니다!");
      return;
    }
    
    try {
      // 백엔드에서 내 아이템 조회
      const myItems = await backendApi.getMyItems();
      const itemCode = BANNER_ITEM_CODES[bannerId] || `banner_${bannerId}`;
      
      // 해당 아이템 찾기
      const userItem = myItems.find(item => item.shopItem?.itemCode === itemCode);
      if (userItem) {
        // 다른 BANNER 타입 아이템 해제 후 이 아이템 장착
        const bannerItems = myItems.filter(item => item.shopItem?.itemType === 'BANNER');
        for (const item of bannerItems) {
          if (item.id !== userItem.id && item.isEquipped) {
            await backendApi.equipItem(item.id, false);
          }
        }
        await backendApi.equipItem(userItem.id, true);
      }
      
      const updatedUser = {
        ...user,
        currentBanner: bannerId
      };
      
      setUser(updatedUser);
      saveUser(updatedUser);
      alert("배너가 적용되었습니다!");
    } catch (error) {
      console.error('배너 적용 실패:', error);
      // 백엔드 연동 실패 시 로컬만 업데이트
      const updatedUser = {
        ...user,
        currentBanner: bannerId
      };
      setUser(updatedUser);
      saveUser(updatedUser);
      alert("배너가 적용되었습니다!");
    }
  };

  // 스티커 구매 함수
  const handleStickerPurchase = async (sticker) => {
    try {
      const itemCode = getStickerItemCode(sticker.id);
      const result = await backendApi.purchaseItem(itemCode, 1);
      
      // 백엔드에서 업데이트된 사용자 정보 가져오기
      const userInfo = await backendApi.getCurrentUser();
      const myItems = await backendApi.getMyItems();
      
      // 백엔드 데이터에서 stickers 객체 재구성
      const stickers = { ...user.stickers };
      myItems.forEach(item => {
        if (item.shopItem?.itemType === 'STICKER') {
          const stickerId = getFrontendIdFromItemCode(item.shopItem.itemCode);
          stickers[stickerId] = item.quantity;
        }
      });
      
      // 백엔드 연동 성공
      const updatedUser = {
        ...user,
        tokens: userInfo?.tokenBalance != null ? userInfo.tokenBalance : (result.remainingTokens != null ? result.remainingTokens : user.tokens - sticker.price),
        stickers: stickers
      };
      
      setUser(updatedUser);
      saveUser(updatedUser);
      alert(`${sticker.name} 스티커를 구매했습니다!`);
    } catch (error) {
      console.error('스티커 구매 실패:', error);
      // 백엔드 연동 실패 시 기존 로컬 로직 사용
      try {
        const updatedUser = purchaseSticker(user, sticker, (newUser) => {
          setUser(newUser);
          saveUser(newUser);
        });
        alert(`${sticker.name} 스티커를 구매했습니다!`);
      } catch (localError) {
        alert(localError.message || error.message);
      }
    }
  };

  // 스티커 인벤토리에서 선택
  const handleStickerInventory = (sticker) => {
    setSelectedStickerId(sticker.id);
    setSelectedStickerImageUrl(sticker.image || null);
    setIsStickerEditMode(true);
  };

  // 스티커를 배너에 추가
  const handleStickerAdd = async (sticker) => {
    try {
      
      const itemCode = getStickerItemCode(sticker.stickerId || sticker.id);
      
      // 프론트엔드 형식(x, y, scale)을 백엔드 형식(positionX, positionY, width, height)으로 변환
      const baseSize = 32; // 기본 스티커 크기 (px)
      const positionX = (sticker.x || 50) / 100; // 0~100 → 0~1
      const positionY = (sticker.y || 50) / 100; // 0~100 → 0~1
      const stickerScale = sticker.scale || 1;
      const width = baseSize * stickerScale;
      const height = baseSize * stickerScale;
      
      // 백엔드 API로 스티커 부착
      const bannerSticker = await backendApi.addStickerToBanner(
        itemCode,
        positionX,
        positionY,
        width,
        height,
        sticker.rotation || 0
      );
      
      // 백엔드 연동 성공 - 백엔드 응답을 프론트엔드 형식으로 변환
      const responseScale = bannerSticker.width && bannerSticker.height ? 
        Math.max(bannerSticker.width, bannerSticker.height) / baseSize : 1;
      const updatedUser = {
        ...user,
        bannerStickers: [...(user.bannerStickers || []), {
          id: bannerSticker.id,
          stickerId: sticker.stickerId || sticker.id,
          image: sticker.image,
          x: (bannerSticker.positionX || 0) * 100, // 0~1 → 0~100
          y: (bannerSticker.positionY || 0) * 100, // 0~1 → 0~100
          scale: Math.max(0.5, Math.min(2, responseScale)),
          rotation: bannerSticker.rotation || 0,
          zIndex: (user.bannerStickers?.length || 0) + 1
        }],
        stickers: {
          ...user.stickers,
          [sticker.stickerId || sticker.id]: Math.max(0, (user.stickers?.[sticker.stickerId || sticker.id] || 0) - 1)
        }
      };
      
      setUser(updatedUser);
      saveUser(updatedUser);
      
      setSelectedStickerId(null);
      setIsStickerEditMode(false);
      
    } catch (error) {
      // 백엔드 연동 실패 시 로컬 로직 사용
      try {
        const userAfterUse = useSticker(user, sticker.stickerId || sticker.id, () => {});
        
        const updatedUser = {
          ...userAfterUse,
          bannerStickers: [...(userAfterUse.bannerStickers || []), sticker]
        };
        
        setUser(updatedUser);
        saveUser(updatedUser);
        
        setSelectedStickerId(null);
        setIsStickerEditMode(false);
      } catch (localError) {
        alert(localError.message || error.message);
      }
    }
  };

  // 배너 스티커 업데이트
  const handleStickerUpdate = async (updatedSticker) => {
    try {
      // 백엔드 API로 스티커 위치 업데이트
      if (updatedSticker.id) {
        // 프론트엔드 형식(x, y, scale, rotation)을 백엔드 형식(positionX, positionY, width, height, rotation)으로 변환
        const baseSize = 32; // 기본 스티커 크기 (px)
        const positionX = (updatedSticker.x || 0) / 100; // 0~100 → 0~1
        const positionY = (updatedSticker.y || 0) / 100; // 0~100 → 0~1
        const scale = updatedSticker.scale || 1;
        const width = baseSize * scale;
        const height = baseSize * scale;
        const rotation = updatedSticker.rotation || 0;
        
        await backendApi.updateBannerSticker(
          updatedSticker.id,
          positionX,
          positionY,
          width,
          height,
          rotation
        );
      }
      
      // 백엔드 연동 성공
      updateBannerSticker(user, updatedSticker, (newUser) => {
        setUser(newUser);
        saveUser(newUser);
      });
    } catch (error) {
      console.error('스티커 위치 업데이트 실패:', error);
      // 백엔드 연동 실패 시 로컬만 업데이트
      updateBannerSticker(user, updatedSticker, (newUser) => {
        setUser(newUser);
        saveUser(newUser);
      });
    }
  };

  // 배너에서 스티커 제거
  const handleStickerRemove = async (stickerId) => {
    try {
      const sticker = user.bannerStickers?.find(s => s.id === stickerId);
      
      // 백엔드 API로 스티커 제거 (백엔드에서 자동으로 수량 복구하지 않음)
      if (sticker?.id) {
        await backendApi.removeStickerFromBanner(sticker.id);
      }
      
      // 백엔드 연동 성공 - 로컬에서도 제거
      removeStickerFromBannerById(user, stickerId, (newUser) => {
        setUser(newUser);
        saveUser(newUser);
      });
    } catch (error) {
      console.error('스티커 제거 실패:', error);
      // 백엔드 연동 실패 시 로컬만 업데이트
      const sticker = user.bannerStickers?.find(s => s.id === stickerId);
      if (sticker) {
        removeStickerFromBanner(user, sticker.stickerId, (newUser) => {
          setUser(newUser);
          saveUser(newUser);
        });
      }
      removeStickerFromBannerById(user, stickerId, (newUser) => {
        setUser(newUser);
        saveUser(newUser);
      });
    }
  };

  // 스티커 인벤토리에서 삭제
  const handleStickerDelete = (stickerId) => {
    try {
      deleteSticker(user, stickerId, (newUser) => {
        setUser(newUser);
        saveUser(newUser);
      });
      alert("스티커가 삭제되었습니다!");
    } catch (error) {
      alert(error.message);
    }
  };

  // 테두리 스타일 가져오기
  const getBorderStyle = (borderId) => {
    const styles = {
      default: { border: "3px solid var(--border-color)" },
      gold: { border: "3px solid #ffd700", boxShadow: "0 0 10px #ffd700" },
      silver: { border: "3px solid #c0c0c0", boxShadow: "0 0 8px #c0c0c0" },
      rainbow: { 
        border: "3px solid transparent",
        background: "linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3) border-box",
        WebkitBackgroundClip: "border-box"
      },
      diamond: { border: "3px solid #b9f2ff", boxShadow: "0 0 15px #b9f2ff" },
      fire: { border: "3px solid #ff4500", boxShadow: "0 0 12px #ff4500" },
      ice: { border: "3px solid #87ceeb", boxShadow: "0 0 10px #87ceeb" },
      lightning: { border: "3px solid #ffff00", boxShadow: "0 0 15px #ffff00" }
    };
    return styles[borderId] || styles.default;
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <Link 
          to="/" 
          style={{ 
            textDecoration: "none",
            marginRight: 15,
            padding: "8px 12px",
            backgroundColor: "var(--card-bg-light)",
            border: "1px solid var(--border-light)",
            borderRadius: "4px",
            color: "var(--text-primary)",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "5px"
          }}
        >
          ← 홈으로
        </Link>
        <h2 style={{ margin: 0, color: "var(--text-primary)" }}>{username}님의 프로필</h2>
      </div>
      
      {/* 배너 배경 */}
      <div style={{ marginBottom: "20px" }}>
        <StickerBanner
          bannerImage={bannerShop.find(b => b.id === (user.currentBanner || "default"))?.image}
          stickers={user.bannerStickers || []}
          onStickerAdd={handleStickerAdd}
          onStickerUpdate={handleStickerUpdate}
          onStickerRemove={handleStickerRemove}
          selectedStickerId={selectedStickerId}
          selectedStickerImageUrl={selectedStickerImageUrl}
          isEditMode={isStickerEditMode}
        />
        
        {/* 프로필 정보 */}
        <div style={{ 
          position: "relative", 
          zIndex: 1, 
          display: "flex", 
          gap: 16, 
          alignItems: "center",
          marginTop: "20px",
          padding: "20px",
          backgroundColor: "var(--card-bg-light)",
          border: "1px solid var(--border-light)",
          borderRadius: "12px",
          color: "var(--text-primary)"
        }}>
          <div>
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt="avatar" 
                style={{ 
                  width: 96, 
                  height: 96, 
                  borderRadius: "50%", 
                  objectFit: "cover", 
                  ...getBorderStyle(user.currentBorder || "default")
                }} 
              />
            ) : (
              <div 
                style={{ 
                  width: 96, 
                  height: 96, 
                  borderRadius: "50%", 
                  background: "var(--card-bg-lighter)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  color: "var(--text-tertiary)", 
                  ...getBorderStyle(user.currentBorder || "default")
                }}
              >
                No Image
              </div>
            )}
            {isOwner && (
              <div style={{ marginTop: 8 }}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange}
                  style={{
                    fontSize: "12px",
                    color: "var(--text-primary)"
                  }}
                />
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 8, color: "var(--text-primary)" }}>
              <b>닉네임:</b> {user.username}
            </div>
            <div style={{ marginBottom: 8, color: "var(--text-primary)" }}>
              <b>토큰 보유수:</b> {user.tokens || 0}
            </div>
            {user.tier && (
              <div style={{ marginBottom: 8, color: "var(--text-primary)" }}>
                <b>티어:</b> {user.tier}
              </div>
            )}
            {user.mainChampion && (
              <div style={{ marginBottom: 8, color: "var(--text-primary)" }}>
                <b>주 챔피언:</b> {user.mainChampion}
              </div>
            )}
            <div style={{ color: "var(--text-primary)" }}>
              <b>소개글:</b>
              {editing ? (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", marginBottom: 4, color: "var(--text-primary)" }}>티어:</label>
                    <select
                      value={user.tier || ""}
                      onChange={(e) => setUser(prev => ({ ...prev, tier: e.target.value }))}
                      style={{ 
                        width: "100%", 
                        padding: "6px 8px",
                        color: "var(--text-primary)",
                        backgroundColor: "var(--input-bg)",
                        border: "1px solid var(--input-border)",
                        borderRadius: "4px"
                      }}
                    >
                      <option value="">선택 안 함</option>
                      <option value="IRON">아이언</option>
                      <option value="BRONZE">브론즈</option>
                      <option value="SILVER">실버</option>
                      <option value="GOLD">골드</option>
                      <option value="PLATINUM">플래티넘</option>
                      <option value="EMERALD">에메랄드</option>
                      <option value="DIAMOND">다이아몬드</option>
                      <option value="MASTER">마스터</option>
                      <option value="GRANDMASTER">그랜드마스터</option>
                      <option value="CHALLENGER">챌린저</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", marginBottom: 4, color: "var(--text-primary)" }}>주 챔피언:</label>
                    <input
                      type="text"
                      value={user.mainChampion || ""}
                      onChange={(e) => setUser(prev => ({ ...prev, mainChampion: e.target.value }))}
                      placeholder="예: Yasuo, Zed, Ahri"
                      style={{ 
                        width: "100%", 
                        padding: "6px 8px",
                        color: "var(--text-primary)",
                        backgroundColor: "var(--input-bg)",
                        border: "1px solid var(--input-border)",
                        borderRadius: "4px"
                      }}
                    />
                  </div>
                  <textarea
                    value={user.bio || ""}
                    onChange={(e) => setUser(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    style={{ 
                      width: "100%", 
                      marginTop: 6, 
                      color: "var(--text-primary)",
                      backgroundColor: "var(--input-bg)",
                      border: "1px solid var(--input-border)",
                      borderRadius: "4px",
                      padding: "8px",
                      fontSize: "14px"
                    }}
                  />
                  <button 
                    onClick={handleSave} 
                    style={{ 
                      marginTop: 6,
                      padding: "6px 12px",
                      backgroundColor: "var(--color-primary)",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    저장
                  </button>
                  <button 
                    onClick={() => setEditing(false)} 
                    style={{ 
                      marginTop: 6, 
                      marginLeft: 6,
                      padding: "6px 12px",
                      backgroundColor: "var(--card-bg-lighter)",
                      color: "var(--text-primary)",
                      border: "1px solid var(--border-light)",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    취소
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: 6, whiteSpace: "pre-wrap", color: "var(--text-tertiary)" }}>{user.bio || "소개글이 없습니다."}</div>
              )}
            </div>
            {isOwner && !editing && (
              <button 
                onClick={() => setEditing(true)} 
                style={{ 
                  marginTop: 10,
                  padding: "6px 12px",
                  backgroundColor: "#5383e8",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                소개글 수정
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 테두리 상점 */}
      {isOwner && (
        <div style={{ marginTop: 30, border: "1px solid var(--border-light)", borderRadius: 8, padding: 20, backgroundColor: "var(--card-bg-light)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ color: "var(--text-primary)", margin: 0 }}>프로필 테두리 상점</h3>
            <button 
              onClick={() => setShowBorderShop(!showBorderShop)}
              style={{ 
                padding: "8px 16px", 
                backgroundColor: showBorderShop ? "var(--color-danger)" : "var(--color-primary)", 
                color: "white", 
                border: "none", 
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              {showBorderShop ? "상점 닫기" : "상점 열기"}
            </button>
          </div>

          {showBorderShop && (
            <div>
              <div style={{ marginBottom: 15, padding: 10, backgroundColor: "var(--card-bg-lighter)", borderRadius: 4, color: "var(--text-primary)" }}>
                <strong>보유 토큰: {user.tokens}개</strong>
              </div>
              {/* 보유 필터 */}
              <div style={{ display: "flex", gap: 8, marginBottom: 15 }}>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', alignSelf: 'center' }}>필터:</span>
                <button 
                  onClick={() => setBorderFilter('all')} 
                  style={{ 
                    padding: '6px 10px', 
                    border: `1px solid var(--border-color)`, 
                    backgroundColor: (borderFilter === 'all') ? 'var(--bg-secondary)' : 'var(--card-bg-light)', 
                    color: (borderFilter === 'all') ? 'var(--text-primary)' : 'var(--text-primary)', 
                    borderRadius: 4, 
                    cursor: 'pointer', 
                    fontSize: 12 
                  }}
                >
                  전체
                </button>
                <button 
                  onClick={() => setBorderFilter('owned')} 
                  style={{ 
                    padding: '6px 10px', 
                    border: `1px solid var(--border-color)`, 
                    backgroundColor: (borderFilter === 'owned') ? 'var(--color-success)' : 'var(--card-bg-light)', 
                    color: (borderFilter === 'owned') ? '#fff' : 'var(--text-primary)', 
                    borderRadius: 4, 
                    cursor: 'pointer', 
                    fontSize: 12 
                  }}
                >
                  보유
                </button>
                <button 
                  onClick={() => setBorderFilter('unowned')} 
                  style={{ 
                    padding: '6px 10px', 
                    border: `1px solid var(--border-color)`, 
                    backgroundColor: (borderFilter === 'unowned') ? 'var(--color-danger)' : 'var(--card-bg-light)', 
                    color: (borderFilter === 'unowned') ? '#fff' : 'var(--text-primary)', 
                    borderRadius: 4, 
                    cursor: 'pointer', 
                    fontSize: 12 
                  }}
                >
                  미보유
                </button>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 15 }}>
                {borderShop
                  .filter(border => {
                    const isOwned = user.borders && user.borders.includes(border.id);
                    if (borderFilter === 'owned') return isOwned;
                    if (borderFilter === 'unowned') return !isOwned;
                    return true;
                  })
                  .map((border) => {
                    const isOwned = user.borders && user.borders.includes(border.id);
                    const isCurrent = user.currentBorder === border.id;
                    
                    return (
                      <div 
                        key={border.id} 
                        style={{ 
                          border: "1px solid var(--border-light)", 
                          borderRadius: 8, 
                          padding: 15,
                          backgroundColor: isCurrent ? "var(--card-bg-lighter)" : "var(--input-bg)"
                        }}
                      >
                        <div style={{ textAlign: "center", marginBottom: 10 }}>
                          <div 
                            style={{ 
                              width: 60, 
                              height: 60, 
                              borderRadius: "50%", 
                              backgroundColor: "var(--card-bg-light)", 
                              margin: "0 auto",
                              ...getBorderStyle(border.id)
                            }}
                          />
                        </div>
                        
                        <h4 style={{ margin: "0 0 5px 0", fontSize: "16px", color: "var(--text-primary)" }}>{border.name}</h4>
                        <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "var(--text-tertiary)" }}>{border.description}</p>
                        <p style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "bold", color: "var(--text-primary)" }}>
                          {border.price === 0 ? "무료" : `${border.price} 토큰`}
                        </p>
                        
                        <div style={{ display: "flex", gap: 5 }}>
                          {isOwned ? (
                            <button
                              onClick={() => applyBorder(border.id)}
                              style={{
                                flex: 1,
                                padding: "6px 12px",
                                backgroundColor: isCurrent ? "#28a745" : "#5383e8",
                                color: "white",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer",
                                fontSize: "12px"
                              }}
                            >
                              {isCurrent ? "적용됨" : "적용하기"}
                            </button>
                          ) : (
                            <button
                              onClick={() => buyBorder(border.id)}
                              disabled={user.tokens < border.price}
                              style={{
                                flex: 1,
                                padding: "6px 12px",
                                backgroundColor: user.tokens < border.price ? "var(--card-bg-lighter)" : "var(--color-success)",
                                color: "white",
                                border: "none",
                                borderRadius: 4,
                                cursor: user.tokens < border.price ? "not-allowed" : "pointer",
                                fontSize: "12px"
                              }}
                            >
                              구매하기
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          )}
        </div>
      )}

      {/* 배너 상점 */}
      {isOwner && (
        <div style={{ marginTop: 30, border: "1px solid var(--border-light)", borderRadius: 8, padding: 20, backgroundColor: "var(--card-bg-light)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ color: "var(--text-primary)", margin: 0 }}>배너 상점</h3>
            <button 
              onClick={() => setShowBannerShop(!showBannerShop)}
              style={{ 
                padding: "8px 16px", 
                backgroundColor: showBannerShop ? "#e84057" : "#6f42c1", 
                color: "white", 
                border: "none", 
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              {showBannerShop ? "상점 닫기" : "배너 상점 열기"}
            </button>
          </div>

          {showBannerShop && (
            <div>
              <div style={{ marginBottom: 15, padding: 10, backgroundColor: "var(--card-bg-lighter)", borderRadius: 4, color: "var(--text-primary)" }}>
                <strong>보유 토큰: {user.tokens}개</strong>
              </div>
              {/* 보유 필터 */}
              <div style={{ display: "flex", gap: 8, marginBottom: 15 }}>
                <span style={{ fontSize: 12, color: '#666', alignSelf: 'center' }}>필터:</span>
                <button 
                  onClick={() => setBannerFilter('all')} 
                  style={{ 
                    padding: '6px 10px', 
                    border: '1px solid #dee2e6', 
                    backgroundColor: (bannerFilter === 'all') ? '#343a40' : '#f8f9fa', 
                    color: (bannerFilter === 'all') ? '#fff' : '#333', 
                    borderRadius: 4, 
                    cursor: 'pointer', 
                    fontSize: 12 
                  }}
                >
                  전체
                </button>
                <button 
                  onClick={() => setBannerFilter('owned')} 
                  style={{ 
                    padding: '6px 10px', 
                    border: '1px solid #dee2e6', 
                    backgroundColor: (bannerFilter === 'owned') ? '#198754' : '#f8f9fa', 
                    color: (bannerFilter === 'owned') ? '#fff' : '#333', 
                    borderRadius: 4, 
                    cursor: 'pointer', 
                    fontSize: 12 
                  }}
                >
                  보유
                </button>
                <button 
                  onClick={() => setBannerFilter('unowned')} 
                  style={{ 
                    padding: '6px 10px', 
                    border: '1px solid #dee2e6', 
                    backgroundColor: (bannerFilter === 'unowned') ? '#dc3545' : '#f8f9fa', 
                    color: (bannerFilter === 'unowned') ? '#fff' : '#333', 
                    borderRadius: 4, 
                    cursor: 'pointer', 
                    fontSize: 12 
                  }}
                >
                  미보유
                </button>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 15 }}>
                {bannerShop
                  .filter(banner => {
                    const isOwned = user.banners && user.banners.includes(banner.id);
                    if (bannerFilter === 'owned') return isOwned;
                    if (bannerFilter === 'unowned') return !isOwned;
                    return true;
                  })
                  .map((banner) => {
                    const isOwned = user.banners && user.banners.includes(banner.id);
                    const isCurrent = user.currentBanner === banner.id;
                    
                    return (
                      <div 
                        key={banner.id} 
                        style={{ 
                          border: "1px solid var(--border-light)", 
                          borderRadius: 8, 
                          padding: 15,
                          backgroundColor: isCurrent ? "var(--card-bg-lighter)" : "var(--input-bg)",
                          position: "relative",
                          overflow: "hidden"
                        }}
                      >
                        {/* 배너 미리보기 */}
                        <div style={{
                          height: "150px",
                          backgroundImage: `url(${banner.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          borderRadius: "4px",
                          marginBottom: "10px",
                          position: "relative"
                        }}>
                          <div style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(0, 0, 0, 0.3)",
                            borderRadius: "4px"
                          }} />
                        </div>
                        
                        <h4 style={{ margin: "0 0 5px 0", fontSize: "16px", color: "var(--text-primary)" }}>{banner.name}</h4>
                        <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "var(--text-tertiary)" }}>{banner.description}</p>
                        <p style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "bold", color: "var(--text-primary)" }}>
                          {banner.price === 0 ? "무료" : `${banner.price} 토큰`}
                        </p>
                        
                        <div style={{ display: "flex", gap: 5 }}>
                          {isOwned ? (
                            <button
                              onClick={() => applyBanner(banner.id)}
                              style={{
                                flex: 1,
                                padding: "6px 12px",
                                backgroundColor: isCurrent ? "#28a745" : "#5383e8",
                                color: "white",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer",
                                fontSize: "12px"
                              }}
                            >
                              {isCurrent ? "적용됨" : "적용하기"}
                            </button>
                          ) : (
                            <button
                              onClick={() => buyBanner(banner.id)}
                              disabled={user.tokens < banner.price}
                              style={{
                                flex: 1,
                                padding: "6px 12px",
                                backgroundColor: user.tokens < banner.price ? "var(--card-bg-lighter)" : "var(--color-success)",
                                color: "white",
                                border: "none",
                                borderRadius: 4,
                                cursor: user.tokens < banner.price ? "not-allowed" : "pointer",
                                fontSize: "12px"
                              }}
                            >
                              구매하기
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          )}
        </div>
      )}

      {/* 스티커 상점 */}
      {isOwner && (
        <div style={{ marginTop: 30, border: "1px solid var(--border-light)", borderRadius: 8, padding: 20, backgroundColor: "var(--card-bg-light)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ color: "var(--text-primary)", margin: 0 }}>스티커 상점</h3>
            <button 
              onClick={() => setShowStickerShop(!showStickerShop)}
              style={{ 
                padding: "8px 16px", 
                backgroundColor: showStickerShop ? "#e84057" : "#28a745", 
                color: "white", 
                border: "none", 
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              {showStickerShop ? "상점 닫기" : "스티커 상점 열기"}
            </button>
          </div>

          {showStickerShop && (
            <StickerShop
              user={user}
              onStickerPurchase={handleStickerPurchase}
              onStickerInventory={handleStickerInventory}
            />
          )}
        </div>
      )}

      {/* 스티커 보유탭 */}
      {isOwner && (
        <div style={{ marginTop: 30, border: "1px solid #31384c", borderRadius: 8, padding: 20, backgroundColor: "#282e3e" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ color: "#cdd2e2", margin: 0 }}>스티커 보유탭</h3>
            <button 
              onClick={() => setShowStickerInventory(!showStickerInventory)}
              style={{ 
                padding: "8px 16px", 
                backgroundColor: showStickerInventory ? "#e84057" : "#6f42c1", 
                color: "white", 
                border: "none", 
                borderRadius: 4,
                cursor: "pointer"
              }}
            >
              {showStickerInventory ? "보유탭 닫기" : "스티커 보유탭 열기"}
            </button>
          </div>

          {showStickerInventory && (
            <StickerInventory
              user={user}
              onStickerSelect={handleStickerInventory}
              onStickerRemove={handleStickerDelete}
            />
          )}
        </div>
      )}

      {/* 스티커 편집 모드 안내 */}
      {isStickerEditMode && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          backgroundColor: "#007bff",
          color: "white",
          padding: "10px 15px",
          borderRadius: "8px",
          zIndex: 1000,
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        }}>
          <div style={{ fontWeight: "bold", marginBottom: "5px" }}>스티커 편집 모드</div>
          <div style={{ fontSize: "12px" }}>
            배너를 클릭하여 스티커를 배치하세요
          </div>
          <button
            onClick={() => {
              setIsStickerEditMode(false);
              setSelectedStickerId(null);
            }}
            style={{
              marginTop: "8px",
              padding: "4px 8px",
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "10px"
            }}
          >
            편집 모드 종료
          </button>
        </div>
      )}
    </div>
  );
}


