import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import Navbar from '../views/Navbar';
import Footer from '../views/Footer';

const MyCart = () => {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [error, setError] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedItems, setSelectedItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);

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



    // Helper function to get the full image URL
    const getFullImageUrl = (imagePath) => {
        if (!imagePath) {
            return "/placeholder.png"; // Fallback for missing image path
        }
        // Check if the image path is already a full URL
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        // Prepend the base URL for relative paths
        return `https://luna-backend-1.onrender.com${imagePath}`;
    };

    const [cartData, setCartData] = useState({
        cartItems: [],
        totalItems: 0,
        subTotal: 0,
        deliveryCharge: 0,
        finalAmount: 0,
        loading: true,
        error: null
    });

    const getUserId = () => {
        const savedUser = JSON.parse(sessionStorage.getItem("user")) || {};
        return savedUser.userId;
    };

    const fetchCart = useCallback(async () => {
        try {
            const userId = getUserId();
            if (!userId) return;

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

            setSelectedItems([]);
            setSelectAll(false);
        } catch (error) {
            console.error("Error fetching cart:", error);
            setCartData(prev => ({
                ...prev,
                loading: false,
                error: error.response?.data?.message || "Failed to load cart"
            }));
        }
    }, []);

    const fetchAddresses = useCallback(async () => {
        const userId = getUserId();
        if (!userId) return;

        try {
            const response = await axios.get(`https://luna-backend-1.onrender.com/api/users/getaddress/${userId}`);
            setAddresses(response.data.addresses || []);
        } catch (err) {
            console.error("Error fetching addresses:", err);
            setError(err.response?.data?.message || "Failed to load addresses");
        }
    }, []);

    useEffect(() => {
        fetchCart();
        fetchAddresses();
    }, [fetchCart, fetchAddresses]);

    const handleSelectItem = (productId) => {
        setSelectedItems(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            } else {
                return [...prev, productId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedItems([]);
        } else {
            const allIds = cartData.cartItems.map(item => item.product._id);
            setSelectedItems(allIds);
        }
        setSelectAll(!selectAll);
    };

    const updateQuantity = async (productId, action) => {
        try {
            const userId = getUserId();
            if (!userId) return;

            setCartData(prev => ({ ...prev, loading: true }));
            await axios.post(
                `https://luna-backend-1.onrender.com/api/users/addtocart/${userId}`,
                { productId, action }
            );
            await fetchCart();
        } catch (error) {
            console.error("Error updating quantity:", error);
            setCartData(prev => ({
                ...prev,
                loading: false,
                error: error.response?.data?.message || "Failed to update quantity"
            }));
        }
    };

    const removeItem = async (productId) => {
        try {
            const userId = getUserId();
            if (!userId) return;

            setCartData(prev => ({ ...prev, loading: true }));
            await axios.delete(
                `https://luna-backend-1.onrender.com/api/users/removefromcart/${userId}/${productId}`
            );
            await fetchCart();
        } catch (error) {
            console.error("Error removing item:", error);
            setCartData(prev => ({
                ...prev,
                loading: false,
                error: error.response?.data?.message || "Failed to remove item"
            }));
        }
    };

    const removeSelectedItems = async () => {
        if (selectedItems.length === 0) {
            setError("Please select items to remove");
            return;
        }

        try {
            const userId = getUserId();
            if (!userId) return;

            setCartData(prev => ({ ...prev, loading: true }));

            for (const productId of selectedItems) {
                await axios.delete(
                    `https://luna-backend-1.onrender.com/api/users/removefromcart/${userId}/${productId}`
                );
            }

            await fetchCart();
            setSelectedItems([]);
            setSelectAll(false);
        } catch (error) {
            console.error("Error removing items:", error);
            setCartData(prev => ({
                ...prev,
                loading: false,
                error: error.response?.data?.message || "Failed to remove items"
            }));
        }
    };

    const handleCheckout = async () => {
        setError(null);

        // Check if there are any selected items
        const itemsToCheckout = selectedItems.length > 0
            ? cartData.cartItems.filter(item => selectedItems.includes(item.product._id))
            : cartData.cartItems;

        if (itemsToCheckout.length === 0) {
            setError(selectedItems.length === 0
                ? "Please select items to checkout"
                : "Your cart is empty");
            return;
        }

        if (!selectedAddress) {
            setError("Please select a delivery address");
            return;
        }

        try {
            console.log("Starting checkout...");

            const userId = getUserId();
            if (!userId) {
                setError("Please login to proceed with checkout");
                return;
            }

            const products = itemsToCheckout.map(item => ({
                productId: item.product._id,
                quantity: item.quantity,
                price: item.product.price,
                color: item.color || "default",
                size: item.size || "default",
            }));

            const totalAmount = products.reduce(
                (total, item) => total + (item.quantity * item.price),
                0
            );

            const checkoutData = {
                products,
                shippingAddress: {
                    fullName: selectedAddress.name,
                    addressLine: `${selectedAddress.addressline1 || ""} ${selectedAddress.addressline2 || ""}`.trim(),
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    zipCode: selectedAddress.pincode,
                    country: selectedAddress.country,
                    phone: selectedAddress.mobile
                },
                paymentMethod: paymentMethod || "COD",
                totalAmount,
                deliveryCharge: cartData.deliveryCharge,
            };

            setCartData(prev => ({ ...prev, loading: true }));

            console.log("Sending checkout data:", checkoutData);

            const response = await axios.post(
                `https://luna-backend-1.onrender.com/api/users/create-order/${userId}`,
                checkoutData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            console.log("Received response:", response.data);

            if (!response.data) {
                throw new Error("No data received from server");
            }

            if (response.data.order) {
                setOrderDetails(response.data);
                setShowPaymentModal(true);
                await fetchCart();
            } else if (response.data.message) {
                setError(response.data.message);
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err) {
            console.error("Checkout failed:", err);
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Checkout failed. Please try again."
            );
        } finally {
            setCartData(prev => ({ ...prev, loading: false }));
        }
    };

    const handleChangeAdd = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        const userId = getUserId();
        if (!userId) return;

        try {
            await axios.post(`https://luna-backend-1.onrender.com/api/users/create-address/${userId}`, address);
            await fetchAddresses();
            setShowAddressForm(false);
            setAddress({
                name: "", mobile: "", email: "", addressline1: "", addressline2: "",
                city: "", state: "", country: "", pincode: "", type: "Home"
            });
        } catch (err) {
            console.error("Failed to save address:", err);
            setError(err.response?.data?.message || "Failed to save address");
        }
    };

    const handleDeleteAddress = async (addressId) => {
        const userId = getUserId();
        if (!userId) return;

        try {
            await axios.delete(`https://luna-backend-1.onrender.com/api/users/remove-address/${userId}/${addressId}`);
            await fetchAddresses();
            if (selectedAddress?._id === addressId) {
                setSelectedAddress(null);
            }
        } catch (err) {
            console.error("Failed to delete address:", err);
            setError(err.response?.data?.message || "Failed to delete address");
        }
    };

    const handleSelectAddress = (addr) => {
        setSelectedAddress(addr);
    };

    const calculateSelectedSubtotal = () => {
        return cartData.cartItems
            .filter(item => selectedItems.includes(item.product._id))
            .reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
            .toFixed(2);
    };

    return (
        <>
            <Navbar />
            <div className="container my-5">
                <h2 className="mb-4">My Cart ({cartData.totalItems} items)</h2>

                {cartData.error && (
                    <div className="alert alert-danger">
                        {cartData.error}
                    </div>
                )}
                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {cartData.cartItems.length === 0 ? (
                    <div className="text-center py-5">
                        <h4>Your cart is empty</h4>
                        <button
                            className="btn btn-primary mt-3"
                            onClick={() => navigate('/dashboard')}
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="card mb-4">
                                    <div className="card-body table-responsive">
                                        <table className="table table-bordered align-middle text-center">
                                            <thead>
                                                <tr>
                                                    <th style={{ backgroundColor: "black", color: "white" }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectAll}
                                                            onChange={handleSelectAll}
                                                            disabled={cartData.loading}
                                                        />
                                                    </th>
                                                    <th style={{ backgroundColor: "black", color: "white" }}>Image</th>
                                                    <th style={{ backgroundColor: "black", color: "white" }}>Product</th>
                                                    <th style={{ backgroundColor: "black", color: "white" }}>Quantity</th>
                                                    <th style={{ backgroundColor: "black", color: "white" }}>Total</th>
                                                    <th style={{ backgroundColor: "black", color: "white" }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cartData.cartItems.map((item) => (
                                                    <tr key={item.product._id}>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedItems.includes(item.product._id)}
                                                                onChange={() => handleSelectItem(item.product._id)}
                                                                disabled={cartData.loading}
                                                            />
                                                        </td>

                                                        <td>
                                                            <img
                                                                src={getFullImageUrl(item.product.images?.[0]) || "/fallback.png"}
                                                                alt={item.product.name}
                                                                className="img-fluid rounded border"
                                                                style={{ maxHeight: "80px" }}
                                                            />
                                                        </td>

                                                        <td className="text-start">
                                                            <h6 className="mb-1">{item.product.name}</h6>
                                                            <small className="text-muted">
                                                                {item.color && `Color: ${item.color}`}
                                                                {item.size && ` | Size: ${item.size}`}
                                                            </small>
                                                            <div className="fw-bold mt-1">
                                                                ₹{item.product.price.toFixed(2)}
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <div className="d-flex justify-content-center align-items-center">
                                                                <button
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    onClick={() => updateQuantity(item.product._id, "decrement")}
                                                                    disabled={cartData.loading}
                                                                >
                                                                    -
                                                                </button>
                                                                <span className="mx-3">{item.quantity}</span>
                                                                <button
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    onClick={() => updateQuantity(item.product._id, "increment")}
                                                                    disabled={cartData.loading}
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </td>

                                                        <td className="fw-semibold">
                                                            ₹{(item.product.price * item.quantity).toFixed(2)}
                                                        </td>

                                                        <td>
                                                            <button
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() => removeItem(item.product._id)}
                                                                disabled={cartData.loading}
                                                                title="Remove Item"
                                                            >
                                                                <i className="fa-solid fa-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {selectedItems.length > 0 && (
                                            <div className="mt-3 d-flex justify-content-between align-items-center">
                                                <div>
                                                    <span className="me-3">
                                                        {selectedItems.length} item(s) selected
                                                    </span>
                                                    <button
                                                        className="btn btn-outline-danger"
                                                        onClick={removeSelectedItems}
                                                        disabled={cartData.loading}
                                                    >
                                                        Remove Selected
                                                    </button>
                                                </div>
                                                <div className="fw-bold">
                                                    Selected Subtotal: ₹{calculateSelectedSubtotal()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='container'>
                            <div className='row'>
                                <div className="col-sm-6">
                                    <div className="card mb-3">
                                        <div className="card-header" style={{ backgroundColor: "black", color: "white" }}>
                                            <h5 className="mb-0" >Delivery Address</h5>
                                        </div>
                                        <div className="card-body">
                                            {addresses.length > 0 ? (
                                                <>
                                                    {addresses.map((addr) => (
                                                        <div
                                                            key={addr._id}
                                                            className={`mb-3 p-3 border rounded ${selectedAddress?._id === addr._id ? "border-primary" : ""}`}
                                                            onClick={() => handleSelectAddress(addr)}
                                                            style={{ cursor: "pointer" }}
                                                        >
                                                            <div className="form-check">
                                                                <input
                                                                    type="radio"
                                                                    className="form-check-input"
                                                                    checked={selectedAddress?._id === addr._id}
                                                                    onChange={() => { }}
                                                                />
                                                                <label className="form-check-label">
                                                                    <strong>{addr.name}</strong> ({addr.type})
                                                                </label>
                                                            </div>
                                                            <p className="mb-1">{addr.addressline1}, {addr.addressline2}</p>
                                                            <p className="mb-1">{addr.city}, {addr.state} - {addr.pincode}</p>
                                                            <p className="mb-1">{addr.country}</p>
                                                            <p className="mb-0">Phone: {addr.mobile}</p>
                                                            <p className="mb-0">Email: {addr.email}</p>
                                                            <button
                                                                className="btn btn-outline-danger btn-sm mt-2"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (window.confirm("Are you sure you want to delete this address?")) {
                                                                        handleDeleteAddress(addr._id);
                                                                    }
                                                                }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button
                                                        className="btn btn-outline-dark w-100"
                                                        onClick={() => setShowAddressForm(true)}
                                                    >
                                                        + Add New Address
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="text-center">
                                                    <p>No saved addresses</p>
                                                    <button
                                                        className="btn btn-outline-dark"
                                                        onClick={() => setShowAddressForm(true)}
                                                    >
                                                        Add Address
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-sm-6">
                                    <div className="card mb-3">
                                        <div className="card-header" style={{ backgroundColor: "black", color: "white" }}>
                                            <h5 className="mb-0">Payment Method</h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="mb-3">
                                                <select
                                                    className="form-select"
                                                    value={paymentMethod}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                >
                                                    <option value="COD">Cash on Delivery (COD)</option>
                                                    <option value="UPI">UPI Payment</option>
                                                    <option value="Online" disabled>Online Payment (Credit/Debit Card)</option>
                                                </select>
                                            </div>
                                            {paymentMethod === 'UPI' && (
                                                <div className="alert alert-info mt-3">
                                                    You will be shown a UPI QR code to complete payment after placing your order.
                                                </div>
                                            )}
                                            {paymentMethod === 'Online' && (
                                                <div className="alert alert-info mt-3">
                                                    You will be redirected to a secure payment gateway after placing your order.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="card">
                                        <div className="card-body">
                                            <h5 className="card-title">Order Summary</h5>
                                            <hr />

                                            <div className="d-flex justify-content-between mb-2">
                                                <span>
                                                    Subtotal
                                                    {selectedItems.length > 0 ? (
                                                        <span className="text-muted"> ({selectedItems.length} selected items)</span>
                                                    ) : (
                                                        <span className="text-muted"> ({cartData.totalItems} items)</span>
                                                    )}
                                                </span>
                                                <span>
                                                    ₹{selectedItems.length > 0 ?
                                                        calculateSelectedSubtotal() :
                                                        cartData.subTotal.toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="d-flex justify-content-between mb-2">
                                                <span>Delivery Charge</span>
                                                <span>₹{cartData.deliveryCharge.toFixed(2)}</span>
                                            </div>

                                            <hr />

                                            <div className="d-flex justify-content-between fw-bold mb-4">
                                                <span>Total Amount</span>
                                                <span>
                                                    ₹{(
                                                        (selectedItems.length > 0 ?
                                                            parseFloat(calculateSelectedSubtotal()) :
                                                            cartData.subTotal) +
                                                        cartData.deliveryCharge
                                                    ).toFixed(2)}
                                                </span>
                                            </div>

                                            <button
                                                className="btn btn-dark w-100"
                                                onClick={handleCheckout}
                                                disabled={cartData.loading || selectedItems.length < 0}
                                            >
                                                {cartData.loading ? 'Processing...' : 'Proceed to Checkout'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {showAddressForm && (
                                <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                                    <div className="modal-dialog modal-lg">
                                        <div className="modal-content bg-white text-dark">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Add New Address</h5>
                                                <button
                                                    type="button"
                                                    className="btn-close"
                                                    onClick={() => setShowAddressForm(false)}
                                                ></button>
                                            </div>
                                            <div className="modal-body">
                                                <form className="row g-3 " onSubmit={handleSaveAddress}>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Name*</label>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            className="form-control"
                                                            value={address.name}
                                                            onChange={handleChangeAdd}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Mobile*</label>
                                                        <input
                                                            type="tel"
                                                            name="mobile"
                                                            className="form-control"
                                                            value={address.mobile}
                                                            onChange={handleChangeAdd}
                                                            required
                                                            pattern="[0-9]{10}"
                                                        />
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label className="form-label">Email*</label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            className="form-control"
                                                            value={address.email}
                                                            onChange={handleChangeAdd}
                                                            required
                                                        />
                                                    </div>

                                                    <div className="col-md-12">
                                                        <label className="form-label">Address Line 1*</label>
                                                        <input
                                                            type="text"
                                                            name="addressline1"
                                                            className="form-control"
                                                            value={address.addressline1}
                                                            onChange={handleChangeAdd}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-12">
                                                        <label className="form-label">Address Line 2</label>
                                                        <input
                                                            type="text"
                                                            name="addressline2"
                                                            className="form-control"
                                                            value={address.addressline2}
                                                            onChange={handleChangeAdd}
                                                        />
                                                    </div>

                                                    <div className="col-md-4">
                                                        <label className="form-label">City*</label>
                                                        <input
                                                            type="text"
                                                            name="city"
                                                            className="form-control"
                                                            value={address.city}
                                                            onChange={handleChangeAdd}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label">State*</label>
                                                        <input
                                                            type="text"
                                                            name="state"
                                                            className="form-control"
                                                            value={address.state}
                                                            onChange={handleChangeAdd}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-4">
                                                        <label className="form-label">Country*</label>
                                                        <input
                                                            type="text"
                                                            name="country"
                                                            className="form-control"
                                                            value={address.country}
                                                            onChange={handleChangeAdd}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Pincode*</label>
                                                        <input
                                                            type="text"
                                                            name="pincode"
                                                            className="form-control"
                                                            value={address.pincode}
                                                            onChange={handleChangeAdd}
                                                            required
                                                            pattern="[0-9]{6}"
                                                        />
                                                    </div>

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
                                                                    id={`type-${type}`}
                                                                />
                                                                <label className="form-check-label" htmlFor={`type-${type}`}>
                                                                    {type}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="col-12 text-center mt-3">
                                                        <button type="submit" className="btn btn-success me-2">
                                                            Save Address
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger"
                                                            onClick={() => setShowAddressForm(false)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Modal */}
                            {showPaymentModal && orderDetails && (
                                <div className="modal" style={{ display: "block", background: "white", backgroundColor: "rgba(0,0,0,0.5)" }}>
                                    <div className="modal-dialog modal-lg">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Complete Your Payment</h5>
                                                <button
                                                    type="button"
                                                    className="btn-close"
                                                    onClick={() => {
                                                        setShowPaymentModal(false);
                                                        navigate('/dashboard');
                                                    }}
                                                ></button>
                                            </div>
                                            <div className="modal-body">
                                                {paymentMethod === 'UPI' ? (
                                                    <div className="text-center">
                                                        <h4>Scan the QR Code to Pay</h4>
                                                        <p>UPI ID: juleeperween@ybl</p>
                                                        <p>Amount: ₹{orderDetails.order.totalAmount.toFixed(2)}</p>

                                                        <div className="my-4 d-flex justify-content-center">
                                                            <div style={{ background: "white", padding: "20px", borderRadius: "10px" }}>
                                                                <QRCode
                                                                    value={`upi://pay?pa=juleeperween@ybl&am=${orderDetails.order.totalAmount}&cu=INR`}
                                                                    size={200}
                                                                />
                                                            </div>
                                                        </div>

                                                        <p className="text-muted">After successful payment, your order will be processed</p>

                                                        <div className="mt-4">
                                                            <button
                                                                className="btn btn-primary me-2"
                                                                onClick={() => {
                                                                    setShowPaymentModal(false);
                                                                    navigate('/dashboard');
                                                                }}
                                                            >
                                                                I've Completed Payment
                                                            </button>
                                                            <button
                                                                className="btn btn-secondary"
                                                                onClick={() => {
                                                                    setShowPaymentModal(false);
                                                                    navigate('/dashboard');
                                                                }}
                                                            >
                                                                Cancel Order
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <h4>Order Placed Successfully!</h4>
                                                        <p>Your order ID: {orderDetails.order._id}</p>
                                                        <p>Total Amount: ₹{orderDetails.order.totalAmount.toFixed(2)}</p>
                                                        <p>Payment Method: {orderDetails.order.paymentMethod}</p>

                                                        <div className="mt-4">
                                                            <button
                                                                className="btn btn-primary"
                                                                onClick={() => {
                                                                    setShowPaymentModal(false);
                                                                    navigate('/dashboard');
                                                                }}
                                                            >
                                                                Continue Shopping
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <Footer />
        </>
    );
};

export default MyCart;