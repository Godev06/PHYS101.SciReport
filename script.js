function getLabTemplates() {
  return window.LAB1_INNER_HTML || {};
}

const LAB1_STORAGE_KEY = "phys101.lab1.measurements.v1";

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
  root.className = "max-w-6xl mx-auto mb-8";
  root.innerHTML = LAB.CALCULATION_HTML || "";
}

function collectTableData() {
  const rows = document.querySelectorAll("#physicsTable tbody tr");
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

function getRawMeasurementCells() {
  return document.querySelectorAll(
    '.editable-cell[data-row="1"], .editable-cell[data-row="2"], .editable-cell[data-row="3"]',
  );
}

function saveMeasurementsToLocalStorage() {
  try {
    const payload = Array.from(getRawMeasurementCells()).map((cell) => ({
      key: cell.dataset.key,
      row: cell.dataset.row,
      value: cell.innerText.trim(),
    }));
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
      const selector = `.editable-cell[data-key="${item.key}"][data-row="${item.row}"]`;
      const cell = document.querySelector(selector);
      if (cell) {
        cell.innerText = typeof item.value === "string" ? item.value : "";
      }
    });
  } catch {
    // Ignore malformed data and keep UI usable.
  }
}

function getEditableGrid() {
  const rows = Array.from(document.querySelectorAll("#physicsTable tbody tr"));
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

function bindSpreadsheetPaste() {
  const table = document.getElementById("physicsTable");
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

    const grid = getEditableGrid();
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

function getMeasurementSeries() {
  const keys = ["a", "b", "c", "m"];
  const series = {};

  keys.forEach((key) => {
    series[key] = [1, 2, 3].map((rowNumber) => {
      const selector = `.editable-cell[data-key="${key}"][data-row="${rowNumber}"]`;
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

function fillAverageRow(means) {
  Object.entries(means).forEach(([key, value]) => {
    const avgCell = document.querySelector(
      `.editable-cell[data-key="${key}"][data-row="Trung bình"]`,
    );
    if (avgCell) {
      avgCell.innerText = formatNumber(value, 4);
    }
  });
}

function clearAverageRow() {
  ["a", "b", "c", "m"].forEach((key) => {
    const avgCell = document.querySelector(
      `.editable-cell[data-key="${key}"][data-row="Trung bình"]`,
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

function formatApproxNumber(value, digits = 4) {
  return formatNumber(value, digits);
}

function fillSupportTable(calculation, series) {
  const keys = ["a", "b", "c", "m"];
  const dataRows = ["1", "2", "3"];

  if (!calculation) {
    ["1", "2", "3", "avg"].forEach((rowToken) => {
      keys.forEach((key) => {
        setCalculationValue(`sup-${rowToken}-value-${key}`, "-");
        setCalculationValue(`sup-${rowToken}-delta-${key}`, "-");
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

      setCalculationValue(`sup-${rowToken}-value-${key}`, measuredApprox);
      setCalculationValue(`sup-${rowToken}-delta-${key}`, deltaApprox);
    });
  });

  keys.forEach((key) => {
    const meanApprox = formatApproxNumber(calculation.means[key]);
    const dMeanApprox = formatApproxNumber(calculation.meanDeltas[key]);

    setCalculationValue(`sup-avg-value-${key}`, meanApprox);
    setCalculationValue(`sup-avg-delta-${key}`, dMeanApprox);
  });
}

function renderAutoFillResult(calculation, series, deltaHt) {
  if (!calculation) {
    [
      "calc-total-delta-a",
      "calc-total-delta-b",
      "calc-total-delta-c",
      "calc-total-delta-m",
      "sub-total-delta-a",
      "sub-total-delta-b",
      "sub-total-delta-c",
      "sub-total-delta-m",
      "calc-v-mean",
      "sub-v-mean",
      "calc-v-delta",
      "sub-v-delta",
      "calc-p-mean",
      "sub-p-mean",
      "calc-p-delta",
      "sub-p-delta",
      "calc-result-a",
      "calc-result-b",
      "calc-result-c",
      "calc-result-m",
      "calc-result-v",
      "calc-result-p",
    ].forEach((id) => setCalculationValue(id, "-"));
    fillSupportTable(null, null);
    return;
  }

  fillSupportTable(calculation, series);

  const { means, meanDeltas, totalDeltas, vMean, vDelta, pMean, pDelta } =
    calculation;

  setCalculationValue("calc-total-delta-a", formatNumber(totalDeltas.a, 4));
  setCalculationValue("calc-total-delta-b", formatNumber(totalDeltas.b, 4));
  setCalculationValue("calc-total-delta-c", formatNumber(totalDeltas.c, 4));
  setCalculationValue("calc-total-delta-m", formatNumber(totalDeltas.m, 4));
  setCalculationValue(
    "sub-total-delta-a",
    `${formatNumber(meanDeltas.a, 4)} + ${formatNumber(deltaHt.a || 0, 4)}`,
  );
  setCalculationValue(
    "sub-total-delta-b",
    `${formatNumber(meanDeltas.b, 4)} + ${formatNumber(deltaHt.b || 0, 4)}`,
  );
  setCalculationValue(
    "sub-total-delta-c",
    `${formatNumber(meanDeltas.c, 4)} + ${formatNumber(deltaHt.c || 0, 4)}`,
  );
  setCalculationValue(
    "sub-total-delta-m",
    `${formatNumber(meanDeltas.m, 4)} + ${formatNumber(deltaHt.m || 0, 4)}`,
  );

  setCalculationValue("calc-v-mean", formatNumber(vMean, 6));
  setCalculationValue(
    "sub-v-mean",
    `${formatNumber(means.a, 4)} × ${formatNumber(means.b, 4)} × ${formatNumber(means.c, 4)}`,
  );
  setCalculationValue("calc-v-delta", formatNumber(vDelta, 6));
  setCalculationValue(
    "sub-v-delta",
    `${formatNumber(vMean, 6)} × (${formatNumber(totalDeltas.a, 4)}/${formatNumber(means.a, 4)} + ${formatNumber(totalDeltas.b, 4)}/${formatNumber(means.b, 4)} + ${formatNumber(totalDeltas.c, 4)}/${formatNumber(means.c, 4)})`,
  );

  setCalculationValue("calc-p-mean", formatNumber(pMean, 6));
  setCalculationValue(
    "sub-p-mean",
    `${formatNumber(means.m, 4)} / ${formatNumber(vMean, 6)}`,
  );
  setCalculationValue("calc-p-delta", formatNumber(pDelta, 6));
  setCalculationValue(
    "sub-p-delta",
    `${formatNumber(pMean, 6)} × (${formatNumber(totalDeltas.m, 4)}/${formatNumber(means.m, 4)} + ${formatNumber(vDelta, 6)}/${formatNumber(vMean, 6)})`,
  );

  setCalculationValue(
    "calc-result-a",
    `(${formatNumber(means.a, 4)} ± ${formatNumber(totalDeltas.a, 4)})`,
  );
  setCalculationValue(
    "calc-result-b",
    `(${formatNumber(means.b, 4)} ± ${formatNumber(totalDeltas.b, 4)})`,
  );
  setCalculationValue(
    "calc-result-c",
    `(${formatNumber(means.c, 4)} ± ${formatNumber(totalDeltas.c, 4)})`,
  );
  setCalculationValue(
    "calc-result-m",
    `(${formatNumber(means.m, 4)} ± ${formatNumber(totalDeltas.m, 4)})`,
  );
  setCalculationValue(
    "calc-result-v",
    `(${formatNumber(vMean, 6)} ± ${formatNumber(vDelta, 6)})`,
  );
  setCalculationValue(
    "calc-result-p",
    `(${formatNumber(pMean, 6)} ± ${formatNumber(pDelta, 6)})`,
  );
}

function bindAutoFillCalculation() {
  const LAB = getLabTemplates();
  const deltaHt = (LAB &&
    LAB.MEASUREMENT_ACCURACY &&
    LAB.MEASUREMENT_ACCURACY.deltaHt) || {
    a: 0.05,
    b: 0.05,
    c: 0.05,
    m: 0.01,
  };

  const runCalculation = () => {
    const series = getMeasurementSeries();
    const calculation = calculateLabValues(series, deltaHt);
    if (calculation) {
      fillAverageRow(calculation.means);
    } else {
      clearAverageRow();
    }
    renderAutoFillResult(calculation, series, deltaHt);
    saveMeasurementsToLocalStorage();
  };

  const table = document.getElementById("physicsTable");
  if (table) {
    table.addEventListener("input", runCalculation);
  }

  runCalculation();
}

function bindActions() {
  const exportBtn = document.getElementById("exportBtn");
  const outputArea = document.getElementById("outputArea");
  const jsonContent = document.getElementById("jsonContent");

  if (!exportBtn || !outputArea || !jsonContent) {
    return;
  }

  exportBtn.addEventListener("click", () => {
    const data = collectTableData();
    jsonContent.textContent = JSON.stringify(data, null, 2);
    outputArea.classList.remove("hidden");
    outputArea.scrollIntoView({ behavior: "smooth" });
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
  restoreMeasurementsFromLocalStorage();
  renderCalculation();
  bindSpreadsheetPaste();
  bindActions();
  bindAutoFillCalculation();
  typesetMath();
}

document.addEventListener("DOMContentLoaded", renderApp);
