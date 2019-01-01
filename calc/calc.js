
// RESULT FUNCTION
// This function determines the resulting value after each key press.
// It constructs value objects that will be used to update the calculator's display.
const getResult = (key, displayVal) => {
    // REQUIRED VARIABLES
    let keyText = key.textContent;
    let keyType = getKeyType(key);
    let prevKey = memory.prevKey;
    let first   = displayVal.first;
    let second  = displayVal.second;

    if (prevKey === 'eq' && keyType !== 'eq') {
        clearMemory();
    }

    if (keyType === 'number') {
        if (prevKey === 'operator' || prevKey === 'eq')
            second = '';
        return first === '0' ||
            prevKey === 'operator' ||
            prevKey === 'eq'
            ? new Value(keyText, second)
            : new Value(first + keyText, second);
    }

    else if (keyType === 'dec') {
        return prevKey === 'operator' || prevKey === 'eq'
            ? new Value('0.', second)
            : new Value(first + '.', second);
    }

    else if (keyType === 'ft') {
        return new Value('0', first);
    }

    else if (keyType === 'in') {
        return new Value(first, '0');
    }

    else if (keyType === 'fr') {
        if (prevKey === 'operator' || prevKey === 'eq') {
            first  = '0';
            second = '';
        }
        return keyText === 'NUM'
            ? new Value(first + ' ', second)
            : new Value(first + '/', second)
    }

    else if (keyType === 'clr') {
        return new Value('0');
    }

    else if (keyType === 'operator') {
        return memory.first &&
            memory.operator &&
            prevKey !== 'operator' &&
            prevKey !== 'eq'
            ? calculate(memory.first, memory.operator, displayVal)
            : resultToValue(valueToOperand(displayVal), second);
    }

    else if (keyType === 'eq') {
        return memory.first && memory.operator
            ? memory.prevKey === 'eq'
                ? calculate(displayVal, memory.operator, memory.second)
                : calculate(memory.first, memory.operator, displayVal)
            : resultToValue(valueToOperand(displayVal), second);
    }
}


// MEMORY FUNCTIONS
// The following functions all interact with the calculator's memory.
const updateMemory = (key, displayVal, resultVal) => {
    let keyType  = getKeyType(key);
    let keyText  = key.textContent;
    let prevKey  = memory.prevKey;
    let operator = memory.operator;

    memory.prevKey = keyType;

    if (keyType === 'operator') {
        if (memory.first && operator && prevKey !== 'eq' && prevKey !== 'operator')
            updateHistory(memory.first, operator, displayVal, resultVal);
            memory.operator = key.dataset.action;
        memory.first = memory.first &&
            operator &&
            prevKey !== 'operator' &&
            prevKey !== 'eq'
            ? resultVal
            : displayVal;
    }

    if (keyType === 'eq') {
        if (memory.first && operator)
            prevKey === 'eq'
                ? updateHistory(displayVal, operator, memory.second, resultVal)
                : updateHistory(memory.first, operator, displayVal, resultVal);
        memory.second = memory.first && prevKey === 'eq'
            ? memory.second
            : displayVal;
    }

    if ((keyType === 'clr' && keyText === 'AC') /*|| 
        !isFinite(resultVal.first) || !isFinite(resultVal.second)*/) {
        clearMemory();
    }
}

// Resets the memory (this happens when the 'AC' key is pressed).
const clearMemory = () => {
    memory.first    = {};
    memory.second   = {};
    memory.operator = '';
    memory.prevKey  = '';
}


// CALCULATE FUNCTIONS
// The following functions calculate results.
const calculate = (v1, op, v2) => {
    let first  = valueToOperand(v1);
    let second = valueToOperand(v2);
    let addImp = v1.second || v2.second;                        // If either operand is feet-inch value, result is feet-inch.
    let mulImp = !!v1.second == !!v2.second ? true : false;     // If operands are feet-inch and number, result is feet-inch; otherwise result is a number.
    let result = 0;

    if (op === 'add')
        result = first + second;
    else if (op === 'sub')
        result = first - second;
    else if (op === 'mul')                      // Multiplication
        result = v1.second                          // When calculating product, all feet-inch values must be divided by 12;
            ? v2.second                             // when multiplying feet-inch values by numbers, numbers must be multiplied by 12
                ? (first / 12) * (second / 12)      // foot-inch * foot-inch
                : (first / 12) * (second * 12)      // foot-inch * number
            : v2.second
                ? (first * 12) * (second / 12)      // number * foot-inch
                : first * second;                   // number * number
    else if (op === 'div')                      // DIVISION
        result = v1.second                          // When calculating quotient, all feet-inch values must be divided by 12;
            ? v2.second                             // when dividing feet-inch values and numbers, the left operand must be multiplied by 12
                ? (first / 12) / (second / 12)      // foot-inch / foot-inch
                : (first * 12) / (second / 12)      // foot-inch / number
            : v2.second
                ? (first * 12) / (second / 12)      // number / foot-inch
                : first / second;                   // number / number

    result = isFinite(result) ? result : 0;     // Correct for divide-by-0 errors.

    if (op === 'add' || op === 'sub')
        return resultToValue(result, addImp);
    else if (op === 'mul' || op === 'div')
        return resultToValue(result, !mulImp);
}

// Formats a value object into a number value that can be operated on.
const valueToOperand = value => {
    let second   = value.second * 12 || 0;
    let first    = value.first.split(' ')[0] * 1;
    let dec      = value.first.split(' ')[1]
        ? (value.first.split(' ')[1].split('/')[0] || 0) / 
          (value.first.split(' ')[1].split('/')[1] || 1)
        : 0;
    return second + first + dec;
}

// Converts a result to a value object.
// isImp - A boolean value to determine whether the value is converted to feet-inches.
const resultToValue = (result, isImp) => {
    let second = isImp
        ? (result / 12 | 0) + ''
        : '';
    let first = isImp
        ? new Fraction(result % 12).simplify(.001).toFraction(true)
        : result + '';
    
    if (!first.includes(' ') && first.includes('/')) { first = '0 ' + first; }

    return new Value(first, second);
}


// KEY FUNCTIONS
// The following functions all interact with the calculator's keys.
// If necessary, disable and enable keys after a key press.
const updateKeys = key => {
    let keyType = getKeyType(key);

    // Enable and disable keys
    if      (keyType === 'ft')  { disableKeys('ft', 'in'); }
    else if (keyType === 'in')  { disableKeys('ft', 'in', 'fr', 'dec'); }
    else if (keyType === 'dec') { disableKeys('dec'); }
    else if (keyType === 'fr')  { 
        if (key.textContent === 'NUM') {
            disableKeys('ft', 'dec');
            key.textContent = 'DEN';
        }
        else {
            disableKeys('fr');
        }
    }
    else if (keyType === 'eq' || keyType === 'clr' || keyType === 'operator')  { 
        enableKeys(); 
        keys.querySelector('[data-action=fr]').textContent = 'NUM';
    }

    // Update clear key state
    keys.querySelector('[data-action=clr]').textContent = keyType === 'clr'
        ? 'AC'
        : 'CE';
}

// Disables a specified set of keys.
const disableKeys = (...args) => {
    let target = Array.prototype.slice.call(args);

    Array.from(keys.children).forEach(k => {
            if (target.includes(k.dataset.action))
                k.disabled = true;
        });
}

// Enables all keys.
const enableKeys = () => {
    Array.from(keys.children).forEach(k => {
            k.disabled = false;
        });
}

// Returns the pressed key's type.
const getKeyType = key => {
    let action = key.dataset.action;
    return action
        ? action === 'add' ||
          action === 'sub' ||
          action === 'div' ||
          action === 'mul'
            ? 'operator'
            : action
        : 'number';
}


// DISPLAY FUNCTIONS
// The following functions all interact with the calculator display.
const updateDisplay = value => {
    // Set values
    display.first.textContent  = value.first;
    display.second.textContent = value.second;

    // Display foot (') and inch (") symbols if foot-inch value
    if (value.second) {
        display.first.classList.add('imp');
        display.second.classList.add('imp');
    }
    else {
        display.first.classList.remove('imp');
        display.second.classList.remove('imp');
    }
}

// Clears the display.
const clearDisplay = () => {
    display.second.textContent = '';
    display.first.textContent  = '0';
}

// Returns the current display as a value object.
const getDisplay = () => {
    return new Value(display.first.textContent, display.second.textContent);
}


// HISTORY LOG FUNCTIONS
// The following functions update the history log whenever a result is produced.
const updateHistory = (first, operator, second, result) => {
    let eqStr   = valueToText(first) + operatorSymbol(operator) + valueToText(second);
    let resStr  = valueToText(result);
    let item    = document.createElement('li');
    let eq      = document.createElement('span');
    let res     = document.createElement('span');
    let eqText  = document.createTextNode(eqStr);
    let resText = document.createTextNode(resStr);
    eq.append(eqText);
    res.append(resText);
    item.append(eq, res);
    history.prepend(item);

    if (history.childElementCount > 10)
        history.lastElementChild.remove();
}

// Formats any foot-inch values to the following format: 1'-2 3/4"
const valueToText = value => {
    return value.second
        ? value.second + '\'-' + value.first + '"'
        : value.first + '';
}

// Reads the operator type and returns its equivalent symbol.
const operatorSymbol = operator => {
    switch (operator) {
        case "add": return ' + ';
        case "sub": return ' - ';
        case "mul": return ' x ';
        case "div": return ' / ';
    }
}


// VALUE OBJECT CONSTRUCTOR
// first - integers and inches
// second - feet
function Value(first, second) {
    this.first  = first;
    this.second = second;
}


const display = {
    first:  document.querySelector('#unit-first'),
    second: document.querySelector('#unit-second')
}
const keys    = document.querySelector('#calc-keys');
const history = document.querySelector('#hist-list');
const memory  = {};

keys.addEventListener('click', e => {
    const key = e.target;
    const displayVal = getDisplay();
    const resultVal  = getResult(key, displayVal);
    updateDisplay(resultVal);
    updateKeys(key);
    updateMemory(key, displayVal, resultVal);
});