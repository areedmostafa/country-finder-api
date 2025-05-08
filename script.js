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

// AI assistant functionality
const AI_API_KEY = 'fdb22a82544840dda5b5d2950a73d7ae';

document.getElementById('ai-assistant-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const currentCountry = document.getElementById('current-country').value.trim();
    const budget = document.getElementById('budget').value.trim();
    const preferences = document.getElementById('preferences').value.trim();
    
    if (!currentCountry || !budget || !preferences) return;
    
    const resultBox = document.getElementById('assistant-result');
    resultBox.innerHTML = '<p>Generating travel recommendations...</p>';
    resultBox.style.display = 'block';
    resultBox.classList.add('active');
    
    try {
        // Create a prompt for the AI
        const prompt = `Create a travel recommendation for someone from ${currentCountry} with a budget of $${budget} USD. 
        They prefer: ${preferences}. 
        Provide: 
        1. The top 2 recommended countries to visit with brief reasons
        2. A suggested itinerary for the top choice
        3. Budget breakdown (flights, accommodation, food, activities)
        Keep answers concise and focused on practicality.`;
        
        // In a real implementation, you would use the API key to make a call to an AI service.
        // For demo purposes, we'll simulate an API response after a delay
        setTimeout(() => {
            generateDemoResponse(currentCountry, budget, preferences, resultBox);
        }, 1500);
        
        // This is where you would make a real API call in production:
        /*
        const response = await fetch('https://api.openai.com/v1/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AI_API_KEY}`
            },
            body: JSON.stringify({
                model: "text-davinci-003",
                prompt: prompt,
                max_tokens: 500,
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        const aiResponse = data.choices[0].text.trim();
        
        resultBox.innerHTML = formatAIResponse(aiResponse);
        */
    } catch (err) {
        resultBox.innerHTML = `<p class="error">Sorry, couldn't generate recommendations. Please try again.</p>`;
    }
});

function generateDemoResponse(country, budget, preferences, resultBox) {
    // Parse preferences for personalization
    const prefLower = preferences.toLowerCase();
    let destType = 'cultural';
    
    if (prefLower.includes('beach') || prefLower.includes('ocean') || prefLower.includes('sea')) {
        destType = 'beach';
    } else if (prefLower.includes('mountain') || prefLower.includes('hiking') || prefLower.includes('nature')) {
        destType = 'nature';
    } else if (prefLower.includes('food') || prefLower.includes('cuisine') || prefLower.includes('gastronomy')) {
        destType = 'culinary';
    } else if (prefLower.includes('histor') || prefLower.includes('museum') || prefLower.includes('ancient')) {
        destType = 'historical';
    }
    
    // Budget-based recommendations
    let primaryDest, secondaryDest, flightCost, dailyCost, stayLength;
    const budgetNum = parseInt(budget);
    
    if (budgetNum < 1000) {
        if (destType === 'beach') {
            primaryDest = 'Thailand';
            secondaryDest = 'Vietnam';
        } else if (destType === 'nature') {
            primaryDest = 'Nepal';
            secondaryDest = 'Colombia';
        } else if (destType === 'culinary') {
            primaryDest = 'Vietnam';
            secondaryDest = 'Mexico';
        } else if (destType === 'historical') {
            primaryDest = 'Turkey';
            secondaryDest = 'Egypt';
        } else {
            primaryDest = 'Thailand';
            secondaryDest = 'Mexico';
        }
        flightCost = Math.round(budgetNum * 0.4);
        dailyCost = 30;
    } else if (budgetNum < 3000) {
        if (destType === 'beach') {
            primaryDest = 'Greece';
            secondaryDest = 'Portugal';
        } else if (destType === 'nature') {
            primaryDest = 'Costa Rica';
            secondaryDest = 'New Zealand';
        } else if (destType === 'culinary') {
            primaryDest = 'Italy';
            secondaryDest = 'Japan';
        } else if (destType === 'historical') {
            primaryDest = 'Italy';
            secondaryDest = 'Greece';
        } else {
            primaryDest = 'Spain';
            secondaryDest = 'Portugal';
        }
        flightCost = Math.round(budgetNum * 0.35);
        dailyCost = 70;
    } else {
        if (destType === 'beach') {
            primaryDest = 'Maldives';
            secondaryDest = 'Australia';
        } else if (destType === 'nature') {
            primaryDest = 'New Zealand';
            secondaryDest = 'Iceland';
        } else if (destType === 'culinary') {
            primaryDest = 'Japan';
            secondaryDest = 'France';
        } else if (destType === 'historical') {
            primaryDest = 'France';
            secondaryDest = 'United Kingdom';
        } else {
            primaryDest = 'Japan';
            secondaryDest = 'Switzerland';
        }
        flightCost = Math.round(budgetNum * 0.3);
        dailyCost = 150;
    }
    
    stayLength = Math.floor((budgetNum - flightCost) / (dailyCost * 1.5));
    
    const accommodationCost = Math.round(dailyCost * 0.4 * stayLength);
    const foodCost = Math.round(dailyCost * 0.3 * stayLength);
    const activitiesCost = Math.round(dailyCost * 0.2 * stayLength);
    const transportCost = Math.round(dailyCost * 0.1 * stayLength);
    
    const totalCost = flightCost + accommodationCost + foodCost + activitiesCost + transportCost;
    const remaining = budgetNum - totalCost;
    
    let html = `
        <div class="recommendation">
            <div class="destination">Top Recommendation: ${primaryDest}</div>
            <div class="details">
                <p>Based on your preference for ${destType} experiences, ${primaryDest} offers an excellent 
                destination within your budget of $${budget}.</p>
                
                <p><strong>Suggested ${stayLength}-day Itinerary:</strong><br>
                • Days 1-2: Arrival and exploring the main attractions<br>
                • Days 3-${Math.floor(stayLength/2)}: ${getItineraryText(destType, primaryDest)}<br>
                • Days ${Math.floor(stayLength/2)+1}-${stayLength}: ${getItineraryEndText(destType, primaryDest)}</p>
                
                <p><strong>Budget Breakdown:</strong><br>
                • Flights: $${flightCost}<br>
                • Accommodation: $${accommodationCost}<br>
                • Food: $${foodCost}<br>
                • Activities: $${activitiesCost}<br>
                • Local Transport: $${transportCost}<br>
                • Remaining/Contingency: $${remaining}</p>
            </div>
        </div>
        
        <div class="recommendation">
            <div class="destination">Alternative: ${secondaryDest}</div>
            <div class="details">
                <p>${secondaryDest} is another excellent option that fits your preferences and budget.
                This destination offers similar ${destType} experiences but with a different cultural atmosphere.</p>
            </div>
        </div>
    `;
    
    resultBox.innerHTML = html;
}

function getItineraryText(type, destination) {
    const options = {
        'beach': {
            'Thailand': 'Island hopping to Phi Phi Islands and Phuket',
            'Greece': 'Exploring the beaches of Santorini and Mykonos',
            'Maldives': 'Snorkeling in coral reefs and relaxing on private beaches',
            'Vietnam': 'Enjoying Ha Long Bay and coastal villages',
            'Portugal': 'Visiting the Algarve coast and water activities',
            'Australia': 'Exploring the Great Barrier Reef and coastal drives',
            'default': 'Beach relaxation and water activities'
        },
        'nature': {
            'Nepal': 'Trekking in the Himalayas and visiting mountain villages',
            'Costa Rica': 'Exploring rainforests and wildlife watching',
            'New Zealand': 'Hiking through national parks and scenic drives',
            'Colombia': 'Visiting coffee regions and natural reserves',
            'Iceland': 'Glacier tours and exploring volcanic landscapes',
            'default': 'Nature hikes and outdoor adventures'
        },
        'culinary': {
            'Vietnam': 'Street food tours and cooking classes',
            'Italy': 'Pasta making classes and vineyard tours',
            'Japan': 'Sushi experiences and local market visits',
            'Mexico': 'Market tours and regional cuisine tastings',
            'France': 'Wine tasting and gourmet food experiences',
            'default': 'Food tours and local cuisine experiences'
        },
        'historical': {
            'Turkey': 'Exploring ancient ruins and historical sites in Istanbul',
            'Italy': 'Visiting Rome\'s ancient sites and Pompeii',
            'France': 'Exploring Parisian landmarks and Loire Valley castles',
            'Egypt': 'Discovering pyramids and ancient temples',
            'Greece': 'Touring the Acropolis and ancient Greek ruins',
            'United Kingdom': 'Visiting castles and historical museums',
            'default': 'Historical site visits and cultural immersion'
        },
        'cultural': {
            'Thailand': 'Temple visits and cultural experiences',
            'Spain': 'Exploring Barcelona\'s architecture and Madrid\'s museums',
            'Japan': 'Temple visits and traditional experiences',
            'Mexico': 'Ancient ruins and cultural festivals',
            'Switzerland': 'Village exploration and mountainside culture',
            'default': 'Cultural landmarks and local experiences'
        }
    };
    
    return options[type][destination] || options[type]['default'];
}

function getItineraryEndText(type, destination) {
    const options = {
        'beach': 'Relaxation and final beach experiences',
        'nature': 'Final hikes and nature photography',
        'culinary': 'Final food tastings and bringing home local ingredients',
        'historical': 'Museum visits and final historical explorations',
        'cultural': 'Shopping for souvenirs and farewell cultural experiences'
    };
    
    return options[type];
} 