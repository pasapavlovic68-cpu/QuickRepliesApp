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

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const data = JSON.parse(raw);
      // Safely migrate existing data — add any missing fields
      state.sections = (data.sections || []).map(s => ({
        ...s,
        openCount: s.openCount  ?? 0,
        pinned:    s.pinned     ?? false,
        pinnedAt:  s.pinnedAt   ?? null,
      }));
      state.texts = (data.texts || []).map(t => ({
        ...t,
        usageCount:          t.usageCount          ?? 0,
        // Translation fields — safe defaults for old records
        translatedText:      t.translatedText      ?? null,
        isShowingTranslated: t.isShowingTranslated  ?? false,
        translationStale:    t.translationStale     ?? false,
      }));
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
  const mkSection = (name, usageCount) => ({ id: uid(), name, usageCount, openCount: 0, pinned: false, pinnedAt: null });

  const sVerification       = mkSection('Верификация', 14);
  const sReturnMoney        = mkSection('Верни мои деньги', 9);
  const sTrust              = mkSection('Доверие', 7);
  const sWhenWillYou        = mkSection('Когда заберёшь свои деньги', 5);
  const sGiveLoan           = mkSection('Дай мне в долг', 3);
  const sTax                = mkSection('Налог', 2);
  const sNoMoney            = mkSection('Нет денег', 1);

  state.sections = [sVerification, sReturnMoney, sTrust, sWhenWillYou, sGiveLoan, sTax, sNoMoney];

  const mkText = (sectionId, content, usageCount = 0) => ({
    id: uid(), sectionId, content, usageCount,
    translatedText: null, isShowingTranslated: false, translationStale: false,
  });

  state.texts = [
    // Verification
    mkText(sVerification.id, "Thank you for reaching out! To verify your account, please provide your full name, date of birth, and the last 4 digits of your SSN. We'll get this sorted for you right away.", 6),
    mkText(sVerification.id, 'For security purposes, we need to confirm your identity before proceeding. Could you please confirm the email address and phone number associated with your account?', 4),
    mkText(sVerification.id, 'Great news — your identity has been successfully verified! Your account is now fully activated and ready to use. Welcome aboard!', 4),
    mkText(sVerification.id, "We've sent a one-time verification code to your registered email address. Please enter it within 10 minutes to complete the process. Don't see it? Check your spam folder.", 2),

    // Return My Money
    mkText(sReturnMoney.id, 'I completely understand your frustration, and I sincerely apologize for the inconvenience. Your refund has been initiated — please allow 3–5 business days for the funds to appear on your statement.', 4),
    mkText(sReturnMoney.id, "Your refund request is confirmed and currently under review by our finance team. You'll receive a confirmation email within 24 hours with the exact timeline and transaction reference.", 3),
    mkText(sReturnMoney.id, "A full refund has been processed back to your original payment method. Transaction reference: [TXN-ID]. Please allow up to 5 business days depending on your bank's processing schedule.", 2),

    // Trust
    mkText(sTrust.id, 'Your funds are held in fully segregated client accounts, protected by industry-standard 256-bit encryption and monitored 24/7. Your assets are safe with us.', 3),
    mkText(sTrust.id, 'We are fully licensed and regulated, complying with all applicable financial regulations. Every transaction on your account is logged, audited, and secured.', 2),
    mkText(sTrust.id, 'Your account is protected by two-factor authentication and real-time fraud monitoring. If you ever notice any suspicious activity, please contact us immediately and we will act without delay.', 2),

    // When Will You Take Your Money
    mkText(sWhenWillYou.id, 'Based on your current balance and recent trading activity, your funds are available for withdrawal right now. Would you like me to initiate the process on your behalf?', 3),
    mkText(sWhenWillYou.id, 'Your withdrawal is scheduled for processing on [DATE]. Please ensure your bank details are up to date in your account settings to avoid any delays.', 1),
    mkText(sWhenWillYou.id, 'I can see your account balance is ready. To proceed with a withdrawal, please log into your account, navigate to "Withdraw Funds", and follow the on-screen steps. It typically takes 1–3 business days.', 1),

    // Give Me a Loan
    mkText(sGiveLoan.id, 'Thank you for your interest in our financing options! Based on your account history and activity, you may qualify for a credit line of up to $[AMOUNT]. Shall I begin the pre-qualification process?', 2),
    mkText(sGiveLoan.id, "To begin the loan application, please make sure your account is fully verified and your identity documents are on file. The review typically takes 1–2 business days and you'll be notified by email.", 1),
    mkText(sGiveLoan.id, 'Our credit team will review your application and reach out with a personalized offer. In the meantime, feel free to reach out if you have any questions about our loan terms or repayment options.', 0),

    // Tax
    mkText(sTax.id, 'Your tax documents for the current fiscal year are available in your account portal under Documents & Statements. You can download them at any time in PDF or CSV format.', 1),
    mkText(sTax.id, 'For tax-related questions, we recommend consulting a licensed tax professional. We can generate a full transaction history report for any date range upon request — just let me know.', 1),
    mkText(sTax.id, 'Your annual statement for [YEAR] has been generated and is available for download in your account dashboard. It includes all transactions, fees, and earnings for the full calendar year.', 0),

    // No Money
    mkText(sNoMoney.id, 'I can see your account balance is currently at zero. Would you like to make a deposit to get started? Our team can walk you through the process step by step.', 1),
    mkText(sNoMoney.id, 'It looks like your available balance is insufficient for this transaction. Please add funds to your account to continue — I can help guide you through the deposit process if needed.', 0),
    mkText(sNoMoney.id, 'To activate your trading account and start investing, a minimum initial deposit of $[AMOUNT] is required. Would you like assistance with making your first deposit today?', 0),
  ];
}

// ─── Clipboard ────────────────────────────────────────────────────────────────

async function copyToClipboard(text) {
  // Preferred: Clipboard API (requires https or localhost)
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to execCommand fallback
    }
  }
  // Fallback: works on file:// protocol
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

  // Pushpin — outline (unpinned hover state)
  pin: () => `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76z"/></svg>`,

  // Pushpin — filled (pinned state)
  pinFilled: () => `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22" stroke-width="2.2" fill="none"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76z"/></svg>`,

  // Globe — translate
  translate: () => `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
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
  // Returns flat array: pinned first (stable by pin time), then unpinned (by open count)
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

// ─── Render: Sidebar ─────────────────────────────────────────────────────────

function renderSidebar() {
  const list = document.getElementById('sectionList');
  const q    = state.searchQuery.toLowerCase();

  list.innerHTML = '';

  // Search visibility check
  const isVisible = s => {
    if (!q) return true;
    if (s.name.toLowerCase().includes(q)) return true;
    return state.texts.some(t => t.sectionId === s.id && t.content.toLowerCase().includes(q));
  };

  // Pinned: stable order by pin timestamp (earliest pin = top)
  const pinned = state.sections
    .filter(s => s.pinned && isVisible(s))
    .sort((a, b) => (a.pinnedAt || 0) - (b.pinnedAt || 0));

  // Unpinned: sorted by open/select frequency, descending
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
  const isActive  = section.id === state.selectedId;
  const count     = textsForSection(section.id).length;
  const pinClass  = `icon-btn pin-btn${section.pinned ? ' is-pinned' : ''}`;
  const pinTitle  = section.pinned ? 'Открепить' : 'Закрепить';
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
  item.querySelector('.pin-btn').addEventListener('click', e => { e.stopPropagation(); togglePin(section.id); });
  item.querySelector('.edit-btn').addEventListener('click', e => { e.stopPropagation(); promptRenameSection(section.id); });
  item.querySelector('.delete-btn').addEventListener('click', e => { e.stopPropagation(); promptDeleteSection(section.id); });

  container.appendChild(item);
}

// ─── Render: Content ─────────────────────────────────────────────────────────

function renderContent() {
  const header     = document.getElementById('contentHeader');
  const container  = document.getElementById('textsContainer');
  const emptyState = document.getElementById('emptyState');
  const titleEl    = document.getElementById('sectionTitle');
  const addTextBtn = document.getElementById('btnAddText');
  const q          = state.searchQuery.toLowerCase();
  const isSearch   = q.length > 0;

  container.innerHTML = '';

  // ── Nothing selected and no search: show landing empty state
  if (!state.selectedId && !isSearch) {
    header.classList.add('hidden');
    container.innerHTML = '';
    showEmptyState(icon.chat(), 'Select a Section', 'Choose a section from the sidebar to view your quick replies.');
    return;
  }

  // ── Header
  header.classList.remove('hidden');

  if (isSearch) {
    titleEl.textContent = `Search: "${state.searchQuery}"`;
    addTextBtn.classList.add('hidden');
  } else {
    const section = state.sections.find(s => s.id === state.selectedId);
    titleEl.textContent = section ? section.name : '';
    addTextBtn.classList.remove('hidden');
  }

  // ── Texts to display
  let items;

  if (isSearch) {
    items = state.texts.filter(t => {
      const s = state.sections.find(x => x.id === t.sectionId);
      return t.content.toLowerCase().includes(q) || (s && s.name.toLowerCase().includes(q));
    });
  } else {
    // Sort by copy frequency — most copied replies rise to top
    items = textsForSection(state.selectedId)
      .sort((a, b) => b.usageCount - a.usageCount);
  }

  // ── Empty sub-state
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
    card.style.animationDelay = `${index * 0.038}s`;

    const labelHtml = (isSearch && section)
      ? `<div class="card-section-label">${escHtml(section.name)}</div>`
      : '';

    // Determine what text to display (original or translation)
    const visibleText     = text.isShowingTranslated && text.translatedText ? text.translatedText : text.content;
    const translateLabel  = text.isShowingTranslated ? 'Original' : 'Translate';
    const isStale         = text.translationStale && !!text.translatedText;
    const translateClass  = [
      'translate-btn',
      text.isShowingTranslated ? 'is-translated' : '',
      isStale ? 'is-stale' : '',
    ].filter(Boolean).join(' ');

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

    card.querySelector('.translate-btn').addEventListener('click', () => handleTranslate(text.id));
    card.querySelector('.copy-btn').addEventListener('click', () => handleCopy(text.id));
    card.querySelector('.edit-text-btn').addEventListener('click', e => { e.stopPropagation(); promptEditText(text.id); });
    card.querySelector('.delete-text-btn').addEventListener('click', e => { e.stopPropagation(); promptDeleteText(text.id); });

    container.appendChild(card);
  });
}

function showEmptyState(iconHtml, title, sub) {
  const el = document.getElementById('emptyState');
  document.getElementById('emptyIcon').innerHTML  = iconHtml;
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
  state.selectedId  = id;
  state.searchQuery = '';
  const searchEl = document.getElementById('searchInput');
  if (searchEl) searchEl.value = '';
  document.getElementById('searchClear').classList.add('hidden');
  // Track open frequency — drives unpinned sidebar order
  const s = state.sections.find(x => x.id === id);
  if (s) { s.openCount = (s.openCount || 0) + 1; save(); }
  render();
}

function addSection(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  const s = { id: uid(), name: trimmed, usageCount: 0, openCount: 0, pinned: false, pinnedAt: null };
  state.sections.push(s);
  save();
  state.selectedId = s.id;
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
  render();
}

// ─── Text Actions ─────────────────────────────────────────────────────────────

function addText(sectionId, content) {
  const trimmed = content.trim();
  if (!trimmed) return;
  state.texts.push({
    id: uid(), sectionId, content: trimmed, usageCount: 0,
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
    // If content changed and a translation was saved, mark it stale
    if (t.content !== trimmed && t.translatedText) {
      t.translationStale    = true;
      t.isShowingTranslated = false;
    }
    t.content = trimmed;
    save();
    render();
  }
}

function deleteText(id) {
  state.texts = state.texts.filter(x => x.id !== id);
  save();
  render();
}

// ─── Copy Handler ─────────────────────────────────────────────────────────────

async function handleCopy(id) {
  const t = state.texts.find(x => x.id === id);
  if (!t) return;

  // Copy the currently visible text (original or translation)
  const textToCopy = t.isShowingTranslated && t.translatedText ? t.translatedText : t.content;
  const ok = await copyToClipboard(textToCopy);
  if (!ok) { console.warn('Quick Replies: clipboard write failed.'); return; }

  // Increment only this reply's copy count (section order is driven by open count, not copies)
  t.usageCount++;
  save();

  // Animate the card
  const card = document.querySelector(`.reply-card[data-id="${id}"]`);
  const btn  = document.querySelector(`.copy-btn[data-id="${id}"]`);

  if (card) {
    card.classList.add('copied');
    setTimeout(() => card.classList.remove('copied'), 1300);
  }

  if (btn) {
    btn.classList.add('copied');
    btn.querySelector('.copy-icon').innerHTML  = icon.check();
    btn.querySelector('.copy-label').textContent = 'Copied';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.querySelector('.copy-icon').innerHTML  = icon.copy();
      btn.querySelector('.copy-label').textContent = 'Copy';
    }, 1600);
  }

  // Toast
  showToast('Copied to clipboard');
}

// ─── Translate Handler ────────────────────────────────────────────────────────

async function handleTranslate(id) {
  const t = state.texts.find(x => x.id === id);
  if (!t) return;

  // Currently showing translation → toggle back to original (no API call)
  if (t.isShowingTranslated) {
    t.isShowingTranslated = false;
    save();
    _applyTranslateState(id, t);
    return;
  }

  // Has a fresh (non-stale) translation → just show it (no API call)
  if (t.translatedText && !t.translationStale) {
    t.isShowingTranslated = true;
    save();
    _applyTranslateState(id, t);
    return;
  }

  // Need a new translation — call the backend
  const btn = document.querySelector(`.translate-btn[data-id="${id}"]`);
  if (btn) {
    btn.disabled = true;
    btn.classList.add('translating');
    btn.querySelector('.translate-label').textContent = '…';
  }

  try {
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
    t.translatedText      = data.translatedText;
    t.isShowingTranslated = true;
    t.translationStale    = false;
    save();
    _applyTranslateState(id, t);
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

// Update the card DOM in-place — avoids a full re-render so animations stay intact
function _applyTranslateState(id, t) {
  const card  = document.querySelector(`.reply-card[data-id="${id}"]`);
  if (!card) return;

  const textEl = card.querySelector('.card-text');
  const btn    = card.querySelector('.translate-btn');

  if (textEl) {
    const visible = t.isShowingTranslated && t.translatedText ? t.translatedText : t.content;
    textEl.textContent = visible;
  }

  if (btn) {
    btn.disabled = false;
    btn.classList.remove('translating');

    if (t.isShowingTranslated) {
      btn.classList.add('is-translated');
      btn.classList.remove('is-stale');
      btn.querySelector('.translate-label').textContent = 'Original';
    } else {
      btn.classList.remove('is-translated');
      const isStale = t.translationStale && !!t.translatedText;
      btn.classList.toggle('is-stale', isStale);
      btn.querySelector('.translate-label').textContent = 'Translate';
    }
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────

let _toastTimer = null;

function showToast(msg) {
  const toast  = document.getElementById('toast');
  const msgEl  = document.getElementById('toastMsg');
  const iconEl = document.getElementById('toastIcon');
  msgEl.textContent    = msg;
  iconEl.innerHTML     = icon.check();
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

  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('visible');

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
    // Cmd+Enter saves from textarea too
    e.preventDefault();
    submitModal();
  }
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('visible');
  _modalCallback = null;
}

function submitModal() {
  const input = document.getElementById('modalInput');
  if (input && _modalCallback) {
    _modalCallback(input.value);
    closeModal();
  }
}

// ─── Modal Prompts ────────────────────────────────────────────────────────────

function promptAddSection() {
  showModal({
    title: 'New Section',
    placeholder: 'Section name (e.g. Refunds, Onboarding…)',
    onSave: name => addSection(name)
  });
}

function promptRenameSection(id) {
  const s = state.sections.find(x => x.id === id);
  if (!s) return;
  showModal({
    title: 'Rename Section',
    placeholder: 'Section name',
    defaultValue: s.name,
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
  showModal({
    title: 'New Quick Reply',
    placeholder: 'Type your reply text here…',
    multiline: true,
    hint: 'Tip: press Cmd+Enter to save quickly.',
    onSave: content => addText(state.selectedId, content)
  });
}

function promptEditText(id) {
  const t = state.texts.find(x => x.id === id);
  if (!t) return;
  showModal({
    title: 'Edit Quick Reply',
    placeholder: 'Reply text',
    defaultValue: t.content,
    multiline: true,
    hint: 'Tip: press Cmd+Enter to save quickly.',
    onSave: content => editText(id, content)
  });
}

function promptDeleteText(id) {
  if (window.confirm('Delete this quick reply? This cannot be undone.')) {
    deleteText(id);
  }
}

// ─── Search ───────────────────────────────────────────────────────────────────

function onSearch(e) {
  state.searchQuery = e.target.value;
  const clearBtn = document.getElementById('searchClear');
  if (state.searchQuery) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }
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
  // Sidebar
  document.getElementById('btnAddSection').addEventListener('click', promptAddSection);

  // Content header
  document.getElementById('btnAddText').addEventListener('click', promptAddText);
  document.getElementById('searchInput').addEventListener('input', onSearch);
  document.getElementById('searchClear').addEventListener('click', clearSearch);

  // Modal buttons
  document.getElementById('modalSave').addEventListener('click', submitModal);
  document.getElementById('modalCancel').addEventListener('click', closeModal);

  // Close modal on backdrop click
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });

  // Global keyboard shortcuts
  document.addEventListener('keydown', e => {
    // Escape closes modal if open
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
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

function init() {
  injectStaticIcons();
  load();
  setupEvents();

  // Auto-select the most-used section on first load
  if (!state.selectedId && state.sections.length > 0) {
    state.selectedId = sortedSections()[0].id;
  }

  render();
}

document.addEventListener('DOMContentLoaded', init);
