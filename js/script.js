class MysticDeck {
    constructor() {
        this.cards = [];
        this.cardMap = {};
        this.currentBit = 0;
        this.answerBits = 0;
        this.maxBits = 5;
        this.selectContainer = document.getElementById('card-select');
        this.handContainer = document.getElementById('card-hand');
        this.revealContainer = document.getElementById('revealed-card');
        this.messageElement = document.getElementById('fate-message');

        document.getElementById('start-ritual-btn').addEventListener('click', () => this.startRitual());
        document.getElementById('answer-yes-btn').addEventListener('click', () => this.answer(true));
        document.getElementById('answer-no-btn').addEventListener('click', () => this.answer(false));
        document.getElementById('reset-ritual-btn').addEventListener('click', () => this.resetRitual());
    }
    async init() {
        const res = await fetch('https://deckofcardsapi.com/api/deck/new/draw/?count=52');
        const data = await res.json();
        this.cards = data.cards.slice(0, 20);
        this.cards.forEach((card, i) => {
            card.binaryValue = i + 1;
            this.cardMap[card.binaryValue] = card;
            const img = document.createElement('img');
            img.src = card.image;
            img.alt = `${card.value} of ${card.suit}`;
            img.dataset.index = i;
            this.selectContainer.appendChild(img);
            Draggable.create(img, {
                type: 'x,y',
                inertia: true,
                edgeResistance: 0.65,
                bounds: document.body
            });
            img.addEventListener('dblclick', () => {
                gsap.to(img, {
                    rotationY: img.classList.contains('flipped') ? 0 : 180,
                    duration: 0.6,
                    ease: 'power2.inOut'
                });
                img.classList.toggle('flipped');
            });
        });
        this.arrangeCards(this.selectContainer);
    }
    arrangeCards(container) {
        const items = container.querySelectorAll('img');
        const total = items.length;
        const offsetX = 20;
        const maxAngle = 10;

        items.forEach((item, i) => {
            const xPosition = (i - (total - 1) / 2) * offsetX;
            const angle = (i - (total - 1) / 2) * (maxAngle / ((total - 1) / 2));
            item.dataset.angle = angle;

            gsap.fromTo(item,
                {
                    y: 100,
                    opacity: 0,
                    scale: 0.8
                },
                {
                    x: xPosition,
                    y: 0,
                    rotation: angle,
                    opacity: 1,
                    scale: 1,
                    duration: 0.5,
                    delay: i * 0.05,
                    ease: 'power2.out'
                }
            );
            item.style.zIndex = i;
        });
    }
    startRitual() {
        document.getElementById('step-1').classList.add('hidden');
        document.getElementById('main-title').classList.add('hidden');
        document.getElementById('step-2').classList.remove('hidden');
        this.showNextCircle();
    }
    showNextCircle() {
        this.handContainer.innerHTML = '';
        const bit = 1 << this.currentBit;
        const circle = this.cards.filter(card => (card.binaryValue & bit) !== 0);
        console.log('تعداد کارت‌ها در گروه:', circle.length);

        circle.forEach(card => {
            const img = document.createElement('img');
            img.src = card.image;
            img.alt = `${card.value} of ${card.suit}`;
            this.handContainer.appendChild(img);
            Draggable.create(img, {
                type: 'x,y',
                inertia: true,
                edgeResistance: 0.65,
                bounds: document.body
            });
            img.addEventListener('dblclick', () => {
                gsap.to(img, {
                    rotationY: img.classList.contains('flipped') ? 0 : 180,
                    duration: 0.6,
                    ease: 'power2.inOut'
                });
                img.classList.toggle('flipped');
            });
        });
        this.arrangeCards(this.handContainer);
    }
    answer(isYes) {
        if (isYes) this.answerBits += 1 << this.currentBit;
        this.currentBit++;
        if (this.currentBit >= this.maxBits) {
            this.revealFate();
        } else {
            this.showNextCircle();
        }
    }
    revealFate() {
        document.getElementById('step-2').classList.add('hidden');
        document.getElementById('step-3').classList.remove('hidden');
        const card = this.cardMap[this.answerBits];
        if (card) {
            const img = document.createElement('img');
            img.src = card.image;
            img.alt = `${card.value} of ${card.suit}`;
            this.revealContainer.appendChild(img);
            gsap.fromTo(img, {
                scale: 0,
                opacity: 0,
                rotation: 360
            }, {
                scale: 1,
                opacity: 1,
                rotation: 0,
                duration: 1,
                ease: 'power2.out'
            });
            this.messageElement.textContent = this.getFateMessage(card);
        } else {
            this.messageElement.textContent = 'کارت پیدا نشد! دوباره امتحان کنید.';
        }
    }
    getFateMessage(card) {
        const messages = {
            'HEARTS': 'این کارت نشان‌دهنده عشق و مهربانی در قلب شماست!',
            'DIAMONDS': 'این کارت از ثروت و شکوفایی در مسیر شما خبر می‌دهد!',
            'CLUBS': 'این کارت نماد خلاقیت و رشد در روح شماست!',
            'SPADES': 'این کارت از حکمت و قدرت درونی شما سخن می‌گوید!'
        };
        return messages[card.suit] || 'این کارت رازی نهان دارد که هنوز آشکار نشده...';
    }
    resetRitual() {
        document.getElementById('step-3').classList.add('hidden');
        document.getElementById('main-title').classList.remove('hidden');
        document.getElementById('step-1').classList.remove('hidden');
        this.selectContainer.innerHTML = '';
        this.handContainer.innerHTML = '';
        this.revealContainer.innerHTML = '';
        this.messageElement.textContent = 'راز کارت شما در انتظار است...';
        this.currentBit = 0;
        this.answerBits = 0;
        this.init();
    }
}

const game = new MysticDeck();
game.init();

const canvas = document.getElementById('particle-bg');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const numParticles = 100;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = ['#FFD700', '#4B0082', '#FFFFFF'][Math.floor(Math.random() * 3)];
        this.opacity = Math.random() * 0.5 + 0.2;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        this.opacity = Math.sin(Date.now() * 0.001 + this.x) * 0.3 + 0.5;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    requestAnimationFrame(animateParticles);
}

animateParticles();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
