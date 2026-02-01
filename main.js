// main.js — расчёт ТОЛЬКО по кнопкам "Рассчитать"
document.addEventListener('DOMContentLoaded', () => {
  // ============================================================
  // 0) ВЫБОР КАЛЬКУЛЯТОРА (показываем только выбранный)
  // ============================================================
  const calcSelect = document.getElementById('calcSelect');
  const calcItems = Array.from(document.querySelectorAll('section.calc-item[data-calc]'));

  function calcTitle(sec){
    const h2 = sec.querySelector('h2');
    return (h2 ? h2.textContent.trim() : sec.dataset.calc);
  }

  function hideAllCalcItems(){
    calcItems.forEach(sec => sec.classList.add('hidden'));
  }

  function showCalc(key){
    hideAllCalcItems();
    const sec = calcItems.find(s => s.dataset.calc === key);
    if (sec) sec.classList.remove('hidden');
  }

  // наполняем список
  if (calcSelect && calcItems.length){
    calcSelect.innerHTML = '<option value="">— выберите —</option>' +
      calcItems.map(sec => `<option value="${sec.dataset.calc}">${calcTitle(sec)}</option>`).join('');

    // старт: всё скрыто
    hideAllCalcItems();

    calcSelect.addEventListener('change', () => {
      if (!calcSelect.value){
        hideAllCalcItems();
      } else {
        showCalc(calcSelect.value);
      }
    });
  }
  

  
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


// =====================
// 3) Арочный штакетник (БЕЗ СХЕМЫ ВООБЩЕ: ни на сайте, ни в PDF)
// =====================
const aSpan = document.getElementById('a_span');
const aEdgeH = document.getElementById('a_edge_h');
const aCenterH = document.getElementById('a_center_h');
const aPlankW = document.getElementById('a_plank_w');
const aGap = document.getElementById('a_gap');
const aChess = document.getElementById('a_chess');

const aCalcBtn = document.getElementById('a_calcBtn');
const aPdfBtn  = document.getElementById('a_pdfBtn');

const aQtyEl = document.getElementById('a_qty');
const aMinEl = document.getElementById('a_min');
const aMaxEl = document.getElementById('a_max');
const aErrEl = document.getElementById('a_err');
const aTableWrap = document.getElementById('a_tableWrap');
const aSummaryWrap = document.getElementById('a_summaryWrap');

let aLastInput = null;
let aLastRow1 = null;
let aLastRow2 = null;
let aLastSummaryRows = null; // [{h, qty}]

function aReset(){
  if (aQtyEl) aQtyEl.textContent = '—';
  if (aMinEl) aMinEl.textContent = '—';
  if (aMaxEl) aMaxEl.textContent = '—';
  if (aErrEl) aErrEl.textContent = '';
  if (aTableWrap) aTableWrap.innerHTML = '';
  if (aSummaryWrap) aSummaryWrap.innerHTML = '';
  if (aPdfBtn) aPdfBtn.classList.add('hidden');

  aLastInput = null;
  aLastRow1 = null;
  aLastRow2 = null;
  aLastSummaryRows = null;
}

function roundToCm(mm){
  return Math.round(mm / 10) * 10; // 1 см
}

// ====== ВЫСОТА ПО ФОРМУЛАМ EXCEL (r, d) ======
function arcHeightAtX(span, edgeH, centerH, x){
  const f = centerH - edgeH;
  const a = span / 2;

  if (!isFinite(f) || Math.abs(f) < 1e-9) return edgeH;

  const r = (span * span) / (8 * f) + (f / 2);
  const d = Math.sqrt(Math.max(0, r * r - a * a));

  const under = r * r - x * x;
  if (under <= 0) return edgeH;

  return edgeH + (Math.sqrt(under) - d);
}

// ====== РЯД (float -> сглаживание -> -10 -> центр -> округление) ======
function buildPickersExcelSmooth(span, edgeH, centerH, plankW, gap, offset){
  const list = [];
  const P = plankW + gap;
  if (!isFinite(P) || P <= 0) return list;

  // Excel: N = floor((span + gap) / (plankW + gap))
  const Nraw = (span + gap) / (plankW + gap);
  const N = Math.floor(Nraw);
  if (N <= 0) return list;

  const a = span / 2;

  // 1) сырые высоты
  const raw = [];
  for (let i = 0; i < N; i++){
    const pos = (plankW / 2) + i * P + offset;
    const x = pos - a;
    let h = arcHeightAtX(span, edgeH, centerH, x);
    if (i === 0 || i === N - 1) h = edgeH;
    raw.push(h);
  }

  // 2) сглаживание (2 прохода)
  let smooth = raw.slice();
  for (let pass = 0; pass < 2; pass++){
    const tmp = smooth.slice();
    for (let i = 1; i < N - 1; i++){
      tmp[i] = (smooth[i - 1] + smooth[i] + smooth[i + 1]) / 3;
    }
    tmp[0] = edgeH;
    tmp[N - 1] = edgeH;
    smooth = tmp;
  }

  // 3) -10 мм всем кроме первой/последней
  for (let i = 1; i < N - 1; i++){
    smooth[i] -= 10;
  }

  // 4) центр(а) = высоте по центру
  const mid1 = Math.floor((N - 1) / 2);
  const mid2 = Math.ceil((N - 1) / 2);
  if (mid1 !== 0 && mid1 !== N - 1) smooth[mid1] = centerH;
  if (mid2 !== 0 && mid2 !== N - 1) smooth[mid2] = centerH;

  // 5) не выше центра + округление
  const centerRounded = roundToCm(centerH);
  const edgeRounded = roundToCm(edgeH);

  for (let i = 0; i < N; i++){
    let h = smooth[i];
    if (h > centerH) h = centerH;
    if (h < 0) h = 0;

    h = roundToCm(h);

    if (i === 0 || i === N - 1) h = edgeRounded;
    if (i === mid1 || i === mid2) h = centerRounded;

    list.push(h);
  }

  return list;
}

function renderArchedTable(rowA, rowB){
  if (!aTableWrap) return;

  let html = `
    <table class="small-table">
      <thead>
        <tr>
          <th>№</th>
          <th>Высота (ряд 1), мм</th>
          <th>Высота (ряд 2), мм</th>
        </tr>
      </thead>
      <tbody>
  `;

  const maxN = Math.max(rowA.length, rowB.length, 1);
  for (let i = 0; i < maxN; i++){
    html += `
      <tr>
        <td>${i + 1}</td>
        <td>${rowA[i] ?? '—'}</td>
        <td>${rowB[i] ?? '—'}</td>
      </tr>
    `;
  }

  html += `</tbody></table>`;
  aTableWrap.innerHTML = html;
}

// ====== СВОДКА (объединяем одинаковые размеры) ======
function renderArchedSummaryGrouped(row1, row2, chess){
  if (!aSummaryWrap) return [];

  const N = row1.length;
  const map = new Map();

  for (let i = 0; i < N; i++){
    const h = row1[i];
    if (h == null) continue;

    let qty = chess ? (row2[i] != null ? 2 : 1) : 1;

    // нечётное N -> последняя = 1
    if (chess && (N % 2 === 1) && i === N - 1) qty = 1;

    map.set(h, (map.get(h) || 0) + qty);
  }

  const rows = Array.from(map.entries())
    .map(([h, qty]) => ({ h: Number(h), qty }))
    .sort((a,b) => a.h - b.h);

  const body = rows.map(r => `
    <tr>
      <td>${r.h}</td>
      <td>${r.qty}</td>
    </tr>
  `).join('');

  aSummaryWrap.innerHTML = `
    <table class="small-table" style="max-width:520px;">
      <thead>
        <tr>
          <th>Высота H(x), мм</th>
          <th>${chess ? 'Кол-во (шахматка), шт' : 'Кол-во, шт'}</th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>
  `;

  return rows;
}

function aCalc(){
  aReset();

  const span = Number(aSpan?.value);
  const edgeH = Number(aEdgeH?.value);
  const centerH = Number(aCenterH?.value);
  const plankW = Number(aPlankW?.value);
  const gap = Number(aGap?.value);
  const chess = aChess?.value === 'yes';

  if (!isFinite(span) || span <= 0) { if(aErrEl) aErrEl.textContent = 'Введите ширину пролёта (мм) > 0'; return; }
  if (!isFinite(edgeH) || edgeH <= 0) { if(aErrEl) aErrEl.textContent = 'Введите высоту у стоек (мм) > 0'; return; }
  if (!isFinite(centerH) || centerH <= 0) { if(aErrEl) aErrEl.textContent = 'Введите высоту по центру (мм) > 0'; return; }
  if (!isFinite(plankW) || plankW <= 0) { if(aErrEl) aErrEl.textContent = 'Выберите ширину планки'; return; }
  if (!isFinite(gap) || gap < 0) { if(aErrEl) aErrEl.textContent = 'Зазор не может быть отрицательным'; return; }

  const P = plankW + gap;
  if (P <= 0) { if(aErrEl) aErrEl.textContent = 'Ширина планки + зазор должны быть > 0'; return; }

  const row1 = buildPickersExcelSmooth(span, edgeH, centerH, plankW, gap, 0);
  let row2 = chess ? buildPickersExcelSmooth(span, edgeH, centerH, plankW, gap, P / 2) : [];

  // для шахматки: если получилось столько же, а N нечётное — последнюю во 2 ряду убираем
  if (chess && (row1.length % 2 === 1) && row2.length === row1.length) row2.pop();

  const all = row1.concat(row2);
  const qty = chess ? (row1.length + row2.length) : row1.length;

  const minH = all.length ? Math.min(...all) : 0;
  const maxH = all.length ? Math.max(...all) : 0;

  if (aQtyEl) aQtyEl.textContent = String(qty);
  if (aMinEl) aMinEl.textContent = String(minH);
  if (aMaxEl) aMaxEl.textContent = String(maxH);

  renderArchedTable(row1, row2);
  const summaryRows = renderArchedSummaryGrouped(row1, row2, chess);

  aLastInput = { span, edgeH, centerH, plankW, gap, chess };
  aLastRow1 = row1.slice();
  aLastRow2 = row2.slice();
  aLastSummaryRows = summaryRows;

  if (aPdfBtn) aPdfBtn.classList.remove('hidden');
}

// ===== PDF (БЕЗ СХЕМЫ) =====
function downloadArchedPdf(){
  if (!aLastInput || !aLastSummaryRows) return;

  const jsPDF = window.jspdf?.jsPDF;
  if (!jsPDF) {
    if (aErrEl) aErrEl.textContent = 'PDF не может быть создан: jsPDF не загружен';
    return;
  }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Montserrat (если есть fonts.js)
  const fontB64 = window.__PDF_FONT_MONTSERRAT__;
  const hasMontserrat = !!fontB64;
  if (hasMontserrat) {
    try {
      doc.addFileToVFS('Montserrat-Regular.ttf', fontB64);
      doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'normal');
      doc.setFont('Montserrat', 'normal');
    } catch(e) {}
  }

  doc.setFontSize(14);
  doc.text('Расчёт арочного штакетника', 14, 12);

  const { span, edgeH, centerH, plankW, gap, chess } = aLastInput;

  const info = [
    ['Ширина пролёта, мм', String(span)],
    ['Высота у стоек, мм', String(edgeH)],
    ['Высота по центру, мм', String(centerH)],
    ['Ширина планки, мм', String(plankW)],
    ['Зазор, мм', String(gap)],
    ['Режим', chess ? 'Шахматка' : 'Один ряд'],
  ];

  let yAfter = 16;

  if (doc.autoTable) {
    doc.autoTable({
      head: [['Параметр', 'Значение']],
      body: info,
      startY: 16,
      theme: 'grid',
      styles: {
        font: hasMontserrat ? 'Montserrat' : undefined,
        fontSize: 9,
        cellPadding: 2,
        valign: 'middle',
        lineWidth: 0.2,
        lineColor: [0,0,0]
      },
      headStyles: { fillColor: [240,240,240], textColor: 0, lineWidth: 0.2, lineColor: [0,0,0] },
      alternateRowStyles: { fillColor: [250,250,250] },
      margin: { left: 14, right: 14 }
    });

    yAfter = doc.lastAutoTable.finalY + 8;

    const sumBody = aLastSummaryRows.map(r => [String(r.h), String(r.qty)]);
    doc.autoTable({
      head: [['Высота H(x), мм', 'Кол-во, шт']],
      body: sumBody,
      startY: yAfter,
      theme: 'grid',
      styles: {
        font: hasMontserrat ? 'Montserrat' : undefined,
        fontSize: 9,
        cellPadding: 2,
        halign: 'center',
        lineWidth: 0.2,
        lineColor: [0,0,0]
      },
      headStyles: { fillColor: [240,240,240], textColor: 0, lineWidth: 0.2, lineColor: [0,0,0] },
      alternateRowStyles: { fillColor: [250,250,250] },
      margin: { left: 14, right: 14 },
      tableWidth: 110
    });

    yAfter = doc.lastAutoTable.finalY + 8;

    const maxN = Math.max(aLastRow1?.length || 0, aLastRow2?.length || 0, 1);
    const rowsBody = [];
    for (let i = 0; i < maxN; i++){
      rowsBody.push([
        String(i + 1),
        aLastRow1?.[i] != null ? String(aLastRow1[i]) : '—',
        aLastRow2?.[i] != null ? String(aLastRow2[i]) : '—'
      ]);
    }

    doc.autoTable({
      head: [['№', 'Высота (ряд 1), мм', 'Высота (ряд 2), мм']],
      body: rowsBody,
      startY: yAfter,
      theme: 'grid',
      styles: {
        font: hasMontserrat ? 'Montserrat' : undefined,
        fontSize: 8.5,
        cellPadding: 2,
        halign: 'center',
        lineWidth: 0.2,
        lineColor: [0,0,0]
      },
      headStyles: { fillColor: [240,240,240], textColor: 0, lineWidth: 0.2, lineColor: [0,0,0] },
      alternateRowStyles: { fillColor: [250,250,250] },
      margin: { left: 14, right: 14 }
    });
  }

  doc.save('raschet-arochnyi-shtaketnik.pdf');
}

// события
[aSpan, aEdgeH, aCenterH, aGap].forEach(el => el && el.addEventListener('input', aReset));
if (aPlankW) aPlankW.addEventListener('change', aReset);
if (aChess) aChess.addEventListener('change', aReset);

if (aCalcBtn) aCalcBtn.addEventListener('click', aCalc);
if (aPdfBtn) aPdfBtn.addEventListener('click', downloadArchedPdf);



// ============================================================
// 4) ПОДСИСТЕМА НА ФАСАД (СТЕНЫ + ТАБЛИЦА + PDF)
// ============================================================
const fWallsWrap = document.getElementById('f_wallsWrap');
const fAddWallBtn = document.getElementById('f_addWallBtn');
const fCalcBtn = document.getElementById('f_calcBtn');
const fPdfBtn = document.getElementById('f_pdfBtn');
const fTableWrap = document.getElementById('f_tableWrap');
const fErr = document.getElementById('f_err');

let lastWallsData = null;
let lastWallsResult = null; // { profiles: number[], fixings: number[] }

if (fWallsWrap && fAddWallBtn && fCalcBtn && fPdfBtn && fTableWrap && fErr) {
  let wallIndex = 0;

  function updateWallTitles(){
    const walls = Array.from(fWallsWrap.querySelectorAll('.wall'));
    walls.forEach((w, i) => {
      const title = w.querySelector('.section-title');
      if (title) title.textContent = `Стена ${i + 1}`;
    });
  }

  function fReset(){
    fTableWrap.innerHTML = '';
    fErr.textContent = '';
    fPdfBtn.classList.add('hidden');
    lastWallsData = null;
    lastWallsResult = null;
  }

  function createWall(){
    wallIndex += 1;
    const div = document.createElement('div');
    div.className = 'wall';
    div.innerHTML = `
      <div class="section-header">
        <h3 class="section-title">Стена ${wallIndex}</h3>
        <button type="button" class="remove-section">Удалить</button>
      </div>

      <div class="grid3">
        <div class="field">
          <label>Вид обрешетки</label>
          <select class="f_kind">
            <option value="vertical">Вертикальный</option>
            <option value="horizontal">Горизонтальный</option>
          </select>
          <div class="hint">для вертикального сайдинга - горизонтальный; для горизонтального сайдинга - вертикальный</div>
        </div>

        <div class="field">
          <label>Высота стены (м)</label>
          <input class="f_h" type="number" value="0" min="0" step="0.01">
        </div>

        <div class="field">
          <label>Длина стены (м)</label>
          <input class="f_l" type="number" value="0" min="0" step="0.01">
        </div>
      </div>

      <div class="grid3">
        <div class="field">
          <label>Шаг между профилями (м)</label>
          <select class="f_stepProf">
            <option value="0.6">0,6</option>
            <option value="0.7">0,7</option>
            <option value="0.8">0,8</option>
          </select>
        </div>

        <div class="field">
          <label>Шаг между крепежами (м)</label>
          <select class="f_stepFix">
            <option value="0.8">0,8</option>
            <option value="0.9">0,9</option>
            <option value="1.0">1,0</option>
            <option value="1.1">1,1</option>
            <option value="1.2">1,2</option>
          </select>
        </div>

        <div></div>
      </div>
    `;

    // remove
    div.querySelector('.remove-section')?.addEventListener('click', () => {
      div.remove();
      updateWallTitles();
      fReset();
    });

    // reset output on changes
    div.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('input', fReset);
      el.addEventListener('change', fReset);
    });

    fWallsWrap.appendChild(div);
    updateWallTitles();
  }

  function getAllWallsData(){
    const walls = Array.from(fWallsWrap.querySelectorAll('.wall'));
    return walls.map(w => {
      const kind = w.querySelector('.f_kind')?.value || '';
      const h = Number((w.querySelector('.f_h')?.value || '').replace(',', '.'));
      const l = Number((w.querySelector('.f_l')?.value || '').replace(',', '.'));
      const stepProf = Number((w.querySelector('.f_stepProf')?.value || '').replace(',', '.'));
      const stepFix = Number((w.querySelector('.f_stepFix')?.value || '').replace(',', '.'));
      return { kind, h, l, stepProf, stepFix };
    });
  }

  function calcProfilesQty(w){
    // ВАЖНО: формулы — как в задаче. Округляем вверх до целых шт.
    const { kind, h, l, stepProf } = w;
    if (kind === 'vertical') {
      return Math.ceil((l / stepProf) * (h / 3));
    }
    // horizontal
    return Math.ceil((h / stepProf) * (l / 3));
  }

  function calcFixQty(w){
    // Принято: крепежи = (кол-во линий профиля) × (длина профиля / шаг крепежа)
    // Округляем вверх.
    const { kind, h, l, stepProf, stepFix } = w;
    const lines = (kind === 'vertical') ? (l / stepProf) : (h / stepProf);
    const profLen = (kind === 'vertical') ? h : l;
    return Math.ceil(lines * (profLen / stepFix));
  }

  function renderResultTable(res){
    const wallsCount = res.profiles.length;
    const head = ['Показатель'];
    for (let i = 0; i < wallsCount; i++) head.push(`Стена ${i + 1}`);

    const rowProfiles = ['Количество профилей (Г/П), 3м (шт)'];
    const rowFix = ['Количество крепежей (подвесы/КК), (шт)'];
    for (let i = 0; i < wallsCount; i++){
      rowProfiles.push(String(res.profiles[i] ?? '—'));
      rowFix.push(String(res.fixings[i] ?? '—'));
    }

    const body = [rowProfiles, rowFix];

    const thead = `<thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
    const tbody = `<tbody>${body.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>`;

    fTableWrap.innerHTML = `
      <div class="table-wrap">
        <table class="small-table" style="min-width:${Math.max(520, 160 + wallsCount * 110)}px;">
          ${thead}
          ${tbody}
        </table>
      </div>
    `;
  }

  function fCalc(){
    fReset();
    const data = getAllWallsData();
    if (!data.length){
      fErr.textContent = 'Добавьте минимум одну стену';
      return;
    }

    for (let i = 0; i < data.length; i++){
      const w = data[i];
      if (!w.kind){ fErr.textContent = `Стена ${i + 1}: выберите вид обрешетки`; return; }
      if (!isFinite(w.h) || w.h <= 0){ fErr.textContent = `Стена ${i + 1}: высота должна быть > 0`; return; }
      if (!isFinite(w.l) || w.l <= 0){ fErr.textContent = `Стена ${i + 1}: длина должна быть > 0`; return; }
      if (!isFinite(w.stepProf) || w.stepProf <= 0){ fErr.textContent = `Стена ${i + 1}: шаг между профилями должен быть > 0`; return; }
      if (!isFinite(w.stepFix) || w.stepFix <= 0){ fErr.textContent = `Стена ${i + 1}: шаг между крепежами должен быть > 0`; return; }
    }

    const profiles = data.map(calcProfilesQty);
    const fixings = data.map(calcFixQty);
    const res = { profiles, fixings };

    renderResultTable(res);
    lastWallsData = data;
    lastWallsResult = res;
    fPdfBtn.classList.remove('hidden');
  }

  function downloadFacadeSubsysPdf(){
    if (!lastWallsData || !lastWallsResult) return;

    const jsPDF = window.jspdf?.jsPDF;
    if (!jsPDF) {
      fErr.textContent = 'PDF не может быть создан: jsPDF не загружен';
      return;
    }

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // подключаем Montserrat
    let fontB64 = window.__PDF_FONT_MONTSERRAT__;
    if (!fontB64) {
      fErr.textContent = 'Не найден шрифт Montserrat (fonts.js)';
      return;
    }
    fontB64 = fontB64.replace(/\s+/g, '');
    doc.addFileToVFS('Montserrat-Regular.ttf', fontB64);
    doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'normal');
    doc.setFont('Montserrat', 'normal');
    doc.setFontSize(12);
    doc.text('Расчёт подсистемы на фасад', 14, 12);

    // ===== Вводные данные =====
    const inputHead = [[
      'Стена', 'Вид обрешетки', 'Высота, м', 'Длина, м', 'Шаг профилей, м', 'Шаг крепежей, м'
    ]];
    const inputBody = lastWallsData.map((w, i) => ([
      `Стена ${i + 1}`,
      w.kind === 'vertical' ? 'Вертикальный' : 'Горизонтальный',
      String(w.h).replace('.', ','),
      String(w.l).replace('.', ','),
      String(w.stepProf).replace('.', ','),
      String(w.stepFix).replace('.', ',')
    ]));

    doc.autoTable({
      head: inputHead,
      body: inputBody,
      startY: 16,
      theme: 'grid',
      styles: {
        font: 'Montserrat',
        fontSize: 8,
        cellPadding: 2,
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
        fontSize: 8
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 14, right: 14 }
    });

    let y = doc.lastAutoTable.finalY + 8;

    // ===== Таблица расчёта =====
    const calcHead = [['Показатель', ...lastWallsResult.profiles.map((_, i) => `Стена ${i + 1}`)]];
    const calcBody = [
      ['Количество профилей (Г/П), 3м (шт)', ...lastWallsResult.profiles.map(x => String(x))],
      ['Количество крепежей (подвесы/КК), (шт)', ...lastWallsResult.fixings.map(x => String(x))]
    ];

    doc.autoTable({
      head: calcHead,
      body: calcBody,
      startY: y,
      theme: 'grid',
      styles: {
        font: 'Montserrat',
        fontSize: 8,
        cellPadding: 2,
        halign: 'center',
        valign: 'middle',
        lineColor: [0, 0, 0],
        lineWidth: 0.2
      },
      headStyles: {
        font: 'Montserrat',
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        fontSize: 8
      },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { left: 14, right: 14 }
    });

    y = doc.lastAutoTable.finalY + 8;

    // ===== Спецификация (итого) =====
    const totalProfiles = lastWallsResult.profiles.reduce((a,b) => a + (Number(b) || 0), 0);
    const totalFix = lastWallsResult.fixings.reduce((a,b) => a + (Number(b) || 0), 0);
    const specHead = [['Позиция', 'Ед. изм.', 'Кол-во']];
    const specBody = [
      ['Профиль (Г/П), 3м', 'шт', String(totalProfiles)],
      ['Крепежи (подвесы/КК)', 'шт', String(totalFix)]
    ];

    doc.autoTable({
      head: specHead,
      body: specBody,
      startY: y,
      theme: 'grid',
      styles: {
        font: 'Montserrat',
        fontSize: 9,
        cellPadding: 2,
        halign: 'center',
        valign: 'middle',
        lineColor: [0, 0, 0],
        lineWidth: 0.2
      },
      headStyles: {
        font: 'Montserrat',
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        fontSize: 9
      },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      margin: { left: 14, right: 14 },
      tableWidth: 150
    });

    doc.save('raschet-podsistema-fasad.pdf');
  }

  // первая стена при загрузке
  createWall();

  // события
  fAddWallBtn.addEventListener('click', () => createWall());
  fCalcBtn.addEventListener('click', fCalc);
  fPdfBtn.addEventListener('click', downloadFacadeSubsysPdf);
}

// ============================================================
// 5) КАЛЬКУЛЯТОР ВОДОСТОЧНОЙ СИСТЕМЫ
// ============================================================
const g = (id) => document.getElementById(id);

const gType = g('g_type');
const gMetalWrap = g('g_metal_brand_wrap');
const gPlasticWrap = g('g_plastic_brand_wrap');

const gMetalBrand = g('g_metal_brand');
const gPlasticBrand = g('g_plastic_brand');

const gRoofMounted = g('g_roof_mounted');
const gHeight = g('g_height');
const gLength = g('g_length');
const gOverhang = g('g_overhang');

const gRoofTypeInput = g('g_roof_type');
const gRoofPicks = g('g_roof_picks');
const gOtherWrap = g('g_other_wrap');

const gContour = g('g_contour');
const gOpenWrap = g('g_open_wrap');
const gOpenEnds = g('g_open_ends');

const gExtAngles = g('g_ext_angles');
const gIntAngles = g('g_int_angles');

const gCalcBtn = g('g_calcBtn');
const gTableWrap = g('g_tableWrap');
const gErr = g('g_err');

function gCeil(x){
  const n = Number(x);
  if (!isFinite(n)) return 0;
  return Math.ceil(n);
}

function gRound2(x){
  const n = Number(x);
  if (!isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

function gRenderType(){
  if (!gType || !gMetalWrap || !gPlasticWrap) return;
  const isMetal = gType.value === 'metal';
  gMetalWrap.classList.toggle('hidden', !isMetal);
  gPlasticWrap.classList.toggle('hidden', isMetal);
}

function gSetActiveRoof(value){
  if (!gRoofTypeInput || !gRoofPicks || !gOtherWrap) return;
  gRoofTypeInput.value = value;

  const btns = gRoofPicks.querySelectorAll('.roof-btn');
  btns.forEach(b => b.classList.toggle('active', b.dataset.value === value));

  const isOther = value === 'other';
  gOtherWrap.classList.toggle('hidden', !isOther);
  if (isOther && gContour && gOpenWrap){
    gOpenWrap.classList.toggle('hidden', gContour.value !== 'no');
  }
}

function gRoofDefaults(){
  const t = gRoofTypeInput?.value || 'single';
  if (t === 'single') return { open: 2, ext: 0, intr: 0 };
  if (t === 'double') return { open: 4, ext: 0, intr: 0 };
  if (t === 'mansard') return { open: 4, ext: 0, intr: 0 };
  if (t === 'hip') return { open: 0, ext: 4, intr: 0 };
  if (t === 'tent') return { open: 0, ext: 4, intr: 0 };
  return { open: 0, ext: 0, intr: 0 };
}

function gGetAnglesAndEnds(){
  const t = gRoofTypeInput?.value || 'single';
  const def = gRoofDefaults();

  let openEnds = def.open;
  let ext = def.ext;
  let intr = def.intr;

  if (t === 'other'){
    const contourNo = (gContour?.value === 'no');
    if (contourNo){
      const v = Number(gOpenEnds?.value);
      if (isFinite(v) && v > 0) openEnds = v;
      else openEnds = 0;
    } else {
      openEnds = 0;
    }

    const ev = Number(gExtAngles?.value);
    if (isFinite(ev) && ev > 0) ext = ev;

    const iv = Number(gIntAngles?.value);
    if (isFinite(iv) && iv > 0) intr = iv;
  }

  return { openEnds, ext, intr };
}

function gRenderTable(rows){
  if (!gTableWrap) return;
  const html = `
    <div class="table-wrap">
      <table class="small-table">
        <thead><tr><th>Элемент</th><th>Кол-во</th></tr></thead>
        <tbody>
          ${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  `;
  gTableWrap.innerHTML = html;
}

function gCalc(){
  if (!gErr || !gLength || !gHeight || !gType) return;

  gErr.textContent = '';
  if (gTableWrap) gTableWrap.innerHTML = '';

  const L = Number(gLength.value);
  const H = Number(gHeight.value);

  if (!isFinite(L) || L <= 0){
    gErr.textContent = 'Введите длину по карнизу (м) больше 0';
    return;
  }
  if (!isFinite(H) || H <= 0){
    gErr.textContent = 'Введите высоту от земли до карниза (м) больше 0';
    return;
  }

  // свес пока не используется в формулах, но валидируем
  const O = Number(gOverhang?.value || 0);
  if (!isFinite(O) || O < 0){
    gErr.textContent = 'Длина карнизного свеса должна быть >= 0';
    return;
  }

  const gutters = gCeil(L / 3) + 1;
  const holders = gCeil(L / 0.6);
  const funnels = gCeil(L / 8);

  const { openEnds, ext, intr } = gGetAnglesAndEnds();

  const roofMountedYes = (gRoofMounted?.value === 'yes');

  const isMetal = gType.value === 'metal';
  const metalBrand = gMetalBrand?.value || 'nika';
  const plasticBrand = gPlasticBrand?.value || 'docke_premium';

  const rows = [];

  // helpers
  const push = (name, qty) => {
    const q = Number(qty);
    if (!isFinite(q)) return;
    if (q <= 0) return;
    rows.push([name, q]);
  };

  if (isMetal){
    if (metalBrand === 'nika'){
      push('Желоб прямоугольный 3м', gutters);
      push('Держатель желоба', holders);
      if (roofMountedYes) push('Держатель желоба короткий', holders);

      // заглушки по открытым концам (левая/правая — суммарно = openEnds)
      push('Заглушка желоба (левая/правая)', openEnds);

      if (ext > 0) push('Угол желоба (внешний) 90°', ext);
      if (intr > 0) push('Угол желоба (внутренний) 90°', intr);

      push('Воронка выпускная', funnels);
      push('Колено трубы', funnels * 2);
      push('Колено трубы боковое', funnels * 2);

      // трубы по Excel-логике (как в ТЗ) — реализуем через интервалы
      const B20 = funnels;

      // Труба 3м
      let pipe3 = null;
      if (H > 3 && H <= 4) pipe3 = 1 * B20;
      else if (H > 4 && H <= 6) pipe3 = 1 * B20;
      else if (H > 6 && H <= 7) pipe3 = 2 * B20;
      else if (H > 7 && H <= 8) pipe3 = 1 * B20;
      else if (H > 8 && H <= 9) pipe3 = 2 * B20;
      else if (H > 9 && H <= 10) pipe3 = 3 * B20;

      // Труба 2м
      let pipe2 = null;
      if (H > 3 && H <= 5) pipe2 = 1 * B20;
      else if (H > 7 && H <= 8) pipe2 = 1 * B20;

      // Труба 1м (соединение)
      const pipe1 = B20;

      // труба с коленом 3м
      let pipeKnee3 = null;
      if (H > 4 && H <= 5) pipeKnee3 = 1 * B20;
      else if (H > 5 && H <= 6) pipeKnee3 = 1 * B20;
      else if (H > 7 && H <= 8) pipeKnee3 = 1 * B20;
      else if (H > 8 && H <= 9) pipeKnee3 = 1 * B20;

      // труба с коленом 1м
      let pipeKnee1 = null;
      if (H > 3 && H <= 4) pipeKnee1 = 1 * B20;
      else if (H > 6 && H <= 7) pipeKnee1 = 1 * B20;
      else if (H > 9 && H <= 10) pipeKnee1 = 1 * B20;

      if (pipe3) push('Труба водосточная 3 м', pipe3);
      if (pipe2) push('Труба водосточная 2 м', pipe2);
      push('Труба водосточная 1 м (соединение м/д колен)', pipe1);
      if (pipeKnee3) push('Труба водосточная с коленом 3м', pipeKnee3);
      if (pipeKnee1) push('Труба водосточная с коленом 1м', pipeKnee1);

      // держатели трубы: 3 шт на каждые 3 метра (округляем вверх по общей высоте)
      const holdersPipe = gCeil(H / 3) * 3 * B20;
      push('Держатель трубы', holdersPipe);
    } else {
      // Grand Line Optima
      push('Желоб полукруглый 3м', gutters);
      push('Соединитель желоба', Math.max(0, gutters - 1));
      if (roofMountedYes) push('Крюк короткий', holders);
      push('Крюк длинный', holders);

      push('Заглушка торцевая универсальная', openEnds);

      if (intr > 0) push('Угол желоба внутренний 90°', intr);
      if (ext > 0) push('Угол желоба внешний 90°', ext);

      push('Воронка', funnels);
      push('Колено 60°', funnels * 2);

      // трубы: funnels * H/3
      push('Труба круглая 3 м', gCeil((H * funnels) / 3));
      const pipes = gCeil((H * funnels) / 3);
      push('Кронштейн трубы на кирпич', pipes * 2);
      push('Труба круглая соединительная', funnels);
      push('Колено стока', funnels);
    }
  } else {
    // plastic: Docke Premium / Docke Lux (same) / Bryza
    if (plasticBrand === 'docke_premium' || plasticBrand === 'docke_lux'){
      push('Желоб водосточный 3м', gutters);
      push('Соединитель желобов', Math.max(0, gutters - 1));
      if (roofMountedYes) push('Кронштейн желоба', holders);
      push('Кронштейн желоба металлический', holders);
      push('Заглушка желоба', openEnds);
      if (ext > 0) push('Элемент угловой 90°', ext);

      push('Воронка/приемник воды', funnels);
      push('Колено 45°/72°', funnels * 2);

      const pipes = gCeil((H * funnels) / 3);
      push('Труба водосточная 3 м', pipes);

      push('Хомут универсальный', pipes * 2);
      push('Шпилька специальная с гайкой ZN', pipes * 2);

      push('Труба водосточная 1 м', funnels);

      // Муфта соединительная: Excel-логика
      let mufta = null;
      if (H <= 1) mufta = funnels;
      else if (H > 3 && H < 7) mufta = funnels;
      else if (H >= 7) mufta = funnels * 2;
      if (mufta) push('Муфта соединительная', mufta);

      push('Наконечник', funnels);
    } else {
      // BRYZA
      push('Желоб 3м', gutters);
      push('Муфта желоба (соединитель)', Math.max(0, gutters - 1));
      if (roofMountedYes) push('Держатель желоба', holders);
      push('Держатель желоба металл', holders);

      // заглушки: правая/левая
      // для типовых крыш: 1/2/2; для other: openEnds/2
      const t = gRoofTypeInput?.value || 'single';
      let half = 0;
      if (t === 'single') half = 1;
      else if (t === 'double' || t === 'mansard') half = 2;
      else if (t === 'other') half = gCeil(openEnds / 2);

      if (half > 0){
        push('Заглушка желоба правая', half);
        push('Заглушка желоба левая', half);
      }

      if (intr > 0) push('Угловой элемент внутренний', intr);
      if (ext > 0) push('Угловой элемент внешний', ext);

      push('Сливная воронка', funnels);
      push('Колено 67,5°', funnels * 2);

      const pipes = gCeil((H * funnels) / 3);
      push('Водосточная труба 3м', pipes);

      // Соединитель трубы (Excel-логика как Docke)
      let conn = null;
      if (H <= 1) conn = funnels;
      else if (H > 3 && H < 7) conn = funnels;
      else if (H >= 7) conn = funnels * 2;
      if (conn) push('Соединитель водосточной трубы', conn);

      push('Хомут', pipes * 2);
      push('Крюк хомута (металл)', pipes * 2);
    }
  }

  if (!rows.length){
    gErr.textContent = 'Нет элементов для вывода (проверьте вводные данные)';
    return;
  }

  gRenderTable(rows);
}

// events
gType?.addEventListener('change', () => { gRenderType(); if (gErr) gErr.textContent=''; });
gMetalBrand?.addEventListener('change', () => { if (gErr) gErr.textContent=''; });
gPlasticBrand?.addEventListener('change', () => { if (gErr) gErr.textContent=''; });

gContour?.addEventListener('change', () => {
  if (gRoofTypeInput?.value === 'other'){
    gOpenWrap?.classList.toggle('hidden', gContour.value !== 'no');
  }
  if (gErr) gErr.textContent = '';
});

gRoofPicks?.addEventListener('click', (e) => {
  const btn = e.target.closest('.roof-btn');
  if (!btn) return;
  gSetActiveRoof(btn.dataset.value);
  if (gErr) gErr.textContent = '';
});

[gRoofMounted, gHeight, gLength, gOverhang, gOpenEnds, gExtAngles, gIntAngles].forEach(el => {
  el?.addEventListener('input', () => { if (gErr) gErr.textContent=''; });
  el?.addEventListener('change', () => { if (gErr) gErr.textContent=''; });
});

gCalcBtn?.addEventListener('click', gCalc);

// init
gRenderType();
gSetActiveRoof(gRoofTypeInput?.value || 'single');


// =====================
// 6) Калькулятор софитов
// =====================
const sMaterial = document.getElementById('s_material');
const sOverhang = document.getElementById('s_overhang');
const sLength = document.getElementById('s_length');

const sTrimP = document.getElementById('s_trim_p');
const sTrimJ = document.getElementById('s_trim_j');
const sTrimFacia = document.getElementById('s_trim_facia');
const sTrimCorner = document.getElementById('s_trim_corner');

const sCalcBtn = document.getElementById('s_calc');
const sPdfBtn = document.getElementById('s_pdf');
const sRes = document.getElementById('s_result');
const sErr = document.getElementById('s_err');

let sLast = null;

const SOFFIT_WIDTHS_MM = {
  c8: { overall: 1200, work: 1150 },
  soffit_lb_perfor: { overall: 264, work: 241 },
  lb: { overall: 264, work: 240 },
  evrobrus: { overall: 359, work: 340 }
};

function sReset(){
  if (sErr) sErr.textContent = '';
  if (sRes) sRes.innerHTML = '';
  sLast = null;
  sPdfBtn?.classList.add('hidden');
}

function sFmt(n, digits = 2){
  if (!isFinite(n)) return '—';
  return Number(n.toFixed(digits)).toString().replace('.', ',');
}

function sMaterialName(key){
  if (key === 'c8') return 'Профнастил С8';
  if (key === 'soffit_lb_perfor') return 'Софит Л-брус перфорированный';
  if (key === 'lb') return 'Л-брус';
  if (key === 'evrobrus') return 'Евробрус';
  return key;
}

function sCalc(){
  sReset();

  const mat = sMaterial?.value || '';
  const overhang = Number((sOverhang?.value || '').toString().replace(',', '.'));
  const length = Number((sLength?.value || '').toString().replace(',', '.'));

  if (!mat || !SOFFIT_WIDTHS_MM[mat]) { if (sErr) sErr.textContent = 'Выберите материал'; return; }
  if (!isFinite(overhang) || overhang <= 0) { if (sErr) sErr.textContent = 'Введите длину карнизного свеса (м) > 0'; return; }
  if (!isFinite(length) || length <= 0) { if (sErr) sErr.textContent = 'Введите длину по карнизу (м) > 0'; return; }

  const w = SOFFIT_WIDTHS_MM[mat];
  const workWm = w.work / 1000;

  const sheetsQtyRaw = length / workWm;
  const sheetsQty = Math.ceil(sheetsQtyRaw);

  const selectedTrims = [];
  if (sTrimP?.checked) selectedTrims.push('П‑планка завершающая');
  if (sTrimJ?.checked) selectedTrims.push('J‑планка');
  if (sTrimFacia?.checked) selectedTrims.push('Лобовая планка');
  if (sTrimCorner?.checked) selectedTrims.push('Планка угла внешнего сложная');

  const TRIM_LEN = 2;
  const trimQtyRaw = length / (TRIM_LEN - 0.1);
  const trimQty = Math.ceil(trimQtyRaw);

  const rows = [];
  const matName = sMaterialName(mat);
  rows.push([matName, `${sheetsQty} шт`, `${sFmt(overhang)} м`]);
  selectedTrims.forEach(name => rows.push([name, `${trimQty} шт`, '2 м']));

  const table = `
    <table class="mp-table">
      <thead><tr><th>Материал</th><th>Кол-во</th><th>Длина, м</th></tr></thead>
      <tbody>
        ${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}
      </tbody>
    </table>
  `;
  if (sRes) sRes.innerHTML = table;

  sLast = {
    inputs: { material: mat, overhang, length, trims: selectedTrims },
    widths: w,
    sheetsQty,
    trimQty
  };
  sPdfBtn?.classList.remove('hidden');
}

function downloadSoffitPdf(){
  if (!sLast) return;
  const jsPDF = window.jspdf?.jsPDF;
  if (!jsPDF) { if (sErr) sErr.textContent = 'PDF не может быть создан: jsPDF не загружен'; return; }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Montserrat (если есть fonts.js)
  const fontB64 = window.__PDF_FONT_MONTSERRAT__;
  const hasMontserrat = !!fontB64;
  if (hasMontserrat) {
    try {
      const clean = String(fontB64).replace(/\s+/g, '');
      doc.addFileToVFS('Montserrat-Regular.ttf', clean);
      doc.addFont('Montserrat-Regular.ttf', 'Montserrat', 'normal');
      doc.setFont('Montserrat', 'normal');
    } catch(e) {}
  }

  doc.setFontSize(14);
  doc.text('Расчёт софитов', 14, 14);

  const inp = sLast.inputs;
  const info = [
    ['Материал', sMaterialName(inp.material)],
    ['Длина карнизного свеса, м', sFmt(inp.overhang)],
    ['Длина по карнизу, м', sFmt(inp.length)],
    ['Доборные элементы', inp.trims.length ? inp.trims.join(', ') : '—']
  ];

  let y = 18;
  if (doc.autoTable) {
    doc.autoTable({
      head: [['Параметр', 'Значение']],
      body: info,
      startY: y,
      theme: 'grid',
      styles: {
        font: hasMontserrat ? 'Montserrat' : undefined,
        fontSize: 9,
        cellPadding: 2,
        lineWidth: 0.2,
        lineColor: [0,0,0]
      },
      headStyles: { fillColor: [240,240,240], textColor: 0, lineWidth: 0.2, lineColor: [0,0,0] },
      alternateRowStyles: { fillColor: [250,250,250] },
      margin: { left: 14, right: 14 }
    });

    y = doc.lastAutoTable.finalY + 8;

    const w = sLast.widths;
    const matName = sMaterialName(inp.material);
    const resRows = [
      [matName, `${sLast.sheetsQty} шт`, `${sFmt(inp.overhang)} м`],
      ...inp.trims.map(t => [t, `${sLast.trimQty} шт`, '2 м' ])
    ];

    doc.autoTable({
      head: [['Материал', 'Кол-во', 'Длина, м']],
      body: resRows,
      startY: y,
      theme: 'grid',
      styles: {
        font: hasMontserrat ? 'Montserrat' : undefined,
        fontSize: 9,
        cellPadding: 2,
        lineWidth: 0.2,
        lineColor: [0,0,0]
      },
      headStyles: { fillColor: [240,240,240], textColor: 0, lineWidth: 0.2, lineColor: [0,0,0] },
      alternateRowStyles: { fillColor: [250,250,250] },
      margin: { left: 14, right: 14 }
    });
  }

  doc.save('raschet-sofitov.pdf');
}

[sMaterial, sOverhang, sLength, sTrimP, sTrimJ, sTrimFacia, sTrimCorner].forEach(el => {
  el?.addEventListener('input', sReset);
  el?.addEventListener('change', sReset);
});
sCalcBtn?.addEventListener('click', sCalc);
sPdfBtn?.addEventListener('click', downloadSoffitPdf);
