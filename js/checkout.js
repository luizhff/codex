'use strict';

// ── State ──
const state = {
  step: 1,
  product: { storage: '128GB', price: 3000, color: 'Sierra Blue' },
  shipping: 0,
  payment: 'mercadopago',
};

// Troque estes links pelos links reais gerados nas suas contas.
// Exemplo Mercado Pago/PagBank/PayPal: https://...
const SECURE_PAYMENT_LINKS = {
  mercadopago: '',
  pagbank: '',
  paypal: '',
  pix: '',
};

const PAYMENT_LABELS = {
  mercadopago: 'Mercado Pago',
  pagbank: 'PagBank / PagSeguro',
  paypal: 'PayPal',
  pix: 'PIX direto',
};

// ── DOM refs ──
const overlay   = document.getElementById('checkoutOverlay');
const modal     = document.getElementById('checkoutModal');
const panes     = [null, ...document.querySelectorAll('.checkout-pane')]; // 1-indexed
const stepEls   = document.querySelectorAll('.checkout-step');
const stepLines = document.querySelectorAll('.checkout-step__line');

// ── Open / close ──
function resetCheckoutForm() {
  // Reset state
  state.payment  = 'mercadopago';
  state.shipping = 0;

  // Reset all inputs
  ['fieldName','fieldEmail','fieldPhone','fieldCpf',
   'fieldCep','fieldStreet','fieldNumber','fieldComplement',
   'fieldNeighborhood','fieldCity','fieldState']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

  // Reset frete badge
  const badge = document.getElementById('freteBadge');
  badge.textContent = '— insira o CEP';
  badge.className   = 'frete-badge';

  // Reset payment radio to Mercado Pago
  const defaultRadio = document.querySelector('input[name="payment"][value="mercadopago"]');
  if (defaultRadio) defaultRadio.checked = true;
  document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('payment-option--active'));
  const optMercadoPago = document.getElementById('optMercadoPago');
  if (optMercadoPago) optMercadoPago.classList.add('payment-option--active');

  setPaymentAlert('Selecione uma plataforma. Ao confirmar, o cliente será enviado para o link de pagamento configurado.');

  // Clear all errors
  clearAllErrors();
}

function openCheckout(storage, price) {
  state.product.storage = storage || '128GB';
  state.product.price   = Number(price) || 3000;
  state.product.color   = window.selectedColor || state.product.color || 'Sierra Blue';
  state.step = 1;
  document.querySelector('.checkout-steps').style.display = '';
  resetCheckoutForm();
  updateTotal();
  renderStep(1);
  updateSummary();
  overlay.classList.add('checkout-overlay--open');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  overlay.classList.remove('checkout-overlay--open');
  document.body.style.overflow = '';
}

window.openCheckout = openCheckout;
window.__checkoutState = state;

document.getElementById('checkoutClose').addEventListener('click', closeCheckout);
document.getElementById('confirmClose').addEventListener('click', closeCheckout);
overlay.addEventListener('click', e => { if (e.target === overlay) closeCheckout(); });

// ── Summary ──
function updateSummary() {
  document.getElementById('summaryStorage').textContent =
    `${state.product.storage} · ${state.product.color} · Seminovo`;
  document.getElementById('summaryPrice').textContent =
    formatBRL(state.product.price);
}

// ── Step navigation ──
function renderStep(n) {
  panes.forEach((p, i) => {
    if (!p) return;
    p.classList.toggle('checkout-pane--hidden', i !== n);
  });
  stepEls.forEach((el, i) => {
    const s = i + 1;
    el.classList.toggle('checkout-step--active', s === n);
    el.classList.toggle('checkout-step--done', s < n);
  });
  stepLines.forEach((line, i) => {
    line.classList.toggle('checkout-step__line--done', i + 1 < n);
  });
  modal.scrollTop = 0;
  state.step = n;
}

// ── Formatting helpers ──
function formatBRL(val) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function maskPhone(v) {
  return v.replace(/\D/g,'')
    .replace(/^(\d{2})(\d)/,'($1) $2')
    .replace(/(\d{5})(\d{1,4})$/,'$1-$2')
    .slice(0,15);
}

function maskCpf(v) {
  return v.replace(/\D/g,'')
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d{1,2})$/,'$1-$2')
    .slice(0,14);
}

function maskCep(v) {
  return v.replace(/\D/g,'').replace(/(\d{5})(\d{1,3})$/,'$1-$2').slice(0,9);
}

// ── Input masks ──
function bindInputMask(id, handler) {
  const field = document.getElementById(id);
  if (field) field.addEventListener('input', handler);
}

bindInputMask('fieldPhone', e => {
  e.target.value = maskPhone(e.target.value);
});
bindInputMask('fieldCpf', e => {
  e.target.value = maskCpf(e.target.value);
});
bindInputMask('fieldCep', e => {
  e.target.value = maskCep(e.target.value);
  if (e.target.value.replace(/\D/g,'').length === 8) fetchCep(e.target.value);
});
// ── ViaCEP ──
async function fetchCep(cep) {
  const raw = cep.replace(/\D/g,'');
  const loader = document.getElementById('cepLoader');
  const badge  = document.getElementById('freteBadge');
  loader.classList.add('cep-loader--spinning');
  clearError('errCep');

  try {
    const res  = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
    const data = await res.json();
    if (data.erro) throw new Error('CEP não encontrado');

    document.getElementById('fieldStreet').value       = data.logradouro || '';
    document.getElementById('fieldNeighborhood').value = data.bairro     || '';
    document.getElementById('fieldCity').value         = data.localidade || '';
    document.getElementById('fieldState').value        = data.uf         || '';

    const shipping = calcShipping(data.uf);
    state.shipping = shipping;
    if (shipping === 0) {
      badge.textContent = '🎁 Grátis';
      badge.className   = 'frete-badge frete-badge--free';
    } else {
      badge.textContent = `R$ ${shipping.toFixed(2).replace('.',',')}`;
      badge.className   = 'frete-badge frete-badge--paid';
    }
    updateTotal();
  } catch {
    setError('errCep', 'CEP não encontrado. Verifique e tente novamente.');
    badge.textContent = '— insira o CEP';
    badge.className   = 'frete-badge';
  } finally {
    loader.classList.remove('cep-loader--spinning');
  }
}

function calcShipping(uf) {
  const free = ['SP','RJ','MG','ES','PR','SC','RS'];
  const mid  = ['BA','SE','AL','PE','PB','RN','CE','PI','MA','GO','DF','MS','MT'];
  if (free.includes(uf)) return 0;
  if (mid.includes(uf))  return 29.90;
  return 49.90;
}

// ── Payment options ──
document.querySelectorAll('input[name="payment"]').forEach(radio => {
  radio.addEventListener('change', () => {
    state.payment = radio.value;
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('payment-option--active'));
    radio.closest('.payment-option').classList.add('payment-option--active');
    updatePaymentAlert();
    updateTotal();
  });
});

function setPaymentAlert(msg, type = 'info') {
  const alert = document.getElementById('paymentLinkAlert');
  if (!alert) return;
  alert.textContent = msg;
  alert.className = `payment-link-alert payment-link-alert--${type}`;
}

function updatePaymentAlert() {
  if (state.payment === 'pix') {
    setPaymentAlert('PIX direto exige confirmação manual do recebimento antes da entrega.');
    return;
  }

  const label = PAYMENT_LABELS[state.payment];
  const link = SECURE_PAYMENT_LINKS[state.payment];
  if (link) {
    setPaymentAlert(`Ao confirmar, o cliente será redirecionado para o pagamento seguro via ${label}.`, 'success');
  } else {
    setPaymentAlert(`Configure o link real de ${label} em js/checkout.js antes de vender por esta opção.`, 'warning');
  }
}

// ── Total calculation ──
function updateTotal() {
  const price    = state.product.price;
  const shipping = state.shipping;
  const discount = 0;
  const total    = price + shipping - discount;

  document.getElementById('totalProduct').textContent  = formatBRL(price);
  document.getElementById('totalShipping').textContent = shipping === 0 ? 'Grátis' : formatBRL(shipping);
  document.getElementById('totalDiscount').textContent = `− ${formatBRL(discount)}`;
  document.getElementById('totalFinal').textContent    = formatBRL(total);

  const discountRow = document.getElementById('totalDiscountRow');
  discountRow.style.display = 'none';

  const pixSub = document.getElementById('pixSubtitle');
  if (pixSub) pixSub.textContent = `${formatBRL(price)} à vista, com confirmação manual`;
}

// ── Validation helpers ──
function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
  const inp = document.getElementById(id.replace(/^err/, 'field'));
  if (inp) inp.classList.add('input--error');
}

function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = '';
  const fieldId = id.replace(/^err/, 'field');
  const inp = document.getElementById(fieldId);
  if (inp) inp.classList.remove('input--error');
}

function clearAllErrors() {
  document.querySelectorAll('.form-error').forEach(e => e.textContent = '');
  document.querySelectorAll('.input--error').forEach(e => e.classList.remove('input--error'));
}

function validateStep1() {
  clearAllErrors();
  let ok = true;
  const name  = document.getElementById('fieldName').value.trim();
  const email = document.getElementById('fieldEmail').value.trim();
  const phone = document.getElementById('fieldPhone').value.trim();
  const cpf   = document.getElementById('fieldCpf').value.trim();

  if (name.split(' ').filter(Boolean).length < 2) {
    setError('errName', 'Informe nome e sobrenome.'); ok = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError('errEmail', 'E-mail inválido.'); ok = false;
  }
  if (phone.replace(/\D/g,'').length < 10) {
    setError('errPhone', 'Telefone inválido.'); ok = false;
  }
  if (cpf.replace(/\D/g,'').length < 11) {
    setError('errCpf', 'CPF inválido.'); ok = false;
  }
  return ok;
}

function validateStep2() {
  clearAllErrors();
  let ok = true;
  const required = [
    ['fieldCep',          'errCep',          'CEP obrigatório.'],
    ['fieldStreet',       'errStreet',       'Logradouro obrigatório.'],
    ['fieldNumber',       'errNumber',       'Número obrigatório.'],
    ['fieldNeighborhood', 'errNeighborhood', 'Bairro obrigatório.'],
    ['fieldCity',         'errCity',         'Cidade obrigatória.'],
    ['fieldState',        'errState',        'Estado obrigatório.'],
  ];
  required.forEach(([fieldId, errId, msg]) => {
    if (!document.getElementById(fieldId).value.trim()) {
      setError(errId, msg); ok = false;
    }
  });
  return ok;
}

function validateStep3() {
  clearAllErrors();
  if (state.payment === 'pix') return true;

  if (!SECURE_PAYMENT_LINKS[state.payment]) {
    setPaymentAlert(`Antes de usar ${PAYMENT_LABELS[state.payment]}, cole o link de pagamento real em js/checkout.js.`, 'error');
    return false;
  }
  return true;
}

// ── Step buttons ──
document.getElementById('step1Next').addEventListener('click', () => {
  if (validateStep1()) renderStep(2);
});
document.getElementById('step2Back').addEventListener('click', () => renderStep(1));
document.getElementById('step2Next').addEventListener('click', () => {
  if (validateStep2()) { updateTotal(); renderStep(3); }
});
document.getElementById('step3Back').addEventListener('click', () => renderStep(2));

document.getElementById('step3Pay').addEventListener('click', () => {
  if (!validateStep3()) return;
  const btn    = document.getElementById('step3Pay');
  const text   = document.getElementById('payBtnText');
  const loader = document.getElementById('payLoader');
  const paymentLink = SECURE_PAYMENT_LINKS[state.payment];

  btn.disabled = true;
  text.textContent = state.payment === 'pix' ? 'Registrando...' : 'Abrindo pagamento seguro...';
  loader.classList.add('pay-loader--spinning');

  if (paymentLink) {
    window.open(paymentLink, '_blank', 'noopener,noreferrer');
  }

  setTimeout(() => {
    btn.disabled = false;
    text.textContent = 'Ir para pagamento seguro 🔒';
    loader.classList.remove('pay-loader--spinning');
    showConfirmation();
  }, 900);
});

// ── Confirmation ──
function showConfirmation() {
  const protocol = `#IST-${Date.now().toString().slice(-6)}`;
  document.getElementById('protocolNumber').textContent = protocol;

  const name     = document.getElementById('fieldName').value.trim();
  const email    = document.getElementById('fieldEmail').value.trim();
  const city     = document.getElementById('fieldCity').value.trim();
  const uf       = document.getElementById('fieldState').value.trim();
  const method   = PAYMENT_LABELS[state.payment];
  const days     = state.shipping === 0 ? '1–3 dias úteis' : '3–7 dias úteis';

  document.getElementById('confirmDetails').innerHTML =
    `<strong>Cliente:</strong> ${name}<br>` +
    `<strong>E-mail:</strong> ${email}<br>` +
    `<strong>Produto:</strong> iPhone 13 Pro Max seminovo ${state.product.storage}<br>` +
    `<strong>Pagamento:</strong> ${method}<br>` +
    `<strong>Entrega em:</strong> ${city}/${uf} — previsão ${days}`;

  renderStep(4);
  document.querySelector('.checkout-steps').style.display = 'none';
}

// ── Expose openCheckout and state so main.js can pass the selected color ──
window.openCheckout = openCheckout;
window.__checkoutState = state;
