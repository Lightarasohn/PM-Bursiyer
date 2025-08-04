import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './tools/PrivateRoute';

import LoginScreen from './forms/Login/LoginScreen';
import MainLayout from './forms/MasterPage/MainLayout';
import BursiyerListesi from './forms/Bursiyer/ScholarList';
import BursiyerEkle from './forms/Bursiyer/AddScholar';
import ScholarInfo from './forms/Bursiyer/scholarInfo';
import Test from './forms/TestPages/Test';
import AddPeriodToScholar from './forms/Bursiyer/AddPeriodToScholar';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/test" element={<Test />} />
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
          <Route path="add-period-to-scholar" element={<AddPeriodToScholar />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
