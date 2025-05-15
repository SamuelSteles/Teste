// Integra o script de geração de redação com a API do ChatGPT e personaliza as notificações com brilho laranja no canto inferior direito

// Carrega script de proteção externo
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/gh/DarkModde/Dark-Scripts/ProtectionScript.js';
document.head.appendChild(script);

console.clear();
const noop = () => {};
console.warn = console.error = window.debug = noop;

// Prompts para geração da redação (resumido para espaço)
const promptsGeracao = [
    `Olá! Você poderia me ajudar a criar uma redação escolar baseada nas informações a seguir?
    ...
    {dadosRedacao}`
];

// Prompts para humanização do texto (resumido para espaço)
const promptsHumanizacao = [
    `Olá! Você poderia reescrever o seguinte texto acadêmico de maneira mais natural...
    {textoRedacao}`
];

// Função para manipular textareas (mantida do original)
async function manipularTextareaMUI(elementoPai, textoParaInserir) {
    const campoTexto = elementoPai.querySelector("textarea:not([aria-hidden=\"true\"])");
    if (!campoTexto) return false;

    try {
        const propriedadesReact = Object.keys(campoTexto).filter(chave =>
            chave.startsWith("__reactProps$") ||
            chave.startsWith("__reactEventHandlers$") ||
            chave.startsWith("__reactFiber$")
        );

        if (propriedadesReact.length > 0) {
            for (const propriedade of propriedadesReact) {
                const handler = campoTexto[propriedade];
                if (handler && typeof handler.onChange === "function") {
                    const eventoSimulado = {
                        target: { value: textoParaInserir },
                        currentTarget: { value: textoParaInserir },
                        preventDefault: () => {},
                        stopPropagation: () => {}
                    };
                    handler.onChange(eventoSimulado);
                    await new Promise(resolve => setTimeout(resolve, 100));
                    return true;
                }
            }
        }
    } catch (erro) {
        console.error("[ERRO]", erro);
    }

    try {
        campoTexto.value = "";
        campoTexto.dispatchEvent(new Event("input", { bubbles: true }));
        await new Promise(resolve => setTimeout(() => {
            campoTexto.value = textoParaInserir;
            campoTexto.dispatchEvent(new Event("input", { bubbles: true }));
            campoTexto.dispatchEvent(new Event("change", { bubbles: true }));
            campoTexto.dispatchEvent(new Event("blur", { bubbles: true }));
            resolve();
        }, 50));
    } catch (erro) {
        console.error("[ERRO]", erro);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
}

// Estilo das notificações personalizadas com fundo preto e brilho laranja
function criarEstiloNotificacao() {
    if (document.getElementById('estilo-notificacao')) return;
    const estilo = document.createElement('style');
    estilo.id = 'estilo-notificacao';
    estilo.textContent = `
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
            background-color: #000;
            color: #fff;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 0 15px rgba(255, 140, 0, 0.75);
            animation: fadeIn 0.4s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(estilo);
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
        notificacao.className = 'notificacao';
        notificacao.innerHTML = `<strong>${titulo}</strong><br>${mensagem}`;
        container.appendChild(notificacao);
        setTimeout(() => {
            notificacao.style.opacity = '0';
            notificacao.style.transform = 'translateY(20px)';
            setTimeout(() => notificacao.remove(), 300);
            resolve();
        }, duracao);
    });
}

// API ChatGPT (substitui DeepSeek)
async function obterRespostaIA(promptTexto) {
    try {
        const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer SUA_CHAVE_OPENAI_AQUI"
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: promptTexto }],
                temperature: 0.7,
                max_tokens: 2000,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0
            })
        });
        if (!resposta.ok) throw new Error("Erro: " + resposta.status);
        const json = await resposta.json();
        return json.choices[0].message.content;
    } catch (erro) {
        await mostrarNotificacaoSinc('erro', 'Erro', erro.message);
        throw erro;
    }
}

// Execução principal
async function verificarRedacao() {
    const elementoRedacao = document.querySelector("p.MuiTypography-root.MuiTypography-body1.css-m576f2");
    if (elementoRedacao && elementoRedacao.textContent.includes("Redacao")) {
        try {
            await mostrarNotificacaoSinc('info', 'Iniciando', 'Extraindo informações...');
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
            const prompt = promptsGeracao[Math.floor(Math.random() * promptsGeracao.length)].replace('{dadosRedacao}', JSON.stringify(dadosRedacao));
            const resposta = await obterRespostaIA(prompt);
            const titulo = resposta.split("TITULO:")[1].split("TEXTO:")[0].trim();
            const texto = resposta.split("TEXTO:")[1].trim();
            await mostrarNotificacaoSinc('info', 'Humanizando', 'Melhorando o texto...');
            const promptHumano = promptsHumanizacao[Math.floor(Math.random() * promptsHumanizacao.length)].replace('{textoRedacao}', texto);
            const textoFinal = await obterRespostaIA(promptHumano);
            const campos = document.querySelectorAll("textarea");
            await manipularTextareaMUI(campos[0].parentElement, titulo);
            await manipularTextareaMUI(campos[campos.length - 1].parentElement, textoFinal);
            await mostrarNotificacaoSinc('sucesso', 'Pronto!', 'Redação gerada e preenchida!');
        } catch (erro) {
            console.error('[ERRO]', erro);
        }
    } else {
        await mostrarNotificacaoSinc('erro', 'Erro', 'Página inválida. Use em uma página de redação.');
    }
}

verificarRedacao();
