// Variable references
const searchForm = document.getElementById('search-form');
const ebookFilter = document.getElementById('ebook-filter');
const sortRatingButton = document.getElementById('sort-rating');
const bookListElement = document.getElementById('book-list');
const selectedBookElement = document.getElementById('selected-book');

// Define a global variable to store book data
let books = [];

// Event listeners
searchForm.addEventListener('submit', handleSearch);
ebookFilter.addEventListener('change', handleFilter);
sortRatingButton.addEventListener('click', handleSort);

// Function definitions

async function searchBooks(query, type) {
    try {
        const searchType = type === 'title' ? 'intitle' : type === 'isbn' ? 'isbn' : 'inauthor';
        const url = `https://www.googleapis.com/books/v1/volumes?q=${searchType}:${query}&maxResults=10`;
        const response = await fetch(url);
        const data = await response.json();

        return data.items.map(book => ({
            title: book.volumeInfo.title || 'Unknown Title',
            author_name: book.volumeInfo.authors ? book.volumeInfo.authors.join(', ') : 'Unknown Author',
            isbn: book.volumeInfo.industryIdentifiers ? book.volumeInfo.industryIdentifiers[0].identifier : 'Unknown ISBN',
            cover_i: book.volumeInfo.imageLinks ? book.volumeInfo.imageLinks.thumbnail : '',
            ebook_access: book.accessInfo.viewability,
            first_publish_year: book.volumeInfo.publishedDate || 'Unknown Year',
            ratings_sortable: book.volumeInfo.averageRating || 0
        }));
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
}

function displayBookList(bookData) {
    bookListElement.innerHTML = '';
    bookData.forEach(book => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="title-element">${book.title}</span>
            <span class="author-element">${book.author_name}</span>
            <img class="cover-element" src="${book.cover_i}" alt="Cover Image" />
            <span class="rating-element">Rating: ${book.ratings_sortable}</span>
            <span class="ebook-element">E-Book: ${book.ebook_access}</span>
        `;
        li.addEventListener('click', () => displaySingleBook(book));
        bookListElement.appendChild(li);
    });
    selectedBookElement.style.display = 'none';
}

async function handleSearch(event) {
    event.preventDefault();
    const query = document.getElementById('search-query').value;
    const type = document.getElementById('search-type').value;

    try {
        books = await searchBooks(query, type); // Store results globally
        displayBookList(books);
    } catch (error) {
        console.error('Error handling search:', error);
    }
}

function displaySingleBook(book) {
    bookListElement.style.display = 'none';
    selectedBookElement.style.display = 'block';
    selectedBookElement.innerHTML = `
        <h2>${book.title}</h2>
        <p>Author: ${book.author_name}</p>
        <p>Published: ${book.first_publish_year}</p>
        <img src="${book.cover_i}" alt="Cover Image" />
        <p>ISBN: ${book.isbn}</p>
        <p>E-Book Access: ${book.ebook_access}</p>
        <p>Rating: ${book.ratings_sortable}</p>
    `;
}

function handleFilter() {
    const onlyEbooks = ebookFilter.checked;
    const filteredBooks = onlyEbooks ? books.filter(book => book.ebook_access === 'FULL_TEXT') : books;
    displayBookList(filteredBooks);
}

function handleSort() {
    books.sort((a, b) => (b.ratings_sortable || 0) - (a.ratings_sortable || 0));
    displayBookList(books);
}
