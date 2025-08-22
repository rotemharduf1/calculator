// --- DOM = Conection to the HTML ---
const displayEL = document.querySelector(".display > span");

const numberBtns = document.querySelectorAll(".number");
const operatorBtns = document.querySelectorAll(".operator");
const controlBtns = document.querySelectorAll(".control");

// --- conect the btns --- up
numberBtns.forEach(btn => {
    const textBtn = btn.textContent;
    if(textBtn === ".") btn.addEventListener("click" , inputDot);
    else btn.addEventListener("click", () => inputDigits(textBtn));
});
//input dig - for dot
//id for each btn
//html parameter for number attribute

controlBtns.forEach(btn => {
    const textBtn = btn.textContent;
    if(textBtn === "+/-") btn.addEventListener("click", negativeOrPositive);
    if (textBtn === "AC") btn.addEventListener("click", clearAll);
    if (textBtn === "%") btn.addEventListener("click", percent);
});

//also for control

operatorBtns.forEach(btn =>{
    const textBtn = btn.textContent;
    if(textBtn === "=") btn.addEventListener("click", () => evaluate(false));
    else btn.addEventListener("click", () => choosingOperator(textBtn));
});

// --- State ---
const state = {
    before: "0",
    operator: null,
    after: "",
    exp: [] ,
    overwrite: false, //after =
    isResult: false
};

function updateDisplay() {
    if(state.isResult){
        displayEL.textContent = state.before;
        return;
    }

    const head = state.exp.join("");
    const before = state.exp.length === 0 ? state.before : "";
    const op = state.exp.length === 0 ? (state.operator ?? "") : "";
    const after = state.after ?? "";
    const expresion = `${head}${before}${op}${after}`.trim();
    displayEL.textContent = expresion === "" ? "0" : expresion;
}

// --- Inputs ---
function inputDigits(dig){
    const key = state.operator ? "after" : "before";

    if(state.isResult && state.overwrite) {
        state.before = dig;
        state.operator = null;
        state.after = "";
        state.isResult = false;
        state.overwrite = false;
        updateDisplay();
        return;
    }
    
    if (state[key] === "0"){
        state[key] = dig;
    } else {
        state[key] += dig;
    }

    state.isResult = false;
    updateDisplay();
}

function inputDot(){
    const key = state.operator ? "after" : "before";
    const val = state[key] || "0";
    if(val.includes(".")) return;

    state[key] = val + ".";
    state.overwrite = false;
    state.isResult = false;
    updateDisplay();
}

// --- Control btns ---
function clearAll(){
    state.before = "0";
    state.operator = null;
    state.after = "";
    state.exp = [];
    state.overwrite = false;
    state.isResult = false;
    updateDisplay();
}

function percent(){
    const key = state.operator ? "after" : "before";
    const n = Number(state[key] || "0");
    state[key] = String(n / 100);
    state.isResult = false;
    updateDisplay();
}

function negativeOrPositive(){
    const key = state.operator ? "after": "before";
    const val = state[key] || "0";
    if(val === "0") return;
    state[key] = val.startsWith("-") ? val.slice(1) : "-" + val;
    state.isResult = false;
    updateDisplay();
}

// --- Operators ---
function isOperator(op) {
    return op === "+" || op === "−" || op === "×" || op === "÷";
}

function choosingOperator(op){
    if(state.isResult){  // press =
        state.isResult = false;
        state.overwrite = false;
        state.after = "";
        state.exp = [];
    }

    if(state.operator === null){
        if(state.before !== "") state.exp.push(state.before);
        state.exp.push(op);
        state.operator = op;
        state.before = "";
        state.after = ""; 
    } else {
        if(state.after !== ""){
            state.exp.push(state.after);
            state.after = "";
        }
        if(state.exp.length && isOperator(state.exp[state.exp.length-1])){ //update the operator
            state.exp[state.exp.length-1] = op;
        } else{ //new op after a number
            state.exp.push(op);
        }
        state.operator = op;
    }
    updateDisplay();
}
    
// --- Evaluation ---
function whatOp(op){
    return op === "×" ? "*" : op === "÷" ? "/" : op === "−" ? "-" : op;
}

function evaluate(){
    let evalExp = [...state.exp];

    if(state.operator && state.after !== ""){ //num op num
        evalExp.push(state.after);
    } else if(evalExp.length === 0 && state.before !== ""){ // only num
        evalExp.push(state.before);
    }

    if(evalExp.length && isOperator(evalExp[evalExp.length-1])){ // num op
        updateDisplay();
        return;
    }
    if(evalExp.length === 0){
        updateDisplay();
        return;
    }

    let acc = Number(evalExp[0]);
    for(let i=1; i<evalExp.length; i+=2){
        const op = whatOp(evalExp[i]);
        const next = Number(evalExp[i+1] || "0");
        switch(op){
            case "+": acc = acc + next; break;
            case "-": acc = acc - next; break;
            case "*": acc = acc * next; break;
            case "/": 
                if(next === 0) { 
                    displayEL.textContent = "UNDEFINED";
                    state.before = "0";
                    state.operator = null;
                    state.after = "";
                    if(state.exp) state.exp = [];
                    state.isResult = true;
                    state.overwrite = true;
                    return;
                }
                acc = acc / next; break;
        }
    }

    state.before = String(acc);
    state.operator = null;
    state.after = "";
    state.exp = [];
    state.isResult = true;
    state.overwrite = true;

    updateDisplay();
}