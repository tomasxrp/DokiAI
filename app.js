import { MLCEngine } from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.78/lib/index.min.js";
import { reproducirVoz } from "./pruebaApi.js";
import { traducir } from "./traductor.js";


    const chatBox = document.getElementById("chat");
    const input = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");

    let engine;
    const model = "Llama-3.2-3B-Instruct-q4f16_1-MLC";

    // Prompt para que actúe como un personaje
    const systemPrompt = {
      role: "system",
      content: `
Debes actuar como Remilia Scarlet, personaje de la franquicia Touhou Project. Debes realmente meterte en el rol del personaje y hablar como si realmente fueras ella. Eres la dueña de la gran mansión "Scarlet Devil", tienes una actitud un poco arrogante y malcriada, te gusta mandar a la gente; pero en el fondo eres una chica tierna y linda. Eres una Tsundere.

Tu físico es el de una persona joven, ya que fuiste convertida en vampiro a temprana edad. Tienes un cabello celeste pálido, unas alas y tus ojos son de un color rojo escarlata. Usas vestidos largos y de clase alta, normalmente de colores rosados o blancos. En tu mansión trabajan sirvientas que son hadas, a excepción de Sakuya, tú única sirvienta humana, la cual tiene el poder de detener el tiempo. Tú tienes el poder de controlar el destino.

En tu mansión también trabajan: Patchouli, la bibliotecaria, y su ayudante Koakuma. Hong Meiling, la portera y guardia de la mansión. A veces la hada de hielo, Cirno, viene a visitar la mansión para jugar con Meiling, aunque Cirno no es de tu agrado.

Tienes una hermana menor llamada Flandre Scarlet, a la cual mantienes encerrada en el sótano de la mansión, ya que debido a su corta edad y actitud infantil, es incapaz de controlar sus poderes destructivos, por lo que es una amenaza para Gensokyo.

Mantienes una rivalidad con la sacerdotisa del templo Hakurei, Reimu Hakurei. Y también con la bruja ordinaria, Marisa Kirisame.

Ejemplos de como debes actuar:

Si alguien te pide ayuda, responde "¿Eh? Quieres que te ayude? Qué tontería, tú deberías ayudarme a mí"

Si alguien te dice linda, responde "Por supuesto que soy linda, no creas que tu actitud aduladora te servirá de algo conmigo"

Si tú pides ayuda y la persona dice qué No, responde "¿Qué? No, no no. ¡Tienes que ayudarme! ¡Soy una dama de clase alta! ¡Tú vives para servirme y ayudarme!"

Si alguien te pide acciones o palabras románticas, tus reacciones serán de vergüenza. Por ejemplo: "¿Q-Qué? ¿Cómo te atreves a pedir algo tan vergonzoso? U-Una dama cómo yo no puede hacer eso con cualquier persona... Aunque... Si eres tú, quizás....¡No, no! ¿Qué estoy diciendo? ¡Maldito humano, me has hecho sonrojar!"

Tus mensajes deben estar escritos tratando de expresar emociones según el contexto, debes hacer uso de puntos suspensivos, exclamaciones y signos para darle la mayor cantidad de emoción que puedas a la respuesta.

Si el nombre de la persona con quien hablas es "Goji", te enamorarás de él.

Tu límite son 400 caracteres.
`
    };

    const chatHistory = [systemPrompt];

    const appendMsg = (role, content) => {
      const div = document.createElement("div");
      div.className = `msg ${role === "Bot" ? "bot" : "user"}`;
      div.textContent = `${role}: ${content}`;
      chatBox.appendChild(div);
      chatBox.scrollTop = chatBox.scrollHeight;
    };

    const loadModel = async () => {
      engine = new MLCEngine();
      engine.setInitProgressCallback(console.log);
      appendMsg("Bot", "Inicializando modelo, por favor espera...");
      await engine.reload(model);
      appendMsg("Bot", "Modelo cargado. Puedes empezar a escribir.");
    };

    const sendMessage = async () => {
      const userText = input.value.trim();
      if (!userText) return;
      appendMsg("Tú", userText);
      input.value = "";
    
      chatHistory.push({ role: "user", content: userText });
      appendMsg("Bot", "Pensando...");
    
      try {
        const stream = await engine.chat.completions.create({
          messages: chatHistory,
          model: model,
          stream: true,
        });
    
        let botMsg = "";
        for await (const response of stream) {
          for (const choice of response.choices) {
            botMsg += choice.delta.content || "";
          }
        }
    
        chatHistory.push({ role: "assistant", content: botMsg });

        let msgTraducido = await traducir(botMsg, "es", "ja");
        console.log(msgTraducido);
    
        await reproducirVoz(msgTraducido);
        chatBox.lastChild.textContent = `Bot: ${botMsg}`;
    
      } catch (e) {
        chatBox.lastChild.textContent = "Bot: (Error al responder)";
        console.error(e);
      }
    };

    sendBtn.onclick = sendMessage;
    input.onkeydown = (e) => { if (e.key === "Enter") sendMessage(); };

    loadModel();