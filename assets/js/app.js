// assets/js/app.js

// 狀態變數
let currentQuestion = "";
let currentSpread = "";
let selectedCards = [];
let drawnCards = [];
let shuffledDeck = [];
let mindsetCard = null;
let shuffleRemaining = 3;
let supportCards = {};
let supportCardCounts = {};
let deferredPrompt; // 用於儲存 PWA 安裝事件

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    setupPWAInstall();
});

function setupEventListeners() {
    // 綁定各個按鈕事件
    document.getElementById('nextBtn').addEventListener('click', showSpreadSelection);
    document.querySelectorAll('.spread-option').forEach(option => {
        option.addEventListener('click', function() {
            selectSpread(this.dataset.spread);
        });
    });
    document.getElementById('shuffleCardsBtn').addEventListener('click', performShuffle);
    document.getElementById('cutCardsBtn').addEventListener('click', performCut);
    document.getElementById('proceedToDrawBtn').addEventListener('click', proceedToDrawing);
    document.getElementById('revealBtn').addEventListener('click', revealResults);
    document.getElementById('newReadingBtn').addEventListener('click', startNewReading);
}

// --- PWA 安裝邏輯 (新增) ---
function setupPWAInstall() {
    const installBtn = document.getElementById('installAppBtn');
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        // 顯示安裝按鈕
        if(installBtn) installBtn.classList.remove('hidden');
    });

    if(installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    installBtn.classList.add('hidden');
                }
                deferredPrompt = null;
            }
        });
    }
}

// --- 核心邏輯 ---

function showSpreadSelection() {
    const question = document.getElementById('questionInput').value.trim();
    if (!question) { alert('請先輸入你的問題！'); return; }
    currentQuestion = question;
    document.getElementById('questionSection').classList.add('hidden');
    document.getElementById('spreadSection').classList.remove('hidden');
}

function selectSpread(spreadType) {
    currentSpread = spreadType;
    document.getElementById('spreadSection').classList.add('hidden');
    document.getElementById('shuffleSection').classList.remove('hidden');
    
    shuffleRemaining = 3;
    document.getElementById('shuffleCount').textContent = shuffleRemaining;
    document.getElementById('shuffleCardsBtn').classList.remove('hidden');
    document.getElementById('cutCardsBtn').classList.add('hidden');
    
    // 從 tarot-data.js 獲取資料
    if (typeof tarotCards !== 'undefined') {
        shuffledDeck = [...tarotCards];
    } else {
        alert("資料載入失敗，請重新整理頁面");
    }
}

function performShuffle() {
    const shuffleDeck = document.getElementById('shuffleDeck');
    shuffleDeck.style.transform = 'rotate(10deg)';
    setTimeout(() => shuffleDeck.style.transform = 'rotate(-10deg)', 200);
    setTimeout(() => shuffleDeck.style.transform = 'rotate(0deg)', 400);
    
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
    }
    
    shuffleRemaining--;
    document.getElementById('shuffleCount').textContent = shuffleRemaining;
    
    if (shuffleRemaining <= 0) {
        document.getElementById('shuffleCardsBtn').classList.add('hidden');
        document.getElementById('cutCardsBtn').classList.remove('hidden');
    }
}

function performCut() {
    const shuffleDeck = document.getElementById('shuffleDeck');
    shuffleDeck.style.transform = 'translateX(-20px)';
    setTimeout(() => shuffleDeck.style.transform = 'translateX(20px)', 300);
    setTimeout(() => shuffleDeck.style.transform = 'translateX(0px)', 600);

    const cutPoint = Math.floor(Math.random() * (shuffledDeck.length - 20)) + 10;
    const topHalf = shuffledDeck.slice(0, cutPoint);
    const bottomHalf = shuffledDeck.slice(cutPoint);
    shuffledDeck = [...bottomHalf, ...topHalf];

    const isReversed = Math.random() < 0.5;
    mindsetCard = { ...shuffledDeck[0], reversed: isReversed };

    shuffledDeck = shuffledDeck.slice(1);
    shuffledDeck.push(mindsetCard);

    setTimeout(() => {
        document.getElementById('shuffleSection').classList.add('hidden');
        document.getElementById('mindsetSection').classList.remove('hidden');
        displayMindsetCard();
    }, 800);
}

function createCardDeck() {
    const deck = document.getElementById('cardDeck');
    deck.innerHTML = '';
    const totalCards = shuffledDeck.length;
    const fanAngle = 140;
    const angleStep = fanAngle / (totalCards - 1);
    const startAngle = -fanAngle / 2;
    const radius = 280;

    for (let i = 0; i < totalCards; i++) {
        const card = document.createElement('div');
        card.className = 'fan-card card-back rounded-lg flex items-center justify-center text-lg';
        card.innerHTML = '🌟';

        const angle = startAngle + (i * angleStep);
        const radian = (angle * Math.PI) / 180;
        const x = Math.sin(radian) * radius;
        const y = -Math.cos(radian) * radius * 0.4 + 150;
        
        card.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
        card.style.zIndex = 50 - Math.abs(i - Math.floor(totalCards / 2));

        const cardData = shuffledDeck[i];
        card.addEventListener('click', function () { drawCard(this, cardData); });
        deck.appendChild(card);
    }
}

function drawCard(cardElement, selectedCard) {
    if (selectedCards.length >= spreads[currentSpread].cardCount) return;
    
    const isReversed = Math.random() < 0.5;
    drawnCards.push({
        ...selectedCard,
        reversed: isReversed,
        position: spreads[currentSpread].positions[selectedCards.length]
    });
    selectedCards.push(cardElement);
    
    const idx = shuffledDeck.indexOf(selectedCard);
    if (idx !== -1) shuffledDeck.splice(idx, 1);
    
    cardElement.classList.add('selected');
    const remaining = spreads[currentSpread].cardCount - selectedCards.length;
    
    if (remaining > 0) {
        document.getElementById('cardsNeeded').textContent = remaining;
    } else {
        document.getElementById('cardsNeeded').textContent = '已完成';
        document.getElementById('revealBtn').classList.remove('hidden');
    }
}

function proceedToDrawing() {
    document.getElementById('mindsetSection').classList.add('hidden');
    document.getElementById('drawSection').classList.remove('hidden');
    document.getElementById('cardsNeeded').textContent = spreads[currentSpread].cardCount;
    createCardDeck();
}

function revealResults() {
    document.getElementById('drawSection').classList.add('hidden');
    document.getElementById('resultSection').classList.remove('hidden');
    document.getElementById('questionDisplay').textContent = `問題：${currentQuestion}`;
    document.getElementById('spreadName').textContent = `牌陣：${spreads[currentSpread].name}`;
    displayResults();
}

function drawSupportCard(position) {
    if (shuffledDeck.length === 0) { alert('沒有剩餘的牌可以抽取了！'); return; }
    
    if (!supportCards[position]) {
        supportCards[position] = [];
        supportCardCounts[position] = 0;
    }
    
    if (supportCardCounts[position] >= 2) { alert('此位置已達到輔助牌上限（2張）！'); return; }
    
    const cardIndex = Math.floor(Math.random() * shuffledDeck.length);
    const supportCard = { ...shuffledDeck[cardIndex], reversed: Math.random() < 0.5 };
    
    shuffledDeck.splice(cardIndex, 1);
    supportCards[position].push(supportCard);
    supportCardCounts[position]++;
    
    displaySupportCard(position, supportCard, supportCardCounts[position]);
    updateSupportButton(position);
}

function updateSupportButton(position) {
    const remaining = 2 - supportCardCounts[position];
    const countId = position === 'mindset' ? 'mindset-support-count' : `support-count-${position}`;
    const countElement = document.getElementById(countId);
    
    if (countElement) {
        countElement.textContent = remaining;
        if (remaining <= 0) {
            const button = countElement.closest('button');
            if (button) {
                button.disabled = true;
                button.classList.add('opacity-50', 'cursor-not-allowed');
                button.innerHTML = '✨ 輔助牌已滿 (0/2)';
            }
        }
    }
}

function startNewReading() {
    currentQuestion = "";
    currentSpread = "";
    selectedCards = [];
    drawnCards = [];
    shuffledDeck = [];
    mindsetCard = null;
    shuffleRemaining = 3;
    supportCards = {};
    supportCardCounts = {};
    
    document.getElementById('questionInput').value = "";
    document.getElementById('resultSection').classList.add('hidden');
    document.getElementById('shuffleSection').classList.add('hidden');
    document.getElementById('mindsetSection').classList.add('hidden');
    document.getElementById('drawSection').classList.add('hidden');
    document.getElementById('spreadSection').classList.add('hidden');
    document.getElementById('questionSection').classList.remove('hidden');
}

// --- 圖像輔助函式 (優化版：加入 Lazy Loading) ---

function getCardImagePath(card){
    // 簡單查表，若找不到則回傳 missing
    if (typeof tarotCards === 'undefined') return 'assets/cards/__missing__.jpg';
    let idx = tarotCards.findIndex(c => c.name === card.name);
    if (idx < 0) return 'assets/cards/__missing__.jpg';
    const n = String(idx).padStart(2,'0');
    return `assets/cards/${n}.jpg`;
}

function imageOrFallbackHTML(card, sizeClass) {
    const reversed = card.reversed ? 'rws-reversed' : '';
    const src = getCardImagePath(card);
    const safeName = (card.name||'') + (card.reversed?'（逆位）':'（正位）');
    // 優化：加入 loading="lazy"
    return `<div class="rws-card-frame">
      <img class="rws-img ${sizeClass||'lg'} ${reversed}" src="${src}" alt="${safeName}" loading="lazy" onerror="this.closest('.rws-card-frame').classList.add('no-img')"/>
      <div class="rws-fallback ${reversed}">
        <div class="text-xs font-bold text-yellow-300">${card.number||''}</div>
        <div class="text-base font-semibold text-white">${card.name||''}</div>
        <div class="text-xs text-blue-200">${card.suit||''}</div>
      </div>
    </div>`;
}

function displayMindsetCard() {
    const el = document.getElementById('mindsetCard');
    const meaning = mindsetCard.reversed ? mindsetCard.reversedMeaning : mindsetCard.meaning;
    const ori = mindsetCard.reversed ? '逆位' : '正位';
    el.innerHTML = `<div class="flex items-center justify-center gap-6">
      ${imageOrFallbackHTML(mindsetCard, 'xl')}
      <div class="flex-1 text-left">
        <h3 class="text-2xl font-semibold text-yellow-300 mb-2">💭 心態牌</h3>
        <h4 class="text-xl font-medium text-white mb-2">${mindsetCard.name} (${ori})</h4>
        <p class="text-blue-200 text-lg leading-relaxed">${meaning}</p>
        <p class="text-sm text-gray-300 mt-4">這張牌反映了你目前面對這個問題時的內在狀態和心理準備。</p>
      </div></div>`;
}

function displaySupportCard(position, card, cardNumber) {
    const meaning = card.reversed ? card.reversedMeaning : card.meaning;
    const ori = card.reversed ? '逆位' : '正位';
    const html = `<div class="bg-gradient-to-r from-amber-900/20 to-yellow-900/10 backdrop-blur-sm rounded-lg p-4 border border-yellow-400/30 mt-3">
      <div class="flex items-center gap-4">
        ${imageOrFallbackHTML(card, 'md')}
        <div class="flex-1">
            <h4 class="text-lg font-semibold text-yellow-400 mb-1">輔助牌 ${cardNumber}</h4>
            <h5 class="text-base font-medium text-white mb-1">${card.name} (${ori})</h5>
            <p class="text-blue-200 text-sm">${meaning}</p>
        </div></div></div>`;
    const containerId = position === 'mindset' ? 'mindset-support-cards' : `support-cards-${position}`;
    const c = document.getElementById(containerId);
    if (c) c.insertAdjacentHTML('beforeend', html);
}

function displayResults() {
    const mc = document.getElementById('resultMindsetCard');
    const mm = mindsetCard.reversed ? mindsetCard.reversedMeaning : mindsetCard.meaning;
    const mo = mindsetCard.reversed ? '逆位' : '正位';
    
    mc.innerHTML = `<div class="bg-gradient-to-r from-purple-900/30 to-blue-900/10 backdrop-blur-sm rounded-lg p-6 mb-6 border border-yellow-300/30">
      <div class="flex items-center gap-6">${imageOrFallbackHTML(mindsetCard, 'lg')}
      <div class="flex-1"><h3 class="text-xl font-semibold text-yellow-300 mb-2">💭 心態牌</h3>
      <h4 class="text-lg font-medium text-white mb-1">${mindsetCard.name} (${mo})</h4>
      <p class="text-blue-200">${mm}</p>
      <div class="text-left mt-3">
          <button onclick="drawSupportCard('mindset')" class="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 font-semibold py-1 px-3 rounded-lg transition-all duration-300 text-sm">
            ✨ 抽取輔助牌 (<span id="mindset-support-count">0</span>/2)
          </button>
      </div>
      <div id="mindset-support-cards" class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3"></div></div></div></div>`;
      
    const rc = document.getElementById('resultCards'); 
    rc.innerHTML = '';
    
    drawnCards.forEach((card, index) => {
      const meaning = card.reversed ? card.reversedMeaning : card.meaning;
      const ori = card.reversed ? '逆位' : '正位';
      const div = document.createElement('div');
      div.className = "bg-gradient-to-r from-blue-900/20 to-indigo-900/10 backdrop-blur-sm rounded-lg p-4 md:p-6 border border-blue-400/20 mb-4";
      div.innerHTML = `<div class="flex items-center gap-5">
        ${imageOrFallbackHTML(card, 'lg')}
        <div class="flex-1"><h3 class="text-lg font-semibold text-blue-300 mb-1">${index + 1}. ${card.position}</h3>
        <h4 class="text-lg font-medium text-white mb-1">${card.name} (${ori})</h4>
        <p class="text-blue-200">${meaning}</p></div></div>
        <div class="text-center mt-3">
          <button onclick="drawSupportCard(${index})" class="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm">
            ✨ 抽取輔助牌 (<span id="support-count-${index}">2</span>/2)
          </button></div>
        <div id="support-cards-${index}" class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3"></div>`;
      rc.appendChild(div);
    });
}