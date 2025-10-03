document.getElementById('cadastroForm').addEventListener('submit', async function(e){
  e.preventDefault();
  const form = e.target;
  const msg = document.getElementById('msg');
  msg.textContent = '';
  msg.style.color = ''; // reset

  if(!form.checkValidity()){
    msg.style.color = '#c62828';
    msg.textContent = 'Por favor, preencha todos os campos obrigatórios corretamente.';
    return;
  }

  const data = {
    dono: {
      nome_completo: form.nome_completo.value.trim(),
      cpf: form.cpf.value.trim(),
      email: form.email.value.trim(),
      telefone: form.telefone.value.trim(),
      endereco: form.endereco.value.trim()
    },
    pet: {
      nome_pet: form.nome_pet.value.trim(),
      especie: form.especie.value,
      raca: form.raca.value.trim(),
      data_nascimento: form.data_nascimento.value,
      observacoes: form.observacoes.value.trim()
    }
  };

  try{
    const resp = await fetch('/api/register', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    const result = await resp.json();
    if(resp.ok){
      msg.style.color = '#2e7d32';
      msg.textContent = 'Cliente e pet cadastrados com sucesso!';
      form.reset();
    } else {
      msg.style.color = '#c62828';
      msg.textContent = result.error || 'Erro ao cadastrar. Tente novamente.';
    }
  } catch(err){
    console.error(err);
    msg.style.color = '#c62828';
    msg.textContent = 'Erro de rede. Verifique o servidor.';
  }
});
