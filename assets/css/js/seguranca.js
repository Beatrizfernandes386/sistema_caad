// Verifica se o usuário está logado e, opcionalmente, se é admin
function verificarAcesso(requerAdmin = false) {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

  if (!usuarioLogado) {
    window.location.href = '../index.html'; // redireciona para login se não estiver logado
    return;
  }

  // Se a página requer admin e o usuário não é admin, redireciona
  if (requerAdmin && usuarioLogado.tipo !== 'admin') {
    alert('Você não tem permissão para acessar essa página.');
    window.location.href = '../dashboard/dashboard.html';
  }
}

function mostrarUsuarioLogado() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario && usuario.tipo) {
    document.getElementById("tipo-usuario").textContent = usuario.tipo;
  }
}

// Função para aplicar restrições para usuário visualizador
function aplicarPermissoes() {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

  if (usuarioLogado && usuarioLogado.tipo === 'visualizador') {
    // Desativa todos os botões de ação
    document.querySelectorAll('button, input[type="submit"]').forEach(btn => {
      btn.disabled = true;
    });

    // Opcional: esconder botões de editar/excluir
    document.querySelectorAll('.btn-editar, .btn-excluir, .btn-cadastrar').forEach(el => {
      el.style.display = 'none';
      
    });
  }
}
function logout() {
  localStorage.removeItem("usuarioLogado");
  localStorage.removeItem("tipoUsuario");
  window.location.href = "../index.html"; // ajuste o caminho se necessário
}

function verificarAcesso() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario) {
    alert("Acesso não autorizado!");
    window.location.href = "../login/login.html";
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

