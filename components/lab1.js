const MEASUREMENT_ACCURACY = {
  caliperMm: 0.05,
  deltaHt: {
    a: 0.05,
    b: 0.05,
    c: 0.05,
    m: 0.01,
  },
};

const GENERAL_INFO_HTML = `
  <div class="bg-white p-4 md:p-6 shadow-xl border border-gray-300">
    <p class="text-lg md:text-2xl font-bold uppercase mb-2 leading-snug">
			Bài 1: Đo các hằng số cơ bản: chiều dài, khối lượng, thời gian
		</p>
    <div class="mb-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm md:text-lg font-medium border-b-2 border-black pb-3 md:pb-4 leading-relaxed">
			<div class="flex items-center gap-2"><span>Bảng 1</span></div>
			<div>Độ chính xác của thước kẹp: <span class="border-b border-dotted border-black px-4 ml-1">${MEASUREMENT_ACCURACY.caliperMm}</span> (mm)</div>
			<div>\\( (\\Delta m)_{\\mathrm{ht}} = ${MEASUREMENT_ACCURACY.deltaHt.m}\\,\\mathrm{g} \\)</div>
		</div>
	</div>
`;

const TASK_METHOD_HTML = `
  <div class="bg-white px-4 md:px-6 pb-2 border-x border-gray-300">
    <p class="text-lg md:text-xl font-bold mb-2">I. Nhiệm vụ và phương pháp đo</p>
    <ul class="list-disc pl-5 md:pl-6 space-y-1 text-sm md:text-base leading-relaxed">
			<li>Đo các kích thước \\(a, b, c\\) và khối lượng \\(m\\) của mẫu.</li>
			<li>Lặp lại phép đo 3 lần cho mỗi đại lượng.</li>
			<li>Tính giá trị trung bình, sai số trung bình và sai số toàn phần.</li>
		</ul>
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
    (col) => `<th class="px-2 md:px-3 py-2 md:py-3 min-w-[96px] md:min-w-[120px]">\\( ${col.key} \\)</th>`,
  ).join("");

  return `
    <tr class="bg-slate-100">
			<th class="px-2 md:px-3 py-2 md:py-3 min-w-[88px] md:min-w-[110px] font-bold text-gray-800" rowspan="2">Lần đo</th>
			${dynamicHeaders}
		</tr>
	`;
}

function buildMeasurementUnitRow() {
  const dynamicUnits = MEASURE_COLUMNS.map(
    (col) =>
      `<th class="px-1 md:px-2 py-1.5 md:py-2 text-[11px] md:text-sm text-slate-700">\\( (10^{-3}\\,\\mathrm{${col.unit}}) \\)</th>`,
  ).join("");

  return `<tr class="bg-slate-50">${dynamicUnits}</tr>`;
}

function buildMeasurementCells(rowLabel) {
  return MEASURE_COLUMNS.map(
    (col) => `
			<td class="py-2.5 md:py-3 px-1.5 md:px-2 border border-black editable-cell outline-none transition-colors hover:bg-blue-50" contenteditable="true" data-key="${col.key}" data-row="${rowLabel}"></td>
		`,
  ).join("");
}

function buildMeasurementBodyRows() {
  return MEASURE_ROWS.map((rowLabel, index) => {
    const isAvgRow = rowLabel === "Trung bình";
    const rowTone = isAvgRow
      ? "bg-yellow-50 font-bold"
      : index % 2 === 0
        ? "bg-white"
        : "bg-slate-50/60";
    return `
			<tr class="${rowTone}">
        <td class="py-2.5 md:py-3 px-1.5 md:px-2 border border-black font-semibold">${rowLabel}</td>
				${buildMeasurementCells(rowLabel)}
			</tr>
		`;
  }).join("");
}

const DATA_TABLE_HTML = `
  <div class="bg-white px-3 md:px-6 py-4 border-x border-gray-300">
    <p class="text-lg md:text-xl font-bold mb-3">II. Bảng số liệu (Nhập vào các giá trị đo)</p>
    <div class="overflow-x-auto rounded border border-slate-300 shadow-sm">
      <table class="w-full text-center border-collapse border-2 border-black text-xs md:text-base" id="physicsTable">
				<thead>
					${buildMeasurementHeaderRow()}
					${buildMeasurementUnitRow()}
				</thead>
				<tbody>
					${buildMeasurementBodyRows()}
				</tbody>
			</table>
		</div>
	</div>
`;

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

function buildSupportTableRows() {
  return SUPPORT_TABLE_ROWS.map((row, index) => {
    const isAvgRow = row.token === "avg";
    const cells = SUPPORT_TABLE_COLUMNS.map((col) => {
      const classes = isAvgRow
        ? "px-1.5 md:px-2 py-2 border border-black font-semibold bg-yellow-50"
        : index % 2 === 0
          ? "px-1.5 md:px-2 py-2 border border-black bg-white"
          : "px-1.5 md:px-2 py-2 border border-black bg-slate-50/60";
      return `<td class="${classes}" id="sup-${row.token}-${col.kind}-${col.key}">-</td>`;
    }).join("");

    return `
          <tr class="${isAvgRow ? "bg-yellow-50 font-semibold" : ""}">
            <td class="px-1.5 md:px-2 py-2 border border-black">${row.label}</td>
            ${cells}
          </tr>
        `;
  }).join("");
}

const SUPPORT_TABLE_HTML = `
    <div class="py-4 border-b border-gray-200 space-y-2">
      <p class="font-semibold text-base md:text-lg">b) Bảng phụ số liệu tính trung gian</p>

      <div class="text-sm md:text-base leading-relaxed px-3 py-2 space-y-1 bg-slate-50 rounded border border-slate-200">
        <p><b>Công thức cơ bản:</b></p>
        <p>\\( \\overline{x} = \\dfrac{x_1 + x_2 + x_3}{3} \\) </p>
        <p>\\( \\Delta x_i = |x_i - \\overline{x}| \\) </p>
        <p>\\( \\overline{\\Delta x} = \\dfrac{\\Delta x_1 + \\Delta x_2 + \\Delta x_3}{3} \\) </p>
      </div>

      <div class="overflow-x-auto rounded border border-slate-300 shadow-sm">
        <table class="w-full text-center border-collapse border-2 border-black text-xs md:text-base">
          <thead>
            ${buildSupportTableHeaderRow()}
            ${buildSupportTableUnitRow()}
          </thead>
          <tbody>
            ${buildSupportTableRows()}
          </tbody>
        </table>
      </div>
    </div>
`;

const CALCULATION_ITEMS = [
  {
    blockClass: "pb-4 border-b border-gray-200 space-y-2",
    title:
      "a) Tính \\( (\\Delta x)_{\\mathrm{ht}} \\) của từng đối tượng đo <b>(Cấp chính xác của dụng cụ đo tương ứng)</b>",
    lines: [
      `(\\Delta a)_{\\mathrm{ht}} = ${MEASUREMENT_ACCURACY.deltaHt.a}`,
      `(\\Delta b)_{\\mathrm{ht}} = ${MEASUREMENT_ACCURACY.deltaHt.b}`,
      `(\\Delta c)_{\\mathrm{ht}} = ${MEASUREMENT_ACCURACY.deltaHt.c}`,
      `(\\Delta m)_{\\mathrm{ht}} = ${MEASUREMENT_ACCURACY.deltaHt.m}`,
    ],
  },
  {
    blockClass: "pt-4 space-y-2",
    title: "c) Tính sai số toàn phần của từng đối tượng đo",
    lines: [
      {
        mathExpression:
          "\\Delta a = \\overline{\\Delta a} + (\\Delta a)_{\\mathrm{ht}}",
        valueId: "calc-total-delta-a",
        substituteId: "sub-total-delta-a",
      },
      {
        mathExpression:
          "\\Delta b = \\overline{\\Delta b} + (\\Delta b)_{\\mathrm{ht}}",
        valueId: "calc-total-delta-b",
        substituteId: "sub-total-delta-b",
      },
      {
        mathExpression:
          "\\Delta c = \\overline{\\Delta c} + (\\Delta c)_{\\mathrm{ht}}",
        valueId: "calc-total-delta-c",
        substituteId: "sub-total-delta-c",
      },
      {
        mathExpression:
          "\\Delta m = \\overline{\\Delta m} + (\\Delta m)_{\\mathrm{ht}}",
        valueId: "calc-total-delta-m",
        substituteId: "sub-total-delta-m",
      },
    ],
  },
  {
    blockClass: "pt-4 space-y-2",
    title: "d) Tính \\( \\overline{V} \\) và \\( \\Delta V \\)",
    lines: [
      {
        mathExpression: "\\overline{V} = \\overline{a}\\,\\overline{b}\\,\\overline{c}",
        valueId: "calc-v-mean",
        substituteId: "sub-v-mean",
      },
      {
        mathExpression:
          "\\Delta V = \\overline{V}\\left(\\dfrac{\\Delta a}{\\overline{a}} + \\dfrac{\\Delta b}{\\overline{b}} + \\dfrac{\\Delta c}{\\overline{c}}\\right)",
        valueId: "calc-v-delta",
        substituteId: "sub-v-delta",
      },
    ],
  },
  {
    blockClass: "pt-4 space-y-2",
    title: "e) Tính \\( \\overline{p} \\) và \\( \\Delta p \\)",
    lines: [
      {
        mathExpression: "\\overline{p} = \\dfrac{\\overline{m}}{\\overline{V}}",
        valueId: "calc-p-mean",
        substituteId: "sub-p-mean",
      },
      {
        mathExpression:
          "\\Delta p = \\overline{p}\\left(\\dfrac{\\Delta m}{\\overline{m}} + \\dfrac{\\Delta V}{\\overline{V}}\\right)",
        valueId: "calc-p-delta",
        substituteId: "sub-p-delta",
      },
    ],
  },
];

const RESULT_FORMULAS = [
  {
    mathExpression: "a = (\\overline{a} \\pm \\Delta a)",
    valueId: "calc-result-a",
  },
  {
    mathExpression: "b = (\\overline{b} \\pm \\Delta b)",
    valueId: "calc-result-b",
  },
  {
    mathExpression: "c = (\\overline{c} \\pm \\Delta c)",
    valueId: "calc-result-c",
  },
  {
    mathExpression: "m = (\\overline{m} \\pm \\Delta m)",
    valueId: "calc-result-m",
  },
  {
    mathExpression: "V = (\\overline{V} \\pm \\Delta V)",
    valueId: "calc-result-v",
  },
  {
    mathExpression: "p = (\\overline{p} \\pm \\Delta p)",
    valueId: "calc-result-p",
  },
];

function buildMathLine(line) {
  const lineConfig = typeof line === "string" ? { mathExpression: line } : line;
  if (lineConfig.substituteId && lineConfig.valueId) {
    return `<p>\\( ${lineConfig.mathExpression} \\) = <span id="${lineConfig.substituteId}" class="font-medium text-gray-800">-</span> = <span id="${lineConfig.valueId}" class="font-semibold text-blue-700">-</span></p>`;
  }

  if (lineConfig.valueId) {
    return `<p>\\( ${lineConfig.mathExpression} \\) = <span id="${lineConfig.valueId}" class="font-semibold text-blue-700">-</span></p>`;
  }

  return `<p>\\( ${lineConfig.mathExpression} \\)</p>`;
}

function buildCalculationItem(item) {
  const linesHtml = item.lines.map(buildMathLine).join("");
  return `
			<div class="${item.blockClass}">
        <p class="font-semibold text-base md:text-lg">${item.title}</p>
        <div class="pl-3 md:pl-6 space-y-1 text-sm md:text-lg">
					${linesHtml}
				</div>
			</div>
		`;
}

function buildCalculationItems() {
  return CALCULATION_ITEMS.map(buildCalculationItem).join("");
}

function buildCalculationFlow() {
  const sectionA = CALCULATION_ITEMS[0]
    ? buildCalculationItem(CALCULATION_ITEMS[0])
    : "";
  const sectionC = CALCULATION_ITEMS[1]
    ? buildCalculationItem(CALCULATION_ITEMS[1])
    : "";
  const sectionD = CALCULATION_ITEMS[2]
    ? buildCalculationItem(CALCULATION_ITEMS[2])
    : "";
  const sectionE = CALCULATION_ITEMS[3]
    ? buildCalculationItem(CALCULATION_ITEMS[3])
    : "";

  return `${sectionA}${SUPPORT_TABLE_HTML}${sectionC}${sectionD}${sectionE}`;
}

function buildResultFormulas() {
  return RESULT_FORMULAS.map(buildMathLine).join("");
}

const CALCULATION_HTML = `
  <div class="bg-white px-3 md:px-6 py-5 md:py-6 border border-gray-300">
    <p class="text-lg md:text-xl font-bold mb-3">II.1. Tính toán</p>
    <div class="flex flex-col gap-y-1 leading-relaxed">
      ${buildCalculationFlow()}
		</div>

    <p class="text-lg md:text-xl font-bold mt-6 mb-3">II.2. Ghi kết quả và làm tròn số</p>
    <div class="flex flex-col gap-y-3 text-sm md:text-lg leading-relaxed pl-2">
			${buildResultFormulas()}
		</div>
    <div class="mt-6">
      <button id="exportBtn" class="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-md transition-all">
				Trích xuất dữ liệu (JSON)
			</button>
		</div>
		<div id="outputArea" class="mt-4 hidden">
			<h2 class="text-lg font-semibold text-gray-700 mb-2">Dữ liệu đã nhập:</h2>
			<pre id="jsonContent" class="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs"></pre>
		</div>
	</div>
`;

const LAB1_INNER_HTML = {
  GENERAL_INFO_HTML,
  TASK_METHOD_HTML,
  DATA_TABLE_HTML,
  CALCULATION_HTML,
  MEASUREMENT_ACCURACY,
};

window.LAB1_INNER_HTML = LAB1_INNER_HTML;
