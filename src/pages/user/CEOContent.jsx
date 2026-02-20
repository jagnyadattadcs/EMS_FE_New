import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaQuoteLeft, FaLinkedin, FaTwitter, FaEnvelope } from 'react-icons/fa';
import { toast } from 'react-toastify';

const CEOContent = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (token && role !== "emp") {
            navigate("/admin/home");
        }
    }, [token, role, navigate]);

    const handleSendMessage = () => {
        if (message.trim()) {
            toast.success("Message sent to CEO successfully!");
            setMessage('');
            setShowMessage(false);
        } else {
            toast.error("Please enter a message");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Meet Our <span className="text-[#8BD005]">CEO</span>
                    </h1>
                    <h2 className="text-2xl font-semibold text-[#1B2749]">
                        Dayashankar Das
                    </h2>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    
                    {/* Left Content */}
                    <div className="space-y-6">
                        {/* Quote Card */}
                        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#8BD005]">
                            <FaQuoteLeft className="text-[#8BD005] text-2xl mb-2" />
                            <p className="text-gray-600 italic">
                                "Embrace the journey, for within every challenge lies an opportunity to grow and thrive."
                            </p>
                            <p className="text-right text-[#8BD005] font-medium mt-2">
                                - Dayashankar Das
                            </p>
                        </div>

                        {/* About CEO */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <FaUserTie className="text-[#8BD005] text-xl" />
                                <h3 className="text-lg font-semibold text-[#1B2749]">About CEO</h3>
                            </div>
                            
                            <div className="space-y-4 text-gray-600">
                                <p className="text-sm leading-relaxed">
                                    Honored to serve as CEO of our company, bringing a wealth of
                                    experience and passion to our team. With a focus on innovation,
                                    collaboration, and ethical leadership, we're poised for success.
                                </p>
                                <p className="text-sm leading-relaxed">
                                    At DCS, we're not just building a business; we're cultivating a
                                    community dedicated to excellence. Through transparency,
                                    integrity, and unwavering dedication, we forge ahead, united in
                                    our pursuit of greatness.
                                </p>
                            </div>
                        </div>

                        {/* Message Button */}
                        <button
                            onClick={() => setShowMessage(!showMessage)}
                            className="w-full bg-[#1B2749] hover:bg-[#2a3a5e] text-white py-3 px-4 rounded-lg transition-colors duration-300"
                        >
                            Send Message to CEO
                        </button>

                        {/* Message Input */}
                        {showMessage && (
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Write your message..."
                                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8BD005] text-sm"
                                    rows="3"
                                />
                                <div className="flex justify-end gap-2 mt-3">
                                    <button
                                        onClick={() => setShowMessage(false)}
                                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSendMessage}
                                        className="px-4 py-2 text-sm bg-[#8BD005] hover:bg-[#6d971a] text-white rounded-lg transition-colors"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Content - CEO Image */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="relative">
                            <img 
                                src='./dayasirphoto1.png' 
                                alt="CEO Dayashankar Das"
                                className="w-full h-130 rounded-lg"
                            />
                            
                            {/* Social Icons */}
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <a href="#" className="w-8 h-8 bg-[#1B2749] rounded-full flex items-center justify-center text-white hover:bg-[#8BD005] transition-colors">
                                    <FaLinkedin size={14} />
                                </a>
                                <a href="#" className="w-8 h-8 bg-[#1B2749] rounded-full flex items-center justify-center text-white hover:bg-[#8BD005] transition-colors">
                                    <FaTwitter size={14} />
                                </a>
                                <a href="mailto:ceo@dayacs.com" className="w-8 h-8 bg-[#1B2749] rounded-full flex items-center justify-center text-white hover:bg-[#8BD005] transition-colors">
                                    <FaEnvelope size={14} />
                                </a>
                            </div>
                        </div>

                        {/* Quick Info */}
                        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                            <div className="bg-gray-50 p-2 rounded">
                                <p className="text-xs text-gray-500">Experience</p>
                                <p className="text-sm font-bold text-[#1B2749]">20+ Years</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                                <p className="text-xs text-gray-500">Leadership</p>
                                <p className="text-sm font-bold text-[#1B2749]">15+ Years</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CEOContent;