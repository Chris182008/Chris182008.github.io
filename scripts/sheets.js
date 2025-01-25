const SHEET_ID = '156eHaMBE_br6qZrVZ22HrvS4SFmBwBu13xd0MFkPMZM';

// Use the public CSV URL instead of API
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

// Fetch and parse the CSV data
async function fetchRideData() {
    try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        const data = parseCSV(csvText);
        updateRideCards(data);
    } catch (error) {
        console.error('Error fetching ride data:', error);
        handleError();
    }
}

// Simple CSV parser
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row = {};
        headers.forEach((header, i) => {
            row[header] = values[i];
        });
        return row;
    });
}

// Update the ride cards with the fetched data
function updateRideCards(rideData) {
    rideData.forEach(ride => {
        const card = document.querySelector(`[href*="${ride.id}"]`);
        if (!card) return;

        const statusBadge = card.querySelector('.status-badge');
        const waitTime = card.querySelector('.wait-time');
        
        if (statusBadge) {
            statusBadge.className = `status-badge ${ride.status.toLowerCase()}`;
            statusBadge.textContent = ride.status;
        }
        
        if (waitTime) {
            waitTime.textContent = ride.status === 'Open' ? 
                `Wait: ${ride.wait} min` : 
                ride.message || 'Temporarily Closed';
        }
    });
}

// Handle errors by showing offline status
function handleError() {
    document.querySelectorAll('.status-badge').forEach(badge => {
        badge.className = 'status-badge error';
        badge.textContent = 'Offline';
    });
}

// Start fetching data when page loads
fetchRideData();

// Refresh data every minute
setInterval(fetchRideData, 60000);














