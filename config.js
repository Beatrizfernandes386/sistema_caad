// ========== CONFIGURAÇÃO CENTRALIZADA DA API ==========

const API_CONFIG = {
  // URL base da API
  BASE_URL: 'http://localhost',

  // Porta do servidor
  PORT: 3000,

  // URL completa da API
  get API_URL() {
    return `${this.BASE_URL}:${this.PORT}`;
  },

  // Endpoints da API
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      LOGOUT: '/api/auth/logout',
      ME: '/api/auth/me',
      REGISTER: '/api/auth/register'
    },
    CLIENTS: {
      ACTIVE: '/api/clients/active',
      CANCELED: '/api/clients/canceled',
      CREATE: '/api/clients',
      UPDATE: '/api/clients',
      DELETE: '/api/clients',
      IMPORT: '/api/clients/import'
    },
    INVENTORY: {
      NEW_EQUIPMENT: '/api/inventory/new',
      USED_EQUIPMENT: '/api/inventory/used',
      SIM_CARDS: '/api/inventory/sim-cards',
      LOST_EQUIPMENT: '/api/inventory/lost',
      AVAILABLE_IMEIS: '/api/inventory/available-imeis',
      AVAILABLE_SIM_CARDS: '/api/inventory/available-sim-cards',
      ADD_EQUIPMENT: '/api/inventory/equipment',
      ADD_SIM_CARD: '/api/inventory/sim-card',
      REMOVE_EQUIPMENT: '/api/inventory/equipment'
    },
    PLANS: {
      LIST: '/api/plans',
      DETAIL: '/api/plans',
      CREATE: '/api/plans',
      UPDATE: '/api/plans',
      DELETE: '/api/plans',
      CLIENTS_BY_PLAN: '/api/plans'
    },
    CLAIMS: {
      LIST: '/api/claims',
      CREATE: '/api/claims',
      UPDATE: '/api/claims',
      DELETE: '/api/claims',
      SEARCH: '/api/claims/search',
      EXPORT: '/api/claims/export'
    },
    LOGS: {
      LIST: '/api/logs',
      STATS: '/api/logs/stats',
      BY_USER: '/api/logs/user',
      BY_ACTION: '/api/logs/action',
      BY_DATE: '/api/logs/date',
      SEARCH: '/api/logs/search',
      CLEANUP: '/api/logs/cleanup'
    }
  }
};

// ========== FUNÇÕES HELPER ==========

/**
 * Constrói URL completa para um endpoint
 * @param {string} endpointPath - Caminho do endpoint
 * @param {object} params - Parâmetros para substituir na URL
 * @returns {string} URL completa
 */
function buildUrl(endpointPath, params = {}) {
  let url = `${API_CONFIG.API_URL}${endpointPath}`;

  // Substituir parâmetros na URL
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });

  return url;
}

/**
 * Função helper para fazer requisições autenticadas
 * @param {string} url - URL da requisição
 * @param {object} options - Opções da requisição
 * @returns {Promise<Response>} Resposta da requisição
 */
async function apiRequest(url, options = {}) {
  const token = localStorage.getItem('token');

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (response.status === 401) {
    // Token expirado ou inválido
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = "../index.html";
    return;
  }

  return response;
}

// ========== EXPORTAÇÃO ==========

// Para uso em módulos ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_CONFIG, buildUrl, apiRequest };
}

// Para uso global no navegador
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
  window.buildUrl = buildUrl;
  window.apiRequest = apiRequest;
}
