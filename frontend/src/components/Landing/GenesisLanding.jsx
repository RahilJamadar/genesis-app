import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useGLTF } from '@react-three/drei'; // Required for global preloading
import MatrixModel from '../../ThreeModel/RotatingModel';
import getApiBase from '../../utils/getApiBase';
import { User, Phone, Download } from 'lucide-react';

// =================================================================
// 🚀 GLOBAL PERFORMANCE OPTIMIZATION
// =================================================================
// This triggers the 7.3MB download immediately when the JS starts parsing, 
// rather than waiting for the Hero component to mount.
const DRACO_URL = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';
const GLB_PATH = "/genesis_logo.glb";
useGLTF.preload(GLB_PATH, DRACO_URL);

// =================================================================
// 0. DATA: EVENT DETAILS & SPONSORS
// =================================================================

const EVENTS_DATA = {
    "PRE-EVENTS": {
        title: "PRE-EVENTS",
        description: "The hype begins early. Engage in high-stakes challenges before the main day.",
        color: "from-yellow-500/20 to-amber-600/20",
    },
    "TECHNICAL": {
        title: "TECHNICAL",
        description: "The backbone of Genesis. Prove your coding prowess and logical reasoning.",
        color: "from-cyan-500/20 to-blue-600/20",
    },
    "CULTURAL": {
        title: "CULTURAL",
        description: "Unleash your creativity. A stage for performers to showcase their talent.",
        color: "from-purple-500/20 to-pink-600/20",
    },
    "GAMING": {
        title: "GAMING",
        description: "Enter the arena. Reflexes and strategy will decide the champions.",
        color: "from-green-500/20 to-emerald-600/20",
    },
    "SPORTS": {
        title: "SPORTS",
        description: "Physical prowess meets strategy. Dominate the field.",
        color: "from-orange-500/20 to-red-600/20",
    }
};

const CATEGORY_MAP = {
    "PRE-EVENTS": "Pre-events",
    "TECHNICAL": "Tech",
    "CULTURAL": "Cultural",
    "GAMING": "Gaming",
    "SPORTS": "Sports"
};

const TOP_SPONSORS = [
    { name: "Anthony Vaz", img: "/anthony.jpeg", portrait: true },
    { name: "AR Computer Services", img: "/ar.jpeg", stretch: true }, // Marked for stretching
    { name: "Krishna Daji Salkar", img: "/daji.jpeg", portrait: true },
];

const GENERAL_SPONSORS = [
    { name: "Afreen Shaikh", img: "/afreen.jpeg", portrait: true }, // Marked for stretching
    { name: "Nafisa Shaikh", img: "/nafisa.jpg", portrait: true },
    { name: "Digital Computers", img: "/digital.jpeg", stretch: true },
    { name: "VCare", img: "/vcare.JPG", stretch: true },
    { name: "Raymond Hardware", img: "/raymond.png" },
];

// =================================================================
// 1. ICONS
// =================================================================

const IconWrapper = ({ children, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {children}
    </svg>
)

const Gamepad2 = (props) => <IconWrapper {...props}><path d="M6 12h4" /><path d="M14 12h4" /><path d="M12 10v4" /><path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></IconWrapper>
const Code = (props) => <IconWrapper {...props}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></IconWrapper>
const Music = (props) => <IconWrapper {...props}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></IconWrapper>
const Trophy = (props) => <IconWrapper {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5h15a2.5 2.5 0 0 1 0 5H18" /><path d="M8 14l2-2 2 2 2-2 2 2" /><path d="M15 11l-2-2-2 2-2-2" /><path d="M6 15v-3a6.5 6.5 0 0 1 0-1.5 6.5 6.5 0 0 1 12 0 6.5 6.5 0 0 1 0 1.5v3" /><path d="M12 21h0.01" /></IconWrapper>
const Zap = (props) => <IconWrapper {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></IconWrapper>
const ChevronDown = (props) => <IconWrapper {...props}><path d="m6 9 6 6 6-6" /></IconWrapper>
const ExternalLink = (props) => <IconWrapper {...props}><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></IconWrapper>
// const User = (props) => <IconWrapper {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></IconWrapper>
const MapPin = (props) => <IconWrapper {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></IconWrapper>
const ArrowLeft = (props) => <IconWrapper {...props}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></IconWrapper>

// =================================================================
// 2. VISUAL EFFECTS COMPONENTS
// =================================================================

const PowerSurge = () => {
    const [active, setActive] = useState(false)
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.95) { setActive(true); setTimeout(() => setActive(false), 50 + Math.random() * 100) }
        }, 3000)
        return () => clearInterval(interval)
    }, [])
    return <div className={`fixed inset-0 bg-white/5 z-50 pointer-events-none mix-blend-overlay transition-opacity duration-75 ${active ? "opacity-100" : "opacity-0"}`} />
}

const WhiteDynamicLines = () => {
    const lineConfigs = useMemo(() => ({
        horizontal: [...Array(6)].map(() => ({
            top: `${10 + Math.random() * 80}%`,
            width: '30vw',
            opacity: 0.7,
            duration: 5 + Math.random() * 5,
            delay: Math.random() * 5
        })),
        vertical: [...Array(8)].map(() => ({
            left: `${5 + Math.random() * 90}%`,
            height: `${30 + Math.random() * 50}vh`,
            opacity: 0.7,
            duration: 4 + Math.random() * 6,
            delay: Math.random() * 5,
            xDrift: Math.random() > 0.5 ? 50 : -50
        }))
    }), []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {lineConfigs.horizontal.map((config, i) => (
                <motion.div
                    key={`h-${i}`}
                    className="absolute h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent"
                    style={{ top: config.top, width: config.width, opacity: config.opacity }}
                    animate={{ x: ["-100vw", "120vw"], opacity: [0, 0.6, 0] }}
                    transition={{ duration: config.duration, repeat: Infinity, ease: "linear", delay: config.delay }}
                />
            ))}
            {lineConfigs.vertical.map((config, i) => (
                <motion.div
                    key={`v-${i}`}
                    className="absolute w-[1px] bg-gradient-to-b from-transparent via-white/80 to-transparent"
                    style={{ left: config.left, height: config.height, opacity: config.opacity }}
                    animate={{ y: ["-100vh", "150vh"], opacity: [0, 1, 0], x: [0, config.xDrift, 0] }}
                    transition={{ duration: config.duration, repeat: Infinity, ease: "linear", delay: config.delay }}
                />
            ))}
        </div>
    )
}

const ExplosiveEntry = ({ children, delay = 0 }) => (
    <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30, filter: "blur(4px)" }}
        whileInView={{ scale: 1, opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ type: "spring", stiffness: 100, damping: 15, mass: 1, delay: delay }}
        className="relative h-full"
    >
        {children}
        <motion.div initial={{ opacity: 0.8, scale: 1 }} whileInView={{ opacity: 0, scale: 1.2 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: "easeOut", delay: delay }} className="absolute inset-0 bg-cyan-400/10 rounded-xl pointer-events-none z-20" />
    </motion.div>
)

const MatrixCube = ({ color = "green", size = 280 }) => {
    return (
        <MatrixModel
            color={color}
            size={size}
            glbPath={GLB_PATH}
        />
    );
}

const HoloGyro = () => (
    <div className="relative flex items-center justify-center w-full max-w-[30rem] h-[30rem] opacity-40 pointer-events-none perspective-[1000px]">
        <motion.div
            animate={{ rotateX: 0, rotateY: 180 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-cyan-500/30 border-dashed shadow-[0_0_25px_rgba(6,182,212,0.2)]"
            style={{ transformStyle: "preserve-3d" }}
        />
        <motion.div
            animate={{ rotateY: 360, rotateZ: 0 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-8 rounded-full border border-purple-500/30 border-dotted shadow-[0_0_25px_rgba(168,85,247,0.2)]"
            style={{ transformStyle: "preserve-3d" }}
        />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 3, repeat: Infinity }} className="w-24 h-24 bg-gradient-to-br from-cyan-400/40 to-purple-500/40 rounded-full blur-xl" />
    </div>
)

const TARGET_DATE = new Date('2026-02-07T08:00:00');

const calculateTimeLeft = (targetDate) => {
    const difference = +targetDate - +new Date();
    let timeLeft = {};
    if (difference > 0) {
        timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
    } else {
        timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return timeLeft;
};

const Countdown = () => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(TARGET_DATE));
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(TARGET_DATE));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex space-x-4 md:space-x-8 font-mono text-cyan-400">
            {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="flex flex-col items-center">
                    <span className="text-3xl md:text-5xl font-bold tracking-widest backdrop-blur-sm bg-black/30 p-2 border border-cyan-500/30 rounded">{value.toString().padStart(2, "0")}</span>
                    <span className="text-xs uppercase tracking-widest mt-2 text-gray-500">{unit}</span>
                </div>
            ))}
        </div>
    )
}

// =================================================================
// 3. PAGE COMPONENTS
// =================================================================

const Hero = () => {
    const { scrollY } = useScroll()
    const y1 = useTransform(scrollY, [0, 500], [0, 200])
    const opacity = useTransform(scrollY, [0, 300], [1, 0])

    // ✅ Initialize with a high default to prevent layout-shift flash
    const [heroSize, setHeroSize] = useState(1000);

    useEffect(() => {
        const calculateSize = () => {
            const size = Math.max(window.innerHeight, window.innerWidth);
            setHeroSize(size);
        };
        calculateSize();
        window.addEventListener('resize', calculateSize);
        return () => window.removeEventListener('resize', calculateSize);
    }, []);

    return (
        <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
            {/* 1. Background Layers (Lowest Z-Index) */}
            <div className="z-0">
                <WhiteDynamicLines />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none" />
            </div>

            {/* 2. 3D Model - Added pointer-events-none to prevent interaction issues */}
            <div
                className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none -mt-[60px] md:-mt-8"
                style={{ width: '100vw', height: '100vh' }}
            >
                <Suspense fallback={null}>
                    <MatrixCube color="green" size={heroSize} />
                </Suspense>
            </div>

            {/* 3. UI Content (Highest Z-Index) */}
            <motion.div
                style={{ y: y1, opacity }}
                className="z-20 flex flex-col items-center justify-between h-full w-full max-w-7xl px-4 py-8 pointer-events-none"
            >
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mt-10 flex items-center space-x-2 pointer-events-auto">
                    <span className="px-2 py-1 border border-green-500/30 rounded text-xs font-mono text-green-400 bg-green-900/10 backdrop-blur-sm">SYSTEM READY</span>
                    <span className="px-2 py-1 border border-cyan-500/30 rounded text-xs font-mono text-cyan-400 bg-cyan-900/10 backdrop-blur-sm">V 8.0</span>
                </motion.div>

                <motion.div className="flex flex-col items-center justify-center text-center">
                    <p className="
        mt-[40vh]            /* 📱 Mobile: 10rem (Default) */
        md:mt-60         /* 💻 Tablet: 15rem */
        lg:mt-80         /* 🖥️ Desktop: 20rem */
        text-xl md:text-2xl font-light tracking-[0.2em] 
        text-gray-400 uppercase bg-black/40 backdrop-blur-sm 
        p-2 rounded pointer-events-auto"
                    >
                        The Rise of Next Generation
                    </p>
                </motion.div>

                <div className="flex flex-col items-center pointer-events-auto mt-[20vh] mb-10 mt-4">
                    {/* 🚀 Move up by 10 units on mobile, reset to 0 on desktop */}
                    <div className="-mt-10 md:mt-0 flex flex-col items-center">
                        <Countdown />
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="mt-4 animate-bounce"
                    >
                        <ChevronDown className="w-8 h-8 text-gray-500" />
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
};

const AboutSection = () => (
    <section id="about" className="relative min-h-[60vh] bg-black flex items-center justify-center py-24 px-4 overflow-hidden">
        {/* Decorative Background Glows */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-900/20 rounded-full blur-[100px]" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tighter"
            >
                ABOUT <span className="text-cyan-400">GENESIS 8.0</span>
            </motion.h2>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg md:text-2xl text-gray-300 leading-relaxed space-y-8"
            >
                <p>
                    Genesis 8.0 marks the evolution of our digital frontier. An initiative organized by the students of the BCA Program, under the guidance of the faculty at M.E.S. Vasant Joshi College of Arts & Commerce, it represents the convergence of culture, technology, and gaming.
                </p>
                <p>
                    This year, we transcend boundaries with <span className="text-green-400 font-mono">GENESIS 8.0</span>. A nexus where code meets creativity and where the next generation of tech leaders rises.
                </p>

                {/* Download Button Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="pt-8"
                >
                    <a
                        href="/Genesis_8.0.pdf" // Replace with your actual file path
                        download="Genesis_8.0_Brochure"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 w-full md:w-auto bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 rounded-xl font-mono text-[10px] md:text-xs uppercase tracking-widest hover:bg-cyan-400 hover:text-black transition-all duration-300 no-underline"
                    >
                        <Download className="w-5 h-5" />
                        DOWNLOAD BROCHURE
                    </a>
                </motion.div>

                <p className="text-cyan-400 font-mono text-sm md:text-base mt-8 opacity-80">
                    {"// SYSTEM STATUS: ONLINE"}<br />
                    {"// PROTOCOL: ENGAGE"}
                </p>
            </motion.div>
        </div>
    </section>
);

const EventCard = ({ title, icon: Icon, desc, color, onClick }) => (
    <motion.div
        whileHover={{ y: -10, scale: 1.02 }}
        onClick={onClick}
        className="relative group bg-gray-900/80 border border-gray-800 p-6 rounded-xl overflow-hidden cursor-pointer backdrop-blur-sm h-full flex flex-col"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-20 transition-all duration-300 scale-150 group-hover:scale-100`} />
        <div className="relative z-10 flex flex-col h-full">
            <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-gray-700 group-hover:border-white/40 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 font-mono tracking-wide group-hover:text-cyan-400 transition-colors">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed flex-grow">{desc}</p>
            <div className="mt-6 flex items-center justify-between border-t border-gray-800 pt-4">
                <div className="flex items-center text-xs text-cyan-400 font-mono"><span className="w-2 h-2 bg-cyan-500 rounded-full mr-2 animate-pulse"></span>ONLINE</div>
                <div className="text-xs text-gray-500 group-hover:text-white flex items-center gap-1">DETAILS <ExternalLink className="w-3 h-3" /></div>
            </div>
        </div>
    </motion.div>
)

const EventsGrid = ({ onEventSelect }) => (
    <section id="events" className="bg-black py-24 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0 scale-50 md:scale-100"><HoloGyro /></div>
        <div className="max-w-7xl mx-auto relative z-10">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tighter animate-pulse">EVENT PROTOCOLS</h2>
                <div className="h-1 w-40 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto rounded-full"></div>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <ExplosiveEntry delay={0.1}>
                    <EventCard
                        title="PRE-EVENTS"
                        icon={Zap}
                        desc="Ignite the spark before the main surge. Early stage challenges to test your baseline skills."
                        color="from-yellow-500/20 to-amber-600/20"
                        onClick={() => onEventSelect("PRE-EVENTS")}
                    />
                </ExplosiveEntry>

                <ExplosiveEntry delay={0.2}>
                    <EventCard
                        title="TECHNICAL"
                        icon={Code}
                        desc="The logical core of Genesis. Engage in high-stakes problem solving and digital engineering."
                        color="from-cyan-500/20 to-blue-600/20"
                        onClick={() => onEventSelect("TECHNICAL")}
                    />
                </ExplosiveEntry>

                <ExplosiveEntry delay={0.3}>
                    <EventCard
                        title="CULTURAL"
                        icon={Music}
                        desc="Expression meets evolution. Showcase your creative identity on the grand stage of Genesis."
                        color="from-purple-500/20 to-pink-600/20"
                        onClick={() => onEventSelect("CULTURAL")}
                    />
                </ExplosiveEntry>

                <ExplosiveEntry delay={0.4}>
                    <EventCard
                        title="GAMING"
                        icon={Gamepad2}
                        desc="Enter the reflex-driven arena. Strategy and precision define the next generation of champions."
                        color="from-green-500/20 to-emerald-600/20"
                        onClick={() => onEventSelect("GAMING")}
                    />
                </ExplosiveEntry>

                <ExplosiveEntry delay={0.5}>
                    <EventCard
                        title="SPORTS"
                        icon={Trophy}
                        desc="Peak physical performance. Dominate the field through tactical grit and athletic prowess."
                        color="from-orange-500/20 to-red-600/20"
                        onClick={() => onEventSelect("SPORTS")}
                    />
                </ExplosiveEntry>
            </div>
        </div>
    </section>
);

const SponsorsSection = () => {
    // Note: TOP_SPONSORS and GENERAL_SPONSORS should be arrays of objects:
    // { name: "Brand", img: "/path.png", portrait: true/false, stretch: true/false }

    const MarqueeRow = ({ sponsors, direction = "forward", speed = "40s", size = "large" }) => {
        // Triple the array for a truly seamless loop
        const items = [...sponsors, ...sponsors, ...sponsors];

        const cardStyles = size === "large"
            ? "w-[280px] h-[160px] md:w-[450px] md:h-[250px]"
            : "w-[200px] h-[100px] md:w-[300px] md:h-[160px]";

        return (
            <div className="relative flex overflow-hidden group select-none py-4">
                <div className={`flex items-center space-x-6 md:space-x-12 py-4 animate-scroll-${direction}`}
                    style={{ animationDuration: speed }}>
                    {items.map((sponsor, index) => (
                        <div key={index} className="flex-shrink-0 flex flex-col items-center group/card">
                            <div className={`${cardStyles} relative mb-4`}>
                                {/* Card Background */}
                                <div className="absolute inset-0 bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl transition-all duration-500 group-hover/card:bg-white/[0.05] group-hover/card:border-cyan-400/50 group-hover/card:shadow-[0_0_30px_rgba(6,182,212,0.15)]" />

                                {/* LOGO WRAPPER: Responsive padding based on orientation */}
                                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500
                                    ${sponsor.portrait ? 'p-2 md:p-4' : 'p-6 md:p-10'}
                                `}>
                                    <img
                                        src={sponsor.img}
                                        alt={sponsor.name}
                                        className={`filter brightness-90 group-hover/card:brightness-110 group-hover/card:scale-105 transition-all duration-700 ease-in-out
                                            ${sponsor.stretch ? "w-full h-full object-fill" : ""}
                                            ${sponsor.portrait ? "h-[90%] w-auto object-contain scale-110" : ""}
                                            ${!sponsor.stretch && !sponsor.portrait ? "max-w-full max-h-full object-contain" : ""}
                                        `}
                                        loading="lazy"
                                    />
                                </div>

                                {/* Tech accents */}
                                <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-white/20 group-hover/card:border-cyan-400 transition-colors" />
                                <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-white/20 group-hover/card:border-cyan-400 transition-colors" />
                            </div>

                            {/* Label */}
                            <span className="text-gray-500 group-hover/card:text-cyan-400 font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase transition-colors">
                                {sponsor.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <section id="sponsors" className="bg-black py-20 md:py-32 relative overflow-hidden border-y border-white/5">

            {/* --- THEME BACKGROUND ELEMENTS --- */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 blur-[150px] pointer-events-none" />

            {/* --- SECTION HEADER --- */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16 relative z-10 px-4"
            >
                <h2 className="text-4xl md:text-7xl font-black text-white tracking-[0.2em] uppercase italic">
                    POWERING <span className="text-cyan-400 text-glow">GENESIS</span>
                </h2>
                <div className="h-[1px] w-48 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto mt-6" />
            </motion.div>

            {/* --- SLIDERS CONTAINER --- */}
            <div className="relative z-10 space-y-12 md:space-y-20">

                {/* Visual Edge Fades */}
                <div className="absolute inset-y-0 left-0 w-24 md:w-80 bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-24 md:w-80 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none" />

                {/* Top Tier Slider */}
                <div className="relative">
                    <div className="px-4 mb-4 text-center">
                        <span className="text-cyan-400/60 font-mono text-sm tracking-[0.5em] uppercase">-- Platinum Partners --</span>
                    </div>
                    <MarqueeRow sponsors={TOP_SPONSORS} direction="forward" speed="50s" size="large" />
                </div>

                {/* General Tier Slider */}
                <div className="relative opacity-80 hover:opacity-100 transition-opacity duration-500">
                    <div className="px-4 mb-4 text-center">
                        <span className="text-gray-500 font-mono text-sm tracking-[0.5em] uppercase">-- Supporting Partners --</span>
                    </div>
                    <MarqueeRow sponsors={GENERAL_SPONSORS} direction="reverse" speed="40s" size="small" />
                </div>
            </div>

            {/* --- CSS ANIMATIONS --- */}
            <style jsx>{`
                @keyframes scroll-forward {
                    from { transform: translateX(0); }
                    to { transform: translateX(calc(-100% / 3)); }
                }
                @keyframes scroll-reverse {
                    from { transform: translateX(calc(-100% / 3)); }
                    to { transform: translateX(0); }
                }
                .animate-scroll-forward {
                    animation: scroll-forward linear infinite;
                    width: max-content;
                }
                .animate-scroll-reverse {
                    animation: scroll-reverse linear infinite;
                    width: max-content;
                }
                /* Pause on hover for the entire marquee */
                .group:hover .animate-scroll-forward,
                .group:hover .animate-scroll-reverse {
                    animation-play-state: paused;
                }
                .text-glow {
                    text-shadow: 0 0 20px rgba(34, 211, 238, 0.5);
                }
                /* Faster scroll for mobile to keep it engaging */
                @media (max-width: 768px) {
                    .animate-scroll-forward, .animate-scroll-reverse {
                        animation-duration: 25s !important;
                    }
                }
            `}</style>
        </section>
    );
};


const Coordinators = () => {
    const mainCoordinator = {
        name: "Rahil Jamadar",
        role: "EVENT COORDINATOR",
        phone: "9823988047",
        photo: "/rahil.jpeg"
    };

    const departmentHeads = [
        { name: "Sujith Roshan", role: "DESIGNER", photo: "/sujith.jpeg" },
        { name: "Ayush Maurya", role: "CONTENT HEAD", photo: "/content.jpeg" },
        { name: "Adnan Sayed", role: "MARKETING HEAD", photo: "/adnan.jpeg" },
        { name: "Shreshth Alornecar", role: "VIDEOGRAPHER", photo: "/videographer.jpg" },
        { name: "Lucky Ali", role: "EDITOR", photo: "/Editor.jpeg" },
        { name: "Gaurav Gupta", role: "BROCHURE HEAD", photo: "/gaurav.jpg" },
        { name: "Sakshi Singh", role: "BROCHURE TEAM", photo: "/sakshi.jpeg" },
        { name: "Pranav Powar", role: "EVENT ASSISTANT", photo: "/pranav.jpeg" },
        { name: "Prince Naik", role: "DECORATION TEAM", photo: "/prince.jpeg" },
        { name: "Amaan Sayed", role: "DESIGNING TEAM", photo: "/amaan.jpeg" },
        { name: "Hiba Shaikh", role: "DESIGNING TEAM", photo: "/hiba.jpeg" },
        { name: "Suman Ganati", role: "DECORATION TEAM", photo: "/suman.png" },
        { name: "Mehraj Shaikh", role: "DECORATION TEAM", photo: "/team/mehrajShaikh.jpeg" },



    ];

    // Duplicate list for seamless infinite loop
    const sliderItems = [...departmentHeads, ...departmentHeads];
    const duplicatedItems = [...sliderItems, ...sliderItems];

    return (
        <section id='contactco' className="py-24 bg-gradient-to-b from-black via-gray-900 to-black text-center relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[150px]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10 px-4">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-black text-white mb-20 tracking-[0.2em] uppercase italic"
                >
                    COMMAND <span className="text-cyan-400">CENTER</span>
                </motion.h2>

                {/* --- MAIN COORDINATOR SPOTLIGHT --- */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-32 text-left">

                    {/* Left Side: Text Paragraph */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 space-y-6"
                    >
                        <h3 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-tight">
                            Leading the <span className="text-cyan-400">Mission</span>
                        </h3>
                        <p className="text-gray-400 text-lg leading-relaxed max-w-xl">
                            Our command center is led by dedicated visionaries ensuring every technical
                            operation and creative execution aligns with our core objectives. From
                            strategic planning to real-time event management, we maintain the
                            pulse of the event through constant innovation and coordination.
                        </p>
                        <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-transparent rounded-full"></div>
                    </motion.div>

                    {/* Right Side: Main Coordinator Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1 }} // Keeps scale same but allows catching the hover state
                        /* CARD WIDTH: 
                           Mobile: w-full (full width) 
                           Desktop: md:w-[450px] (Adjust this for card width)
                        */
                        className={`relative group w-full md:w-[450px] flex gap-8 py-10`}
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/50 to-purple-600/50 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                        <div className="relative bg-gray-900/80 border border-white/10 rounded-2xl p-5 backdrop-blur-sm overflow-hidden">

                            <div className="w-full h-[250px] md:h-[280px] overflow-hidden rounded-xl mb-6 bg-gray-800 border border-white/5">
                                <img
                                    src={mainCoordinator.photo}
                                    alt={mainCoordinator.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-white ">{mainCoordinator.name}</h3>
                                    <p className="text-cyan-400 font-mono tracking-widest text-xs uppercase mt-1">
                                        {mainCoordinator.role}
                                    </p>
                                </div>

                                <a
                                    href={`tel:${mainCoordinator.phone}`}
                                    className="text-decoration-none flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:border-cyan-500/50 hover:text-cyan-400 transition-all duration-300 text-sm"
                                >
                                    <Phone size={14} className="text-cyan-400" />
                                    <span className="font-mono">{mainCoordinator.phone}</span>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* --- DEPARTMENT HEADS SLIDER --- */}
                <div className="relative mt-10">
                    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
                        <motion.div
                            className="flex gap-8 py-10"
                            // Move exactly half of the total width (since items are duplicated)
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{
                                ease: "linear",
                                duration: 100, // Increase this number to make it even slower (e.g., 80 or 100)
                                repeat: Infinity,
                            }}
                        >
                            {duplicatedItems.map((head, idx) => (
                                <div
                                    key={idx}
                                    className="flex-shrink-0 w-72 bg-gray-900/40 border border-white/5 rounded-2xl p-3 backdrop-blur-sm hover:border-cyan-500/50 transition-colors group"
                                >
                                    <div className="w-full aspect-square overflow-hidden rounded-xl mb-4 bg-gray-800">
                                        <img
                                            src={head.photo}
                                            alt={head.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="px-2 pb-2">
                                        <h4 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                                            {head.name}
                                        </h4>
                                        <p className="text-s font-mono text-gray-400 tracking-tighter uppercase mt-1">
                                            {head.role}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>

            </div>
        </section>
    );
};

const ContactSection = () => (
    <section id="contact" className="py-24 bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tighter text-center uppercase">Establish <span className="text-purple-500">Uplink</span></h2>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl flex flex-col space-y-8">
                <div className="bg-gray-900/50 backdrop-blur border border-gray-800 p-8 rounded-2xl flex flex-col items-center text-center">
                    <h3 className="text-2xl font-bold text-white flex items-center mb-4">
                        <MapPin className="mr-3 text-cyan-400" /> Base Coordinates
                    </h3>
                    <p className="text-gray-400 text-lg">
                        M.E.S Vasant Joshi College of Arts & Commerce<br />
                        Zuarinagar, Goa - 403726
                    </p>
                </div>
                <a
                    href="https://www.google.com/maps/search/?api=1&query=M.E.S+Vasant+Joshi+College+of+Arts+%26+Commerce+Zuarinagar+Goa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-full h-80 bg-gray-900 rounded-2xl border border-gray-800 relative overflow-hidden flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.1)] hover:border-cyan-500/50 transition-all duration-300 cursor-pointer no-underline"
                >
                    {/* Background Decorative Elements */}
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyan-500 animate-pulse" />
                        <div className="absolute top-0 left-1/2 h-full w-[1px] bg-purple-500 animate-pulse" />
                        <div className="w-32 h-32 border border-white/20 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping opacity-20" />
                    </div>

                    {/* Center Pin Icon */}
                    <div className="relative z-10 flex flex-col items-center mb-8">
                        <MapPin className="w-12 h-12 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-bounce" />
                        <span className="mt-4 text-[10px] font-mono text-cyan-400 bg-black/80 px-3 py-1 border border-cyan-500/30 rounded backdrop-blur group-hover:text-white group-hover:border-cyan-400 transition-colors">
                            TARGET_LOCKED // CLICK_TO_NAVIGATE
                        </span>
                    </div>

                    {/* --- NEW: ADDRESS HUD OVERLAY --- */}
                    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-20">
                        <div className="flex flex-col text-left">
                            <span className="text-cyan-400 font-mono text-[10px] tracking-widest uppercase mb-1 opacity-70">
                                Base Coordinates
                            </span>
                            <h4 className="text-white font-bold text-sm md:text-base leading-tight">
                                M.E.S Vasant Joshi College of Arts & Commerce
                            </h4>
                            <p className="text-gray-400 text-xs font-mono mt-1">
                                Zuarinagar, Goa - 403726
                            </p>
                        </div>

                        {/* Decorative corner bracket */}
                        <div className="absolute bottom-4 right-6 w-8 h-8 border-r-2 border-b-2 border-cyan-500/30 rounded-br-lg group-hover:border-cyan-400 transition-colors" />
                    </div>
                </a>
            </motion.div>
        </div>
    </section>
)

const Navbar = ({ onHomeClick, onRegisterClick }) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md border-b border-gray-800 py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                <div
                    onClick={onHomeClick}
                    className="text-xl font-bold font-mono tracking-tighter text-white cursor-pointer hover:text-cyan-400 transition-colors"
                >
                    GENESIS <span className="text-cyan-400">8.0</span>
                </div>

                <div className="hidden md:flex space-x-8 text-sm font-medium">
                    {[
                        { name: 'HOME', href: '#', onClick: onHomeClick },
                        { name: 'ABOUT', href: '#about' },
                        { name: 'EVENTS', href: '#events' },
                        { name: 'CONTACT', href: '#contactco' }
                    ].map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={link.onClick}
                            className="relative text-gray-300 no-underline hover:text-cyan-400 transition-colors duration-300 group tracking-widest"
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-500 transition-all duration-300 group-hover:w-full"></span>
                        </a>
                    ))}
                </div>

                <button
                    onClick={onRegisterClick}
                    className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-2 px-6 rounded-full text-sm transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(8,145,178,0.5)] border-none cursor-pointer"
                >
                    REGISTER
                </button>
            </div>
        </motion.nav>
    );
}

const CategoryListPage = ({ categoryLabel, events, onEventSelect, onBack }) => {
    const data = EVENTS_DATA[categoryLabel];

    return (
        <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} className="min-h-screen bg-black pt-24 px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none" />
            <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b ${data.color} blur-[120px] opacity-30 pointer-events-none rounded-full`} />
            <div className="max-w-7xl mx-auto relative z-10">
                <button onClick={onBack} className="flex items-center text-cyan-400 hover:text-white transition-colors mb-8 font-mono text-sm group bg-transparent border-none cursor-pointer">
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> RETURN TO BASE
                </button>
                <div className="mb-12">
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tighter uppercase">{data.title}</h1>
                    <p className="text-xl text-gray-400 max-w-2xl leading-relaxed border-l-4 border-cyan-500 pl-6">{data.description}</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mb-16">
                    {events.length > 0 ? events.map((ev, index) => (
                        <motion.div key={ev._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                            onClick={() => onEventSelect(ev)} className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl hover:border-cyan-500/50 hover:bg-gray-900 transition-all group cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">{ev.name}</h3>
                                <div className="px-2 py-1 bg-gray-800 rounded text-xs font-mono text-gray-400">#0{index + 1}</div>
                            </div>
                            <div className="flex gap-4 text-xs font-mono text-gray-500 uppercase">
                                <span>Rounds: {ev.rounds}</span>
                                <span>Capacity: {ev.minParticipants}-{ev.maxParticipants}</span>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="col-span-full text-center py-20 text-gray-600 font-mono">
                            {/* 🚀 Show a loader if data is likely still fetching */}
                            <div className="animate-pulse text-cyan-500/50">
                                ACCESSING SECTOR DATA...
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const EventInfoPage = ({ event, onBack, onRegister }) => {
    // Helper to format name: "John Doe" -> "johndoe.jpg"

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="min-h-screen bg-black pt-20 md:pt-28 px-3 md:px-4 pb-12 relative overflow-hidden"
        >
            {/* Background Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-cyan-500/5 blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="flex items-center text-gray-400 hover:text-cyan-400 transition-all mb-6 md:mb-8 font-mono text-[10px] md:text-xs uppercase tracking-widest bg-transparent border-none cursor-pointer group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Return to Sector
                </button>

                {/* Main Event Card */}
                <div className="bg-gray-900/40 border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-12 backdrop-blur-xl shadow-2xl">

                    {/* Event Header */}
                    <div className="mb-8 md:mb-10">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="h-px w-6 md:w-8 bg-cyan-500/50"></span>
                            <span className="text-cyan-500 font-mono text-[9px] md:text-[10px] uppercase tracking-[0.4em]">Event_Identity_File</span>
                        </div>
                        <h1 className="text-2xl md:text-6xl font-black text-white tracking-tight uppercase leading-tight">
                            {event.name}
                        </h1>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 mb-10">
                        <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 flex items-center sm:flex-col sm:justify-center gap-4 text-left sm:text-center">
                            <User className="text-cyan-400 w-5 h-5 shrink-0" />
                            <div>
                                <span className="text-gray-500 text-[10px] md:text-[11px] block font-mono uppercase tracking-widest mb-0.5">Capacity</span>
                                <span className="text-sm md:text-base text-white font-bold">
                                    {event.minParticipants === event.maxParticipants
                                        ? `${event.minParticipants} ${event.minParticipants === 1 ? 'Member' : 'Members'}`
                                        : `${event.minParticipants}-${event.maxParticipants} Members`
                                    }
                                </span>
                            </div>
                        </div>

                        <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 flex items-center sm:flex-col sm:justify-center gap-4 text-left sm:text-center">
                            <Trophy className="text-purple-400 w-5 h-5 shrink-0" />
                            <div>
                                <span className="text-gray-500 text-[10px] md:text-[11px] block font-mono uppercase tracking-widest mb-0.5">Rounds</span>
                                <span className="text-sm md:text-base text-white font-bold">{event.rounds} Rounds</span>
                            </div>
                        </div>

                        <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 flex items-center sm:flex-col sm:justify-center gap-4 text-left sm:text-center">
                            <Zap className="text-amber-400 w-5 h-5 shrink-0" />
                            <div>
                                <span className="text-gray-500 text-[10px] md:text-[11px] block font-mono uppercase tracking-widest mb-0.5">Sector</span>
                                <span className="text-sm md:text-base text-white font-bold uppercase">{event.category}</span>
                            </div>
                        </div>
                    </div>

                    {/* Mission Brief */}
                    <div className="mb-10">
                        <h3 className="text-[10px] md:text-xs font-bold text-gray-500 mb-4 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                            {"// Mission_Brief"}
                        </h3>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap bg-white/[0.02] p-4 md:p-8 rounded-2xl border border-white/5 font-light text-sm md:text-base max-h-[250px] md:max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
                            {event.rules || "Event guidelines are being updated by sector command."}
                        </div>
                    </div>

                    {/* Command Staff */}
                    <div className="mb-10">
                        <h3 className="text-[10px] md:text-xs font-bold text-gray-500 mb-4 font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                            {"// Command_Staff"}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {event.studentCoordinators?.map((c, i) => (
                                <div key={i} className="flex items-center p-3 md:p-4 bg-white/[0.03] rounded-xl border border-white/5 group hover:bg-white/[0.05] transition-colors">
                                    {/* Image Container: Fixed size, rounded, with margin-right */}
                                    <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center mr-4 shrink-0 overflow-hidden border border-white/10 relative">
                                        <img
                                            src={`/team/${c.name.replace(/\s+/g, '').toLowerCase()}.jpg`}
                                            alt={c.name}
                                            className="w-full h-full object-cover relative z-10"
                                            onError={(e) => {
                                                const name = c.name.replace(/\s+/g, '').toLowerCase();
                                                const currentSrc = e.target.src;

                                                // Extension rotation logic
                                                if (currentSrc.endsWith('.jpg')) {
                                                    e.target.src = `/team/${name}.jpeg`;
                                                } else if (currentSrc.endsWith('.jpeg')) {
                                                    e.target.src = `/team/${name}.png`;
                                                } else {
                                                    // Hide broken image to reveal the background icon
                                                    e.target.style.opacity = '0';
                                                }
                                            }}
                                        />
                                        {/* Fallback Icon: Positioned absolutely behind the image */}
                                        <User size={20} className="absolute text-cyan-500/50" />
                                    </div>

                                    {/* Content: Added ml-1 to separate slightly more from image */}
                                    <div className="overflow-hidden">
                                        <p className="text-white font-bold text-xs md:text-sm truncate uppercase mb-0 tracking-tight group-hover:text-cyan-400 transition-colors">
                                            {c.name}
                                        </p>
                                        <p className="text-[10px] text-gray-500 font-mono mt-1 mb-0 tracking-wider">
                                            {c.phone || c.number}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Important Note */}
                    <div className="mb-10 bg-cyan-400/5 border border-cyan-400/20 rounded-2xl p-6 md:p-8">
                        <div className="text-center md:text-left">
                            <h4 className="text-cyan-400 font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] mb-3 font-bold">Important Note</h4>
                            <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">
                                All detailed rules and timing for this event are available in our official event guide. Please download and read the brochure to make sure you have all the information.
                            </p>
                            <a
                                href="/Genesis_8.0.pdf"
                                download="Genesis_8.0_Brochure.pdf"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 w-full md:w-auto bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 rounded-xl font-mono text-[10px] md:text-xs uppercase tracking-widest hover:bg-cyan-400 hover:text-black transition-all duration-300 no-underline"
                            >
                                Download Brochure <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>

                    {/* Final Button */}
                    <motion.button
                        whileHover={{ scale: 1.01, backgroundColor: '#06b6d4' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onRegister}
                        className="w-full bg-cyan-600 text-black font-black py-4 md:py-5 rounded-xl md:rounded-2xl text-[11px] md:text-lg transition-all shadow-lg border-none cursor-pointer uppercase tracking-widest"
                    >
                        Initialize Registration
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

// =================================================================
// 6. MAIN CONTROLLER
// =================================================================

export default function GenesisLanding() {
    const [view, setView] = useState({ type: 'home', data: null });
    const [allEvents, setAllEvents] = useState([]);
    const navigate = useNavigate();
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    const handleRegister = () => navigate('/register');
    const [isInitialLoad, setIsInitialLoad] = useState(true); // 🚀 Start as true


    const eventsRef = useRef(null); // 🚀 Create a Ref for the events section

    useEffect(() => {
        // If we just switched to home and the intent to scroll is true
        if (view.type === 'home' && view.scrollToEvents) {
            const executeScroll = () => {
                const element = document.getElementById('events');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    // 🚀 Reset state so it doesn't loop
                    setView(prev => ({ ...prev, scrollToEvents: false }));
                } else {
                    // If element isn't found, try again in next tick
                    requestAnimationFrame(executeScroll);
                }
            };

            // requestAnimationFrame is more precise than setTimeout for UI tasks
            requestAnimationFrame(executeScroll);
        }
    }, [view.type, view.scrollToEvents]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const baseURL = getApiBase();
                const res = await axios.get(`${baseURL}/api/admin/events/public`);
                setAllEvents(res.data || []);
            } catch (err) {
                console.error("Critical: Failed to sync with neural network database.");
            } finally {
                setIsInitialLoad(false);
            }
        };
        fetchEvents();
    }, []);

    const handleCategorySelect = (label) => {
        setView({ type: 'category', label }); // Removed data: filtered
        scrollToTop();
    };

    const handleEventSelect = (event) => {
        setView({ type: 'eventDetail', data: event });
        scrollToTop();
    };





    return (
        <div className="bg-black min-h-screen text-white w-full overflow-hidden font-sans">
            <PowerSurge />
            <Navbar onHomeClick={() => { setView({ type: 'home' }); scrollToTop(); }} onRegisterClick={handleRegister} />

            <main>
                <AnimatePresence mode="wait">
                    {view.type === 'home' && (
                        <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Hero />
                            <AboutSection />
                            <div ref={eventsRef}>
                                <EventsGrid onEventSelect={handleCategorySelect} />
                            </div>
                            <SponsorsSection />
                            <Coordinators />
                            <ContactSection />
                        </motion.div>
                    )}

                    {view.type === 'category' && (
                        <CategoryListPage
                            key="category"
                            categoryLabel={view.label}
                            // 🚀 LIVE FILTER: This ensures as soon as allEvents updates, this list updates
                            events={allEvents.filter(ev => ev.category === CATEGORY_MAP[view.label])}
                            isInitialLoad={isInitialLoad}
                            onEventSelect={handleEventSelect}
                            onBack={() => setView({ type: 'home', scrollToEvents: true })}
                        />
                    )}

                    {view.type === 'eventDetail' && (
                        <EventInfoPage
                            key="info"
                            event={view.data}
                            onBack={() => {
                                const rawCat = view.data.category;
                                let targetLabel = "TECHNICAL";
                                if (rawCat === "Pre-events") targetLabel = "PRE-EVENTS";
                                else if (rawCat === "Tech") targetLabel = "TECHNICAL";
                                else if (rawCat === "Cultural") targetLabel = "CULTURAL";
                                else if (rawCat === "Gaming") targetLabel = "GAMING";
                                else if (rawCat === "Sports") targetLabel = "SPORTS";
                                handleCategorySelect(targetLabel);
                            }}
                            onRegister={handleRegister}
                        />
                    )}
                </AnimatePresence>
            </main>

            <footer className="bg-black border-t border-gray-900 py-12 px-4 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-8 md:mb-0 text-center md:text-left">
                        <h2 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase">Genesis 8.0</h2>
                        <p className="text-gray-500 text-sm max-w-xs">Murgaon Education Society's Vasant Joshi College of Arts & Commerce</p>
                    </div>
                    <div className="mt-8 flex flex-col items-center gap-2">
                        {/* Existing System ID */}
                        <div className="text-white text-xs font-mono uppercase opacity-60 tracking-widest">
                            System_ID: GEN_8.0 // Terminal_End
                        </div>

                        {/* New Developer Tag */}
                        <div className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-white">
                            <span className="opacity-50">Developed_by:</span>{" "}
                            <a
                                href="https://github.com/rahiljamadar" // Optional: Add your link
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-300 hover:text-cyan-400 transition-all duration-300 cursor-pointer group relative inline-block text-decoration-none"
                            >
                                RAHIL JAMADAR
                                {/* Underline glow effect */}
                                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-cyan-500 transition-all duration-300 group-hover:w-full group-hover:shadow-[0_0_8px_#22d3ee]"></span>
                            </a>
                        </div>

                        {/* CSS for the Name Glow (Optional: add to your global CSS or a style tag) */}
                        <style jsx>{`
        a:hover {
            text-shadow: 0 0 8px rgba(34, 211, 238, 0.8),
                         0 0 12px rgba(34, 211, 238, 0.4);
        }
    `}</style>
                    </div>
                </div>
            </footer>

            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
        </div>
    );
}