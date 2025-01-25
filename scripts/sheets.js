const SHEET_ID = '156eHaMBE_br6qZrVZ22HrvS4SFmBwBu13xd0MFkPMZM';

// Use the direct published CSV URL
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTpBHp1Pyrq1mJRWHpTchs681Zrlrvj_HC-pxwsdcEZ-dmnN4ALFOeJV74Q9q9ZOxRJ5kPiE4eQvh4Y/pub?output=csv';

// Fetch and parse the CSV data
async function fetchRideData() {
    try {
        const response = await fetch(SHEET_URL);
        if (!response.ok) throw new Error('Network response was not ok');
        const csvText = await response.text();
        const data = parseCSV(csvText);
        
        // Check if we're on the main page or a ride detail page
        if (window.location.pathname.includes('/rides/')) {
            updateRideDetail(data);
        } else {
            updateRideCards(data);
        }
    } catch (error) {
        console.error('Error fetching ride data:', error);
        handleError();
    }
}

// Parse CSV based on actual sheet structure
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    return lines
        .slice(1) // Skip header row
        .map(line => {
            if (!line.trim()) return null; // Skip empty lines
            const [name, status, wait] = line.split(',').map(v => v.trim());
            return {
                id: name.toLowerCase().replace(/\s+/g, '-'), // "Spinning Coaster" -> "spinning-coaster"
                name: name,
                status: status || 'CLOSED',
                wait: wait || '0'
            };
        })
        .filter(ride => ride !== null);
}

// Update the ride cards on main page
function updateRideCards(rideData) {
    console.log('Updating cards with data:', rideData); // Debug log
    
    rideData.forEach(ride => {
        // Look for exact match in href
        const card = document.querySelector(`[href*="/${ride.id}.html"]`);
        if (!card) {
            console.log('Card not found for:', ride.id); // Debug log
            return;
        }

        const statusBadge = card.querySelector('.status-badge');
        const waitTime = card.querySelector('.wait-time');
        updateStatusElements(statusBadge, waitTime, ride);
    });
}

// Update individual ride detail page
function updateRideDetail(rideData) {
    // Get current ride name from URL
    const currentPath = window.location.pathname;
    const rideName = currentPath.split('/').pop().replace('.html', '');
    
    // Find matching ride data
    const ride = rideData.find(r => r.id === rideName);
    if (!ride) return;

    // Update status elements in ride detail page
    const statusElement = document.getElementById('ride-status');
    const waitTimeElement = document.getElementById('ride-wait-time');
    
    if (statusElement) {
        statusElement.textContent = ride.status;
        statusElement.className = ride.status.toLowerCase();
    }
    
    if (waitTimeElement) {
        switch(ride.status.toUpperCase()) {
            case 'OPEN':
                waitTimeElement.textContent = `${ride.wait} min`;
                break;
            case 'MAINTENANCE':
                waitTimeElement.textContent = 'Under Maintenance';
                break;
            case 'CLOSED':
                waitTimeElement.textContent = 'Temporarily Closed';
                break;
            default:
                waitTimeElement.textContent = 'Status Unknown';
        }
    }
}

// Common function to update status elements
function updateStatusElements(statusBadge, waitTime, ride) {
    if (statusBadge) {
        const status = ride.status.toLowerCase();
        statusBadge.className = `status-badge ${status}`;
        statusBadge.textContent = ride.status;
    }
    
    if (waitTime) {
        switch(ride.status.toUpperCase()) {
            case 'OPEN':
                waitTime.textContent = `Wait: ${ride.wait} min`;
                break;
            case 'MAINTENANCE':
                waitTime.textContent = 'Under Maintenance';
                break;
            case 'CLOSED':
                waitTime.textContent = 'Temporarily Closed';
                break;
            default:
                waitTime.textContent = 'Status Unknown';
        }
    }
}

// Handle errors by showing offline status
function handleError() {
    console.log('Error handler triggered'); // Debug log
    document.querySelectorAll('.status-badge').forEach(badge => {
        badge.className = 'status-badge error';
        badge.textContent = 'Offline';
    });
}

// Start fetching data when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initial fetch starting'); // Debug log
    fetchRideData();
    // Refresh data every minute
    setInterval(fetchRideData, 60000);
});














