import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "./UserNavbar"; // Changed import
import UserFooter from "./UserFooter"; // Changed import
import UserProductDetails from "./UserProductDetails"; // Changed import
import axios from "axios";

const Home = () => { // Renamed component from Dashboard to Home
    const navigate = useNavigate();

    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    // Removed recentlyViewedProducts state as it's not used in the provided new code
    const [newArrivalsProducts, setNewArrivalsProducts] = useState([]);
    const [mostWantedProducts, setMostWantedProducts] = useState([]);
    const [step, setStep] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);

    const [isTransitioning, setIsTransitioning] = useState(false);

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

    // Fetch banners
    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const response = await axios.get(`${IMAGE_BASE_URL}/api/products/getbanners`);
                const bannerImages = response.data.banners[0]?.images || [];
                setBanners(bannerImages);
            } catch (error) {
                console.error("Error fetching banners:", error);
            }
        };
        fetchBanners();
    }, []);

    // Banner image transition effect
    useEffect(() => {
        if (banners.length > 1) {
            const interval = setInterval(() => {
                setIsTransitioning(true);
                setTimeout(() => {
                    setCurrentImageIndex((prevIndex) =>
                        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
                    );
                    setIsTransitioning(false);
                }, 500); // Transition duration
            }, 5000); // Change image every 5 seconds

            return () => clearInterval(interval);
        }
    }, [banners]);

    // Fetch wishlist for the user
    useEffect(() => {
        const fetchWishlist = async () => {
            if (!userId) return;
            try {
                const res = await fetch(`${IMAGE_BASE_URL}/api/users/wishlist/${userId}`);
                const data = await res.json();
                if (data.wishlist) {
                    setWishlist(data.wishlist.map(item => item._id));
                }
            } catch (error) {
                console.error("Failed to fetch wishlist", error);
            }
        };
        fetchWishlist();
    }, [userId]);

    // Toggle product in wishlist
    const toggleWishlist = async (productId, e) => {
        e.stopPropagation();
        if (!userId) {
            navigate('/login'); // Changed navigation to /login if not authenticated
            return;
        }
        try {
            const res = await fetch(`${IMAGE_BASE_URL}/api/products/wishlist/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${storedUser.token}`
                },
                body: JSON.stringify({ productId }),
            });
            const data = await res.json();

            setWishlist(prev =>
                data.isInWishlist
                    ? [...prev, productId]
                    : prev.filter(id => id !== productId)
            );
        } catch (error) {
            console.error("Error toggling wishlist", error);
        }
    };

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const [newArrivalsResponse, bestSellersResponse] = await Promise.all([
                    axios.get(`${IMAGE_BASE_URL}/api/products/new-arrivals`),
                    axios.get(`${IMAGE_BASE_URL}/api/products/best-sellers`)
                ]);

                setNewArrivalsProducts(newArrivalsResponse.data.slice(0, 10));
                setMostWantedProducts(bestSellersResponse.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);

    // Removed useEffect for recentlyViewedProducts as it's no longer used.

    // Removed useEffect for authentication check as it's not present in the new code.

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${IMAGE_BASE_URL}/api/products/categories`);
                setCategories(response.data);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    // Quantity handlers
    const quantityDec = () => {
        setQuantity(prev => Math.max(prev - 1, 1));
    };

    const quantityInc = () => {
        setQuantity(prev => prev + 1);
    };

    // Product selection handler
    const handlePurchase = (product) => {
        setSelectedItem(product);
        setStep(2);
    };

    const handleCategoryClick = (categoryName) => {
        navigate(`/usercategory/${categoryName}`); // Changed navigation path
    };

    // Add to cart handler
    const addToCart = () => {
        if (selectedItem) {
            const newItem = {
                ...selectedItem,
                quantity,
                total: selectedItem.price * quantity
            };
            const updatedCart = [...cart, newItem];
            setCart(updatedCart);
            navigate('/dashboard/my-cart', { state: { cart: updatedCart } });
        }
    };

    // Scroll handlers for horizontal sections
    const scrollLeft = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    // Render product card component
    const renderProductCard = (product) => {
        const isInWishlist = wishlist.includes(product._id);

        return (
            <div
                key={product._id}
                className="card shadow-sm overflow-hidden flex-shrink-0 mx-3"
                style={{
                    width: "16rem",
                    scrollSnapAlign: "center",
                    cursor: "pointer",
                    backgroundColor: "#000",
                    color: "#fff",
                    border: "1px solid #333",
                    transition: "transform 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.03)";
                    e.currentTarget.style.boxShadow = "0 0 15px rgba(255, 255, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                }}
                onClick={() => handlePurchase(product)}
            >
                <div style={{ position: "relative" }}>
                    <img
                        src={getFullImageUrl(product.images?.[0])} // Applied getFullImageUrl
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
                        onClick={(e) => toggleWishlist(product._id, e)}
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
    };

    return (
        <>
            <UserNavbar /> {/* Changed component name */}
            <div className="container d-flex justify-content-center">
                {banners.length > 0 && (
                    <div className="card text-bg-dark position-relative w-100 overflow-hidden" style={{ height: '600px' }}>
                        <img
                            src={getFullImageUrl(banners[currentImageIndex])} // Applied getFullImageUrl to banners
                            className="img-fluid w-100 h-100 position-absolute top-0 start-0"
                            alt="Banner"
                            style={{
                                objectFit: "cover",
                                opacity: isTransitioning ? 0 : 1,
                                transition: "opacity 0.5s ease-in-out",
                                zIndex: 1
                            }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/800x500?text=Image+Not+Available";
                            }}
                        />

                        <div className="card-img-overlay d-flex flex-column justify-content-center align-items-center text-center"
                            style={{
                                backdropFilter: "blur(8px)",
                                background: "rgba(0, 0, 0, 0.4)",
                                borderRadius: "10px",
                                padding: "20px",
                                zIndex: 3,
                            }}
                        >
                            <h1 className="text-light text-wrap text-center px-3" style={{ fontSize: "clamp(1.5rem, 5vw, 3rem)" }}>
                                Level up Your Style With Our Summer Collections
                            </h1>
                            <br />
                            <button onClick={() => navigate('/login')} className="btn btn-light btn-lg"> {/* Changed navigation path */}
                                Login To Shop Now
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <br />

            {step === 1 && (
                <>
                    {/* Removed Recently viewed products section */}

                    {/* Category Section */}
                    <div className="container">
                        <div className="row align-items-center text-center text-md-start">
                            <div className="col-12 col-md-4"></div>
                            <div className="col-12 col-md-4 text-center">
                                <h2 style={{ color: "#000" }}>Categories</h2>
                            </div>
                        </div>

                        <br /><br />

                        <div className="position-relative">
                            <button
                                className="position-absolute start-0 top-50 translate-middle-y btn btn-dark rounded-circle z-1 ms-3"
                                onClick={() => scrollLeft('categories-section')}
                                style={{ width: '40px', height: '40px' }}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <div
                                id="categories-section"
                                className="d-flex overflow-auto py-2 mx-5 custom-scroll"
                                style={{ gap: "1rem", scrollSnapType: "x mandatory" }}
                            >
                                {categories.map((category, index) => (
                                    <div
                                        key={index}
                                        className="card bg-dark text-white shadow-sm overflow-hidden flex-shrink-0 mx-3 position-relative"
                                        style={{
                                            width: "16rem",
                                            height: "11rem",
                                            scrollSnapAlign: "center",
                                            cursor: "pointer",
                                            borderRadius: "1rem",
                                            transition: "transform 0.3s",
                                            overflow: "hidden",
                                        }}
                                        onClick={() => handleCategoryClick(category.categoryName)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = "scale(1.05)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = "scale(1)";
                                        }}
                                    >
                                        <img
                                            src={getFullImageUrl(category.imageUrl)} // Applied getFullImageUrl
                                            className="w-100 h-100"
                                            alt={`${category.categoryName} Image`}
                                            style={{
                                                objectFit: "cover",
                                                filter: "brightness(60%)",
                                            }}
                                        />
                                        <div className="card-img-overlay d-flex flex-column justify-content-center align-items-center text-center">
                                            <h5 className="fw-bold text-white mb-2" style={{ textShadow: "1px 1px 5px rgba(0,0,0,0.7)" }}>
                                                {category.categoryName}
                                            </h5>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                className="position-absolute end-0 top-50 translate-middle-y btn btn-dark rounded-circle z-1 me-3"
                                onClick={() => scrollRight('categories-section')}
                                style={{ width: '40px', height: '40px' }}
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>

                    <br />

                    {/* Best Sellers Section */}
                    <div className="container">
                        <div className="row align-items-center text-center text-md-start">
                            <div className="col-12 col-md-4"></div>
                            <div className="col-12 col-md-4 text-center">
                                <h2 style={{ color: "#000" }}>Best Sellers</h2>
                            </div>
                        </div>
                        <br /><br />

                        <div className="position-relative">
                            <button
                                className="position-absolute start-0 top-50 translate-middle-y btn btn-dark rounded-circle z-1 ms-3"
                                onClick={() => scrollLeft('best-sellers-section')}
                                style={{ width: '40px', height: '40px' }}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <div
                                id="best-sellers-section"
                                className="d-flex overflow-auto py-2 mx-5 custom-scroll"
                                style={{ gap: "1rem", scrollSnapType: "x mandatory" }}
                            >
                                {mostWantedProducts.map(renderProductCard)}
                            </div>
                            <button
                                className="position-absolute end-0 top-50 translate-middle-y btn btn-dark rounded-circle z-1 me-3"
                                onClick={() => scrollRight('best-sellers-section')}
                                style={{ width: '40px', height: '40px' }}
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>

                    <br />

                    {/* New Arrivals Section */}
                    <div className="container">
                        <div className="row align-items-center text-center text-md-start">
                            <div className="col-12 col-md-4"></div>
                            <div className="col-12 col-md-4 text-center">
                                <h2 style={{ color: "#000" }}>New Arrivals</h2>
                            </div>
                        </div>
                        <br /><br />

                        <div className="position-relative">
                            <button
                                className="position-absolute start-0 top-50 translate-middle-y btn btn-dark rounded-circle z-1 ms-3"
                                onClick={() => scrollLeft('new-arrivals-section')}
                                style={{ width: '40px', height: '40px' }}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <div
                                id="new-arrivals-section"
                                className="d-flex overflow-auto py-2 mx-5 custom-scroll"
                                style={{ gap: "1rem", scrollSnapType: "x mandatory" }}
                            >
                                {newArrivalsProducts.map(renderProductCard)}
                            </div>
                            <button
                                className="position-absolute end-0 top-50 translate-middle-y btn btn-dark rounded-circle z-1 me-3"
                                onClick={() => scrollRight('new-arrivals-section')}
                                style={{ width: '40px', height: '40px' }}
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </>
            )}

            {step === 2 && (
                <UserProductDetails // Changed component name
                    selectedItem={selectedItem}
                    quantity={quantity}
                    quantityDec={quantityDec}
                    quantityInc={quantityInc}
                    addToCart={addToCart}
                    goBack={() => setStep(1)}
                />
            )}

            <UserFooter /> {/* Changed component name */}
        </>
    );
}

export default Home; // Changed export name
