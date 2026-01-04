import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Cpu, Trophy, Activity, Ghost, Lock } from 'lucide-react';
import getApiBase from '../utils/getApiBase'; 
import { ToastContainer } from 'react-toastify';

const RegisterHub = () => {
  const navigate = useNavigate();
  const baseURL = getApiBase();
  
  const [eventSpecs, setEventSpecs] = useState({});
  const [teamCounts, setTeamCounts] = useState({
    main: 0,
    football: 0,
    valorant: 0,
    hackathon: 0
  });
  const [loading, setLoading] = useState(true);

  // Hardcoded limits per requirement
  const limits = {
    main: 10,
    valorant: 8,
    football: 16,
    hackathon: 10
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Public Event Specs
      const specRes = await axios.get(`${baseURL}/api/admin/events/public`);
      const specs = {};
      specRes.data.forEach(ev => {
        specs[ev.name.toLowerCase()] = {
          min: ev.minParticipants,
          max: ev.maxParticipants,
          id: ev._id,
          name: ev.name
        };
      });
      setEventSpecs(specs);

      // 2. Fetch Registration Counts from Public Route
      const countRes = await axios.get(`${baseURL}/api/admin/teams/public/registration-counts`);
      if (countRes.data?.counts) {
        setTeamCounts(countRes.data.counts);
      }

    } catch (err) {
      console.error("Uplink Error:", err);
    } finally {
      setLoading(false);
    }
  }, [baseURL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const paths = [
    { 
      id: 'main', 
      title: 'College Team', 
      desc: 'Register your whole college for the Main Trophy',
      fee: '₹2500',
      icon: <Trophy size={28} />,
      tag: 'ALL_EVENTS',
      color: 'info'
    },
    { 
      id: 'football', 
      title: 'Football', 
      desc: 'Join the open Football tournament',
      fee: '₹800',
      icon: <Activity size={28} />,
      tag: 'OPEN_EVENT',
      color: 'success'
    },
    { 
      id: 'valorant', 
      title: 'Valorant', 
      desc: 'Join the open Valorant tournament',
      fee: '₹500',
      icon: <Ghost size={28} />,
      tag: 'OPEN_EVENT',
      color: 'danger'
    },
    { 
      id: 'hackathon', 
      title: 'Hackathon', 
      desc: '24-Hour Coding Competition',
      fee: 'FREE',
      icon: <Cpu size={28} />,
      tag: 'FREE_EVENT',
      color: 'warning'
    },
  ];

  return (
    <div className="bg-black min-vh-100 py-4 py-md-5 px-3 text-white position-relative" style={{ zIndex: 1 }}>
      <ToastContainer theme="dark" position="top-center" />
      
      {/* Background Grid */}
      <div className="position-absolute opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: `linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)`,
             backgroundSize: '5rem 5rem',
             top: 0, left: 0, right: 0, bottom: 0,
             zIndex: -1
           }} 
      />
      
      <div className="container-fluid max-w-5xl mx-auto">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-4">
          <Link to="/" className="text-decoration-none d-flex align-items-center text-secondary hover-info transition-all font-mono x-small tracking-widest">
            <ArrowLeft size={16} className="me-2" /> 
            GO BACK HOME
          </Link>
          
          <div className="text-center text-md-end">
            <h1 className="fw-black tracking-tighter uppercase m-0 display-4 text-white">
              Registration <span className="text-info">Center</span>
            </h1>
            <p className="text-secondary font-mono x-small uppercase mt-1 tracking-widest">Pick your event category</p>
          </div>
        </div>

        {/* Support Card */}
        <div className="card bg-glass border-secondary mb-5 border-opacity-10 shadow-lg">
          <div className="card-body p-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 rounded-circle bg-dark border border-info shadow-glow pulse-animation">
                <ShieldCheck className="text-info" size={20} />
              </div>
              <div>
                <h6 className="text-white mb-0 fw-bold">Need help with Payment?</h6>
                <p className="font-mono x-small text-secondary mb-0">Contact support if you missed the upload step.</p>
              </div>
            </div>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSc2QfteykjBgtNk2-2XgwJznjO-xoRB20dCSZryO-dA47iaVQ/viewform?usp=publish-editor" target="_blank" rel="noreferrer" className="btn btn-sm btn-info fw-bold px-4 py-2 font-mono x-small">
              GET HELP
            </a>
          </div>
        </div>

        <div className="row g-4">
          {paths.map((p) => {
            const isFull = teamCounts[p.id] >= limits[p.id];
            
            return (
              <div key={p.id} className="col-12 col-md-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={!isFull && !loading ? { y: -8 } : {}}
                  onClick={() => !isFull && !loading && navigate(`/register-form/${p.id}`)}
                  className={`card regicard bg-glass border-secondary h-100 shadow-lg border-opacity-10 overflow-hidden group-hover-border position-relative ${isFull ? 'cursor-not-allowed border-danger' : loading ? 'cursor-wait' : 'cursor-pointer'}`}
                >
                  {/* Progress Indicator Bar */}
                  <div className="indicator-bar" style={{ height: '3px', background: '#111' }}>
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((teamCounts[p.id] / limits[p.id]) * 100, 100)}%` }}
                        className={`bg-${isFull ? 'danger' : p.color}`} 
                        style={{ height: '100%', boxShadow: isFull ? '0 0 10px rgba(220,53,69,0.5)' : '0 0 10px rgba(13,202,240,0.5)' }}
                     />
                  </div>

                  {/* Teams Full Overlay */}
                  <AnimatePresence>
                    {isFull && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-black bg-opacity-80" 
                        style={{ zIndex: 10, backdropFilter: 'blur(8px)' }}
                      >
                          <div className="bg-danger text-white px-3 py-1 rounded-pill x-small fw-bold mb-3 shadow-lg animate-pulse">REGISTRATION CLOSED</div>
                          <Lock size={44} className="text-danger mb-2" />
                          <h5 className="fw-black text-white text-uppercase m-0 tracking-tighter text-center px-3">
                            {p.title} TEAMS FULL
                          </h5>
                          <p className="font-mono x-small text-danger mt-1 opacity-100 fw-bold uppercase">LIMIT REACHED: {limits[p.id]} SLOTS</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="card-body p-4 p-lg-5">
                    <div className="d-flex justify-content-between align-items-start mb-4">
                      <div className={`rounded-4 bg-${p.color} bg-opacity-10 p-3 text-${p.color} border border-${p.color} border-opacity-25 shadow-sm`}>
                        {p.icon}
                      </div>
                      <div className="text-end">
                        <span className="text-info font-mono x-small fw-bold opacity-40 d-block mb-1">
                          {p.tag}
                        </span>
                        <span className={`font-mono x-small fw-bold ${isFull ? 'text-danger' : 'text-secondary'}`}>
                          {loading ? '...' : teamCounts[p.id]} / {limits[p.id]} SLOTS
                        </span>
                      </div>
                    </div>

                    <h3 className="fw-bold text-white mb-2 uppercase tracking-tight">{p.title}</h3>
                    <p className="text-secondary small mb-4 leading-relaxed">
                      {p.desc} 
                      {eventSpecs[p.id] && (
                        <span className="d-block mt-3 text-info fw-bold font-mono" style={{ fontSize: '0.6rem' }}>
                          {`SYSTEM REQUIRES: ${eventSpecs[p.id].min} - ${eventSpecs[p.id].max} MEMBERS`}
                        </span>
                      )}
                    </p>
                    
                    <div className="d-flex justify-content-between align-items-center pt-4 border-top border-secondary border-opacity-10">
                      <span className="text-white font-mono fw-black h4 m-0">{p.fee}</span>
                      <span className={`${isFull ? 'text-danger' : 'text-info'} fw-bold x-small font-mono tracking-widest`}>
                        {isFull ? 'CLOSED' : 'REGISTER NOW →'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .bg-glass { background: rgba(10, 10, 10, 0.9) !important; backdrop-filter: blur(15px); border-radius: 20px; }
        .x-small { font-size: 0.65rem; }
        .fw-black { font-weight: 900; }
        .hover-info:hover { color: #0dcaf0 !important; }
        .group-hover-border:hover { border-color: rgba(13, 202, 240, 0.5) !important; }
        .pulse-animation { animation: pulse-glow 2s infinite; }
        .cursor-not-allowed { cursor: not-allowed !important; }
        .cursor-pointer { cursor: pointer !important; }
        .text-danger { color: #ff4d4d !important; }
        .bg-danger { background-color: #dc3545 !important; }
        .border-danger { border-color: rgba(220, 53, 69, 0.5) !important; }

        @keyframes pulse-glow { 
          0%, 100% { border-color: rgba(13, 202, 240, 0.5); box-shadow: 0 0 5px rgba(13, 202, 240, 0.2); }
          50% { border-color: rgba(13, 202, 240, 1); box-shadow: 0 0 15px rgba(13, 202, 240, 0.5); }
        }
        .regicard {
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.2s ease;
        }
        .leading-relaxed { line-height: 1.6; }
      `}</style>
    </div>
  );
};

export default RegisterHub;