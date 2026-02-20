import React, { useState } from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import { toast } from "react-toastify";

function Footer() {
    const [email, setEmail] = useState("");
    const [isHovered, setIsHovered] = useState(null);

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (email) {
            toast.success("Subscribed to newsletter successfully!");
            setEmail("");
        } else {
            toast.error("Please enter your email");
        }
    };

    const quickLinks = [
        { name: "Make Appointment", path: "#" },
        { name: "Customer Services", path: "#" },
        { name: "Department Services", path: "#" },
        { name: "About Company", path: "#" },
        { name: "Internship", path: "#" },
        { name: "Our Case Studies", path: "#" },
        { name: "Free Consultation", path: "#" },
        { name: "Meet Our Experts", path: "#" },
    ];

    const socialLinks = [
        { icon: <FaFacebookF size={18} />, href: "https://www.facebook.com/dayaconsultancyservicespvt.ltd/", name: "Facebook", color: "hover:bg-[#1877F2]" },
        { icon: <FaTwitter size={18} />, href: "https://twitter.com/i/flow/login?redirect_after_login=%2FDayaservices", name: "Twitter", color: "hover:bg-[#1DA1F2]" },
        { icon: <FaInstagram size={18} />, href: "https://www.instagram.com/dcs.odisha/", name: "Instagram", color: "hover:bg-[#E4405F]" },
        { icon: <FaLinkedinIn size={18} />, href: "https://www.linkedin.com/company/daya-consultancy-services/", name: "LinkedIn", color: "hover:bg-[#0A66C2]" },
    ];

    return (
        <footer className="bg-linear-to-br from-[#1B2749] to-[#2a3a5e] text-white mt-auto">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    
                    {/* About Section */}
                    <div className="space-y-4 animate-fadeIn">
                        <h3 className="text-2xl font-bold relative inline-block">
                            About Business
                            <span className="absolute bottom-0 left-0 w-12 h-1 bg-[#8BD005] rounded-full"></span>
                        </h3>
                        <p className="text-gray-300 leading-relaxed text-sm">
                            Crowned as IT consulting maestros, we possess the adeptness to dissect your
                            organizational dilemmas from a panoramic perspective. With finesse, we offer
                            tailored recommendations crafted to elevate your operational landscape.
                            Trust in our expertise to navigate the intricate pathways of your
                            challenges, paving the way for transformative solutions
                        </p>
                        
                        {/* Social Icons */}
                        <div className="flex gap-3 pt-4">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onMouseEnter={() => setIsHovered(social.name)}
                                    onMouseLeave={() => setIsHovered(null)}
                                    className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${social.color} ${
                                        isHovered === social.name ? 'scale-110' : ''
                                    }`}
                                    aria-label={social.name}
                                >
                                    <span className={isHovered === social.name ? 'text-white' : 'text-gray-300'}>
                                        {social.icon}
                                    </span>
                                </a>
                            ))}
                        </div>

                        {/* Newsletter Subscription */}
                        <div className="mt-6">
                            <h4 className="text-lg font-semibold mb-3">Subscribe to Newsletter</h4>
                            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email"
                                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#8BD005] transition-colors"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-[#8BD005] hover:bg-[#6d971a] text-white rounded-lg transition-all duration-300 transform hover:scale-105 font-medium"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Quick Links Section */}
                    <div className="space-y-4 animate-fadeIn animation-delay-200">
                        <h3 className="text-2xl font-bold relative inline-block">
                            Quick Links
                            <span className="absolute bottom-0 left-0 w-12 h-1 bg-[#8BD005] rounded-full"></span>
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {quickLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.path}
                                    className="text-gray-300 hover:text-[#8BD005] transition-all duration-300 transform hover:translate-x-2 flex items-center gap-2 group"
                                >
                                    <span className="w-1 h-1 bg-[#8BD005] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    {link.name}
                                </a>
                            ))}
                        </div>

                        {/* Business Hours */}
                        <div className="mt-6 p-4 bg-white/5 rounded-lg">
                            <h4 className="text-lg font-semibold mb-2">Business Hours</h4>
                            <div className="space-y-1 text-sm text-gray-300">
                                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                                <p>Saturday: 10:00 AM - 4:00 PM</p>
                                <p>Sunday: Closed</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="space-y-4 animate-fadeIn animation-delay-400">
                        <h3 className="text-2xl font-bold relative inline-block">
                            Contact Us
                            <span className="absolute bottom-0 left-0 w-12 h-1 bg-[#8BD005] rounded-full"></span>
                        </h3>
                        
                        <div className="space-y-4">
                            {/* Address */}
                            <div className="flex gap-3 group">
                                <div className="w-8 h-8 rounded-full bg-[#8BD005]/20 flex items-center justify-center shrink-0 group-hover:bg-[#8BD005] transition-colors">
                                    <FaMapMarkerAlt className="text-[#8BD005] group-hover:text-white transition-colors" size={16} />
                                </div>
                                <div>
                                    <p className="font-semibold mb-1">Our Address</p>
                                    <div className="text-gray-300 text-sm space-y-1">
                                        <p><span className="font-medium text-[#8BD005]">Head Office:</span> Puri, Odisha</p>
                                        <p><span className="font-medium text-[#8BD005]">Branch Office:</span> B-19, 1st floor, Bhubaneswar, Odisha</p>
                                    </div>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex gap-3 group">
                                <div className="w-8 h-8 rounded-full bg-[#8BD005]/20 flex items-center justify-center shrink-0 group-hover:bg-[#8BD005] transition-colors">
                                    <FaPhone className="text-[#8BD005] group-hover:text-white transition-colors" size={16} />
                                </div>
                                <div>
                                    <p className="font-semibold mb-1">Talk To Expert</p>
                                    <a 
                                        href="tel:+918144802704"
                                        className="text-gray-300 hover:text-[#8BD005] transition-colors text-sm block"
                                    >
                                        +91 8144802704
                                    </a>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex gap-3 group">
                                <div className="w-8 h-8 rounded-full bg-[#8BD005]/20 flex items-center justify-center shrink-0 group-hover:bg-[#8BD005] transition-colors">
                                    <FaEnvelope className="text-[#8BD005] group-hover:text-white transition-colors" size={16} />
                                </div>
                                <div>
                                    <p className="font-semibold mb-1">Email Us</p>
                                    <a 
                                        href="mailto:info@Dayacs.com"
                                        className="text-gray-300 hover:text-[#8BD005] transition-colors text-sm block"
                                    >
                                        info@Dayacs.com
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="mt-6 rounded-lg overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                            <iframe
                                title="Office Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7484.503512911215!2d85.8454036!3d20.289843900000005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19a14fd5712c61%3A0x9b02a71f624c28dd!2sDaya%20Consultancy%20Services%20Pvt.%20Ltd.!5e0!3m2!1sen!2sin!4v1689834516745!5m2!1sen!2sin"
                                width="100%"
                                height="180"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 bg-black/20">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                        <p>© {new Date().getFullYear()} Daya Consultancy Services. All rights reserved.</p>
                        <div className="flex gap-4 mt-2 md:mt-0">
                            <a href="#" className="hover:text-[#8BD005] transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-[#8BD005] transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-[#8BD005] transition-colors">Sitemap</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add animation styles */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out forwards;
                }
                
                .animation-delay-200 {
                    animation-delay: 0.2s;
                }
                
                .animation-delay-400 {
                    animation-delay: 0.4s;
                }
            `}</style>
        </footer>
    );
}

export default Footer;