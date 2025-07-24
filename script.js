// Troca de abas
function showTab(tab) {
  document.querySelectorAll('.tab-section').forEach(sec => sec.style.display = "none");
  document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove("active"));
  const sec = document.getElementById('tab-' + tab);
  if (sec) sec.style.display = "block";
  if(tab==="namorada") document.querySelectorAll('.sidebar li')[0].classList.add("active");
  if(tab==="historias") document.querySelectorAll('.sidebar li')[1].classList.add("active");
  if(tab==="salvas") document.querySelectorAll('.sidebar li')[2].classList.add("active");
  if(tab==="favoritos") document.querySelectorAll('.sidebar li')[3].classList.add("active");
}
showTab('namorada');

// CHAVE IA
const chaveOpenRouter = "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";

// ----- NAMORADA IA -----
let mensagensIA = [
  {role:"system",content:"Você é Cris, uma dominadora, fetiche peido, sempre responde de forma provocante, feminina, safada e sussurrante. Sempre responda em português do Brasil. Deixe as respostas sensuais, provocantes e envolventes. Use linguagem adulta e fetichista."}
];
let intensidadeCris = "média";

function enviarMsg() {
  const input = document.getElementById('msgInput');
  let texto = input.value.trim();
  if(!texto) return;
  addMsg('you', texto);
  input.value = "";

  if(texto.startsWith("/")){
    if(texto==="/peido") return tocarPeido();
    if(texto==="/castigo") return respostaIA("Agora você vai ficar de castigo... ajoelhe-se e peça um peido!");
    if(texto==="/elogio") return respostaIA("Bom garoto... mereceu um agrado da Cris. Quer meu peido agora?");
    if(texto==="/surpresa") return respostaIA("Surpresa... hoje você não vai saber quando vou soltar o peido!");
    if(texto==="/modo-intenso"){intensidadeCris="intensa"; resetPromptCris(); respostaIA("Modo intensa ativado."); return;}
    if(texto==="/modo-leve"){intensidadeCris="leve"; resetPromptCris(); respostaIA("Modo leve ativado."); return;}
    return respostaIA("Comando desconhecido...");
  }
  respostaIA(texto);
}

function addMsg(de, texto) {
  let chat = document.getElementById('chatWindow');
  let div = document.createElement('div');
  div.className = "msg " + (de==="you"?"you":"ia");
  div.innerText = texto;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function respostaIA(texto){
  mensagensIA.push({role:"user",content:texto});
  let chat = document.getElementById('chatWindow');
  let typingDiv = document.createElement('div');
  typingDiv.className = "msg ia";
  typingDiv.innerHTML = `
    <span style="font-size:.96em;opacity:.7;">Cris</span>
    <span class="typing-indicator">
      <span></span><span></span><span></span>
    </span>
  `;
  chat.appendChild(typingDiv);
  chat.scrollTop = chat.scrollHeight;

  const req = await fetch("https://openrouter.ai/api/v1/chat/completions",{
    method:"POST",
    headers:{
      "Authorization":"Bearer "+chaveOpenRouter,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      model:"openai/gpt-3.5-turbo",
      messages:mensagensIA.slice(-10),
      temperature:intensidadeCris==="intensa"?1.25:intensidadeCris==="leve"?0.7:1.05
    })
  }).then(r=>r.json()).catch(()=>null);

  let resposta = (req && req.choices && req.choices[0].message.content) || "Cris ficou sem palavras... (erro IA)";
  let temp = document.querySelectorAll('.msg.ia');
  let loadingMsg = temp[temp.length-1];
  loadingMsg.innerText = resposta;
  mensagensIA.push({role:"assistant",content:resposta});
  falarCris(resposta);
  if(resposta.toLowerCase().includes("peido")) tocarPeido();
}
function falarCris(texto){
  if(!window.speechSynthesis) return;
  let vozes = window.speechSynthesis.getVoices();
  let voz = vozes.find(v =>
    (v.name && v.name.toLowerCase().includes('female')) ||
    (v.name && v.name.toLowerCase().includes('mulher')) ||
    (v.name && v.name.toLowerCase().includes('maria')) ||
    v.gender === 'female'
  );
  if (!voz) voz = vozes.find(v => v.lang.startsWith('pt'));
  if (!voz) voz = vozes[0];
  const u = new SpeechSynthesisUtterance(texto);
  u.voice = voz;
  u.lang = voz.lang || "pt-BR";
  u.rate = 0.97;
  u.pitch = 1.57;
  u.volume = 1;
  speechSynthesis.speak(u);
}
const fartList = [
  "assets/fart1.mp3","assets/fart2.mp3","assets/fart3.mp3","assets/fart4.mp3","assets/fart5.mp3"
];
function tocarPeido(){
  const player = document.getElementById('fartPlayer');
  player.src = fartList[Math.floor(Math.random()*fartList.length)];
  player.play().catch(()=>{});
}
function resetPromptCris(){
  mensagensIA = [
    {role:"system",content:"Você é Cris, uma dominadora, fetiche peido, sempre responde de forma provocante, feminina, safada e sussurrante. Sempre responda em português do Brasil. Deixe as respostas sensuais, provocantes e envolventes. Use linguagem adulta e fetichista."}
  ];
}
function salvarConversa(){
  let conversas = JSON.parse(localStorage.getItem('loverz_conversas')||"[]");
  let data = new Date().toLocaleString();
  let nome = prompt("Nome para salvar essa conversa:", "Conversa " + data);
  if(!nome) return;
  conversas.push({nome, mensagens:mensagensIA});
  localStorage.setItem('loverz_conversas',JSON.stringify(conversas));
  alert("Conversa salva!");
}
function favoritarConversa(){
  let favoritos = JSON.parse(localStorage.getItem('loverz_fav_conversas')||"[]");
  let data = new Date().toLocaleString();
  let nome = prompt("Nome para favoritar essa conversa:", "Favorito " + data);
  if(!nome) return;
  favoritos.push({nome, mensagens:mensagensIA});
  localStorage.setItem('loverz_fav_conversas',JSON.stringify(favoritos));
  alert("Favorito!");
}
function exportarConversa(){
  let txt = mensagensIA.map(m=> (m.role==="user"?"Você: ":"Cris: ") + m.content ).join("\n\n");
  let a=document.createElement('a');
  a.href='data:text/plain;charset=utf-8,'+encodeURIComponent(txt);
  a.download='conversa-loverz.txt';
  a.click();
}
function copiarConversa(){
  let txt = mensagensIA.map(m=> (m.role==="user"?"Você: ":"Cris: ") + m.content ).join("\n\n");
  navigator.clipboard.writeText(txt);
}
document.addEventListener("DOMContentLoaded", function() {
  let inp = document.getElementById('msgInput');
  if(inp){
    inp.addEventListener("keydown", function(e){
      if(e.key==="Enter") enviarMsg();
    });
  }
});

// ----- HISTÓRIAS +18, FAVORITOS, AGRUPADAS -----

let ultHistoriaPrompt = "";
let ultHistoriaCompleta = "";
let ultHistoriaTitulo = "";

function gerarHistoriaForm(e){
  e.preventDefault();
  const fetiche = document.getElementById('storyFetiche').value.trim();
  const personagens = document.getElementById('storyChars').value.trim();
  const cenario = document.getElementById('storyScene').value.trim();
  const briefing = document.getElementById('storyBrief').value.trim();
  const tamanho = document.getElementById('storyLength').value;
  const estilo = document.getElementById('storyStyle').value;

  const prompt = `Crie uma história +18 detalhada, excitante e com um TÍTULO envolvente, focando no tema: ${fetiche}.
  Personagens: ${personagens || "Cris, Você"};
  Cenário: ${cenario || "surpresa"};
  Enredo: ${briefing || "liberdade total para criatividade"};
  Tamanho: ${tamanho} (${tamanho==="curto"?"resuma a história em poucos parágrafos":tamanho==="longo"?"explore a história com muitos detalhes, várias cenas e reviravoltas":"com profundidade moderada"});
  Modo de escrita: ${estilo}.
  Gere o título no início da resposta, destacado entre aspas ou com negrito.
  Estilo: Dominadora, fetichista, provocante, explícita e envolvente.`;

  ultHistoriaPrompt = prompt;
  gerarHistoria(prompt, false);
}

async function gerarHistoria(prompt, continuar){
  document.getElementById('storyResult').innerHTML = "Gerando história...";
  let msgs = [{role:"system",content:"Crie histórias +18 intensas, fetichistas e excitantes em PT-BR, focando no tema, cenário e personagens fornecidos. Gere o título no início da resposta. Sem censura."}];
  if(continuar && ultHistoriaCompleta){
    msgs.push({role:"assistant",content:ultHistoriaCompleta});
    msgs.push({role:"user",content:"Continue a história, próximo capítulo. Gere um novo título para o capítulo."});
  } else {
    msgs.push({role:"user",content:prompt});
  }
  const req = await fetch("https://openrouter.ai/api/v1/chat/completions",{
    method:"POST",
    headers:{
      "Authorization":"Bearer "+chaveOpenRouter,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      model:"openai/gpt-3.5-turbo",
      messages:msgs,
      temperature:1.18
    })
  }).then(r=>r.json()).catch(()=>null);

  if(!req){document.getElementById('storyResult').innerHTML = "[erro na API]";return;}
  const historia = req.choices[0].message.content;
  const {titulo, texto} = extrairTitulo(historia);

  document.getElementById('storyResult').innerHTML = `
    <div class="story-title">${titulo}</div>
    <div>${texto.replace(/\n/g, "<br>")}</div>
    <button onclick="salvarCapitulo()">Salvar Capítulo</button>
    <button onclick="favoritarHistoria()">Favoritar</button>
    <button onclick="exportarHistoria()">Exportar (.txt)</button>
    <button onclick="copiarHistoria()">Copiar</button>
    <button onclick="lerHistoria('${btoa(unescape(encodeURIComponent(historia)))}')">Ouvir História</button>
    <button onclick="gerarHistoria('',true)">Próximo Capítulo</button>
  `;
  document.getElementById('chapterBtn').innerHTML = "";
  ultHistoriaCompleta = historia;
  ultHistoriaTitulo = titulo;
}

function extrairTitulo(texto) {
  let titulo = "História sem título";
  let corpo = texto;
  let m = texto.match(/^[\s>"]*([\*_"']{0,2})([^\n\*"_']{4,120})[\*_"']{0,2}[\n\-–—]+/i);
  if(m){
    titulo = m[2].trim();
    corpo = texto.replace(m[0],"").trim();
  } else {
    let primLinha = texto.split('\n')[0];
    if(primLinha.length < 100) {
      titulo = primLinha.trim();
      corpo = texto.split('\n').slice(1).join('\n').trim();
    }
  }
  return {titulo, texto: corpo};
}

function salvarCapitulo() {
  let historias = JSON.parse(localStorage.getItem('loverz_hist')||"[]");
  let idx = historias.findIndex(h => h.titulo === ultHistoriaTitulo);
  if(idx === -1) {
    historias.push({titulo: ultHistoriaTitulo, capitulos: [ultHistoriaCompleta]});
  } else {
    historias[idx].capitulos.push(ultHistoriaCompleta);
  }
  localStorage.setItem('loverz_hist',JSON.stringify(historias));
  alert("Capítulo salvo!");
  listarHistoriasAgrupadas();
}
function favoritarHistoria(){
  let fav = JSON.parse(localStorage.getItem('loverz_fav')||"[]");
  fav.push({titulo: ultHistoriaTitulo, texto: ultHistoriaCompleta});
  localStorage.setItem('loverz_fav',JSON.stringify(fav));
  alert("Favorito!");
  listarFavoritos();
}

function listarHistoriasAgrupadas() {
  let filtro = (document.getElementById('historiaFiltro')||{value:""}).value.toLowerCase();
  let historias = JSON.parse(localStorage.getItem('loverz_hist')||"[]");
  if(filtro) historias = historias.filter(h=>h.titulo.toLowerCase().includes(filtro));
  let html = historias.map((h,idx) => `
    <div class="story-title">
      ${h.titulo}
      <button class="excluir-historia" onclick="excluirHistoria('${idx}')">Excluir História</button>
    </div>
    <div class="story-chapters">
      ${h.capitulos.map((c,ci) => {
        const {titulo, texto} = extrairTitulo(c);
        return `
          <div class="chapter-card">
            <div style="margin-bottom:5px;"><b>Capítulo ${ci+1}:</b> ${titulo!==h.titulo?titulo:""}</div>
            <div style="white-space:pre-wrap;">${texto}</div>
            <div class="chapter-actions">
              <button onclick="exportarCapitulo('${idx}','${ci}')">Exportar</button>
              <button onclick="copiarCapitulo('${idx}','${ci}')">Copiar</button>
              <button onclick="lerHistoria('${btoa(unescape(encodeURIComponent(c)))}')">Ouvir</button>
              <button onclick="excluirCapitulo('${idx}','${ci}')">Excluir Capítulo</button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `).join("");
  document.getElementById('storiesGrouped').innerHTML = html || "<div>Nenhuma história salva ainda.</div>";
}
function excluirHistoria(idx){
  let historias = JSON.parse(localStorage.getItem('loverz_hist')||"[]");
  historias.splice(Number(idx),1);
  localStorage.setItem('loverz_hist',JSON.stringify(historias));
  listarHistoriasAgrupadas();
}
function excluirCapitulo(hidx,cidx){
  let historias = JSON.parse(localStorage.getItem('loverz_hist')||"[]");
  historias[Number(hidx)].capitulos.splice(Number(cidx),1);
  if(historias[Number(hidx)].capitulos.length==0) historias.splice(Number(hidx),1);
  localStorage.setItem('loverz_hist',JSON.stringify(historias));
  listarHistoriasAgrupadas();
}
function exportarCapitulo(hidx,cidx){
  let historias = JSON.parse(localStorage.getItem('loverz_hist')||"[]");
  let cap = historias[Number(hidx)].capitulos[Number(cidx)];
  baixarTXT(cap, `capitulo_${Number(hidx)+1}_${Number(cidx)+1}.txt`);
}
function copiarCapitulo(hidx,cidx){
  let historias = JSON.parse(localStorage.getItem('loverz_hist')||"[]");
  let cap = historias[Number(hidx)].capitulos[Number(cidx)];
  navigator.clipboard.writeText(cap);
}
function baixarTXT(txt, nome){
  let a=document.createElement('a');
  a.href='data:text/plain;charset=utf-8,'+encodeURIComponent(txt);
  a.download=nome;
  a.click();
}
function listarFavoritos(){
  let fav = JSON.parse(localStorage.getItem('loverz_fav')||"[]");
  let html = fav.map((h,i) => {
    const {titulo, texto} = extrairTitulo(h.texto);
    return `<li>
      <div class="story-title">${h.titulo || titulo}</div>
      <div style="white-space:pre-wrap;">${texto}</div>
      <button onclick="excluirFavorito(${i})">Excluir</button>
      <button onclick="exportarFavoritoIndice(${i})">Exportar</button>
      <button onclick="copiarFavoritoIndice(${i})">Copiar</button>
      <button onclick="lerHistoria('${btoa(unescape(encodeURIComponent(h.texto)))}')">Ouvir</button>
    </li>`;
  }).join("");
  document.getElementById('favoritesList').innerHTML = html || "<li>Nenhum favorito ainda.</li>";
}
function excluirFavorito(i){
  let fav = JSON.parse(localStorage.getItem('loverz_fav')||"[]");
  fav.splice(i,1); localStorage.setItem('loverz_fav',JSON.stringify(fav));
  listarFavoritos();
}
function exportarFavoritoIndice(i){
  let fav = JSON.parse(localStorage.getItem('loverz_fav')||"[]");
  let titulo = fav[i].titulo || "favorito";
  baixarTXT(fav[i].texto, titulo.replace(/[^\w]/g,"_")+".txt");
}
function copiarFavoritoIndice(i){
  let fav = JSON.parse(localStorage.getItem('loverz_fav')||"[]");
  navigator.clipboard.writeText(fav[i].texto);
}
function lerHistoria(str) {
  if (!window.speechSynthesis) return;
  let texto = decodeURIComponent(escape(atob(str)));
  let vozes = window.speechSynthesis.getVoices();
  let voz = vozes.find(v =>
    (v.name && v.name.toLowerCase().includes('female')) ||
    (v.name && v.name.toLowerCase().includes('mulher')) ||
    (v.name && v.name.toLowerCase().includes('maria')) ||
    v.gender === 'female'
  );
  if (!voz) voz = vozes.find(v => v.lang.startsWith('pt'));
  if (!voz) voz = vozes[0];
  const u = new SpeechSynthesisUtterance(texto);
  u.voice = voz;
  u.lang = voz.lang || "pt-BR";
  u.rate = 0.97;
  u.pitch = 1.37;
  u.volume = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}
listarHistoriasAgrupadas();
listarFavoritos();
