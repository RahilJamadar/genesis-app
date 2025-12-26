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

    // Configuration - Pricing to match your registration logic
    const PRICING = {
        BASE_TROPHY_FEE: 2500,
        OPEN_EVENT_FEE: 500 
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

    const calculateTotal = () => {
        if (!team) return 0;
        const trophyCount = team.registeredEvents?.filter(e => e.isTrophyEvent).length || 0;
        const openEventsCount = team.registeredEvents?.filter(e => !e.isTrophyEvent).length || 0;
        
        const base = trophyCount > 0 ? PRICING.BASE_TROPHY_FEE : 0;
        const extra = openEventsCount * PRICING.OPEN_EVENT_FEE;
        
        return base + extra;
    };

    if (loading) return (
        <div className="bg-black min-vh-100 d-flex align-items-center justify-content-center font-mono text-cyan-400">
            <div className="text-center">
                <div className="spinner-border mb-3" role="status"></div>
                <div className="tracking-widest uppercase small">Initializing_Gateway...</div>
            </div>
        </div>
    );

    return (
        <div className="bg-black min-vh-100 py-4 py-md-5 px-3 font-sans text-white">
            <ToastContainer theme="dark" position="top-center" />
            <div className="max-w-2xl mx-auto">
                
                {/* Header */}
                <div className="text-center mb-5">
                    <h5 className="text-cyan-400 font-mono x-small tracking-[0.4em] uppercase mb-3">Secure_Payment_Link</h5>
                    <h2 className="text-white font-black fs-1 uppercase tracking-tighter">Finalize <span className="text-cyan-400">Uplink</span></h2>
                </div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="card bg-glass border-white border-opacity-10 p-4 p-md-5 rounded-4 shadow-2xl overflow-hidden relative"
                >
                    {/* Background Glow */}
                    <div className="position-absolute top-0 end-0 w-50 h-50 bg-cyan-500 bg-opacity-5 blur-[80px] rounded-circle" style={{ zIndex: 0 }}></div>

                    {/* Summary Row */}
                    <div className="mb-5 pb-4 border-bottom border-white border-opacity-10 position-relative" style={{ zIndex: 1 }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-white text-opacity-40 font-mono x-small uppercase tracking-widest">College</span>
                            <span className="text-white fw-bold fs-6">{team?.college}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="text-white text-opacity-40 font-mono x-small uppercase tracking-widest">Team Leader</span>
                            <span className="text-white fw-bold fs-6">{team?.leader}</span>
                        </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="text-center mb-5 position-relative" style={{ zIndex: 1 }}>
                        <p className="text-white text-opacity-60 small mb-4 font-light">Scan the QR code below to complete the transaction via UPI.</p>
                        <div className="bg-white p-2 d-inline-block rounded-4 shadow-lg mb-4">
                            {/* REPLACE THIS URL WITH YOUR ACTUAL UPI QR IMAGE PATH */}
                            <img 
                                src="/path-to-your-qr-code.png" 
                                alt="UPI QR Code" 
                                className="img-fluid"
                                style={{ width: '220px', height: '220px', objectFit: 'contain' }}
                            />
                        </div>
                        
                        <div className="bg-cyan-500 bg-opacity-10 border border-cyan-500 border-opacity-20 py-4 rounded-4">
                            <span className="text-white text-opacity-50 font-mono x-small block mb-1 tracking-widest">TOTAL_AMOUNT_DUE</span>
                            <h2 className="text-white font-black mb-0 fs-1">₹{calculateTotal()}</h2>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="mb-5 position-relative" style={{ zIndex: 1 }}>
                        <h4 className="text-white text-sm font-bold uppercase mb-3 font-mono tracking-widest d-flex align-items-center gap-2">
                            <i className="bi bi-shield-check text-cyan-400"></i> Step 2: Verification
                        </h4>
                        <p className="text-white text-opacity-60 small leading-relaxed font-light">
                            After a successful payment, capture a screenshot containing the <strong>Transaction ID / UTR Number</strong>. 
                            Upload it to the official Genesis verification form below to move your status from <span className="text-warning fw-bold">Pending</span> to <span className="text-success fw-bold">Verified</span>.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-grid gap-3 position-relative" style={{ zIndex: 1 }}>
                        <a 
                            href="https://forms.gle/your-google-form-link" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-genesis text-center text-decoration-none"
                        >
                            UPLOAD SCREENSHOT (Google Form)
                        </a>
                        <Link to="/" className="btn-genesis-outline text-center text-decoration-none x-small uppercase fw-bold">
                            RETURN TO MAIN_BASE
                        </Link>
                    </div>
                </motion.div>

                {/* Footer Note - FIXED ESLINT ERROR HERE */}
                <p className="text-center text-white text-opacity-20 x-small mt-5 tracking-[0.3em] font-mono">
                    UPLINK_ID: {teamId?.substring(0, 8).toUpperCase()} {' // '} STATUS: WAITING_FOR_PAYMENT_LOG
                </p>
            </div>

            <style>{`
                .bg-glass { background: rgba(15, 15, 15, 0.95); backdrop-filter: blur(25px); border-radius: 24px; }
                .x-small { font-size: 0.65rem; letter-spacing: 2px; font-weight: 800; }
                
                .btn-genesis { 
                    background: #0dcaf0; 
                    color: black !important; 
                    border: none; 
                    padding: 18px; 
                    border-radius: 14px; 
                    font-weight: 900; 
                    transition: all 0.3s; 
                    text-transform: uppercase; 
                    font-size: 0.9rem;
                    letter-spacing: 1px;
                }
                .btn-genesis:hover { 
                    background: #00bacf; 
                    transform: translateY(-3px); 
                    box-shadow: 0 10px 30px rgba(13,202,240,0.3); 
                }

                .btn-genesis-outline { 
                    background: transparent; 
                    color: #ffffff; 
                    border: 1px solid rgba(255, 255, 255, 0.2); 
                    padding: 15px; 
                    border-radius: 14px; 
                    transition: all 0.3s; 
                }
                .btn-genesis-outline:hover { 
                    background: rgba(255, 255, 255, 0.05);
                    color: white; 
                    border-color: white; 
                }
            `}</style>
        </div>
    );
};

export default Payment;