import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import logo from './asset/luna-logo.jpeg';

const Login = () => {
    const [mobileNumber, setMobileNumber] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [step, setStep] = useState(1);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showLogo, setShowLogo] = useState(true);
    const [showLogin, setShowLogin] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = sessionStorage.getItem("user");
        if (storedUser) navigate("/dashboard");

        const timer1 = setTimeout(() => setShowLogo(false), 4000);
        const timer2 = setTimeout(() => setShowLogin(true), 2700);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [navigate]);

    const handleMobileChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");
        setMobileNumber(value);
        setError("");
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setError("");
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        if (mobileNumber.length !== 10) {
            setError("Enter a valid 10-digit mobile number");
            return;
        }

        if (!password || password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            const response = await fetch("https://luna-backend-1.onrender.com/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier: mobileNumber, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Login failed");
            }

            // Store complete user data in sessionStorage
            sessionStorage.setItem("user", JSON.stringify({
                userId: data.user._id,
                username: data.user.fullName,
                mobileNumber: data.user.mobileNumber,
                email: data.user.email,
                token: data.token,
                createdAt: data.user.createdAt
            }));

            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        if (!fullName.trim()) {
            setError("Full name is required");
            return;
        }

        if (mobileNumber.length !== 10) {
            setError("Enter a valid 10-digit mobile number");
            return;
        }

        if (!email.includes("@") || !email.includes(".")) {
            setError("Enter a valid email address");
            return;
        }

        if (registerPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (registerPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            const response = await fetch("https://luna-backend-1.onrender.com/api/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName,
                    email,
                    mobileNumber: mobileNumber,
                    password: registerPassword,
                    confirmPassword: registerPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Registration failed");
            }

            // ✅ Reset form and return to login step
            setStep(1);
            setMobileNumber("");
            setPassword("");
            setFullName("");
            setEmail("");
            setRegisterPassword("");
            setConfirmPassword("");

            // ✅ Show success message
            setError("Registration successful. Please log in.");
        } catch (err) {
            setError(err.message);
        }
    };


    return (
        <div className="d-flex align-items-center justify-content-center vh-100 text-white welcome">
            {showLogo && (
                <div className="logo-animation-container">
                    <img src={logo} className="logo-animation rounded" alt="Luna logo" />
                </div>
            )}

            <div className={`vh-100 w-100 d-flex justify-content-center align-items-center login-container ${showLogin ? 'login-visible' : ''}`} style={{ background: "rgba(0, 0, 0, 0.6)" }}>
                <div className="text-center p-4 rounded">
                    <img src={logo} style={{ height: "150px", width: "150px" }} alt="Luna logo" className="mb-3 rounded" />

                    {step === 1 ? (
                        <form onSubmit={handleLoginSubmit}>
                            <h2 className="fw-bold">Welcome Back!</h2>
                            <p className="text-white opacity-50">Please login to your account</p>

                            <label className="mt-3">Mobile Number</label>
                            <div className="input-group mb-2">
                                <span className="input-group-text mobile-input">+91</span>
                                <input
                                    type="tel"
                                    className="form-control mobile-input"
                                    placeholder="Enter your mobile number"
                                    value={mobileNumber}
                                    onChange={handleMobileChange}
                                    maxLength="10"
                                    style={{ background: "transparent", color: "white" }}
                                />
                            </div>

                            <label className="mt-3">Password</label>
                            <input
                                type="password"
                                className="form-control mb-2 mobile-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={handlePasswordChange}
                                style={{ background: "transparent", color: "white" }}
                            />

                            {error && <p className="text-danger">{error}</p>}

                            <button type="submit" className="btn w-100 mt-3 continue">Login</button>

                            <div className="mt-3">
                                <p>Don't have an account? <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => { setStep(2); setError(""); }}>Register here</span></p>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleRegisterSubmit}>
                            <h2 className="fw-bold">Create Account</h2>
                            <p className="text-white opacity-50">Register to continue</p>

                            <label className="mt-3">Full Name</label>
                            <input
                                type="text"
                                className="form-control mb-2 mobile-input"
                                placeholder="Enter your full name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                style={{ background: "transparent", color: "white" }}
                            />

                            <label className="mt-3">Mobile Number</label>
                            <div className="input-group mb-2" style={{ maxWidth: "250px" }}>
                                <span className="input-group-text mobile-input">+91</span>
                                <input
                                    type="tel"
                                    className="form-control mobile-input"
                                    placeholder="Enter your mobile number"
                                    value={mobileNumber}
                                    onChange={handleMobileChange}
                                    maxLength="10"
                                    style={{ background: "transparent", color: "white" }}
                                />
                            </div>

                            <label>Email</label>
                            <input
                                type="email"
                                className="form-control mb-2 mobile-input"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ background: "transparent", color: "white" }}
                            />

                            <label>Password</label>
                            <input
                                type="password"
                                className="form-control mb-2 mobile-input"
                                placeholder="Create password"
                                value={registerPassword}
                                onChange={(e) => setRegisterPassword(e.target.value)}
                                style={{ background: "transparent", color: "white" }}
                            />

                            <label>Confirm Password</label>
                            <input
                                type="password"
                                className="form-control mb-2 mobile-input"
                                placeholder="Confirm password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{ background: "transparent", color: "white" }}
                            />

                            {error && <p className="text-danger">{error}</p>}

                            <button type="submit" className="btn w-100 mt-3 continue">Register</button>

                            <div className="mt-3">
                                <p>
                                    Already have an account?{" "}
                                    <span
                                        style={{ cursor: "pointer", textDecoration: "underline" }}
                                        onClick={() => {
                                            setStep(1);
                                            setError("");
                                        }}
                                    >
                                        Login here
                                    </span>
                                </p>
                            </div>
                        </form>

                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;