import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './tools/PrivateRoute';

import LoginScreen from './forms/Login/LoginScreen';
import MainLayout from './forms/MasterPage/MainLayout';
import BursiyerListesi from './forms/Bursiyer/ScholarList';
import BursiyerEkle from './forms/Bursiyer/AddScholar';
import ScholarInfo from './forms/Bursiyer/scholarInfo';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="bursiyer-listesi" element={<BursiyerListesi />} />
          <Route path="bursiyer-ekle" element={<BursiyerEkle />} />
          <Route path="scholar-info" element={<ScholarInfo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
