function verificarAcesso(requerAdmin = false) {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

  if (!usuario) {
    alert("Acesso não autorizado!");

    // Redireciona corretamente para a página de login, independente da pasta
    const caminhoLogin = window.location.pathname.includes("/") ? "/index.html" : "index.html";
    window.location.href = caminhoLogin;
    return;
  }

  if (requerAdmin && usuario.tipo !== "admin") {
    alert("Você não tem permissão para acessar esta página.");
    window.location.href = "../dashboard/dashboard.html";
  }
}

function aplicarPermissoes() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario || usuario.tipo !== "visualizador") return;

  // Desativa botões de ação
  const botoesDesabilitar = [
    document.getElementById("cadastrar-btn"),
    document.getElementById("editar-btn"),
    document.getElementById("excluir-btn"),
    document.getElementById("importar-btn")
  ];
  botoesDesabilitar.forEach(btn => {
    if (btn) {
      btn.disabled = true;
      btn.classList.add("btn-desativado");
      btn.title = "Usuário sem permissão para esta ação.";
    }
  });

  // Bloqueia o envio dos formulários
  const formularios = [
    document.getElementById("form-cadastro-element"),
    document.getElementById("form-edicao-element"),
    document.getElementById("form-exclusao-element")
  ];
  formularios.forEach(form => {
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        alert("Você não tem permissão para realizar esta ação.");
      });
    }
  });
}

function logout() {
  localStorage.removeItem("usuarioLogado");
  localStorage.removeItem("tipoUsuario");
  window.location.href = "index.html"; // ajuste o caminho se necessário
}