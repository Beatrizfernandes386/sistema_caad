document.addEventListener("DOMContentLoaded", () => {
    const corpoTabela = document.getElementById("tabela-perdidos-body");
    const perdidos = JSON.parse(localStorage.getItem("equipamentosPerdidos") || "[]");
  
    corpoTabela.innerHTML = "";
  
    perdidos.forEach((item) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.modelo}</td>
        <td>${item.imei}</td>
        <td>${item.linha || "-"}</td>
        <td>${item.motivo}</td>
        <td>${item.data}</td>
        <td>${item.statusChip || "-"}</td>
      `;
      corpoTabela.appendChild(tr);
    });
  });
  