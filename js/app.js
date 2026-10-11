const expressionDisplay = document.querySelector("#texto");
const resultDisplay = document.querySelector(".show-result");
const powerButton = document.querySelector(".onOff");
const powerLabel = document.querySelector(".power-label");
const modeDisplay = document.querySelector(".angle-mode");
const calculator = document.querySelector(".back-op");
const history = [];

let expression = "";
let lastAnswer = 0;
let memory = 0;
let angleMode = "DEG";
let shiftMode = false;
let alphaMode = false;
let hyperbolicMode = false;
let isPoweredOn = true;
let justEvaluated = false;
let replayIndex = -1;

const formatNumber = (value) => {
  if (!Number.isFinite(value)) {
    throw new Error("Resultado fuera de rango");
  }
  if (Object.is(value, -0)) {
    return "0";
  }
  return Number.isInteger(value) ? String(value) : String(Number(value.toPrecision(12)));
};

const updateDisplay = () => {
  expressionDisplay.textContent = expression || "0";
  calculator.classList.toggle("is-off", !isPoweredOn);
  powerButton.setAttribute("aria-pressed", String(isPoweredOn));
  powerButton.setAttribute("aria-label", isPoweredOn ? "Apagar calculadora" : "Encender calculadora");
  powerLabel.textContent = isPoweredOn ? "ON" : "OFF";
  calculator.querySelector('[data-action="shift"]').setAttribute("aria-pressed", String(shiftMode));
  calculator.querySelector('[data-action="alpha"]').setAttribute("aria-pressed", String(alphaMode));
  modeDisplay.textContent = angleMode;
  calculator.classList.toggle("shift-active", shiftMode);
  calculator.classList.toggle("alpha-active", alphaMode);
  calculator.classList.toggle("hyp-active", hyperbolicMode);
};

const showError = (message) => {
  resultDisplay.textContent = `Error: ${message}`;
  resultDisplay.classList.add("error");
};

const clearResult = () => {
  resultDisplay.classList.remove("error");
  resultDisplay.textContent = "";
};

const tokenize = (source) => {
  const tokens = [];
  let position = 0;

  while (position < source.length) {
    if (/\s/.test(source[position])) {
      position += 1;
      continue;
    }

    const numberMatch = source.slice(position).match(/^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/);
    if (numberMatch) {
      tokens.push({ type: "number", value: Number(numberMatch[0]) });
      position += numberMatch[0].length;
      continue;
    }

    const nameMatch = source.slice(position).match(/^[a-zA-Z]+/);
    if (nameMatch) {
      tokens.push({ type: "name", value: nameMatch[0].toLowerCase() });
      position += nameMatch[0].length;
      continue;
    }

    const character = source[position];
    if ("+-*/^()%".includes(character)) {
      tokens.push({ type: character, value: character });
      position += 1;
      continue;
    }

    throw new Error(`Carácter no válido: ${character}`);
  }

  if (tokens.length > 120) {
    throw new Error("La operación es demasiado larga");
  }
  return tokens;
};

const evaluate = (source) => {
  const tokens = tokenize(source);
  let position = 0;

  const peek = () => tokens[position];
  const consume = (type) => {
    if (peek()?.type !== type) {
      throw new Error("Expresión incompleta");
    }
    return tokens[position++];
  };
  const ensureFinite = (value) => {
    if (!Number.isFinite(value)) {
      throw new Error("Operación fuera de rango");
    }
    return value;
  };
  const angleInput = (value) => angleMode === "DEG" ? value * Math.PI / 180 : value;
  const angleOutput = (value) => angleMode === "DEG" ? value * 180 / Math.PI : value;

  const functions = {
    sin: (value) => hyperbolicMode ? Math.sinh(value) : Math.sin(angleInput(value)),
    cos: (value) => hyperbolicMode ? Math.cosh(value) : Math.cos(angleInput(value)),
    tan: (value) => {
      if (hyperbolicMode) {
        return Math.tanh(value);
      }
      const radians = angleInput(value);
      if (Math.abs(Math.cos(radians)) < 1e-12) {
        throw new Error("Tangente indefinida");
      }
      return Math.tan(radians);
    },
    asin: (value) => hyperbolicMode ? Math.asinh(value) : angleOutput(Math.asin(value)),
    acos: (value) => hyperbolicMode ? Math.acosh(value) : angleOutput(Math.acos(value)),
    atan: (value) => hyperbolicMode ? Math.atanh(value) : angleOutput(Math.atan(value)),
    asinh: Math.asinh,
    acosh: Math.acosh,
    atanh: Math.atanh,
    sqrt: Math.sqrt,
    cbrt: Math.cbrt,
    log: Math.log10,
    ln: Math.log,
    pow10: (value) => 10 ** value,
    exp: Math.exp,
    abs: Math.abs,
  };

  const parsePrimary = () => {
    const token = peek();
    if (!token) {
      throw new Error("Expresión incompleta");
    }

    if (token.type === "number") {
      position += 1;
      return token.value;
    }

    if (token.type === "(") {
      position += 1;
      const value = parseAddSubtract();
      consume(")");
      return value;
    }

    if (token.type === "name") {
      position += 1;
      if (token.value === "pi") {
        return Math.PI;
      }
      if (token.value === "ans") {
        return lastAnswer;
      }
      if (token.value === "a") {
        return memory;
      }
      if (!Object.prototype.hasOwnProperty.call(functions, token.value)) {
        throw new Error(`Función desconocida: ${token.value}`);
      }
      consume("(");
      const argument = parseAddSubtract();
      consume(")");
      return ensureFinite(functions[token.value](argument));
    }

    throw new Error("Expresión incompleta");
  };

  const parsePostfix = () => {
    let value = parsePrimary();
    while (peek()?.type === "%") {
      position += 1;
      value /= 100;
    }
    return value;
  };

  const parsePower = () => {
    const value = parsePostfix();
    if (peek()?.type === "^") {
      position += 1;
      return ensureFinite(value ** parseUnary());
    }
    return value;
  };

  const parseUnary = () => {
    if (peek()?.type === "+") {
      position += 1;
      return parseUnary();
    }
    if (peek()?.type === "-") {
      position += 1;
      return -parseUnary();
    }
    return parsePower();
  };

  const parseMultiplyDivide = () => {
    let value = parseUnary();
    while (
      peek()?.type === "*" ||
      peek()?.type === "/" ||
      peek()?.type === "number" ||
      peek()?.type === "name" ||
      peek()?.type === "("
    ) {
      const operator = peek().type === "*" || peek().type === "/" ? tokens[position++].type : "*";
      const right = parseUnary();
      if (operator === "/" && right === 0) {
        throw new Error("No se puede dividir entre cero");
      }
      value = ensureFinite(operator === "*" ? value * right : value / right);
    }
    return value;
  };

  const parseAddSubtract = () => {
    let value = parseMultiplyDivide();
    while (peek()?.type === "+" || peek()?.type === "-") {
      const operator = tokens[position++].type;
      const right = parseMultiplyDivide();
      value = ensureFinite(operator === "+" ? value + right : value - right);
    }
    return value;
  };

  if (tokens.length === 0) {
    throw new Error("Ingresa una operación");
  }
  const result = ensureFinite(parseAddSubtract());
  if (position !== tokens.length) {
    throw new Error("Revisa la operación");
  }
  return result;
};

const setExpression = (value) => {
  if (value.length > 120) {
    showError("La operación es demasiado larga");
    return false;
  }
  expression = value;
  clearResult();
  replayIndex = -1;
  updateDisplay();
  return true;
};

const append = (value) => {
  if (justEvaluated && /^[+\-*/^%]$/.test(value)) {
    expression = formatNumber(lastAnswer);
  } else if (justEvaluated) {
    expression = "";
  }
  justEvaluated = false;

  if (/^[+*/^%]$/.test(value) && /[+*/^.]$/.test(expression)) {
    expression = expression.slice(0, -1);
  }
  setExpression(expression + value);
};

const appendDigit = (digit) => {
  if (justEvaluated) {
    expression = "";
    justEvaluated = false;
  }
  const lastNumber = expression.match(/(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d*)?$/i)?.[0] || "";
  if (lastNumber.endsWith("e") && digit === "") {
    return;
  }
  append(digit);
};

const appendDecimal = () => {
  if (justEvaluated) {
    expression = "";
    justEvaluated = false;
  }
  const lastNumber = expression.match(/(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d*)?$/i)?.[0] || "";
  if (!lastNumber) {
    append("0.");
  } else if (/[eE]/.test(lastNumber)) {
    return;
  } else if (!lastNumber.includes(".")) {
    append(".");
  }
};

const performEqual = () => {
  try {
    const result = evaluate(expression);
    const formattedResult = formatNumber(result);
    history.unshift({ expression, result: formattedResult });
    if (history.length > 20) {
      history.pop();
    }
    lastAnswer = result;
    resultDisplay.classList.remove("error");
    resultDisplay.textContent = formattedResult;
    justEvaluated = true;
    replayIndex = -1;
  } catch (error) {
    showError(error.message);
  }
};

const insertFunction = (name) => {
  if (justEvaluated) {
    expression = formatNumber(lastAnswer);
    justEvaluated = false;
  }
  if (expression && !/[+\-*/^(]$/.test(expression)) {
    setExpression(`${name}(${expression})`);
    return;
  }
  append(`${name}(`);
};

const toggleSign = () => {
  if (justEvaluated) {
    lastAnswer *= -1;
    expression = formatNumber(lastAnswer);
    resultDisplay.textContent = expression;
    justEvaluated = false;
    updateDisplay();
    return;
  }

  const numberMatch = expression.match(/(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i);
  if (!numberMatch) {
    if (expression.endsWith(")") || /(?:pi|ans|a)$/i.test(expression)) {
      setExpression(expression.startsWith("-(") && expression.endsWith(")")
        ? expression.slice(2, -1)
        : `-(${expression})`);
    } else {
      append("-");
    }
    return;
  }

  const numberStart = numberMatch.index;
  let prefix = expression.slice(0, numberStart);
  const number = numberMatch[0];
  const previous = prefix.at(-1);
  if (previous === "-" && (prefix.length === 1 || /[+*/^(]/.test(prefix.at(-2)))) {
    prefix = prefix.slice(0, -1);
  } else if (previous === "+" || previous === "-") {
    prefix = `${prefix.slice(0, -1)}${previous === "+" ? "-" : "+"}`;
  } else {
    prefix += "-";
  }
  setExpression(prefix + number);
};

const applyScientificAction = (action) => {
  const shiftedActions = {
    pi: "euler",
    cube: "cuberoot",
    sqrt: "squareRoot",
    log: "pow10",
    ln: "exp",
    sin: "asin",
    cos: "acos",
    tan: "atan",
    recall: "clearMemory",
    memory: "memorySubtract",
    hyp: "toggleHyperbolic",
  };
  const alphaActions = {
    recall: "clearMemory",
    memory: "memorySubtract",
  };
  return shiftMode
    ? shiftedActions[action] || action
    : alphaMode
      ? alphaActions[action] || action
      : action;
};

const toggleModeLabel = () => {
  const labels = {
    pi: ["π", "e"],
    cube: ["x³", "∛"],
    sqrt: ["√", "x²"],
    log: ["log", "10ˣ"],
    ln: ["ln", "eˣ"],
    sin: ["sin", "sin⁻¹"],
    cos: ["cos", "cos⁻¹"],
    tan: ["tan", "tan⁻¹"],
    recall: ["Rcl", "MC"],
    memory: ["M+", "M−"],
    hyp: ["hyp", "hyp"],
  };
  calculator.querySelectorAll("[data-action]").forEach((button) => {
    const action = button.dataset.action;
    if (labels[action]) {
      button.textContent = labels[action][Number(shiftMode || alphaMode)];
    }
  });
};

const readCurrentValue = () => expression ? evaluate(expression) : lastAnswer;

const runAction = (initialAction, value) => {
  if (!isPoweredOn && initialAction !== "power") {
    return;
  }
  const action = applyScientificAction(initialAction);

  switch (action) {
    case "power":
      isPoweredOn = !isPoweredOn;
      shiftMode = false;
      alphaMode = false;
      hyperbolicMode = false;
      expression = "";
      justEvaluated = false;
      clearResult();
      resultDisplay.textContent = isPoweredOn ? "0" : "";
      toggleModeLabel();
      updateDisplay();
      return;
    case "shift":
      shiftMode = !shiftMode;
      toggleModeLabel();
      updateDisplay();
      return;
    case "alpha":
      alphaMode = !alphaMode;
      toggleModeLabel();
      updateDisplay();
      return;
    case "mode":
      angleMode = angleMode === "DEG" ? "RAD" : "DEG";
      updateDisplay();
      return;
    case "toggleHyperbolic":
      hyperbolicMode = !hyperbolicMode;
      updateDisplay();
      return;
    case "clear":
      expression = "";
      justEvaluated = false;
      clearResult();
      resultDisplay.textContent = "0";
      updateDisplay();
      return;
    case "delete":
      if (justEvaluated) {
        expression = formatNumber(lastAnswer);
      }
      expression = expression.slice(0, -1);
      justEvaluated = false;
      clearResult();
      updateDisplay();
      return;
    case "digit":
      appendDigit(value);
      break;
    case "decimal":
      appendDecimal();
      break;
    case "exponent": {
      if (justEvaluated) {
        expression = formatNumber(lastAnswer);
        justEvaluated = false;
      }
      const match = expression.match(/(?:\d+\.?\d*|\.\d+)$/);
      if (match && !/[eE]/.test(match[0])) {
        append("e");
      } else {
        showError("EXP requiere primero un número");
      }
      break;
    }
    case "add":
      append("+");
      break;
    case "subtract":
      append("-");
      break;
    case "multiply":
      append("*");
      break;
    case "divide":
      append("/");
      break;
    case "powerOperator":
      append("^");
      break;
    case "open":
      append("(");
      break;
    case "close":
      append(")");
      break;
    case "percent":
      append("%");
      break;
    case "pi":
      append("pi");
      break;
    case "euler":
      append(String(Math.E));
      break;
    case "square":
      append("^2");
      break;
    case "cube":
      append("^3");
      break;
    case "cuberoot":
      insertFunction("cbrt");
      break;
    case "sqrt":
      insertFunction("sqrt");
      break;
    case "squareRoot":
      append("^2");
      break;
    case "log":
    case "ln":
    case "sin":
    case "cos":
    case "tan":
    case "asin":
    case "acos":
    case "atan":
    case "pow10":
    case "exp":
      insertFunction(action);
      break;
    case "negate":
      toggleSign();
      break;
    case "fraction":
      append("/");
      break;
    case "answer":
      append("ans");
      break;
    case "recall":
      append("a");
      break;
    case "clearMemory":
      memory = 0;
      alphaMode = false;
      updateDisplay();
      break;
    case "memory":
    case "memorySubtract":
      try {
        const currentValue = readCurrentValue();
        memory += action === "memory" ? currentValue : -currentValue;
        memory = Number(formatNumber(memory));
        alphaMode = false;
        clearResult();
        resultDisplay.textContent = "Memoria guardada";
        updateDisplay();
      } catch (error) {
        showError(error.message);
      }
      break;
    case "eng":
      try {
        const currentValue = readCurrentValue();
        const exponent = Math.floor(Math.log10(Math.abs(currentValue)) / 3) * 3;
        if (currentValue === 0) {
          expression = "0";
        } else {
          expression = `${formatNumber(currentValue / 10 ** exponent)}e${exponent >= 0 ? "+" : ""}${exponent}`;
        }
        justEvaluated = false;
        clearResult();
        updateDisplay();
      } catch (error) {
        showError(error.message);
      }
      break;
    case "hyp":
      hyperbolicMode = !hyperbolicMode;
      updateDisplay();
      break;
    case "equal":
      performEqual();
      break;
    case "replay":
      if (history.length) {
        replayIndex = (replayIndex + 1) % history.length;
        expression = history[replayIndex].expression;
        lastAnswer = Number(history[replayIndex].result);
        resultDisplay.classList.remove("error");
        resultDisplay.textContent = history[replayIndex].result;
        justEvaluated = true;
        updateDisplay();
      } else {
        showError("Aún no hay operaciones anteriores");
      }
      break;
    default:
      return;
  }

  if (action !== "equal" && action !== "replay") {
    alphaMode = false;
    shiftMode = false;
    toggleModeLabel();
    updateDisplay();
  }
};

calculator.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button || !calculator.contains(button)) {
    return;
  }
  runAction(button.dataset.action, button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return;
  }

  const keyActions = {
    Enter: "equal",
    "=": "equal",
    Backspace: "delete",
    Escape: "clear",
    "+": "add",
    "-": "subtract",
    "*": "multiply",
    "/": "divide",
    "^": "powerOperator",
    ".": "decimal",
    ",": "decimal",
    "(": "open",
    ")": "close",
    "%": "percent",
  };

  if (/^\d$/.test(event.key)) {
    event.preventDefault();
    runAction("digit", event.key);
  } else if (keyActions[event.key]) {
    event.preventDefault();
    runAction(keyActions[event.key]);
  }
});

toggleModeLabel();
updateDisplay();
