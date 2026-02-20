import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const headers = {
        Authorization: `Bearer ${token}`,
    };
    const navigate = useNavigate();
    const { errorHandleLogout, setUser } = useAuth();

    const sliderImages = [
        {
            url: "https://cdn.pixabay.com/photo/2018/01/17/07/06/laptop-3087585_1280.jpg",
            alt: "Modern Workspace",
            caption: "Modern Workspace",
            description: "Enhance productivity with modern tools"
        },
        {
            url: "https://cdn.pixabay.com/photo/2016/02/07/21/03/computer-1185626_1280.jpg",
            alt: "Office Technology",
            caption: "Office Technology",
            description: "Stay connected with latest technology"
        },
        {
            url: "https://cdn.pixabay.com/photo/2016/11/22/21/26/notebook-1850613_1280.jpg",
            alt: "Creative Workspace",
            caption: "Creative Workspace",
            description: "Unleash your creativity"
        }
    ];

    const effectRan = useRef(false);

    useEffect(() => {
        if (!token || !userId) {
            navigate('/login');
            return;
        }

        // Prevent double execution in development
        if (effectRan.current === false) {
            const fetchUserProfile = async () => {
                try {
                    setIsLoading(true);
                    const res = await axios.get(`${BASE_URL}/users/profile?userId=${userId}`, {
                        headers: headers,
                    });
                    
                    if (res.data?.user) {
                        localStorage.setItem('dp', res.data.user.dp || '');
                        localStorage.setItem('name', res.data.user.name || '');
                        setUser(res.data?.user);
                    }
                } catch (err) {
                    if (err.response?.status === 401) {
                        toast.error("Session expired. Please login again.");
                        errorHandleLogout();
                    } else {
                        toast.error("Unable to fetch data!");
                    }
                    console.error("Error fetching profile:", err);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchUserProfile();
            
            return () => {
                effectRan.current = true;
            };
        }
    }, [token, userId, navigate, BASE_URL, errorHandleLogout]);

    // Auto-play functionality
    useEffect(() => {
        let interval;
        if (isAutoPlaying) {
            interval = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
            }, 4000);
        }
        return () => clearInterval(interval);
    }, [isAutoPlaying, sliderImages.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const goToPrevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
    };

    const goToNextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    };

    const pauseAutoPlay = () => {
        setIsAutoPlaying(false);
    };

    const resumeAutoPlay = () => {
        setIsAutoPlaying(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#8BD005] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Custom Manual Slider Section */}
                <div className="relative rounded-xl overflow-hidden shadow-2xl bg-linear-to-r from-gray-900 to-gray-800 p-4">
                    <div className="relative max-w-5xl mx-auto">
                        {/* Main Slider Container */}
                        <div className="relative h-100 md:h-125 lg:h-150 overflow-hidden rounded-lg">
                            {/* Images */}
                            {sliderImages.map((image, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                                        index === currentSlide
                                            ? 'opacity-100 translate-x-0'
                                            : index < currentSlide
                                            ? 'opacity-0 -translate-x-full'
                                            : 'opacity-0 translate-x-full'
                                    }`}
                                >
                                    <img 
                                        src={image.url} 
                                        alt={image.alt}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent">
                                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform transition-transform duration-700 delay-300">
                                            <h3 className="text-3xl md:text-4xl font-bold mb-2 transform transition-all duration-700 translate-y-0">
                                                {image.caption}
                                            </h3>
                                            <p className="text-lg text-gray-200 transform transition-all duration-700 delay-150">
                                                {image.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Navigation Arrows */}
                            <button
                                onClick={goToPrevSlide}
                                onMouseEnter={pauseAutoPlay}
                                onMouseLeave={resumeAutoPlay}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                                aria-label="Previous slide"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <button
                                onClick={goToNextSlide}
                                onMouseEnter={pauseAutoPlay}
                                onMouseLeave={resumeAutoPlay}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                                aria-label="Next slide"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Dots Navigation */}
                        <div className="flex justify-center gap-2 mt-4">
                            {sliderImages.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        goToSlide(index);
                                        pauseAutoPlay();
                                        setTimeout(resumeAutoPlay, 5000);
                                    }}
                                    className={`transition-all duration-300 ${
                                        index === currentSlide
                                            ? 'w-8 bg-[#8BD005]'
                                            : 'w-2 bg-gray-400 hover:bg-gray-300'
                                    } h-2 rounded-full`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;