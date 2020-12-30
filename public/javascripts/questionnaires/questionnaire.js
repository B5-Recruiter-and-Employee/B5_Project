const input = document.querySelector('input');

// prevent enter button from submitting form
input.onkeypress = function(e) {
    if (!e) e = window.event;
    var keyCode = e.code || e.key;
    if (keyCode == 'Enter') {
      e.preventDefault(); //prevent submitting form
    }
};

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

