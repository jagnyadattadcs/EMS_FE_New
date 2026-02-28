import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState("");
    const [activeCard, setActiveCard] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [time, setTime] = useState(new Date());
    const containerRef = useRef(null);

    const BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const headers = { Authorization: `Bearer ${token}` };
    const navigate = useNavigate();
    const { errorHandleLogout, setUser } = useAuth();
    const effectRan = useRef(false);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        if (!token || !userId) { navigate('/login'); return; }
        if (effectRan.current === false) {
            const fetchUserProfile = async () => {
                try {
                    setIsLoading(true);
                    const res = await axios.get(`${BASE_URL}/users/profile?userId=${userId}`, { headers });
                    if (res.data?.user) {
                        localStorage.setItem('dp', res.data.user.dp || '');
                        localStorage.setItem('name', res.data.user.name || '');
                        setUser(res.data?.user);
                        setUserName(res.data.user.name || 'User');
                    }
                } catch (err) {
                    if (err.response?.status === 401) {
                        toast.error("Session expired. Please login again.");
                        errorHandleLogout();
                    } else {
                        toast.error("Unable to fetch data!");
                    }
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUserProfile();
            return () => { effectRan.current = true; };
        }
    }, [token, userId, navigate, BASE_URL, errorHandleLogout]);

    const navigationCards = [
        {
            title: "CEO Content",
            description: "Announcements & updates from leadership",
            route: "/CEOContent",
            emoji: "📋",
            accent: "#6366f1",
            stat: "3 new",
        },
        {
            title: "Timesheet",
            description: "Track hours & manage your timesheets",
            route: "/timesheet",
            emoji: "⏱️",
            accent: "#10b981",
            stat: "This week",
        },
        {
            title: "Attendance",
            description: "Mark and view your daily attendance",
            route: "/attendance",
            emoji: "✅",
            accent: "#8BD005",
            stat: "Today",
        },
        {
            title: "Apply Leave",
            description: "Submit leave requests and check status",
            route: "/apply_leave",
            emoji: "🏖️",
            accent: "#f59e0b",
            stat: "12 days left",
        },
        {
            title: "Update Profile",
            description: "Manage your personal information",
            route: "/update_user",
            emoji: "👤",
            accent: "#ec4899",
            stat: "Profile",
        },
        {
            title: "Holiday List",
            description: "View upcoming holidays & celebrations",
            route: "/holiday-list",
            emoji: "🎉",
            accent: "#ef4444",
            stat: "Next: soon",
        },
    ];

    const greeting = () => {
        const h = time.getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    };

    const formatTime = (d) =>
        d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const formatDate = (d) =>
        d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

    if (isLoading) {
        return (
            <div style={styles.loadingScreen}>
                <div style={styles.loadingInner}>
                    <div style={styles.spinnerRing} />
                    <p style={styles.loadingText}>Loading your dashboard…</p>
                </div>
                <style>{spinnerCSS}</style>
            </div>
        );
    }

    return (
        <div ref={containerRef} style={styles.root}>
            {/* Ambient spotlight that follows mouse */}
            <div
                style={{
                    ...styles.spotlight,
                    background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(139,208,5,0.10), transparent 60%)`,
                }}
            />

            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.logoMark}>
                        <span style={styles.logoText}>{userName.charAt(0)+userName.split(" ")[1].charAt(0)}</span>
                    </div>
                    <div>
                        <p style={styles.greeting}>{greeting()},</p>
                        <h1 style={styles.userName}>{userName} <span style={styles.wave}>👋</span></h1>
                    </div>
                </div>
                <div style={styles.clock}>
                    <span style={styles.clockTime}>{formatTime(time)}</span>
                    <span style={styles.clockDate}>{formatDate(time)}</span>
                </div>
            </header>

            {/* Divider */}
            <div style={styles.divider}>
                <div style={styles.dividerLine} />
                <span style={styles.dividerLabel}>Quick Access</span>
                <div style={styles.dividerLine} />
            </div>

            {/* Cards Grid */}
            <main style={styles.grid}>
                {navigationCards.map((card, i) => (
                    <button
                        key={i}
                        style={{
                            ...styles.card,
                            ...(activeCard === i ? styles.cardActive : {}),
                            animationDelay: `${i * 80}ms`,
                        }}
                        onMouseEnter={() => setActiveCard(i)}
                        onMouseLeave={() => setActiveCard(null)}
                        onClick={() => navigate(card.route)}
                        aria-label={card.title}
                    >
                        {/* Glow blob */}
                        <div style={{ ...styles.cardGlow, background: card.accent, opacity: activeCard === i ? 0.15 : 0 }} />

                        {/* Top row */}
                        <div style={styles.cardTop}>
                            <span style={{ ...styles.cardEmoji, fontSize: activeCard === i ? "2.6rem" : "2.2rem" }}>
                                {card.emoji}
                            </span>
                            <span style={{ ...styles.cardBadge, background: `${card.accent}22`, color: card.accent }}>
                                {card.stat}
                            </span>
                        </div>

                        {/* Content */}
                        <h3 style={{ ...styles.cardTitle, color: activeCard === i ? card.accent : "#1e293b" }}>
                            {card.title}
                        </h3>
                        <p style={styles.cardDesc}>{card.description}</p>

                        {/* Arrow */}
                        <div style={{ ...styles.cardArrow, opacity: activeCard === i ? 1 : 0, color: card.accent }}>
                            Go →
                        </div>

                        {/* Bottom accent bar */}
                        <div style={{
                            ...styles.cardBar,
                            background: card.accent,
                            transform: `scaleX(${activeCard === i ? 1 : 0})`,
                        }} />
                    </button>
                ))}
            </main>

            <style>{globalCSS}</style>
        </div>
    );
};

const styles = {
    root: {
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#1e293b",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        position: "relative",
        overflow: "hidden",
        padding: "0 0 60px",
    },
    spotlight: {
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        transition: "background 0.1s",
    },
    header: {
        position: "relative",
        zIndex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        padding: "28px 40px 24px",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 1px 20px rgba(0,0,0,0.06)",
    },
    headerLeft: { display: "flex", alignItems: "center", gap: "16px" },
    logoMark: {
        width: 48,
        height: 48,
        borderRadius: 14,
        background: "linear-gradient(135deg, #8BD005, #5a9e00)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 14px rgba(139,208,5,0.4)",
    },
    logoText: { fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: 1 },
    greeting: { fontSize: 13, color: "#94a3b8", margin: 0, letterSpacing: 0.5 },
    userName: { fontSize: "1.6rem", fontWeight: 800, margin: 0, letterSpacing: -0.5, color: "#0f172a" },
    wave: { display: "inline-block", animation: "wave 1.8s infinite" },
    clock: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 2,
    },
    clockTime: { fontSize: "1.4rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "#8BD005" },
    clockDate: { fontSize: 12, color: "#94a3b8" },
    divider: {
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "32px 40px 0",
        position: "relative",
        zIndex: 1,
    },
    dividerLine: { flex: 1, height: 1, background: "rgba(0,0,0,0.07)" },
    dividerLabel: { fontSize: 11, color: "#94a3b8", letterSpacing: 2, textTransform: "uppercase", whiteSpace: "nowrap" },
    grid: {
        position: "relative",
        zIndex: 1,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 20,
        padding: "28px 40px 0",
    },
    card: {
        position: "relative",
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.07)",
        borderRadius: 20,
        padding: "24px 24px 20px",
        cursor: "pointer",
        textAlign: "left",
        overflow: "hidden",
        transition: "transform 0.25s cubic-bezier(.34,1.56,.64,1), box-shadow 0.25s, border-color 0.25s",
        animation: "fadeSlideIn 0.5s ease both",
        outline: "none",
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    },
    cardActive: {
        transform: "translateY(-6px) scale(1.02)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
        borderColor: "rgba(0,0,0,0.12)",
    },
    cardGlow: {
        position: "absolute",
        inset: 0,
        borderRadius: 20,
        pointerEvents: "none",
        transition: "opacity 0.3s",
    },
    cardTop: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    cardEmoji: {
        display: "block",
        lineHeight: 1,
        transition: "font-size 0.2s",
    },
    cardBadge: {
        fontSize: 11,
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: 99,
        letterSpacing: 0.3,
    },
    cardTitle: {
        fontSize: "1.15rem",
        fontWeight: 700,
        margin: "0 0 6px",
        transition: "color 0.25s",
        position: "relative",
    },
    cardDesc: {
        fontSize: 13,
        color: "#94a3b8",
        margin: 0,
        lineHeight: 1.6,
        position: "relative",
    },
    cardArrow: {
        position: "absolute",
        bottom: 18,
        right: 20,
        fontSize: 13,
        fontWeight: 700,
        transition: "opacity 0.2s",
    },
    cardBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        transformOrigin: "left",
        transition: "transform 0.3s cubic-bezier(.34,1.56,.64,1)",
        borderRadius: "0 0 20px 20px",
    },
    loadingScreen: {
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    loadingInner: { textAlign: "center" },
    spinnerRing: {
        width: 56,
        height: 56,
        borderRadius: "50%",
        border: "3px solid rgba(139,208,5,0.2)",
        borderTop: "3px solid #8BD005",
        animation: "spin 0.8s linear infinite",
        margin: "0 auto",
    },
    loadingText: { color: "#94a3b8", marginTop: 16, fontSize: 14 },
};

const globalCSS = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');

    @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes wave {
        0%, 100% { transform: rotate(0deg); }
        25%       { transform: rotate(20deg); }
        75%       { transform: rotate(-10deg); }
    }
`;

const spinnerCSS = `
    @keyframes spin { to { transform: rotate(360deg); } }
`;

export default Home;
