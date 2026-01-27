import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import getApiBase from '../utils/getApiBase';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';

const Payment = () => {
    const { teamId } = useParams();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const baseURL = getApiBase();

    const CONFIG = {
        FEES: {
            COLLEGE_TROPHY: 2500,
            FOOTBALL: 800,
            VALORANT: 500, 
            HACKATHON_PER_MEMBER: 100 // Updated: 100 per member
        },
        QR_CODES: {
            MAIN: "/mes_qr.jpeg",
            FOOTBALL: "/mes_qr.jpeg",
            VALORANT: "/mes_qr.jpeg",
            HACKATHON: "/mes_qr.jpeg" // Added QR for Hackathon
        },
        FORM_LINKS: {
            MAIN: "https://docs.google.com/forms/d/e/1FAIpQLSc2QfteykjBgtNk2-2XgwJznjO-xoRB20dCSZryO-dA47iaVQ/viewform?usp=publish-editor",
            FOOTBALL: "https://docs.google.com/forms/d/e/1FAIpQLSc2QfteykjBgtNk2-2XgwJznjO-xoRB20dCSZryO-dA47iaVQ/viewform?usp=publish-editor",
            VALORANT: "https://docs.google.com/forms/d/e/1FAIpQLSc2QfteykjBgtNk2-2XgwJznjO-xoRB20dCSZryO-dA47iaVQ/viewform?usp=publish-editor",
            HACKATHON: "https://docs.google.com/forms/d/e/1FAIpQLSc2QfteykjBgtNk2-2XgwJznjO-xoRB20dCSZryO-dA47iaVQ/viewform?usp=publish-editor"
        }
    };

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                const res = await axios.get(`${baseURL}/api/admin/teams/${teamId}`);
                setTeam(res.data);
            } catch (err) {
                toast.error("Failed to load registration data.");
            } finally {
                setLoading(false);
            }
        };
        fetchTeamData();
    }, [teamId, baseURL]);

    const getPaymentDetails = () => {
        if (!team) return { total: 0, type: 'UNKNOWN', qr: CONFIG.QR_CODES.MAIN, form: "#" };
        const registeredNames = team.registeredEvents?.map(e => e.name.toLowerCase().trim()) || [];
        
        // Hackathon logic: Calculates total based on member count
        if (registeredNames.includes('hackathon') && registeredNames.length === 1) {
            const memberCount = team.members?.length || 0;
            return { 
                total: memberCount * CONFIG.FEES.HACKATHON_PER_MEMBER, 
                type: 'HACKATHON', 
                qr: CONFIG.QR_CODES.HACKATHON, 
                form: CONFIG.FORM_LINKS.HACKATHON,
                isPerMember: true,
                count: memberCount
            };
        }
        if (registeredNames.includes('valorant') && registeredNames.length === 1) {
            return { total: CONFIG.FEES.VALORANT, type: 'VALORANT', qr: CONFIG.QR_CODES.VALORANT, form: CONFIG.FORM_LINKS.VALORANT };
        }
        if (registeredNames.includes('football') && registeredNames.length === 1) {
            return { total: CONFIG.FEES.FOOTBALL, type: 'FOOTBALL', qr: CONFIG.QR_CODES.FOOTBALL, form: CONFIG.FORM_LINKS.FOOTBALL };
        }
        return { total: CONFIG.FEES.COLLEGE_TROPHY, type: 'COLLEGE_TEAM', qr: CONFIG.QR_CODES.MAIN, form: CONFIG.FORM_LINKS.MAIN };
    };

    const payment = getPaymentDetails();

    if (loading) return (
        <div className="bg-black min-vh-100 d-flex align-items-center justify-content-center font-mono text-cyan-400">
            <div className="text-center">
                <div className="spinner-border mb-3" role="status"></div>
                <div className="tracking-widest uppercase small">Accessing_Gateway...</div>
            </div>
        </div>
    );

    return (
        <div className="bg-black min-vh-100 py-5 px-3 font-sans text-white">
            <ToastContainer theme="dark" position="top-center" />
            <div className="max-w-2xl mx-auto py-lg-5">
                
                <div className="text-center mb-5">
                    <h5 className="text-cyan-400 font-mono desktop-label uppercase mb-3">Secure_Payment_Protocol</h5>
                    <h2 className="text-white font-black display-5 uppercase tracking-tighter desktop-title">
                        Finalize <span className="text-cyan-400">Uplink</span>
                    </h2>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="card bg-glass border-white border-opacity-10 p-4 p-md-5 rounded-4 shadow-2xl overflow-hidden position-relative"
                >
                    <div className="position-absolute top-0 end-0 w-50 h-50 bg-cyan-500 bg-opacity-5 blur-[80px] rounded-circle" style={{ zIndex: 0 }}></div>

                    {/* Summary Block */}
                    <div className="mb-5 pb-4 border-bottom border-white border-opacity-10 position-relative" style={{ zIndex: 1 }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <span className="text-white text-opacity-40 font-mono desktop-small-label uppercase tracking-widest">Institution</span>
                            <span className="text-white fw-bold desktop-data text-end">{team?.college}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-white text-opacity-40 font-mono desktop-small-label uppercase tracking-widest">Deployment Sector</span>
                            <span className="text-white fw-bold desktop-data tracking-wider uppercase">
                                {payment.type.replace('_', ' ')}
                                {payment.isPerMember && <span className="text-cyan-400 ms-2" style={{fontSize: '0.8rem'}}>({payment.count} Members)</span>}
                            </span>
                        </div>
                    </div>

                    <div className="text-center mb-5 position-relative" style={{ zIndex: 1 }}>
                        <p className="text-white text-opacity-60 desktop-p mb-4 font-light">Scan code with any UPI app to transfer ₹{payment.total}.</p>
                        
                        <div className="bg-white p-3 d-inline-block rounded-4 shadow-lg mb-4 border border-4 border-cyan-400 qr-wrapper">
                            <img 
                                src={payment.qr} 
                                alt={`${payment.type} QR`} 
                                className="img-fluid"
                                style={{ width: '280px', height: '280px', objectFit: 'contain' }}
                            />
                        </div>
                        
                        <div className="bg-cyan-500 bg-opacity-10 border border-cyan-500 border-opacity-20 py-4 rounded-4">
                            <span className="text-white text-opacity-50 font-mono desktop-small-label block mb-1 tracking-widest uppercase">Transaction_Value</span>
                            <h2 className="text-white font-black mb-0 display-4">₹{payment.total}</h2>
                            {payment.isPerMember && <p className="text-cyan-400 x-small font-mono mt-1 mb-0">₹100 x {payment.count} UNITS</p>}
                        </div>
                    </div>

                    {/* Verification Step */}
                    <div className="mb-5 position-relative text-start" style={{ zIndex: 1 }}>
                        <h4 className="text-white font-bold uppercase mb-3 font-mono tracking-widest d-flex align-items-center gap-2 desktop-p">
                            <i className="bi bi-shield-check text-cyan-400"></i> Step 2: Protocol Log
                        </h4>
                        <p className="text-white text-opacity-60 desktop-p leading-relaxed font-light">
                            Take a screenshot of the successful transaction. Ensure the <strong>UTR / Transaction ID</strong> is visible. Upload it using the button below.
                        </p>
                    </div>

                    {/* Action Links */}
                    <div className="d-grid gap-3 position-relative" style={{ zIndex: 1 }}>
                        <a 
                            href={payment.form} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-genesis text-center text-decoration-none"
                        >
                            UPLOAD SCREENSHOT (Google Form)
                        </a>
                        <Link to="/" className="btn-genesis-outline text-center text-decoration-none">
                            RETURN TO MAIN_BASE
                        </Link>
                    </div>
                </motion.div>

                {/* Footer Uplink ID */}
                <p className="text-center text-white text-opacity-20 font-mono mt-5 tracking-[0.3em] uppercase" style={{ fontSize: '0.75rem' }}>
                    UPLINK_ID: {teamId?.substring(0, 8).toUpperCase()} {' // '} 
                    STATUS: WAITING_FOR_LOG
                </p>
            </div>

            <style>{`
                @media (min-width: 992px) {
                    .desktop-title { font-size: 3.5rem !important; }
                    .desktop-label { font-size: 1rem !important; letter-spacing: 0.5em !important; }
                    .desktop-small-label { font-size: 0.85rem !important; }
                    .desktop-data { font-size: 1.35rem !important; }
                    .desktop-p { font-size: 1.1rem !important; line-height: 1.6; }
                    .qr-wrapper img { width: 320px !important; height: 320px !important; }
                }

                .bg-glass { background: rgba(10, 10, 10, 0.95); backdrop-filter: blur(30px); border-radius: 30px; }
                
                .btn-genesis { 
                    background: #0dcaf0; color: black !important; border: none; padding: 22px; 
                    border-radius: 16px; font-weight: 900; transition: all 0.3s; 
                    text-transform: uppercase; font-size: 1rem; letter-spacing: 2px;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer;
                }
                .btn-genesis:hover { background: #00bacf; transform: translateY(-4px); box-shadow: 0 15px 35px rgba(13,202,240,0.4); }

                .btn-genesis-outline { 
                    background: transparent; color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.15); 
                    padding: 18px; border-radius: 16px; transition: all 0.3s; 
                    font-size: 0.85rem; font-weight: 700; letter-spacing: 1px;
                }
                .btn-genesis-outline:hover { background: rgba(255, 255, 255, 0.05); color: #0dcaf0; border-color: #0dcaf0; }
                
                .font-mono { font-family: 'JetBrains Mono', 'Courier New', monospace !important; }
                .x-small { font-size: 0.7rem; }
            `}</style>
        </div>
    );
};

export default Payment;