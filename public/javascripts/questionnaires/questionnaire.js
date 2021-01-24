var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {
  // This function will display the specified tab of the form ...
  var x = document.getElementsByClassName("tab");
  x[n].style.display = "block";
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
var x;
function nextPrev(n) {
  // This function will figure out which tab to display
  x = document.getElementsByClassName("tab");
  // Exit the function if any field in the current tab is invalid:
  if (n == 1 && !validateForm()) return false;
  // Hide the current tab:
  x[currentTab].style.display = "none";
  // Increase or decrease the current tab by 1:
  currentTab = currentTab + n;
  // if you have reached the end of the form... :
  if (currentTab >= x.length) {
    //...the form gets submitted:
    document.getElementById("questionnaires").submit();
    return false;
  }
  // Otherwise, display the correct tab:
  showTab(currentTab);
}

function validateForm() {
  // This function deals with validation of the form fields
  var tabs, inputField, select, i, valid = true;
  tabs = document.getElementsByClassName("tab");
  inputField = tabs[currentTab].getElementsByTagName("input");
  textarea = tabs[currentTab].getElementsByTagName("textarea");
  select = tabs[currentTab].getElementsByTagName("select");
  

  // A loop that checks every input field in the current tab:
  if (select.length === 0 && textarea.length === 0) {
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
  } else if (textarea.length !== 0) {
    for (i = 0; i < textarea.length; i++) {
      if (textarea[i].value == "") {
        if (!textarea[i].classList.contains("invalid")) {
          textarea[i].className += " invalid";
        }
        valid = false;
        if (tabs[currentTab].getElementsByClassName("error-message").length === 0) {
          let sentence = tabs[currentTab].getElementsByClassName("sentence");
          sentence[0].insertAdjacentHTML("afterend", '<p class="error-message">Please fill out all fields.</p>');
        }
      }
    }
  } else {
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
          sentence[0].insertAdjacentHTML("afterend", '<p class="error-message">Please fill out at least one field.</p>');
        }
      }
    }
    if(currentTab == x.length-1){ //check the last tab of recruiter questionnaire
      extras = document.getElementsByName("extras");
      for(i = 0; i< extras.length;i++){
        //if the checkboxes are checked, then validate the input field
         if(extras[i].checked){
            valid = true;
            break;
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


// const input = document.querySelector('input');

// prevent enter button from submitting form
// input.onkeypress = function(e) {
//     if (!e) e = window.event;
//     var keyCode = e.code || e.key;
//     if (keyCode == 'Enter') {
//       e.preventDefault(); //prevent submitting form
//     }
// };