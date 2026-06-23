import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardStaff from './DashboardStaff';

// Helper function to decode JWT payload safely
const decodeToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export default function Home() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState('cliente');
  const [perfil, setPerfil] = useState(null);
  
  // Eco metrics
  const [totalKg, setTotalKg] = useState(0);
  const [co2Saved, setCo2Saved] = useState(0);
  const [ecoPoints, setEcoPoints] = useState(0);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:7777';

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const decoded = decodeToken(token);
    if (decoded) {
      setUserRole(decoded.tipo || 'cliente');
    }

    // Fetch user profile and compute metrics
    const fetchUserData = async () => {
      try {
        const pResponse = await fetch(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (pResponse.ok) {
          const pData = await pResponse.json();
          setPerfil(pData);
        }

        const cResponse = await fetch(`${API_URL}/api/agendamentos`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (cResponse.ok) {
          const cData = await cResponse.json();
          calculateEcoMetrics(cData);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err);
      }
    };

    fetchUserData();
  }, [token, navigate, API_URL]);

  const calculateEcoMetrics = (coletas) => {
    // Filter only collected (coletado)
    const concluídas = coletas.filter(c => c.status === 'coletado');
    
    let kgSum = 0;
    let points = 0;

    concluídas.forEach(c => {
      if (c.items && c.items.length > 0) {
        c.items.forEach(item => {
          let itemWeight = 1; // default fallback (1kg)
          
          switch (item.category) {
            case 'computadores_monitores': itemWeight = 12; break;
            case 'celulares_tablets': itemWeight = 0.25; break;
            case 'eletrodomesticos_grandes': itemWeight = 45; break;
            case 'eletroportateis': itemWeight = 4; break;
            case 'pilhas_baterias': itemWeight = 0.1; break;
            case 'cabos_placas': itemWeight = 1.5; break;
            case 'outros': itemWeight = 2.5; break;
            default: itemWeight = 1;
          }
          
          const totalItemWeight = itemWeight * item.quantity;
          kgSum += totalItemWeight;
          points += item.quantity * 20; // 20 points per item
        });
      } else {
        // Fallback for old simple service fields
        kgSum += 5;
        points += 50;
      }
    });

    setTotalKg(kgSum.toFixed(1));
    setCo2Saved((kgSum * 2.3).toFixed(1)); // 2.3 kg of CO2 saved per kg of e-waste recycled
    setEcoPoints(points);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  // Render staff dashboard if user role is employee or admin
  if (userRole === 'funcionario' || userRole === 'admin') {
    return <DashboardStaff onLogout={handleLogout} />;
  }

  return (
    <div className="eco-layout">
      <div className="eco-card eco-card-large shadow">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h1 className="eco-title-primary mb-0">Olá, {perfil?.nome || 'Doador'}!</h1>
            <p className="text-muted mb-0">Bem-vindo(a) ao EcoColeta. Seu descarte faz a diferença.</p>
          </div>
          <button onClick={handleLogout} className="btn btn-outline-danger btn-sm px-3 align-self-start">
            Sair (Logout)
          </button>
        </div>

        {/* Eco Dashboard Metrics Cards */}
        <div className="row g-3 mb-4">
          <div className="col-sm-4">
            <div className="bg-light p-3 rounded border text-center">
              <div className="fs-1 mb-1">♻️</div>
              <h6 className="text-muted mb-1 small text-uppercase">Reciclado</h6>
              <h4 className="eco-title-accent mb-0">{totalKg} kg</h4>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="bg-light p-3 rounded border text-center">
              <div className="fs-1 mb-1">🌍</div>
              <h6 className="text-muted mb-1 small text-uppercase">CO₂ Poupado</h6>
              <h4 className="text-success mb-0">{co2Saved} kg</h4>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="bg-light p-3 rounded border text-center">
              <div className="fs-1 mb-1">⭐</div>
              <h6 className="text-muted mb-1 small text-uppercase">EcoPontos</h6>
              <h4 className="text-warning mb-0">{ecoPoints} pts</h4>
            </div>
          </div>
        </div>

        {/* Menu Navigation Card */}
        <div className="card border-0 bg-light p-4 rounded mb-4">
          <h5 className="eco-title-accent text-center mb-3">Serviços de Descarte</h5>
          
          <div className="row g-2">
            <div className="col-md-4">
              <Link to="/agendar" className="btn-eco-primary w-100 py-3 d-flex flex-column align-items-center justify-content-center">
                <span className="fs-3 mb-1">📅</span>
                <span>Solicitar Coleta</span>
              </Link>
            </div>
            <div className="col-md-4">
              <Link to="/agendamentos/pendentes" className="btn-eco-secondary w-100 py-3 d-flex flex-column align-items-center justify-content-center">
                <span className="fs-3 mb-1">🔄</span>
                <span>Coletas Ativas</span>
              </Link>
            </div>
            <div className="col-md-4">
              <Link to="/agendamentos/concluidos" className="btn-eco-secondary w-100 py-3 d-flex flex-column align-items-center justify-content-center">
                <span className="fs-3 mb-1">📜</span>
                <span>Histórico</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Informational banner */}
        <div className="alert alert-success border-success bg-opacity-10 py-3 px-4 rounded mb-0 small">
          <strong>Você sabia?</strong> Placas de circuito contêm cobre, prata e ouro que podem ser reaproveitados. Descartando corretamente, você ajuda a reduzir a mineração predatória de recursos do planeta.
        </div>
      </div>
    </div>
  );
}
