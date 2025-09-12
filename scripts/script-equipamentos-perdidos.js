document.addEventListener("DOMContentLoaded", async () => {
  await carregarEquipamentosPerdidos();
});

// Carregar equipamentos perdidos da API
async function carregarEquipamentosPerdidos() {
  try {
    const response = await apiRequest('${API_CONFIG.API_URL}/api/inventory/lost');
    if (!response.ok) {
      console.error('Erro ao carregar equipamentos perdidos');
      return;
    }

    const perdidos = await response.json();
    const corpoTabela = document.getElementById("tabela-perdidos-body");
    corpoTabela.innerHTML = "";

    perdidos.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.model}</td>
        <td>${item.imei}</td>
        <td>${item.line || "-"}</td>
        <td>${item.reason}</td>
        <td>${item.date}</td>
        <td>${item.statusChip || "-"}</td>
      `;
      corpoTabela.appendChild(tr);
    });
  } catch (error) {
    console.error('Erro ao carregar equipamentos perdidos:', error);
  }
}
  
