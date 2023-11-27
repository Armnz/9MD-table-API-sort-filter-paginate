import axios from 'axios';

type Country = {
    name: string;
    capital: string;
    currency: {
        name: string;
    };
    language: {
        name: string;
    };
};

let countries: Country[] = [];
let filteredCountries: Country[] = [];
let currentPage = 1;
const rowsPerPage = 20;
let sortDirection = 'asc';
let sortedBy = '';

function filterCountries(searchTerms: { country: string, capital: string, currency: string, language: string }) {
  filteredCountries = countries.filter(country => country.name.toLowerCase().includes(searchTerms.country.toLowerCase())
        && country.capital.toLowerCase().includes(searchTerms.capital.toLowerCase())
        && country.currency.name.toLowerCase().includes(searchTerms.currency.toLowerCase())
        && country.language.name.toLowerCase().includes(searchTerms.language.toLowerCase()));

  currentPage = 1;
  renderTable(filteredCountries);
  renderPagination(filteredCountries.length);
}

function renderTable(countriesToRender: Country[]) {
  const tableBody = document.getElementById('country-table-body');
  if (!tableBody) return;

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedCountries = countriesToRender.slice(startIndex, endIndex);

  tableBody.innerHTML = '';
  paginatedCountries.forEach((country) => {
    const row = `<tr>
            <td>${country.name}</td>
            <td>${country.capital}</td>
            <td>${country.currency.name}</td>
            <td>${country.language.name}</td>
        </tr>`;
    tableBody.innerHTML += row;
  });
}

function renderPagination(totalRows: number) {
  const pageCount = Math.ceil(totalRows / rowsPerPage);
  const paginationUl = document.getElementById('pagination');
  if (!paginationUl) return;

  paginationUl.innerHTML = '';
  for (let i = 1; i <= pageCount; i += 1) {
    const li = document.createElement('li');
    li.className = `page-item ${i === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener('click', (event) => {
      event.preventDefault();
      currentPage = i;
      renderTable(filteredCountries.length > 0 ? filteredCountries : countries);
      renderPagination(filteredCountries.length > 0 ? filteredCountries.length : countries.length);
    });
    paginationUl.appendChild(li);
  }
}

function sortData(column: string) {
  if (sortedBy === column) {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    sortDirection = 'asc';
  }
  sortedBy = column;

  filteredCountries.sort((a, b) => {
    let valueA; let valueB;
    if (column === 'currency') {
      valueA = a.currency.name.toLowerCase();
      valueB = b.currency.name.toLowerCase();
    } else if (column === 'language') {
      valueA = a.language.name.toLowerCase();
      valueB = b.language.name.toLowerCase();
    } else {
      valueA = a[column as keyof Country].toString().toLowerCase();
      valueB = b[column as keyof Country].toString().toLowerCase();
    }

    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  renderTable(filteredCountries);
  renderPagination(filteredCountries.length);
}

window.addEventListener('DOMContentLoaded', () => {
  const searchCountry = document.getElementById('search-country') as HTMLInputElement;
  const searchCapital = document.getElementById('search-capital') as HTMLInputElement;
  const searchCurrency = document.getElementById('search-currency') as HTMLInputElement;
  const searchLanguage = document.getElementById('search-language') as HTMLInputElement;
  const searchButton = document.getElementById('search-button');

  searchButton?.addEventListener('click', () => {
    filterCountries({
      country: searchCountry.value,
      capital: searchCapital.value,
      currency: searchCurrency.value,
      language: searchLanguage.value,
    });
  });

  document.getElementById('sort-country')?.addEventListener('click', () => sortData('name'));
  document.getElementById('sort-capital')?.addEventListener('click', () => sortData('capital'));
  document.getElementById('sort-currency')?.addEventListener('click', () => sortData('currency'));
  document.getElementById('sort-language')?.addEventListener('click', () => sortData('language'));

  axios.get<{ countries: Country[] }>('assets/countries.json')
    .then((response) => {
      countries = response.data.countries;
      filteredCountries = [...countries];
      renderTable(countries);
      renderPagination(countries.length);
    })
    .catch((error) => console.error('Error fetching countries:', error));
});
