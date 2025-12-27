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

    // Configuration for dynamic resources based on event type
    const CONFIG = {
        FEES: {
            COLLEGE_TROPHY: 2500,
            OPEN_EVENT: 500,
            HACKATHON: 0
        },
        QR_CODES: {
            MAIN: "/qr-college-2500.png",
            FOOTBALL: "/qr-football-500.png",
            VALORANT: "/qr-valorant-500.png"
        },
        // 🚀 SEPARATE GOOGLE FORMS FOR EACH CATEGORY
        FORM_LINKS: {
            MAIN: "https://forms.gle/MainCollegeForm",
            FOOTBALL: "https://forms.gle/FootballForm",
            VALORANT: "https://forms.gle/ValorantForm"
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

        const registeredNames = team.registeredEvents?.map(e => e.name.toLowerCase()) || [];
        
        // 1. Hackathon (Free)
        if (registeredNames.includes('hackathon') && registeredNames.length === 1) {
            return { total: 0, type: 'HACKATHON', qr: null, form: null };
        }

        // 2. Valorant Independent
        if (registeredNames.includes('valorant') && registeredNames.length === 1) {
            return { 
                total: CONFIG.FEES.OPEN_EVENT, 
                type: 'VALORANT', 
                qr: CONFIG.QR_CODES.VALORANT,
                form: CONFIG.FORM_LINKS.VALORANT
            };
        }

        // 3. Football Independent
        if (registeredNames.includes('football') && registeredNames.length === 1) {
            return { 
                total: CONFIG.FEES.OPEN_EVENT, 
                type: 'FOOTBALL', 
                qr: CONFIG.QR_CODES.FOOTBALL,
                form: CONFIG.FORM_LINKS.FOOTBALL
            };
        }

        // 4. Default: College Trophy Team (Main)
        return { 
            total: CONFIG.FEES.COLLEGE_TROPHY, 
            type: 'COLLEGE_TEAM', 
            qr: CONFIG.QR_CODES.MAIN,
            form: CONFIG.FORM_LINKS.MAIN
        };
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
        <div className="bg-black min-vh-100 py-4 py-md-5 px-3 font-sans text-white">
            <ToastContainer theme="dark" position="top-center" />
            <div className="max-w-2xl mx-auto">
                
                <div className="text-center mb-5">
                    <h5 className="text-cyan-400 font-mono x-small tracking-[0.4em] uppercase mb-3">Secure_Payment_Protocol</h5>
                    <h2 className="text-white font-black fs-1 uppercase tracking-tighter">
                        {payment.total === 0 ? 'Registration' : 'Finalize'} <span className="text-cyan-400">Payment</span>
                    </h2>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="card bg-glass border-white border-opacity-10 p-4 p-md-5 rounded-4 shadow-2xl overflow-hidden relative"
                >
                    <div className="position-absolute top-0 end-0 w-50 h-50 bg-cyan-500 bg-opacity-5 blur-[80px] rounded-circle" style={{ zIndex: 0 }}></div>

                    {/* Summary */}
                    <div className="mb-5 pb-4 border-bottom border-white border-opacity-10 position-relative" style={{ zIndex: 1 }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-white text-opacity-40 font-mono x-small uppercase tracking-widest">Institution</span>
                            <span className="text-white fw-bold fs-6 text-end">{team?.college}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-white text-opacity-40 font-mono x-small uppercase tracking-widest">Entry Sector</span>
                            <span className="text-cyan-400 fw-bold fs-6 tracking-wider uppercase">{payment.type.replace('_', ' ')}</span>
                        </div>
                    </div>

                    {/* QR Code Logic */}
                    {payment.total > 0 ? (
                        <div className="text-center mb-5 position-relative" style={{ zIndex: 1 }}>
                            <p className="text-white text-opacity-60 small mb-4 font-light">Scan this code using Google Pay, PhonePe, or Paytm.</p>
                            
                            <div className="bg-white p-3 d-inline-block rounded-4 shadow-lg mb-4 border border-4 border-cyan-400">
                                <img 
                                    src={payment.qr} 
                                    alt={`${payment.type} QR`} 
                                    className="img-fluid"
                                    style={{ width: '220px', height: '220px', objectFit: 'contain' }}
                                />
                            </div>
                            
                            <div className="bg-cyan-500 bg-opacity-10 border border-cyan-500 border-opacity-20 py-4 rounded-4">
                                <span className="text-white text-opacity-50 font-mono x-small block mb-1 tracking-widest">PAYMENT_DUE</span>
                                <h2 className="text-white font-black mb-0 fs-1">₹{payment.total}</h2>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center mb-5 py-5 position-relative" style={{ zIndex: 1 }}>
                            <i className="bi bi-shield-check text-cyan-400 fs-1 mb-3 d-block"></i>
                            <h3 className="text-white font-black uppercase">Confirmed</h3>
                            <p className="text-white text-opacity-50 font-mono small">HACKATHON_FREE_BYPASS</p>
                            <div className="bg-white bg-opacity-5 border border-white border-opacity-10 p-4 rounded-4 mt-4">
                                <p className="mb-0 small text-white text-opacity-70">
                                    No payment is required for this sector. Your crew list has been sent for admin verification.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Verification Instructions */}
                    {payment.total > 0 && (
                        <div className="mb-5 position-relative" style={{ zIndex: 1 }}>
                            <h4 className="text-white text-sm font-bold uppercase mb-3 font-mono tracking-widest d-flex align-items-center gap-2">
                                <i className="bi bi-camera text-cyan-400"></i> Step 2: Upload Screenshot
                            </h4>
                            <p className="text-white text-opacity-60 small leading-relaxed">
                                Take a screenshot of the payment confirmation screen (must show UTR/Transaction ID). 
                                Use the button below to submit it for manual verification.
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="d-grid gap-3 position-relative" style={{ zIndex: 1 }}>
                        {payment.total > 0 && (
                            <a 
                                href={payment.form} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn-genesis text-center text-decoration-none"
                            >
                                UPLOAD SCREENSHOT TO {payment.type.replace('_', ' ')} FORM
                            </a>
                        )}
                        <Link to="/" className="btn-genesis-outline text-center text-decoration-none x-small uppercase fw-bold">
                            RETURN TO BASE
                        </Link>
                    </div>
                </motion.div>

                <p className="text-center text-white text-opacity-20 x-small mt-5 tracking-[0.3em] font-mono">
                    ID: {teamId?.substring(0, 12).toUpperCase()} {' // '} 
                    SYS_LOG: {payment.type}
                </p>
            </div>

            <style>{`
                .bg-glass { background: rgba(15, 15, 15, 0.95); backdrop-filter: blur(25px); border-radius: 24px; }
                .x-small { font-size: 0.65rem; letter-spacing: 2px; font-weight: 800; }
                
                .btn-genesis { 
                    background: #0dcaf0; color: black !important; border: none; padding: 18px; 
                    border-radius: 14px; font-weight: 900; transition: all 0.3s; 
                    text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px;
                }
                .btn-genesis:hover { background: #00bacf; transform: translateY(-3px); box-shadow: 0 10px 30px rgba(13,202,240,0.3); }

                .btn-genesis-outline { 
                    background: transparent; color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2); 
                    padding: 15px; border-radius: 14px; transition: all 0.3s; 
                }
                .btn-genesis-outline:hover { background: rgba(255, 255, 255, 0.05); color: white; border-color: white; }
            `}</style>
        </div>
    );
};

export default Payment;