const tagContainer = document.querySelector('.tag-container');
const input = document.querySelector('.tag-container input');

var tags = []; //save all tag values to an array.

function createTag(label) {
  const div = document.createElement('div');
  div.setAttribute('class', 'tag'); //the div has class namely 'tag'
  const span = document.createElement('span');
  span.innerHTML = label;
  const closeBtn = document.createElement('i');
  closeBtn.setAttribute('class', 'material-icons');
  closeBtn.setAttribute('data-item', label);
  closeBtn.innerHTML = 'close';

  //add span and closeBtn to div as children
  div.appendChild(span);
  div.appendChild(closeBtn);
  return div;
}
//test
//tagContainer.prepend(createTag('Css'));

input.onkeypress = function(e) {
  if (!e) e = window.event;
  var keyCode = e.code || e.key;
  if (keyCode == 'Enter') {
    e.preventDefault(); //prevent submitting form
    tags.push(input.value);
    addTags();
    input.value = "";
  }
};

function addTags() {
  reset();
  tags.slice().reverse().forEach((tag) => {
    const input = createTag(tag);
    tagContainer.prepend(input);
  });
}

function reset(){
  document.querySelectorAll('.tag').forEach((tag) => {
    tag.parentElement.removeChild(tag);
  });
}

document.addEventListener('click', (e) => {
  if (e.target.tagName === 'I'){
    const value = e.target.getAttribute('data-item');
    const index = tags.indexOf(value);
    tags = [...tags.slice(0, index), ...tags.slice(index + 1)];
    console.log(tags);
    addTags();
  }
});
