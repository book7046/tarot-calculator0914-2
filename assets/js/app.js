// assets/js/app.js

// --- 狀態變數 ---
let currentType = "";
let currentQuestion = "";
let currentSpread = "";
let selectedCards = [];
let drawnCards = [];
let shuffledDeck = [];
let mindsetCard = null;
let shuffleRemaining = 3;
let supportCards = {};
let supportCardCounts = {};
let deferredPrompt;

// --- 問題類型配置 ---
const typeConfig = {
    choice: {
        examples: "💡 選擇型範例：『請問塔羅牌，我想知道我現在在工作上該做那個選擇對我未來比較好,如果選擇離職對我比較好是選項A,如果選擇繼續待在現在的公司對我比較好是選項B？』",
        spreads: ['choice']
    },
    advice: {
        examples: "💡 建議型範例：『請問塔羅牌,我該怎麼做才能把塔羅牌學好,請塔羅牌給我一個建議？』",
        spreads: ['advice']
    },
    result: {
        examples: "💡 結果型範例：請問塔羅牌,我想知道我這個月的工作運會如何？』、『請問塔羅牌,我想知道月底業績會如何？』",
        spreads: ['timeflow', 'davidstar', 'ushape']
    },
    relationship: {
        examples: "💡 關係型範例：『請問塔羅牌,我想知道我跟xxx三個月(下時間點)內感情如何？』、『我想知道我跟xxx一起合作創業結果會如何？』",
        spreads: ['relationship']
    }
};

// --- 初始化 ---
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    setupPWAInstall();
});

function setupEventListeners() {
    // 類型選擇事件
    document.querySelectorAll('.type-option').forEach(btn => {
        btn.addEventListener('click', function() {
            selectType(this.dataset.type);
        });
    });

    // 導航按鈕
    document.getElementById('backToTypeBtn').addEventListener('click', () => {
        document.getElementById('questionSection').classList.add('hidden');
        document.getElementById('typeSection').classList.remove('hidden');
    });

    document.getElementById('backToQuestionBtn').addEventListener('click', () => {
        document.getElementById('spreadSection').classList.add('hidden');
        document.getElementById('questionSection').classList.remove('hidden');
    });

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

// --- 流程邏輯 ---

function selectType(type) {
    currentType = type;
    document.getElementById('questionExample').textContent = typeConfig[type].examples;
    document.getElementById('typeSection').classList.add('hidden');
    document.getElementById('questionSection').classList.remove('hidden');
}

function showSpreadSelection() {
    const question = document.getElementById('questionInput').value.trim();
    if (!question) { alert('請先輸入你的問題！'); return; }
    currentQuestion = question;
    document.getElementById('questionSection').classList.add('hidden');
    document.getElementById('spreadSection').classList.remove('hidden');

    const allowed = typeConfig[currentType].spreads;
    document.querySelectorAll('.spread-option').forEach(option => {
        option.style.display = allowed.includes(option.dataset.spread) ? 'block' : 'none';
    });
}

function selectSpread(spreadType) {
    currentSpread = spreadType;
    document.getElementById('spreadSection').classList.add('hidden');
    document.getElementById('shuffleSection').classList.remove('hidden');
    shuffleRemaining = 3;
    document.getElementById('shuffleCount').textContent = shuffleRemaining;
    document.getElementById('shuffleCardsBtn').classList.remove('hidden');
    document.getElementById('cutCardsBtn').classList.add('hidden');
    if (typeof tarotCards !== 'undefined') { shuffledDeck = [...tarotCards]; }
}

// --- 洗牌與抽牌介面修復 ---

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
    const cutPoint = Math.floor(Math.random() * (shuffledDeck.length - 20)) + 10;
    const topHalf = shuffledDeck.slice(0, cutPoint);
    const bottomHalf = shuffledDeck.slice(cutPoint);
    shuffledDeck = [...bottomHalf, ...topHalf];
    const isReversed = Math.random() < 0.5;
    mindsetCard = { ...shuffledDeck[0], reversed: isReversed };
    shuffledDeck = shuffledDeck.slice(1);
    shuffledDeck.push(mindsetCard);
    document.getElementById('shuffleSection').classList.add('hidden');
    document.getElementById('mindsetSection').classList.remove('hidden');
    displayMindsetCard();
}

function createCardDeck() {
    const deck = document.getElementById('cardDeck');
    const container = document.querySelector('.fan-container');
    deck.innerHTML = '';
    const totalCards = shuffledDeck.length;
    const fanAngle = 140;
    const angleStep = fanAngle / (totalCards - 1);
    const startAngle = -fanAngle / 2;

    const containerWidth = container.offsetWidth;
    const radius = Math.min(280, containerWidth * 0.45); 
    const yOffset = containerWidth < 500 ? 120 : 150; 

    for (let i = 0; i < totalCards; i++) {
        const card = document.createElement('div');
        card.className = 'fan-card card-back rounded-lg flex items-center justify-center text-lg';
        card.innerHTML = '🌟';
        const angle = startAngle + (i * angleStep);
        const radian = (angle * Math.PI) / 180;
        const x = Math.sin(radian) * radius;
        const y = -Math.cos(radian) * radius * 0.4 + yOffset;
        card.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
        card.style.zIndex = 50 - Math.abs(i - Math.floor(totalCards / 2));
        const cardData = shuffledDeck[i];
        card.addEventListener('click', function () { drawCard(this, cardData); });
        deck.appendChild(card);
    }
}

function drawCard(cardElement, selectedCard) {
    const totalNeeded = spreads[currentSpread].cardCount;
    if (selectedCards.length >= totalNeeded) return;
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

    const currentDrawn = selectedCards.length;
    const remaining = totalNeeded - currentDrawn;
    const infoText = document.querySelector('#drawSection p');

    if (remaining > 0) {
        infoText.innerHTML = `還需抽取 <span id="cardsNeeded" class="text-yellow-300 font-bold">${remaining}</span> 張 (進度: ${currentDrawn}/${totalNeeded})`;
    } else {
        infoText.innerHTML = `<span class="text-green-400 font-bold">✨ 抽牌已完成 (${totalNeeded}/${totalNeeded})</span>`;
        document.getElementById('revealBtn').classList.remove('hidden');
    }
}

function proceedToDrawing() {
    document.getElementById('mindsetSection').classList.add('hidden');
    document.getElementById('drawSection').classList.remove('hidden');
    const total = spreads[currentSpread].cardCount;
    document.querySelector('#drawSection p').innerHTML = `還需抽取 <span id="cardsNeeded" class="text-yellow-300 font-bold">${total}</span> 張 (進度: 0/${total})`;
    createCardDeck();
}

// --- 輔助牌功能 ---

function drawSupportCard(position) {
    if (shuffledDeck.length === 0) { alert('沒有剩餘的牌可以抽取了！'); return; }
    if (!supportCards[position]) { supportCards[position] = []; supportCardCounts[position] = 0; }
    if (supportCardCounts[position] >= 2) { alert('此位置已達到輔助牌上限！'); return; }
    
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

// --- 占卜結果顯示 (修正心態牌樣式) ---

function revealResults() {
    document.getElementById('drawSection').classList.add('hidden');
    document.getElementById('resultSection').classList.remove('hidden');
    document.getElementById('questionDisplay').textContent = `問題：${currentQuestion}`;
    document.getElementById('spreadName').textContent = `牌陣：${spreads[currentSpread].name}`;
    displayResults();
}

function displayResults() {
    const mc = document.getElementById('resultMindsetCard');
    const mo = mindsetCard.reversed ? '逆位' : '正位';
    
    // 修正：將心態牌的按鈕與容器移出 flex 行，與其他牌卡保持一致的「下方居中」結構
    mc.innerHTML = `
        <div class="bg-gradient-to-r from-purple-900/30 to-blue-900/10 rounded-lg p-6 mb-6 border border-yellow-300/30">
            <div class="flex items-center gap-6">
                ${imageOrFallbackHTML(mindsetCard, 'lg')}
                <div class="flex-1 text-left">
                    <h3 class="text-xl font-semibold text-yellow-300 mb-1">💭 心態牌</h3>
                    <h4 class="text-lg font-medium text-white mb-2">${mindsetCard.name} (${mo})</h4>
                    <p class="text-blue-200">${mindsetCard.reversed ? mindsetCard.reversedMeaning : mindsetCard.meaning}</p>
                </div>
            </div>
            <div class="text-center mt-6">
                <button onclick="drawSupportCard('mindset')" class="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 py-2 px-4 rounded-lg transition-all duration-300 text-sm">
                    ✨ 抽取輔助牌 (<span id="mindset-support-count">2</span>/2)
                </button>
            </div>
            <div id="mindset-support-cards" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3"></div>
        </div>`;
      
    const rc = document.getElementById('resultCards'); 
    rc.innerHTML = '';
    drawnCards.forEach((card, index) => {
        const div = document.createElement('div');
        div.className = "bg-gradient-to-r from-blue-900/20 to-indigo-900/10 rounded-lg p-6 mb-4 border border-blue-400/20";
        div.innerHTML = `
            <div class="flex items-center gap-5">
                ${imageOrFallbackHTML(card, 'lg')}
                <div class="flex-1 text-left">
                    <h3 class="text-lg font-semibold text-blue-300 mb-1">${index + 1}. ${card.position}</h3>
                    <h4 class="text-white">${card.name} (${card.reversed ? '逆位' : '正位'})</h4>
                    <p class="text-blue-200">${card.reversed ? card.reversedMeaning : card.meaning}</p>
                </div>
            </div>
            <div class="text-center mt-6">
                <button onclick="drawSupportCard(${index})" class="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-200 py-2 px-4 rounded-lg transition-all duration-300 text-sm">
                    ✨ 抽取輔助牌 (<span id="support-count-${index}">2</span>/2)
                </button>
            </div>
            <div id="support-cards-${index}" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3"></div>`;
        rc.appendChild(div);
    });
}

// --- 輔助函式 ---

function displaySupportCard(position, card, cardNumber) {
    const ori = card.reversed ? '逆位' : '正位';
    const html = `
        <div class="bg-yellow-900/20 backdrop-blur-sm rounded-lg p-4 border border-yellow-400/30 mt-2">
            <div class="flex items-center gap-3">
                ${imageOrFallbackHTML(card, 'md')}
                <div class="flex-1 text-left">
                    <h5 class="text-sm font-semibold text-yellow-400 mb-1">輔助牌 ${cardNumber}</h5>
                    <h6 class="text-white text-xs mb-1">${card.name} (${ori})</h6>
                    <p class="text-blue-200 text-xs">${card.reversed ? card.reversedMeaning : card.meaning}</p>
                </div>
            </div>
        </div>`;
    const containerId = position === 'mindset' ? 'mindset-support-cards' : `support-cards-${position}`;
    document.getElementById(containerId).insertAdjacentHTML('beforeend', html);
}

function startNewReading() {
    currentType = ""; currentQuestion = ""; currentSpread = "";
    selectedCards = []; drawnCards = []; shuffledDeck = []; mindsetCard = null;
    shuffleRemaining = 3; supportCards = {}; supportCardCounts = {};
    document.getElementById('questionInput').value = "";
    document.getElementById('resultSection').classList.add('hidden');
    document.getElementById('typeSection').classList.remove('hidden');
}

function getCardImagePath(card){
    if (typeof tarotCards === 'undefined') return '';
    let idx = tarotCards.findIndex(c => c.name === card.name);
    return `assets/cards/${String(idx).padStart(2,'0')}.jpg`;
}

function imageOrFallbackHTML(card, sizeClass) {
    const reversed = card.reversed ? 'rws-reversed' : '';
    const src = getCardImagePath(card);
    return `
        <div class="rws-card-frame">
            <img class="rws-img ${sizeClass||'lg'} ${reversed}" src="${src}" loading="lazy" onerror="this.closest('.rws-card-frame').classList.add('no-img')"/>
            <div class="rws-fallback ${reversed}">
                <div class="text-base text-white">${card.name}</div>
            </div>
        </div>`;
}

function displayMindsetCard() {
    const el = document.getElementById('mindsetCard');
    const ori = mindsetCard.reversed ? '逆位' : '正位';
    el.innerHTML = `
        <div class="flex items-center justify-center gap-6">
            ${imageOrFallbackHTML(mindsetCard, 'xl')}
            <div class="flex-1 text-left">
                <h3 class="text-2xl font-semibold text-yellow-300 mb-2">💭 心態牌 - ${ori}</h3>
                <p class="text-blue-200 text-lg">${mindsetCard.reversed ? mindsetCard.reversedMeaning : mindsetCard.meaning}</p>
            </div>
        </div>`;
}

function setupPWAInstall() {
    const installBtn = document.getElementById('installAppBtn');
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault(); deferredPrompt = e;
        if(installBtn) installBtn.classList.remove('hidden');
    });
}

