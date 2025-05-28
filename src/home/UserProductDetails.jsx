import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserProductDetails = ({
    selectedItem,
    quantity,
    quantityDec,
    quantityInc,
    goBack
}) => {
    const navigate = useNavigate();
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedColor, setSelectedColor] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Base URL for images
    const IMAGE_BASE_URL = 'http://194.164.148.244:4066';

    // Helper function to get the full image URL
    const getFullImageUrl = (imagePath) => {
        if (!imagePath) {
            return "/fallback.png"; // Fallback for missing image path
        }
        // Check if the image path is already a full URL
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        // Prepend the base URL for relative paths
        return `${IMAGE_BASE_URL}${imagePath}`;
    };

    // Initialize mainImage with the full URL
    const [mainImage, setMainImage] = useState(getFullImageUrl(selectedItem?.images?.[0]));
    // Initialize storedUser directly from sessionStorage
    const [storedUser, setStoredUser] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem("user")) || {};
        } catch (e) {
            console.error("Failed to parse user from session storage:", e);
            return {};
        }
    });

    const userId = storedUser.userId;
    const token = storedUser.token;

    // Effect to update main image and reset selections when selectedItem changes
    useEffect(() => {
        if (selectedItem) {
            setMainImage(getFullImageUrl(selectedItem.images?.[0]));
        }
        setSelectedSize("");
        setSelectedColor("");
        setError(null);
        setSuccess(null);
    }, [selectedItem]);

    // Mark as recently viewed
    useEffect(() => {
        const markAsRecentlyViewed = async () => {
            if (!userId || !selectedItem?._id || !token) {
                // Do not proceed if user or product ID or token is missing
                return;
            }
            try {
                await axios.post(
                    `${IMAGE_BASE_URL}/api/products/recently-viewed/${userId}`,
                    { productId: selectedItem._id },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
            } catch (err) {
                console.error("Failed to mark as recently viewed:", {
                    message: err.message,
                    status: err.response?.status,
                    data: err.response?.data
                });
            }
        };

        markAsRecentlyViewed();
    }, [selectedItem?._id, userId, token]); // Add token to dependency array

    const addToCart = () => {
        // This function currently navigates to login.
        // If the user is logged in, you might want to add product to cart here.
        navigate('/login');
    };

    const getContrastColor = (hexColor) => {
        if (!hexColor) return '#000000';
        // Remove '#' if present
        const cleanHex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
        // Parse hex to RGB
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        // Return black for light colors, white for dark colors
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    };

    // Early return must come after all hooks
    if (!selectedItem) return null;

    return (
        <div className="container my-4">
            <button
                className="btn btn-outline-dark mb-3"
                onClick={goBack}
            >
                ← Back to Products
            </button>

            {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                    {error}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setError(null)}
                    ></button>
                </div>
            )}

            {success && (
                <div className="alert alert-success alert-dismissible fade show">
                    {success}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setSuccess(null)}
                    ></button>
                </div>
            )}

            <div className="row g-4">
                <div className="col-md-6">
                    <div className="card h-100 border-light shadow-sm rounded" >
                        <img
                            src={mainImage}
                            alt={selectedItem.name}
                            className="card-img-top p-3"
                            style={{
                                maxHeight: "400px",
                                objectFit: "contain",
                                backgroundColor: "transparent"
                            }}
                        />

                        {selectedItem.images && selectedItem.images.length > 1 && (
                            <div className="d-flex flex-wrap gap-2 mt-3 px-3">
                                {selectedItem.images.map((img, idx) => (
                                    <img
                                        key={idx}
                                        src={getFullImageUrl(img)} /* Apply getFullImageUrl */
                                        alt={`Preview ${idx + 1}`}
                                        onClick={() => setMainImage(getFullImageUrl(img))} /* Apply getFullImageUrl */
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            objectFit: 'cover',
                                            cursor: 'pointer',
                                            border: mainImage === getFullImageUrl(img) ? '2px solid #0d6efd' : '1px solid #ccc',
                                            borderRadius: '5px'
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card h-100 border-light shadow-sm" >
                        <div className="card-body">
                            <h2 className="card-title mb-3">{selectedItem.name}</h2>

                            <div className="d-flex align-items-center mb-3">
                                {selectedItem.originalPrice && (
                                    <span className="text-decoration-line-through text-secondary me-2">
                                        ₹{selectedItem.originalPrice}
                                    </span>
                                )}
                                <span className="h4 text-primary">
                                    ₹{selectedItem.price}
                                </span>
                                {selectedItem.originalPrice && (
                                    <span className="badge bg-success ms-2">
                                        {Math.round(
                                            (1 - selectedItem.price / selectedItem.originalPrice) * 100
                                        )}% OFF
                                    </span>
                                )}
                            </div>

                            {selectedItem.rating && (
                                <div className="mb-3">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <i
                                            key={i}
                                            className={`fas fa-star ${i < selectedItem.rating ? 'text-warning' : 'text-secondary'}`}
                                        ></i>
                                    ))}
                                    <span className="ms-2 small text-secondary">
                                        ({selectedItem.ratingCount || 0} reviews)
                                    </span>
                                </div>
                            )}

                            <div className="mb-4">
                                <p className="card-text">{selectedItem.description}</p>
                            </div>

                            {selectedItem.sizes && (
                                <div className="mb-4">
                                    <h5 className="mb-3">Select Size</h5>
                                    <div className="d-flex flex-wrap gap-2">
                                        {selectedItem.sizes.map((size) => (
                                            <button
                                                key={size}
                                                type="button"
                                                className={`btn ${selectedSize === size ? 'btn-dark' : 'btn-outline-dark'}`}
                                                onClick={() => setSelectedSize(size)}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                    {!selectedSize && (
                                        <div className="text-danger small mt-1">
                                            Please select a size
                                        </div>
                                    )}
                                </div>
                            )}

                            {selectedItem.colors && (
                                <div className="mb-4">
                                    <h5 className="mb-3">Select Color</h5>
                                    <div className="d-flex flex-wrap gap-2">
                                        {selectedItem.colors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`btn rounded-circle p-0 ${selectedColor === color ? 'border-3 border-dark' : 'border-1 border-dark'}`}
                                                onClick={() => setSelectedColor(color)}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    backgroundColor: color,
                                                    position: 'relative'
                                                }}
                                                title={color}
                                            >
                                                {selectedColor === color && (
                                                    <i
                                                        className="fas fa-check position-absolute"
                                                        style={{
                                                            top: '50%',
                                                            left: '50%',
                                                            transform: 'translate(-50%, -50%)',
                                                            color: getContrastColor(color),
                                                            fontSize: '0.8rem'
                                                        }}
                                                    ></i>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    {!selectedColor && (
                                        <div className="text-danger small mt-1">
                                            Please select a color
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="d-flex align-items-center mb-4">
                                <div className="d-flex align-items-center me-4">
                                    <button
                                        className="btn btn-outline-secondary px-3"
                                        onClick={quantityDec}
                                        disabled={isLoading || quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span className="mx-3">{quantity}</span>
                                    <button
                                        className="btn btn-outline-secondary px-3"
                                        onClick={quantityInc}
                                        disabled={isLoading}
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    className="btn btn-dark px-4 py-2 flex-grow-1"
                                    onClick={addToCart}
                                    disabled={
                                        isLoading ||
                                        (selectedItem.sizes && !selectedSize) ||
                                        (selectedItem.colors && !selectedColor)
                                    }
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Adding...
                                        </>
                                    ) : (
                                        'Add to Cart'
                                    )}
                                </button>
                            </div>

                            <div className="d-grid gap-2">
                                <button
                                    className="btn btn-outline-dark"
                                    onClick={() => navigate('/')}
                                    disabled={
                                        isLoading ||
                                        (selectedItem.sizes && !selectedSize) ||
                                        (selectedItem.colors && !selectedColor)
                                    }
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProductDetails;