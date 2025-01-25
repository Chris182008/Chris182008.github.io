const SHEET_ID = '156eHaMBE_br6qZrVZ22HrvS4SFmBwBu13xd0MFkPMZM';

const SHEET_NAME = 'Sheet1!A1:D100'; // Updated to include wait time column

const API_KEY = 'AIzaSyApK2tjL0ik7XClSSkuKHus7usi57OlZp8';



async function fetchRideStatus() {

    console.log('Starting fetch...');

    

    document.querySelectorAll('.status-badge').forEach(badge => {

        badge.classList.add('loading');

        badge.textContent = 'Loading...';

    });



    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

    console.log('Fetching from URL:', url);

    

    try {

        const response = await fetch(url);

        console.log('Response status:', response.status);

        

        if (!response.ok) {

            const errorText = await response.text();

            console.error('Response error:', errorText);

            throw new Error(`HTTP error! status: ${response.status}`);

        }

        

        const data = await response.json();

        console.log('Received data:', data);

        

        if (!data.values) {

            console.error('No values in response:', data);

            throw new Error('No data found in sheet');

        }



        // Convert the response into a more usable format

        const rideStatus = {};

        data.values.slice(1).forEach((row, index) => {

            console.log(`Processing row ${index + 1}:`, row);

            if (row.length >= 2) {

                rideStatus[row[0]] = {

                    status: row[1].toUpperCase(),

                    waitTime: row[2] || '0',

                    lastUpdated: row[3] || new Date().toISOString()

                };

            }

        });

        

        console.log('Processed ride status:', rideStatus);

        updateRideStatuses(rideStatus);

        

        // Find and update individual ride status if on a ride page

        const rideStatusElement = document.getElementById('ride-status');

        const rideWaitTimeElement = document.getElementById('ride-wait-time');

        

        if (rideStatusElement && rideWaitTimeElement) {

            const rideName = document.querySelector('.ride-header h1').textContent;

            if (rideStatus[rideName]) {

                const status = rideStatus[rideName].status;

                const wait = rideStatus[rideName].waitTime;

                

                rideStatusElement.textContent = status;

                rideStatusElement.className = status.toLowerCase();

                

                if (status === 'OPEN') {

                    rideWaitTimeElement.textContent = wait === '0' ? 'No Wait' : `${wait} min`;

                } else {

                    rideWaitTimeElement.textContent = '-';

                }

            }

        }

        

    } catch (error) {

        console.error('Error fetching ride status:', error);

        const statusElements = document.querySelectorAll('#ride-status');

        statusElements.forEach(element => {

            element.textContent = 'Status Unavailable';

            element.className = 'error';

        });

    }

}



function updateRideStatuses(rideStatus) {

    console.log('Updating ride statuses...');

    const rideCards = document.querySelectorAll('.ride-card');

    

    rideCards.forEach(card => {

        const rideName = card.querySelector('h2').textContent;

        console.log('Processing ride:', rideName);

        

        const statusBadge = card.querySelector('.status-badge');

        const waitTime = card.querySelector('.wait-time');

        

        statusBadge.classList.remove('loading');

        

        if (rideStatus[rideName]) {

            console.log(`Found status for ${rideName}:`, rideStatus[rideName]);

            const status = rideStatus[rideName].status;

            const wait = rideStatus[rideName].waitTime;

            

            statusBadge.textContent = status;

            statusBadge.className = `status-badge ${status.toLowerCase()}`;

            

            // Update wait time based on status

            if (status === 'CLOSED' || status === 'MAINTENANCE') {

                waitTime.textContent = ''; // Leave blank for closed/maintenance

            } else if (status === 'OPEN') {

                if (wait === '0') {

                    waitTime.textContent = 'No Wait';

                } else {

                    waitTime.textContent = `Wait: ${wait} min`;

                }

            }

        } else {

            console.warn(`No status found for ride: ${rideName}`);

        }

    });

}



// Initial fetch

console.log('Starting initial fetch...');

fetchRideStatus();



// Update status every 5 minutes

setInterval(fetchRideStatus, 300000); 






