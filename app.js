/* ─────────────────────────────────────────────────────────────────────────────
   Quick Replies — app.js
   All application logic. Data stored in localStorage.
   ───────────────────────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'quickReplies_v1';

// ─── State ───────────────────────────────────────────────────────────────────

const state = {
  sections: [],   // [{ id, name, usageCount, openCount, pinned, pinnedAt }]
  texts: [],      // [{ id, sectionId, content, usageCount,
                  //    translatedText, isShowingTranslated, translationStale }]
  selectedId: null,
  searchQuery: ''
};

// ─── Persistence ─────────────────────────────────────────────────────────────

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    sections: state.sections,
    texts: state.texts
  }));
}

function migrateSection(s) {
  return {
    ...s,
    openCount: s.openCount  ?? 0,
    pinned:    s.pinned     ?? false,
    pinnedAt:  s.pinnedAt   ?? null,
  };
}

function migrateText(t) {
  const base = {
    ...t,
    type:                t.type                ?? 'single',
    usageCount:          t.usageCount          ?? 0,
    translatedText:      t.translatedText      ?? null,
    isShowingTranslated: t.isShowingTranslated  ?? false,
    translationStale:    t.translationStale     ?? false,
  };
  if (base.type === 'multi') {
    base.title = base.title ?? '';
    base.parts = (base.parts || []).map(p => ({
      id:                p.id      ?? uid(),
      label:             p.label   ?? '',
      content:           p.content ?? '',
      translatedContent: p.translatedContent ?? null,
    }));
  }
  return base;
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const data = JSON.parse(raw);
      state.sections = (data.sections || []).map(migrateSection);
      state.texts    = (data.texts    || []).map(migrateText);
    } catch {
      state.sections = [];
      state.texts    = [];
    }
  } else {
    seedDemo();
    save();
  }
}

// ─── ID Generator ────────────────────────────────────────────────────────────

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

function seedDemo() {
  const mkSection = (name, usageCount) => ({
    id: uid(), name, usageCount, openCount: 0, pinned: false, pinnedAt: null,
  });

  const sVerification = mkSection('Верификация', 14);
  const sReturnMoney  = mkSection('Верни мои деньги', 9);
  const sTrust        = mkSection('Доверие', 7);
  const sWhenWillYou  = mkSection('Когда заберёшь свои деньги', 5);
  const sGiveLoan     = mkSection('Дай мне в долг', 3);
  const sTax          = mkSection('Налог', 2);
  const sNoMoney      = mkSection('Нет денег', 1);

  state.sections = [sVerification, sReturnMoney, sTrust, sWhenWillYou, sGiveLoan, sTax, sNoMoney];

  const mkText = (sectionId, content, usageCount = 0) => ({
    id: uid(), sectionId, content, usageCount,
    translatedText: null, isShowingTranslated: false, translationStale: false,
  });

  state.texts = [
    mkText(sVerification.id, "Thank you for reaching out! To verify your account, please provide your full name, date of birth, and the last 4 digits of your SSN. We'll get this sorted for you right away.", 6),
    mkText(sVerification.id, 'For security purposes, we need to confirm your identity before proceeding. Could you please confirm the email address and phone number associated with your account?', 4),
    mkText(sVerification.id, 'Great news — your identity has been successfully verified! Your account is now fully activated and ready to use. Welcome aboard!', 4),
    mkText(sVerification.id, "We've sent a one-time verification code to your registered email address. Please enter it within 10 minutes to complete the process. Don't see it? Check your spam folder.", 2),

    mkText(sReturnMoney.id, 'I completely understand your frustration, and I sincerely apologize for the inconvenience. Your refund has been initiated — please allow 3–5 business days for the funds to appear on your statement.', 4),
    mkText(sReturnMoney.id, "Your refund request is confirmed and currently under review by our finance team. You'll receive a confirmation email within 24 hours with the exact timeline and transaction reference.", 3),
    mkText(sReturnMoney.id, "A full refund has been processed back to your original payment method. Transaction reference: [TXN-ID]. Please allow up to 5 business days depending on your bank's processing schedule.", 2),

    mkText(sTrust.id, 'Your funds are held in fully segregated client accounts, protected by industry-standard 256-bit encryption and monitored 24/7. Your assets are safe with us.', 3),
    mkText(sTrust.id, 'We are fully licensed and regulated, complying with all applicable financial regulations. Every transaction on your account is logged, audited, and secured.', 2),
    mkText(sTrust.id, 'Your account is protected by two-factor authentication and real-time fraud monitoring. If you ever notice any suspicious activity, please contact us immediately and we will act without delay.', 2),

    mkText(sWhenWillYou.id, 'Based on your current balance and recent trading activity, your funds are available for withdrawal right now. Would you like me to initiate the process on your behalf?', 3),
    mkText(sWhenWillYou.id, 'Your withdrawal is scheduled for processing on [DATE]. Please ensure your bank details are up to date in your account settings to avoid any delays.', 1),
    mkText(sWhenWillYou.id, 'I can see your account balance is ready. To proceed with a withdrawal, please log into your account, navigate to "Withdraw Funds", and follow the on-screen steps. It typically takes 1–3 business days.', 1),

    mkText(sGiveLoan.id, 'Thank you for your interest in our financing options! Based on your account history and activity, you may qualify for a credit line of up to $[AMOUNT]. Shall I begin the pre-qualification process?', 2),
    mkText(sGiveLoan.id, "To begin the loan application, please make sure your account is fully verified and your identity documents are on file. The review typically takes 1–2 business days and you'll be notified by email.", 1),
    mkText(sGiveLoan.id, 'Our credit team will review your application and reach out with a personalized offer. In the meantime, feel free to reach out if you have any questions about our loan terms or repayment options.', 0),

    mkText(sTax.id, 'Your tax documents for the current fiscal year are available in your account portal under Documents & Statements. You can download them at any time in PDF or CSV format.', 1),
    mkText(sTax.id, 'For tax-related questions, we recommend consulting a licensed tax professional. We can generate a full transaction history report for any date range upon request — just let me know.', 1),
    mkText(sTax.id, 'Your annual statement for [YEAR] has been generated and is available for download in your account dashboard. It includes all transactions, fees, and earnings for the full calendar year.', 0),

    mkText(sNoMoney.id, 'I can see your account balance is currently at zero. Would you like to make a deposit to get started? Our team can walk you through the process step by step.', 1),
    mkText(sNoMoney.id, 'It looks like your available balance is insufficient for this transaction. Please add funds to your account to continue — I can help guide you through the deposit process if needed.', 0),
    mkText(sNoMoney.id, 'To activate your trading account and start investing, a minimum initial deposit of $[AMOUNT] is required. Would you like assistance with making your first deposit today?', 0),
  ];
}

// ─── Clipboard ────────────────────────────────────────────────────────────────

async function copyToClipboard(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch { /* fall through */ }
  }
  const el = document.createElement('textarea');
  el.value = text;
  el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
  document.body.appendChild(el);
  el.focus();
  el.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { /* ignore */ }
  document.body.removeChild(el);
  return ok;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const icon = {
  plus: () => `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,

  search: () => `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,

  edit: () => `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,

  trash: () => `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,

  copy: () => `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,

  check: () => `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,

  chat: () => `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,

  empty: () => `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,

  noResults: () => `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,

  pin: () => `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76z"/></svg>`,

  pinFilled: () => `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22" stroke-width="2.2" fill="none"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76z"/></svg>`,

  translate: () => `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,

  duplicate: () => `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1"/></svg>`,

  download: () => `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,

  upload: () => `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
};

// ─── HTML Helpers ─────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Derived Queries ──────────────────────────────────────────────────────────

function sortedSections() {
  const pinned = state.sections
    .filter(s => s.pinned)
    .sort((a, b) => (a.pinnedAt || 0) - (b.pinnedAt || 0));
  const unpinned = state.sections
    .filter(s => !s.pinned)
    .sort((a, b) => b.openCount - a.openCount);
  return [...pinned, ...unpinned];
}

function textsForSection(sectionId) {
  return state.texts.filter(t => t.sectionId === sectionId);
}

// ─── FLIP Animation Helpers ───────────────────────────────────────────────────
//
// FLIP = First, Last, Invert, Play.
// We record element positions BEFORE reorder, move DOM nodes to their new
// positions, then animate each element from where it WAS to where it IS.
// This produces smooth physical motion without any full re-render.

function _flipPlay(elements, firstTops, easing = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', duration = '0.36s') {
  // Record LAST positions (after DOM reorder, no transforms applied yet)
  const lastTops = new Map();
  elements.forEach(el => {
    lastTops.set(el.dataset.id, el.getBoundingClientRect().top);
  });

  // INVERT — teleport each element back to where it was visually
  elements.forEach(el => {
    const dy = (firstTops.get(el.dataset.id) ?? 0) - (lastTops.get(el.dataset.id) ?? 0);
    el.style.transition = 'none';
    el.style.transform  = dy !== 0 ? `translateY(${dy}px)` : '';
  });

  // Force reflow so the browser commits the inverted positions
  // (reading a layout property on any element triggers this)
  elements[0].getBoundingClientRect();

  // PLAY — animate each element from its inverted position to its final position
  elements.forEach(el => {
    const dy = (firstTops.get(el.dataset.id) ?? 0) - (lastTops.get(el.dataset.id) ?? 0);
    if (dy === 0) return; // element didn't move, skip

    el.style.transition = `transform ${duration} ${easing}`;
    el.style.transform  = 'translateY(0)';

    el.addEventListener('transitionend', function handler(e) {
      // Only clean up on the transform transition, not on background / border-color etc.
      if (e.propertyName !== 'transform') return;
      el.style.transition = '';
      el.style.transform  = '';
      el.removeEventListener('transitionend', handler);
    });
  });
}

// ─── FLIP: re-sort reply cards after a copy ───────────────────────────────────

function reorderCardsAnimated() {
  // Only re-sort in section view, never in search mode
  if (state.searchQuery || !state.selectedId) return;

  const container = document.getElementById('textsContainer');
  if (!container) return;

  const allCards = Array.from(container.querySelectorAll('.reply-card'));
  if (allCards.length <= 1) return;

  // Target order: sorted by usageCount descending (stable)
  const items  = textsForSection(state.selectedId).slice().sort((a, b) => b.usageCount - a.usageCount);
  const newIds = items.map(t => t.id);
  const curIds = allCards.map(c => c.dataset.id);

  if (curIds.join(',') === newIds.join(',')) return; // order unchanged, nothing to do

  // FIRST — clear any in-progress FLIP transforms, then record current positions
  allCards.forEach(el => {
    el.style.transition = 'none';
    el.style.transform  = '';
  });
  container.getBoundingClientRect(); // flush

  const firstTops = new Map();
  allCards.forEach(el => {
    firstTops.set(el.dataset.id, el.getBoundingClientRect().top);
  });

  // Reorder DOM nodes (no create/destroy — just moves)
  const sorted = newIds.map(id => container.querySelector(`.reply-card[data-id="${id}"]`)).filter(Boolean);
  sorted.forEach(el => container.removeChild(el));
  sorted.forEach(el => container.appendChild(el));

  // LAST + INVERT + PLAY
  _flipPlay(sorted, firstTops, 'cubic-bezier(0.16, 1, 0.3, 1)', '0.46s');
}

// ─── FLIP: re-sort sidebar section items after an open-count change ───────────

function reorderSidebarAnimated() {
  const list = document.getElementById('sectionList');
  if (!list) return;

  // Only the unpinned section items need to re-sort
  const unpinnedEls = Array.from(list.querySelectorAll('.section-item')).filter(el => {
    const s = state.sections.find(x => x.id === el.dataset.id);
    return s && !s.pinned;
  });

  if (unpinnedEls.length <= 1) return;

  // Target order for unpinned sections
  const unpinned = state.sections.filter(s => !s.pinned).sort((a, b) => b.openCount - a.openCount);
  const newIds   = unpinned.map(s => s.id);
  const curIds   = unpinnedEls.map(el => el.dataset.id);

  if (curIds.join(',') === newIds.join(',')) return; // already in correct order

  // FIRST — clear stale transforms, record positions
  unpinnedEls.forEach(el => {
    el.style.transition = 'none';
    el.style.transform  = '';
  });
  list.getBoundingClientRect();

  const firstTops = new Map();
  unpinnedEls.forEach(el => {
    firstTops.set(el.dataset.id, el.getBoundingClientRect().top);
  });

  // Reorder DOM nodes (keep labels + dividers exactly where they are)
  const sorted = newIds.map(id => list.querySelector(`.section-item[data-id="${id}"]`)).filter(Boolean);
  sorted.forEach(el => list.removeChild(el));

  // Re-insert after the divider (if it exists) or at the end of the list
  const divider = list.querySelector('.section-divider');
  if (divider) {
    let anchor = divider;
    sorted.forEach(el => {
      anchor.parentNode.insertBefore(el, anchor.nextSibling);
      anchor = el;
    });
  } else {
    sorted.forEach(el => list.appendChild(el));
  }

  // LAST + INVERT + PLAY (slightly snappier than card animation — sidebar is compact)
  _flipPlay(sorted, firstTops, 'cubic-bezier(0.16, 1, 0.3, 1)', '0.36s');
}

// ─── Sidebar: update only the active-state CSS without a full re-render ───────

function _setSidebarActiveState(prevId, newId) {
  if (prevId) {
    const prev = document.querySelector(`.section-item[data-id="${prevId}"]`);
    if (prev) prev.classList.remove('active');
  }
  if (newId) {
    const next = document.querySelector(`.section-item[data-id="${newId}"]`);
    if (next) next.classList.add('active');
  }
}

// ─── Render: Sidebar ─────────────────────────────────────────────────────────

function renderSidebar() {
  const list = document.getElementById('sectionList');
  const q    = state.searchQuery.toLowerCase();

  list.innerHTML = '';

  const isVisible = s => {
    if (!q) return true;
    if (s.name.toLowerCase().includes(q)) return true;
    return state.texts.some(t => {
      if (t.sectionId !== s.id) return false;
      if (t.type === 'multi') {
        return (t.title || '').toLowerCase().includes(q)
          || (t.parts || []).some(p => p.content.toLowerCase().includes(q) || p.label.toLowerCase().includes(q));
      }
      return (t.content || '').toLowerCase().includes(q);
    });
  };

  const pinned = state.sections
    .filter(s => s.pinned && isVisible(s))
    .sort((a, b) => (a.pinnedAt || 0) - (b.pinnedAt || 0));

  const unpinned = state.sections
    .filter(s => !s.pinned && isVisible(s))
    .sort((a, b) => b.openCount - a.openCount);

  if (pinned.length === 0 && unpinned.length === 0) return;

  if (pinned.length > 0) {
    appendGroupLabel(list, 'Закреплено');
    pinned.forEach(s => appendSectionItem(list, s));
  }

  if (unpinned.length > 0) {
    if (pinned.length > 0) {
      const div = document.createElement('div');
      div.className = 'section-divider';
      list.appendChild(div);
    }
    unpinned.forEach(s => appendSectionItem(list, s));
  }
}

function appendGroupLabel(container, text) {
  const el = document.createElement('div');
  el.className = 'section-group-label';
  el.textContent = text;
  container.appendChild(el);
}

function appendSectionItem(container, section) {
  const isActive    = section.id === state.selectedId;
  const count       = textsForSection(section.id).length;
  const pinClass    = `icon-btn pin-btn${section.pinned ? ' is-pinned' : ''}`;
  const pinTitle    = section.pinned ? 'Открепить' : 'Закрепить';
  const pinIconHtml = section.pinned ? icon.pinFilled() : icon.pin();

  const item = document.createElement('div');
  item.className = `section-item${isActive ? ' active' : ''}`;
  item.dataset.id = section.id;

  item.innerHTML = `
    <div class="section-item-main" data-id="${section.id}">
      <span class="section-name">${escHtml(section.name)}</span>
      <span class="section-count">${count}</span>
    </div>
    <div class="section-actions">
      <button class="${pinClass}" data-id="${section.id}" title="${pinTitle}">${pinIconHtml}</button>
      <button class="icon-btn edit-btn" data-id="${section.id}" title="Rename">${icon.edit()}</button>
      <button class="icon-btn delete-btn" data-id="${section.id}" title="Delete">${icon.trash()}</button>
    </div>
  `;

  item.querySelector('.section-item-main').addEventListener('click', () => selectSection(section.id));
  item.querySelector('.pin-btn').addEventListener('click',    e => { e.stopPropagation(); togglePin(section.id); });
  item.querySelector('.edit-btn').addEventListener('click',   e => { e.stopPropagation(); promptRenameSection(section.id); });
  item.querySelector('.delete-btn').addEventListener('click', e => { e.stopPropagation(); promptDeleteSection(section.id); });

  container.appendChild(item);
}

// ─── Render: Content ─────────────────────────────────────────────────────────

function renderContent() {
  const header     = document.getElementById('contentHeader');
  const container  = document.getElementById('textsContainer');
  const titleEl    = document.getElementById('sectionTitle');
  const addTextBtn = document.getElementById('btnAddText');
  const q          = state.searchQuery.toLowerCase();
  const isSearch   = q.length > 0;

  container.innerHTML = '';

  if (!state.selectedId && !isSearch) {
    header.classList.add('hidden');
    showEmptyState(icon.chat(), 'Select a Section', 'Choose a section from the sidebar to view your quick replies.');
    return;
  }

  header.classList.remove('hidden');

  if (isSearch) {
    titleEl.textContent = `Search: "${state.searchQuery}"`;
    addTextBtn.classList.add('hidden');
  } else {
    const section = state.sections.find(s => s.id === state.selectedId);
    titleEl.textContent = section ? section.name : '';
    addTextBtn.classList.remove('hidden');
  }

  let items;
  if (isSearch) {
    items = state.texts.filter(t => {
      const s = state.sections.find(x => x.id === t.sectionId);
      if (s && s.name.toLowerCase().includes(q)) return true;
      if (t.type === 'multi') {
        return (t.title || '').toLowerCase().includes(q)
          || (t.parts || []).some(p => p.content.toLowerCase().includes(q) || p.label.toLowerCase().includes(q));
      }
      return (t.content || '').toLowerCase().includes(q);
    });
  } else {
    items = textsForSection(state.selectedId)
      .slice()
      .sort((a, b) => b.usageCount - a.usageCount);
  }

  if (items.length === 0) {
    hideEmptyState();
    if (isSearch) {
      showEmptyState(icon.noResults(), 'No results', 'Try a different search term.');
    } else {
      showEmptyState(icon.empty(), 'No replies yet', 'Click "Add Reply" to create your first quick reply for this section.');
    }
    return;
  }

  hideEmptyState();

  items.forEach((text, index) => {
    const section = state.sections.find(s => s.id === text.sectionId);
    const card = document.createElement('div');
    card.className = 'reply-card';
    card.dataset.id = text.id;
    card.style.animationDelay = `${index * 0.025}s`;

    const labelHtml = (isSearch && section)
      ? `<div class="card-section-label">${escHtml(section.name)}</div>`
      : '';

    const translateLabel = text.isShowingTranslated ? 'Original' : 'Translate';
    const isStale        = text.translationStale && !!text.translatedText;
    const translateClass = [
      'translate-btn',
      text.isShowingTranslated ? 'is-translated' : '',
      isStale ? 'is-stale' : '',
    ].filter(Boolean).join(' ');

    if (text.type === 'multi') {
      // ── Multi-part card ────────────────────────────────────────────────────
      const parts = text.parts || [];
      const partsHtml = parts.map((part, idx) => {
        const isLast = idx === parts.length - 1;
        const visibleContent = (text.isShowingTranslated && part.translatedContent)
          ? part.translatedContent : part.content;
        const buttonsHtml = isLast
          ? ''
          : `
            <div class="part-actions-right">
              <button class="part-copy-btn copy-btn" data-part-id="${part.id}">
                <span class="copy-icon">${icon.copy()}</span>
                <span class="copy-label">Copy</span>
              </button>
            </div>
          `;
        return `
          <div class="multi-part-block" data-part-id="${part.id}">
            <div class="part-content-row">
              <p class="part-content">${escHtml(visibleContent)}</p>
              ${buttonsHtml}
            </div>
          </div>
        `;
      }).join('');

      card.innerHTML = `
        ${labelHtml}
        <div class="card-body multi-card-body">
          <div class="multi-parts-list">${partsHtml}</div>
        </div>
        <div class="card-footer multi-card-footer">
          <div class="card-actions">
            <button class="card-action-btn edit-text-btn" data-id="${text.id}">
              ${icon.edit()} Edit
            </button>
            <button class="card-action-btn duplicate-text-btn" data-id="${text.id}">
              ${icon.duplicate()} Duplicate
            </button>
            <button class="card-action-btn delete-text-btn" data-id="${text.id}">
              ${icon.trash()} Delete
            </button>
          </div>
          <div class="card-footer-right">
            <button class="${translateClass}" data-id="${text.id}" title="Translate all parts">
              <span class="translate-icon">${icon.translate()}</span>
              <span class="translate-label">${translateLabel}</span>
            </button>
            <button class="part-copy-btn copy-btn" data-part-id="${parts[parts.length - 1].id}">
              <span class="copy-icon">${icon.copy()}</span>
              <span class="copy-label">Copy</span>
            </button>
          </div>
        </div>
      `;

      card.querySelector('.translate-btn').addEventListener('click',       () => handleTranslate(text.id));
      card.querySelector('.edit-text-btn').addEventListener('click',       e => { e.stopPropagation(); promptEditMultiText(text.id); });
      card.querySelector('.duplicate-text-btn').addEventListener('click',  e => { e.stopPropagation(); duplicateText(text.id); });
      card.querySelector('.delete-text-btn').addEventListener('click',     e => { e.stopPropagation(); promptDeleteText(text.id); });
      card.querySelectorAll('.part-copy-btn').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); handlePartCopy(text.id, btn.dataset.partId); });
      });

    } else {
      // ── Single reply card (original behavior) ──────────────────────────────
      const visibleText = text.isShowingTranslated && text.translatedText ? text.translatedText : text.content;

      card.innerHTML = `
        ${labelHtml}
        <div class="card-body">
          <p class="card-text">${escHtml(visibleText)}</p>
        </div>
        <div class="card-footer">
          <div class="card-actions">
            <button class="card-action-btn edit-text-btn" data-id="${text.id}">
              ${icon.edit()} Edit
            </button>
            <button class="card-action-btn duplicate-text-btn" data-id="${text.id}">
              ${icon.duplicate()} Duplicate
            </button>
            <button class="card-action-btn delete-text-btn" data-id="${text.id}">
              ${icon.trash()} Delete
            </button>
          </div>
          <div class="card-footer-right">
            <button class="${translateClass}" data-id="${text.id}" title="Translate">
              <span class="translate-icon">${icon.translate()}</span>
              <span class="translate-label">${translateLabel}</span>
            </button>
            <button class="copy-btn" data-id="${text.id}">
              <span class="copy-icon">${icon.copy()}</span>
              <span class="copy-label">Copy</span>
            </button>
          </div>
        </div>
      `;

      card.querySelector('.translate-btn').addEventListener('click',       () => handleTranslate(text.id));
      card.querySelector('.copy-btn').addEventListener('click',            () => handleCopy(text.id));
      card.querySelector('.edit-text-btn').addEventListener('click',       e => { e.stopPropagation(); promptEditText(text.id); });
      card.querySelector('.duplicate-text-btn').addEventListener('click',  e => { e.stopPropagation(); duplicateText(text.id); });
      card.querySelector('.delete-text-btn').addEventListener('click',     e => { e.stopPropagation(); promptDeleteText(text.id); });
    }

    container.appendChild(card);
  });
}

function showEmptyState(iconHtml, title, sub) {
  const el = document.getElementById('emptyState');
  document.getElementById('emptyIcon').innerHTML    = iconHtml;
  document.getElementById('emptyTitle').textContent = title;
  document.getElementById('emptySub').textContent   = sub;
  el.classList.remove('hidden');
}

function hideEmptyState() {
  document.getElementById('emptyState').classList.add('hidden');
}

// ─── Full Render ──────────────────────────────────────────────────────────────

function render() {
  renderSidebar();
  renderContent();
}

// ─── Section Actions ──────────────────────────────────────────────────────────

function selectSection(id) {
  const prevId    = state.selectedId;
  const hadSearch = state.searchQuery.length > 0;

  state.selectedId  = id;
  state.searchQuery = '';

  const searchEl = document.getElementById('searchInput');
  if (searchEl) searchEl.value = '';
  document.getElementById('searchClear').classList.add('hidden');

  const s = state.sections.find(x => x.id === id);
  if (s) { s.openCount = (s.openCount || 0) + 1; save(); }

  if (hadSearch) {
    // Coming out of search — sidebar needs a full rebuild to show all sections
    render();
  } else {
    // Normal section switch:
    // 1. Update active highlight in sidebar without destroying any DOM node
    _setSidebarActiveState(prevId, id);
    // 2. FLIP-animate any sidebar items that need to reorder
    reorderSidebarAnimated();
    // 3. Re-render only the content panel
    renderContent();
  }
}

function addSection(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const s = { id: uid(), name: trimmed, usageCount: 0, openCount: 0, pinned: false, pinnedAt: null };
  state.sections.push(s);
  save();
  state.selectedId  = s.id;
  state.searchQuery = '';
  render();
}

function renameSection(id, name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const s = state.sections.find(x => x.id === id);
  if (s) { s.name = trimmed; save(); render(); }
}

function deleteSection(id) {
  state.sections = state.sections.filter(x => x.id !== id);
  state.texts    = state.texts.filter(t => t.sectionId !== id);
  if (state.selectedId === id) state.selectedId = null;
  save();
  render();
}

function togglePin(id) {
  const s = state.sections.find(x => x.id === id);
  if (!s) return;
  s.pinned   = !s.pinned;
  s.pinnedAt = s.pinned ? Date.now() : null;
  save();
  render(); // structural change (label / divider may appear/disappear) — full re-render needed
}

// ─── Text Actions ─────────────────────────────────────────────────────────────

function addText(sectionId, content) {
  const trimmed = content.trim();
  if (!trimmed) return;
  state.texts.push({
    id: uid(), sectionId, type: 'single', content: trimmed, usageCount: 0,
    translatedText: null, isShowingTranslated: false, translationStale: false,
  });
  save();
  render();
}

function editText(id, content) {
  const trimmed = content.trim();
  if (!trimmed) return;
  const t = state.texts.find(x => x.id === id);
  if (t) {
    if (t.content !== trimmed && t.translatedText) {
      t.translationStale    = true;
      t.isShowingTranslated = false;
    }
    t.content = trimmed;
    save();
    render();
  }
}

function addMultiText(sectionId, title, parts) {
  // parts: [{ label, content }]
  if (!parts || parts.length === 0) return;
  const cleanParts = parts.map(p => ({
    id:                uid(),
    label:             p.label.trim(),
    content:           p.content.trim(),
    translatedContent: null,
  }));
  state.texts.push({
    id: uid(), sectionId, type: 'multi', title: title.trim(), parts: cleanParts,
    usageCount: 0, translatedText: null, isShowingTranslated: false, translationStale: false,
  });
  save();
  render();
}

function editMultiText(id, title, parts) {
  const t = state.texts.find(x => x.id === id);
  if (!t || t.type !== 'multi') return;
  const cleanParts = parts.map(p => ({
    id:                p.id || uid(),
    label:             p.label.trim(),
    content:           p.content.trim(),
    translatedContent: p.translatedContent ?? null,
  }));
  // If any content changed, mark translation stale
  const changed = cleanParts.some((p, i) => {
    const old = t.parts[i];
    return !old || old.content !== p.content;
  }) || cleanParts.length !== t.parts.length;
  if (changed && t.isShowingTranslated) {
    t.isShowingTranslated = false;
    t.translationStale    = true;
  } else if (changed && t.translatedText) {
    t.translationStale = true;
    // clear per-part translated content since it's now stale
    cleanParts.forEach(p => { p.translatedContent = null; });
  }
  t.title = title.trim();
  t.parts = cleanParts;
  save();
  render();
}

function deleteText(id) {
  state.texts = state.texts.filter(x => x.id !== id);
  save();
  render();
}

function duplicateText(id) {
  const t = state.texts.find(x => x.id === id);
  if (!t) return;
  const idx = state.texts.indexOf(t);
  const base = {
    id:                  uid(),
    sectionId:           t.sectionId,
    type:                t.type ?? 'single',
    usageCount:          0,
    translatedText:      null,
    isShowingTranslated: false,
    translationStale:    false,
  };
  if (t.type === 'multi') {
    base.title = t.title ?? '';
    base.parts = (t.parts || []).map(p => ({
      id:                uid(),
      label:             p.label,
      content:           p.content,
      translatedContent: null,
    }));
  } else {
    base.content = t.content;
  }
  state.texts.splice(idx + 1, 0, base);
  save();
  render();
}

// ─── Copy Handler ─────────────────────────────────────────────────────────────

async function handleCopy(id) {
  const t = state.texts.find(x => x.id === id);
  if (!t) return;

  let textToCopy;
  if (t.type === 'multi') {
    // Copy all parts in order (translated if showing)
    textToCopy = (t.parts || []).map(p => {
      const content = (t.isShowingTranslated && p.translatedContent) ? p.translatedContent : p.content;
      return p.label ? `${p.label}\n${content}` : content;
    }).join('\n\n');
  } else {
    textToCopy = t.isShowingTranslated && t.translatedText ? t.translatedText : t.content;
  }

  const ok = await copyToClipboard(textToCopy);
  if (!ok) { console.warn('Quick Replies: clipboard write failed.'); return; }

  // ── Update counter immediately ────────────────────────────────────────────
  t.usageCount++;
  save();

  // ── Visual feedback on the card and button ────────────────────────────────
  const card   = document.querySelector(`.reply-card[data-id="${id}"]`);
  const copyAllBtn = document.querySelector(`.copy-all-btn[data-id="${id}"]`);
  const btn    = copyAllBtn || document.querySelector(`.copy-btn[data-id="${id}"]`);

  if (card) {
    card.classList.add('copied');
    setTimeout(() => card.classList.remove('copied'), 1300);
  }

  if (btn) {
    btn.classList.add('copied');
    btn.querySelector('.copy-icon').innerHTML    = icon.check();
    btn.querySelector('.copy-label').textContent = 'Copied';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.querySelector('.copy-icon').innerHTML    = icon.copy();
      btn.querySelector('.copy-label').textContent = 'Copy';
    }, 1600);
  }

  showToast('Copied to clipboard');

  // ── FLIP-animate the card to its new sorted position ─────────────────────
  reorderCardsAnimated();
}

async function handlePartCopy(textId, partId) {
  const t = state.texts.find(x => x.id === textId);
  if (!t || t.type !== 'multi') return;

  const part = (t.parts || []).find(p => p.id === partId);
  if (!part) return;

  const textToCopy = (t.isShowingTranslated && part.translatedContent) ? part.translatedContent : part.content;
  const ok = await copyToClipboard(textToCopy);
  if (!ok) { console.warn('Quick Replies: clipboard write failed.'); return; }

  // Increment outer card's usage count
  t.usageCount++;
  save();

  // Visual feedback on the part copy btn
  const btn = document.querySelector(`.part-copy-btn[data-part-id="${partId}"]`);
  if (btn) {
    btn.classList.add('copied');
    btn.querySelector('.copy-icon').innerHTML    = icon.check();
    btn.querySelector('.copy-label').textContent = 'Copied';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.querySelector('.copy-icon').innerHTML    = icon.copy();
      btn.querySelector('.copy-label').textContent = 'Copy';
    }, 1600);
  }

  // Shimmer only on the specific part block that was copied
  const partBlock = document.querySelector(`.multi-part-block[data-part-id="${partId}"]`);
  if (partBlock) {
    partBlock.classList.add('copied');
    setTimeout(() => partBlock.classList.remove('copied'), 1300);
  }

  showToast('Copied to clipboard');
  reorderCardsAnimated();
}

// ─── Translate Handler ────────────────────────────────────────────────────────

async function handleTranslate(id) {
  const t = state.texts.find(x => x.id === id);
  if (!t) return;

  if (t.isShowingTranslated) {
    t.isShowingTranslated = false;
    save();
    _applyTranslateState(id, t);
    return;
  }

  // For multi-part: check if all parts already have translations
  const hasTranslation = t.type === 'multi'
    ? ((t.parts || []).every(p => p.translatedContent) && !t.translationStale)
    : (t.translatedText && !t.translationStale);

  if (hasTranslation) {
    t.isShowingTranslated = true;
    save();
    _applyTranslateState(id, t);
    return;
  }

  const btn = document.querySelector(`.translate-btn[data-id="${id}"]`);
  if (btn) {
    btn.disabled = true;
    btn.classList.add('translating');
    btn.querySelector('.translate-label').textContent = '…';
  }

  try {
    if (t.type === 'multi') {
      // Translate each part sequentially
      for (const part of (t.parts || [])) {
        if (part.translatedContent && !t.translationStale) continue;
        const res = await fetch('/.netlify/functions/translate', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ text: part.content }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!data.translatedText || typeof data.translatedText !== 'string' || !data.translatedText.trim()) {
          throw new Error('Empty or missing translation in response');
        }
        part.translatedContent = data.translatedText.trim();
      }
      t.translatedText      = (t.parts || []).map(p => p.translatedContent || '').join('\n\n');
      t.isShowingTranslated = true;
      t.translationStale    = false;
    } else {
      const res = await fetch('/.netlify/functions/translate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text: t.content }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (!data.translatedText || typeof data.translatedText !== 'string' || !data.translatedText.trim()) {
        throw new Error('Empty or missing translation in response');
      }
      t.translatedText      = data.translatedText.trim();
      t.isShowingTranslated = true;
      t.translationStale    = false;
    }
    save();
    _applyTranslateState(id, t);
    showToast('Translation complete');
  } catch (err) {
    console.error('Translation failed:', err.message);
    showToast('Translation failed');
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('translating');
      btn.querySelector('.translate-label').textContent = 'Translate';
    }
  }
}

function _applyTranslateState(id, t) {
  const card = document.querySelector(`.reply-card[data-id="${id}"]`);
  if (!card) return;

  if (t.type === 'multi') {
    // Update each part block
    (t.parts || []).forEach(part => {
      const partBlock = card.querySelector(`.multi-part-block[data-part-id="${part.id}"]`);
      if (!partBlock) return;
      const contentEl = partBlock.querySelector('.part-content');
      if (contentEl) {
        contentEl.textContent = (t.isShowingTranslated && part.translatedContent)
          ? part.translatedContent
          : part.content;
      }
    });
  } else {
    const textEl = card.querySelector('.card-text');
    if (textEl) {
      textEl.textContent = t.isShowingTranslated && t.translatedText ? t.translatedText : t.content;
    }
  }

  const btn    = card.querySelector('.translate-btn');

  if (btn) {
    btn.disabled = false;
    btn.classList.remove('translating');
    if (t.isShowingTranslated) {
      btn.classList.add('is-translated');
      btn.classList.remove('is-stale');
      btn.querySelector('.translate-label').textContent = 'Original';
    } else {
      btn.classList.remove('is-translated');
      btn.classList.toggle('is-stale', t.translationStale && !!t.translatedText);
      btn.querySelector('.translate-label').textContent = 'Translate';
    }
  }
}

// ─── Backup: Export ───────────────────────────────────────────────────────────

function exportBackup() {
  const payload = {
    version:    1,
    exportedAt: new Date().toISOString(),
    sections:   state.sections,
    texts:      state.texts,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `quick-replies-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Backup exported');
}

// ─── Backup: Import ───────────────────────────────────────────────────────────

function importBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data.sections) || !Array.isArray(data.texts)) {
        throw new Error('Invalid backup structure');
      }
      state.sections    = data.sections.map(migrateSection);
      state.texts       = data.texts.map(migrateText);
      state.selectedId  = null;
      state.searchQuery = '';
      save();
      if (state.sections.length > 0) {
        state.selectedId = sortedSections()[0].id;
      }
      render();
      showToast('Backup imported');
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// ─── Toast ────────────────────────────────────────────────────────────────────

let _toastTimer = null;

function showToast(msg) {
  const toast  = document.getElementById('toast');
  const msgEl  = document.getElementById('toastMsg');
  const iconEl = document.getElementById('toastIcon');
  msgEl.textContent = msg;
  iconEl.innerHTML  = icon.check();
  toast.classList.add('visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('visible'), 2000);
}

// ─── Modal System ─────────────────────────────────────────────────────────────

let _modalCallback = null;

function showModal({ title, placeholder, defaultValue = '', multiline = false, hint = '', onSave }) {
  _modalCallback = onSave;

  document.getElementById('modalTitle').textContent = title;

  const area = document.getElementById('modalInputArea');
  if (multiline) {
    area.innerHTML = `
      <textarea id="modalInput" class="modal-textarea" placeholder="${escHtml(placeholder)}">${escHtml(defaultValue)}</textarea>
      ${hint ? `<p class="modal-hint">${hint}</p>` : ''}
    `;
  } else {
    area.innerHTML = `
      <input id="modalInput" class="modal-input" type="text" placeholder="${escHtml(placeholder)}" value="${escHtml(defaultValue)}">
      ${hint ? `<p class="modal-hint">${hint}</p>` : ''}
    `;
  }

  document.getElementById('modalOverlay').classList.add('visible');

  const input = document.getElementById('modalInput');
  requestAnimationFrame(() => {
    input.focus();
    if (!multiline) input.select();
  });

  input.addEventListener('keydown', onModalInputKey);
}

function onModalInputKey(e) {
  if (e.key === 'Escape') {
    closeModal();
  } else if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    submitModal();
  } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    submitModal();
  }
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('visible');
  document.getElementById('modalSave').classList.remove('hidden');
  _modalCallback = null;
}

function submitModal() {
  // Multi-part modal: callback takes no args (reads from DOM itself)
  if (_modalCallback) {
    const input = document.getElementById('modalInput');
    if (input) {
      _modalCallback(input.value);
    } else {
      // multi-part modal has no #modalInput — just call the callback
      _modalCallback();
    }
    closeModal();
  }
}

// ─── Modal Prompts ────────────────────────────────────────────────────────────

function promptAddSection() {
  showModal({
    title: 'New Section', placeholder: 'Section name (e.g. Refunds, Onboarding…)',
    onSave: name => addSection(name)
  });
}

function promptRenameSection(id) {
  const s = state.sections.find(x => x.id === id);
  if (!s) return;
  showModal({
    title: 'Rename Section', placeholder: 'Section name', defaultValue: s.name,
    onSave: name => renameSection(id, name)
  });
}

function promptDeleteSection(id) {
  const s = state.sections.find(x => x.id === id);
  if (!s) return;
  const count = textsForSection(id).length;
  const msg = count > 0
    ? `Delete "${s.name}" and its ${count} ${count === 1 ? 'reply' : 'replies'}? This cannot be undone.`
    : `Delete the section "${s.name}"? This cannot be undone.`;
  if (window.confirm(msg)) deleteSection(id);
}

function promptAddText() {
  if (!state.selectedId) return;
  showTypePickerModal();
}

function showTypePickerModal() {
  _modalCallback = null;
  document.getElementById('modalTitle').textContent = 'Add Reply';

  const area = document.getElementById('modalInputArea');
  area.innerHTML = `
    <div class="type-picker">
      <button class="type-picker-btn" id="pickSingle">
        <span class="type-picker-icon">${icon.copy()}</span>
        <span class="type-picker-text">
          <strong>Обычный ответ</strong>
          <span>Один текстовый блок</span>
        </span>
      </button>
      <button class="type-picker-btn" id="pickMulti">
        <span class="type-picker-icon">${icon.duplicate()}</span>
        <span class="type-picker-text">
          <strong>Составной ответ</strong>
          <span>Несколько частей в одной карточке</span>
        </span>
      </button>
    </div>
  `;

  // Hide Save button — type picker is click-to-select
  document.getElementById('modalSave').classList.add('hidden');
  document.getElementById('modalOverlay').classList.add('visible');

  document.getElementById('pickSingle').addEventListener('click', () => {
    closeModal();
    showModal({
      title: 'New Quick Reply', placeholder: 'Type your reply text here…',
      multiline: true, hint: 'Tip: press Cmd+Enter to save quickly.',
      onSave: content => addText(state.selectedId, content)
    });
  });
  document.getElementById('pickMulti').addEventListener('click', () => {
    closeModal();
    showMultiPartModal({ mode: 'add' });
  });
}

function showMultiPartModal({ mode, textId }) {
  // mode: 'add' | 'edit'
  let existing = null;
  if (mode === 'edit') {
    existing = state.texts.find(x => x.id === textId);
    if (!existing) return;
  }

  _modalCallback = null;
  document.getElementById('modalTitle').textContent = mode === 'edit' ? 'Редактировать составной ответ' : 'Новый составной ответ';
  document.getElementById('modalSave').classList.remove('hidden');

  const initParts = existing
    ? existing.parts.map(p => ({ id: p.id, label: p.label, content: p.content, translatedContent: p.translatedContent }))
    : [
        { id: uid(), label: '1/2', content: '' },
        { id: uid(), label: '2/2', content: '' },
      ];

  function renderMultiModal() {
    const area = document.getElementById('modalInputArea');
    area.innerHTML = `
      <div class="multi-modal-form">
        <div id="multiModalParts"></div>
        <button class="multi-modal-add-part-btn" id="addPartBtn">
          ${icon.plus()} Добавить часть
        </button>
      </div>
    `;

    const partsContainer = document.getElementById('multiModalParts');

    function renderParts() {
      partsContainer.innerHTML = '';
      initParts.forEach((part, idx) => {
        const row = document.createElement('div');
        row.className = 'multi-modal-part-row';
        row.dataset.idx = idx;
        row.innerHTML = `
          <div class="multi-modal-part-header">
            <input
              class="modal-input part-label-input"
              type="text"
              placeholder="Метка (напр. 1/2)"
              value="${escHtml(part.label)}"
              style="width:90px;flex-shrink:0"
            >
            ${initParts.length > 2
              ? `<button class="multi-modal-remove-btn" title="Remove part">${icon.trash()}</button>`
              : ''}
          </div>
          <textarea
            class="modal-textarea part-content-input"
            placeholder="Текст части ${idx + 1}…"
            style="min-height:80px;margin-top:5px"
          >${escHtml(part.content)}</textarea>
        `;

        // Live-update initParts on change
        row.querySelector('.part-label-input').addEventListener('input', e => {
          initParts[idx].label = e.target.value;
        });
        row.querySelector('.part-content-input').addEventListener('input', e => {
          initParts[idx].content = e.target.value;
        });

        // Cmd+Enter saves from textarea
        row.querySelector('.part-content-input').addEventListener('keydown', e => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            submitMultiModal();
          }
        });

        if (initParts.length > 2) {
          row.querySelector('.multi-modal-remove-btn').addEventListener('click', () => {
            initParts.splice(idx, 1);
            renderParts();
          });
        }

        partsContainer.appendChild(row);
      });
    }

    renderParts();

    document.getElementById('addPartBtn').addEventListener('click', () => {
      const nextNum = initParts.length + 1;
      initParts.push({ id: uid(), label: `${nextNum}/${nextNum}`, content: '', translatedContent: null });
      renderParts();
    });
  }

  renderMultiModal();

  function submitMultiModal() {
    const titleVal = '';
    const partsVal = initParts.map((p, idx) => {
      const rows = document.querySelectorAll('#multiModalParts .multi-modal-part-row');
      const row  = rows[idx];
      if (row) {
        p.label   = row.querySelector('.part-label-input')?.value   || p.label;
        p.content = row.querySelector('.part-content-input')?.value || p.content;
      }
      return p;
    }).filter(p => p.content.trim());

    if (partsVal.length === 0) { closeModal(); return; }

    if (mode === 'edit') {
      editMultiText(textId, titleVal, partsVal);
    } else {
      addMultiText(state.selectedId, titleVal, partsVal);
    }
    closeModal();
  }

  _modalCallback = () => submitMultiModal();

  document.getElementById('modalOverlay').classList.add('visible');

  // Focus the first textarea
  requestAnimationFrame(() => {
    const first = document.querySelector('#multiModalParts .part-content-input');
    if (first) first.focus();
  });
}

function promptEditText(id) {
  const t = state.texts.find(x => x.id === id);
  if (!t) return;
  showModal({
    title: 'Edit Quick Reply', placeholder: 'Reply text', defaultValue: t.content,
    multiline: true, hint: 'Tip: press Cmd+Enter to save quickly.',
    onSave: content => editText(id, content)
  });
}

function promptEditMultiText(id) {
  showMultiPartModal({ mode: 'edit', textId: id });
}

function promptDeleteText(id) {
  if (window.confirm('Delete this quick reply? This cannot be undone.')) deleteText(id);
}

// ─── Search ───────────────────────────────────────────────────────────────────

function onSearch(e) {
  state.searchQuery = e.target.value;
  document.getElementById('searchClear').classList.toggle('hidden', !state.searchQuery);
  render();
}

function clearSearch() {
  state.searchQuery = '';
  const input = document.getElementById('searchInput');
  if (input) input.value = '';
  document.getElementById('searchClear').classList.add('hidden');
  render();
}

// ─── Event Setup ──────────────────────────────────────────────────────────────

function setupEvents() {
  document.getElementById('btnAddSection').addEventListener('click', promptAddSection);
  document.getElementById('btnAddText').addEventListener('click', promptAddText);
  document.getElementById('searchInput').addEventListener('input', onSearch);
  document.getElementById('searchClear').addEventListener('click', clearSearch);

  document.getElementById('modalSave').addEventListener('click', submitModal);
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  document.getElementById('btnExport').addEventListener('click', exportBackup);
  document.getElementById('importFileInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) importBackup(file);
    e.target.value = '';
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('modalOverlay').classList.contains('visible')) {
      closeModal();
    }
  });
}

// ─── Init Static Icons ───────────────────────────────────────────────────────

function injectStaticIcons() {
  document.getElementById('iconAddSection').innerHTML = icon.plus();
  document.getElementById('iconAddText').innerHTML    = icon.plus();
  document.getElementById('searchIconEl').innerHTML   = icon.search();
  document.getElementById('iconExport').innerHTML     = icon.download();
  document.getElementById('iconImport').innerHTML     = icon.upload();
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

function init() {
  injectStaticIcons();
  load();
  setupEvents();

  if (!state.selectedId && state.sections.length > 0) {
    state.selectedId = sortedSections()[0].id;
  }

  render();
}

document.addEventListener('DOMContentLoaded', init);
