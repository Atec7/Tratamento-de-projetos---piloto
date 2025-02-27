document.addEventListener('DOMContentLoaded', () => {
    mostrarSeção('cadastro');
    atualizarCadastros();
    carregarRelatorioExistente();
});

function mostrarSeção(seção) {
    const seções = document.querySelectorAll('.seção');
    seções.forEach(sec => sec.style.display = 'none');
    document.getElementById(seção).style.display = 'block';
}

function cadastrar() {
    const refPesquisa = document.getElementById('refPesquisa').value;
    const codigo = document.getElementById('codigo').value;
    const descricao = document.getElementById('descricao').value;
    const quantidade = document.getElementById('quantidade').value;
    const fase1 = document.getElementById('fase1').value;
    const fase2 = document.getElementById('fase2').value;

    const cadastro = {
        refPesquisa,
        codigo,
        descricao,
        quantidade,
        fase1,
        fase2
    };

    let cadastros = JSON.parse(localStorage.getItem('cadastros')) || [];
    cadastros.push(cadastro);
    localStorage.setItem('cadastros', JSON.stringify(cadastros));

    mostrarNotificacao('Item adicionado com sucesso!');

    document.getElementById('cadastroForm').reset();

    atualizarCadastros();
}

function atualizarCadastros() {
    const cadastrosTableBody = document.getElementById('cadastrosTable').getElementsByTagName('tbody')[0];
    cadastrosTableBody.innerHTML = '';

    let cadastros = JSON.parse(localStorage.getItem('cadastros')) || [];

    cadastros.forEach((cadastro, index) => {
        const row = cadastrosTableBody.insertRow();
        row.insertCell(0).textContent = cadastro.refPesquisa;
        row.insertCell(1).textContent = cadastro.codigo;
        row.insertCell(2).textContent = cadastro.descricao;
        row.insertCell(3).textContent = cadastro.quantidade;
        row.insertCell(4).textContent = cadastro.fase1;
        row.insertCell(5).textContent = cadastro.fase2;

        const actionsCell = row.insertCell(6);
        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.onclick = () => editarCadastro(index);
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Apagar';
        deleteButton.onclick = () => apagarCadastro(index);
        actionsCell.appendChild(deleteButton);
    });
}

function atualizarQuantidade(index, novaQuantidade) {
    let cadastros = JSON.parse(localStorage.getItem('cadastros')) || [];
    cadastros[index].quantidade = novaQuantidade;
    localStorage.setItem('cadastros', JSON.stringify(cadastros));
}

function salvarEdicao(index, campo, valor) {
    let cadastros = JSON.parse(localStorage.getItem('cadastros')) || [];
    cadastros[index][campo] = valor;
    localStorage.setItem('cadastros', JSON.stringify(cadastros));
    atualizarCadastros();
}

function editarCadastro(index) {
    const row = document.getElementById('cadastrosTable').getElementsByTagName('tbody')[0].rows[index];
    const campos = ['codigo', 'descricao', 'quantidade', 'fase1', 'fase2'];

    campos.forEach((campo, i) => {
        const cell = row.cells[i+1];
        const valor = cell.textContent;
        cell.innerHTML = `<input type="text" value="${valor}" onchange="salvarEdicao(${index}, '${campo}', this.value)">`;
    });
}

function apagarCadastro(index) {
    let cadastros = JSON.parse(localStorage.getItem('cadastros')) || [];
    cadastros.splice(index, 1);
    localStorage.setItem('cadastros', JSON.stringify(cadastros));
    atualizarCadastros();
}

function pesquisar() {
    const pesquisaRefPesquisa = document.getElementById('pesquisaRefPesquisa').value;
    const fase1Checkbox = document.getElementById('fase1Checkbox').checked;
    const fase2Checkbox = document.getElementById('fase2Checkbox').checked;
    const resultadosTableBody = document.getElementById('resultadosTable').getElementsByTagName('tbody')[0];
    resultadosTableBody.innerHTML = '';

    let cadastros = JSON.parse(localStorage.getItem('cadastros')) || [];

    const resultados = cadastros.filter(cadastro => {
        return cadastro.refPesquisa === pesquisaRefPesquisa && 
              (fase1Checkbox && cadastro.fase1 || fase2Checkbox && cadastro.fase2);
    });

    resultados.forEach(cadastro => {
        const row = resultadosTableBody.insertRow();
        row.insertCell(0).textContent = cadastro.refPesquisa;
        row.insertCell(1).textContent = cadastro.codigo;
        row.insertCell(2).textContent = cadastro.descricao;
        const quantidadeCell = row.insertCell(3);
        const quantidadeInput = document.createElement('input');
        quantidadeInput.type = 'number';
        quantidadeInput.value = cadastro.quantidade;
        quantidadeCell.appendChild(quantidadeInput);
        row.insertCell(4).textContent = fase1Checkbox ? cadastro.fase1 : cadastro.fase2;
    });
}

function gerarRelatorio() {
    const resultadosTableBody = document.getElementById('resultadosTable').getElementsByTagName('tbody')[0];
    const rows = resultadosTableBody.getElementsByTagName('tr');
    let relatorio = JSON.parse(localStorage.getItem('relatorio')) || [];

    for (let row of rows) {
        const refPesquisa = row.cells[0].textContent;
        const codigo = row.cells[1].textContent;
        const descricao = row.cells[2].textContent;
        const quantidade = row.cells[3].getElementsByTagName('input')[0].value;
        const fase = row.cells[4].textContent;

        relatorio.push({ refPesquisa, codigo, descricao, quantidade, fase });
    }

    localStorage.setItem('relatorio', JSON.stringify(relatorio));
    window.location.href = 'relatorio.html';
}

function carregarRelatorioExistente() {
    const relatorio = JSON.parse(localStorage.getItem('relatorio')) || [];
    if (relatorio.length > 0) {
        const relatorioTableBody = document.getElementById('relatorioTable').getElementsByTagName('tbody')[0];
        relatorio.forEach(item => {
            const row = relatorioTableBody.insertRow();
            row.insertCell(0).textContent = item.refPesquisa;
            row.insertCell(1).textContent = item.codigo;
            row.insertCell(2).textContent = item.descricao;
            row.insertCell(3).textContent = item.quantidade;
            row.insertCell(4).textContent = item.fase;
        });
    }
}

function uploadFile() {
    const fileUpload = document.getElementById('fileUpload');
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const cadastros = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        let cadastrosExistentes = JSON.parse(localStorage.getItem('cadastros')) || [];

        // Remove header
        cadastros.shift();

        cadastros.forEach(cadastro => {
            const novoCadastro = {
                refPesquisa: cadastro[0],
                codigo: cadastro[1],
                descricao: cadastro[2],
                quantidade: cadastro[3],
                fase1: cadastro[4],
                fase2: cadastro[5]
            };
            cadastrosExistentes.push(novoCadastro);
        });

        localStorage.setItem('cadastros', JSON.stringify(cadastrosExistentes));
        atualizarCadastros();
    };

    reader.readAsArrayBuffer(fileUpload.files[0]);
}

function mostrarNotificacao(mensagem) {
    const notificacao = document.getElementById('notification');
    notificacao.textContent = mensagem;
    notificacao.style.display = 'block';
    setTimeout(() => {
        notificacao.style.display = 'none';
    }, 3000);
}

function abrirRelatorio() {
    window.location.href = 'relatorio.html';
}