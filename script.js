function getLabTemplates() {
  return window.LAB1_INNER_HTML || {};
}

const LAB1_STORAGE_KEY = "phys101.lab1.measurements.v1";

const PART_SWITCH_ACTIVE_CLASS =
  "border-blue-600 bg-blue-600 text-white font-semibold";
const PART_SWITCH_INACTIVE_CLASS =
  "border-slate-300 bg-white text-gray-900 font-medium";

function getPartIds() {
  const LAB = getLabTemplates();
  if (Array.isArray(LAB.PARTS) && LAB.PARTS.length > 0) {
    return LAB.PARTS.map((part) => String(part.id));
  }
  return ["1"];
}

function getPreferredPartId() {
  const partIds = getPartIds();
  return partIds.includes("2") ? "2" : partIds[0];
}

function getPartDeltaHt(partId, baseDeltaHt) {
  const LAB = getLabTemplates();
  const part = Array.isArray(LAB.PARTS)
    ? LAB.PARTS.find((item) => String(item.id) === String(partId))
    : null;

  const lengthDelta =
    part && Number.isFinite(Number(part.accuracy))
      ? Number(part.accuracy)
      : baseDeltaHt.a || 0;

  return {
    a: lengthDelta,
    b: lengthDelta,
    c: lengthDelta,
    m: baseDeltaHt.m || 0,
  };
}

function renderGeneralInfo() {
  const LAB = getLabTemplates();
  const root = document.getElementById("general-info");
  root.className = "max-w-6xl mx-auto mt-4 md:mt-8";
  root.innerHTML = LAB.GENERAL_INFO_HTML || "";
}

function renderTaskMethod() {
  const LAB = getLabTemplates();
  const root = document.getElementById("task-method");
  root.className = "max-w-6xl mx-auto";
  root.innerHTML = LAB.TASK_METHOD_HTML || "";
}

function renderDataTable() {
  const LAB = getLabTemplates();
  const root = document.getElementById("data-table");
  root.className = "max-w-6xl mx-auto";
  root.innerHTML = LAB.DATA_TABLE_HTML || "";
}

function renderCalculation() {
  const LAB = getLabTemplates();
  const root = document.getElementById("caculation");
  const html = LAB.CALCULATION_HTML || "";
  if (html.trim()) {
    root.className = "max-w-6xl mx-auto mb-8";
    root.innerHTML = html;
    return;
  }

  root.className = "hidden";
  root.innerHTML = "";
}

function collectTableData(partId) {
  const rows = document.querySelectorAll(`#physicsTable-${partId} tbody tr`);
  const output = [];

  rows.forEach((row) => {
    const rowType = row.cells[0].innerText.trim();
    const rowData = { type: rowType };
    const editableCells = row.querySelectorAll(".editable-cell");

    editableCells.forEach((cell) => {
      const key = cell.dataset.key;
      rowData[key] = cell.innerText.trim();
    });
    output.push(rowData);
  });

  return output;
}

function getRawMeasurementCells(partId) {
  return document.querySelectorAll(
    `.editable-cell[data-part="${partId}"][data-row="1"], .editable-cell[data-part="${partId}"][data-row="2"], .editable-cell[data-part="${partId}"][data-row="3"]`,
  );
}

function saveMeasurementsToLocalStorage() {
  try {
    const payload = getPartIds().flatMap((partId) =>
      Array.from(getRawMeasurementCells(partId)).map((cell) => ({
        part: partId,
        key: cell.dataset.key,
        row: cell.dataset.row,
        value: cell.innerText.trim(),
      })),
    );
    window.localStorage.setItem(LAB1_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage errors (private mode / quota / permission issues).
  }
}

function restoreMeasurementsFromLocalStorage() {
  try {
    const raw = window.localStorage.getItem(LAB1_STORAGE_KEY);
    if (!raw) {
      return;
    }

    const payload = JSON.parse(raw);
    if (!Array.isArray(payload)) {
      return;
    }

    payload.forEach((item) => {
      if (!item || !item.key || !item.row) {
        return;
      }
      const part = item.part ? String(item.part) : "1";
      const selector = `.editable-cell[data-part="${part}"][data-key="${item.key}"][data-row="${item.row}"]`;
      const cell = document.querySelector(selector);
      if (cell) {
        cell.innerText = typeof item.value === "string" ? item.value : "";
      }
    });
  } catch {
    // Ignore malformed data and keep UI usable.
  }
}

function getEditableGrid(partId) {
  const rows = Array.from(
    document.querySelectorAll(`#physicsTable-${partId} tbody tr`),
  );
  return rows
    .map((row) => Array.from(row.querySelectorAll(".editable-cell")))
    .filter((cells) => cells.length > 0);
}

function parseClipboardTable(plainText) {
  return plainText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => line.split("\t"));
}

function bindSpreadsheetPaste(partId) {
  const table = document.getElementById(`physicsTable-${partId}`);
  if (!table) {
    return;
  }

  table.addEventListener("paste", (event) => {
    const target = event.target;
    if (
      !(target instanceof HTMLElement) ||
      !target.classList.contains("editable-cell")
    ) {
      return;
    }

    const clipboardText = event.clipboardData
      ? event.clipboardData.getData("text/plain")
      : "";
    if (!clipboardText) {
      return;
    }

    const parsedRows = parseClipboardTable(clipboardText);
    const isGridPaste =
      parsedRows.length > 1 ||
      (parsedRows.length === 1 && parsedRows[0].length > 1);

    // Keep default paste behavior for single-cell values.
    if (!isGridPaste) {
      return;
    }

    event.preventDefault();

    const grid = getEditableGrid(partId);
    let startRow = -1;
    let startCol = -1;

    for (let r = 0; r < grid.length; r += 1) {
      const c = grid[r].indexOf(target);
      if (c !== -1) {
        startRow = r;
        startCol = c;
        break;
      }
    }

    if (startRow === -1 || startCol === -1) {
      return;
    }

    parsedRows.forEach((rowValues, rOffset) => {
      rowValues.forEach((value, cOffset) => {
        const cell = grid[startRow + rOffset]?.[startCol + cOffset];
        if (cell) {
          cell.innerText = value.trim();
        }
      });
    });

    table.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function setActivePartFilter(targetPart) {
  const validPartIds = getPartIds();
  const safeTargetPart = validPartIds.includes(targetPart)
    ? targetPart
    : getPreferredPartId();

  const buttons = document.querySelectorAll(
    ".part-switch-btn[data-part-filter]",
  );
  buttons.forEach((button) => {
    const isActive = button.dataset.partFilter === safeTargetPart;
    button.classList.remove(
      "border-blue-600",
      "bg-blue-600",
      "text-white",
      "font-semibold",
      "border-slate-300",
      "bg-white",
      "text-gray-900",
      "font-medium",
    );
    const classTokens = (
      isActive ? PART_SWITCH_ACTIVE_CLASS : PART_SWITCH_INACTIVE_CLASS
    ).split(" ");
    button.classList.add(...classTokens);
  });

  getPartIds().forEach((partId) => {
    const section = document.querySelector(`[data-part-section="${partId}"]`);
    if (!section) {
      return;
    }
    const shouldShow = safeTargetPart === partId;
    section.classList.toggle("hidden", !shouldShow);
  });

  const activeSection = document.querySelector(
    `[data-part-section="${safeTargetPart}"]`,
  );
  if (activeSection) {
    activeSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function bindPartQuickSwitch() {
  const switchRoot = document.getElementById("partQuickSwitch");
  if (!switchRoot) {
    return;
  }

  switchRoot.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-part-filter]");
    if (!button) {
      return;
    }
    const targetPart = button.dataset.partFilter || getPreferredPartId();
    setActivePartFilter(targetPart);
  });

  setActivePartFilter(getPreferredPartId());
}

function toNumber(value) {
  if (typeof value !== "string") {
    return Number.NaN;
  }
  return Number.parseFloat(value.replace(",", ".").trim());
}

function formatNumber(value, digits = 6) {
  if (!Number.isFinite(value)) {
    return "-";
  }
  const fixed = value.toFixed(digits);
  return fixed.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

function getMeasurementSeries(partId) {
  const keys = ["a", "b", "c", "m"];
  const series = {};

  keys.forEach((key) => {
    series[key] = [1, 2, 3].map((rowNumber) => {
      const selector = `.editable-cell[data-part="${partId}"][data-key="${key}"][data-row="${rowNumber}"]`;
      const cell = document.querySelector(selector);
      return toNumber(cell ? cell.innerText : "");
    });
  });

  return series;
}

function calculateLabValues(series, deltaHt) {
  const keys = ["a", "b", "c", "m"];
  const means = {};
  const deltasEach = {};
  const meanDeltas = {};
  const totalDeltas = {};

  for (const key of keys) {
    const values = series[key] || [];
    const hasInvalid = values.some((v) => !Number.isFinite(v));
    if (hasInvalid) {
      return null;
    }

    means[key] = values.reduce((sum, v) => sum + v, 0) / values.length;
    deltasEach[key] = values.map((v) => Math.abs(v - means[key]));
    meanDeltas[key] =
      deltasEach[key].reduce((sum, v) => sum + v, 0) / deltasEach[key].length;
    totalDeltas[key] = meanDeltas[key] + (deltaHt[key] || 0);
  }

  if (means.a === 0 || means.b === 0 || means.c === 0 || means.m === 0) {
    return null;
  }

  const vMean = means.a * means.b * means.c;
  const vDelta =
    vMean *
    (totalDeltas.a / means.a +
      totalDeltas.b / means.b +
      totalDeltas.c / means.c);

  const pMean = means.m / vMean;
  const pDelta = pMean * (totalDeltas.m / means.m + vDelta / vMean);

  return {
    means,
    deltasEach,
    meanDeltas,
    totalDeltas,
    vMean,
    vDelta,
    pMean,
    pDelta,
  };
}

function fillAverageRow(partId, means) {
  Object.entries(means).forEach(([key, value]) => {
    const avgCell = document.querySelector(
      `.editable-cell[data-part="${partId}"][data-key="${key}"][data-row="Trung bình"]`,
    );
    if (avgCell) {
      avgCell.innerText = formatNumber(value, 4);
    }
  });
}

function clearAverageRow(partId) {
  ["a", "b", "c", "m"].forEach((key) => {
    const avgCell = document.querySelector(
      `.editable-cell[data-part="${partId}"][data-key="${key}"][data-row="Trung bình"]`,
    );
    if (avgCell) {
      avgCell.innerText = "";
    }
  });
}

function setCalculationValue(id, value) {
  const target = document.getElementById(id);
  if (target) {
    target.textContent = value;
  }
}

function setCalculationMath(id, texExpression) {
  const target = document.getElementById(id);
  if (!target) {
    return null;
  }
  target.innerHTML = `\\( ${texExpression} \\)`;
  return target;
}

function typesetTargets(targets) {
  if (!targets.length) {
    return;
  }
  if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
    window.MathJax.typesetPromise(targets).catch(() => {
      // Keep UI responsive even if one expression is malformed.
    });
  }
}

function formatApproxNumber(value, digits = 4) {
  return formatNumber(value, digits);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getPartMeta(partId) {
  const LAB = getLabTemplates();
  const part = Array.isArray(LAB.PARTS)
    ? LAB.PARTS.find((item) => String(item.id) === String(partId))
    : null;
  return part || { shortTitle: `Phan ${partId}` };
}

function getResultSnapshot(partId) {
  const keys = ["a", "b", "c", "m", "v", "p"];
  const result = {};
  keys.forEach((key) => {
    const node = document.getElementById(`calc-${partId}-result-${key}`);
    result[key] = node ? node.textContent.trim() : "-";
  });
  return result;
}

function buildPartPdfSection(partId) {
  const partMeta = getPartMeta(partId);
  const tableData = collectTableData(partId);
  const result = getResultSnapshot(partId);

  const sectionTitle = escapeHtml(partMeta.shortTitle);
  const now = new Date();
  const timestamp = now.toLocaleString("vi-VN");

  const rowsHtml = tableData
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.type || "")}</td>
          <td>${escapeHtml(row.a || "")}</td>
          <td>${escapeHtml(row.b || "")}</td>
          <td>${escapeHtml(row.c || "")}</td>
          <td>${escapeHtml(row.m || "")}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <section class="section part-section">
      <h2>${sectionTitle}</h2>

      <div class="section">
        <h3>Bang so lieu</h3>
        <table>
          <thead>
            <tr>
              <th>Lan do</th>
              <th>a</th>
              <th>b</th>
              <th>c</th>
              <th>m</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h3>Ket qua tong hop</h3>
        <p>a = ${escapeHtml(result.a)}</p>
        <p>b = ${escapeHtml(result.b)}</p>
        <p>c = ${escapeHtml(result.c)}</p>
        <p>m = ${escapeHtml(result.m)}</p>
        <p>V = ${escapeHtml(result.v)}</p>
        <p>p = ${escapeHtml(result.p)}</p>
      </div>
    </section>
  `;
}

function buildPdfHtmlAllParts() {
  const now = new Date();
  const timestamp = now.toLocaleString("vi-VN");
  const sectionsHtml = getPartIds().map(buildPartPdfSection).join("");

  return `
    <!doctype html>
    <html lang="vi">
      <head>
        <meta charset="UTF-8" />
        <title>Bao cao tong hop 2 phan</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #111827; }
          h1, h2, h3 { margin: 0 0 8px 0; }
          p { margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #111827; padding: 6px; text-align: center; font-size: 12px; }
          .section { margin-top: 18px; }
          .part-section { break-inside: avoid; }
          .part-section + .part-section { margin-top: 28px; padding-top: 16px; border-top: 2px solid #d1d5db; }
        </style>
      </head>
      <body>
        <h1>Bai 1 - Bao cao thuc hanh vat ly</h1>
        <p>Thoi gian trich xuat: ${escapeHtml(timestamp)}</p>
        ${sectionsHtml}
      </body>
    </html>
  `;
}

function exportPartPdf() {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    alert("Trinh duyet dang chan popup. Hay cho phep popup de xuat PDF.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(buildPdfHtmlAllParts());
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function fillSupportTable(partId, calculation, series) {
  const keys = ["a", "b", "c", "m"];
  const dataRows = ["1", "2", "3"];

  if (!calculation) {
    ["1", "2", "3", "avg"].forEach((rowToken) => {
      keys.forEach((key) => {
        setCalculationValue(`sup-${partId}-${rowToken}-value-${key}`, "-");
        setCalculationValue(`sup-${partId}-${rowToken}-delta-${key}`, "-");
      });
    });
    return;
  }

  dataRows.forEach((rowToken, idx) => {
    keys.forEach((key) => {
      const measuredValue = series[key][idx];
      const meanValue = calculation.means[key];
      const deltaValue = calculation.deltasEach[key][idx];
      const measuredApprox = formatApproxNumber(measuredValue);
      const meanApprox = formatApproxNumber(meanValue);
      const deltaApprox = formatApproxNumber(deltaValue);

      setCalculationValue(
        `sup-${partId}-${rowToken}-value-${key}`,
        measuredApprox,
      );
      setCalculationValue(
        `sup-${partId}-${rowToken}-delta-${key}`,
        deltaApprox,
      );
    });
  });

  keys.forEach((key) => {
    const meanApprox = formatApproxNumber(calculation.means[key]);
    const dMeanApprox = formatApproxNumber(calculation.meanDeltas[key]);

    setCalculationValue(`sup-${partId}-avg-value-${key}`, meanApprox);
    setCalculationValue(`sup-${partId}-avg-delta-${key}`, dMeanApprox);
  });
}

function renderAutoFillResult(partId, calculation, series, deltaHt) {
  const mathTargets = [];
  const ids = [
    "delta-ht-a",
    "delta-ht-b",
    "delta-ht-c",
    "delta-ht-m",
    "total-delta-a",
    "total-delta-b",
    "total-delta-c",
    "total-delta-m",
    "v-mean",
    "v-delta",
    "p-mean",
    "p-delta",
    "result-a",
    "result-b",
    "result-c",
    "result-m",
    "result-v",
    "result-p",
  ];
  const subIds = [
    "total-delta-a",
    "total-delta-b",
    "total-delta-c",
    "total-delta-m",
    "v-mean",
    "v-delta",
    "p-mean",
    "p-delta",
  ];

  if (!calculation) {
    ids.forEach((id) => setCalculationValue(`calc-${partId}-${id}`, "-"));
    subIds.forEach((id) => setCalculationValue(`sub-${partId}-${id}`, "-"));
    fillSupportTable(partId, null, null);
    return;
  }

  fillSupportTable(partId, calculation, series);

  const { means, meanDeltas, totalDeltas, vMean, vDelta, pMean, pDelta } =
    calculation;

  setCalculationValue(
    `calc-${partId}-delta-ht-a`,
    formatNumber(deltaHt.a || 0, 4),
  );
  setCalculationValue(
    `calc-${partId}-delta-ht-b`,
    formatNumber(deltaHt.b || 0, 4),
  );
  setCalculationValue(
    `calc-${partId}-delta-ht-c`,
    formatNumber(deltaHt.c || 0, 4),
  );
  setCalculationValue(
    `calc-${partId}-delta-ht-m`,
    formatNumber(deltaHt.m || 0, 4),
  );

  setCalculationValue(
    `calc-${partId}-total-delta-a`,
    formatNumber(totalDeltas.a, 4),
  );
  setCalculationValue(
    `calc-${partId}-total-delta-b`,
    formatNumber(totalDeltas.b, 4),
  );
  setCalculationValue(
    `calc-${partId}-total-delta-c`,
    formatNumber(totalDeltas.c, 4),
  );
  setCalculationValue(
    `calc-${partId}-total-delta-m`,
    formatNumber(totalDeltas.m, 4),
  );
  mathTargets.push(
    setCalculationMath(
      `sub-${partId}-total-delta-a`,
      `${formatNumber(meanDeltas.a, 4)} + ${formatNumber(deltaHt.a || 0, 4)}`,
    ),
  );
  mathTargets.push(
    setCalculationMath(
      `sub-${partId}-total-delta-b`,
      `${formatNumber(meanDeltas.b, 4)} + ${formatNumber(deltaHt.b || 0, 4)}`,
    ),
  );
  mathTargets.push(
    setCalculationMath(
      `sub-${partId}-total-delta-c`,
      `${formatNumber(meanDeltas.c, 4)} + ${formatNumber(deltaHt.c || 0, 4)}`,
    ),
  );
  mathTargets.push(
    setCalculationMath(
      `sub-${partId}-total-delta-m`,
      `${formatNumber(meanDeltas.m, 4)} + ${formatNumber(deltaHt.m || 0, 4)}`,
    ),
  );

  setCalculationValue(`calc-${partId}-v-mean`, formatNumber(vMean, 6));
  mathTargets.push(
    setCalculationMath(
      `sub-${partId}-v-mean`,
      `${formatNumber(means.a, 4)} \\times ${formatNumber(means.b, 4)} \\times ${formatNumber(means.c, 4)}`,
    ),
  );
  setCalculationValue(`calc-${partId}-v-delta`, formatNumber(vDelta, 6));
  mathTargets.push(
    setCalculationMath(
      `sub-${partId}-v-delta`,
      `${formatNumber(vMean, 6)} \\times \\left(\\dfrac{${formatNumber(totalDeltas.a, 4)}}{${formatNumber(means.a, 4)}} + \\dfrac{${formatNumber(totalDeltas.b, 4)}}{${formatNumber(means.b, 4)}} + \\dfrac{${formatNumber(totalDeltas.c, 4)}}{${formatNumber(means.c, 4)}}\\right)`,
    ),
  );

  setCalculationValue(`calc-${partId}-p-mean`, formatNumber(pMean, 6));
  mathTargets.push(
    setCalculationMath(
      `sub-${partId}-p-mean`,
      `\\dfrac{${formatNumber(means.m, 4)}}{${formatNumber(vMean, 6)}}`,
    ),
  );
  setCalculationValue(`calc-${partId}-p-delta`, formatNumber(pDelta, 6));
  mathTargets.push(
    setCalculationMath(
      `sub-${partId}-p-delta`,
      `${formatNumber(pMean, 6)} \\times \\left(\\dfrac{${formatNumber(totalDeltas.m, 4)}}{${formatNumber(means.m, 4)}} + \\dfrac{${formatNumber(vDelta, 6)}}{${formatNumber(vMean, 6)}}\\right)`,
    ),
  );

  setCalculationValue(
    `calc-${partId}-result-a`,
    `(${formatNumber(means.a, 4)} ± ${formatNumber(totalDeltas.a, 4)})`,
  );
  setCalculationValue(
    `calc-${partId}-result-b`,
    `(${formatNumber(means.b, 4)} ± ${formatNumber(totalDeltas.b, 4)})`,
  );
  setCalculationValue(
    `calc-${partId}-result-c`,
    `(${formatNumber(means.c, 4)} ± ${formatNumber(totalDeltas.c, 4)})`,
  );
  setCalculationValue(
    `calc-${partId}-result-m`,
    `(${formatNumber(means.m, 4)} ± ${formatNumber(totalDeltas.m, 4)})`,
  );
  setCalculationValue(
    `calc-${partId}-result-v`,
    `(${formatNumber(vMean, 6)} ± ${formatNumber(vDelta, 6)})`,
  );
  setCalculationValue(
    `calc-${partId}-result-p`,
    `(${formatNumber(pMean, 6)} ± ${formatNumber(pDelta, 6)})`,
  );

  typesetTargets(mathTargets.filter(Boolean));
}

function bindAutoFillCalculation() {
  const LAB = getLabTemplates();
  const baseDeltaHt = (LAB &&
    LAB.MEASUREMENT_ACCURACY &&
    LAB.MEASUREMENT_ACCURACY.deltaHt) || {
    a: 0.05,
    b: 0.05,
    c: 0.05,
    m: 0.01,
  };

  getPartIds().forEach((partId) => {
    const deltaHt = getPartDeltaHt(partId, baseDeltaHt);

    const runCalculation = () => {
      const series = getMeasurementSeries(partId);
      const calculation = calculateLabValues(series, deltaHt);
      if (calculation) {
        fillAverageRow(partId, calculation.means);
      } else {
        clearAverageRow(partId);
      }
      renderAutoFillResult(partId, calculation, series, deltaHt);
      saveMeasurementsToLocalStorage();
    };

    const table = document.getElementById(`physicsTable-${partId}`);
    if (table) {
      table.addEventListener("input", runCalculation);
    }

    runCalculation();
  });
}

function bindActions() {
  getPartIds().forEach((partId) => {
    const clearBtnTop = document.getElementById(`clearBtnTop-${partId}`);
    const clearBtn = document.getElementById(`clearBtn-${partId}`);
    const pdfBtn = document.getElementById(`pdfBtn-${partId}`);
    const exportBtn = document.getElementById(`exportBtn-${partId}`);
    const outputArea = document.getElementById(`outputArea-${partId}`);
    const jsonContent = document.getElementById(`jsonContent-${partId}`);

    const handleClear = () => {
      const cells = document.querySelectorAll(
        `.editable-cell[data-part="${partId}"]`,
      );
      cells.forEach((cell) => {
        cell.innerText = "";
      });

      if (outputArea) {
        outputArea.classList.add("hidden");
      }
      if (jsonContent) {
        jsonContent.textContent = "";
      }

      const table = document.getElementById(`physicsTable-${partId}`);
      if (table) {
        table.dispatchEvent(new Event("input", { bubbles: true }));
      }
    };

    if (clearBtn) {
      clearBtn.addEventListener("click", handleClear);
    }

    if (clearBtnTop) {
      clearBtnTop.addEventListener("click", handleClear);
    }

    if (pdfBtn) {
      pdfBtn.addEventListener("click", () => {
        exportPartPdf();
      });
    }

    if (exportBtn && outputArea && jsonContent) {
      exportBtn.addEventListener("click", () => {
        const data = collectTableData(partId);
        jsonContent.textContent = JSON.stringify(data, null, 2);
        outputArea.classList.remove("hidden");
        outputArea.scrollIntoView({ behavior: "smooth" });
      });
    }
  });
}

function typesetMath() {
  const runTypeset = () => {
    if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
      window.MathJax.typesetPromise().catch(() => {
        // Keep UI responsive even if a malformed formula appears.
      });
    }
  };

  if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
    runTypeset();
    return;
  }

  const mathScript = document.getElementById("MathJax-script");
  if (mathScript && !mathScript.dataset.boundTypeset) {
    mathScript.dataset.boundTypeset = "true";
    mathScript.addEventListener("load", runTypeset, { once: true });
  }

  // Fallback retry in case the script is already cached and event timing is missed.
  setTimeout(runTypeset, 300);
}

function renderApp() {
  document.body.className = "bg-gray-100 min-h-screen p-4 md:p-8";
  if (!window.LAB1_INNER_HTML) {
    console.warn("LAB1 templates are not loaded yet.");
  }
  renderGeneralInfo();
  renderTaskMethod();
  renderDataTable();
  bindPartQuickSwitch();
  restoreMeasurementsFromLocalStorage();
  renderCalculation();
  getPartIds().forEach((partId) => bindSpreadsheetPaste(partId));
  bindActions();
  bindAutoFillCalculation();
  typesetMath();
}

document.addEventListener("DOMContentLoaded", renderApp);
