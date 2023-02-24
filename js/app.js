/*<!-- <-----------------------------------------------------------------------------------

    Calculator Name: Chendo calc
    Theme URI: https
    Description: Calculator Open Source
    Author: @chendodev - chendo : developer && web designer
    Author URI: http://chendo.dev in development
    Github: https://github.com/chendodev
    Youtube: https://youtube.com/@chendodev
    Version: 1.0.1

----------------------------------------------------------------------------------------->*/
/*show display*/
const resultsCalc = document.querySelector("#results_calc"); 
const showResult = document.querySelector('.show-result');
let showOp = document.querySelector('#texto');
/*<--onOff-->*/
const onOffButton = document.querySelector('.onOff');

/*Turn on off*/
onOffButton.addEventListener('click', () => {
    resultsCalc.value = '';
    showResult.textContent = '';
    showOp.classList.toggle('turn-on-off');
});

// calculator function -> show -> custom
function calculator() {
    document.addEventListener('click', e => {
        let target = e.target;
        if (target.tagName === "BUTTON") {
            let cutedValue = target.value.trim();
            switch (true){
                case cutedValue == "equal":
                    checkButtonValue(resultsCalc) ? printResult(resultsCalc) : 'ERROR SINTAXIS'; // verifying and displaying results
                break;
                case cutedValue == "clear": // if clear
                    // clean everything
                    resultsCalc.value = ''; 
                    showResult.textContent = '';
                    showOp.textContent = '';
                break;
                case cutedValue == "del":
                    deleteCharacter(resultsCalc); // function -> delete back --> input hidden
                    showOp.textContent = showOp.textContent.slice(0,-1); // delete char --> showOp
                break;
                case (cutedValue === "ln" 
                || cutedValue === "exp" 
                || cutedValue === "pow" 
                || cutedValue === "log" 
                || cutedValue === "ans" 
                // add more operations
                || cutedValue === "sq" 
                || cutedValue === "sqrt" 
                || cutedValue === "sin" 
                || cutedValue === "cos"
                || cutedValue === "tan"):
                if (checkButtonValue(resultsCalc)) { 
                    if (cutedValue === "ln") {
                        cutedValue = "log";
                    }
                    // add more features
                    else if (cutedValue === "pow") {
                        resultsCalc.value = eval(resultsCalc.value) * eval(resultsCalc.value) * eval(resultsCalc.value);
                        showOp.textContent = resultsCalc.value
                    break;
                    } 
                    // <----------------> //
                    else if (cutedValue === "sq") {
                        resultsCalc.value = eval(resultsCalc.value) * eval(resultsCalc.value);
                        showOp.textContent = resultsCalc.value
                    break;
                    } // default operation -->
                    resultsCalc.value = eval(Math[cutedValue](resultsCalc.value));
                    showOp.textContent = resultsCalc.value
                }	
                break;
                default: // show function
                    addDisplay(resultsCalc, target.value);	
                    break;
            }
        }
    });
}
// show display --> top
const addDisplay = (input, character) => {
    showOp.textContent = input.value + character.trim();
    input.value == null || input.value == ""
    ?  input.value = character.trim()
    :  input.value += character.trim();
}
// back --> char --> del
const deleteCharacter = (button) => {
    button.value = button.value.substring(0, button.value.length - 1)
}
// print result
const printResult = (calc) => {
    showResult.textContent = eval(calc.value)
}
// check number and char
const checkButtonValue = (string) => {
    for (let i = 0; i < string.length; i++) {
      let character = string[i];
      if (!["/", "*", "+", "-", ".", "(", ")"].includes(character) && isNaN(character)) {
        alert("invalid entry!");
        return false;
      }
    }
    return true;
  };
calculator();