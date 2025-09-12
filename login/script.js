document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();

  if (!email || !senha) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password: senha })
    });

    const data = await response.json();

    if (response.ok) {
      // Salvar token no localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redireciona para o dashboard
      window.location.href = "../dashboard/dashboard.html";
    } else {
      alert(data.message || "E-mail ou senha incorretos.");
    }
  } catch (error) {
    console.error('Login error:', error);
    alert("Erro ao fazer login. Verifique se o servidor está rodando.");
  }
});

// Função para verificar se usuário está logado
function verificarLogin() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (!token || !user) {
    window.location.href = "../index.html";
    return;
  }

  // Opcional: verificar se o token ainda é válido
  return JSON.parse(user);
}

// Função para fazer logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = "../index.html";
}

// Usar função apiRequest da configuração centralizada
