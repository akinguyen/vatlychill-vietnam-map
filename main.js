// Hàm để cập nhật mảng dữ liệu khi checkbox thay đổi
let selectedYears = [];
let selectedMissions = [];
let deckInstance;

function showLoading() {
    document.getElementById('loading-screen').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-screen').style.display = 'none';
}

// Create the map and deck
async function createDeck(hexCounts) {
    // Define the H3 Hexagon Layer for deck.gl
    const h3Layer = new deck.H3HexagonLayer({
    id: 'H3HexagonLayer',
    data: hexCounts,
    getHexagon: d => d.h3_index,
    elevationScale: 60,
    getElevation: d => d.mission_count,
    pickable: true,
    extruded: true,
    coverage: 0.9,
    opacity: 0.3,
    getFillColor: d => [255, (1 - d.mission_count / 500) * 255, 0],
    });

    // Initialize the deck
    deckInstance = new deck.DeckGL({
    container: 'deck-container',
    mapboxApiAccessToken: 'pk.eyJ1IjoiZG5ndXllbjEyODkiLCJhIjoiY21hNGZndmxjMDZxbjJrcTlmNHdtOW9hdCJ9.kqsxO0y6E6VqgRxZgJ-4Kg',
    mapStyle: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    layers: [h3Layer],
    initialViewState: {
        latitude: 14,
        longitude: 106,
        zoom: 5,
        pitch: 50,
        bearing: 0
    },
    controller: true,
    getTooltip: ({object}) => object && {
        html: object.tooltip
    },
    });

}

document.getElementById('submit-btn').addEventListener('click', function() {
    if (selectedYears.length == 0 || selectedMissions.length == 0) {
    Swal.fire({
        title: 'Cần chọn ít nhất 1 năm và 1 loại nhiệm vụ 🤒',
        icon: 'warning',
        confirmButtonText: 'OK',
        customClass: {
        popup: 'custom-warning-swal'
        }
    });
    //alert("Cần chọn ít nhất 1 năm và 1 loại nhiệm vụ 🤒");
    return;
    }

    showLoading()

    const yearStr = selectedYears.join(',');
    const missionStr = selectedMissions.join(',');

    // Construct URL with query parameters
    
    const url = `https://flask-vlc-map.vercel.app/filter?years=${encodeURIComponent(yearStr)}&missions=${encodeURIComponent(missionStr)}`;
    //const url = `http://localhost:5000/filter?years=${encodeURIComponent(yearStr)}&missions=${encodeURIComponent(missionStr)}`;

    fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      return response.json(); // assuming the server returns JSON
    })
    .then(hexCounts => {
      const updatedH3Layer = new deck.H3HexagonLayer({
        id: 'H3HexagonLayer',
        data: hexCounts,
        getHexagon: d => d.h3_index,
        elevationScale: 60,
        getElevation: d => d.mission_count,
        pickable: true,
        extruded: true,
        coverage: 0.9,
        opacity: 0.3,
        getFillColor: d => [255, (1 - d.mission_count / 500) * 255, 0]
      });

      deckInstance.setProps({
          layers: [updatedH3Layer]
      });

      hideLoading()
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
})

// Hàm cập nhật mảng dữ liệu
function updateArray(checkboxes, selectedArray, isYear = false) {
    selectedArray.length = 0;  // Xóa dữ liệu cũ trong mảng
    checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
        let value = checkbox.value;
        // Nếu là mảng năm, chuyển giá trị thành số nguyên
        if (isYear) {
        selectedArray.push(parseInt(value));  // Chuyển đổi thành số nguyên
        } else {
        selectedArray.push(value);
        }
    }
    });
}

// Hàm xử lý chọn tất cả năm
document.getElementById('selectAllYears').addEventListener('change', function() {
    let checkboxes = document.querySelectorAll('.year-checkbox');
    checkboxes.forEach(checkbox => {
    checkbox.checked = this.checked;
    });
    updateArray(checkboxes, selectedYears, true);  // Chuyển đổi giá trị thành integer
});

// Hàm xử lý chọn tất cả nhiệm vụ
document.getElementById('selectAllMissions').addEventListener('change', function() {
    let checkboxes = document.querySelectorAll('.mission-checkbox');
    checkboxes.forEach(checkbox => {
    checkbox.checked = this.checked;
    });
    updateArray(checkboxes, selectedMissions);
});

// Hàm cập nhật khi các checkbox con thay đổi
document.querySelectorAll('.year-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
    updateArray(document.querySelectorAll('.year-checkbox'), selectedYears, true);  // Chuyển đổi giá trị thành integer
    });
});

document.querySelectorAll('.mission-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
    updateArray(document.querySelectorAll('.mission-checkbox'), selectedMissions);
    });
});

fetch('https://raw.githubusercontent.com/akinguyen/vatlychill-vietnam-map/refs/heads/main/initial_hex_counts.json') // adjust path as needed
.then(res => res.json())
.then(data => {
    // Fetch the initial data and create the map
    createDeck(data);
})

const filterOverlay = document.getElementById("filter-overlay");
const filterIconBtn = document.getElementById("filter-icon-btn");
const closeFilterBtn = document.getElementById("close-filter-btn");

closeFilterBtn.addEventListener("click", () => {
    filterOverlay.classList.add("hidden");
    filterIconBtn.classList.remove("hidden");
});

filterIconBtn.addEventListener("click", () => {
    filterOverlay.classList.remove("hidden");
    filterIconBtn.classList.add("hidden");
});