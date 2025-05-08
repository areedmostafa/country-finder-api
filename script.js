const DEFAULT_COUNTRIES = [
    'Canada', 'Bangladesh', 'Brazil', 'France', 'Japan', 'Australia', 'Egypt', 'South Africa', 'India', 'United States', 'Germany', 'Italy',
    'Mexico', 'Russia', 'China', 'Argentina', 'Spain', 'Turkey', 'Sweden', 'Norway', 'Netherlands', 'Greece', 'New Zealand', 'Indonesia'
];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function renderCountries(data, resultsSection) {
    resultsSection.innerHTML = '';
    data.forEach((country, idx) => {
        setTimeout(() => {
            const name = country.name?.common || 'N/A';
            const capital = country.capital ? country.capital[0] : 'N/A';
            const flag = country.flags?.svg || country.flags?.png || '';
            const currencies = country.currencies ? Object.values(country.currencies).map(c => c.name + ' (' + c.symbol + ')').join(', ') : 'N/A';
            const population = country.population?.toLocaleString() || 'N/A';
            const region = country.region || 'N/A';
            const languages = country.languages ? Object.values(country.languages).join(', ') : 'N/A';

            const countryDiv = document.createElement('div');
            countryDiv.className = 'country-card';
            countryDiv.style.animationDelay = `${0.05 * idx}s`;
            countryDiv.innerHTML = `
                <h2>${name}</h2>
                <div class="flag-container">
                    <img src="${flag}" alt="Flag of ${name}" class="flag">
                </div>
                <div class="country-details">
                    <p><strong>Capital:</strong> ${capital}</p>
                    <p><strong>Currency:</strong> ${currencies}</p>
                    <p><strong>Population:</strong> ${population}</p>
                    <p><strong>Region:</strong> ${region}</p>
                    <p><strong>Languages:</strong> ${languages}</p>
                </div>
            `;
            resultsSection.appendChild(countryDiv);
        }, 50 * idx);
    });
}

async function fetchAndRenderCountriesByNames(names, resultsSection) {
    resultsSection.innerHTML = '<p class="loading">Loading countries...</p>';
    try {
        const promises = names.map(async name => {
            const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(name)}`);
            const arr = await res.json();
            if (!Array.isArray(arr)) return null;
            // Try to find best match
            const lower = name.toLowerCase();
            let match = arr.find(c => c.name?.common?.toLowerCase() === lower || c.name?.official?.toLowerCase() === lower);
            if (!match) match = arr[0];
            return match;
        });
        const countries = (await Promise.all(promises)).filter(Boolean);
        renderCountries(countries, resultsSection);
    } catch (err) {
        resultsSection.innerHTML = `<p class="error">Failed to load default countries.</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const resultsSection = document.getElementById('results');
    const shuffled = shuffleArray([...DEFAULT_COUNTRIES]).slice(0, 12);
    fetchAndRenderCountriesByNames(shuffled, resultsSection);
});

document.getElementById('country-search-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const query = document.getElementById('country-input').value.trim();
    const resultsSection = document.getElementById('results');
    resultsSection.innerHTML = '';
    if (!query) return;

    resultsSection.innerHTML = '<p>Loading...</p>';
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Country not found');
        const data = await response.json();
        renderCountries(data, resultsSection);
    } catch (err) {
        resultsSection.innerHTML = `<p class="error">${err.message}</p>`;
    }
}); 