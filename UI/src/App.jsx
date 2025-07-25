import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './components/MainLayout/MainLayout'
import BursiyerListesi from './components/Bursiyer/BursiyerListesi'
import BursiyerEkle from './components/Bursiyer/BursiyerEkle'
import ScholarInfo from './components/Bursiyer/scholarInfo'
import LoginScreen from './components/Login/LoginScreen'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<LoginScreen />} />
        <Route path="/" element={<MainLayout/>}>
          <Route path="bursiyer-listesi" element={<BursiyerListesi />} />
          <Route path="bursiyer-ekle" element={<BursiyerEkle />} />
          <Route path="scholar-info" element={<ScholarInfo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
