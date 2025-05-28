const form = document.getElementById('clienteForm');
const clientesTable = document.querySelector('#clientesTable tbody');
const totalClientes = document.getElementById('totalClientes');
const clientesCompraram = document.getElementById('clientesCompraram');
const taxaSucesso = document.getElementById('taxaSucesso');
const errorMsg = document.getElementById('errorMsg');

let clientes = [];
let editIndex = null;

function validarTelefone(telefone) {
  telefone = telefone.replace(/\D/g, '');
  if (!(telefone.length === 10 || telefone.length === 11)) return false;
  if (/^(\d)\1+$/.test(telefone)) return false;
  const ddd = telefone.substring(0, 2);
  if (parseInt(ddd, 10) < 11 || parseInt(ddd, 10) > 99) return false;
  return true;
}

form.addEventListener('submit', function(event) {
  event.preventDefault();
  errorMsg.textContent = '';

  const nome = document.getElementById('nome').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const comprou = document.getElementById('comprou').value;

  // Validação do nome
  if (!nome || nome.length < 3 || !/^[A-Za-zÀ-ÿ\s]+$/.test(nome)) {
    errorMsg.textContent = 'Informe um nome válido (mínimo 3 letras, somente letras e espaços).';
    return;
  }

  if (!validarTelefone(telefone)) {
    errorMsg.textContent = 'Informe um telefone válido: DDD + número, 10 ou 11 dígitos, não pode ser todos iguais.';
    return;
  }

  if (editIndex !== null) {
    clientes[editIndex] = { nome, telefone, comprou };
    editIndex = null;
    form.querySelector('button[type="submit"]').textContent = 'Cadastrar Cliente';
  } else {
    clientes.push({ nome, telefone, comprou });
  }
  atualizarTabela();
  form.reset();
});

function atualizarTabela() {
  clientesTable.innerHTML = '';
  let compraram = 0;

  clientes.forEach((cliente, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${cliente.nome}</td>
      <td>${cliente.telefone}</td>
      <td>${cliente.comprou}</td>
      <td>
        <button class="action-btn edit-btn" data-index="${index}">Editar</button>
        <button class="action-btn delete-btn" data-index="${index}">Remover</button>
      </td>
    `;
    clientesTable.appendChild(row);

    if (cliente.comprou === 'Sim') compraram++;
  });

  totalClientes.textContent = clientes.length;
  clientesCompraram.textContent = compraram;
  taxaSucesso.textContent = clientes.length ? ((compraram / clientes.length) * 100).toFixed(2) + '%' : '0%';

  // Adicionar eventos aos botões de ação
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const index = parseInt(this.getAttribute('data-index'));
      preencherFormularioParaEdicao(index);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const index = parseInt(this.getAttribute('data-index'));
      if (confirm('Deseja remover este cliente?')) {
        clientes.splice(index, 1);
        atualizarTabela();
      }
    });
  });
}

function preencherFormularioParaEdicao(index) {
  const cliente = clientes[index];
  document.getElementById('nome').value = cliente.nome;
  document.getElementById('telefone').value = cliente.telefone;
  document.getElementById('comprou').value = cliente.comprou;
  editIndex = index;
  form.querySelector('button[type="submit"]').textContent = 'Salvar Alteração';
}