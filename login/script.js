document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  const tipoUsuario = document.getElementById('tipoUsuario').value;

  const loginCorreto = "admin@caad.com";
  const senhaCorreta = "1234";

  const sucesso = email === loginCorreto && senha === senhaCorreta;

  registrarLog({
    acao: "Login",
    usuario: email,
    tipo: tipoUsuario || "não informado",
    status: sucesso ? "Sucesso" : "Falha",
    dataHora: new Date().toLocaleString()
  });

  if (sucesso && tipoUsuario) {
    // Armazena a sessão do usuário
    localStorage.setItem("usuarioLogado", "true");
    localStorage.setItem("tipoUsuario", tipoUsuario);

    // Redireciona para o dashboard
    window.location.href = "dashboard/dashboard.html";
  } else {
    alert("E-mail, senha ou tipo de usuário inválidos.");
  }
});

// Função para registrar logs
function registrarLog(entry) {
  const logs = JSON.parse(localStorage.getItem("logsSistema")) || [];
  logs.push(entry);
  localStorage.setItem("logsSistema", JSON.stringify(logs));
}
