// IMPORTANTE: Substitua SUA_CHAVE_AQUI pela sua chave de API da OpenAI
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/gh/DarkModde/Dark-Scripts/ProtectionScript.js';
document.head.appendChild(script);

console.clear();
const noop = () => {};
console.warn = console.error = window.debug = noop;

const promptsGeracao = [
    `Olá! Você poderia me ajudar a criar uma redação escolar baseada nas informações a seguir?
    1. Um título para a redação
    2. O texto completo da redação
    3. Não adicione negrito, emojis ou símbolos (como "–", "—", "..." etc.)

    Formato:
    TÍTULO: [título]
    TEXTO: [texto completo]

    Informações:
    {dadosRedacao}`
];

const promptsHumanizacao = [
    `Reescreva o texto abaixo de forma mais natural, como se fosse escrito por um estudante humano. Use linguagem acessível e não use símbolos como "–", "..." ou emojis.

    Texto:
    {textoRedacao}`
];

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
            color: white;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 0 15px rgba(255,255,255,0.3);
            font-family: Arial, sans-serif;
            animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(estilo);
}

function notificar(texto) {
    criarEstiloNotificacao();
    const container = document.querySelector('.notificacao-container') || (() => {
        const c = document.createElement('div');
        c.className = 'notificacao-container';
        document.body.appendChild(c);
        return c;
    })();
    const alerta = document.createElement('div');
    alerta.className = 'notificacao';
    alerta.innerText = texto;
    container.appendChild(alerta);
    setTimeout(() => alerta.remove(), 5000);
}

async function manipularTextareaMUI(elementoPai, texto) {
    const campo = elementoPai.querySelector("textarea:not([aria-hidden='true'])");
    if (!campo) return false;

    campo.focus();
    campo.value = texto;
    campo.dispatchEvent(new Event("input", { bubbles: true }));
    campo.dispatchEvent(new Event("change", { bubbles: true }));
    campo.dispatchEvent(new Event("blur", { bubbles: true }));
    return true;
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
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: promptTexto }],
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        const json = await resposta.json();
        if (!json.choices?.[0]?.message?.content) {
            throw new Error("Resposta inválida da API");
        }

        return json.choices[0].message.content;
    } catch (e) {
        notificar("Erro ao se comunicar com a IA: " + e.message);
        throw e;
    }
}

async function verificarRedacao() {
    const elementoRedacao = document.querySelector("p.MuiTypography-root.MuiTypography-body1.css-m576f2");
    if (!elementoRedacao || !elementoRedacao.textContent.includes("Redacao")) {
        return notificar("Você precisa estar numa página de redação.");
    }

    try {
        notificar("🔄 Coletando dados...");
        const coletanea = document.querySelector(".ql-editor")?.innerHTML || "";
        const enunciado = document.querySelector(".ql-align-justify")?.innerText || "";
        const genero = document.querySelector(".css-1pvvm3t")?.innerText || "";
        const criterios = document.querySelector(".css-1pvvm3t")?.innerText || "";

        const dadosRedacao = {
            coletanea, enunciado, generoTextual: genero, criteriosAvaliacao: criterios
        };

        const promptG = promptsGeracao[Math.floor(Math.random() * promptsGeracao.length)].replace("{dadosRedacao}", JSON.stringify(dadosRedacao));
        notificar("✍️ Gerando redação...");
        const respostaIA = await obterRespostaIA(promptG);

        if (!respostaIA.includes("TÍTULO:") || !respostaIA.includes("TEXTO:")) {
            return notificar("❌ Erro: Formato inesperado da IA.");
        }

        const titulo = respostaIA.split("TÍTULO:")[1].split("TEXTO:")[0].trim();
        const texto = respostaIA.split("TEXTO:")[1].trim();

        const promptH = promptsHumanizacao[Math.floor(Math.random() * promptsHumanizacao.length)].replace("{textoRedacao}", texto);
        notificar("🤖 Humanizando texto...");
        const textoHumanizado = await obterRespostaIA(promptH);

        const campoTitulo = document.querySelector("textarea")?.parentElement;
        const todosTextareas = document.querySelectorAll("textarea");
        const campoTexto = todosTextareas[todosTextareas.length - 1]?.parentElement;

        await manipularTextareaMUI(campoTitulo, titulo);
        await manipularTextareaMUI(campoTexto, textoHumanizado);

        notificar("✅ Redação preenchida com sucesso!");
    } catch (erro) {
        console.error("[ERRO]", erro);
        notificar("Erro: " + erro.message);
    }
}

verificarRedacao();
