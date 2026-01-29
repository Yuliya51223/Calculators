// main.js — расчёт ТОЛЬКО по кнопкам "Рассчитать"
document.addEventListener('DOMContentLoaded', () => {
  // ============================================================
  // 1) КАЛЬКУЛЯТОР ОСНОВНОЙ ПРОДУКЦИИ
  // ============================================================
  const useCase = document.getElementById('useCase');

  const blockRoof = document.getElementById('block-roof');
  const blockFence = document.getElementById('block-fence');
  const blockFacade = document.getElementById('block-facade');

  const wInput = document.getElementById('w'); // м
  const lInput = document.getElementById('l'); // м

  const roofType = document.getElementById('roofType');
  const roofProfile = document.getElementById('roofProfile');

  const fenceType = document.getElementById('fenceType');
  const fenceProfile = document.getElementById('fenceProfile');

  const facadeType = document.getElementById('facadeType');
  const facadeProfile = document.getElementById('facadeProfile');

  const gapWrap = document.getElementById('gap-wrap');
  const gapInput = document.getElementById('gap');

  const calcBtn = document.getElementById('calcBtn');
  const outEl = document.getElementById('area');
  const errEl = document.getElementById('err');

  function setOptions(selectEl, items, placeholder) {
    selectEl.innerHTML = '';
    const ph = document.createElement('option');
    ph.value = '';
    ph.textContent = placeholder;
    selectEl.appendChild(ph);

    items.forEach(({ value, text }) => {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = text;
      selectEl.appendChild(opt);
    });
  }

  const productSizes = {
    supermonterrey: { full: 1180, work: 1100 },
    gerkules:       { full: 1200, work: 1150 },
    kaskad:         { full: 1195, work: 1130 },

    c8:   { full: 1200, work: 1150 },
    ns16: { full: 1150, work: 1100 },
    k20:  { full: 1195, work: 1130 },
    s20:  { full: 1150, work: 1100 },
    s21:  { full: 1051, work: 1000 },
    ns35: { full: 1060, work: 1000 },
    n60:  { full:  902, work:  845 },
    n75:  { full:  800, work:  750 },

    falc: { full: 562, work: 550 },

    korabelnaya_doska: { full: 267, work: 236 },
    evrobrus:          { full: 359, work: 340 },
    l_brus:            { full: 264, work: 240 },
    blok_haus:         { full: 383, work: 355 },
    linepro:           { full: 200, work: 176 },

    europlanka:          { work: 126 },
    europlanka_prestige: { work: 131 },
    eurotrapezia:        { work: 117 },
    m_prestige:          { work: 118 }
  };

  const roofMetalTileProfiles = [
    { value: 'supermonterrey', text: 'Супермонтеррей' },
    { value: 'gerkules', text: 'Геркулес' },
    { value: 'kaskad', text: 'Каскад' }
  ];

  const roofProfnastilProfiles = [
    { value: 's20', text: 'С20' },
    { value: 's21', text: 'С21' },
    { value: 'k20', text: 'К20' },
    { value: 'ns35', text: 'НС35' },
    { value: 'n60', text: 'Н60' },
    { value: 'n75', text: 'Н75' }
  ];

  const fenceProfnastilProfiles = [
    { value: 'c8', text: 'С8' },
    { value: 'ns16', text: 'НС16' },
    { value: 's20', text: 'С20' },
    { value: 's21', text: 'С21' },
    { value: 'k20', text: 'К20' },
    { value: 'ns35', text: 'НС35' },
    { value: 'n60', text: 'Н60' },
    { value: 'n75', text: 'Н75' }
  ];

  const fenceShtaketnikProfiles = [
    { value: 'europlanka', text: 'Европланка' },
    { value: 'europlanka_prestige', text: 'Европланка Престиж' },
    { value: 'eurotrapezia', text: 'Евротрапеция' },
    { value: 'm_prestige', text: 'М-образный Престиж' }
  ];

  const sidingProfiles = [
    { value: 'korabelnaya_doska', text: 'Корабельная доска' },
    { value: 'evrobrus', text: 'Евробрус' },
    { value: 'l_brus', text: 'Л-брус' },
    { value: 'blok_haus', text: 'Блок-хаус' },
    { value: 'linepro', text: 'ЛайнПро' }
  ];

  const facadeProfnastilProfiles = [
    { value: 'c8', text: 'С8' },
    { value: 'ns16', text: 'НС16' },
    { value: 'k20', text: 'К20' },
    { value: 's20', text: 'С20' },
    { value: 's21', text: 'С21' }
  ];

  function resetResult() {
    outEl.textContent = '—';
    errEl.textContent = '';
  }

  function resetRoofProfile() {
    roofProfile.disabled = true;
    roofProfile.innerHTML = '<option value="">— выберите тип кровли —</option>';
    roofProfile.value = '';
  }
  function resetFenceProfile() {
    fenceProfile.disabled = true;
    fenceProfile.innerHTML = '<option value="">— выберите тип забора —</option>';
    fenceProfile.value = '';
  }
  function resetFacadeProfile() {
    facadeProfile.disabled = true;
    facadeProfile.innerHTML = '<option value="">— выберите тип фасада —</option>';
    facadeProfile.value = '';
  }

  function hideAllBlocks() {
    blockRoof.classList.add('hidden');
    blockFence.classList.add('hidden');
    blockFacade.classList.add('hidden');
  }

  function renderBlocks() {
    hideAllBlocks();

    roofType.value = '';
    resetRoofProfile();

    fenceType.value = '';
    resetFenceProfile();

    facadeType.value = '';
    resetFacadeProfile();

    gapWrap.classList.add('hidden');
    gapInput.value = '0';

    if (useCase.value === 'roof') blockRoof.classList.remove('hidden');
    if (useCase.value === 'fence') blockFence.classList.remove('hidden');
    if (useCase.value === 'facade') blockFacade.classList.remove('hidden');

    resetResult();
  }

  function renderRoofProfile() {
    resetRoofProfile();

    if (roofType.value === 'metal_tile') {
      roofProfile.disabled = false;
      setOptions(roofProfile, roofMetalTileProfiles, '— выберите профиль —');
    } else if (roofType.value === 'profnastil') {
      roofProfile.disabled = false;
      setOptions(roofProfile, roofProfnastilProfiles, '— выберите профиль —');
    }

    resetResult();
  }

  function renderFenceProfile() {
    resetFenceProfile();
    gapWrap.classList.add('hidden');
    gapInput.value = '0';

    if (fenceType.value === 'profnastil') {
      fenceProfile.disabled = false;
      setOptions(fenceProfile, fenceProfnastilProfiles, '— выберите профиль —');
    } else if (fenceType.value === 'shtaketnik') {
      fenceProfile.disabled = false;
      setOptions(fenceProfile, fenceShtaketnikProfiles, '— выберите профиль —');
      gapWrap.classList.remove('hidden');
    } else if (fenceType.value === 'siding') {
      fenceProfile.disabled = false;
      setOptions(fenceProfile, sidingProfiles, '— выберите профиль —');
    }

    resetResult();
  }

  function renderFacadeProfile() {
    resetFacadeProfile();

    if (facadeType.value === 'profnastil') {
      facadeProfile.disabled = false;
      setOptions(facadeProfile, facadeProfnastilProfiles, '— выберите профиль —');
    } else if (facadeType.value === 'siding') {
      facadeProfile.disabled = false;
      setOptions(facadeProfile, sidingProfiles, '— выберите профиль —');
    }

    resetResult();
  }

  function getSelectedProfileKey() {
    if (useCase.value === 'roof') {
      if (roofType.value === 'falc') return 'falc';
      return roofProfile.value || '';
    }
    if (useCase.value === 'fence') return fenceProfile.value || '';
    if (useCase.value === 'facade') return facadeProfile.value || '';
    return '';
  }

  function calc1() {
    errEl.textContent = '';
    outEl.textContent = '—';

    const w_m = Number(wInput.value);
    const l_m = Number(lInput.value);

    if (!isFinite(w_m) || w_m <= 0) {
      errEl.textContent = 'Введите длину (м) больше 0';
      return;
    }

    const key = getSelectedProfileKey();
    if (!key) {
      errEl.textContent = 'Выберите тип и профиль';
      return;
    }

    const work = productSizes[key]?.work;
    if (!work || work <= 0) {
      errEl.textContent = 'Для выбранного профиля не задана рабочая ширина';
      return;
    }

    const w_mm = w_m * 1000;
    const l_mm = l_m * 1000;

    let lengthToUse = w_mm;

    const isSiding =
      (useCase.value === 'fence' && fenceType.value === 'siding') ||
      (useCase.value === 'facade' && facadeType.value === 'siding');

    if (isSiding && key !== 'linepro') {
      if (!isFinite(l_m) || l_m <= 0) {
        errEl.textContent = 'Для сайдинга укажите высоту фасада (м) больше 0';
        return;
      }
      lengthToUse = l_mm;
    }

    let step = work;
    if (useCase.value === 'fence' && fenceType.value === 'shtaketnik') {
      const gap = Number(gapInput.value) || 0;
      step = work + Math.max(0, gap);
    }

    const qty = Math.ceil(lengthToUse / step);
    outEl.textContent = String(qty);
  }

  useCase.addEventListener('change', renderBlocks);
  roofType.addEventListener('change', renderRoofProfile);
  fenceType.addEventListener('change', renderFenceProfile);
  facadeType.addEventListener('change', renderFacadeProfile);

  roofProfile.addEventListener('change', resetResult);
  fenceProfile.addEventListener('change', resetResult);
  facadeProfile.addEventListener('change', resetResult);

  wInput.addEventListener('input', resetResult);
  lInput.addEventListener('input', resetResult);
  gapInput.addEventListener('input', resetResult);

  calcBtn.addEventListener('click', calc1);

  hideAllBlocks();
  resetRoofProfile();
  resetFenceProfile();
  resetFacadeProfile();
  resetResult();

  // ============================================================
  // 2) КАЛЬКУЛЯТОР ЖАЛЮЗИЙНОГО ЗАБОРА (СЕКЦИИ + ТАБЛИЦА)
  // ============================================================
  const sectionsWrap = document.getElementById('sectionsWrap');
  const addSectionBtn = document.getElementById('addSectionBtn');
  const jCalcBtn = document.getElementById('j_calcBtn');
  const jErr = document.getElementById('j_err');
  const jTableWrap = document.getElementById('j_tableWrap');
const jPdfBtn = document.getElementById('j_pdfBtn');

// последнее рассчитанное (для PDF)
let lastSectionsData = null;
let lastFinalAgg = null;

  // Если второй калькулятор отсутствует на странице — просто выходим
  if (!sectionsWrap || !addSectionBtn || !jCalcBtn || !jErr || !jTableWrap) return;
if (!sectionsWrap || !addSectionBtn || !jCalcBtn || !jErr || !jTableWrap || !jPdfBtn) return;

  let sectionIndex = 0;

  const BOM_ITEMS = [
    { key: 'lamel', label: 'Ламель Хоста' },
    { key: 'stoyka', label: 'Стойка' },
    { key: 'krepezh', label: 'Крепежная планка' },
    { key: 'kryshka', label: 'Крышка' },
    { key: 'dekor', label: 'Декоративная\nнакладка' },
    { key: 'dekor_ugol', label: 'Декоративная\nнакладка угловая' },
    { key: 'finish', label: 'Планка завершающая' },
    { key: 'profftruba', label: 'Профтруба' },
    { key: 'screw_stoyka', label: 'Саморезы (для стойки)' },
    { key: 'screw_psh', label: 'Саморезы ПШ (для ламелей и добора)' }
  ];

  const jHeights = [
    0.48,0.58,0.67,0.77,0.86,0.96,1.05,1.15,1.24,1.34,
    1.43,1.53,1.62,1.72,1.81,1.91,2.00,2.10,2.19,2.29,
    2.38,2.48,2.57,2.67,2.76,2.86,2.95,3.05,3.14,3.24,
    3.33,3.43,3.52,3.62,3.71,3.81,3.90,4.00
  ];

  const jDepths = [];
  for (let d = 0.3; d <= 1.5001; d += 0.1) jDepths.push(d.toFixed(1));

  function optionsHTML(values, placeholder){
    let html = `<option value="">${placeholder}</option>`;
    values.forEach(v => {
      html += `<option value="${v}">${String(v).replace('.', ',')}</option>`;
    });
    return html;
  }

  function updateSectionTitles(){
    const sections = sectionsWrap.querySelectorAll('.section');
    sections.forEach((sec, idx) => {
      const title = sec.querySelector('.section-title');
      if (title) title.textContent = `Секция ${idx + 1} — исходные параметры`;

      const removeBtn = sec.querySelector('.remove-section');
      if (removeBtn) removeBtn.style.display = idx === 0 ? 'none' : 'inline-block';
    });
    sectionIndex = sections.length;
  }

  function createSection(){
    sectionIndex++;

    const div = document.createElement('div');
    div.className = 'section';

    div.innerHTML = `
      <div class="section-header">
        <h3 class="section-title">Секция ${sectionIndex} — исходные параметры</h3>
        <button type="button" class="remove-section">Удалить секцию</button>
      </div>

      <div class="grid3">
        <div class="col">
          <div class="field">
            <label>Наименование забора</label>
            <select class="j_name">
              <option value="">— выберите —</option>
              <option value="yukka">Юкка</option>
              <option value="hosta">Хоста</option>
            </select>
          </div>

          <div class="field">
            <label>Высота забора (м)</label>
            <select class="j_height" disabled>
              ${optionsHTML(jHeights, '— выберите высоту —')}
            </select>
          </div>

          <div class="field">
            <label>Количество секций</label>
            <input class="j_sections" type="number" min="1" step="1">
          </div>
        </div>

        <div class="col">
          <div class="field">
            <label>Расстояние между столбов (м) <span class="hint">(от 0,5 до 3 м)</span></label>
            <input class="j_span" type="number" min="0.5" max="3" step="0.01">
          </div>

          <div class="field">
            <label>Количество углов 90°</label>
            <input class="j_corners" type="number" min="0" step="1">
          </div>

          <div class="field">
            <label>Кирпичные/Бетонные столбы</label>
            <select class="j_brick">
              <option value="">— выберите —</option>
              <option value="no">Нет</option>
              <option value="yes">Да</option>
            </select>
          </div>
        </div>

        <div class="col">
          <div class="field">
            <label>Размер профтрубы</label>
            <select class="j_pipe">
              <option value="">— выберите —</option>
              <option value="none">нет</option>
              <option value="60x60">60×60</option>
              <option value="80x80">80×80</option>
            </select>
          </div>

          <div class="field">
            <label>Заглубление столба (м)</label>
            <select class="j_depth">
              ${optionsHTML(jDepths, '— выберите —')}
            </select>
          </div>
        </div>
      </div>
    `;

    sectionsWrap.appendChild(div);

    // высота доступна только после выбора наименования
    const nameSel = div.querySelector('.j_name');
    const heightSel = div.querySelector('.j_height');
    nameSel.addEventListener('change', () => {
      heightSel.disabled = !nameSel.value;
      if (!nameSel.value) heightSel.value = '';
      jResetOutput();
    });

    // удаление секции
    const removeBtn = div.querySelector('.remove-section');
    removeBtn.addEventListener('click', () => {
      div.remove();
      updateSectionTitles();
      jResetOutput();
    });

    // очистка результата при изменениях
    div.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', jResetOutput);
      el.addEventListener('change', jResetOutput);
    });

    updateSectionTitles();
  }

  function jResetOutput(){
  jTableWrap.innerHTML = '';
  jErr.textContent = '';
  jPdfBtn.classList.add('hidden');
  lastSectionsData = null;
  lastFinalAgg = null;
}


  // первая секция при загрузке
  createSection();

  // кнопка "Добавить секцию"
  addSectionBtn.addEventListener('click', () => createSection());

  // ===== РЕНДЕР ТАБЛИЦЫ =====
  function esc(s){
    return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  }
  function fmtSizeCell(v){
    if (v === null || v === undefined || v === '') return '—';
    return esc(String(v)).replaceAll('.', ',');
  }
  function fmtQtyCell(v){
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (!isFinite(n)) return '—';
    return String(Math.round(n));
  }

  function renderBOMTable(agg){
    const cols1 = BOM_ITEMS.map(it => {
      const title = esc(it.label).replaceAll('\n','<br>');
      return `<th colspan="2">${title}</th>`;
    }).join('');

    const cols2 = BOM_ITEMS.map(() =>
      `<th class="subhead">Размер, м</th><th class="subhead">Кол-во, шт</th>`
    ).join('');

    const maxRows = Math.max(1, ...BOM_ITEMS.map(it => (agg[it.key]?.length || 0)));

    let body = '';
    for (let r = 0; r < maxRows; r++){
      const tds = BOM_ITEMS.map(it => {
        const rec = agg[it.key]?.[r];
        const size = rec ? rec.size : '—';
        const qty  = rec ? rec.qty  : '—';
        return `<td>${fmtSizeCell(size)}</td><td>${fmtQtyCell(qty)}</td>`;
      }).join('');
      body += `<tr>${tds}</tr>`;
    }

    jTableWrap.innerHTML = `
      <div class="table-wrap">
        <table class="bom">
          <thead>
            <tr>${cols1}</tr>
            <tr>${cols2}</tr>
          </thead>
          <tbody>${body}</tbody>
        </table>
      </div>
    `;
  }

  // ===== ДАННЫЕ СЕКЦИЙ =====
  function getAllSectionsData(){
    const sections = Array.from(sectionsWrap.querySelectorAll('.section'));
    return sections.map(sec => {
      const name = sec.querySelector('.j_name')?.value || '';
      const height = Number((sec.querySelector('.j_height')?.value || '').replace(',', '.'));
      const span = Number(sec.querySelector('.j_span')?.value);
      const sectionsQty = Number(sec.querySelector('.j_sections')?.value);
      const corners = Number(sec.querySelector('.j_corners')?.value);
      const brick = sec.querySelector('.j_brick')?.value || '';
      const pipe = sec.querySelector('.j_pipe')?.value || ''; // none / 60x60 / 80x80
      const depth = Number((sec.querySelector('.j_depth')?.value || '').replace(',', '.'));
      return { name, height, span, sectionsQty, corners, brick, pipe, depth };
    });
  }

  function roundToCmMeters(x){ return Number(x.toFixed(2)); } // до 0,01 м

  function sizeByHeight(h){
    if (h <= 2) return 2;
    if (h <= 3) return 3;
    return Math.ceil(h);
  }
  function sizeBySpan(span){
    if (span <= 2) return 2;
    if (span <= 3) return 3;
    return Math.ceil(span);
  }

  function addAgg(agg, key, size, qty){
    if (qty === 0 || qty === null || qty === undefined) return;
    const s = String(size);
    if (!agg[key]) agg[key] = new Map();
    const prev = agg[key].get(s) || 0;
    agg[key].set(s, prev + qty);
  }

  function finalizeAgg(agg){
    const out = {};
    BOM_ITEMS.forEach(it => {
      const map = agg[it.key] || new Map();
      const arr = Array.from(map.entries()).map(([size, qty]) => ({ size, qty }));

      arr.sort((a,b) => {
        const na = Number(String(a.size).replace(',', '.'));
        const nb = Number(String(b.size).replace(',', '.'));
        const aNum = isFinite(na);
        const bNum = isFinite(nb);
        if (aNum && bNum) return na - nb;
        if (aNum && !bNum) return -1;
        if (!aNum && bNum) return 1;
        return String(a.size).localeCompare(String(b.size), 'ru');
      });

      out[it.key] = arr;
    });
    return out;
  }

  // ===== РАСЧЁТ ПО ФОРМУЛАМ =====
  function jCalc(){
    jResetOutput();

    const data = getAllSectionsData();
    if (!data.length) {
      jErr.textContent = 'Нет секций для расчёта';
      return;
    }

    // валидация
    for (let i = 0; i < data.length; i++) {
      const s = data[i];
      const idx = i + 1;

      if (!s.name) { jErr.textContent = `Секция ${idx}: выберите наименование`; return; }
      if (!isFinite(s.height) || s.height <= 0) { jErr.textContent = `Секция ${idx}: выберите высоту`; return; }
      if (!isFinite(s.span) || s.span < 0.5 || s.span > 3) { jErr.textContent = `Секция ${idx}: расстояние между столбов 0,5–3 м`; return; }
      if (!Number.isInteger(s.sectionsQty) || s.sectionsQty <= 0) { jErr.textContent = `Секция ${idx}: количество секций — целое > 0`; return; }
      if (!Number.isInteger(s.corners) || s.corners < 0) { jErr.textContent = `Секция ${idx}: углы — целое ≥ 0`; return; }
      if (!s.brick) { jErr.textContent = `Секция ${idx}: выберите кирпичные/бетонные столбы`; return; }
      if (!s.pipe) { jErr.textContent = `Секция ${idx}: выберите размер профтрубы`; return; }
      if (!isFinite(s.depth) || s.depth < 0.3 || s.depth > 1.5) { jErr.textContent = `Секция ${idx}: заглубление 0,3–1,5 м`; return; }
    }

    const agg = {};

    data.forEach(s => {
      // Ламели
      const lamelSize = roundToCmMeters(s.span - 0.01);
      const lamelQty = Math.floor(s.height / 0.095 * s.sectionsQty);
      addAgg(agg, 'lamel', lamelSize, lamelQty);

      // Стойка
      const stoykaSize = sizeByHeight(s.height);
      const stoykaQty = s.sectionsQty * 2;
      addAgg(agg, 'stoyka', stoykaSize, stoykaQty);

      // Крепежная планка
      const krepezhSize = sizeByHeight(s.height);
      const krepezhQty = krepezhSize * s.sectionsQty; // как в вашем примере
      addAgg(agg, 'krepezh', krepezhSize, krepezhQty);

      // Крышка
      const kryshkaSize = sizeBySpan(s.span);
      const kryshkaQty = s.sectionsQty;
      addAgg(agg, 'kryshka', kryshkaSize, kryshkaQty);

      // Декоративная накладка (если столбы НЕ кирп/бетон)
      if (s.brick === 'no') {
        const dekorSize = sizeByHeight(s.height);
        const dekorQty = (s.sectionsQty + 1) * 2 - (s.corners * 2);
        addAgg(agg, 'dekor', dekorSize, dekorQty);
      }

      // Угловая декоративная накладка (если углы > 0)
      if (s.corners > 0) {
        const dekorUSize = sizeByHeight(s.height);
        const dekorUQty = s.corners;
        addAgg(agg, 'dekor_ugol', dekorUSize, dekorUQty);
      }

      // Планка завершающая
      const finishSize = sizeBySpan(s.span);
      const finishQty = s.sectionsQty;
      addAgg(agg, 'finish', finishSize, finishQty);

      // Профтруба (если выбрано не "нет")
      let profftrubaQty = 0;
      if (s.pipe !== 'none') {
        profftrubaQty = Math.ceil((2 * (s.height + s.depth)) / 6);
        addAgg(agg, 'profftruba', 6, profftrubaQty);
      }

      // Саморезы для стойки
      addAgg(agg, 'screw_stoyka', '5.5x19', stoykaQty * 5);

      // Саморезы ПШ
      const screwPSHQty =
        (lamelQty * 4) +
        (krepezhQty * lamelQty) +
        (kryshkaQty * 4) +
        (finishQty * 2) +
        (finishQty * krepezhQty);

      addAgg(agg, 'screw_psh', '4.2x16', screwPSHQty);
    });

    const finalAgg = finalizeAgg(agg);
    renderBOMTable(finalAgg);
    lastSectionsData = data;
lastFinalAgg = finalAgg;
jPdfBtn.classList.remove('hidden');
  }
function buildBomRows(finalAgg){
  const maxRows = Math.max(1, ...BOM_ITEMS.map(it => (finalAgg[it.key]?.length || 0)));

  const rows = [];
  for (let r = 0; r < maxRows; r++){
    const row = [];
    BOM_ITEMS.forEach(it => {
      const rec = finalAgg[it.key]?.[r];
      row.push(rec ? String(rec.size).replace('.', ',') : '—');
      row.push(rec ? String(Math.round(rec.qty)) : '—');
    });
    rows.push(row);
  }
  return rows;
}

function downloadJaluziPdf(){
  if (!lastSectionsData || !lastFinalAgg) return;

  const jsPDF = window.jspdf?.jsPDF;
  if (!jsPDF) {
    jErr.textContent = 'PDF не может быть создан: jsPDF не загружен';
    return;
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // подключаем Montserrat
  let fontB64 = window.__PDF_FONT_MONTSERRAT__;
  if (!fontB64) {
    jErr.textContent = 'Не найден шрифт Montserrat (fonts.js)';
    return;
  }
  fontB64 = fontB64.replace(/\s+/g, ''); // на всякий случай убираем переносы/пробелы

  doc.addFileToVFS('Montserrat-Regular.ttf', fontB64);
  doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'normal');

  // базовые настройки + заголовок (ВАЖНО: НЕ переключаемся на helvetica)
  doc.setFont('Montserrat', 'normal');
  doc.setFontSize(12);
  doc.text('Расчёт жалюзийного забора', 14, 12);

  // ===== Таблица введённых данных по секциям =====
  const secHead = [[
    'Секция', 'Наименование', 'Высота, м', 'Расст. между, м', 'Секций, шт', 'Углы 90°, шт',
    'Кирп/бетон', 'Проф труба', 'Заглубление, м'
  ]];

  const secBody = lastSectionsData.map((s, i) => ([
    String(i + 1),
    s.name === 'yukka' ? 'Юкка' : (s.name === 'hosta' ? 'Хоста' : s.name),
    String(s.height).replace('.', ','),
    String(s.span).replace('.', ','),
    String(s.sectionsQty),
    String(s.corners),
    s.brick === 'yes' ? 'Да' : 'Нет',
    s.pipe === 'none' ? 'нет' : (s.pipe === '60x60' ? '60×60' : (s.pipe === '80x80' ? '80×80' : s.pipe)),
    String(s.depth).replace('.', ',')
  ]));

  doc.autoTable({
  head: secHead,          // или [head1, head2] во второй таблице
  body: secBody,          // или bomBody
  startY: 16,             // для второй таблицы используйте startY: y
  theme: 'grid',

  styles: {
    font: 'Montserrat',
    fontSize: 8,
    cellPadding: 2,
    halign: 'center',
    valign: 'middle',

    lineColor: [0, 0, 0],   // ← ЧЁРНЫЕ линии
    lineWidth: 0.2          // ← толщина линий
  },

  headStyles: {
    font: 'Montserrat',
    fillColor: [220, 220, 220], // светло-серый заголовок
    textColor: [0, 0, 0],
    lineColor: [0, 0, 0],
    lineWidth: 0.3,
    fontSize: 8
  },

  alternateRowStyles: {
    fillColor: [245, 245, 245]  // ← чередование строк
  },

  margin: { left: 14, right: 14 }
});


  let y = doc.lastAutoTable.finalY + 8;

  // ===== Таблица расчёта (колонка-группами) =====
  const head1 = BOM_ITEMS.map(it => ({
    content: it.label.replace('\n', ' '),
    colSpan: 2,
    styles: { halign: 'center' }
  }));

  const head2 = [];
  BOM_ITEMS.forEach(() => {
    head2.push('Размер, м');
    head2.push('Кол-во, шт');
  });

  const bomBody = buildBomRows(lastFinalAgg);

  doc.autoTable({
  startY: y,
  head: [head1, head2],
  body: bomBody,
  theme: 'grid',

  styles: {
    font: 'Montserrat',
    fontSize: 7,
    cellPadding: 1.6,
    halign: 'center',
    valign: 'middle',

    lineColor: [0, 0, 0],
    lineWidth: 0.2
  },

  headStyles: {
    font: 'Montserrat',
    fillColor: [220, 220, 220],
    textColor: [0, 0, 0],
    lineColor: [0, 0, 0],
    lineWidth: 0.3,
    fontSize: 7
  },

  alternateRowStyles: {
    fillColor: [245, 245, 245]
  },

  margin: { left: 14, right: 14 },
  tableWidth: 'auto'
});


  doc.save('raschet-zhalyuzi.pdf');
}


jPdfBtn.addEventListener('click', downloadJaluziPdf);

  jCalcBtn.addEventListener('click', jCalc);
});
