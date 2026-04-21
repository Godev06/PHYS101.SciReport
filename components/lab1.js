const MEASUREMENT_ACCURACY = {
  caliperMm: 0.05,
  micrometerMm: 0.01,
  deltaHt: {
    a: 0.05,
    b: 0.05,
    c: 0.05,
    m: 0.01,
  },
};

const PARTS = [
  {
    id: "1",
    shortTitle: "Phần 1 - Khối nhôm (Al)",
    fullTitle:
      "1. Xác định thể tích và khối lượng riêng của khối nhôm (Al) hình hộp bằng thước kẹp và cân kỹ thuật",
    instrument: "thước kẹp",
    accuracy: MEASUREMENT_ACCURACY.caliperMm,
    toneClass: "border-sky-300 bg-sky-50",
  },
  {
    id: "2",
    shortTitle: "Phần 2 - Khối đồng (Cu)",
    fullTitle:
      "2. Xác định thể tích và khối lượng riêng của khối đồng (Cu) hình hộp bằng thước panme và cân kỹ thuật",
    instrument: "thước panme",
    accuracy: MEASUREMENT_ACCURACY.micrometerMm,
    toneClass: "border-amber-300 bg-amber-50",
  },
];

const GENERAL_INFO_HTML = `
  <div class="bg-white p-3 md:p-6 shadow-xl border border-gray-300 rounded-lg md:rounded-none">
    <p class="text-base md:text-2xl font-bold uppercase mb-1 md:mb-2 leading-snug">
      Bài 1: Đo các hằng số cơ bản: chiều dài, khối lượng, thời gian
    </p>
  </div>
`;

const TASK_METHOD_HTML = `
  <div class="bg-white px-3 md:px-6 pb-3 md:pb-2 border-x border-gray-300">
    <p class="text-base md:text-xl font-bold mb-2">I. Nhiệm vụ và phương pháp đo</p>
    <div class="space-y-1 text-xs md:text-base leading-relaxed">
      <p>Nhiệm vụ: đo các hằng số cơ bản: chiều dài, khối lượng, thời gian.</p>
      <p>Phương pháp đo:</p>
      <p class="pl-4">Độ chính xác của thước kẹp: CCX = 0.05 (mm).</p>
      <p class="pl-4">Độ biến thiên khối lượng hệ thống của khối nhôm là: \\( \\Delta m_{ht} = 0.01\\,g \\).</p>
      <p class="pl-4">Độ chính xác của thước panme: CCX = 0.01 (mm).</p>
      <p class="pl-4">Độ biến thiên khối lượng hệ thống của khối đồng là: \\( \\Delta m_{ht} = 0.01\\,g \\).</p>
    </div>
  </div>
`;

const MEASURE_COLUMNS = [
  { key: "a", unit: "m" },
  { key: "b", unit: "m" },
  { key: "c", unit: "m" },
  { key: "m", unit: "kg" },
];

const MEASURE_ROWS = ["1", "2", "3", "Trung bình"];

function buildMeasurementHeaderRow() {
  const dynamicHeaders = MEASURE_COLUMNS.map(
    (col) =>
      `<th class="px-1.5 md:px-3 py-2 md:py-3 min-w-[72px] md:min-w-[120px]">\\( ${col.key} \\)</th>`,
  ).join("");

  return `
    <tr class="bg-slate-100">
      <th class="px-1.5 md:px-3 py-2 md:py-3 min-w-[68px] md:min-w-[110px] font-bold text-gray-800" rowspan="2">Lần đo</th>
      ${dynamicHeaders}
    </tr>
  `;
}

function buildMeasurementUnitRow() {
  const dynamicUnits = MEASURE_COLUMNS.map(
    (col) =>
      `<th class="px-1 md:px-2 py-1.5 md:py-2 text-[10px] md:text-sm text-slate-700">\\( (10^{-3}\\,\\mathrm{${col.unit}}) \\)</th>`,
  ).join("");

  return `<tr class="bg-slate-50">${dynamicUnits}</tr>`;
}

function buildMeasurementCells(rowLabel, partId) {
  return MEASURE_COLUMNS.map(
    (col) => `
      <td class="py-2 md:py-3 px-1 md:px-2 border border-black editable-cell outline-none transition-colors hover:bg-blue-50 text-xs md:text-base" contenteditable="true" data-part="${partId}" data-key="${col.key}" data-row="${rowLabel}"></td>
    `,
  ).join("");
}

function buildMeasurementBodyRows(partId) {
  return MEASURE_ROWS.map((rowLabel, index) => {
    const isAvgRow = rowLabel === "Trung bình";
    const rowTone = isAvgRow
      ? "bg-yellow-50 font-bold"
      : index % 2 === 0
        ? "bg-white"
        : "bg-slate-50/60";
    return `
      <tr class="${rowTone}">
        <td class="py-2 md:py-3 px-1 md:px-2 border border-black font-semibold text-xs md:text-base">${rowLabel}</td>
        ${buildMeasurementCells(rowLabel, partId)}
      </tr>
    `;
  }).join("");
}

function buildPartDataTable(part) {
  const calcItems = getCalculationItems(part.id);
  const resultFormulas = getResultFormulas(part.id);

  return `
    <section id="part-section-${part.id}" data-part-section="${part.id}" class="py-3 md:py-5 border-b border-gray-300 space-y-3">
      <p class="text-lg md:text-2xl font-bold leading-snug">${part.shortTitle}</p>

      <p class="text-base md:text-xl font-bold">II. Bảng số liệu</p>
      <div class="text-xs md:text-base leading-relaxed rounded border ${part.toneClass} px-2.5 md:px-3 py-2">
        <p>${part.fullTitle}:</p>
        <p>Độ chính xác của ${part.instrument}: <span class="border-b border-dotted border-black px-3 ml-1">${part.accuracy}</span> (mm)</p>
        <p>\\( (\\Delta m)_{\\mathrm{ht}} = ${MEASUREMENT_ACCURACY.deltaHt.m}\\,\\mathrm{g} \\)</p>
      </div>
      <div class="-mx-3 px-3 md:mx-0 md:px-0 overflow-x-auto rounded border border-slate-300 shadow-sm">
        <table class="w-max min-w-full text-center border-collapse border-2 border-black text-xs md:text-base" id="physicsTable-${part.id}">
          <thead>
            ${buildMeasurementHeaderRow()}
            ${buildMeasurementUnitRow()}
          </thead>
          <tbody>
            ${buildMeasurementBodyRows(part.id)}
          </tbody>
        </table>
      </div>
      <div class="pt-2">
        <button id="clearBtnTop-${part.id}" class="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded shadow-md transition-all text-xs md:text-sm">
          Xóa nhanh dữ liệu bảng nhập
        </button>
      </div>

      <p class="text-base md:text-xl font-bold pt-2">III. Tính toán</p>
      <div class="flex flex-col gap-y-1 leading-relaxed">
        ${buildCalculationItem(calcItems[0])}
        ${buildSupportTable(part.id)}
        ${buildCalculationItem(calcItems[1])}
        ${buildCalculationItem(calcItems[2])}
        ${buildCalculationItem(calcItems[3])}
      </div>

      <p class="text-base md:text-xl font-bold pt-2">IV. Ghi kết quả</p>
      <div class="flex flex-col gap-y-2 md:gap-y-3 text-xs md:text-lg leading-relaxed pl-1 md:pl-2 overflow-x-auto">
        ${resultFormulas.map(buildMathLine).join("")}
      </div>

      <div class="mt-4 md:mt-5 flex flex-col sm:flex-row gap-2 sm:items-center">
        <button id="pdfBtn-${part.id}" class="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded shadow-md transition-all">
          Tải xuống PDF (cả 2 phần)
        </button>
      </div>
      <div id="outputArea-${part.id}" class="mt-4 hidden">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Dữ liệu đã nhập (${part.shortTitle}):</h2>
        <pre id="jsonContent-${part.id}" class="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs"></pre>
      </div>
    </section>
  `;
}

function buildPartQuickSwitch() {
  const partButtons = PARTS.map(
    (part) =>
      `<button type="button" class="part-switch-btn flex-1 min-w-[140px] px-3 md:px-4 py-2.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-xs md:text-base font-medium transition-colors" data-part-filter="${part.id}">${part.shortTitle}</button>`,
  ).join("");

  return `
    <div id="partQuickSwitch" class="mb-4 sticky top-2 z-10 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg p-2 md:p-3 flex flex-wrap items-center gap-2 md:gap-3">
      <span class="w-full text-xs md:text-base font-semibold text-slate-700">Chọn nhanh phần đang làm:</span>
      ${partButtons}
    </div>
  `;
}

function buildDataTableHtml() {
  return `
    <div class="bg-white px-2 md:px-6 py-3 md:py-4 border border-gray-300 rounded-lg md:rounded-none">
      ${buildPartQuickSwitch()}
      ${PARTS.map(buildPartDataTable).join("")}
    </div>
  `;
}

const SUPPORT_TABLE_COLUMNS = [
  { key: "a", unit: "m", kind: "value", label: "a" },
  { key: "a", unit: "m", kind: "delta", label: "\\Delta a" },
  { key: "b", unit: "m", kind: "value", label: "b" },
  { key: "b", unit: "m", kind: "delta", label: "\\Delta b" },
  { key: "c", unit: "m", kind: "value", label: "c" },
  { key: "c", unit: "m", kind: "delta", label: "\\Delta c" },
  { key: "m", unit: "kg", kind: "value", label: "m" },
  { key: "m", unit: "kg", kind: "delta", label: "\\Delta m" },
];

const SUPPORT_TABLE_ROWS = [
  { label: "1", token: "1" },
  { label: "2", token: "2" },
  { label: "3", token: "3" },
  { label: "Trung bình", token: "avg" },
];

function buildSupportTableHeaderRow() {
  const dynamicHeaders = SUPPORT_TABLE_COLUMNS.map(
    (col) =>
      `<th class="px-2 md:px-3 py-1.5 md:py-2 min-w-[92px] md:min-w-[110px] border border-black">\\( ${col.label} \\)</th>`,
  ).join("");

  return `
    <tr class="bg-slate-100">
      <th class="px-2 md:px-3 py-1.5 md:py-2 min-w-[88px] md:min-w-[110px] border border-black" rowspan="2">Lần đo</th>
      ${dynamicHeaders}
    </tr>
  `;
}

function buildSupportTableUnitRow() {
  const dynamicUnits = SUPPORT_TABLE_COLUMNS.map(
    (col) =>
      `<th class="px-1.5 md:px-2 py-1.5 md:py-2 border border-black text-[11px] md:text-sm text-slate-700">\\( (10^{-3}\\,\\mathrm{${col.unit}}) \\)</th>`,
  ).join("");

  return `<tr class="bg-slate-50">${dynamicUnits}</tr>`;
}

function buildSupportTableRows(partId) {
  return SUPPORT_TABLE_ROWS.map((row, index) => {
    const isAvgRow = row.token === "avg";
    const cells = SUPPORT_TABLE_COLUMNS.map((col) => {
      const classes = isAvgRow
        ? "px-1.5 md:px-2 py-2 border border-black font-semibold bg-yellow-50"
        : index % 2 === 0
          ? "px-1.5 md:px-2 py-2 border border-black bg-white"
          : "px-1.5 md:px-2 py-2 border border-black bg-slate-50/60";
      return `<td class="${classes}" id="sup-${partId}-${row.token}-${col.kind}-${col.key}">-</td>`;
    }).join("");

    return `
      <tr class="${isAvgRow ? "bg-yellow-50 font-semibold" : ""}">
        <td class="px-1.5 md:px-2 py-2 border border-black">${row.label}</td>
        ${cells}
      </tr>
    `;
  }).join("");
}

function buildSupportTable(partId) {
  return `
    <div class="py-4 border-b border-gray-200 space-y-2">
      <p class="font-semibold text-sm md:text-lg">b) Bảng phụ số liệu tính trung gian</p>
      <div class="text-xs md:text-base leading-relaxed px-2.5 md:px-3 py-2 space-y-1 bg-slate-50 rounded border border-slate-200 overflow-x-auto">
        <p><b>Công thức cơ bản:</b></p>
        <p>\\( \\overline{x} = \\dfrac{x_1 + x_2 + x_3}{3} \\)</p>
        <p>\\( \\Delta x_i = |x_i - \\overline{x}| \\)</p>
        <p>\\( \\overline{\\Delta x} = \\dfrac{\\Delta x_1 + \\Delta x_2 + \\Delta x_3}{3} \\)</p>
      </div>
      <div class="-mx-3 px-3 md:mx-0 md:px-0 overflow-x-auto rounded border border-slate-300 shadow-sm">
        <table class="w-max min-w-full text-center border-collapse border-2 border-black text-xs md:text-base">
          <thead>
            ${buildSupportTableHeaderRow()}
            ${buildSupportTableUnitRow()}
          </thead>
          <tbody>
            ${buildSupportTableRows(partId)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function buildMathLine(line) {
  const lineConfig = typeof line === "string" ? { mathExpression: line } : line;
  const unitSuffix = lineConfig.unitTex
    ? ` <span class="text-slate-600">\\( ${lineConfig.unitTex} \\)</span>`
    : "";
  if (lineConfig.substituteId && lineConfig.valueId) {
    return `<p>\\( ${lineConfig.mathExpression} \\) = <span id="${lineConfig.substituteId}" class="font-medium text-gray-800">-</span> = <span id="${lineConfig.valueId}" class="font-semibold text-blue-700">-</span>${unitSuffix}</p>`;
  }
  if (lineConfig.valueId) {
    return `<p>\\( ${lineConfig.mathExpression} \\) = <span id="${lineConfig.valueId}" class="font-semibold text-blue-700">-</span>${unitSuffix}</p>`;
  }
  return `<p>\\( ${lineConfig.mathExpression} \\)</p>`;
}

function buildCalculationItem(item) {
  return `
    <div class="${item.blockClass}">
      <p class="font-semibold text-sm md:text-lg leading-snug">${item.title}</p>
      <div class="pl-2 md:pl-6 space-y-1 text-xs md:text-lg overflow-x-auto">
        ${item.lines.map(buildMathLine).join("")}
      </div>
    </div>
  `;
}

function getCalculationItems(partId) {
  return [
    {
      blockClass: "pb-4 border-b border-gray-200 space-y-2",
      title:
        "a) Tính \\( (\\Delta x)_{\\mathrm{ht}} \\) của từng đối tượng đo <b>(Cấp chính xác của dụng cụ đo tương ứng)</b>",
      lines: [
        {
          mathExpression: "(\\Delta a)_{\\mathrm{ht}}",
          valueId: `calc-${partId}-delta-ht-a`,
          unitTex: "(10^{-3}\\,\\mathrm{m})",
        },
        {
          mathExpression: "(\\Delta b)_{\\mathrm{ht}}",
          valueId: `calc-${partId}-delta-ht-b`,
          unitTex: "(10^{-3}\\,\\mathrm{m})",
        },
        {
          mathExpression: "(\\Delta c)_{\\mathrm{ht}}",
          valueId: `calc-${partId}-delta-ht-c`,
          unitTex: "(10^{-3}\\,\\mathrm{m})",
        },
        {
          mathExpression: "(\\Delta m)_{\\mathrm{ht}}",
          valueId: `calc-${partId}-delta-ht-m`,
          unitTex: "(10^{-3}\\,\\mathrm{kg})",
        },
      ],
    },
    {
      blockClass: "pt-4 space-y-2",
      title: "c) Tính sai số toàn phần của từng đối tượng đo",
      lines: [
        {
          mathExpression:
            "\\Delta a = \\overline{\\Delta a} + (\\Delta a)_{\\mathrm{ht}}",
          valueId: `calc-${partId}-total-delta-a`,
          substituteId: `sub-${partId}-total-delta-a`,
          unitTex: "(10^{-3}\\,\\mathrm{m})",
        },
        {
          mathExpression:
            "\\Delta b = \\overline{\\Delta b} + (\\Delta b)_{\\mathrm{ht}}",
          valueId: `calc-${partId}-total-delta-b`,
          substituteId: `sub-${partId}-total-delta-b`,
          unitTex: "(10^{-3}\\,\\mathrm{m})",
        },
        {
          mathExpression:
            "\\Delta c = \\overline{\\Delta c} + (\\Delta c)_{\\mathrm{ht}}",
          valueId: `calc-${partId}-total-delta-c`,
          substituteId: `sub-${partId}-total-delta-c`,
          unitTex: "(10^{-3}\\,\\mathrm{m})",
        },
        {
          mathExpression:
            "\\Delta m = \\overline{\\Delta m} + (\\Delta m)_{\\mathrm{ht}}",
          valueId: `calc-${partId}-total-delta-m`,
          substituteId: `sub-${partId}-total-delta-m`,
          unitTex: "(10^{-3}\\,\\mathrm{kg})",
        },
      ],
    },
    {
      blockClass: "pt-4 space-y-2",
      title: "d) Tính \\( \\overline{V} \\) và \\( \\Delta V \\)",
      lines: [
        {
          mathExpression:
            "\\overline{V} = \\overline{a}\\,\\overline{b}\\,\\overline{c}",
          valueId: `calc-${partId}-v-mean`,
          substituteId: `sub-${partId}-v-mean`,
          unitTex: "(10^{-9}\\,\\mathrm{m^3})",
        },
        {
          mathExpression:
            "\\Delta V = \\overline{V}\\left(\\dfrac{\\Delta a}{\\overline{a}} + \\dfrac{\\Delta b}{\\overline{b}} + \\dfrac{\\Delta c}{\\overline{c}}\\right)",
          valueId: `calc-${partId}-v-delta`,
          substituteId: `sub-${partId}-v-delta`,
          unitTex: "(10^{-9}\\,\\mathrm{m^3})",
        },
      ],
    },
    {
      blockClass: "pt-4 space-y-2",
      title: "e) Tính \\( \\overline{p} \\) và \\( \\Delta p \\)",
      lines: [
        {
          mathExpression:
            "\\overline{p} = \\dfrac{\\overline{m}}{\\overline{V}}",
          valueId: `calc-${partId}-p-mean`,
          substituteId: `sub-${partId}-p-mean`,
          unitTex: "(10^{6}\\,\\mathrm{kg/m^3})",
        },
        {
          mathExpression:
            "\\Delta p = \\overline{p}\\left(\\dfrac{\\Delta m}{\\overline{m}} + \\dfrac{\\Delta V}{\\overline{V}}\\right)",
          valueId: `calc-${partId}-p-delta`,
          substituteId: `sub-${partId}-p-delta`,
          unitTex: "(10^{6}\\,\\mathrm{kg/m^3})",
        },
      ],
    },
  ];
}

function getResultFormulas(partId) {
  return [
    {
      mathExpression: "a = (\\overline{a} \\pm \\Delta a)",
      valueId: `calc-${partId}-result-a`,
      unitTex: "(10^{-3}\\,\\mathrm{m})",
    },
    {
      mathExpression: "b = (\\overline{b} \\pm \\Delta b)",
      valueId: `calc-${partId}-result-b`,
      unitTex: "(10^{-3}\\,\\mathrm{m})",
    },
    {
      mathExpression: "c = (\\overline{c} \\pm \\Delta c)",
      valueId: `calc-${partId}-result-c`,
      unitTex: "(10^{-3}\\,\\mathrm{m})",
    },
    {
      mathExpression: "m = (\\overline{m} \\pm \\Delta m)",
      valueId: `calc-${partId}-result-m`,
      unitTex: "(10^{-3}\\,\\mathrm{kg})",
    },
    {
      mathExpression: "V = (\\overline{V} \\pm \\Delta V)",
      valueId: `calc-${partId}-result-v`,
      unitTex: "(10^{-9}\\,\\mathrm{m^3})",
    },
    {
      mathExpression: "p = (\\overline{p} \\pm \\Delta p)",
      valueId: `calc-${partId}-result-p`,
      unitTex: "(10^{6}\\,\\mathrm{kg/m^3})",
    },
  ];
}

function buildPartCalculation(part) {
  const calcItems = getCalculationItems(part.id);
  const resultFormulas = getResultFormulas(part.id);

  return `
    <section class="py-5 border-b border-gray-200">
      <p class="text-lg md:text-xl font-bold mb-3">${part.shortTitle}</p>
      <p class="text-base md:text-lg font-semibold mb-2">Tính toán</p>
      <div class="flex flex-col gap-y-1 leading-relaxed">
        ${buildCalculationItem(calcItems[0])}
        ${buildSupportTable(part.id)}
        ${buildCalculationItem(calcItems[1])}
        ${buildCalculationItem(calcItems[2])}
        ${buildCalculationItem(calcItems[3])}
      </div>
      <p class="text-base md:text-lg font-semibold mt-5 mb-2">Ghi kết quả và làm tròn số</p>
      <div class="flex flex-col gap-y-3 text-sm md:text-lg leading-relaxed pl-2">
        ${resultFormulas.map(buildMathLine).join("")}
      </div>
      <div class="mt-5">
        <button id="exportBtn-${part.id}" class="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-md transition-all">
          Trích xuất dữ liệu ${part.shortTitle} (JSON)
        </button>
      </div>
      <div id="outputArea-${part.id}" class="mt-4 hidden">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">Dữ liệu đã nhập (${part.shortTitle}):</h2>
        <pre id="jsonContent-${part.id}" class="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs"></pre>
      </div>
    </section>
  `;
}

const CALCULATION_HTML = ``;

const LAB1_INNER_HTML = {
  GENERAL_INFO_HTML,
  TASK_METHOD_HTML,
  DATA_TABLE_HTML: buildDataTableHtml(),
  CALCULATION_HTML,
  MEASUREMENT_ACCURACY,
  PARTS,
};

window.LAB1_INNER_HTML = LAB1_INNER_HTML;
