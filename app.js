// --- DOM ---
const displayEL    = document.querySelector(".display > span");
const numberBtns   = document.querySelectorAll(".number");
const operatorBtns = document.querySelectorAll(".operator");
const controlBtns  = document.querySelectorAll(".control");


// --- Listeners ---
numberBtns.forEach(btn   => btn.addEventListener("click", onNumber));
operatorBtns.forEach(btn => btn.addEventListener("click", onOperator));
controlBtns.forEach(btn  => btn.addEventListener("click", onControl));

// --- state ---
const state = {
  exp: [],            
  isResult: false,    
  overwrite: false,  
};

// --- dictionery ---
const OP_MAP = {
  "+": "+",
  "-": "-",    
  "×": "*",
  "÷": "/",
};
const DISPLAY_OPS = new Set(Object.keys(OP_MAP)); 
const isOp = (t) => DISPLAY_OPS.has(t);

const last = () => state.exp[state.exp.length - 1];
const setLast = (v) => { state.exp[state.exp.length - 1] = v; };

function ensureNumberToken() {
  if (state.exp.length === 0 || isOp(last())) state.exp.push("0");
}

function updateDisplay() {
  displayEL.textContent = state.exp.length ? state.exp.join("") : "0";
}

function resetFlags() {
  state.isResult = false;
  state.overwrite = false;
}

// --- numberBtns ---
function onNumber(e) {
  const txt = e.currentTarget.textContent.trim();

  if (state.isResult && state.overwrite) {
    if (txt === ".") state.exp = ["0."];
    else state.exp = [txt];
    resetFlags();
    updateDisplay();
    return;
  }

  ensureNumberToken();
  const cur = last();

  if (txt === ".") {
    if (!cur.includes(".")) {
      setLast(cur + ".");
      state.isResult = false;
      updateDisplay();
    }
    return;
  }

  if (cur === "0") setLast(txt);           
  else if (cur === "-0") setLast("-" + txt);
  else setLast(cur + txt);

  state.isResult = false;
  updateDisplay();
}

// --- operatorBtns ---
function onOperator(e) {
  const raw = e.currentTarget.textContent.trim();

  if (raw === "=") return evaluate();

  if (state.isResult) resetFlags();

  if (state.exp.length === 0) {
    state.exp.push("0", raw);
    updateDisplay();
    return;
  }

  if (isOp(last())) setLast(raw);
  else state.exp.push(raw);

  updateDisplay();
}

// --- controlBtns ---
function onControl(e) {
  const txt = e.currentTarget.textContent.trim();

  if (txt === "AC") {
    state.exp = [];
    state.isResult = false;
    state.overwrite = false;
    updateDisplay();
    return;
  }

  if (txt === "+/-") {
    ensureNumberToken();
    const cur = last();
    if (cur === "0" || cur === "0.") return;
    if (cur.startsWith("-")) setLast(cur.slice(1));
    else setLast("-" + cur);
    state.isResult = false;
    updateDisplay();
    return;
  }

  if (txt === "%") {
    ensureNumberToken();
    const n = Number(last() || "0");
    setLast(String(n / 100));
    state.isResult = false;
    updateDisplay();
    return;
  }
}

function evaluate() {
  if (state.exp.length === 0) { updateDisplay(); return; }

  if (isOp(last())) state.exp.pop();
  if (state.exp.length === 0) { updateDisplay(); return; }

  let acc = Number(state.exp[0]);

  for (let i = 1; i < state.exp.length; i += 2) {
    const dispOp = state.exp[i];
    const jsOp = OP_MAP[dispOp] || dispOp; 
    const next  = Number(state.exp[i + 1] ?? "0");

    if (jsOp === "/") {
      if (next === 0) {
        displayEL.textContent = "UNDEFINED";
        state.exp = [];
        state.isResult = true;
        state.overwrite = true;
        return;
      }
      acc = acc / next;
    } else if (jsOp === "+") acc = acc + next;
    else if (jsOp === "-")  acc = acc - next;
    else if (jsOp === "*")  acc = acc * next;
  }

  state.exp = [String(acc)];
  state.isResult = true;
  state.overwrite = true;
  updateDisplay();
}
