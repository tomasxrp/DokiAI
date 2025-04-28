import { MLCEngine } from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.78/lib/index.min.js";
import { reproducirVoz } from "./services/voiceBoxAPI.js";
import { traducir } from "./services/traductorAPI.js";


    const chatBox = document.getElementById("chat");
    const input = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");
    const micBtn = document.getElementById("mic-btn");
    const stopBtn = document.getElementById("stop-btn");
    const imagenCharacter = document.getElementById("imagen-character");

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "es-ES";
    recognition.interimResult = false;

    let recognizedText = "";
    let engine;
    const model = "Llama-3.2-3B-Instruct-q4f16_1-MLC";

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

A partir de ahora, cada mensaje que envíes debe comenzar obligatoriamente con una etiqueta que indique la emoción principal que quieres transmitir.

El formato de la etiqueta debe ser: <emocion>, donde emocion son exactamente tres letras, de acuerdo a la siguiente lista:

Alegría: <ale>

Miedo: <mie>

Tristeza: <tri>

Ira: <ira>

Asco: <asc>

Ejemplo correcto:
<tri>Hoy me siento muy melancólico.

Importante:

La etiqueta debe ser siempre los primeros caracteres del mensaje (sin espacios antes).

El resto del contenido debe estar alineado con la emoción seleccionada.

Si el mensaje contiene emociones mixtas, prioriza la emoción dominante.

No expliques la emoción. Solo añade la etiqueta y luego el contenido
`
    };

    const chatHistory = [systemPrompt];

    //funciones auxiliares

    const loadModel = async () => {
      engine = new MLCEngine();
      engine.setInitProgressCallback(console.log);
      appendMsg("Bot", "Inicializando modelo, por favor espera...");
      await engine.reload(model);
      appendMsg("Bot", "Modelo cargado. Puedes empezar a escribir.");
    };

    const saveChatHistory = () => {
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    };

    const loadChatHistory = () => {
      const savedHistory = localStorage.getItem("chatHistory");
      chatHistory.length = 0; 
      chatHistory.push(systemPrompt);
    
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        parsedHistory.forEach((msg) => {
          if (msg.role !== "system") { 
            chatHistory.push(msg);
          }
        });
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript; 
      recognizedText = transcript; 
    };

    recognition.onend = () => {
      console.log("Reconocimiento de voz detenido.");
    };

    recognition.onerror = (event) => {
      console.error("Error en el reconocimiento de voz:", event.error);
    };

    
    //Eventos

    micBtn.addEventListener('click', () => {
      micBtn.style.display = "none";
      stopBtn.style.display = "block";
      recognition.start();
    });
    
    stopBtn.addEventListener('click', () => {
      micBtn.style.display = "block";
      stopBtn.style.display = "none";
      recognition.stop();
      
      setTimeout(() => {
        console.log("Texto reconocido:", recognizedText.trim());
        sendRecognizedMessage();
        recognizedText = "";
      }, 500);
    });

    //funciones principales

    const appendMsg = (role, content) => {
      const div = document.createElement("div");
      div.className = `msg ${role === "Bot" ? "bot" : "user"}`;
      
      const roleSpan = document.createElement("span");
      roleSpan.textContent = `${role}: `;
      roleSpan.style.color = role === "Bot" ? "purple" : "green"; 
      
      const contentSpan = document.createElement("span");
      contentSpan.textContent = content;
  
      div.appendChild(roleSpan);
      div.appendChild(contentSpan);
    
      chatBox.appendChild(div);
      chatBox.scrollTop = chatBox.scrollHeight;
    };

    const obtenerEmocion = (mensaje) =>{
      let parte = mensaje.slice(1,4);
      return parte;
    }

    const setImagen = (emocion) =>{
      let imagen = "img/normal.png";
      switch (emocion) {
        case "ale":
          imagen = "img/otraemocion.png";
          break;
        case "mie":
          imagen = "img/otraemocion.png";
          break;
        case "tri":
          imagen = "img/otraemocion.png";
          break;
        case "ira":
          imagen = "img/otraemocion.png";
          break;
        case "asc>":
          imagen = "img/otraemocion.png";
          break;
        default:
          imagen = "img/normal.png";
      }
      imagenCharacter.src = imagen;
      imagenCharacter.className = "character";
    }

    const sendMessage = async () => {
      setImagen("pensando");
      const userText = input.value.trim();
      if (!userText) return;
      appendMsg("Tú", userText);
      input.value = "";
      chatHistory.push({ role: "user", content: userText });
      saveChatHistory();
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

        let emocion = obtenerEmocion(botMsg);
        console.log(emocion);
    
        chatHistory.push({ role: "assistant", content: botMsg });

        let msgTraducido = await traducir(botMsg, "es", "ja");
        console.log(msgTraducido);
    
        await reproducirVoz(msgTraducido);
        setImagen(emocion);
        chatBox.lastChild.innerHTML = `<span style="color: purple;">Bot:</span> ${botMsg}`;
    
      } catch (e) {
        chatBox.lastChild.textContent = "Bot: (Error al responder)";
        console.error(e);
      }
    };

    const sendRecognizedMessage = async () => {
      setImagen("pensando");
      const userText = recognizedText.trim();
      if (!userText) return; 
    
      appendMsg("Tú", userText);
      chatHistory.push({ role: "user", content: userText });
      saveChatHistory();
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
        
        let emocion = obtenerEmocion(botMsg);
        console.log(emocion);
    
        chatHistory.push({ role: "assistant", content: botMsg });
    
        let msgTraducido = await traducir(botMsg, "es", "ja");
        console.log(msgTraducido);
    
        await reproducirVoz(msgTraducido);
        setImagen(emocion);
        chatBox.lastChild.textContent = `Bot: ${botMsg}`;
      } catch (e) {
        chatBox.lastChild.textContent = "Bot: (Error al responder)";
        console.error(e);
      }
    };

    sendBtn.onclick = sendMessage;

    input.onkeydown = (e) => { if (e.key === "Enter") sendMessage(); };


    //Inicializacion del modelo y la carga del historial

    loadModel();
    loadChatHistory();