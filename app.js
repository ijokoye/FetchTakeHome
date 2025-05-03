console.log("App is running");

const selectedDogs = new Set();


// Goals
// 1a. Log in to the API
// 1. Fetch activities from API
// 2. Display activities on the page
// 3. Allow user to select activities
// 4. Allow user to save selected activities
// 5. Allow user to view saved activities

// 1a. Log in to the API
fetch("https://frontend-take-home-service.fetch.com/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        name: 'ijeoma',
        email: 'ijeoma.okoye053@gmail.com'
    })
})
.then(response => {
    if (!response.ok) {
        throw new Error("Error logging in, check email and password");
    }
    console.log("Logged in successfully");
    // once logged in, we can use the response to fetch dog breeds
    // 1b. Fetch dog breeds
    // 1. Fetch activities from API, get dog
    return fetch("https://frontend-take-home-service.fetch.com/dogs/breeds", {
        method: "GET",
        credentials: "include",
    }); 

})
.then(response => {
    if (!response.ok) {
        throw new Error("Error fetching dog breeds");
    }
    return response.json();
})
.then(breeds => {
    // 1. Fetch dog breeds selection
    const breedSelect = document.getElementById("breed-select");

    breeds.forEach(breed => {
        const option = document.createElement("option");
        option.value = breed;
        option.textContent = breed;
        breedSelect.appendChild(option);
    });

    console.log("Dogs breeds include:", breeds);
    searchDogs({ sort: 'breed:asc' });
    // // 2. Display activities on the page
    // const activitiesListContainer = document.getElementById("activities-list");
    // activitiesListContainer.innerHTML = ""; // clear the container before adding new items
    // // loop through the data and create a list item for each activity
    // breeds.forEach(breed => {
    //     const breedDiv = document.createElement("div");
    //     breedDiv.className = "activity-item";
    //     breedDiv.textContent = breed;
    //     activitiesListContainer.appendChild(breedDiv);
    // });

    
})
// searchDogs({
//     breeds: ['Golden Retriever'],
//     zipCodes: ['10001'],
//     ageMin: 1,
//     ageMax: 5,
//     size: 5,
//     sort: 'age:asc'
// })
.catch(error => {
    console.error("Error:", error);
}
);

let currentSearchState = {
    breeds: [],
    zipCodes: [],
    ageMin: null,
    ageMax: null,
    size: 25,
    sort: 'breed:asc',
    from: null // Pagination cursor
};

function searchDogs({
    breeds = [],
    zipCodes = [],
    ageMin = null,
    ageMax = null,
    size = 25,
    sort = 'breed:asc',
    from = null
} = {}) {
    // Save search state for pagination
    currentSearchState = { breeds, zipCodes, ageMin, ageMax, size, sort, from };

    const params = new URLSearchParams();
    breeds.forEach(breed => params.append('breeds', breed));
    zipCodes.forEach(zip => params.append('zipCodes', zip));
    if (ageMin !== null) params.append('ageMin', ageMin);
    if (ageMax !== null) params.append('ageMax', ageMax);
    params.append('size', size);
    if (sort) params.append('sort', sort);
    if (from) params.append('from', from); // Add pagination cursor

    const query = params.toString();

    fetch(`https://frontend-take-home-service.fetch.com/dogs/search?${query}`, {
        method: 'GET',
        credentials: 'include'
    })
    .then(res => {
        if (!res.ok) throw new Error('Dog search failed');
        return res.json();
    })
    .then(searchData => {
        // const zipCodes = zipCodes; // still available from closure
        // Save next/prev for button actions
        updatePaginationControls(searchData.next, searchData.prev);

        return fetch('https://frontend-take-home-service.fetch.com/dogs', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(searchData.resultIds)
        });
    })
    .then(res => res.json())
    .then(dogs => {
        const list = document.getElementById('activities-list');
        list.innerHTML = '';

        dogs.forEach(dog => {
            const div = document.createElement('div');
            div.className = 'activity-item';
        
            // 🐶 Image
            const img = document.createElement('img');
            img.src = dog.img;
            img.alt = dog.name;
            img.className = 'dog-image'; // add a CSS class for styling
            div.appendChild(img);
        
            // 📋 Info text
            const info = document.createElement('p');
            info.textContent = `${dog.name} — ${dog.breed}, ${dog.age} yrs`;
            div.appendChild(info);

             // Restore previously selected state
            if (selectedDogs.has(dog.id)) {
                div.classList.add('selected');
            }
        
            // 🖱️ Selection toggle
            div.addEventListener('click', () => {
                if (selectedDogs.has(dog.id)) {
                    selectedDogs.delete(dog.id);
                    div.classList.remove('selected');
                } else {
                    selectedDogs.add(dog.id);
                    div.classList.add('selected');
                }
                console.log("Selected dogs:", Array.from(selectedDogs));
            });
        
            list.appendChild(div);
        });

        // dogs.forEach(dog => {
        //     const div = document.createElement('div');
        //     div.className = 'activity-item';
        //     div.textContent = `${dog.name} — ${dog.breed}, ${dog.age} yrs, Zip: ${dog.zipCode}`;

        //     div.addEventListener('click', () => {
        //         if (selectedDogs.has(dog.id)) {
        //             selectedDogs.delete(dog.id);
        //             div.classList.remove('selected');
        //         } else {
        //             selectedDogs.add(dog.id);
        //             div.classList.add('selected');
        //         }
        //         console.log("Selected dogs:", Array.from(selectedDogs));
        //     });

        //     list.appendChild(div);
        // });
    })
    .catch(err => console.error('Error during dog search:', err));
}


// // search for dogs
// function searchDogs({
//     breeds = [],
//     zipCodes = [],
//     ageMin = null,
//     ageMax = null,
//     size = 25,
//     sort = 'age:asc'
// } = {}) {
//     console.log("Searching for dogs...");

//     // Build the query string
//     const params = new URLSearchParams();

//     // Add array parameters
//     breeds.forEach(breed => params.append('breeds', breed));
//     zipCodes.forEach(zip => params.append('zipCodes', zip));

//     // Add scalar parameters
//     if (ageMin !== null) params.append('ageMin', ageMin);
//     if (ageMax !== null) params.append('ageMax', ageMax);
//     params.append('size', size);
//     if (sort) params.append('sort', sort);

//     const query = params.toString();

//     // Step 1: Search dogs
//     fetch(`https://frontend-take-home-service.fetch.com/dogs/search?${query}`, {
//         method: 'GET',
//         credentials: 'include'
//     })
//     .then(res => {
//         if (!res.ok) throw new Error('Dog search failed');
//         return res.json();
//     })
//     .then(searchData => {
//         console.log("Search returned IDs:", searchData.resultIds);

//         // Step 2: Use POST /dogs to get full dog details
//         return fetch('https://frontend-take-home-service.fetch.com/dogs', {
//             method: 'POST',
//             credentials: 'include',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(searchData.resultIds)
//         });
//     })
//     .then(res => {
//         if (!res.ok) throw new Error('Failed to fetch dog details');
//         return res.json();
//     })
//     .then(dogs => {
//         console.log("Dog objects:", dogs);

//         // Step 3: Display dog cards
//         const list = document.getElementById('activities-list');
//         list.innerHTML = ''; // Clear existing

//         // const selectedDogs = new Set();
//         // Create a div for each dog

//         dogs.forEach(dog => {
//             const div = document.createElement('div');
//             div.className = 'activity-item';
//             div.textContent = `${dog.name} — ${dog.breed}, ${dog.age} yrs, Zip: ${dog.zipCode}`;

            
//             // make it selectable
//             div.addEventListener('click', () => {
//                 if (selectedDogs.has(dog.id)) {
//                     selectedDogs.delete(dog.id);
//                     div.classList.remove('selected');
//                 } else {
//                     selectedDogs.add(dog.id);
//                     div.classList.add('selected');
//                 }
//                 console.log("Selected dogs:", Array.from(selectedDogs));
            
//         });
//         list.appendChild(div);
//     });
// })
// .catch(err => {
//     console.error('Error during dog search:', err);
// });
// }

document.getElementById("zip-search-button").addEventListener("click", function () {
    const zipInput = document.getElementById("zip-input").value.trim();

    // Handle multiple comma-separated ZIPs
    const zipCodes = zipInput
        .split(',')
        .map(zip => zip.trim())
        .filter(zip => zip !== '');

    // Combine with other active filters if desired
    const selectedBreed = document.getElementById("breed-select").value;
    const selectedSort = document.getElementById("sort-select").value;

    searchDogs({
        breeds: selectedBreed ? [selectedBreed] : [],
        zipCodes: zipCodes,
        sort: selectedSort
    });
});



// Event listener for the search button
document.getElementById('sort-select').addEventListener('change', (event) => {
    const sortValue = event.target.value;

    // You can add additional filters here later
    searchDogs({ sort: sortValue });
});

document.getElementById("breed-select").addEventListener("change", function (event) {
    const selected = event.target.value;

    if (selected === "") {
        // No filter: show all breeds
        searchDogs({ sort: 'breed:asc' });
    } else {
        searchDogs({ breeds: [selected], sort: 'breed:asc' });
    }
});


// Fetch location details
// This function fetches location details based on the provided zip codes
// and displays them in the activities-details div.
function fetchLocationDetails(zipCodes = []) {
    fetch('https://frontend-take-home-service.fetch.com/locations', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(zipCodes)
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to fetch location details");
        return res.json();
    })
    .then(locations => {
        console.log("Location details:", locations);

        const detailsDiv = document.getElementById("activities-details");
        detailsDiv.innerHTML = "<h3>ZIP Code Lookup</h3>";

        locations.forEach(loc => {
            const locInfo = document.createElement("p");
            locInfo.textContent = `${loc.zipCode} — ${loc.city}, ${loc.state}`;
            detailsDiv.appendChild(locInfo);
        });
    })
    .catch(err => {
        console.error("Location lookup failed:", err);
    });
}

// Search for locations by city name
function searchLocationsByCity(cityName) {
    fetch('https://frontend-take-home-service.fetch.com/locations/search', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            city: cityName,
            size: 10
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to search locations");
        return res.json();
    })
    .then(data => {
        console.log(`ZIP codes in ${cityName}:`, data.results);

        const resultsDiv = document.getElementById("activities-details");
        resultsDiv.innerHTML = `<h3>ZIPs in ${cityName}</h3>`;

        data.results.forEach(loc => {
            const zipEl = document.createElement("p");
            zipEl.textContent = `${loc.city}, ${loc.state} — ${loc.zipCode}`;
            resultsDiv.appendChild(zipEl);
        });
    })
    .catch(err => {
        console.error("Location search failed:", err);
    });
}





// Match button logic
document.getElementById('match-button').addEventListener('click', () => {
    if (selectedDogs.size === 0) {
        alert("Please select at least one dog.");
        return;
    }

    fetch('https://frontend-take-home-service.fetch.com/dogs/match', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify([...selectedDogs])
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to match.");
        return res.json();
    })
    .then(matchData => {
        console.log("Match:", matchData);
        const matchId = matchData.match;

        // Step: Fetch full details of matched dog
        return fetch('https://frontend-take-home-service.fetch.com/dogs', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([matchId])
        });
    })
    .then(res => res.json())
    .then(matchedDogs => {
        const match = matchedDogs[0]; // Only one result
        const detailsDiv = document.getElementById('activities-details');
        detailsDiv.innerHTML = `
            <h3>Your Match:</h3>
            <p><strong>${match.name}</strong> — ${match.breed}, ${match.age} yrs</p>
        `;
    })
    .catch(err => {
        console.error("Error finding match:", err);
        alert("Could not find a match.");
    });
});

function updatePaginationControls(nextCursor, prevCursor) {
    const nextBtn = document.getElementById('next-button');
    const prevBtn = document.getElementById('prev-button');

    nextBtn.disabled = !nextCursor;
    prevBtn.disabled = !prevCursor;

    nextBtn.onclick = () => {
        searchDogs({ ...currentSearchState, from: getCursorValue(nextCursor) });
    };

    prevBtn.onclick = () => {
        searchDogs({ ...currentSearchState, from: getCursorValue(prevCursor) });
    };
}

// Helper to pull just the cursor portion
function getCursorValue(queryString) {
    const params = new URLSearchParams(queryString);
    return params.get('from');
}



