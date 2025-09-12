// Verifica se o usuário está logado (usado para páginas comuns)
function verificarLogin() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    window.location.href = "../index.html";
    return;
  }

  // Verificar se o token ainda é válido fazendo uma requisição de teste
  fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Token inválido');
    }
    return response.json();
  })
  .catch(error => {
    console.error('Token verification failed:', error);
    logout();
  });
}

// Verifica se o usuário está logado e, se necessário, se é admin
function verificarAcesso(requerAdmin = false) {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    alert("Acesso não autorizado!");
    window.location.href = "../index.html";
    return;
  }

  const userData = JSON.parse(user);

  if (requerAdmin && userData.role !== "admin") {
    alert("Você não tem permissão para acessar esta página.");
    window.location.href = "../dashboard/dashboard.html";
  }
}

// Aplica restrições se o usuário for do tipo 'viewer'
function aplicarPermissoes() {
  const user = localStorage.getItem('user');
  if (!user) return;

  const userData = JSON.parse(user);
  if (userData.role !== "viewer") return;

  // Desativa botões de ação
  const botoes = ["cadastrar-btn", "editar-btn", "excluir-btn", "importar-btn"];
  botoes.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.disabled = true;
      btn.classList.add("btn-desativado");
      btn.title = "Usuário sem permissão para esta ação.";
    }
  });

  // Bloqueia o envio dos formulários
  const formularios = ["form-cadastro-element", "form-edicao-element", "form-exclusao-element"];
  formularios.forEach(id => {
    const form = document.getElementById(id);
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        alert("Você não tem permissão para realizar esta ação.");
      });
    }
  });
}

// Mostra o tipo de usuário no cabeçalho
function mostrarUsuarioLogado() {
  const user = localStorage.getItem('user');
  if (user && document.getElementById("tipo-usuario")) {
    const userData = JSON.parse(user);
    document.getElementById("tipo-usuario").textContent = userData.role;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = "../index.html";
}

// Função helper para fazer requisições autenticadas
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
    logout();
    return;
  }

  return response;
}

