import { useEffect, useState, useRef } from 'react';
import betApi from '../data/betApi';

/**
 * 투표 마감 알림을 위한 커스텀 훅
 * @param {string} currentUser 현재 로그인한 사용자
 * @param {number} checkInterval 체크 주기 (밀리초, 기본값: 60000 = 1분)
 */
function useBetSettlementNotification(currentUser, checkInterval = 60000) {
  const [settledBets, setSettledBets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentBet, setCurrentBet] = useState(null);
  // 마지막 확인 시각: 로컬스토리지 기반으로 복원 (오프라인 기간 포함)
  const lastCheckTimeRef = useRef(
    localStorage.getItem('betLastSeenAt') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 기본 30일 전
  );
  const checkedBetIdsRef = useRef(new Set()); // 이미 알림을 띄운 내기 ID 저장
  
  useEffect(() => {
    if (!currentUser) {
      return; // 로그인하지 않은 경우 체크하지 않음
    }
    
    const checkSettledBets = async () => {
      try {
        console.log('[useBetSettlementNotification] 정산 완료 내기 체크 시작');
        
        // 1) 로그인 직후, 보류된 알림 큐가 있으면 우선 소비
        const pendingJson = localStorage.getItem('betPendingSettlements');
        if (pendingJson) {
          const pending = JSON.parse(pendingJson);
          console.log('[useBetSettlementNotification] 보류된 알림 큐 발견:', pending.length, '개');
          if (Array.isArray(pending) && pending.length > 0) {
            const firstBet = pending.shift();
            console.log('[useBetSettlementNotification] 모달 표시:', firstBet);
            setCurrentBet(firstBet);
            setShowModal(true);
            checkedBetIdsRef.current.add(firstBet.betId);
            // 남은 큐 저장/정리
            if (pending.length > 0) {
              localStorage.setItem('betPendingSettlements', JSON.stringify(pending));
            } else {
              localStorage.removeItem('betPendingSettlements');
            }
            // 본 루프는 여기서 종료 (표시 1건씩)
            // 마지막 시각 갱신
            const nowIso = new Date().toISOString();
            lastCheckTimeRef.current = nowIso;
            localStorage.setItem('betLastSeenAt', nowIso);
            return;
          }
          // 큐는 있었지만 비어있으면 정리
          localStorage.removeItem('betPendingSettlements');
        }

        // 2) 마지막 체크 시각 이후 정산된 내기 조회
        const since = lastCheckTimeRef.current;
        console.log('[useBetSettlementNotification] API 호출 - since:', since);
        const newSettledBets = await betApi.getSettledBets(since);
        console.log('[useBetSettlementNotification] API 응답:', newSettledBets);
        
        if (newSettledBets && newSettledBets.length > 0) {
          // 아직 알림을 띄우지 않은 내기만 필터링
          const unreadBets = newSettledBets.filter(
            bet => !checkedBetIdsRef.current.has(bet.betId)
          );
          console.log('[useBetSettlementNotification] 읽지 않은 내기:', unreadBets.length, '개');
          
          if (unreadBets.length > 0) {
            // 첫 번째 정산 완료 내기에 대해 모달 표시
            const firstBet = unreadBets[0];
            console.log('[useBetSettlementNotification] 모달 표시:', firstBet);
            setCurrentBet(firstBet);
            setShowModal(true);
            
            // 알림을 띄운 내기 ID 저장
            unreadBets.forEach(bet => {
              checkedBetIdsRef.current.add(bet.betId);
            });
          }
        } else {
          console.log('[useBetSettlementNotification] 정산 완료된 내기 없음');
        }
        
        // 마지막 체크 시각 업데이트 (로컬스토리지에도 저장)
        const nowIso = new Date().toISOString();
        lastCheckTimeRef.current = nowIso;
        localStorage.setItem('betLastSeenAt', nowIso);
      } catch (error) {
        console.error('[useBetSettlementNotification] 정산 완료 내기 체크 실패:', error);
      }
    };
    
    // 즉시 한 번 체크
    checkSettledBets();
    
    // 주기적으로 체크
    const intervalId = setInterval(checkSettledBets, checkInterval);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [currentUser, checkInterval]);
  
  const closeModal = () => {
    setShowModal(false);
    setCurrentBet(null);
    // 닫은 뒤 즉시 다음 보류분이 있으면 바로 표시 시도
    setTimeout(() => {
      const pendingJson = localStorage.getItem('betPendingSettlements');
      if (pendingJson) {
        try {
          const pending = JSON.parse(pendingJson);
          if (Array.isArray(pending) && pending.length > 0) {
            const next = pending.shift();
            setCurrentBet(next);
            setShowModal(true);
            checkedBetIdsRef.current.add(next.betId);
            if (pending.length > 0) {
              localStorage.setItem('betPendingSettlements', JSON.stringify(pending));
            } else {
              localStorage.removeItem('betPendingSettlements');
            }
          }
        } catch (e) {}
      }
    }, 0);
  };
  
  return {
    showModal,
    currentBet,
    closeModal
  };
}

export default useBetSettlementNotification;

