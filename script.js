/**
 * iGaming Ledger - AI Evaluation Engine
 */

// 1. VARIÁVEIS GLOBAIS PEDIDAS PELO PROFESSOR (Substituindo o antigo sistema de saldo)
let totalNotas = 0;
let qtdAval = 0;

// 2. FUNÇÃO DE CÁLCULO DE MÉDIA PEDIDA PELO PROFESSOR
function atualizarMedia(nota) {
  totalNotas += Number(nota);
  qtdAval += 1;
  let media = (totalNotas / qtdAval).toFixed(2);
  
  // Atualiza o valor na tela se o elemento existir
  const elementoMedia = document.getElementById('mediaNota');
  if (elementoMedia) {
      elementoMedia.innerText = media;
  }
}

// 3. INICIALIZAÇÃO DA PÁGINA
document.addEventListener("DOMContentLoaded", () => {
    
    // Captura o formulário de auditoria do arquivo auditor.html
    const formAuditoria = document.getElementById('evalForm');
    
    if (formAuditoria) {
        formAuditoria.addEventListener('submit', (event) => {
            event.preventDefault(); // Impede a página de recarregar

            // Captura os dados digitados no formulário
            const dataVal = document.getElementById('data').value;
            const promptIdVal = document.getElementById('promptId').value;
            const respostaIaVal = document.getElementById('respostaIa').value;
            const notaVal = document.getElementById('nota').value;
            const tipoErroVal = document.getElementById('tipoErro').value;
            const comentarioVal = document.getElementById('comentario').value;

            // Chama a função obrigatória passando a nota selecionada
            atualizarMedia(notaVal);

            // Alerta de sucesso para o usuário demonstrando que funcionou
            alert(`✅ AVALIAÇÃO PROCESSADA!\nPrompt ID: ${promptIdVal}\nNota Computada: ${notaVal}\nTipo de Erro: ${tipoErroVal || "Sem erro"}`);
            
            // Limpa o formulário após o envio
            formAuditoria.reset();
        });
    }
});
