(function() {
  const MAX_RETRIES = 3; // 最大再試行回数

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
    ko: '이 페이지를 번역하시겠습니까?',
    hi: 'क्या आप इस पेज का अनुवाद करना चाहते हैं?',
    ar: 'هل تريد ترجمة هذه الصفحة؟',
    bn: 'আপনি কি এই পৃষ্ঠাটি অনুবাদ করতে চান?',
    id: 'Apakah Anda ingin menerjemahkan halaman ini?',
    tr: 'Bu sayfayı çevirmek ister misiniz?'
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
    ko: { yes: '번역', no: '아니오', never: '이 사이트는 표시하지 않음' },
    hi: { yes: 'अनुवाद करें', no: 'नहीं', never: 'इस साइट के लिए न दिखाएं' },
    ar: { yes: 'ترجمة', no: 'لا', never: 'لا تعرض لهذا الموقع' },
    bn: { yes: 'অনুবাদ করুন', no: 'না', never: 'এই সাইটের জন্য দেখাবেন না' },
    id: { yes: 'Terjemahkan', no: 'Tidak', never: 'Jangan tampilkan untuk situs ini' },
    tr: { yes: 'Çevir', no: 'Hayır', never: 'Bu site için gösterme' }
  };

  const statusTranslations = {
    en: {
      translating: 'Translating...',
      noTextFound: 'No text found to translate',
      translationCompleted: 'Translation completed',
      errorOccurred: 'An error occurred',
      apiLimitError: 'API request limit reached. Please adjust your request interval or batch size in the settings.',
      progressTemplate: 'Batch: {currentBatch}/{totalBatch}, Texts: {translatedTexts}/{expected}',
      closeButton: 'Close'
    },
    ja: {
      translating: '翻訳中...',
      noTextFound: '翻訳するテキストが見つかりませんでした',
      translationCompleted: '翻訳が完了しました',
      errorOccurred: 'エラーが発生しました',
      apiLimitError: 'APIリクエスト制限に達しました。設定でリクエスト間隔やバッチサイズを調整してください。',
      progressTemplate: 'バッチ: {currentBatch}/{totalBatch}, テキスト: {translatedTexts}/{expected}',
      closeButton: '閉じる'
    },
    fr: {
      translating: 'Traduction en cours...',
      noTextFound: 'Aucun texte à traduire',
      translationCompleted: 'Traduction terminée',
      errorOccurred: 'Une erreur s\'est produite',
      apiLimitError: 'Limite de requêtes API atteinte. Veuillez ajuster l\'intervalle de requêtes ou la taille du lot dans les paramètres.',
      progressTemplate: 'Lot : {currentBatch}/{totalBatch}, Textes : {translatedTexts}/{expected}',
      closeButton: 'Fermer'
    },
    de: {
      translating: 'Übersetzen...',
      noTextFound: 'Kein zu übersetzender Text gefunden',
      translationCompleted: 'Übersetzung abgeschlossen',
      errorOccurred: 'Ein Fehler ist aufgetreten',
      apiLimitError: 'API-Anfragelimit erreicht. Bitte passen Sie das Anfrageintervall oder die Batch-Größe in den Einstellungen an.',
      progressTemplate: 'Stapel: {currentBatch}/{totalBatch}, Texte: {translatedTexts}/{expected}',
      closeButton: 'Schließen'
    },
    es: {
      translating: 'Traduciendo...',
      noTextFound: 'No se encontró texto para traducir',
      translationCompleted: 'Traducción completada',
      errorOccurred: 'Ocurrió un error',
      apiLimitError: 'Se ha alcanzado el límite de solicitudes API. Ajuste el intervalo de solicitudes o el tamaño del lote en la configuración.',
      progressTemplate: 'Lote: {currentBatch}/{totalBatch}, Textos: {translatedTexts}/{expected}',
      closeButton: 'Cerrar'
    },
    it: {
      translating: 'Traducendo...',
      noTextFound: 'Nessun testo da tradurre trovato',
      translationCompleted: 'Traduzione completata',
      errorOccurred: 'Si è verificato un errore',
      apiLimitError: 'Limite di richieste API raggiunto. Regola l\'intervallo di richieste o la dimensione del batch nelle impostazioni.',
      progressTemplate: 'Blocco: {currentBatch}/{totalBatch}, Testi: {translatedTexts}/{expected}',
      closeButton: 'Chiudi'
    },
    pt: {
      translating: 'Traduzindo...',
      noTextFound: 'Nenhum texto encontrado para traduzir',
      translationCompleted: 'Tradução concluída',
      errorOccurred: 'Ocorreu um erro',
      apiLimitError: 'Limite de solicitações API atingido. Ajuste o intervalo de solicitações ou o tamanho do lote nas configurações.',
      progressTemplate: 'Lote: {currentBatch}/{totalBatch}, Textos: {translatedTexts}/{expected}',
      closeButton: 'Fechar'
    },
    ru: {
      translating: 'Перевод...',
      noTextFound: 'Не найдено текста для перевода',
      translationCompleted: 'Перевод завершен',
      errorOccurred: 'Произошла ошибка',
      apiLimitError: 'Достигнут предел запросов API. Измените интервал запросов или размер партии в настройках.',
      progressTemplate: 'Пакет: {currentBatch}/{totalBatch}, Тексты: {translatedTexts}/{expected}',
      closeButton: 'Закрыть'
    },
    zh: {
      translating: '正在翻译...',
      noTextFound: '没有可翻译的文本',
      translationCompleted: '翻译完成',
      errorOccurred: '发生错误',
      apiLimitError: '已达到 API 请求限制。请在设置中调整请求间隔或批处理大小。',
      progressTemplate: '批次: {currentBatch}/{totalBatch}, 文本: {translatedTexts}/{expected}',
      closeButton: '关闭'
    },
    ko: {
      translating: '번역 중...',
      noTextFound: '번역할 텍스트가 없습니다',
      translationCompleted: '번역이 완료되었습니다',
      errorOccurred: '오류가 발생했습니다',
      apiLimitError: 'API 요청 한도에 도달했습니다. 설정에서 요청 간격 또는 배치 크기를 조정하세요.',
      progressTemplate: '배치: {currentBatch}/{totalBatch}, 텍스트: {translatedTexts}/{expected}',
      closeButton: '닫기'
    },
    hi: {
      translating: 'अनुवाद चल रहा है...',
      noTextFound: 'अनुवाद करने के लिए कोई पाठ नहीं मिला',
      translationCompleted: 'अनुवाद पूरा हुआ',
      errorOccurred: 'एक त्रुटि हुई',
      apiLimitError: 'API अनुरोध सीमा तक पहुँच गई है। कृपया सेटिंग्स में अनुरोध अंतराल या बैच आकार समायोजित करें।',
      progressTemplate: 'बैच: {currentBatch}/{totalBatch}, पाठ: {translatedTexts}/{expected}',
      closeButton: 'बंद करें'
    },
    ar: {
      translating: 'جارٍ الترجمة...',
      noTextFound: 'لم يتم العثور على نص للترجمة',
      translationCompleted: 'اكتملت الترجمة',
      errorOccurred: 'حدث خطأ',
      apiLimitError: 'تم الوصول إلى حد طلبات API. يرجى ضبط فاصل الطلبات أو حجم الدفعة في الإعدادات.',
      progressTemplate: 'الدفعة: {currentBatch}/{totalBatch}, النصوص: {translatedTexts}/{expected}',
      closeButton: 'إغلاق'
    },
    bn: {
      translating: 'অনুবাদ চলছে...',
      noTextFound: 'অনুবাদ করার জন্য কোনও টেক্সট পাওয়া যায়নি',
      translationCompleted: 'অনুবাদ সম্পন্ন হয়েছে',
      errorOccurred: 'একটি ত্রুটি ঘটেছে',
      apiLimitError: 'API অনুরোধ সীমায় পৌঁছেছে। সেটিংসে অনুরোধ বিরতি বা ব্যাচের আকার সামঞ্জস্য করুন।',
      progressTemplate: 'ব্যাচ: {currentBatch}/{totalBatch}, টেক্সট: {translatedTexts}/{expected}',
      closeButton: 'বন্ধ করুন'
    },
    id: {
      translating: 'Menerjemahkan...',
      noTextFound: 'Tidak ada teks yang ditemukan untuk diterjemahkan',
      translationCompleted: 'Penerjemahan selesai',
      errorOccurred: 'Terjadi kesalahan',
      apiLimitError: 'Batas permintaan API tercapai. Silakan sesuaikan interval permintaan atau ukuran batch di pengaturan.',
      progressTemplate: 'Batch: {currentBatch}/{totalBatch}, Teks: {translatedTexts}/{expected}',
      closeButton: 'Tutup'
    },
    tr: {
      translating: 'Çevriliyor...',
      noTextFound: 'Çevrilecek metin bulunamadı',
      translationCompleted: 'Çeviri tamamlandı',
      errorOccurred: 'Bir hata oluştu',
      apiLimitError: 'API istek sınırı aşıldı. Lütfen ayarlarınızda istek aralığını veya toplu boyutu ayarlayın.',
      progressTemplate: 'Toplu: {currentBatch}/{totalBatch}, Metinler: {translatedTexts}/{expected}',
      closeButton: 'Kapat'
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
  let promptContainer = null;
  let promptShadowRoot = null;
  let minimizedDiv = null;

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
        if (!pageLangPrimary || pageLangPrimary !== chosenLangPrimary) {
          createTranslationPrompt(chosenLang);
        }
      }
    });
  }

  function getPageLanguage() {
    const langAttr = document.documentElement.lang;
    if (langAttr) {
      return langAttr.toLowerCase();
    }
    const url = window.location.href;
    const urlLang = extractLanguageFromUrl(url);
    if (urlLang) {
      return urlLang.toLowerCase();
    }
    return null;
  }

  function extractLanguageFromUrl(url) {
    const languagePattern = /^[a-z]{2}(-[A-Z]{2})?$/;
    const validLanguages = ['en', 'ja', 'fr', 'de', 'es', 'it', 'pt', 'ru', 'zh', 'ko', 'hi', 'ar', 'bn', 'id', 'tr'];
    const subdomainMatch = url.match(/^https?:\/\/([a-z]{2}(-[A-Z]{2})?)\./);
    if (subdomainMatch && languagePattern.test(subdomainMatch[1]) && validLanguages.includes(subdomainMatch[1].split('-')[0])) {
      return subdomainMatch[1];
    }
    const pathMatch = url.match(/^https?:\/\/[^\/]+\/([a-z]{2}(-[A-Z]{2})?)(?:\/|$)/);
    if (pathMatch && languagePattern.test(pathMatch[1]) && validLanguages.includes(pathMatch[1].split('-')[0])) {
      return pathMatch[1];
    }
    const urlObj = new URL(url);
    const langParam = urlObj.searchParams.get('lang') || urlObj.searchParams.get('language');
    if (langParam && languagePattern.test(langParam) && validLanguages.includes(langParam.split('-')[0])) {
      return langParam;
    }
    return null;
  }

  function createTranslationPrompt(lang) {
    if (promptContainer) return;

    const promptMsg = promptMessages[lang] || promptMessages.en;
    const btnTexts = translateButtonTexts[lang] || translateButtonTexts.en;

    promptContainer = document.createElement('div');
    promptContainer.style.position = 'fixed';
    promptContainer.style.top = '20px';
    promptContainer.style.right = '20px';
    promptContainer.style.zIndex = '2147483647';

    promptShadowRoot = promptContainer.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      .prompt {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        z-index: 2147483647 !important;
        background-color: white;
        padding: 15px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        color: black;
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

    promptShadowRoot.appendChild(style);

    const promptDiv = document.createElement('div');
    promptDiv.className = 'prompt';

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

    promptShadowRoot.appendChild(promptDiv);

    document.body.appendChild(promptContainer);

    yesButton.addEventListener('click', function() {
      promptContainer.remove();
      promptContainer = null;
      promptShadowRoot = null;
      translationStarted = true;
      startTranslation();
    });

    noButton.addEventListener('click', function() {
      promptContainer.remove();
      promptContainer = null;
      promptShadowRoot = null;
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
      promptContainer.remove();
      promptContainer = null;
      promptShadowRoot = null;
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

    const textNodesForTranslation = collectAllUntranslatedText();

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
          handleTranslationError(err, lang);
          throw err; // エラーを投げて後続のタスクを停止
        })
      );

      try {
        await limitConcurrency(tasks, concurrencyLimit);
        finishTranslation(lang);
      } catch (err) {
        // エラー処理は handleTranslationError で行う
        isTranslating = false;
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
        // ポップアップは消さない（ユーザーが再開可能にするため）
      }
    });
  }

  function handleTranslationError(error, lang) {
    const st = statusTranslations[lang] || statusTranslations.en;
    let errorMessage = st.errorOccurred;

    if (error.message.includes('API_LIMIT_REACHED')) {
      errorMessage = st.apiLimitError;
    } else if (error.message.includes('API Error')) {
      errorMessage = `${st.errorOccurred}: ${error.message}`;
    } else {
      errorMessage = `${st.errorOccurred}: ${error.message}`;
    }

    chrome.runtime.sendMessage({
      action: "translationError",
      error: errorMessage
    });

    if (statusShadowRoot) {
      showErrorPopup(errorMessage, lang);
    }
  }

  function showErrorPopup(errorMessage, lang) {
    const st = statusTranslations[lang] || statusTranslations.en;
    const translationStatus = statusShadowRoot.querySelector('.status');
    translationStatus.innerHTML = '';

    const errorHeader = document.createElement('div');
    errorHeader.id = 'translationStatusHeader';
    errorHeader.innerHTML = `<span id="translationHeaderText">${st.errorOccurred}</span>`;

    const errorText = document.createElement('div');
    errorText.id = 'errorText';
    errorText.textContent = errorMessage;
    errorText.style.marginTop = '10px';
    errorText.style.color = 'red';

    const closeButton = document.createElement('button');
    closeButton.id = 'closeErrorBtn';
    closeButton.textContent = st.closeButton;
    closeButton.style.marginTop = '10px';
    closeButton.style.padding = '5px 10px';
    closeButton.style.backgroundColor = '#4285f4';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.cursor = 'pointer';

    closeButton.addEventListener('click', function() {
      removeStatusIndicator();
      isTranslating = false; // ユーザーが閉じたら翻訳を完全にリセット
    });

    translationStatus.appendChild(errorHeader);
    translationStatus.appendChild(errorText);
    translationStatus.appendChild(closeButton);
  }

  function collectAllUntranslatedText() {
    const textNodesForTranslation = [];
    const lastSeenTextMap = new Map();

    function traverse(node) {
      if (
        node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE' ||
        node.nodeName === 'NOSCRIPT' || node.nodeName === 'SVG' ||
        node.nodeName === 'IFRAME' || node.nodeName === 'CANVAS'
      ) return;

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();
        if (
          text.length > 0 &&
          !isNumericOnly(text) &&
          node.parentElement?.dataset.translated !== "true" // 親ノードが翻訳済みでないことを確認
        ) {
          const lastSeen = lastSeenTextMap.get(node) || "";
          if (text === lastSeen) return;
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
    return textNodesForTranslation;
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
    node.dataset.translated = "true"; // 翻訳成功時のみ設定
    setTranslatedContent(node, translatedText);

    chrome.storage.local.get(['toggleBlueBackground'], (items) => {
      if (items.toggleBlueBackground) {
        node.parentElement?.classList.add('translated-text');
      } else {
        node.parentElement?.classList.remove('translated-text');
      }
    });
  }

  function setTranslatedContent(node, translatedText) {
    if (node.dataset.translated === "true") {
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
      if (minimizedDiv) minimizedDiv.remove();
    }
  }

  function createStatusIndicator(lang) {
    removeStatusIndicator();
    statusContainer = document.createElement('div');
    statusContainer.style.position = 'fixed';
    statusContainer.style.bottom = '10px';
    statusContainer.style.right = '10px';
    statusContainer.style.zIndex = '2147483647';

    statusShadowRoot = statusContainer.attachShadow({ mode: 'open' });
    const st = statusTranslations[lang] || statusTranslations.en;

    const style = document.createElement('style');
    style.textContent = `
      .status {
        position: fixed !important;
        bottom: 10px !important;
        right: 10px !important;
        z-index: 2147483647 !important;
        background-color: white;
        border: 1px solid #ddd;
        border-radius: 5px;
        padding: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        font-family: Arial, sans-serif;
        color: #000;
        width: 250px;
        height: auto;
        min-height: 100px;
        text-align: center;
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
    `;

    statusShadowRoot.appendChild(style);

    const translationStatus = document.createElement('div');
    translationStatus.className = 'status';

    const header = document.createElement('div');
    header.id = 'translationStatusHeader';
    header.innerHTML = `<span id="translationHeaderText">${st.translating}</span><button id="minimizeStatusBtn">―</button>`;

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.innerHTML = `<div class="progress-fill" id="translationProgressFill"></div>`;

    const progressText = document.createElement('div');
    progressText.id = 'translationProgressText';
    progressText.textContent = '0%';

    const stats = document.createElement('div');
    stats.className = 'stats';
    stats.id = 'translationStats';

    translationStatus.appendChild(header);
    translationStatus.appendChild(progressBar);
    translationStatus.appendChild(progressText);
    translationStatus.appendChild(stats);

    statusShadowRoot.appendChild(translationStatus);

    document.body.appendChild(statusContainer);

    statusShadowRoot.querySelector('#minimizeStatusBtn').addEventListener('click', function(e) {
      e.stopPropagation();
      minimizeStatusIndicator();
    });
  }

  function removeStatusIndicator() {
    if (statusContainer && statusContainer.parentNode) {
      statusContainer.parentNode.removeChild(statusContainer);
      statusContainer = null;
      statusShadowRoot = null;
    }
    if (minimizedDiv && minimizedDiv.parentNode) {
      minimizedDiv.parentNode.removeChild(minimizedDiv);
      minimizedDiv = null;
    }
  }

  function minimizeStatusIndicator() {
    if (!statusContainer) return;
    statusContainer.style.display = 'none';

    minimizedDiv = document.createElement('div');
    minimizedDiv.style.position = 'fixed';
    minimizedDiv.style.bottom = '10px';
    minimizedDiv.style.right = '10px';
    minimizedDiv.style.zIndex = '2147483647';

    const shadowRoot = minimizedDiv.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
      .minimized {
        position: fixed !important;
        bottom: 10px !important;
        right: 10px !important;
        z-index: 2147483647 !important;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: white;
        border: 1px solid #ddd;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: #000;
        font-size: 14px;
        font-family: Arial, sans-serif;
      }
    `;

    const circleDiv = document.createElement('div');
    circleDiv.className = 'minimized';
    let progText = "0%";
    if (statusShadowRoot) {
      const txt = statusShadowRoot.querySelector('#translationProgressText');
      if (txt) progText = txt.textContent;
    }
    circleDiv.textContent = progText;

    shadowRoot.appendChild(style);
    shadowRoot.appendChild(circleDiv);

    document.body.appendChild(minimizedDiv);

    circleDiv.addEventListener('click', function() {
      if (statusContainer) statusContainer.style.display = 'block';
      minimizedDiv.remove();
      minimizedDiv = null;
    });
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

    if (minimizedDiv && minimizedDiv.shadowRoot) {
      const circleDiv = minimizedDiv.shadowRoot.querySelector('.minimized');
      if (circleDiv) {
        circleDiv.textContent = translationProgress + '%';
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
        document.querySelectorAll('[data-translated="true"]').forEach(node => {
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