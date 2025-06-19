// Verifica se o usuário está logado (usado para páginas comuns)
function verificarLogin() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario) {
    const caminhoLogin = window.location.origin + window.location.pathname.split("/").slice(0, -1).join("/") + "/index.html";
    window.location.href = caminhoLogin;
  }
}

// Verifica se o usuário está logado e, se necessário, se é admin
function verificarAcesso(requerAdmin = false) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuario) {
    alert("Acesso não autorizado!");
    const caminhoLogin = window.location.origin + window.location.pathname.split("/").slice(0, -1).join("/") + "/index.html";
    window.location.href = caminhoLogin;
    return;
  }

  if (requerAdmin && usuario.tipo !== "admin") {
    alert("Você não tem permissão para acessar esta página.");
    window.location.href = "../dashboard/dashboard.html";
  }
}

// Aplica restrições se o usuário for do tipo 'visualizador'
function aplicarPermissoes() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario || usuario.tipo !== "visualizador") return;

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
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario && usuario.tipo && document.getElementById("tipo-usuario")) {
    document.getElementById("tipo-usuario").textContent = usuario.tipo;
  }
}

function logout() {
  localStorage.removeItem("usuarioLogado");
  localStorage.removeItem("tipoUsuario");
  window.location.href = "/index.html"; // Caminho absoluto para a raiz
}

