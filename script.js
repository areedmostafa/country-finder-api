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
        resultsSection.innerHTML = '';
        data.forEach(country => {
            const name = country.name?.common || 'N/A';
            const capital = country.capital ? country.capital[0] : 'N/A';
            const flag = country.flags?.svg || country.flags?.png || '';
            const currencies = country.currencies ? Object.values(country.currencies).map(c => c.name + ' (' + c.symbol + ')').join(', ') : 'N/A';
            const population = country.population?.toLocaleString() || 'N/A';
            const region = country.region || 'N/A';
            const languages = country.languages ? Object.values(country.languages).join(', ') : 'N/A';

            const countryDiv = document.createElement('div');
            countryDiv.className = 'country-card';
            countryDiv.innerHTML = `
                <h2>${name}</h2>
                <img src="${flag}" alt="Flag of ${name}" class="flag">
                <p><strong>Capital:</strong> ${capital}</p>
                <p><strong>Currency:</strong> ${currencies}</p>
                <p><strong>Population:</strong> ${population}</p>
                <p><strong>Region:</strong> ${region}</p>
                <p><strong>Languages:</strong> ${languages}</p>
            `;
            resultsSection.appendChild(countryDiv);
        });
    } catch (err) {
        resultsSection.innerHTML = `<p class="error">${err.message}</p>`;
    }
}); 