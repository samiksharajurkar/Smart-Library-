// Data Mockup
let books = [
    { id: 1, title: "Data Structures", shelf: "A", available: true },
    { id: 2, title: "Web Development", shelf: "A", available: true },
    { id: 3, title: "Digital Marketing", shelf: "B", available: true }
];

// 1. Auth Logic
function toggleAuth() {
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('registerForm').classList.toggle('hidden');
}

function register() {
    const user = document.getElementById('regUser').value;
    const pass = document.getElementById('regPass').value;
    if(user && pass) {
        localStorage.setItem('userData', JSON.stringify({user, pass, borrowed: [], dues: 0.00}));
        alert("Registration Successful! Please Login.");
        toggleAuth();
    }
}

function login() {
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    const stored = JSON.parse(localStorage.getItem('userData'));

    if(stored && stored.user === user && stored.pass === pass) {
        showApp(stored);
    } else {
        alert("Invalid Credentials");
    }
}

function showApp(userData) {
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('welcomeName').innerText = `Hello, ${userData.user}`;
    updateUI();
}

function logout() {
    location.reload(); // Simplest way to clear state for this JS-only version
}

// 2. Library Logic
function updateUI() {
    const stored = JSON.parse(localStorage.getItem('userData'));
    document.getElementById('userDues').innerText = `$${stored.dues.toFixed(2)}`;
    
    const list = document.getElementById('borrowedList');
    list.innerHTML = "";
    stored.borrowed.forEach(b => {
        list.innerHTML += `<li>${b.title} <button onclick="returnBook(${b.id})">Return</button></li>`;
    });
    handleSearch();
}

function handleSearch() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const grid = document.getElementById('bookGrid');
    grid.innerHTML = "";
    
    books.filter(b => b.title.toLowerCase().includes(q)).forEach(book => {
        grid.innerHTML += `
            <div class="book-card">
                <h4>${book.title}</h4>
                <button onclick="locate('${book.shelf}')">Locate</button>
                <button onclick="borrowBook(${book.id})" ${!book.available ? 'disabled' : ''}>Borrow</button>
            </div>`;
    });
}

function borrowBook(id) {
    let stored = JSON.parse(localStorage.getItem('userData'));
    let book = books.find(b => b.id === id);
    book.available = false;
    stored.borrowed.push(book);
    localStorage.setItem('userData', JSON.stringify(stored));
    updateUI();
}

function locate(shelfId) {
    document.getElementById('mapSection').classList.remove('hidden');
    document.querySelectorAll('.shelf').forEach(s => s.classList.remove('active'));
    document.getElementById(`shelf-${shelfId}`).classList.add('active');
}

// Expanded Book Database with Genres
let books = [
    { id: 1, title: "Data Structures", shelf: "A", genre: "Tech", available: true },
    { id: 2, title: "Web Development", shelf: "A", genre: "Tech", available: true },
    { id: 3, title: "The Great Gatsby", shelf: "B", genre: "Fiction", available: true },
    { id: 4, title: "Cybersecurity 101", shelf: "A", genre: "Tech", available: true },
    { id: 5, title: "1984", shelf: "B", genre: "Fiction", available: true },
    { id: 6, title: "Brave New World", shelf: "B", genre: "Fiction", available: true }
];

function updateUI() {
    const stored = JSON.parse(localStorage.getItem('userData'));
    document.getElementById('userDues').innerText = `$${stored.dues.toFixed(2)}`;
    
    // 1. Update Borrowed List with Due Dates
    const list = document.getElementById('borrowedList');
    list.innerHTML = "";
    stored.borrowed.forEach(b => {
        list.innerHTML += `
            <li style="flex-direction:column; align-items:flex-start;">
                <strong>${b.title}</strong>
                <span class="due-tag">Due: ${b.dueDate}</span>
                <button onclick="returnBook(${b.id})" style="margin-top:5px">Return</button>
            </li>`;
    });

    // 2. Trigger Recommendations
    generateRecommendations(stored.borrowed);
    handleSearch();
}

function borrowBook(id) {
    let stored = JSON.parse(localStorage.getItem('userData'));
    let book = books.find(b => b.id === id);
    
    // Calculate Due Date (Current Date + 7 Days)
    const today = new Date();
    const due = new Date();
    due.setDate(today.getDate() + 7);
    
    book.available = false;
    // Add book + metadata to user history
    stored.borrowed.push({
        ...book,
        dueDate: due.toDateString() 
    });
    
    localStorage.setItem('userData', JSON.stringify(stored));
    updateUI();
}

function generateRecommendations(borrowedHistory) {
    const recContainer = document.getElementById('recommendationList');
    recContainer.innerHTML = "";

    if (borrowedHistory.length === 0) {
        recContainer.innerHTML = "<p style='font-size:12px;'>Borrow a book to see suggestions!</p>";
        return;
    }

    // Get the genres the user likes
    const likedGenres = [...new Set(borrowedHistory.map(b => b.genre))];
    
    // Find books in the same genre that aren't already borrowed
    const suggestions = books.filter(b => 
        likedGenres.includes(b.genre) && 
        !borrowedHistory.some(historyItem => historyItem.id === b.id)
    );

    suggestions.slice(0, 3).forEach(book => {
        recContainer.innerHTML += `
            <div class="rec-item">
                <strong>${book.title}</strong><br>
                <small>Since you like ${book.genre}</small>
            </div>`;
    });
}

function updateUI() {
    const stored = JSON.parse(localStorage.getItem('userData'));
    let currentTotalDues = stored.dues || 0;
    const today = new Date();

    const list = document.getElementById('borrowedList');
    list.innerHTML = "";

    stored.borrowed.forEach(book => {
        const dueDate = new Date(book.dueDate);
        let statusClass = "";
        let lateText = "";

        // Check if the book is overdue
        if (today > dueDate) {
            const diffTime = Math.abs(today - dueDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            const penalty = diffDays * 1.00; // $1.00 per day
            
            statusClass = "overdue";
            lateText = ` (LATE: Add $${penalty.toFixed(2)} to dues)`;
        }

        list.innerHTML += `
            <li class="${statusClass}">
                <strong>${book.title}</strong>
                <span class="due-tag">Due: ${book.dueDate} ${lateText}</span>
                <button onclick="returnBook(${book.id})">Return</button>
            </li>`;
    });

    document.getElementById('userDues').innerText = `$${currentTotalDues.toFixed(2)}`;
    generateRecommendations(stored.borrowed);
    handleSearch();
}

function returnBook(id) {
    let stored = JSON.parse(localStorage.getItem('userData'));
    const bookIndex = stored.borrowed.findIndex(b => b.id === id);
    
    if (bookIndex > -1) {
        const book = stored.borrowed[bookIndex];
        const dueDate = new Date(book.dueDate);
        const today = new Date();

        // Calculate and add fine if late
        if (today > dueDate) {
            const diffTime = Math.abs(today - dueDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            stored.dues += (diffDays * 1.00);
            alert(`Book was ${diffDays} days late. Fine added: $${(diffDays * 1).toFixed(2)}`);
        }

        // Return the book to the library pool
        const originalBook = books.find(b => b.id === id);
        if (originalBook) originalBook.available = true;

        // Remove from user's borrowed list
        stored.borrowed.splice(bookIndex, 1);
        
        localStorage.setItem('userData', JSON.stringify(stored));
        updateUI();
    }
}

function generateRecommendations(borrowedHistory) {
    const recContainer = document.getElementById('recommendationList');
    recContainer.innerHTML = "";

    let suggestions = [];

    if (borrowedHistory.length === 0) {
        // Show "Trending" or random books if history is empty
        suggestions = books.slice(0, 2);
        recContainer.innerHTML = "<p style='font-size:11px; margin-bottom:5px;'>New here? Try these:</p>";
    } else {
        const likedGenres = [...new Set(borrowedHistory.map(b => b.genre))];
        suggestions = books.filter(b => 
            likedGenres.includes(b.genre) && 
            !borrowedHistory.some(h => h.id === b.id)
        );
    }

    suggestions.forEach(book => {
        recContainer.innerHTML += `
            <div class="rec-item">
                <strong>${book.title}</strong>
                <button class="btn-borrow" onclick="borrowBook(${book.id})" style="padding:2px 5px; font-size:10px; float:right;">Borrow</button>
            </div>`;
    });
}

function showApp(userData) {
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    
    // Update Profile Card
    document.getElementById('welcomeName').innerText = `Hello, ${userData.user}`;
    document.getElementById('cardName').innerText = userData.user.toUpperCase();
    
    // Generate a real QR Code using the GoQR API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${userData.user}`;
    document.getElementById('userQR').src = qrUrl;

    updateUI();
}

// Update the fine box color if dues > 0
function updateUI() {
    const stored = JSON.parse(localStorage.getItem('userData'));
    const dueBox = document.querySelector('.due-box');
    
    if(stored.dues > 0) {
        dueBox.classList.add('overdue-alert');
    } else {
        dueBox.classList.remove('overdue-alert');
    }
    
    // ... rest of your existing updateUI code ...
}