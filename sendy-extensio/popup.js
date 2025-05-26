const fieldSelect = document.getElementById('field-select');
const startBtn = document.getElementById('start-btn');
const statusText = document.getElementById('status');
const initialDiv = document.getElementById('initial-state');
const selectingDiv = document.getElementById('selecting-state');
const selectedDiv = document.getElementById('selected-state');
const currentFieldDisplay = document.getElementById('current-field-display');
const displayField = document.getElementById('display-field');
const displaySelector = document.getElementById('display-selector');
const displayContent = document.getElementById('display-content');
const cancelSelectionBtn = document.getElementById('cancel-selection-btn');
const saveSelectorBtn = document.getElementById('save-selector-btn');
const clearSelectionBtn = document.getElementById('clear-selection-btn');
const mainMessage = document.getElementById('main-message');

let selectedField = '';

function updateUIState(state) {
  initialDiv.classList.add('hidden');
  selectingDiv.classList.add('hidden');
  selectedDiv.classList.add('hidden');
  statusText.textContent = '';
  statusText.style.color = 'gray';

  if (state === 'initial') {
    initialDiv.classList.remove('hidden');
    mainMessage.textContent = 'בחר שדה ולחץ על אלמנט בדף';
    fieldSelect.value = '';
  } else if (state === 'selecting') {
    selectingDiv.classList.remove('hidden');
    mainMessage.textContent = 'ממתין לבחירת אלמנט...';
    currentFieldDisplay.textContent = fieldSelect.options[fieldSelect.selectedIndex].text;
    statusText.textContent = 'מרחף מעל אלמנטים בדף...';
  } else if (state === 'selected') {
    selectedDiv.classList.remove('hidden');
    mainMessage.textContent = 'בדוק את הפרטים שנבחרו:';
    statusText.textContent = 'לחץ "שמור סלקטור" או "בחר מחדש"';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateUIState('initial');

  chrome.runtime.sendMessage({ action: 'getLatestSelector' }, (message) => {
    if (message && message.selector) {
      updateUIState('selected');
      displayField.textContent = message.field;
      displaySelector.textContent = message.selector;
      displayContent.textContent = message.textContent;

      // הפוך את כפתור start ל"אשר בחירה"
      startBtn.textContent = '💾 אשר בחירה';
      startBtn.style.backgroundColor = '#4CAF50';
      startBtn.style.borderColor = '#4CAF50';

      startBtn.onclick = async () => {
        const { selector, field, url } = message;
        if (!selector || !field || !url) {
          statusText.textContent = 'נתוני בחירה חסרים.';
          return;
        }

        statusText.textContent = '📤 שולח בחירה לשרת...';
        statusText.style.color = 'orange';

        try {
          const res = await fetch('http://localhost:4135/api/train-selector', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selector, field, url })
          });

          if (res.ok) {
            statusText.textContent = `✅ נשמר סלקטור עבור "${field}"`;
            statusText.style.color = 'green';
            updateUIState('initial');
            startBtn.textContent = '🎯 התחל בחירה';
            startBtn.style.backgroundColor = '#0084FF';
            startBtn.style.borderColor = '#0084FF';
          } else {
            statusText.textContent = `❌ שגיאה: ${res.status}`;
            statusText.style.color = 'red';
          }
        } catch (err) {
          console.error(err);
          statusText.textContent = '❌ שגיאת רשת. ודא שהשרת פועל.';
          statusText.style.color = 'red';
        }
      };
    }
  });

  startBtn.addEventListener('click', async () => {
    selectedField = fieldSelect.value;
    if (!selectedField) {
      statusText.style.color = 'red';
      statusText.textContent = 'אנא בחר שדה לפני התחלה.';
      return;
    }

    const tabs = await chrome.tabs.query({});
    const tab = tabs.find(t => t.active && /^https?:/.test(t.url));
    if (!tab) {
      statusText.style.color = 'red';
      statusText.textContent = 'לא נמצא דף אינטרנט רגיל פתוח.';
      return;
    }

    chrome.tabs.sendMessage(tab.id, { ping: true }, async (res) => {
      if (chrome.runtime.lastError || !res || !res.pong) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
        } catch (err) {
          statusText.style.color = 'red';
          statusText.textContent = 'שגיאה בהזרקת סקריפט.';
          return;
        }
      }

      chrome.tabs.sendMessage(tab.id, { action: 'startSelection', field: selectedField }, (response) => {
        if (chrome.runtime.lastError) {
          statusText.style.color = 'red';
          statusText.textContent = 'שגיאה בשליחת הודעה.';
          return;
        }

        if (response && response.status === 'selectionStarted') {
          updateUIState('selecting');
          startBtn.textContent = '✅ אשר בחירה';
          startBtn.style.backgroundColor = '#4CAF50';
          startBtn.style.borderColor = '#4CAF50';
        } else {
          statusText.style.color = 'red';
          statusText.textContent = 'לא הצלחנו להתחיל בחירה.';
        }
      });
    });
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'selectorSelected') {
    updateUIState('selected');
    displayField.textContent = message.field;
    displaySelector.textContent = message.selector;
    displayContent.textContent = message.textContent;

    // הכפתור לא שומר יותר – המשתמש ילחץ על saveSelectorBtn
    saveSelectorBtn.onclick = async () => {
      const selector = message.selector;
      const field = message.field;
      const url = message.url;

      if (!selector || !field || !url) {
        statusText.textContent = '❌ נתוני בחירה חסרים.';
        statusText.style.color = 'red';
        return;
      }

      statusText.textContent = '📤 שומר סלקטור...';
      statusText.style.color = 'orange';

      try {
        const res = await fetch('http://localhost:4135/api/train-selector', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selector, field, url })
        });

        if (res.ok) {
          statusText.textContent = `✅ נשמר סלקטור עבור "${field}"`;
          statusText.style.color = 'green';

          // אפס ממשק וכפתור
          updateUIState('initial');
          startBtn.textContent = '🎯 התחל בחירה';
          startBtn.style.backgroundColor = '#0084FF';
          startBtn.style.borderColor = '#0084FF';
          selectedField = '';
        } else {
          statusText.textContent = `❌ שגיאה: ${res.status}`;
          statusText.style.color = 'red';
        }
      } catch (err) {
        console.error(err);
        statusText.textContent = '❌ שגיאת רשת. ודא שהשרת פועל.';
        statusText.style.color = 'red';
      }
    };
  }
});
