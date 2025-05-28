function validarTelefone(telefone) {
  // Remove espaços e pontuações
  telefone = telefone.replace(/\D/g, '');

  // Deve ter 10 ou 11 dígitos
  if (!(telefone.length === 10 || telefone.length === 11)) return false;

  // Não pode ser todos os dígitos iguais (ex: 99999999999)
  if (/^(\d)\1+$/.test(telefone)) return false;

  // DDD não pode começar com 0 ou 1
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

  // Validação do telefone aprimorada
  if (!validarTelefone(telefone)) {
    errorMsg.textContent = 'Informe um telefone válido: DDD + número, 10 ou 11 dígitos, não pode ser todos iguais.';
    return;
  }

  clientes.push({ nome, telefone, comprou });
  atualizarTabela();
  form.reset();
});