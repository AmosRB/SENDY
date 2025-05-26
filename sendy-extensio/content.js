let isSelecting = false;
let currentField = '';
let selectedElement = null;

function getCssSelector(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return null;

  const path = [];
  while (el && el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.id) {
      selector += `#${el.id}`;
      path.unshift(selector);
      break;
    } else {
      let classNames = Array.from(el.classList).filter(c => c.length > 0 && c.indexOf(':') === -1);
      if (classNames.length > 0) selector += `.${classNames.join('.')}`;

      let siblingSelector = selector;
      let nth = 1;
      let prev = el.previousElementSibling;
      while (prev) {
        if (prev.nodeName.toLowerCase() === el.nodeName.toLowerCase() &&
            Array.from(prev.classList).every(c => classNames.includes(c))) {
          nth++;
        }
        prev = prev.previousElementSibling;
      }
      if (nth > 1) selector += `:nth-child(${nth})`;
      path.unshift(selector);
      el = el.parentNode;
    }
  }
  return path.join(' > ');
}

function highlightElement(element) {
  if (selectedElement) selectedElement.style.outline = '';
  if (element) {
    element.style.outline = '2px solid red';
    element.style.cursor = 'crosshair';
    selectedElement = element;
  }
}

function removeHighlight() {
  if (selectedElement) {
    selectedElement.style.outline = '';
    selectedElement.style.cursor = '';
    selectedElement = null;
  }
}

function handleMouseOver(e) {
  if (isSelecting) {
    if (!['HTML', 'BODY', 'SCRIPT', 'STYLE', 'HEAD', 'LINK'].includes(e.target.nodeName)) {
      highlightElement(e.target);
    }
  }
}

function handleMouseOut(e) {
  if (isSelecting) removeHighlight();
}

function handleClick(e) {
  if (isSelecting) {
    e.preventDefault();
    e.stopPropagation();

    removeHighlight();
    isSelecting = false;

    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('mouseout', handleMouseOut);
    document.removeEventListener('click', handleClick, true);

    const selectedElement = e.target;
    const selector = getCssSelector(selectedElement);
    const textContent = selectedElement.innerText.trim();
    const outerHTMLContent = selectedElement.outerHTML.trim();

    chrome.runtime.sendMessage({
      action: 'selectorSelected',
      field: currentField,
      selector: selector,
      textContent: textContent,
      outerHTMLContent: outerHTMLContent,
      url: window.location.href
    });
  }
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.ping) {
    sendResponse({ pong: true });
    return;
  }
  if (message.action === 'startSelection') {
    isSelecting = true;
    currentField = message.field;
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('click', handleClick, true);
    sendResponse({ status: 'selectionStarted' });
  } else if (message.action === 'cancelSelection') {
    isSelecting = false;
    removeHighlight();
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('mouseout', handleMouseOut);
    document.removeEventListener('click', handleClick, true);
    sendResponse({ status: 'selectionCancelled' });
  }
});