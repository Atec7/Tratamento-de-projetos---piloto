document.addEventListener('DOMContentLoaded', () => {
    const relatorioTableBody = document.getElementById('relatorioTable').getElementsByTagName('tbody')[0];
    const relatorio = JSON.parse(localStorage.getItem('relatorio')) || [];

    relatorio.forEach((item) => {
        const row = relatorioTableBody.insertRow();
        row.insertCell(0).textContent = item.refPesquisa;
        row.insertCell(1).textContent = item.codigo;
        row.insertCell(2).textContent = item.descricao;
        row.insertCell(3).textContent = item.quantidade;
        row.insertCell(4).textContent = item.fase;
    });
});

function voltarPesquisa() {
    window.location.href = 'index.html';
}

function limparRelatorio() {
    localStorage.removeItem('relatorio');
    location.reload();
}

function baixarImagem() {
    const relatorioContainer = document.getElementById('relatorioContainer');
    html2canvas(relatorioContainer).then(function(canvas) {
        const link = document.createElement('a');
        link.download = 'relatorio.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

function reportarProblema() {
    window.open('https://api.whatsapp.com/send?phone=5564996151084&text=Estou%20reportando%20um%20problema%20no%20sistema%20de%20cadastro.', '_blank');
}