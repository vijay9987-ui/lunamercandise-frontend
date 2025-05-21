import React from "react";
import logo from '../components/asset/luna-logo.jpeg';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer bg-black text-white py-5" style={{ borderTop: "solid 1px white" }}>
      <div className="container">
        <div className="row text-center text-md-start">
          {/* Logo & About Section */}
          <div className="col-md-4 mb-4 mb-md-0">
            <img
              src={logo}
              alt="Logo"
              className="img-fluid mb-3 rounded-pill"
              style={{ height: "100px", width: "120px" }}
            />
            <p>
              Drawing is a visual art that uses an instrument to mark paper or another two-dimensional surface.
            </p>
            {/* Social Icons */}
            <div className="d-flex justify-content-center justify-content-md-start gap-3 mt-3">
              <i className="fa-brands fa-square-instagram fa-2x" style={{ color: "#d6dae1" }}></i>
              <i className="fa-brands fa-youtube fa-2x" style={{ color: "#d6dae1" }}></i>
              <i className="fa-brands fa-facebook fa-2x" style={{ color: "#d6dae1" }}></i>
            </div>
          </div>

          {/* Footer Links */}
          <div className="col-md-8">
            <div className="row">
              {/* Help Section */}
              <div className="col-12 col-sm-4 mb-4">
                <h4 className="fw-bold">Help</h4>
                <p>Contact Us & creatives</p>
                <p>www.Etrenaltek.com</p>
                <p>Hyderabad, KPHB, Sri Nagar Colony, 500038</p>
              </div>

              {/* Company Section */}
              <div className="col-12 col-sm-4 mb-4">
                <h4 className="fw-bold">Company</h4>
                
                <p><Link to="/company-policies#about-us" className="text-white text-decoration-none">About Us</Link></p>
                <p><Link to="/company-policies#services" className="text-white text-decoration-none">Services</Link></p>
                <p><Link to="/company-policies#support" className="text-white text-decoration-none">Support</Link></p>

              </div>

              {/* Policies Section */}
              <div className="col-12 col-sm-4 mb-4">
                <h4 className="fw-bold">Our Policies</h4>
               
                <p><Link to="/company-policies#terms" className="text-white text-decoration-none">Terms & Conditions</Link></p>
                <p><Link to="/company-policies#privacy" className="text-white text-decoration-none">Privacy Policy</Link></p>
                <p><Link to="/company-policies#copyright" className="text-white text-decoration-none">Copyright Matters</Link></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
