const form = document.getElementById('clienteForm');
const clientesTable = document.querySelector('#clientesTable tbody');
const totalClientes = document.getElementById('totalClientes');
const clientesCompraram = document.getElementById('clientesCompraram');
const taxaSucesso = document.getElementById('taxaSucesso');
const errorMsg = document.getElementById('errorMsg');

const nomeInput = document.getElementById('nome');
const telefoneInput = document.getElementById('telefone');
const comprouInput = document.getElementById('comprou');
const submitButton = form.querySelector('button[type="submit"]');

const STORAGE_KEY = 'cadastroClientes.v1';
let clientes = [];
let editId = null;

// Recupera os registros salvos neste navegador.
try {
  const dados = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  if (
    !Array.isArray(dados) ||
    !dados.every(cliente =>
      cliente &&
      typeof cliente.id === 'string' &&
      typeof cliente.nome === 'string' &&
      typeof cliente.telefone === 'string' &&
      ['Sim', 'Nao'].includes(cliente.comprou)
    ) ||
    new Set(dados.map(cliente => cliente.id)).size !== dados.length
  ) {
    throw new Error('Dados inválidos');
  }

  clientes = dados;
} catch {
  errorMsg.textContent =
    'Não foi possível recuperar os cadastros salvos neste navegador.';
}

function salvarClientes(novaLista) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));
    clientes = novaLista;
    return true;
  } catch {
    errorMsg.textContent =
      'Não foi possível salvar. Verifique o armazenamento do navegador.';
    return false;
  }
}

function validarTelefone(telefone) {
  return (
    /^\d{10,11}$/.test(telefone) &&
    !/^(\d)\1+$/.test(telefone) &&
    Number(telefone.slice(0, 2)) >= 11
  );
}

function limparFormulario() {
  form.reset();
  editId = null;
  submitButton.textContent = 'Cadastrar Cliente';
}

form.addEventListener('submit', function (event) {
  event.preventDefault();
  errorMsg.textContent = '';

  const nome = nomeInput.value.trim().replace(/\s+/g, ' ');
  const telefone = telefoneInput.value.replace(/\D/g, '');
  const comprou = comprouInput.value;

  if (
    !/^\p{L}+(?:[ '\u2019-]\p{L}+)*$/u.test(nome) ||
    (nome.match(/\p{L}/gu) || []).length < 3
  ) {
    errorMsg.textContent =
      'Informe um nome com pelo menos 3 letras.';
    return;
  }

  if (!validarTelefone(telefone)) {
    errorMsg.textContent =
      'Informe o DDD e o telefone com 10 ou 11 dígitos.';
    return;
  }

  if (!['Sim', 'Nao'].includes(comprou)) {
    errorMsg.textContent = 'Selecione se o cliente comprou.';
    return;
  }

  if (editId !== null && !clientes.some(c => c.id === editId)) {
    errorMsg.textContent =
      'Este cadastro não está mais disponível. Inicie novamente.';
    limparFormulario();
    return;
  }

  const cliente = {
    id: editId ?? crypto.randomUUID(),
    nome,
    telefone,
    comprou
  };

  const novaLista = editId === null
    ? [...clientes, cliente]
    : clientes.map(item => item.id === editId ? cliente : item);

  if (!salvarClientes(novaLista)) return;

  limparFormulario();
  atualizarTabela();
});

function criarBotao(texto, classe, acao) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = texto;
  button.className = `action-btn ${classe}`;
  button.addEventListener('click', acao);
  return button;
}

function atualizarTabela() {
  clientesTable.replaceChildren();

  clientes.forEach(cliente => {
    const row = document.createElement('tr');

    [
      cliente.nome,
      cliente.telefone,
      cliente.comprou === 'Sim' ? 'Sim' : 'Não'
    ].forEach(valor => {
      const cell = document.createElement('td');
      cell.textContent = valor;
      row.appendChild(cell);
    });

    const acoes = document.createElement('td');

    acoes.append(
      criarBotao('Editar', 'edit-btn', () => {
        preencherFormularioParaEdicao(cliente.id);
      }),
      criarBotao('Remover', 'delete-btn', () => {
        removerCliente(cliente.id);
      })
    );

    row.appendChild(acoes);
    clientesTable.appendChild(row);
  });

  const compraram = clientes.filter(c => c.comprou === 'Sim').length;

  totalClientes.textContent = clientes.length;
  clientesCompraram.textContent = compraram;
  taxaSucesso.textContent = clientes.length
    ? `${((compraram / clientes.length) * 100).toFixed(2)}%`
    : '0%';
}

function preencherFormularioParaEdicao(id) {
  const cliente = clientes.find(item => item.id === id);
  if (!cliente) return;

  errorMsg.textContent = '';
  nomeInput.value = cliente.nome;
  telefoneInput.value = cliente.telefone;
  comprouInput.value = cliente.comprou;
  editId = cliente.id;
  submitButton.textContent = 'Salvar Alteração';
  nomeInput.focus();
}

function removerCliente(id) {
  if (!confirm('Deseja remover este cliente?')) return;

  errorMsg.textContent = '';
  const novaLista = clientes.filter(cliente => cliente.id !== id);
  if (!salvarClientes(novaLista)) return;

  if (editId === id) limparFormulario();
  atualizarTabela();
}

atualizarTabela();
