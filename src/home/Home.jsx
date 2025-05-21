import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserNavbar from "./UserNavbar";
import UserFooter from "./UserFooter";
import UserProductDetails from "./UserProductDetails";
import axios from "axios";


const Home = () => {
    const navigate = useNavigate();

    const images = [
        "https://img.freepik.com/free-photo/young-woman-with-shopping-bags-beautiful-dress_1303-17550.jpg?ga=GA1.1.2026462327.1743072904&semt=ais_hybrid&w=740",
        "https://img.freepik.com/free-photo/joyful-european-lady-summer-hat-dancing-yellow-background-debonair-girl-long-skirt-laughing-while-posing-studio_197531-25996.jpg?ga=GA1.1.2026462327.1743072904&semt=ais_hybrid&w=740",
        "https://img.freepik.com/free-photo/happy-lady-stylish-skirt-boater-posing-pink-wall_197531-23653.jpg?ga=GA1.1.2026462327.1743072904&semt=ais_hybrid&w=740",
    ];

    const [categories, setCategories] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    const [newArrivalsProducts, setNewArrivalsProducts] = useState([]);
    const [mostWantedProducts, setMostWantedProducts] = useState([]);
    const [step, setStep] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);

    const storedUser = JSON.parse(sessionStorage.getItem("user")) || {};
    const userId = storedUser.userId;


    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch all products in parallel
                const [newArrivalsResponse, bestSellersResponse, productsResponse] = await Promise.all([
                    axios.get("https://luna-backend-1.onrender.com/api/products/new-arrivals"),
                    axios.get("https://luna-backend-1.onrender.com/api/products/best-sellers")
                ]);

                setNewArrivalsProducts(newArrivalsResponse.data.slice(0, 10));
                setMostWantedProducts(bestSellersResponse.data);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, []);




    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("https://luna-backend-1.onrender.com/api/products/categories");
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
        // No need to manually encode - React Router v6 handles this automatically
        navigate(`/usercategory/${categoryName}`);
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
                        src={product.images?.[0] || "fallback.png"}
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
            <UserNavbar />
            <div className="container d-flex justify-content-center">
                <div className="card text-bg-dark position-relative w-100">
                    <img
                        src={images[currentImageIndex]}
                        className="card-img img-fluid"
                        alt="Latest Fashion"
                    />
                    <div
                        className="card-img-overlay d-flex flex-column justify-content-center align-items-center text-center"
                        style={{
                            backdropFilter: "blur(8px)",
                            background: "rgba(0, 0, 0, 0.4)",
                            borderRadius: "10px",
                            padding: "20px",
                            transition: "background-image 1s ease-in-out",
                        }}
                    >
                        <center>
                            <h1 className="text-light text-wrap text-center px-3" style={{ fontSize: "clamp(1.5rem, 5vw, 3rem)" }}>
                                Level up Your Style With Our Summer Collections
                            </h1>
                            <br />
                            <a href="/login" className="btn btn-light btn-lg">
                                Login To Shop Now
                            </a>
                        </center>
                    </div>
                </div>
            </div>

            <br />


            {step === 1 && (
                <>

                    {/* Category Section */}
                    <div className="container">
                        <div className="row align-items-center text-center text-md-start">
                            <div className="col-12 col-md-4"></div>
                            <div className="col-12 col-md-4 text-center">
                                <h2 style={{ color: "#000" }}>Categories</h2>
                            </div>
                        </div>
                    </div>

                    <br /><br />

                    <div
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
                                    src={category.imageUrl}
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


                    <br />

                    {/* Best Sellers Section */}
                    <div className="container">
                        <div className="row align-items-center text-center text-md-start">
                            <div className="col-12 col-md-4"></div>
                            <div className="col-12 col-md-4 text-center">
                                <h2 style={{ color: "#000" }}>Best Sellers</h2>
                            </div>
                        </div>
                    </div>
                    <br /><br />

                    <div className="d-flex overflow-auto py-2 mx-5 custom-scroll" style={{ gap: "1rem", scrollSnapType: "x mandatory" }}>
                        {mostWantedProducts.map(renderProductCard)}
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
                    </div>
                    <br /><br />

                    <div className="d-flex overflow-auto py-2 mx-5 custom-scroll" style={{ gap: "1rem", scrollSnapType: "x mandatory" }}>
                        {newArrivalsProducts.map(renderProductCard)}
                    </div>

                </>
            )}

            {step === 2 && (
                <UserProductDetails
                    selectedItem={selectedItem}
                    quantity={quantity}
                    quantityDec={quantityDec}
                    quantityInc={quantityInc}
                    addToCart={addToCart}
                    goBack={() => setStep(1)}
                />
            )}


            <UserFooter />
        </>
    );
}

export default Home;