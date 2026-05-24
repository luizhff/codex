'use strict';

const KB = [
  {
    patterns: ['preço','preco','valor','quanto','custa','custo','price'],
    answer: '💰 O <strong>iPhone 13 Pro Max 128GB seminovo</strong> está por <strong>R$ 3.000,00 à vista</strong> no PIX ou dinheiro. O aparelho é todo original Apple e desbloqueado.'
  },
  {
    patterns: ['parcel','parcela','12x','sem juros','credito','crédito'],
    answer: '💳 Para cartão, o ideal é usar um <strong>link de pagamento seguro</strong> via Mercado Pago, PagBank/PagSeguro ou PayPal. Assim seus dados não ficam no site e a plataforma processa a compra.'
  },
  {
    patterns: ['pix','desconto','boleto','débito','debito','pagamento'],
    answer: '💸 Formas de pagamento:<br>• <strong>Mercado Pago</strong> — link seguro<br>• <strong>PagBank/PagSeguro</strong> — link seguro<br>• <strong>PayPal</strong> — checkout hospedado<br>• <strong>PIX direto</strong> — R$ 3.000,00 à vista'
  },
  {
    patterns: ['entrega','prazo','frete','chegou','envio','shipping','dias','chega'],
    answer: '📦 <strong>Frete grátis</strong> para todo o Brasil! Prazos estimados:<br>• Capitais: 1–2 dias úteis<br>• Interior: 3–5 dias úteis<br>• Regiões remotas: até 7 dias úteis'
  },
  {
    patterns: ['camera','câmera','foto','fotos','megapixel','mp','fotografia','vídeo','video'],
    answer: '📷 Sistema de câmera Pro com 3 lentes:<br>• <strong>Principal 12MP</strong> f/1.5 com estabilização sensor-shift<br>• <strong>Ultra-angular 12MP</strong> f/1.8<br>• <strong>Teleobjetiva 12MP</strong> 3× zoom óptico<br>• Vídeo <strong>ProRes 4K</strong> e modo Cinema'
  },
  {
    patterns: ['bateria','battery','carga','carregar','autonomia','duração','duracao','horas'],
    answer: '🔋 Bateria de alta capacidade com:<br>• <strong>Até 28h</strong> de reprodução de vídeo<br>• <strong>Até 95h</strong> de reprodução de áudio<br>• Carregamento <strong>MagSafe 15W</strong><br>• Carregamento sem fio Qi'
  },
  {
    patterns: ['tela','display','screen','polegada','polegadas','inch','resolucao','resolução','hz','120'],
    answer: '📱 Tela <strong>Super Retina XDR OLED 6,7"</strong>:<br>• Resolução 2778 × 1284 px (458 ppi)<br>• <strong>ProMotion 120Hz</strong> adaptativo<br>• Brilho de até 1.200 nits<br>• True Tone e P3 wide color'
  },
  {
    patterns: ['chip','processador','cpu','a15','bionic','velocidade','rapido','rápido','desempenho','performance'],
    answer: '⚡ Chip <strong>Apple A15 Bionic</strong> (5nm):<br>• CPU 6-core (2 performance + 4 efficiency)<br>• GPU 5-core<br>• Neural Engine 16-core<br>É o chip mais rápido já colocado num iPhone!'
  },
  {
    patterns: ['armazenamento','storage','gb','capacidade','256','512','1tb','1 tb'],
    answer: '💾 A unidade disponível é o <strong>iPhone 13 Pro Max 128GB seminovo</strong>, por <strong>R$ 3.000,00 à vista</strong>.'
  },
  {
    patterns: ['original','genuino','genuíno','fake','falso','lacrado','garantia','apple','seminovo','usado'],
    answer: '🛡️ O aparelho é <strong>seminovo e 100% original Apple</strong>. Não é vendido como lacrado de fábrica; ele é testado, desbloqueado e anunciado como seminovo.'
  },
  {
    patterns: ['devol','troca','return','retorno','arrependimento','cod','código de defesa'],
    answer: '↩️ Por ser um aparelho seminovo, recomendamos conferir todos os detalhes antes da compra. Caso a venda seja feita online, seguimos o prazo de arrependimento previsto no CDC quando aplicável.'
  },
  {
    patterns: ['desbloque','desbloqueado','operadora','chip','sim','claro','vivo','tim','net'],
    answer: '📡 Sim! Todos os iPhones são <strong>desbloqueados de fábrica</strong> e funcionam com qualquer operadora nacional (Claro, Vivo, TIM, Oi) e internacional.'
  },
  {
    patterns: ['agua','água','impermeavel','impermeável','ip68','resistente','resistência'],
    answer: '💧 O iPhone 13 Pro Max tem certificação <strong>IP68</strong>:<br>• Resistente a água e poeira<br>• Até <strong>6 metros de profundidade</strong> por 30 minutos<br>• Não é recomendado para mergulho ou água salgada'
  },
  {
    patterns: ['cor','cores','azul','preto','branco','dourado','verde','gold','silver','graphite'],
    answer: '🎨 Cores disponíveis:<br>• Sierra Blue (Azul)<br>• Graphite (Grafite/Preto)<br>• Gold (Dourado)<br>• Silver (Prata)<br>• Alpine Green (Verde Alpino)'
  },
  {
    patterns: ['5g','4g','conectividade','wifi','bluetooth','nfc','usb'],
    answer: '📶 Conectividade completa:<br>• <strong>5G</strong> Sub-6GHz e mmWave<br>• Wi-Fi 6 (802.11ax)<br>• Bluetooth 5.0<br>• NFC com Apple Pay<br>• Conector Lightning'
  },
  {
    patterns: ['ola','olá','oi','hello','hi','hey','bom dia','boa tarde','boa noite','tudo bem'],
    answer: '👋 Olá! Tudo bem sim, obrigado! Estou aqui para tirar todas as suas dúvidas sobre o <strong>iPhone 13 Pro Max</strong>. O que você gostaria de saber?'
  },
  {
    patterns: ['obrigado','obrigada','valeu','thanks','grato'],
    answer: '😊 Disponha! Se tiver mais dúvidas, é só perguntar. Boa compra! 🛍️'
  },
  {
    patterns: ['comprar','compra','adquirir','quero','pedido'],
    answer: '🛒 Ótima escolha! Clique no botão <strong>"Comprar agora"</strong> ou escolha a capacidade na seção de preços e clique em <strong>"Adicionar ao carrinho"</strong>. O processo é rápido e seguro!'
  }
];

function findAnswer(input) {
  const text = input.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  for (const entry of KB) {
    if (entry.patterns.some(p => text.includes(p.normalize('NFD').replace(/[̀-ͯ]/g, '')))) {
      return entry.answer;
    }
  }
  return '🤔 Não encontrei uma resposta exata para isso. Tente perguntar sobre: <strong>preço, câmera, bateria, tela, entrega, pagamento, garantia</strong> ou entre em contato conosco pelo e-mail <strong>contato@istore.com.br</strong>.';
}

// ── UI ──
const bubble = document.getElementById('chatbotBubble');
const win = document.getElementById('chatbotWindow');
const closeBtn = document.getElementById('chatbotClose');
const input = document.getElementById('chatbotInput');
const sendBtn = document.getElementById('chatbotSend');
const messages = document.getElementById('chatbotMessages');

bubble.addEventListener('click', () => {
  win.classList.toggle('chatbot-window--open');
  if (win.classList.contains('chatbot-window--open')) input.focus();
});
closeBtn.addEventListener('click', () => win.classList.remove('chatbot-window--open'));

function appendMsg(html, role) {
  const div = document.createElement('div');
  div.className = `chatbot-msg chatbot-msg--${role}`;
  div.innerHTML = html;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'chatbot-typing';
  div.id = 'typingIndicator';
  div.innerHTML = '<span></span><span></span><span></span>';
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

function handleSend() {
  const text = input.value.trim();
  if (!text) return;
  appendMsg(text, 'user');
  input.value = '';
  showTyping();
  setTimeout(() => {
    removeTyping();
    appendMsg(findAnswer(text), 'bot');
  }, 700 + Math.random() * 400);
}

sendBtn.addEventListener('click', handleSend);
input.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });

document.querySelectorAll('.suggestion-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    input.value = btn.textContent.replace(/^[^\s]+\s/, '');
    handleSend();
    btn.closest('.chatbot-suggestions')?.remove();
  });
});
