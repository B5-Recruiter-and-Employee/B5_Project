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

function nextPrev(n) {
  // This function will figure out which tab to display
  var x = document.getElementsByClassName("tab");
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
  var x, y, t, i, valid = true;
  x = document.getElementsByClassName("tab");
  y = x[currentTab].getElementsByTagName("input");
  z = x[currentTab].getElementsByTagName("textarea");
  t = x[currentTab].getElementsByTagName("select");
  // A loop that checks every input field in the current tab:
  if (t.length === 0 && z.length === 0) {
    for (i = 0; i < y.length; i++) {
      // If a field is empty...
      if (y[i].value == "") {
        // add an "invalid" class to the field:
        if (!y[i].classList.contains("invalid")) {
          y[i].className += " invalid";
        }
        // and set the current valid status to false:
        valid = false;
        // add message that field is required:
        if (x[currentTab].getElementsByClassName("error-message").length === 0) {
          let sentence = x[currentTab].getElementsByClassName("sentence");
          sentence[0].insertAdjacentHTML("afterend", '<p class="error-message">Please fill out all fields.</p>');
        }
      }
    }
  } else if (z.length !== 0) {
    for (i = 0; i < z.length; i++) {
      if (z[i].value == "") {
        if (!z[i].classList.contains("invalid")) {
          z[i].className += " invalid";
        }
        valid = false;
        if (x[currentTab].getElementsByClassName("error-message").length === 0) {
          let sentence = x[currentTab].getElementsByClassName("sentence");
          sentence[0].insertAdjacentHTML("afterend", '<p class="error-message">Please fill out all fields.</p>');
        }
      }
    }
  } else {
    for (let j = 0; j < t.length; j++) {
      if (t[j].hasChildNodes()) {
        valid = true;
        if (y[j] && y[j].classList.contains("invalid")) {
          y[j].classList.remove("invalid");
        }
        break;
      } else {
        valid = false;
        y[j].className += " invalid";

        if (x[currentTab].getElementsByClassName("error-message").length === 0) {
          let sentence = x[currentTab].getElementsByClassName("sentence");
          sentence[0].insertAdjacentHTML("afterend", '<p class="error-message">Please fill out at least one field.</p>');
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

// Hide prev, next carousel control accordingly on the first/last page
// $('.carousel').carousel({
//     interval: false,
// })

// $(document).ready(function () {               // on document ready
//     checkitem();
// });

// $('#candidate_questions, #job_questions').on('slid.bs.carousel', checkitem);

// function checkitem()                        // check function
// {
//     var $this = $('#candidate_questions, #job_questions');
//     if ($('.carousel-inner .item:first').hasClass('active')) {
//         // Hide left arrow
//         $this.children('.carousel-control-prev').hide();
//         // But show right arrow
//         $this.children('.carousel-control-next').show();
//     } else if ($('.carousel-inner .item:last').hasClass('active')) {
//         // Hide right arrow
//         $this.children('.carousel-control-next').hide();
//         // But show left arrow
//         $this.children('.carousel-control-prev').show();
//     } else {
//         $this.children('.carousel-control').show();
//     }
// }

