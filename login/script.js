document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  // Login e senha fixos para teste
  const loginCorreto = "admin@caad.com";
  const senhaCorreta = "1234";

  if (email === loginCorreto && senha === senhaCorreta) {
    window.location.href = "dashboard/dashboard.html";
  } else {
    alert("E-mail ou senha inválidos.");
  }
});
