chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
  
  chrome.storage.local.get(['batchSize', 'maxBatchLength', 'delayBetweenRequests'], function(items) {
    if (!items.batchSize) {
      chrome.storage.local.set({ batchSize: 20 });
    }
    if (!items.maxBatchLength) {
      chrome.storage.local.set({ maxBatchLength: 4000 });
    }
    if (!items.delayBetweenRequests) {
      chrome.storage.local.set({ delayBetweenRequests: 1000 });
    }
  });


  chrome.storage.local.get(['targetLanguage'], function(items) {
    const lang = items.targetLanguage || 'en';
    const contextMenuTranslations = {
      en: "Toggle Translation",
      ja: "翻訳の切り替え",
      fr: "Basculer la traduction",
      de: "Übersetzung umschalten",
      es: "Alternar traducción",
      it: "Attiva/disattiva traduzione",
      pt: "Alternar tradução",
      ru: "Переключить перевод",
      zh: "切换翻译",
      ko: "번역 전환"
    };
    chrome.contextMenus.create({
      id: "toggleTranslation",
      title: contextMenuTranslations[lang] || contextMenuTranslations.en,
      contexts: ["all"]
    });
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (sender.tab && (request.action === "updateProgress" ||
                     request.action === "translationComplete" ||
                     request.action === "translationError")) {
    chrome.runtime.sendMessage(request, function(response) {
      if (chrome.runtime.lastError) {
        console.error("Message not received by any listener:", chrome.runtime.lastError.message);
      }
    });
  }
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "toggleTranslation") {
    chrome.tabs.sendMessage(tab.id, { action: "toggleTranslation" });
  }
});

chrome.storage.onChanged.addListener(function(changes, area) {
  if (area === "local" && changes.targetLanguage) {
    const newLang = changes.targetLanguage.newValue || 'en';
    const contextMenuTranslations = {
      en: "Toggle Translation",
      ja: "翻訳の切り替え",
      fr: "Basculer la traduction",
      de: "Übersetzung umschalten",
      es: "Alternar traducción",
      it: "Attiva/disattiva traduzione",
      pt: "Alternar tradução",
      ru: "Переключить перевод",
      zh: "切换翻译",
      ko: "번역 전환"
    };
    chrome.contextMenus.update("toggleTranslation", {
      title: contextMenuTranslations[newLang] || contextMenuTranslations.en
    });
  }
});