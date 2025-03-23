// content.js

(function() {
  const MAX_RETRIES = 5; // 最大再試行回数を5に設定

  const promptMessages = {
    ja: 'このページを翻訳しますか？',
    en: 'Do you want to translate this page?',
    fr: 'Voulez-vous traduire cette page ?',
    de: 'Möchten Sie diese Seite übersetzen?',
    es: '¿Desea traducir esta página?',
    it: 'Vuoi tradurre questa pagina?',
    pt: 'Deseja traduzir esta página?',
    ru: 'Перевести эту страницу?',
    zh: '要翻译此页面吗？',
    ko: '이 페이지를 번역하시겠습니까?'
  };

  const translateButtonTexts = {
    ja: { yes: '翻訳', no: 'いいえ', never: 'このサイトでは表示しない' },
    en: { yes: 'Translate', no: 'No', never: 'Don\'t show for this site' },
    fr: { yes: 'Traduire', no: 'Non', never: 'Ne pas afficher ce site' },
    de: { yes: 'Übersetzen', no: 'Nein', never: 'Diese Seite nicht anzeigen' },
    es: { yes: 'Traducir', no: 'No', never: 'No mostrar este sitio' },
    it: { yes: 'Traduci', no: 'No', never: 'Non mostrare questo sito' },
    pt: { yes: 'Traduzir', no: 'Não', never: 'Não mostrar para este site' },
    ru: { yes: 'Перевести', no: 'Нет', never: 'Не показывать для этого сайта' },
    zh: { yes: '翻译', no: '不', never: '不在此网站显示' },
    ko: { yes: '번역', no: '아니오', never: '이 사이트는 표시하지 않음' }
  };

  const statusTranslations = {
    en: {
      translating: 'Translating...',
      noTextFound: 'No text found to translate',
      translationCompleted: 'Translation completed',
      errorOccurred: 'An error occurred',
      apiLimitError: 'You have reached the request limit. Please adjust your request interval or batch size in the settings.',
      progressTemplate: 'Batch: {currentBatch}/{totalBatch}, Texts: {translatedTexts}/{expected}'
    },
    ja: {
      translating: '翻訳中...',
      noTextFound: '翻訳するテキストが見つかりませんでした',
      translationCompleted: '翻訳が完了しました',
      errorOccurred: 'エラーが発生しました',
      apiLimitError: 'リクエスト制限に達しました。リクエスト間隔やバッチサイズを設定で調整してください。',
      progressTemplate: 'バッチ: {currentBatch}/{totalBatch}, テキスト: {translatedTexts}/{expected}'
    },
    fr: {
      translating: 'Traduction en cours...',
      noTextFound: 'Aucun texte à traduire',
      translationCompleted: 'Traduction terminée',
      errorOccurred: 'Une erreur s\'est produite',
      apiLimitError: 'Limite de requêtes atteinte. Veuillez ajuster l\'intervalle ou la taille du lot dans les paramètres.',
      progressTemplate: 'Lot : {currentBatch}/{totalBatch}, Textes : {translatedTexts}/{expected}'
    },
    de: {
      translating: 'Übersetzen...',
      noTextFound: 'Kein zu übersetzender Text gefunden',
      translationCompleted: 'Übersetzung abgeschlossen',
      errorOccurred: 'Ein Fehler ist aufgetreten',
      apiLimitError: 'Anfragerate-Limit erreicht. Bitte passen Sie das Anfrageintervall oder die Batch-Größe in den Einstellungen an.',
      progressTemplate: 'Stapel: {currentBatch}/{totalBatch}, Texte: {translatedTexts}/{expected}'
    },
    es: {
      translating: 'Traduciendo...',
      noTextFound: 'No se encontró texto para traducir',
      translationCompleted: 'Traducción completada',
      errorOccurred: 'Ocurrió un error',
      apiLimitError: 'Se ha alcanzado el límite de solicitudes. Ajuste el intervalo de solicitudes o el tamaño de lote en la configuración.',
      progressTemplate: 'Lote: {currentBatch}/{totalBatch}, Textos: {translatedTexts}/{expected}'
    },
    it: {
      translating: 'Traducendo...',
      noTextFound: 'Nessun testo da tradurre trovato',
      translationCompleted: 'Traduzione completata',
      errorOccurred: 'Si è verificato un errore',
      apiLimitError: 'Raggiunto il limite di richieste. Regola l\'intervallo di richieste o la dimensione del batch nelle impostazioni.',
      progressTemplate: 'Blocco: {currentBatch}/{totalBatch}, Testi: {translatedTexts}/{expected}'
    },
    pt: {
      translating: 'Traduzindo...',
      noTextFound: 'Nenhum texto encontrado para traduzir',
      translationCompleted: 'Tradução concluída',
      errorOccurred: 'Ocorreu um erro',
      apiLimitError: 'Limite de solicitações atingido. Ajuste o intervalo de solicitações ou o tamanho do lote nas configurações.',
      progressTemplate: 'Lote: {currentBatch}/{totalBatch}, Textos: {translatedTexts}/{expected}'
    },
    ru: {
      translating: 'Перевод...',
      noTextFound: 'Не найдено текста для перевода',
      translationCompleted: 'Перевод завершен',
      errorOccurred: 'Произошла ошибка',
      apiLimitError: 'Достигнут предел запросов. Измените интервал запросов или размер партии в настройках.',
      progressTemplate: 'Пакет: {currentBatch}/{totalBatch}, Тексты: {translatedTexts}/{expected}'
    },
    zh: {
      translating: '正在翻译...',
      noTextFound: '没有可翻译的文本',
      translationCompleted: '翻译完成',
      errorOccurred: '发生错误',
      apiLimitError: '已达到请求限制。请在设置中调整请求间隔或批处理大小。',
      progressTemplate: '批次: {currentBatch}/{totalBatch}, 文本: {translatedTexts}/{expected}'
    },
    ko: {
      translating: '번역 중...',
      noTextFound: '번역할 텍스트가 없습니다',
      translationCompleted: '번역이 완료되었습니다',
      errorOccurred: '오류가 발생했습니다',
      apiLimitError: '요청 한도에 도달했습니다. 설정에서 요청 간격 또는 배치 크기를 조정하세요.',
      progressTemplate: '배치: {currentBatch}/{totalBatch}, 텍스트: {translatedTexts}/{expected}'
    }
  };

  let isTranslating = false;
  let translationStarted = false;

  let translationProgress = 0;
  let translatedCount = 0;
  let totalBatches = 0;
  let batchesProcessed = 0;
  let expectedTotalTexts = 0;

  let textNodesForTranslation = [];
  let uniqueIdCounter = 0;

  let newTextObserver = null;
  let progressInterval = null;
  let statusContainer = null;
  let statusShadowRoot = null;

  const lastSeenTextMap = new WeakMap();

  function initTranslation() {
    chrome.storage.local.get(['targetLanguage', 'realTimeTranslation', 'excludeList', 'apiProvider'], function(items) {
      const currentUrl = window.location.href;
      const excludeList = items.excludeList || [];
      if (excludeList.some(prefix => currentUrl.startsWith(prefix))) {
        return;
      }
      watchForNewText();

      const pageLang = getPageLanguage();
      const chosenLang = items.targetLanguage || 'en';

      const pageLangPrimary = pageLang ? pageLang.split('-')[0].toLowerCase() : null;
      const chosenLangPrimary = chosenLang.split('-')[0].toLowerCase();

      if (items.realTimeTranslation === true) {
        translationStarted = true;
        startTranslation();
      } else {
        // ページ言語が判定できず、または設定言語と異なる場合のみポップアップを表示
        if (!pageLangPrimary || pageLangPrimary !== chosenLangPrimary) {
          createTranslationPrompt(chosenLang);
        }
      }
    });
  }

  function getPageLanguage() {
    // 1. HTMLのlang属性から言語を取得
    const langAttr = document.documentElement.lang;
    if (langAttr) {
      return langAttr.toLowerCase();
    }

    // 2. URLから言語を推測
    const url = window.location.href;
    const urlLang = extractLanguageFromUrl(url);
    if (urlLang) {
      return urlLang.toLowerCase();
    }

    // 言語が特定できない場合はnullを返す
    return null;
  }

  function extractLanguageFromUrl(url) {
    // 言語コードのパターン: 2文字または "xx-XX" 形式
    const languagePattern = /^[a-z]{2}(-[A-Z]{2})?$/;
    // 設定可能な言語リスト
    const validLanguages = ['en', 'ja', 'fr', 'de', 'es', 'it', 'pt', 'ru', 'zh', 'ko'];

    // サブドメインをチェック (例: ja.example.com)
    const subdomainMatch = url.match(/^https?:\/\/([a-z]{2}(-[A-Z]{2})?)\./);
    if (subdomainMatch && languagePattern.test(subdomainMatch[1]) && validLanguages.includes(subdomainMatch[1].split('-')[0])) {
      return subdomainMatch[1];
    }

    // パスの先頭をチェック (例: /ja/page.html)
    const pathMatch = url.match(/^https?:\/\/[^\/]+\/([a-z]{2}(-[A-Z]{2})?)(?:\/|$)/);
    if (pathMatch && languagePattern.test(pathMatch[1]) && validLanguages.includes(pathMatch[1].split('-')[0])) {
      return pathMatch[1];
    }

    // クエリパラメータをチェック (例: ?lang=ja)
    const urlObj = new URL(url);
    const langParam = urlObj.searchParams.get('lang') || urlObj.searchParams.get('language');
    if (langParam && languagePattern.test(langParam) && validLanguages.includes(langParam.split('-')[0])) {
      return langParam;
    }

    return null;
  }

  function createTranslationPrompt(lang) {
    if (document.querySelector('.gemini-translator-prompt-shadow')) return;

    const promptMsg = promptMessages[lang] || promptMessages.en;
    const btnTexts = translateButtonTexts[lang] || translateButtonTexts.en;

    const container = document.createElement('div');
    container.className = 'gemini-translator-prompt-shadow';
    container.style.position = 'fixed';
    container.style.top = '20px';
    container.style.right = '20px';
    container.style.zIndex = '2147483647';

    const shadow = container.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      .gemini-translator-prompt {
        background-color: white;
        color: black;
        border: 2px solid #ccc;
        border-radius: 5px;
        padding: 15px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        font-family: Arial, sans-serif;
        max-width: 250px;
        text-align: center;
        font-size: 14px;
      }
      .prompt-text {
        margin-bottom: 10px;
        word-wrap: break-word;
      }
      .prompt-buttons {
        display: flex;
        justify-content: space-between;
      }
      .prompt-buttons button {
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        flex-grow: 0.45;
      }
      #translate-yes {
        background-color: #4285f4;
        color: white;
      }
      #translate-yes:hover {
        background-color: #3367d6;
      }
      #translate-no {
        background-color: #f5f5f5;
        color: #333;
      }
      #translate-no:hover {
        background-color: #e0e0e0;
      }
      #translate-never {
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        width: 100%;
        margin-top: 10px;
        background-color: #f5f5f5;
        color: #333;
      }
      #translate-never:hover {
        background-color: #e0e0e0;
      }
    `;

    shadow.appendChild(style);

    const promptDiv = document.createElement('div');
    promptDiv.className = 'gemini-translator-prompt';

    const textDiv = document.createElement('div');
    textDiv.className = 'prompt-text';
    textDiv.textContent = promptMsg;

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'prompt-buttons';

    const yesButton = document.createElement('button');
    yesButton.id = 'translate-yes';
    yesButton.textContent = btnTexts.yes;

    const noButton = document.createElement('button');
    noButton.id = 'translate-no';
    noButton.textContent = btnTexts.no;

    buttonsDiv.appendChild(yesButton);
    buttonsDiv.appendChild(noButton);

    const neverButton = document.createElement('button');
    neverButton.id = 'translate-never';
    neverButton.textContent = btnTexts.never;

    promptDiv.appendChild(textDiv);
    promptDiv.appendChild(buttonsDiv);
    promptDiv.appendChild(neverButton);

    shadow.appendChild(promptDiv);

    document.body.appendChild(container);

    yesButton.addEventListener('click', function() {
      container.remove();
      translationStarted = true;
      startTranslation();
    });

    noButton.addEventListener('click', function() {
      container.remove();
    });

    neverButton.addEventListener('click', function() {
      chrome.storage.local.get(['excludeList'], function(items) {
        let excludeList = items.excludeList || [];
        const siteOrigin = new URL(window.location.href).origin;
        if (!excludeList.includes(siteOrigin)) {
          excludeList.push(siteOrigin);
          chrome.storage.local.set({ excludeList });
        }
      });
      container.remove();
    });
  }

  function watchForNewText() {
    if (newTextObserver) return;
    newTextObserver = new MutationObserver(mutations => {
      let newFound = false;
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
            newFound = true;
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.innerText && node.innerText.trim().length > 0) {
              newFound = true;
            }
          }
        });
      });
      if (newFound && translationStarted && !isTranslating) {
        startTranslation();
      }
    });
    newTextObserver.observe(document.body, { childList: true, subtree: true });
  }

  async function startTranslation() {
    if (isTranslating) return;
    isTranslating = true;

    translatedCount = 0;
    totalBatches = 0;
    batchesProcessed = 0;
    expectedTotalTexts = 0;
    translationProgress = 0;

    textNodesForTranslation = [];
    collectAllUntranslatedText();

    chrome.storage.local.get([
      'targetLanguage',
      'batchSize',
      'maxBatchLength',
      'showProgressPopup',
      'apiProvider'
    ], async (config) => {
      const lang = config.targetLanguage || 'en';
      const st = statusTranslations[lang] || statusTranslations.en;

      if (textNodesForTranslation.length === 0) {
        isTranslating = false;
        chrome.runtime.sendMessage({
          action: "translationComplete",
          message: st.noTextFound
        });
        removeStatusIndicator();
        return;
      }

      expectedTotalTexts = textNodesForTranslation.length;

      if (config.showProgressPopup !== false) {
        createOrShowProgressPopup(lang);
        if (!progressInterval) {
          progressInterval = setInterval(() => updateProgress(lang), 300);
        }
      }

      const targetLanguage = lang;
      const batchSize = config.batchSize || 80;
      const maxBatchLength = config.maxBatchLength || 5000;
      const apiProvider = config.apiProvider || 'gemini';

      const batches = createBatches(textNodesForTranslation, batchSize, maxBatchLength);
      totalBatches = batches.length;
      updateProgress(lang);

      const concurrencyLimit = 5;
      const tasks = batches.map(batch => () => processBatch(batch, targetLanguage, apiProvider)
        .then((translations) => {
          for (const t of translations) {
            const nodeEntry = batch.find(x => x.id === t.id);
            if (nodeEntry && t.translation) {
              applyTranslation(nodeEntry.node, t.translation);
              translatedCount++;
            }
          }
          batchesProcessed++;
          updateProgress(lang);
        })
        .catch(err => {
          if (err && err.message === 'API_LIMIT_REACHED') {
            chrome.runtime.sendMessage({
              action: "translationError",
              error: st.apiLimitError
            });
          } else {
            chrome.runtime.sendMessage({
              action: "translationError",
              error: st.errorOccurred
            });
          }
          throw err;
        })
      );

      await limitConcurrency(tasks, concurrencyLimit);

      finishTranslation(lang);
    });
  }

  function collectAllUntranslatedText() {
    function traverse(node) {
      if (
        node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE' ||
        node.nodeName === 'NOSCRIPT' || node.nodeName === 'SVG' ||
        node.nodeName === 'IFRAME' || node.nodeName === 'CANVAS'
      ) return;

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (text.length > 0 && !isNumericOnly(text)) {
          if (node.parentNode && node.parentNode.dataset && node.parentNode.dataset.isTranslated === "true") {
            return;
          }
          const lastSeen = lastSeenTextMap.get(node) || "";
          if (text === lastSeen) {
            return;
          }
          lastSeenTextMap.set(node, text);
          textNodesForTranslation.push({
            id: generateUniqueId(),
            node,
            text
          });
        }
        return;
      }
      for (let i = 0; i < node.childNodes.length; i++) {
        traverse(node.childNodes[i]);
      }
    }
    traverse(document.body);
  }

  function createBatches(nodes, batchSize, maxBatchLength) {
    const batches = [];
    let currentBatch = [];
    let currentLen = 0;

    for (const item of nodes) {
      const textLen = item.text.length;
      if (currentBatch.length >= batchSize || (currentLen + textLen) > maxBatchLength) {
        if (currentBatch.length > 0) {
          batches.push(currentBatch);
        }
        currentBatch = [];
        currentLen = 0;
      }
      currentBatch.push(item);
      currentLen += textLen;
    }
    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }
    return batches;
  }

  async function processBatch(batch, targetLanguage, apiProvider) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: "translateBatch",
        batch: batch,
        targetLanguage: targetLanguage,
        apiProvider: apiProvider
      }, function(response) {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response.success) {
          resolve(response.translations);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  function applyTranslation(node, translatedText) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.parentNode) return;
      const span = document.createElement('span');
      span.textContent = node.textContent;
      node.parentNode.replaceChild(span, node);
      node = span;
    }
    if (!node.dataset.originalText) {
      node.dataset.originalText = node.textContent;
    }
    node.dataset.translatedText = translatedText;
    node.dataset.translationId = node.dataset.translationId || generateUniqueId();
    node.dataset.isTranslated = "true";
    setTranslatedContent(node, translatedText);

    chrome.storage.local.get(['toggleBlueBackground'], function(items) {
      if (items.toggleBlueBackground) {
        node.parentElement?.classList.add('translated-text');
      } else {
        node.parentElement?.classList.remove('translated-text');
      }
    });
  }

  function setTranslatedContent(node, translatedText) {
    if (node.dataset.isTranslated === "true") {
      if (node.textContent === node.dataset.originalText) {
        node.textContent = translatedText;
      } else {
        node.textContent = node.dataset.originalText;
      }
    }
  }

  function isNumericOnly(txt) {
    return /^\d+$/.test(txt);
  }

  function generateUniqueId() {
    return `text_${Date.now()}_${uniqueIdCounter++}`;
  }

  function limitConcurrency(tasks, limit) {
    return new Promise((resolve, reject) => {
      let index = 0;
      const results = [];
      const running = [];

      function runTask() {
        if (index >= tasks.length) {
          if (running.length === 0) {
            resolve(results);
          }
          return;
        }
        const taskIndex = index++;
        const task = tasks[taskIndex];
        const promise = task().then(result => {
          results[taskIndex] = result;
          running.splice(running.indexOf(promise), 1);
          runTask();
        }).catch(err => {
          reject(err);
        });
        running.push(promise);
        if (running.length < limit && index < tasks.length) {
          runTask();
        }
      }

      for (let i = 0; i < limit && index < tasks.length; i++) {
        runTask();
      }
    });
  }

  function createOrShowProgressPopup(lang) {
    if (!statusContainer) {
      createStatusIndicator(lang);
    } else {
      statusContainer.style.display = 'block';
      const minimized = document.getElementById('minimizedStatus');
      if (minimized) minimized.remove();
    }
  }

  function createStatusIndicator(lang) {
    removeStatusIndicator();
    statusContainer = document.createElement('div');
    statusContainer.className = 'translation-status-container';
    statusContainer.style.position = 'fixed';
    statusContainer.style.bottom = '10px';
    statusContainer.style.right = '10px';
    statusContainer.style.zIndex = '2147483647';

    statusShadowRoot = statusContainer.attachShadow({ mode: 'open' });
    const st = statusTranslations[lang] || statusTranslations.en;

    statusShadowRoot.innerHTML = `
      <style>
        .translation-status {
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 10px;
          padding-bottom: 5px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          font-family: Arial, sans-serif;
          color: #000;
          width: 250px;
          height: auto;
          min-height: 100px;
          text-align: center;
          opacity: 1;
        }
        .progress-bar {
          width: 100%;
          height: 10px;
          background-color: #f0f0f0;
          border-radius: 5px;
          overflow: hidden;
          margin-top: 10px;
        }
        .progress-fill {
          height: 100%;
          width: 0%;
          background-color: #4285f4;
          transition: width 0.3s;
        }
        #translationProgressText {
          margin-top: 5px;
          color: #000;
        }
        #translationStatusHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: bold;
        }
        #minimizeStatusBtn {
          border: none;
          background-color: #ccc;
          padding: 2px 5px;
          border-radius: 3px;
          cursor: pointer;
          font-size: 16px;
        }
        .stats {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
          margin-bottom: 0;
        }
      </style>
      <div class="translation-status">
        <div id="translationStatusHeader">
          <span id="translationHeaderText">${st.translating}</span>
          <button id="minimizeStatusBtn">―</button>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" id="translationProgressFill"></div>
        </div>
        <div id="translationProgressText">0%</div>
        <div class="stats" id="translationStats"></div>
      </div>
    `;

    statusShadowRoot.querySelector('#minimizeStatusBtn').addEventListener('click', function(e) {
      e.stopPropagation();
      minimizeStatusIndicator();
    });

    document.body.appendChild(statusContainer);
  }

  function removeStatusIndicator() {
    if (statusContainer && statusContainer.parentNode) {
      statusContainer.parentNode.removeChild(statusContainer);
      statusContainer = null;
      statusShadowRoot = null;
    }
  }

  function minimizeStatusIndicator() {
    if (!statusContainer) return;
    statusContainer.style.display = 'none';
    const minimizedDiv = document.createElement('div');
    minimizedDiv.id = 'minimizedStatus';
    minimizedDiv.style.position = 'fixed';
    minimizedDiv.style.bottom = '10px';
    minimizedDiv.style.right = '10px';
    minimizedDiv.style.width = '36px';
    minimizedDiv.style.height = '36px';
    minimizedDiv.style.borderRadius = '50%';
    minimizedDiv.style.backgroundColor = 'white';
    minimizedDiv.style.border = '1px solid #ddd';
    minimizedDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    minimizedDiv.style.display = 'flex';
    minimizedDiv.style.alignItems = 'center';
    minimizedDiv.style.justifyContent = 'center';
    minimizedDiv.style.cursor = 'pointer';
    minimizedDiv.style.zIndex = '2147483647';
    minimizedDiv.style.color = '#000';
    minimizedDiv.style.fontSize = '14px';

    let progText = "0%";
    if (statusShadowRoot) {
      const txt = statusShadowRoot.querySelector('#translationProgressText');
      if (txt) progText = txt.textContent;
    }
    minimizedDiv.textContent = progText;

    minimizedDiv.addEventListener('click', function() {
      if (statusContainer) statusContainer.style.display = 'block';
      minimizedDiv.remove();
    });
    document.body.appendChild(minimizedDiv);
  }

  function updateProgress(lang) {
    const st = statusTranslations[lang] || statusTranslations.en;

    if (translatedCount > expectedTotalTexts) {
      expectedTotalTexts = translatedCount;
    }
    translationProgress = (expectedTotalTexts > 0)
      ? parseFloat(((translatedCount / expectedTotalTexts) * 100).toFixed(1))
      : 0;

    if (statusShadowRoot) {
      const progressFill = statusShadowRoot.querySelector('#translationProgressFill');
      const progressText = statusShadowRoot.querySelector('#translationProgressText');
      const statsElem = statusShadowRoot.querySelector('#translationStats');
      const headerElem = statusShadowRoot.querySelector('#translationHeaderText');
      if (progressFill && progressText) {
        progressFill.style.width = translationProgress + '%';
        progressText.textContent = translationProgress + '%';
      }
      if (statsElem) {
        const template = st.progressTemplate
          .replace('{currentBatch}', batchesProcessed)
          .replace('{totalBatch}', totalBatches)
          .replace('{translatedTexts}', translatedCount)
          .replace('{expected}', expectedTotalTexts);
        statsElem.textContent = template;
      }
      if (headerElem) {
        headerElem.textContent = st.translating;
      }
    }

    chrome.runtime.sendMessage({
      action: "updateProgress",
      progress: translationProgress,
      stats: {
        batches: batchesProcessed,
        totalBatches,
        translatedTexts: translatedCount,
        totalTexts: expectedTotalTexts
      }
    });
  }

  function finishTranslation(lang) {
    const st = statusTranslations[lang] || statusTranslations.en;
    isTranslating = false;
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    updateProgress(lang);

    chrome.runtime.sendMessage({
      action: "translationComplete",
      message: st.translationCompleted
    });
    removeStatusIndicator();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTranslation);
  } else {
    initTranslation();
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getTranslationStatus") {
      sendResponse({
        isTranslating,
        progress: translationProgress,
        stats: {
          batches: batchesProcessed,
          totalBatches,
          translatedTexts: translatedCount,
          totalTexts: expectedTotalTexts
        }
      });
      return true;
    } else if (request.action === "startTranslation") {
      if (!isTranslating) {
        translationStarted = true;
        startTranslation();
        sendResponse({ status: "started" });
      } else {
        sendResponse({ status: "alreadyTranslating" });
      }
      return true;
    } else if (request.action === "toggleTranslation") {
      if (isTranslating) {
        sendResponse({status: "Translating"});
      } else {
        document.querySelectorAll('[data-is-translated="true"]').forEach(node => {
          setTranslatedContent(node, node.dataset.translatedText);
        });
        translationStarted = !translationStarted;
        sendResponse({ status: "toggled", now: translationStarted });
      }
      return true;
    }
    return false;
  });
})();