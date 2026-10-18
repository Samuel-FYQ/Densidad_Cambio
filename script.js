"use strict";

const AUTHOR = "Samuel López Melián";

const exercises = [
  {
    text: "Una pieza de metal tiene una masa de 0,54 kg y una densidad de 2,7 g/cm³. Calcula su volumen en cm³.",
    unknown: "V",
    originalValues: {
      m: 0.54,
      d: 2.7
    },
    originalUnits: {
      m: "kg",
      V: "cm³",
      d: "g/cm³"
    },
    conversion: {
      symbol: "m",
      value: 540,
      unit: "g",
      message: "Revisa la conversión de masa a gramos."
    },
    result: 200,
    resultUnit: "cm³"
  },
  {
    text: "Un material tiene una densidad de 800 kg/m³ y ocupa un volumen de 5 000 cm³. Calcula su masa en kg.",
    unknown: "m",
    originalValues: {
      V: 5000,
      d: 800
    },
    originalUnits: {
      m: "kg",
      V: "cm³",
      d: "kg/m³"
    },
    conversion: {
      symbol: "V",
      value: 0.005,
      unit: "m³",
      message: "Revisa la conversión de volumen a m³."
    },
    result: 4,
    resultUnit: "kg"
  },
  {
    text: "Un objeto tiene una masa de 1,2 kg y un volumen de 400 cm³. Calcula su densidad en g/cm³.",
    unknown: "d",
    originalValues: {
      m: 1.2,
      V: 400
    },
    originalUnits: {
      m: "kg",
      V: "cm³",
      d: "g/cm³"
    },
    conversion: {
      symbol: "m",
      value: 1200,
      unit: "g",
      message: "Revisa la conversión de masa a gramos."
    },
    result: 3,
    resultUnit: "g/cm³"
  }
];

const magnitudes = [
  {
    symbol: "m",
    name: "masa",
    label: "Masa (m)"
  },
  {
    symbol: "V",
    name: "volumen",
    label: "Volumen (V)"
  },
  {
    symbol: "d",
    name: "densidad",
    label: "Densidad (d)"
  }
];

const formulas = {
  d: `
    d =
    <span class="fraction">
      <span class="numerator">m</span>
      <span class="denominator">V</span>
    </span>
  `,
  m: "m = d × V",
  V: `
    V =
    <span class="fraction">
      <span class="numerator">m</span>
      <span class="denominator">d</span>
    </span>
  `
};

const formulaLabels = {
  d: "Densidad igual a masa entre volumen",
  m: "Masa igual a densidad por volumen",
  V: "Volumen igual a masa entre densidad"
};

let current = 0;
let selectedFormula = "";
let solved = false;
let diplomaData = null;

const $ = id => document.getElementById(id);

function parseNumber(value) {
  const cleaned = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(",", ".");

  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(cleaned)) {
    return NaN;
  }

  return Number(cleaned);
}

function sameNumber(value, target) {
  return (
    Number.isFinite(value) &&
    Math.abs(value - target) <=
      Number.EPSILON * Math.max(1, Math.abs(target)) * 16
  );
}

function formatNumber(value) {
  return value.toLocaleString("es-ES", {
    maximumFractionDigits: 8
  });
}

function updateProgress(completed) {
  $("bar").style.width =
    `${completed / exercises.length * 100}%`;

  $("progress").setAttribute("aria-valuenow", completed);
}

function renderExercise() {
  selectedFormula = "";
  solved = false;

  const exercise = exercises[current];

  $("counter").textContent =
    `RETO ${current + 1} DE ${exercises.length}`;

  updateProgress(current);

  $("exercise").innerHTML = `
    <p class="question">${exercise.text}</p>

    <h3>Coloca los datos y convierte</h3>

    <p class="muted">
      Copia los datos del enunciado.
      Completa el cambio de unidades donde aparece la flecha.
      Deja vacía la incógnita.
    </p>

    <div class="data-heading" aria-hidden="true">
      <span>Magnitud</span>
      <span>Dato del enunciado</span>
      <span>Dato convertido</span>
    </div>

    ${magnitudes.map(item => {
      const needsConversion =
        exercise.conversion.symbol === item.symbol;

      return `
        <div class="data-row">
          <label class="data-label" for="data-${item.symbol}">
            ${item.label}
          </label>

          <div class="value-field">
            <input
              id="data-${item.symbol}"
              inputmode="decimal"
              autocomplete="off"
              aria-label="Dato del enunciado de ${item.name}, en ${exercise.originalUnits[item.symbol]}"
            >
            <span class="unit">
              ${exercise.originalUnits[item.symbol]}
            </span>
          </div>

          ${needsConversion ? `
            <div class="value-field conversion">
              <span class="arrow" aria-hidden="true">→</span>
              <input
                id="converted"
                inputmode="decimal"
                autocomplete="off"
                aria-label="Dato de ${item.name} convertido a ${exercise.conversion.unit}"
              >
              <span class="unit">
                ${exercise.conversion.unit}
              </span>
            </div>
          ` : ""}
        </div>
      `;
    }).join("")}

    <h3>Elige la fórmula</h3>

    <div class="formulas">
      ${Object.entries(formulas).map(([symbol, html]) => `
        <button
          type="button"
          class="formula-button"
          data-formula="${symbol}"
          aria-label="${formulaLabels[symbol]}"
          aria-pressed="false"
        >
          ${html}
        </button>
      `).join("")}
    </div>

    <h3>Resultado</h3>

    <div class="value-field answer-field">
      <input
        id="answer"
        inputmode="decimal"
        autocomplete="off"
        aria-label="Resultado en ${exercise.resultUnit}"
      >
      <span class="unit">${exercise.resultUnit}</span>
    </div>

    <div
      id="feedback"
      role="status"
      aria-live="polite"
    ></div>

    <div class="actions">
      <button id="check" class="primary" type="button">
        Comprobar
      </button>

      <button id="next" class="hidden" type="button">
        ${current === exercises.length - 1
          ? "Conseguir diploma"
          : "Siguiente →"}
      </button>
    </div>
  `;

  document.querySelectorAll("[data-formula]").forEach(button => {
    button.onclick = () => {
      if (solved) return;

      selectedFormula = button.dataset.formula;

      document.querySelectorAll("[data-formula]").forEach(item => {
        const selected = item === button;

        item.classList.toggle("selected", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
    };
  });

  $("check").onclick = checkAnswer;

  $("next").onclick = () => {
    current++;

    if (current === exercises.length) {
      showFinish();
    } else {
      renderExercise();
    }

    $("counter").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };
}

function checkAnswer() {
  if (solved) return;

  const exercise = exercises[current];
  const errors = [];

  magnitudes.forEach(item => {
    const raw = $(`data-${item.symbol}`).value.trim();

    if (item.symbol === exercise.unknown) {
      if (raw !== "") {
        errors.push(
          `Deja vacío el dato de ${item.name}: es la incógnita.`
        );
      }

      return;
    }

    if (!sameNumber(
      parseNumber(raw),
      exercise.originalValues[item.symbol]
    )) {
      errors.push(
        `Revisa el dato de ${item.name} y su unidad ` +
        `(${exercise.originalUnits[item.symbol]}).`
      );
    }
  });

  if (!sameNumber(
    parseNumber($("converted").value),
    exercise.conversion.value
  )) {
    errors.push(exercise.conversion.message);
  }

  if (selectedFormula !== exercise.unknown) {
    errors.push(
      "Revisa la fórmula: la magnitud que buscas debe estar sola a la izquierda."
    );
  }

  if (!sameNumber(
    parseNumber($("answer").value),
    exercise.result
  )) {
    errors.push("Revisa el resultado.");
  }

  const feedback = $("feedback");

  feedback.className = "feedback";
  feedback.replaceChildren();

  if (errors.length) {
    errors.forEach(message => {
      const paragraph = document.createElement("p");
      paragraph.textContent = message;
      feedback.append(paragraph);
    });

    return;
  }

  solved = true;

  feedback.classList.add("success");
  feedback.textContent =
    `¡Correcto! ${formatNumber(exercise.result)} ` +
    `${exercise.resultUnit}.`;

  updateProgress(current + 1);

  $("check").disabled = true;
  $("next").classList.remove("hidden");

  document.querySelectorAll(
    "#exercise input, [data-formula]"
  ).forEach(element => {
    element.disabled = true;
  });
}

function showFinish() {
  $("counter").textContent = "ACTIVIDAD COMPLETADA";
  updateProgress(exercises.length);

  $("exercise").innerHTML = `
    <h2>¡Has superado los tres retos!</h2>
    <p>Escribe tus datos para conseguir el diploma.</p>

    <form id="student-form" class="student-form">
      <label for="student-name">Nombre y apellidos</label>
      <input
        id="student-name"
        maxlength="80"
        autocomplete="name"
        required
      >

      <label for="student-course">Curso y grupo</label>
      <input
        id="student-course"
        maxlength="40"
        placeholder="2º ESO B"
        required
      >

      <div class="actions">
        <button class="primary" type="submit">
          Crear diploma
        </button>
      </div>
    </form>

    <p id="download-error" role="status"></p>

    <section id="diploma" class="diploma hidden">
      <h2>Diploma de densidad</h2>
      <p>Cambio de unidades</p>
      <p>Se concede a</p>

      <div id="diploma-name" class="student-name"></div>
      <p id="diploma-course"></p>

      <p>
        Por resolver los tres ejercicios de densidad<br>
        con cambios de unidades de masa y volumen.
      </p>

      <strong>3 de 3 retos completados</strong>

      <p id="diploma-date"></p>

      <div class="signature">
        Actividad creada por ${AUTHOR}
      </div>
    </section>

    <div id="diploma-actions" class="actions hidden">
      <button id="download" class="primary" type="button">
        Descargar diploma
      </button>

      <button id="print" type="button">
        Imprimir / guardar PDF
      </button>
    </div>
  `;

  $("student-form").onsubmit = event => {
    event.preventDefault();

    const name = $("student-name").value.trim();
    const course = $("student-course").value.trim();

    if (!name || !course) {
      $("download-error").textContent =
        "Completa tu nombre y tu curso.";
      return;
    }

    diplomaData = {
      name,
      course,
      date: new Date().toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    };

    $("download-error").textContent = "";
    $("diploma-name").textContent = diplomaData.name;
    $("diploma-course").textContent = diplomaData.course;
    $("diploma-date").textContent = diplomaData.date;

    $("diploma").classList.remove("hidden");
    $("diploma-actions").classList.remove("hidden");
  };

  $("download").onclick = downloadDiploma;
  $("print").onclick = () => window.print();
}

function downloadDiploma() {
  if (!diplomaData) return;

  const canvas = document.createElement("canvas");

  canvas.width = 1800;
  canvas.height = 1272;

  const context = canvas.getContext("2d");

  if (!context) {
    $("download-error").textContent =
      "Usa Imprimir / guardar PDF para guardar el diploma.";
    return;
  }

  context.fillStyle = "#fffcf2";
  context.fillRect(0, 0, 1800, 1272);

  context.strokeStyle = "#b68e3f";
  context.lineWidth = 6;
  context.strokeRect(55, 55, 1690, 1162);

  context.lineWidth = 2;
  context.strokeRect(75, 75, 1650, 1122);

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#193f40";

  function write(text, y, size, family = "Georgia") {
    let fittedSize = size;

    context.font = `${fittedSize}px ${family}`;

    while (
      context.measureText(text).width > 1500 &&
      fittedSize > 12
    ) {
      fittedSize--;
      context.font = `${fittedSize}px ${family}`;
    }

    context.fillText(text, 900, y);
  }

  write("CAMBIO DE UNIDADES", 190, 30, "Arial");
  write("DIPLOMA DE DENSIDAD", 310, 76);
  write("Se concede a", 430, 34);
  write(diplomaData.name, 540, 66);
  write(diplomaData.course, 625, 38, "Arial");

  write(
    "Por resolver los tres ejercicios de densidad",
    745,
    34
  );

  write(
    "con cambios de unidades de masa y volumen.",
    800,
    34
  );

  context.fillStyle = "#14796b";
  write("3 DE 3 RETOS COMPLETADOS", 920, 36, "Arial");

  context.fillStyle = "#193f40";
  write(diplomaData.date, 1010, 29);

  context.fillStyle = "#79622f";
  write(`Actividad creada por ${AUTHOR}`, 1120, 27, "Arial");

  canvas.toBlob(blob => {
    if (!blob) {
      $("download-error").textContent =
        "Usa Imprimir / guardar PDF para guardar el diploma.";
      return;
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const safeName = diplomaData.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70);

    link.href = url;
    link.download =
      `Diploma-densidad-unidades-${safeName || "alumno"}.png`;

    document.body.append(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, "image/png");
}

/* Calculadora */

let calcInput = "";
let calcStored = null;
let calcOperator = null;
let calcFresh = false;

const calculatorKeys = [
  "7", "8", "9", "÷",
  "4", "5", "6", "×",
  "1", "2", "3", "−",
  "0", ",", "=", "+",
  "C", "⌫"
];

function resetCalculator() {
  calcInput = "";
  calcStored = null;
  calcOperator = null;
  calcFresh = false;

  $("screen").textContent = "0";
}

function calculate(a, operator, b) {
  if (operator === "+") return a + b;
  if (operator === "−") return a - b;
  if (operator === "×") return a * b;
  if (operator === "÷") return b === 0 ? NaN : a / b;

  return b;
}

function calculatorText(value) {
  return String(Number(value.toPrecision(12)))
    .replace(".", ",");
}

function handleCalculator(key) {
  if (key === "C") {
    resetCalculator();
    return;
  }

  if (key === "⌫") {
    if (calcFresh) {
      calcInput = "";
      calcFresh = false;
    } else {
      calcInput = calcInput.slice(0, -1);
    }

    $("screen").textContent = calcInput || "0";
    return;
  }

  if (["+", "−", "×", "÷"].includes(key)) {
    if (calcInput !== "") {
      const value = Number(calcInput.replace(",", "."));

      if (
        calcStored !== null &&
        calcOperator &&
        !calcFresh
      ) {
        const result = calculate(
          calcStored,
          calcOperator,
          value
        );

        if (!Number.isFinite(result)) {
          resetCalculator();
          $("screen").textContent = "Error";
          return;
        }

        calcStored = result;
        calcInput = calculatorText(result);
      } else {
        calcStored = value;
      }
    }

    if (calcStored === null) return;

    calcOperator = key;
    calcFresh = true;

    $("screen").textContent =
      `${calculatorText(calcStored)} ${key}`;

    return;
  }

  if (key === "=") {
    if (
      calcStored === null ||
      !calcOperator ||
      calcFresh ||
      calcInput === ""
    ) {
      return;
    }

    const result = calculate(
      calcStored,
      calcOperator,
      Number(calcInput.replace(",", "."))
    );

    if (!Number.isFinite(result)) {
      resetCalculator();
      $("screen").textContent = "Error";
      return;
    }

    calcInput = calculatorText(result);
    calcStored = null;
    calcOperator = null;
    calcFresh = true;

    $("screen").textContent = calcInput;
    return;
  }

  if (calcFresh) {
    calcInput = "";
    calcFresh = false;
  }

  if (calcInput.length >= 18) return;

  if (key === ",") {
    if (calcInput.includes(",")) return;
    calcInput = calcInput || "0";
  }

  calcInput += key;
  $("screen").textContent = calcInput;
}

calculatorKeys.forEach(key => {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = key;

  button.setAttribute(
    "aria-label",
    key === "C"
      ? "Borrar todo"
      : key === "⌫"
        ? "Borrar última cifra"
        : key === "="
          ? "Calcular"
          : key
  );

  button.onclick = () => handleCalculator(key);

  $("keys").append(button);
});

renderExercise();