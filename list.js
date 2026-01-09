let hiraganaData = [];
let katakanaData = [];
let kanjiData = [];

async function loadAllListData() {
    const dataSources = {
        hiragana: 'data/hiragana.json',
        katakana: 'data/katakana.json',
        kanji: 'data/kanji.json'
    };

    try {
        const hiraganaResponse = await fetch(dataSources.hiragana);
        hiraganaData = await hiraganaResponse.json();
        const katakanaResponse = await fetch(dataSources.katakana);
        katakanaData = await katakanaResponse.json();
        const kanjiResponse = await fetch(dataSources.kanji);
        kanjiData = await kanjiResponse.json();
        return true; // Indicate success
    } catch (error) {
        console.error("Error loading list data:", error);
        alert("Failed to load character data for lists. Please check the console for more details.");
        return false; // Indicate failure
    }
}

function renderCharacterCards(characters, container, gridClass, type) {
    const gridDiv = document.createElement('div');
    gridDiv.className = `grid ${gridClass} gap-4 mb-4`; // Added mb-4 for spacing between groups

    characters.forEach(item => {
        const cardElement = document.createElement('div');
        cardElement.className = 'bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center';
        if (type === 'kanji') {
            cardElement.innerHTML = `<span class="text-4xl font-bold">${item.kanji}</span><span class="text-lg">${item.kana}</span><span class="text-sm text-gray-600">${item.meaning}</span>`;
        } else {
            cardElement.innerHTML = `<span class="text-4xl font-bold">${item.kana}</span><span class="text-lg">${item.romaji}</span>`;
        }
        gridDiv.appendChild(cardElement);
    });
    container.appendChild(gridDiv);
}

async function displayCharacterList() {
    const dataLoaded = await loadAllListData(); // Get success/failure status

    const listTitle = document.getElementById('list-title');
    const listContainer = document.getElementById('list-container');

    if (!dataLoaded) {
        // If data failed to load, display an error message and stop
        listTitle.textContent = 'Error Loading Data';
        listContainer.innerHTML = '<p class="text-xl mt-8 text-red-600">Failed to load character data. Please try again later or check your network connection.</p>';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const listType = urlParams.get('type');

    listContainer.innerHTML = ''; // Clear previous content

    // Define special groups for Hiragana and Katakana
    const specialRomajiGroups = [
        ['ya', 'yu', 'yo'],
        ['wa', 'wo', 'n'],
        ['kya', 'kyu', 'kyo'],
        ['sha', 'shu', 'sho'],
        ['cha', 'chu', 'cho'],
        ['nya', 'nyu', 'nyo'],
        ['hya', 'hyu', 'hyo'],
        ['mya', 'myu', 'myo'],
        ['rya', 'ryu', 'ryo'],
        ['gya', 'gyu', 'gyo'],
        ['ja', 'ju', 'jo'],
        ['bya', 'byu', 'byo'],
        ['pya', 'pyu', 'pyo']
    ];

    switch (listType) {
        case 'hiragana':
            listTitle.textContent = 'Hiragana List';
            if (hiraganaData.length === 0) {
                listContainer.innerHTML = '<p class="text-xl mt-8">No Hiragana data available.</p>';
                break;
            }

            let processedHiraganaRomaji = new Set();
            let specialHiraganaCharacters = [];
            let regularHiraganaCharacters = [];

            // Separate special groups from regular characters
            hiraganaData.forEach(item => {
                let isSpecial = false;
                for (const group of specialRomajiGroups) {
                    if (group.includes(item.romaji)) {
                        specialHiraganaCharacters.push(item);
                        processedHiraganaRomaji.add(item.romaji);
                        isSpecial = true;
                        break;
                    }
                }
                if (!isSpecial) {
                    regularHiraganaCharacters.push(item);
                }
            });

            // Render regular characters first (standard 5-per-row)
            if (regularHiraganaCharacters.length > 0) {
                for (let i = 0; i < regularHiraganaCharacters.length; i += 5) {
                    const row = regularHiraganaCharacters.slice(i, i + 5);
                    renderCharacterCards(row, listContainer, 'grid-cols-5', 'hiragana');
                }
            }

            // Render special groups second
            if (specialHiraganaCharacters.length > 0) {
                // To ensure correct grouping and display, we'll re-process special groups
                // based on the original `specialRomajiGroups` definition.
                specialRomajiGroups.forEach(group => {
                    const charactersInGroup = specialHiraganaCharacters.filter(item => group.includes(item.romaji));
                    if (charactersInGroup.length > 0) {
                        renderCharacterCards(charactersInGroup, listContainer, `grid-cols-${charactersInGroup.length}`, 'hiragana');
                    }
                });
            }
            break;

        case 'katakana':
            listTitle.textContent = 'Katakana List';
            if (katakanaData.length === 0) {
                listContainer.innerHTML = '<p class="text-xl mt-8">No Katakana data available.</p>';
                break;
            }

            let processedKatakanaRomaji = new Set();
            let specialKatakanaCharacters = [];
            let regularKatakanaCharacters = [];

            // Separate special groups from regular characters
            katakanaData.forEach(item => {
                let isSpecial = false;
                for (const group of specialRomajiGroups) {
                    if (group.includes(item.romaji)) {
                        specialKatakanaCharacters.push(item);
                        processedKatakanaRomaji.add(item.romaji);
                        isSpecial = true;
                        break;
                    }
                }
                if (!isSpecial) {
                    regularKatakanaCharacters.push(item);
                }
            });

            // Render regular characters first (standard 5-per-row)
            if (regularKatakanaCharacters.length > 0) {
                for (let i = 0; i < regularKatakanaCharacters.length; i += 5) {
                    const row = regularKatakanaCharacters.slice(i, i + 5);
                    renderCharacterCards(row, listContainer, 'grid-cols-5', 'katakana');
                }
            }

            // Render special groups second
            if (specialKatakanaCharacters.length > 0) {
                // To ensure correct grouping and display, we'll re-process special groups
                // based on the original `specialRomajiGroups` definition.
                specialRomajiGroups.forEach(group => {
                    const charactersInGroup = specialKatakanaCharacters.filter(item => group.includes(item.romaji));
                    if (charactersInGroup.length > 0) {
                        renderCharacterCards(charactersInGroup, listContainer, `grid-cols-${charactersInGroup.length}`, 'katakana');
                    }
                });
            }
            break;

        case 'kanji':
            listTitle.textContent = 'Kanji List';
            if (kanjiData.length === 0) {
                listContainer.innerHTML = '<p class="text-xl mt-8">No Kanji data available.</p>';
                break;
            }
            const categories = {};

            // Group kanji by category
            kanjiData.forEach(item => {
                const category = item.category || "Uncategorized"; // Default to "Uncategorized" if no category
                if (!categories[category]) {
                    categories[category] = [];
                }
                categories[category].push(item);
            });

            // Display each category
            for (const categoryName in categories) {
                const categoryHeader = document.createElement('h3');
                categoryHeader.className = 'text-2xl font-semibold mt-6 mb-3 col-span-full';
                categoryHeader.textContent = categoryName;
                listContainer.appendChild(categoryHeader);

                // Render Kanji categories with grid-cols-5
                renderCharacterCards(categories[categoryName], listContainer, 'grid-cols-5', 'kanji');
            }
            break;
        default:
            listTitle.textContent = 'Select a List from the Menu';
            listContainer.innerHTML = '<p class="text-xl mt-8">Please choose Hiragana, Katakana, or Kanji from the navigation menu.</p>';
            break;
    }

    // Event listener for hamburger menu
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');

    if (hamburgerMenu && navMenu) {
        hamburgerMenu.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}