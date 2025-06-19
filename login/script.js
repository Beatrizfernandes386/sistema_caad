document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value.trim();

  // Lista de usuários válidos
  const usuarios = [
    { email: "admin@caad.com", senha: "caad110207", tipo: "admin" },
    { email: "visual@caad.com", senha: "caad110207", tipo: "visualizador" }
  ];

  const usuarioEncontrado = usuarios.find(u => u.email === email && u.senha === senha);

  // Registrar log
  registrarLog({
    acao: "Login",
    usuario: email,
    tipo: usuarioEncontrado ? usuarioEncontrado.tipo : "desconhecido",
    status: usuarioEncontrado ? "Sucesso" : "Falha",
    dataHora: new Date().toLocaleString()
  });

  if (usuarioEncontrado) {
    // Salvar sessão
    localStorage.setItem("usuarioLogado", JSON.stringify({
      email: usuarioEncontrado.email,
      tipo: usuarioEncontrado.tipo
    }));

    // Redireciona para o dashboard
    window.location.href = "dashboard/dashboard.html";
  } else {
    alert("E-mail ou senha incorretos.");
  }
});

// Função para registrar logs
function registrarLog(entry) {
  const logs = JSON.parse(localStorage.getItem("logsSistema")) || [];
  logs.push(entry);
  localStorage.setItem("logsSistema", JSON.stringify(logs));
}

function verificarLogin() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario) {
    window.location.href = "index.html";
  }
}
