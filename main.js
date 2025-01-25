// DOM Elements
const registrationForm = document.getElementById('registrationForm');
const dashboard = document.getElementById('dashboard');
const authForm = document.getElementById('authForm');
const menuBtn = document.getElementById('menuBtn');
const sideNav = document.getElementById('sideNav');
const logoutBtn = document.getElementById('logoutBtn');
const addGoalBtn = document.getElementById('addGoalBtn');
const goalModal = document.getElementById('goalModal');
const goalForm = document.getElementById('goalForm');
const cancelGoalBtn = document.getElementById('cancelGoalBtn');
const goalsList = document.getElementById('goalsList');

// Currency symbols mapping
const currencySymbols = {
    'RUB': '₽',
    'BYN': 'Br',
    'USD': '$',
    'CNY': '¥',
    'JPY': '¥',
    'EUR': '€',
    'CHF': '₣'
};

// Event Listeners
authForm.addEventListener('submit', handleAuth);
menuBtn.addEventListener('click', toggleMenu);
logoutBtn.addEventListener('click', handleLogout);
addGoalBtn.addEventListener('click', () => goalModal.classList.remove('hidden'));
cancelGoalBtn.addEventListener('click', () => goalModal.classList.add('hidden'));
goalForm.addEventListener('submit', handleGoalSubmit);

// Handle Authentication
function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Store user data (in real app, this would be handled by backend)
    localStorage.setItem('user', JSON.stringify({ email }));

    // Show dashboard
    registrationForm.classList.add('hidden');
    dashboard.classList.remove('hidden');

    // Load existing goals
    loadGoals();
}

// Toggle Menu
function toggleMenu() {
    const isOpen = sideNav.classList.contains('translate-x-0');
    if (isOpen) {
        sideNav.classList.remove('translate-x-0');
        sideNav.classList.add('-translate-x-full');
    } else {
        sideNav.classList.add('translate-x-0');
        sideNav.classList.remove('-translate-x-full');
    }
}

// Handle Logout
function handleLogout() {
    localStorage.removeItem('user');
    localStorage.removeItem('goals');
    dashboard.classList.add('hidden');
    registrationForm.classList.remove('hidden');
    sideNav.classList.remove('translate-x-0');
    sideNav.classList.add('-translate-x-full');
}

// Handle Goal Submit
function handleGoalSubmit(e) {
    e.preventDefault();

    const formData = new FormData(goalForm);
    const title = formData.get('title');
    const targetDate = formData.get('targetDate');
    const amount = parseFloat(formData.get('amount'));
    const income = parseFloat(formData.get('income'));
    const currency = formData.get('currency');

    // Calculate months until target
    const today = new Date();
    const targetDateObj = new Date(targetDate);
    const monthsUntilTarget =
        (targetDateObj.getFullYear() - today.getFullYear()) * 12 +
        (targetDateObj.getMonth() - today.getMonth());

    // Calculate required monthly savings
    const requiredMonthlySavings = amount / monthsUntilTarget;
    const maxPossibleMonthlySavings = income * 0.5; // Assume max 50% of income can be saved

    if (requiredMonthlySavings > maxPossibleMonthlySavings) {
        alert('Внимание! С текущим доходом достижение цели к указанной дате может быть затруднительным. Рекомендуем увеличить срок или уменьшить целевую сумму.');
        return;
    }

    const goal = {
        title,
        targetDate,
        amount,
        currency,
        requiredMonthlySavings,
        createdAt: new Date().toISOString()
    };

    // Save goal
    const existingGoals = JSON.parse(localStorage.getItem('goals') || '[]');
    localStorage.setItem('goals', JSON.stringify([...existingGoals, goal]));

    // Update UI
    loadGoals();
    goalModal.classList.add('hidden');
    goalForm.reset();
}

// Load Goals
function loadGoals() {
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    goalsList.innerHTML = goals.map(goal => `
        <div class="goal-card">
            <h3>${goal.title}</h3>
            <div class="goal-info">
                <span>Цель до:</span>
                <span>${new Date(goal.targetDate).toLocaleDateString('ru-RU')}</span>
            </div>
            <div class="goal-info">
                <span>Необходимая сумма:</span>
                <span>${goal.amount.toLocaleString('ru-RU')} ${currencySymbols[goal.currency]}</span>
            </div>
            <div class="goal-info">
                <span>Ежемесячный взнос:</span>
                <span class="monthly-savings">${Math.ceil(goal.requiredMonthlySavings).toLocaleString('ru-RU')} ${currencySymbols[goal.currency]}</span>
            </div>
        </div>
    `).join('');
}

// Check if user is logged in on page load
window.addEventListener('load', () => {
    const user = localStorage.getItem('user');
    if (user) {
        registrationForm.classList.add('hidden');
        dashboard.classList.remove('hidden');
        loadGoals();
    }
});