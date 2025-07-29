ymaps.ready(init);

let map;
let placemark;

function init() {
    map = new ymaps.Map("map", {
        center: [55.0084, 82.9357], 
        zoom: 12,
        controls: [] 
    });

    loadHistory();

    document.getElementById('form').addEventListener('submit', function (e) {
        e.preventDefault();
        const address = document.getElementById('address').value.trim();
        if (address) {
            geocodeAddress(address);
            addToHistory(address);
        }
    });

    document.getElementById('open-history').addEventListener('click', () => {
        document.getElementById('history-modal').classList.remove('hidden');
    });

    document.getElementById('close-history').addEventListener('click', () => {
        document.getElementById('history-modal').classList.add('hidden');
    });

    document.getElementById('clear-history').addEventListener('click', () => {
        localStorage.removeItem('geocodeHistory');
        updateHistoryUI([]);
    });
}

function geocodeAddress(address) {
    ymaps.geocode(address, { results: 1 }).then(function (res) {
        let firstGeoObject = res.geoObjects.get(0);
        if (firstGeoObject) {
            let coords = firstGeoObject.geometry.getCoordinates();
            map.setCenter(coords, 15);
            if (placemark) map.geoObjects.remove(placemark);
            placemark = new ymaps.Placemark(coords, {
                hintContent: address,
                balloonContent: address
            });
            map.geoObjects.add(placemark);
        } else {
            alert('Адрес не найден');
        }
    }).catch(function (err) {
        alert('Ошибка геокодирования: ' + err.message);
    });
}

function addToHistory(address) {
    let history = JSON.parse(localStorage.getItem('geocodeHistory') || '[]');
    if (!history.includes(address)) {
        history.unshift(address);
        if (history.length > 10) history.pop();
        localStorage.setItem('geocodeHistory', JSON.stringify(history));
        updateHistoryUI();
    }
}

function loadHistory() {
    let history = JSON.parse(localStorage.getItem('geocodeHistory') || '[]');
    updateHistoryUI(history);
}

function updateHistoryUI(history = JSON.parse(localStorage.getItem('geocodeHistory') || '[]')) {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = '<li>История пуста</li>';
        return;
    }

    history.forEach(address => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = address;
        span.className = 'history-address';
        span.title = 'Нажмите, чтобы вставить адрес';

        span.addEventListener('click', () => {
            document.getElementById('address').value = address;
            document.getElementById('history-modal').classList.add('hidden');
        });

        li.appendChild(span);
        historyList.appendChild(li);
    });
}