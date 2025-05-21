import React from 'react';
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/dashboard";
import OnSaleProducts from "./components/OnSaleProducts";
import Newarrival from "./components/Newarrival";
import Mycart from "./components/mycart";
import Profile from "./components/Profile";
import PrivateRoute from "./components/privateRoute";
import CategoryPage from "./views/CategoryPage";
import UserCompanyPoliciesPage from './home/UserCompanyPoliciesPage';
import Home from "./home/Home";
import UserCategory from './home/UserCategory';
import UserOnsale from "./home/UserOnsale";
import UserNewArrivals from "./home/UserNewArrivals";
import CompanyPoliciesPage from './views/CompanyPoliciesPage';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/usercategory/:categoryName" element={<UserCategory />} />
        <Route path="/onsaleproducts" element={<UserOnsale />} />
        <Route path="/new-arrivals" element={<UserNewArrivals />} />
        <Route path="/company-policies" element={<UserCompanyPoliciesPage />} />

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/OnSaleProducts" element={<OnSaleProducts />} />
          <Route path="/dashboard/new-arrivals" element={<Newarrival />} />
          <Route path="/dashboard/category/:categoryName" element={<CategoryPage />} />
          <Route path="/dashboard/my-cart" element={<Mycart />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/company-policies" element={<CompanyPoliciesPage />} />
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
