// 拡張機能インストール時の処理
chrome.runtime.onInstalled.addListener(function(details) {
  // 初回インストール時にオプション画面を開く
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
  
  // デフォルト設定を保存（バッチサイズ、最大バッチ長、リクエスト間遅延）
  chrome.storage.local.get(['batchSize', 'maxBatchLength', 'delayBetweenRequests'], function(items) {
    if (!items.batchSize) chrome.storage.local.set({ batchSize: 20 });
    if (!items.maxBatchLength) chrome.storage.local.set({ maxBatchLength: 4000 });
    if (!items.delayBetweenRequests) chrome.storage.local.set({ delayBetweenRequests: 1000 });
  });

  // デフォルトのAPIプロバイダーとAPIキーを設定
  chrome.storage.local.get(['apiProvider', 'geminiApiKey', 'openaiApiKey', 'deepseekApiKey'], function(items) {
    if (!items.apiProvider) chrome.storage.local.set({ apiProvider: 'gemini' });
    if (!items.geminiApiKey) chrome.storage.local.set({ geminiApiKey: '' });
    if (!items.openaiApiKey) chrome.storage.local.set({ openaiApiKey: '' });
    if (!items.deepseekApiKey) chrome.storage.local.set({ deepseekApiKey: '' });
  });

  // コンテキストメニューを作成
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

// メッセージ受信時の処理
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (sender.tab && (request.action === "updateProgress" ||
                     request.action === "translationComplete" ||
                     request.action === "translationError")) {
    chrome.runtime.sendMessage(request, function(response) {
      if (chrome.runtime.lastError) {
      }
    });
  }
});

// コンテキストメニュークリック時の処理
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "toggleTranslation") {
    chrome.tabs.sendMessage(tab.id, { action: "toggleTranslation" });
  }
});

// ストレージの変更を監視し、言語変更時にコンテキストメニューのタイトルを更新
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