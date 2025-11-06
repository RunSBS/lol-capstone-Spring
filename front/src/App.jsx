import { Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useBetSettlementNotification from './hooks/useBetSettlementNotification'
import BetSettlementModal from './components/common/BetSettlementModal'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const location = useLocation()
  
  // 로그인 상태 확인
  useEffect(() => {
    const user = localStorage.getItem('currentUser')
    setCurrentUser(user)
    
    // 로그인 상태 변경 감지
    const handleStorageChange = () => {
      const user = localStorage.getItem('currentUser')
      setCurrentUser(user)
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('loginStateChanged', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('loginStateChanged', handleStorageChange)
    }
  }, [location])
  
  // 투표 마감 알림 훅 사용
  const { showModal, currentBet, closeModal } = useBetSettlementNotification(
    currentUser,
    60000 // 1분마다 체크
  )
  
  return (
    <>
      <Outlet />
      {showModal && (
        <BetSettlementModal bet={currentBet} onClose={closeModal} />
      )}
    </>
  )
}

export default App
