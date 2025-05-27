import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../views/Navbar";
import Footer from '../views/Footer';
import axios from 'axios';
import ProductDetails from './productDetails';

const OnSaleProducts = () => {
    const [step, setStep] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();
    const [mostWantedProducts, setMostWantedProducts] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const storedUser = JSON.parse(sessionStorage.getItem("user")) || {};
    const userId = storedUser.userId;

    // Base URL for images
    const IMAGE_BASE_URL = 'https://luna-backend-1.onrender.com';

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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 12;

    // Calculate pagination
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = mostWantedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(mostWantedProducts.length / productsPerPage);

    useEffect(() => {
        const fetchWishlist = async () => {
            if (!userId) return; // Only fetch if user is logged in
            try {
                const res = await fetch(`${IMAGE_BASE_URL}/api/users/wishlist/${userId}`);
                const data = await res.json();
                setWishlist(data.wishlist.map(item => item._id));
            } catch (error) {
                console.error("Failed to fetch wishlist", error);
            }
        };
        fetchWishlist();
    }, [userId]);

    const toggleWishlist = async (productId) => {
        if (!userId) {
            navigate('/login'); // Redirect to login if not authenticated
            return;
        }
        try {
            const res = await fetch(`${IMAGE_BASE_URL}/api/products/wishlist/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${storedUser.token}` // Ensure token is sent for authenticated requests
                },
                body: JSON.stringify({ productId }),
            });
            const data = await res.json();

            if (data.isInWishlist) {
                setWishlist((prev) => [...prev, productId]);
            } else {
                setWishlist((prev) => prev.filter(id => id !== productId));
            }
        } catch (error) {
            console.error("Error toggling wishlist", error);
            // Optionally show an error message to the user
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${IMAGE_BASE_URL}/api/products/on-sale`);
                setMostWantedProducts(response.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    const quantityDec = () => {
        setQuantity(prevQuantity => Math.max(prevQuantity - 1, 1));
    };

    const quantityInc = () => {
        setQuantity(prevQuantity => prevQuantity + 1);
    };

    const handlePurchase = (product) => {
        setSelectedItem(product);
        setStep(2);
    };

    const addToCart = () => {
        if (selectedItem) {
            const newItem = { ...selectedItem, quantity, total: selectedItem.price * quantity };
            setCart(prevCart => [...prevCart, newItem]);
            navigate('/dashboard/my-cart', { state: { cart: [...cart, newItem] } }); // Navigate to MyCart
        }
    };

    return (
        <>
            <Navbar />
            <div className="d-flex justify-content-center">
                <div className="mostwanted">
                    <div className="wanted wanted-blur p-5 text-light align-items-center">
                        <center>
                            <h1 className="text1">On-Sale Products</h1><br />
                            <p className="text2">Latest Design For You Order Now.</p>
                        </center>
                    </div>
                </div>
            </div><br />

            {step === 1 && (
                <>
                    <div className="d-flex flex-column align-items-center py-2">
                        <div className="d-flex flex-wrap justify-content-center" style={{ gap: "1rem", maxWidth: "1200px" }}>
                            {currentProducts.map((product) => {
                                const isInWishlist = wishlist.includes(product._id);
                                return (
                                    <div
                                        key={product._id}
                                        className="card shadow-sm overflow-hidden"
                                        onClick={() => handlePurchase(product)}
                                        style={{
                                            width: "16rem",
                                            cursor: "pointer",
                                            backgroundColor: "#000",
                                            color: "#fff",
                                            border: "1px solid #333",
                                            transition: "transform 0.3s, box-shadow 0.3s",
                                            margin: "0.5rem"
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "scale(1.03)";
                                            e.currentTarget.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.1)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "scale(1)";
                                            e.currentTarget.style.boxShadow = "none";
                                        }}
                                    >
                                        {/* Discount Tag - Added here */}
                                        {product.discount > 0 && (
                                            <div
                                                className="position-absolute bg-danger text-white px-2 py-1 rounded-end"
                                                style={{
                                                    top: "10px",
                                                    left: "0",
                                                    zIndex: 10,
                                                    fontWeight: "bold",
                                                    fontSize: "0.9rem"
                                                }}
                                            >
                                                {product.discount}% OFF
                                            </div>
                                        )}

                                        <div style={{ position: "relative" }}>
                                            <img
                                                src={getFullImageUrl(product.images?.[0])} /* Apply getFullImageUrl here */
                                                className="card-img img-fluid"
                                                alt={product.name}
                                                style={{ height: "200px", objectFit: "cover" }}
                                            />
                                            <div
                                                className="position-absolute"
                                                style={{
                                                    top: "10px",
                                                    right: "10px",
                                                    zIndex: 10,
                                                    cursor: "pointer",
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleWishlist(product._id);
                                                }}
                                            >
                                                <i
                                                    className={`fa-heart fa-2xl ${isInWishlist ? "fa-solid" : "fa-regular"}`}
                                                    style={{
                                                        color: isInWishlist ? "#ff0000" : "#000000",
                                                        fontSize: "1.8rem"
                                                    }}
                                                ></i>
                                            </div>
                                        </div>

                                        <div className="card-body text-center">
                                            <h5 className="card-title text-white">{product?.name}</h5>
                                            <p className="card-text">
                                                ₹{product?.price}
                                                {product?.originalPrice && (
                                                    <span className="text-decoration-line-through ms-2" style={{ color: "grey" }}>
                                                        ₹{product.originalPrice}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>


                        {/* Pagination - Only show if there are multiple pages */}
                        {totalPages > 1 && (
                            <nav aria-label="Page navigation" className="mt-4">
                                <ul className="pagination justify-content-center">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link text-white bg-dark border-dark"
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        >
                                            Previous
                                        </button>
                                    </li>

                                    {[...Array(totalPages).keys()].map(num => (
                                        <li
                                            key={num}
                                            className={`page-item ${currentPage === num + 1 ? 'active' : ''}`}
                                        >
                                            <button
                                                className={`page-link ${currentPage === num + 1 ? 'text-white bg-dark border-dark' : 'text-dark bg-white border-dark'}`}
                                                onClick={() => setCurrentPage(num + 1)}
                                            >
                                                {num + 1}
                                            </button>
                                        </li>
                                    ))}

                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link text-white bg-dark border-dark"
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        )}
                    </div>
                </>
            )}

            {step === 2 && (
                <ProductDetails
                    selectedItem={selectedItem}
                    quantity={quantity}
                    quantityDec={quantityDec}
                    quantityInc={quantityInc}
                    addToCart={addToCart}
                    goBack={() => setStep(1)}
                />
            )}

            <Footer />
        </>
    );
};

export default OnSaleProducts;
