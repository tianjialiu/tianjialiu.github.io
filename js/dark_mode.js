function applyToAll(elementName,elementType,className) {
  var element;
  if (elementType == 'tag') {element = document.getElementsByTagName(elementName)}
  if (elementType == 'class') {element = document.getElementsByClassName(elementName)}
  for (var i = 0; i < element.length; i++) {
    element[i].classList.toggle(className)
  }
}

function deapplyToAll(elementName,className) {
  var element = document.querySelectorAll(elementName);
  for (var i = 0; i < element.length; i++) {
      element[i].classList.remove(className)
  }
}

function toggleLightDarkButton() {
  var button = document.getElementById("lightDarkMode");
  if (button.innerHTML === "🌖") {
      button.innerHTML = "🌒";
  } else {
      button.innerHTML = "🌖";
  }
  sessionStorage.setItem('buttonState', button.innerHTML);
}

function toggleLightDark() {  
  var button = document.getElementById("lightDarkMode");
  document.body.classList.toggle("dark-mode");     

  applyToAll('h1','tag','dark-mode')
  applyToAll('h2','tag','dark-mode')
  applyToAll('h3','tag','dark-mode')
  applyToAll('p','tag','dark-mode')
  applyToAll('a','tag','dark-mode')
  applyToAll('b','tag','dark-mode-lightgray')
  applyToAll('announcement','class','dark-mode-lightgray')
  applyToAll('black-text','class','dark-mode-lightgray')
  applyToAll('social-icon','class','dark-mode-icon')
  applyToAll('li','tag','dark-mode')
  applyToAll('nestedMenu','tag','dark-mode')

  var menuColor;
  if (button.innerHTML === "🌖") {
      menuColor = 'black'
  } else {
      menuColor = 'white'
  }

   var mouse_on = function(event) {
      event.currentTarget.style['border-left'] = '1px solid ' + menuColor
      event.currentTarget.style['border-bottom'] = '1px solid ' + menuColor
      event.currentTarget.style['color'] = menuColor;
  }

  var mouse_off = function(event) {
      event.currentTarget.style.color = '#999';
      event.currentTarget.style.border = '';
  }

  var menuItems = document.querySelectorAll('ul > li');
  for (var i = 0; i < menuItems.length; i++) {
      menuItems[i].addEventListener('mouseover', mouse_on);
      menuItems[i].addEventListener('mouseout', mouse_off);
  };

  var menuItemsNested = document.querySelectorAll('ul > li > ul > li');
  for (var i = 0; i < menuItemsNested.length; i++) {
     menuItemsNested[i].addEventListener('mouseover', mouse_on);
     menuItemsNested[i].addEventListener('mouseout', mouse_off);
  };

  var scrollTopButton = document.getElementById("scrollTopButton");
  if (button.innerHTML === "🌖") {
    scrollTopButton.style.backgroundColor = '#282C32'
    scrollTopButton.style.color = 'white'
    for (var i = 0; i < menuItemsNested.length; i++) {
      menuItemsNested[i].style['background-color'] = 'white'
    };
  } else {
    scrollTopButton.style.backgroundColor = 'white'
    scrollTopButton.style.color = '#282C32'
    for (var i = 0; i < menuItemsNested.length; i++) {
      menuItemsNested[i].style['background-color'] = '#282C32'
    };
  }

  deapplyToAll('td > a','dark-mode')
}
