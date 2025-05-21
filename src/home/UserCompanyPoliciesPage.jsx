import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import UserNavbar from "./UserNavbar";
import UserFooter from "./UserFooter";

const contentMap = {
    "about-us": {
        title: "About Us",
        content: `
We are Luna, a creative technology company passionate about design, print, and digital art. Our journey began with a simple mission: to empower creators with easy-to-use tools and quality production services.

Over the years, Luna has grown into a community-driven brand that believes in the power of visual storytelling. From individuals to businesses, we help our customers turn ideas into reality — whether it's a custom t-shirt, a corporate branding kit, or digital artwork for the web.

We value creativity, quality, and innovation — and strive to exceed expectations in every project we deliver.
    `,
    },
    services: {
        title: "Services",
        content: `
Our offerings are tailored to meet a wide range of creative needs:

- **Graphic Design**: Logo creation, marketing materials, branding.
- **Merchandise Printing**: T-shirts, mugs, posters, tote bags, and more — customizable to your liking.
- **Digital Art Services**: Custom illustrations, social media graphics, digital portraits.
- **Business Solutions**: Corporate gifting, event branding, and promotional material packages.

We combine creativity with state-of-the-art technology to deliver reliable and high-quality results for both individuals and businesses.
    `,
    },
    support: {
        title: "Support",
        content: `
We take pride in offering reliable and responsive customer support:

- **24/7 Email Support**: Reach us anytime at support@lunatek.com
- **Live Chat**: Available on our website during business hours.
- **Order Tracking**: Easily monitor your order status in your account dashboard.
- **Customization Help**: Need assistance with your design or product selection? We're here to help.

Our goal is to ensure your experience with Luna is seamless, from browsing to unboxing.
    `,
    },
    terms: {
        title: "Terms & Conditions",
        content: `
By using our website and services, you agree to the following terms:

- Products are made to order and may have slight variations.
- All designs submitted by users must not violate intellectual property rights.
- Refunds and exchanges are handled per our return policy.
- Luna reserves the right to refuse service in cases of abuse or fraud.

We encourage users to review the full terms on our legal page to avoid misunderstandings.
    `,
    },
    privacy: {
        title: "Privacy Policy",
        content: `
Your privacy is important to us. Here's how we handle your data:

- **Information Collected**: Name, contact details, order history, and user-submitted content.
- **Usage**: To process orders, improve services, and provide support.
- **Security**: We use industry-standard measures to protect your data.
- **Third Parties**: We never sell your information. Limited data may be shared with partners solely to fulfill orders.

You may request access or deletion of your data at any time by contacting us.
    `,
    },
    copyright: {
        title: "Copyright Matters",
        content: `
All content on this website — including logos, images, text, and artwork — is protected under copyright law:

- Users must not reproduce, distribute, or use our content without written permission.
- Custom artwork created by Luna remains the property of the client once delivered.
- User-submitted designs must not infringe upon third-party intellectual property.

We take copyright violations seriously and will act accordingly to protect our creators and clients.
    `,
    },
};

const UserCompanyPoliciesPage = () => {
    const location = useLocation();
    const [activeSection, setActiveSection] = useState("about-us");

    useEffect(() => {
        const hash = location.hash?.replace("#", "");
        if (hash && contentMap[hash]) {
            setActiveSection(hash);
        }
    }, [location]);

    return (
        <>
            <UserNavbar />
            <div className="container-fluid bg-white text-black py-5">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-3 mb-4">
                        <div className="bg-black text-white rounded p-3 h-100">
                            <h5 className="fw-bold mb-3">Company/Policies</h5>
                            <ul className="list-group list-group-flush">
                                {Object.entries(contentMap).map(([key, { title }]) => (
                                    <li
                                        key={key}
                                        className={`list-group-item bg-black text-white border-0 px-0 py-2 ${activeSection === key ? "fw-bold text-decoration-underline" : ""
                                            }`}
                                        onClick={() => setActiveSection(key)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        {title}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-md-9">
                        <h2 className="fw-bold">{contentMap[activeSection].title}</h2>
                        <div className="mt-3">
                            <ReactMarkdown>
                                {contentMap[activeSection].content}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>
            <UserFooter />
        </>
    );
};

export default UserCompanyPoliciesPage;
