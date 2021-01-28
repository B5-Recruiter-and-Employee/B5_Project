var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {
  // This function will display the specified tab of the form ...
  var x = document.getElementsByClassName("tab");
  x[n].style.display = "block";
  // autofocus on textfields:
  let input = x[n].getElementsByTagName("input");
  for (let i = 0; i < input.length; i++) {
    if (input[i].type === "text") {
      input[i].focus();
      break;
    }
  }
  // delete error message
  let errorMessage = x[n].getElementsByClassName("error-message");
  if (typeof errorMessage !== 'undefined') {
    for (let i = 0; i < errorMessage.length; i++) {
      errorMessage[i].parentNode.removeChild(errorMessage[i]);
    }
  }
  for (let i = 0; i < input.length; i++) {
    if (input[i].classList.contains("invalid")) {
      input[i].classList.remove("invalid");
    }
  }
  // ... and fix the Previous/Next buttons:
  if (n == 0) {
    document.getElementById("prevBtn").style.display = "none";
  } else {
    document.getElementById("prevBtn").style.display = "inline";
  }
  if (n == (x.length - 1)) {
    document.getElementById("nextBtn").innerHTML = "Submit";
  } else {
    document.getElementById("nextBtn").innerHTML = "Next »";
  }
  // ... and run a function that displays the correct step indicator:
  fixStepIndicator(n)
}

function nextPrev(n) {
  // This function will figure out which tab to display
  var x = document.getElementsByClassName("tab");
  // Exit the function if any field in the current tab is invalid:
  if ((n === 1 && !validateForm()) || n > 1) return false;
  // Increase or decrease the current tab by 1:
  currentTab = currentTab + n;
  // if you have reached the end of the form... :
  if (currentTab >= x.length) {
    //...the form gets submitted:
    document.getElementById("questionnaires").submit();
    return false;
  }
  // Hide the current tab:
  x[currentTab-n].style.display = "none";
  // Otherwise, display the correct tab:
  showTab(currentTab);
}

function validateForm() {
  // This function deals with validation of the form fields
  var tabs, inputField, select, i, valid = true;
  tabs = document.getElementsByClassName("tab");
  inputField = tabs[currentTab].getElementsByTagName("input");
  select = tabs[currentTab].getElementsByTagName("select");

  // A loop that checks every input field in the current tab:
  if (select.length === 0) {
    for (i = 0; i < inputField.length; i++) {
      // If a field is empty...
      if (inputField[i].value == "") {
        // add an "invalid" class to the field:
        if (!inputField[i].classList.contains("invalid")) {
          inputField[i].className += " invalid";
        }
        // and set the current valid status to false:
        valid = false;
        // add message that field is required:
        if (tabs[currentTab].getElementsByClassName("error-message").length === 0) {
          let sentence = tabs[currentTab].getElementsByClassName("sentence");
          sentence[0].insertAdjacentHTML("afterend", '<p class="error-message">Please fill out all fields.</p>');
        }
      }
    }
  } else {
    for (i = 0; i < inputField.length; i++) {
      // validate if at least on checkbox is checked
      if (inputField[i].type === "checkbox" && inputField[i].checked) {
        valid = true;
        break;
      } else {
        valid = false;
      }
    }
    if (valid === false) {
      // validation for tagsinput fields
      for (let j = 0; j < select.length; j++) {
        if (select[j].hasChildNodes()) {
          valid = true;
          if (inputField[j] && inputField[j].classList.contains("invalid")) {
            inputField[j].classList.remove("invalid");
          }
          break;
        } else {
          valid = false;
          inputField[j].className += " invalid";

          if (tabs[currentTab].getElementsByClassName("error-message").length === 0) {
            let sentence = tabs[currentTab].getElementsByClassName("sentence");
            sentence[0].insertAdjacentHTML("afterend", '<p class="error-message">Please enter at least one value.</p>');
          }
        }
      }
    }
  }

  // If the valid status is true, mark the step as finished and valid:
  if (valid) {
    // let errorMessage = document.getElementsByClassName("error-message");
    // errorMessage.style.display = 'none';
    document.getElementsByClassName("step")[currentTab].className += " finish";
  }
  return valid; // return the valid status
}

function fixStepIndicator(n) {
  // This function removes the "active" class of all steps...
  var i, x = document.getElementsByClassName("step");
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }
  //... and adds the "active" class to the current step:
  x[n].className += " active";
}

let questionnaire = document.getElementById("questionnaires");
let inputs = questionnaire.getElementsByTagName("input");
for (let i = 0; i < inputs.length; i++) {
  inputs[i].addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
      document.getElementById("nextBtn").click();
    }
  });
}