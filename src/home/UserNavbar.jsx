import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from  '../components/asset/luna-logo.jpeg'

function UserNavbar() {
  const navigate = useNavigate();
  

  const storedUser = JSON.parse(sessionStorage.getItem("user")) || {};
  const userId = storedUser.userId;

  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const response = await axios.get(`https://luna-backend-1.onrender.com/api/users/getcartcount/${userId}`);
        setCartCount(response.data.cartCount);
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    };

    if (userId) {
      fetchCartCount();
    }
  }, [userId]);

  return (
    <>
      <nav className="navbar navbar-expand-lg" style={{ borderBottom: "solid 1px white"}}>
        <div className="container-fluid">
        {/* <img src={logo} style={{height: "100px", width: "100px"}} className="navbar-brand" /> */}
          <button
            className="navbar-toggler btn btn-light"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarText"
            aria-controls="navbarText"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarText">
            <ul className="navbar-nav w-100 justify-content-center justify-content-lg-end gap-4 nav nav-underline">
              <li className="nav-item">
                <Link className="nav-link mx-2" to="/">Home</Link>
              </li>
              <li className="nav-item">
                {/* {<Link className="nav-link mx-2" to="/dashboard/categorypage/:category">Category</Link>} */}
              </li>
              <li className="nav-item">
                <Link className="nav-link mx-2" to="/onsaleproducts">On-Sale Products</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link mx-2" to="/new-arrivals">New Arrivals</Link>
              </li>
              <li className="nav-item d-flex align-items-center">
                <div className="position-relative">
                  <button
                    className="btn"
                    type="button"
                    onClick={() => navigate('/login')}
                  >
                    <i className="fa-solid fa-cart-shopping fa-xl" style={{ color: "#000" }}></i>
                    {cartCount > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: '0.6rem' }}
                      >
                        {cartCount}
                      </span>
                    )}
                  </button>
                </div>
              </li>
              <li className="nav-item d-flex align-items-center">
                <button className="btn" type="button" onClick={() => navigate('/login')}>
                  <i className="fa-solid fa-user fa-xl" style={{ color: "#000" }}></i>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      
    </>
  );
}

export default UserNavbar;