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
            FOOTBALL: 500,
            VALORANT: 0, // Set to 0 based on your snippet logic
            HACKATHON: 0
        },
        QR_CODES: {
            // Updated to use the specific image path from your snippet
            MAIN: "/rahil-qr.jpeg",
            FOOTBALL: "/rahil-qr.jpeg",
            VALORANT: "/rahil-qr.jpeg"
        },
        FORM_LINKS: {
            // Updated to use the specific Google Form link from your snippet
            MAIN: "https://docs.google.com/forms/d/e/1FAIpQLSc2QfteykjBgtNk2-2XgwJznjO-xoRB20dCSZryO-dA47iaVQ/viewform?usp=publish-editor",
            FOOTBALL: "https://docs.google.com/forms/d/e/1FAIpQLSc2QfteykjBgtNk2-2XgwJznjO-xoRB20dCSZryO-dA47iaVQ/viewform?usp=publish-editor",
            VALORANT: "https://docs.google.com/forms/d/e/1FAIpQLSc2QfteykjBgtNk2-2XgwJznjO-xoRB20dCSZryO-dA47iaVQ/viewform?usp=publish-editor"
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

        // Normalize registered names for reliable matching
        const registeredNames = team.registeredEvents?.map(e => e.name.toLowerCase().trim()) || [];
        
        // 1. Hackathon (Free Entry)
        if (registeredNames.includes('hackathon') && registeredNames.length === 1) {
            return { total: CONFIG.FEES.HACKATHON, type: 'HACKATHON', qr: null, form: null };
        }

        // 2. Valorant Independent (Free based on your CONFIG)
        if (registeredNames.includes('valorant') && registeredNames.length === 1) {
            return { 
                total: CONFIG.FEES.VALORANT, 
                type: 'VALORANT', 
                qr: CONFIG.QR_CODES.VALORANT,
                form: CONFIG.FORM_LINKS.VALORANT
            };
        }

        // 3. Football Independent (₹500 Entry)
        if (registeredNames.includes('football') && registeredNames.length === 1) {
            return { 
                total: CONFIG.FEES.FOOTBALL, 
                type: 'FOOTBALL', 
                qr: CONFIG.QR_CODES.FOOTBALL,
                form: CONFIG.FORM_LINKS.FOOTBALL
            };
        }

        // 4. Default: College Trophy Team (₹2500 Entry)
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
                        {payment.total === 0 ? 'Protocol' : 'Finalize'} <span className="text-cyan-400">Uplink</span>
                    </h2>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="card bg-glass border-white border-opacity-10 p-4 p-md-5 rounded-4 shadow-2xl overflow-hidden relative"
                >
                    <div className="position-absolute top-0 end-0 w-50 h-50 bg-cyan-500 bg-opacity-5 blur-[80px] rounded-circle" style={{ zIndex: 0 }}></div>

                    {/* Summary Block */}
                    <div className="mb-5 pb-4 border-bottom border-white border-opacity-10 position-relative" style={{ zIndex: 1 }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-white text-opacity-40 font-mono x-small uppercase tracking-widest">Institution</span>
                            <span className="text-white fw-bold fs-6 text-end">{team?.college}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-white text-opacity-40 font-mono x-small uppercase tracking-widest">Deployment Sector</span>
                            <span className="text-cyan-400 fw-bold fs-6 tracking-wider uppercase">{payment.type.replace('_', ' ')}</span>
                        </div>
                    </div>

                    {/* Payment vs. Confirmation Logic */}
                    {payment.total > 0 ? (
                        <div className="text-center mb-5 position-relative" style={{ zIndex: 1 }}>
                            <p className="text-white text-opacity-60 small mb-4 font-light">Scan code with any UPI app (GPay, PhonePe, Paytm) to transfer ₹{payment.total}.</p>
                            
                            <div className="bg-white p-3 d-inline-block rounded-4 shadow-lg mb-4 border border-4 border-cyan-400">
                                <img 
                                    src={payment.qr} 
                                    alt={`${payment.type} QR`} 
                                    className="img-fluid"
                                    style={{ width: '240px', height: '240px', objectFit: 'contain' }}
                                />
                            </div>
                            
                            <div className="bg-cyan-500 bg-opacity-10 border border-cyan-500 border-opacity-20 py-4 rounded-4">
                                <span className="text-white text-opacity-50 font-mono x-small block mb-1 tracking-widest">TRANSACTION_VALUE</span>
                                <h2 className="text-white font-black mb-0 fs-1">₹{payment.total}</h2>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center mb-5 py-5 position-relative" style={{ zIndex: 1 }}>
                            <i className="bi bi-patch-check-fill text-cyan-400 fs-1 mb-3 d-block"></i>
                            <h3 className="text-white font-black uppercase">Direct Entry Verified</h3>
                            <p className="text-white text-opacity-50 font-mono small">NO_PAYMENT_REQUIRED_FOR_{payment.type}</p>
                            <div className="bg-white bg-opacity-5 border border-white border-opacity-10 p-4 rounded-4 mt-4 text-start">
                                <p className="mb-0 small leading-relaxed text-white text-opacity-70">
                                    Your registration for <strong>{payment.type}</strong> has been logged. Our sector admins will verify your crew list shortly. You do not need to perform any further actions.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Verification Step (Only if paid) */}
                    {payment.total > 0 && (
                        <div className="mb-5 position-relative" style={{ zIndex: 1 }}>
                            <h4 className="text-white text-sm font-bold uppercase mb-3 font-mono tracking-widest d-flex align-items-center gap-2">
                                <i className="bi bi-shield-check text-cyan-400"></i> Step 2: Protocol Log
                            </h4>
                            <p className="text-white text-opacity-60 small leading-relaxed font-light">
                                Take a screenshot of the successful transaction. Ensure the <strong>UTR / Transaction ID</strong> is visible. Upload it using the button below.
                            </p>
                        </div>
                    )}

                    {/* Action Links */}
                    <div className="d-grid gap-3 position-relative" style={{ zIndex: 1 }}>
                        {payment.total > 0 && (
                            <a 
                                href={payment.form} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn-genesis text-center text-decoration-none"
                            >
                                UPLOAD SCREENSHOT (Google Form)
                            </a>
                        )}
                        <Link to="/" className="btn-genesis-outline text-center text-decoration-none x-small uppercase fw-bold">
                            RETURN TO MAIN_BASE
                        </Link>
                    </div>
                </motion.div>

                {/* Footer Uplink ID */}
                <p className="text-center text-white text-opacity-20 x-small mt-5 tracking-[0.3em] font-mono">
                    UPLINK_ID: {teamId?.substring(0, 8).toUpperCase()} {' // '} 
                    STATUS: {payment.total > 0 ? 'WAITING_FOR_PAYMENT_LOG' : 'LOGGED_SUCCESSFULLY'}
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