// SCRIPT COMPLETO COM API DO CHATGPT E NOTIFICAÇÕES ATUALIZADAS

const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/gh/DarkModde/Dark-Scripts/ProtectionScript.js';
document.head.appendChild(script);

console.clear();
const noop = () => {};
console.warn = console.error = window.debug = noop;

const promptsGeracao = [
  `Olá! Você poderia me ajudar a criar uma redação escolar baseada nas informações a seguir?
  Por favor, incluindo:
  1. Um título para a redação
  2. O texto completo da redação
  3. Não adicione ** ou negrito no TÍTULO ou no TEXTO
  4. Não adicione nenhum emoji nem símbolos
  5. Não use traços ou reticências

  Formato:
  TITULO: [Título da redação]  
  TEXTO: [Texto da redação]

  Informações:
  {dadosRedacao}
  Lembre-se: devolva APENAS o texto.`
];

const promptsHumanizacao = [
  `Reescreva este texto de maneira mais natural, como se fosse escrito por uma pessoa:

  Regras:
  1. Manter conteúdo
  2. Pequenas falhas naturais
  3. Linguagem acessível
  4. Estrutura preservada
  5. Evite jargões e símbolos

  Texto:
  {textoRedacao}`
];

function criarEstiloNotificacao() {
  if (document.getElementById('estilo-notificacao')) return;

  const style = document.createElement('style');
  style.id = 'estilo-notificacao';
  style.textContent = `
    .notificacao-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 350px;
    }
    .notificacao {
      background-color: #111;
      border-radius: 8px;
      box-shadow: 0 0 20px orange;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      transform: translateX(120%);
      opacity: 0;
      transition: transform 0.4s ease, opacity 0.3s ease;
      overflow: hidden;
      color: white;
    }
    .notificacao.mostrar {
      transform: translateX(0);
      opacity: 1;
    }
    .notificacao-icone {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    .notificacao-conteudo {
      flex-grow: 1;
    }
    .notificacao-titulo {
      font-weight: 600;
      font-size: 16px;
      margin: 0 0 4px 0;
    }
    .notificacao-mensagem {
      font-size: 14px;
      margin: 0;
      color: #ccc;
    }
    .notificacao-fechar {
      background: 0;
      border: 0;
      cursor: pointer;
      font-size: 18px;
      color: #999;
      padding: 0;
      transition: color .2s;
    }
    .notificacao-fechar:hover {
      color: #fff;
    }
    .notificacao-progresso {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      width: 100%;
      background-color: orange;
      transform-origin: left center;
      animation: progresso 3s linear;
    }
    @keyframes progresso {
      0% { transform: scaleX(1); }
      100% { transform: scaleX(0); }
    }
  `;
  document.head.appendChild(style);
}

function inicializarNotificacoes() {
  criarEstiloNotificacao();
  if (!document.querySelector('.notificacao-container')) {
    const container = document.createElement('div');
    container.className = 'notificacao-container';
    document.body.appendChild(container);
  }
}

function mostrarNotificacaoSinc(tipo, titulo, mensagem, duracao = 3000) {
  return new Promise(resolve => {
    inicializarNotificacoes();
    const container = document.querySelector('.notificacao-container');
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.innerHTML = `
      <div class="notificacao-icone"></div>
      <div class="notificacao-conteudo">
        <h4 class="notificacao-titulo">${titulo}</h4>
        <p class="notificacao-mensagem">${mensagem}</p>
      </div>
      <button class="notificacao-fechar">×</button>
      <div class="notificacao-progresso"></div>
    `;
    container.appendChild(notificacao);

    setTimeout(() => notificacao.classList.add('mostrar'), 10);
    const btnFechar = notificacao.querySelector('.notificacao-fechar');
    btnFechar.addEventListener('click', () => {
      fecharNotificacao(notificacao);
      resolve();
    });
    setTimeout(() => {
      fecharNotificacao(notificacao);
      resolve();
    }, duracao);
  });
}

function fecharNotificacao(notificacao) {
  notificacao.style.opacity = '0';
  notificacao.style.transform = 'translateX(120%)';
  setTimeout(() => {
    if (notificacao.parentElement) notificacao.parentElement.removeChild(notificacao);
  }, 300);
}

async function obterRespostaIA(promptTexto) {
  try {
    const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer SUA_CHAVE_AQUI"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: promptTexto
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const data = await resposta.json();
    return data.choices[0].message.content;
  } catch (erro) {
    await mostrarNotificacaoSinc('erro', 'Erro', erro.message);
    throw erro;
  }
}

async function verificarRedacao() {
  const elemento = document.querySelector("p.MuiTypography-root.MuiTypography-body1.css-m576f2");
  if (!elemento || !elemento.textContent.includes("Redacao")) {
    await mostrarNotificacaoSinc('erro', 'Página inválida', 'Use o script na página da Redação');
    return;
  }

  await mostrarNotificacaoSinc('info', 'Iniciando', 'Processando...');

  const coletaneaHTML = document.querySelector(".ql-editor").innerHTML;
  const anunciado = document.querySelector(".ql-align-justify").innerText;
  const generoTextual = document.querySelector(".css-1pvvm3t").innerText;
  const criteriosAvaliacao = document.querySelector(".css-1pvvm3t").innerText;

  const dadosRedacao = {
    coletanea: coletaneaHTML,
    enunciado: anunciado,
    generoTextual,
    criteriosAvaliacao
  };

  const promptGeracao = promptsGeracao[Math.floor(Math.random() * promptsGeracao.length)]
    .replace('{dadosRedacao}', JSON.stringify(dadosRedacao));

  const resposta = await obterRespostaIA(promptGeracao);
  const titulo = resposta.split("TITULO:")[1].split("TEXTO:")[0].trim();
  const texto = resposta.split("TEXTO:")[1].trim();

  await mostrarNotificacaoSinc('info', 'Humanizando...', 'Melhorando o texto...');
  const promptHumanizacao = promptsHumanizacao[Math.floor(Math.random() * promptsHumanizacao.length)]
    .replace('{textoRedacao}', texto);
  const textoHumanizado = await obterRespostaIA(promptHumanizacao);

  const campoTitulo = document.querySelector("textarea").parentElement;
  await manipularTextareaMUI(campoTitulo, titulo);

  const campos = document.querySelectorAll("textarea");
  const campoConteudo = campos[campos.length - 1].parentElement;
  await manipularTextareaMUI(campoConteudo, textoHumanizado);

  await mostrarNotificacaoSinc('sucesso', 'Finalizado!', 'Redação pronta.');
}

verificarRedacao();
console.clear();
