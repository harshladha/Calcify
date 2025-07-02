const display = document.getElementById("display");
const history = document.getElementById("history");
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history");
const buttons = document.querySelectorAll(".numpad button");
const themeSwitcher = document.getElementById("themeSwitcher");

let expression = "";
let openBrackets = 0;
let calcHistory = [];

if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  themeSwitcher.textContent = "☀️ Light Mode";
}

themeSwitcher.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  themeSwitcher.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

function isOperator(char) {
  return ["+", "-", "*", "/", "%"].includes(char);
}

function parseExpression(expr) {
  try {
    expr = expr.replace(/--/g, "+");
    return Function('"use strict";return (' + expr + ")")();
  } catch {
    return "Error";
  }
}

function updateDisplay() {
  display.value = expression;
}

function updateLocalHistoryDisplay() {
  historyList.innerHTML = calcHistory
    .slice()
    .reverse()
    .map((item) => `<div>${item}</div>`)
    .join("");
}

function saveToHistory(line) {
  calcHistory.push(line);
  if (calcHistory.length > 5) {
    calcHistory.shift();
  }
  updateLocalHistoryDisplay();
}

function handleInput(val) {
  if (val === "C") {
    expression = "";
    openBrackets = 0;
    history.textContent = ""; // Clear previous calculation above display
  } else if (val === "=") {
    if (expression === "") return;
    const result = parseExpression(expression);
    if (result === "Error") {
      history.textContent = "Invalid Expression";
      expression = "";
    } else {
      history.textContent = expression + " =";
      saveToHistory(`${expression} = ${result}`);
      expression = result.toString();
    }
  } else if (val === "DEL") {
    if (expression.slice(-1) === "(") openBrackets--;
    if (expression.slice(-1) === ")") openBrackets++;
    expression = expression.slice(0, -1);
  } else if (val === "()") {
    const last = expression.slice(-1);
    if (
      openBrackets === 0 ||
      isOperator(last) ||
      last === "(" ||
      expression === ""
    ) {
      expression += "(";
      openBrackets++;
    } else if (openBrackets > 0) {
      expression += ")";
      openBrackets--;
    }
  } else {
    const lastChar = expression.slice(-1);
    if (isOperator(lastChar) && isOperator(val)) return;
    expression += val;
  }

  updateDisplay();
}

buttons.forEach((btn) => {
  btn.addEventListener("click", () =>
    handleInput(btn.getAttribute("data-value"))
  );
});

document.addEventListener("keydown", (e) => {
  const key = e.key;

  if (/\d/.test(key)) {
    expression += key;
  } else if (["+", "-", "*", "/", "%"].includes(key)) {
    const last = expression.slice(-1);
    if (!isOperator(last)) expression += key;
  } else if (key === "Enter") {
    handleInput("=");
    return;
  } else if (key === "Backspace") {
    handleInput("DEL");
    return;
  } else if (key === "Escape") {
    handleInput("C");
    return;
  } else if (key === "(" || key === ")") {
    handleInput("()");
    return;
  } else if (key === ".") {
    expression += ".";
  } else {
    return;
  }

  updateDisplay();
});

// Clear History Button
clearHistoryBtn.addEventListener("click", () => {
  calcHistory = [];
  updateLocalHistoryDisplay();
});
