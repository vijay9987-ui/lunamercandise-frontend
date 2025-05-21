import { useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Footer from "../views/Footer";
import Navbar from "../views/Navbar";
import axios from "axios";
import ProductDetails from "./productDetails";
import html2pdf from 'html2pdf.js';


const Profile = () => {
    const [step, setStep] = useState(2);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState("");
    const [sessionUser, setSessionUser] = useState({});
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        gender: "none",
        email: "",
        mobile: "",
        username: ""
    });

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [address, setAddress] = useState({
        name: "",
        mobile: "",
        email: "",
        addressline1: "",
        addressline2: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        type: "Home"
    });

    const navigate = useNavigate();
    const location = useLocation();

    // Add these state variables near the top of your Profile component
    const [cartItems, setCartItems] = useState([]);
    const [isCartLoading, setIsCartLoading] = useState(false);
    const [cartError, setCartError] = useState(null);
    const [cart, setCart] = useState([]);
    const storedUser = JSON.parse(sessionStorage.getItem("user")) || {};
    const userId = storedUser.userId;


    // Cart State - Replace your existing cart state with this
    const [cartData, setCartData] = useState({
        cartItems: [],
        totalItems: 0,
        subTotal: 0,
        deliveryCharge: 0,
        finalAmount: 0,
        loading: true,
        error: null
    });


    // Fetch cart data
    const fetchCartData = async () => {
        try {
            setCartData(prev => ({ ...prev, loading: true, error: null }));
            const response = await axios.get(`https://luna-backend-1.onrender.com/api/users/getcart/${userId}`);

            setCartData({
                cartItems: response.data.cartItems || [],
                totalItems: response.data.totalItems || 0,
                subTotal: response.data.subTotal || 0,
                deliveryCharge: response.data.deliveryCharge || 0,
                finalAmount: response.data.finalAmount || 0,
                loading: false,
                error: null
            });
        } catch (error) {
            console.error("Error fetching cart:", error);
            setCartData(prev => ({
                ...prev,
                loading: false,
                error: error.response?.data?.message || "Failed to load cart"
            }));
        }
    };

    useEffect(() => {
        if (userId && step === 5) { // Only fetch when on cart tab
            fetchCartData();
        }
    }, [userId, step]);

    // Handle quantity change
    const updateQuantity = async (productId, action) => {
        try {
            setCartData(prev => ({ ...prev, loading: true }));
            await axios.post(
                `https://luna-backend-1.onrender.com/api/users/addtocart/${userId}`,
                { productId, action }
            );
            await fetchCartData(); // Refresh cart data
        } catch (error) {
            console.error("Error updating quantity:", error);
            setCartData(prev => ({
                ...prev,
                loading: false,
                error: error.response?.data?.message || "Failed to update quantity"
            }));
        }
    };

    // Handle item removal
    const removeItem = async (productId) => {
        try {
            setCartData(prev => ({ ...prev, loading: true }));
            await axios.delete(
                `https://luna-backend-1.onrender.com/api/users/removefromcart/${userId}/${productId}`
            );
            await fetchCartData(); // Refresh cart data
        } catch (error) {
            console.error("Error removing item:", error);
            setCartData(prev => ({
                ...prev,
                loading: false,
                error: error.response?.data?.message || "Failed to remove item"
            }));
        }
    };

    // Handle checkout
    const proceedToCheckout = () => {
        if (cartData.cartItems.length === 0) {
            setCartData(prev => ({ ...prev, error: "Your cart is empty" }));
            return;
        }
        navigate('/dashboard/my-cart');
    };

    useEffect(() => {
        const storedUser = JSON.parse(sessionStorage.getItem("user")) || {};
        setSessionUser(storedUser);
        const userId = storedUser.userId;

        if (userId) {
            axios.get(`https://luna-backend-1.onrender.com/api/users/getuser/${userId}`)
                .then(res => {
                    const { profile, mobileNumber } = res.data;
                    setFormData({
                        firstName: profile?.firstName || "",
                        lastName: profile?.lastName || "",
                        gender: profile?.gender || "none",
                        email: profile?.email || "",
                        mobile: mobileNumber || "",
                        username: storedUser.username || ""
                    });
                })
                .catch(err => console.error("Failed to fetch profile:", err));
        }
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem("user");
        localStorage.removeItem("user");
        navigate("/");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        const storedUser = JSON.parse(sessionStorage.getItem("user")) || {};
        const userId = storedUser.userId;

        try {
            const res = await axios.post(`https://luna-backend-1.onrender.com/api/users/user/createprofiledata/${userId}`, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                gender: formData.gender,
                email: formData.email,
                mobile: formData.mobile
            });
            setMessage("Profile updated successfully!");
            setIsEditing(false);

            if (formData.mobile) {
                storedUser.mobileNumber = formData.mobile;
                sessionStorage.setItem("user", JSON.stringify(storedUser));
            }

            setTimeout(() => setMessage("Mobile number changed Successfully"), 3000);
        } catch (err) {
            console.error("Error updating profile:", err);
        }
    };

    const handleChangeAdd = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        const userId = sessionUser.userId;

        try {
            const res = await axios.post(`https://luna-backend-1.onrender.com/api/users/create-address/${userId}`, address);
            setAddresses(res.data.addresses);
            setAddress({
                name: "", mobile: "", email: "", addressline1: "", addressline2: "",
                city: "", state: "", country: "", pincode: "", type: "Home"
            });
            setShowAddressForm(false);
        } catch (err) {
            console.error("Failed to save address:", err);
        }
    };

    const handleDeleteAddress = async (index) => {
        const userId = sessionUser.userId;
        const addr = addresses[index];

        try {
            const res = await axios.delete(`https://luna-backend-1.onrender.com/api/users/remove-address/${userId}/${addr._id}`);
            setAddresses(res.data.addresses);
            if (selectedAddress?._id === addr._id) setSelectedAddress(null);
        } catch (err) {
            console.error("Failed to delete address:", err);
        }
    };

    const handleSelectAddress = (addr) => {
        setSelectedAddress(addr);
        //sessionStorage.setItem("selectedAddress", JSON.stringify(addr));
    };


    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const savedUser = JSON.parse(sessionStorage.getItem("user")) || {};
                const userId = savedUser.userId; // Or however you're storing user ID
                const res = await axios.get(`https://luna-backend-1.onrender.com/api/users/getaddress/${userId}`);
                setAddresses(res.data.addresses); // ✅ Fix: directly access 'addresses' from response
            } catch (err) {
                console.error("Error fetching addresses:", err);
            }
        };

        fetchAddresses();
    }, []);


    const [wishlistProducts, setWishlistProducts] = useState([]);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const res = await fetch(`https://luna-backend-1.onrender.com/api/users/wishlist/${userId}`);
                const data = await res.json();
                //console.log("Fetched wishlist data:", data);

                const wishlistIds = data.wishlist.map(item => item._id);
                //console.log("Wishlist product IDs:", wishlistIds);

                const productResponses = await Promise.all(
                    wishlistIds.map(_id =>
                        fetch(`https://luna-backend-1.onrender.com/api/products/singleproduct/${_id}`)
                            .then(res => res.json())
                            .catch(err => {
                                console.error("Failed to fetch product:", _id, err);
                                return null;
                            })
                    )
                );

                const validProducts = productResponses.filter(p => p !== null);
                //console.log("Fetched products:", validProducts);
                setWishlistProducts(validProducts);
            } catch (error) {
                console.error("Failed to fetch wishlist", error);
            }
        };


        if (userId) {
            fetchWishlist();
        }
    }, [userId]);

    const handleRemove = async (productId) => {
        try {
            const res = await fetch(`https://luna-backend-1.onrender.com/api/users/wishlist/${userId}/${productId}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (res.ok) {
                // Filter out the removed product from the local state
                setWishlistProducts(prev => prev.filter(p => p._id !== productId));
            } else {
                console.error(data.message || 'Failed to remove product');
            }
        } catch (error) {
            console.error("Error removing product from wishlist:", error);
        }
    };

    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const quantityDec = () => {
        setQuantity(prevQuantity => Math.max(prevQuantity - 1, 1));
    };

    const quantityInc = () => {
        setQuantity(prevQuantity => prevQuantity + 1);
    };


    const handlePurchase = (product) => {
        setSelectedItem(product);
        setStep(6);
    };

    const addToCart = () => {
        if (selectedItem) {
            const newItem = { ...selectedItem, quantity, total: selectedItem.price * quantity };
            setCart(prevCart => [...prevCart, newItem]);
            navigate('/dashboard/my-cart', { state: { cart: [...cart, newItem] } }); // Navigate to MyCart
        }
    };

    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState(null);



    // inside your component:
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    // handler to open modal
    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

    // handler to close modal
    const handleCloseModal = () => {
        setSelectedOrder(null);
        setShowOrderModal(false);
    };



    const fetchOrders = async () => {
        try {
            setOrdersLoading(true);
            setOrdersError(null);
            const response = await axios.get(
                `https://luna-backend-1.onrender.com/api/users/myorders/${userId}`
            );
            setOrders(response.data.orders || []);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrdersError(error.response?.data?.message || "Failed to load orders");
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        if (userId && step === 1) {
            fetchOrders();
        }
        if (userId && step === 5) {
            fetchCartData();
        }
    }, [userId, step]);


    const handleDownloadPDF = () => {
        const element = document.getElementById("order-details-pdf");

        const options = {
            filename: `Order_${selectedOrder._id}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        html2pdf().set(options).from(element).save();
    };


    return (
        <>
            <Navbar />
            <div className="container-fluid">
                <div className="row p-5" >
                    {/* Sidebar */}
                    <div className="col-sm-4 p-5 border border-2">
                        <div className="d-flex align-items-center border border-1 p-3 shadow-sm rounded">
                            <i className="fa-solid fa-user fa-2xl me-3" style={{ color: "#000" }}></i>
                            <div>
                                <h4>Hello,</h4>
                                <p>{sessionUser.username}</p>
                            </div>
                        </div><br />
                        <div className="border border-1 p-3 shadow-sm rounded">
                            <ul className="list-group list-group-flush">
                                <p className="d-inline-flex align-items-center">
                                    <i className="fa-solid fa-heart me-2" ></i>
                                    <a className="btn" data-bs-toggle="collapse" onClick={() => setStep(4)} style={{ cursor: "pointer", color: "black" }} href="#collapsemywishlist">My Wishlist</a>
                                </p>
                                <p className="d-inline-flex align-items-center">
                                    <i className="fa-solid fa-truck me-2"></i>
                                    <a className="btn" style={{ cursor: "pointer", color: "black" }} onClick={() => setStep(1)} data-bs-toggle="collapse" href="#collapseorders">My orders</a>
                                </p>

                                <p className="d-inline-flex align-items-center">
                                    <i className="fa-solid fa-cart-shopping me-2"></i>
                                    <a
                                        className="btn"
                                        style={{ cursor: "pointer", color: "black" }}
                                        onClick={() => setStep(5)}
                                    >
                                        My Cart
                                    </a>
                                </p>
                                <p className="d-inline-flex align-items-center">
                                    <i className="fa-regular fa-user me-2"></i>
                                    <a className="btn" data-bs-toggle="collapse" href="#collapsesettings" style={{ cursor: "pointer", color: "black" }} onClick={() => setStep(2)}>Account Settings</a>
                                </p>
                                <div className="collapse" id="collapsesettings">
                                    <ul className="rounded divide-y divide-gray-700 border border-gray-700">
                                        <li
                                            className="px-4 py-2"
                                            onClick={() => setStep(2)}
                                            style={{ cursor: "pointer", color: "black" }}
                                        >
                                            Profile Information
                                        </li>
                                        <li
                                            className="px-4 py-2"
                                            onClick={() => setStep(3)}
                                            style={{ cursor: "pointer", color: "black" }}
                                        >
                                            Manage Address
                                        </li>
                                        {/* {<li className="px-4 py-2">
                                            Notifications
                                        </li>} */}
                                    </ul>

                                </div>
                                <p className="d-inline-flex align-items-center" style={{ cursor: "pointer" }}>
                                    <i className="fa-solid fa-arrow-right-from-bracket me-2"></i>
                                    <a onClick={handleLogout}>Logout</a>
                                </p>
                            </ul>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-sm-8 p-5 border border-2">
                        {step === 1 && (
                            <div className="container my-4">
                                <h3 className="mb-4 text-center text-md-start">My Orders</h3>

                                {ordersLoading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-2">Loading your orders...</p>
                                    </div>
                                ) : ordersError ? (
                                    <div className="alert alert-danger">{ordersError}</div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-4" >
                                        <p >You haven't placed any orders yet.</p>
                                        <button className="btn btn-outline-dark" onClick={() => navigate('/dashboard')}>
                                            Start Shopping
                                        </button>
                                    </div>
                                ) : (
                                    <div className="table-responsive border border-1" >
                                        <table className="table table-hover align-middle">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Order/Date</th>
                                                    <th scope="col">Items</th>
                                                    <th scope="col">Total</th>
                                                    <th scope="col">Status</th>
                                                    <th scope="col">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map(order => (
                                                    <tr key={order._id}>
                                                        <td>
                                                            <div className="text-break">
                                                                <strong>ID:</strong> {order._id.slice(-6)}
                                                                <br/>
                                                                (<small>{new Date(order.createdAt).toLocaleDateString()}</small>)
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <div className="d-flex flex-column gap-2">
                                                                {order.products.map(product => (
                                                                    <div key={product.productId._id} className="d-flex align-items-center gap-2">
                                                                        <img
                                                                            src={product.productId.images?.[0] || "/fallback.png"}
                                                                            alt={product.productId.name}
                                                                            className="rounded"
                                                                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                                                        />
                                                                        <div className="text-break">
                                                                            <small>{product.productId.name}</small>
                                                                            <br />
                                                                            <small>Qty: {product.quantity}</small>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>

                                                        <td>
                                                            ₹{order.totalAmount.toFixed(2)}
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={`badge ${order.orderStatus === 'Delivered'
                                                                    ? 'bg-success'
                                                                    : order.orderStatus === 'Cancelled'
                                                                        ? 'bg-danger'
                                                                        : order.orderStatus === 'Processing'
                                                                            ? 'bg-warning text-dark'
                                                                            : 'bg-info'
                                                                    }`}
                                                            >
                                                                {order.orderStatus}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-outline-dark w-100"
                                                                onClick={() => handleViewDetails(order)}
                                                            >
                                                                View Details
                                                            </button>

                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}


                        {showOrderModal && selectedOrder && (
                            <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
                                <div className="modal-dialog modal-lg modal-dialog-centered">
                                    <div className="modal-content border border-light" id="order-details-pdf">
                                        <div className="modal-header text-light bg-dark">
                                            <h5 className="modal-title">Order Details</h5>
                                            <button type="button" className="btn-close btn-close-white" onClick={handleCloseModal}></button>
                                        </div>
                                        <div className="modal-body text-light bg-dark">
                                            <p className="text-light"><strong>Order ID:</strong> {selectedOrder._id}</p>
                                            <p className="text-light"><strong>Placed on:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>

                                            <h6 className="mt-4 mb-2"><u>Shipping Address:</u></h6>
                                            <p className="text-light">
                                                {selectedOrder.shippingAddress.fullName}<br />
                                                {selectedOrder.shippingAddress.addressLine}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}<br />
                                                {selectedOrder.shippingAddress.zipCode}, {selectedOrder.shippingAddress.country}<br />
                                                Phone: {selectedOrder.shippingAddress.phone}
                                            </p>

                                            <h6 className="mt-4 mb-2">Products:</h6>
                                            <ul className="list-group mb-3">
                                                {selectedOrder.products.map(product => (
                                                    <li key={product.productId._id} className="list-group-item d-flex justify-content-between align-items-center bg-transparent text-white">
                                                        <div className="d-flex align-items-center">
                                                            <img
                                                                src={product.productId.images?.[0] || "/fallback.png"}
                                                                alt={product.productId.name}
                                                                style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                                                className="rounded me-2"
                                                            />
                                                            <div>
                                                                <strong>{product.productId.name}</strong><br />
                                                                Qty: {product.quantity} | Size: {product.size} | Color: {product.color}
                                                            </div>
                                                        </div>
                                                        <span>₹{product.price?.toFixed(2) || "N/A"}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <h6 className="mb-2">Summary:</h6>
                                            <ul className="list-group">
                                                <li className="list-group-item d-flex justify-content-between bg-transparent text-white">
                                                    <span>Subtotal</span>
                                                    <span>₹{(selectedOrder.totalAmount - selectedOrder.deliveryCharge).toFixed(2)}</span>
                                                </li>
                                                <li className="list-group-item d-flex justify-content-between bg-transparent text-white">
                                                    <span>Delivery Charge</span>
                                                    <span>₹{selectedOrder.deliveryCharge.toFixed(2)}</span>
                                                </li>
                                                <li className="list-group-item d-flex justify-content-between bg-transparent text-white">
                                                    <strong>Total</strong>
                                                    <strong>₹{selectedOrder.totalAmount.toFixed(2)}</strong>
                                                </li>
                                                <li className="list-group-item d-flex justify-content-between bg-transparent text-white">
                                                    <span>Payment Method</span>
                                                    <span>{selectedOrder.paymentMethod}</span>
                                                </li>
                                                <li className="list-group-item d-flex justify-content-between bg-transparent text-white">
                                                    <span>Payment Status</span>
                                                    <span className={`badge ${selectedOrder.paymentStatus === 'Completed' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                        {selectedOrder.paymentStatus}
                                                    </span>
                                                </li>
                                                <li className="list-group-item d-flex justify-content-between bg-transparent text-white">
                                                    <span>Order Status</span>
                                                    <span className={`badge ${selectedOrder.orderStatus === 'Delivered'
                                                        ? 'bg-success'
                                                        : selectedOrder.orderStatus === 'Cancelled'
                                                            ? 'bg-danger'
                                                            : selectedOrder.orderStatus === 'Processing'
                                                                ? 'bg-warning text-dark'
                                                                : 'bg-info'
                                                        }`}>
                                                        {selectedOrder.orderStatus}
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="modal-footer text-light bg-dark">
                                            <button className="btn btn-primary" onClick={handleDownloadPDF}>Download as PDF</button>
                                            <button className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}




                        {step === 2 && (
                            <form className="p-4 border rounded shadow-sm">
                                <div className="d-flex justify-content-between mb-3">
                                    <h4 className="text-dark">Profile Information</h4>
                                    <button
                                        type="button"
                                        className={`btn btn-sm ${isEditing ? "btn-dark" : "btn-outline-dark"}`}
                                        onClick={isEditing ? handleUpdate : () => setIsEditing(true)}
                                    >
                                        {isEditing ? "Save" : "Edit"}
                                    </button>
                                </div>

                                {message && <p className="text-success">{message}</p>}

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            readOnly={!isEditing}
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Gender</label>
                                    <select
                                        className="form-select"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                    >
                                        <option value="none" disabled>Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        readOnly={!isEditing}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Mobile</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleChange}
                                        readOnly={!isEditing}
                                        maxLength={10}
                                    />
                                </div>
                            </form>
                        )}


                        {step === 3 && (
                            <>
                                <h5>Manage Delivery Address</h5>
                                {addresses.length > 0 ? addresses.map((addr, i) => (
                                    <div key={i} className={`border p-3 my-2 ${selectedAddress?._id === addr._id ? "border-primary" : ""}`}>
                                        <input
                                            type="radio"
                                            checked={selectedAddress?._id === addr._id}
                                            onChange={() => handleSelectAddress(addr)}
                                        />
                                        <strong className="ms-2">{addr.name}</strong>
                                        <p>
                                            {addr.name} | {addr.addressline1}, {addr.addressline2}, {addr.mobile}, {addr.city}, {addr.pincode} ({addr.type})
                                        </p>
                                        <button
                                            className="btn btn-danger btn-sm me-2"
                                            onClick={() => handleDeleteAddress(i)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )) : <p>No saved addresses.</p>}


                                <button className="btn btn-outline-dark mt-2" onClick={() => setShowAddressForm(true)}>Add New Address</button>

                                {showAddressForm && (
                                    <form className="row g-3 mt-4" onSubmit={handleSaveAddress}>
                                        {/* Basic Info */}
                                        <div className="col-md-6">
                                            <label className="form-label">Name</label>
                                            <input type="text" name="name" className="form-control" value={address.name} onChange={handleChangeAdd} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Mobile</label>
                                            <input type="text" name="mobile" className="form-control" value={address.mobile} onChange={handleChangeAdd} required />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label">Email</label>
                                            <input type="email" name="email" className="form-control" value={address.email} onChange={handleChangeAdd} required />
                                        </div>

                                        {/* Address Details */}
                                        <div className="col-md-12">
                                            <label className="form-label">Address Line 1</label>
                                            <input type="text" name="addressline1" className="form-control" value={address.addressline1} onChange={handleChangeAdd} required />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label">Address Line 2</label>
                                            <input type="text" name="addressline2" className="form-control" value={address.addressline2} onChange={handleChangeAdd} />
                                        </div>

                                        {/* Location */}
                                        <div className="col-md-6">
                                            <label className="form-label">City</label>
                                            <input type="text" name="city" className="form-control" value={address.city} onChange={handleChangeAdd} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">State</label>
                                            <input type="text" name="state" className="form-control" value={address.state} onChange={handleChangeAdd} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Country</label>
                                            <input type="text" name="country" className="form-control" value={address.country} onChange={handleChangeAdd} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Pincode</label>
                                            <input type="text" name="pincode" className="form-control" value={address.pincode} onChange={handleChangeAdd} required />
                                        </div>

                                        {/* Address Type */}
                                        <div className="col-12">
                                            <label className="form-label me-2">Address Type:</label>
                                            {["Home", "Office", "Other"].map((type) => (
                                                <div key={type} className="form-check form-check-inline">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="type"
                                                        value={type}
                                                        checked={address.type === type}
                                                        onChange={handleChangeAdd}
                                                    />
                                                    <label className="form-check-label">{type}</label>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Submit Button */}
                                        <div className="col-12 text-center">
                                            <button type="submit" className="btn btn-success">Save Address</button>
                                        </div>
                                    </form>

                                )}
                            </>
                        )}

                        {(step === 4 &&
                            <>
                                <div className="container my-4">
                                    <h3 className="text-center mb-4">My Wishlist</h3>

                                    <div className="wishlist-wrapper hide-scrollbar" style={{ maxHeight: "100vh", overflowY: "auto" }}>
                                        {wishlistProducts.length ? (
                                            wishlistProducts.map((product, index) => (
                                                <div
                                                    key={product._id || `wishlist-${index}`}
                                                    className="position-relative border mb-3 shadow-sm p-2 rounded"

                                                >
                                                    <div className="d-flex flex-column flex-sm-row align-items-start">
                                                        {/* Product Image */}
                                                        <img
                                                            src={product.images?.[0] || "fallback.png"}
                                                            alt={product.name}
                                                            className="rounded img-fluid"
                                                            style={{ height: "100px", width: "100px", objectFit: "cover" }}
                                                            onClick={() => handlePurchase(product)}
                                                        />

                                                        {/* Product Info */}
                                                        <div className="ms-sm-3 mt-2 mt-sm-0 flex-grow-1 d-flex flex-column justify-content-start w-100">
                                                            <h3 className="fw-bold fs-5 mb-1 text-truncate">{product.name}</h3>
                                                            <span className="fw-semibold text-secondary">₹{product.price}</span>
                                                        </div>
                                                        
                                                        {/* Remove Button */}
                                                        <button
                                                            onClick={() => handleRemove(product._id)}
                                                            className="position-absolute top-0 end-0 btn btn-sm btn-outline-danger"
                                                        >
                                                            <i className="fa-solid fa-xmark fa-lg"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="border mb-3 shadow-sm p-3 rounded text-center">
                                                No items in wishlist
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </>
                        )}

                        {step === 5 && (
                            <div className="row text-dark">
                                <div className="col-md-12">
                                    <h2 className="text-center">My Cart</h2>
                                    <div className="card mb-4 border-dark">
                                        <div className="card-body table-responsive">
                                            <table className="table table-bordered align-middle text-center text-dark">
                                                <thead>
                                                    <tr>
                                                        <th>Image</th>
                                                        <th>Product</th>
                                                        <th>Quantity</th>
                                                        <th>Total</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {cartData.cartItems.map((item) => (
                                                        <tr key={item.product._id}>
                                                            <td>
                                                                <img
                                                                    src={item.product.images?.[0] || "/fallback.png"}
                                                                    alt={item.product.name}
                                                                    className="img-fluid rounded border"
                                                                    style={{ maxHeight: "80px" }}
                                                                />
                                                            </td>
                                                            <td className="text-start">
                                                                <h6 className="text-dark mb-1">{item.product.name}</h6>
                                                                <small className="text-dark">
                                                                    {item.color && `Color: ${item.color}`}
                                                                    {item.size && ` | Size: ${item.size}`}
                                                                </small>
                                                                <div className="fw-bold mt-1 text-dark">
                                                                    ₹{item.product.price.toFixed(2)}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex justify-content-center align-items-center">
                                                                    <button
                                                                        className="btn btn-outline-dark btn-sm"
                                                                        onClick={() => updateQuantity(item.product._id, "decrement")}
                                                                        disabled={cartData.loading}
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <span className="mx-3">{item.quantity}</span>
                                                                    <button
                                                                        className="btn btn-outline-dark btn-sm"
                                                                        onClick={() => updateQuantity(item.product._id, "increment")}
                                                                        disabled={cartData.loading}
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="fw-semibold text-dark" >
                                                                ₹{(item.product.price * item.quantity).toFixed(2)}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-outline-light"
                                                                    onClick={() => removeItem(item.product._id)}
                                                                    disabled={cartData.loading}
                                                                    title="Remove Item"
                                                                >
                                                                    <i className="fa-solid fa-trash text-danger"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12 col-sm-6 col-md-6">
                                    <div className="card bg-transparent border-dark text-dark">
                                        <div className="card-body">
                                            <h5 className="card-title">Order Summary</h5>
                                            <hr className="border-dark" />
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Subtotal ({cartData.totalItems} items)</span>
                                                <span>₹{cartData.subTotal.toFixed(2)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Delivery Charge</span>
                                                <span>₹{cartData.deliveryCharge.toFixed(2)}</span>
                                            </div>
                                            <hr className="border-dark" />
                                            <div className="d-flex justify-content-between fw-bold mb-4">
                                                <span>Total Amount</span>
                                                <span>₹{cartData.finalAmount.toFixed(2)}</span>
                                            </div>
                                            <button
                                                className="btn btn-outline-dark w-100"
                                                onClick={proceedToCheckout}
                                                disabled={cartData.loading || cartData.cartItems.length === 0}
                                            >
                                                {cartData.loading ? 'Processing...' : 'Proceed to Checkout'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                        {step === 6 && (
                            <ProductDetails
                                selectedItem={selectedItem}
                                quantity={quantity}
                                quantityDec={quantityDec}
                                quantityInc={quantityInc}
                                addToCart={addToCart}
                                goBack={() => setStep(1)}
                            />
                        )}

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Profile;
