import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../../api/adminApi';
import Navbar from '../../../components/Navbar';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, []);

  // Filter teams whenever search term or master team list changes
  useEffect(() => {
    const results = teams.filter(team => 
      team.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.leader.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.teamName && team.teamName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (team.transactionId && team.transactionId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredTeams(results);
  }, [searchTerm, teams]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/teams');
      setTeams(res.data);
      setFilteredTeams(res.data);
    } catch (err) {
      toast.error('❌ Failed to synchronize team data');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (teams.length === 0) {
        toast.info("No data available to export");
        return;
    }

    const masterData = [];

    teams.forEach((team) => {
        if (team.members && team.members.length > 0) {
            team.members.forEach((member, index) => {
                const isFirstRow = index === 0;

                masterData.push({
                    "Assigned Team Name": isFirstRow ? (team.teamName || "PENDING") : "",
                    "College Name": isFirstRow ? team.college : "", 
                    "Team Leader": isFirstRow ? team.leader : "",
                    "Leader Contact": isFirstRow ? team.contact : "",
                    "Payment Status": isFirstRow ? team.paymentStatus.toUpperCase() : "",
                    "Transaction ID": isFirstRow ? (team.transactionId || 'N/A') : "",
                    "Member Name": member.name,
                    "Member Contact": member.contact || 'N/A',
                    "Member Diet": member.diet ? member.diet.toUpperCase() : 'N/A',
                    "Member Events": member.events && Array.isArray(member.events) 
                                     ? member.events.join(", ") 
                                     : 'N/A',
                    "Team Veg/Non Total": isFirstRow ? `V: ${team.vegCount || 0} | NV: ${team.nonVegCount || 0}` : ""
                });
            });
            masterData.push({}); 
        } else {
            masterData.push({
                "Assigned Team Name": team.teamName || "PENDING",
                "College Name": team.college,
                "Team Leader": team.leader,
                "Leader Contact": team.contact,
                "Payment Status": team.paymentStatus.toUpperCase(),
                "Transaction ID": team.transactionId || 'N/A',
                "Member Name": "⚠️ NO MEMBERS UPLOADED",
                "Member Contact": "-",
                "Member Diet": "-",
                "Member Events": "-",
                "Team Veg/Non Total": `V: ${team.vegCount || 0} | NV: ${team.nonVegCount || 0}`
            });
            masterData.push({});
        }
    });

    const ws = XLSX.utils.json_to_sheet(masterData);
    const wscols = [
        { wch: 25 }, // Assigned Team Name
        { wch: 35 }, // College Name
        { wch: 20 }, // Team Leader
        { wch: 15 }, // Leader Contact
        { wch: 15 }, // Payment Status
        { wch: 20 }, // Transaction ID
        { wch: 25 }, // Member Name
        { wch: 15 }, // Member Contact
        { wch: 12 }, // Diet
        { wch: 45 }, // Member Events
        { wch: 20 }  // Totals
    ];
    ws['!cols'] = wscols;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Grouped Registry");
    XLSX.writeFile(wb, `Genesis_Full_Report_${new Date().toLocaleDateString()}.xlsx`);
    toast.success("🚀 Formatted report downloaded");
  };

  const handleDelete = async (id) => {
    if (!window.confirm('🚨 Warning: This action is permanent. Proceed?')) return;
    try {
      await adminApi.delete(`/teams/${id}`);
      setTeams(prev => prev.filter(t => t._id !== id));
      toast.success('🗑️ Team purged');
    } catch (err) {
      toast.error('❌ Deletion failed');
    }
  };

  const renderPaymentBadge = (status) => {
    switch (status) {
      case 'verified':
        return <span className="badge bg-success border border-success bg-opacity-10 text-success px-2 py-1"><i className="bi bi-shield-check me-1"></i>VERIFIED</span>;
      case 'paid':
        return <span className="badge bg-info border border-info bg-opacity-10 text-info px-2 py-1"><i className="bi bi-cash-stack me-1"></i>PAID</span>;
      default:
        return <span className="badge bg-warning border border-warning bg-opacity-10 text-warning px-2 py-1"><i className="bi bi-clock-history me-1"></i>PENDING</span>;
    }
  };

  return (
    <div className="d-flex bg-dark min-vh-100 flex-column flex-lg-row">
      <Navbar />

      <main className="dashboard-content flex-grow-1 p-3 p-md-4 p-lg-5">
        <header className="mb-4 mb-lg-5 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
          <div className="text-center text-sm-start flex-grow-1">
            <h2 className="fw-bold text-white mb-1">Team Management</h2>
            <div className="d-flex flex-wrap gap-2 mt-3 justify-content-center justify-content-sm-start">
                <div className="input-group input-group-sm mb-0" style={{ maxWidth: '300px' }}>
                    <span className="input-group-text bg-black border-secondary text-secondary"><i className="bi bi-search"></i></span>
                    <input 
                        type="text" 
                        className="form-control bg-dark border-secondary text-white shadow-none" 
                        placeholder="Search Team, College, Leader..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="btn btn-sm btn-outline-info fw-bold px-3" onClick={fetchTeams}>
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
                <button className="btn btn-sm btn-success fw-bold px-3" onClick={exportToExcel} disabled={loading}>
                  <i className="bi bi-file-earmark-excel me-2"></i>Export Master
                </button>
            </div>
          </div>
          <div className="bg-glass px-4 py-2 rounded border border-secondary text-center shadow-glow">
            <div className="text-info fw-bold fs-3 leading-none">{filteredTeams.length}</div>
            <div className="text-white x-small text-uppercase ls-1">Records</div>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status"></div>
          </div>
        ) : (
          <div className="row g-3 g-lg-4">
            {filteredTeams.map(team => (
              <div key={team._id} className="col-12 col-xl-6">
                <div className="card bg-glass border-secondary team-card h-100">
                  <div className="card-body p-3 p-md-4">
                    
                    {/* Assigned Team Name Row */}
                    <div className="mb-3 pb-2 border-bottom border-white border-opacity-10">
                        <span className="text-secondary x-small fw-bold text-uppercase ls-1">Assigned Name</span>
                        <h4 className="text-white fw-black mb-0 tracking-tight">
                            {team.teamName ? team.teamName : <span className="text-white opacity-50 fw-normal small italic">Awaiting Assignment...</span>}
                        </h4>
                    </div>

                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-2 mb-3">
                      <div className="flex-grow-1">
                        <h5 className="text-info fw-bold mb-1">{team.college}</h5>
                        <div className="d-flex flex-wrap align-items-center gap-2 text-white opacity-75 x-small">
                          <span><i className="bi bi-person-badge text-warning me-1"></i>{team.leader}</span>
                          <span className="opacity-25">|</span>
                          <span><i className="bi bi-telephone text-warning me-1"></i>{team.contact}</span>
                        </div>
                      </div>
                      <div className="d-flex flex-row flex-md-column align-items-center align-items-md-end gap-2 w-100 w-md-auto justify-content-between">
                        {renderPaymentBadge(team.paymentStatus)}
                        <span className="text-white opacity-50 x-small-badge">{team.isOutstation ? 'OUTSTATION' : 'LOCAL'}</span>
                      </div>
                    </div>

                    {team.transactionId && (
                      <div className="mb-3 px-3 py-2 bg-black bg-opacity-40 rounded border border-secondary border-opacity-25">
                         <div className="text-secondary x-small fw-bold text-uppercase mb-1">TXN ID:</div>
                         <div className="text-info x-small font-monospace text-truncate">{team.transactionId}</div>
                      </div>
                    )}

                    <div className="bg-black bg-opacity-40 rounded p-3 mb-4 border border-secondary border-opacity-50">
                      <div className="row text-center text-white g-0">
                        <div className="col-4 border-end border-secondary border-opacity-30">
                          <div className="text-secondary x-small fw-bold uppercase">Units</div>
                          <div className="fw-bold">{team.members?.length || 0}</div>
                        </div>
                        <div className="col-4 border-end border-secondary border-opacity-30">
                          <div className="text-success x-small fw-bold uppercase">Veg</div>
                          <div className="fw-bold">{team.vegCount || 0}</div>
                        </div>
                        <div className="col-4">
                          <div className="text-danger x-small fw-bold uppercase">Non</div>
                          <div className="fw-bold">{team.nonVegCount || 0}</div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button className="btn btn-info btn-sm flex-grow-1 fw-bold text-black" onClick={() => navigate(`/admin/teams/view/${team._id}`)}>
                        <i className="bi bi-eye me-2"></i>Profile
                      </button>
                      <button className="btn btn-outline-warning btn-sm" onClick={() => navigate(`/admin/teams/edit/${team._id}`)}>
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(team._id)}>
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        @media (min-width: 992px) { .dashboard-content { margin-left: 280px; } }
        .bg-glass { background: rgba(255, 255, 255, 0.03) !important; backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); }
        .team-card { transition: all 0.3s ease; }
        .team-card:hover { border-color: #0dcaf0 !important; transform: translateY(-3px); }
        .x-small { font-size: 0.7rem; }
        .x-small-badge { font-size: 0.65rem; font-weight: 800; border: 1px solid rgba(255,255,255,0.1); padding: 2px 8px; rounded: 4px; }
        .ls-1 { letter-spacing: 1px; }
        .fw-black { font-weight: 900; }
      `}</style>
    </div>
  );
};

export default Teams;