let currentUser = sessionStorage.getItem("Username");


function dialogEvent() {
  var mapCell = document.getElementsByClassName("map-cell");

  for (var i = 0; i < mapCell.length; i++) {
    mapCell[i].addEventListener("click", function () {
      var dialogInfoId = this.innerText;
      openDialog();
      fetchAndPopulateData(dialogInfoId);
      updateCell(sessionStorage.getItem("CurrentId"), dialogInfoId);
      sessionStorage.setItem("mapCell", dialogInfoId);
    });
  }
}

function openDialog() {
  const dialog = document.getElementById("dialogMap");
  const scanner = document.getElementById("mainUI-scanner");
  
  if (!dialog.open) {
    dialog.showModal();
    scanner.style.backgroundColor = "var(--color3)";
    fetchAndPopulateData(sessionStorage.getItem("mapCell"))
  } else {
    dialog.close();
    scanner.style.backgroundColor = "";
  }

  dialog.addEventListener('cancel', () => {
    scanner.style.backgroundColor = "";
  });
}

function populateDialogWithInfo(dialog, info) {
  dialog.innerHTML = `
  <button class="closeButton" onclick="openDialog()">&times;</button>
  <p class="cellId">- ${info.id} -</p>
  <p class="cellTitle"><strong>${info.name}<strong></p>
  <p class="cellConditionTitle"><strong>Условия:</strong></p>
  <ul>
    ${Object.entries(info.conditions)
      .map(([key, value]) => `<li class="cellConditions">${key}: <span id="realCondition">${value}</span></li>`)
      .join("")}
  </ul>
  <p class="cellConditionTitle"><strong>Бонусы:</strong></p>
  <ul>
  ${Object.entries(info.Additional)
    .map(([key, value]) => `<li class="cellConditions">${key}: <span id="realCondition">${value}</span></li>`)
    .join("")}
  </ul>`;


  var titleColor = dialog.querySelector(".cellTitle");
  var idValue = parseInt(info.id);

  if (idValue >= 0 && idValue <= 30) {
    titleColor.style.color = "var(--difficulty-easy)";
  } else if (idValue >= 31 && idValue <= 60) {
    titleColor.style.color = "var(--difficulty-medium)";
  } else if (idValue >= 61 && idValue <= 80) {
    titleColor.style.color = "var(--difficulty-medium-hard)";
  } else if (idValue >= 81 && idValue <= 93) {
    titleColor.style.color = "var(--difficulty-hard)";
  } else if (idValue >= 94 && idValue <= 99) {
    titleColor.style.color = "var(--difficulty-hell)";
  } else if (idValue = 100) {
    titleColor.style.color = "var(--difficulty-core)";
  }
}

function fetchAndPopulateData(dialogInfoId) {
  fetch("/getjson1")
    .then(response => response.json())
    .then(data => {
      const info = data["Map"].find(item => item.id === parseInt(dialogInfoId));
      if (info) {
        const dialog = document.getElementById("dialogMap");
        populateDialogWithInfo(dialog, info);
      }
    })
    .catch(error => console.error("Error fetching JSON:", error));
}

function loadUI() {
  const images = document.querySelectorAll('img');

  images.forEach(image => {
      image.setAttribute('loading', 'lazy');
  });

  document.getElementById("mainUI-container").innerHTML = `
  <button id="mainUI-scanner" class="mainUI-buttons" onclick="openDialog()">
    <img class="mainUI-icon" src="img/1.svg" draggable="false" />
    <span class="tooltip">Сканер</span>
  </button>
  <button
    id="mainUI-map"
    class="mainUI-buttons"
    onclick="parent.location='map'"
  >
    <img class="mainUI-icon" src="img/2.svg" draggable="false" />
    <span class="tooltip">Карта</span>
  </button>
  <button id="mainUI-inventory" class="mainUI-buttons" onclick="parent.location='${currentUser}'">
    <img class="mainUI-icon" src="img/3.svg" draggable="false" />
    <span class="tooltip">Инвентарь</span>
  </button>
  <button id="mainUI-wheel" class="mainUI-buttons" onclick="parent.location='wheel'">
    <img class="mainUI-icon" src="img/4.svg" draggable="false" />
    <span class="tooltip">Колесо</span>
  </button>
  <button id="mainUI-dice" class="mainUI-buttons" onclick="diceModal()">
    <img class="mainUI-icon" src="img/5.svg" draggable="false" />
    <span class="tooltip">Кубик</span>
  </button>
  <button id="mainUI-rules" class="mainUI-buttons" onclick="parent.location='rules'">
    <img class="mainUI-icon" src="img/6.svg" draggable="false" />
    <span class="tooltip">Справка</span>
  </button>
  <div id="mainUI-pfp" class="mainUI-buttons">
    <img
    id="avatarImage"
      loading="lazy"
      src=""
      draggable="false"
    />
  </div>
</div>
  `;

var path = window.location.pathname;
var page = path.split("/").pop();
const mainUIicon = document.querySelectorAll(".mainUI-buttons");
const pageToIndexMap = {
  "map": 1,
  [currentUser]: 2,
  "wheel": 3,
  "rules": 5,
  "dashboard": 2
};

if (page in pageToIndexMap) {
  const index = pageToIndexMap[page];
  mainUIicon[index].style.backgroundColor = "var(--color3)";
  }
}

let clockInterval;

function updateClock() {
  var current = new Date();

  weekList = ["Воскресенье", "Понедельник","Вторник","Среда","Четверг","Пятница","Суббота"]
  monthList = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"]

  const timeContainer = document.getElementById("timeContainer");

  var Hour = current.getHours().toString().padStart(2, '0');
  var Minute = current.getMinutes().toString().padStart(2, '0');
  var Second = current.getSeconds().toString().padStart(2, '0');
  var WeekDay = current.getDay();
  var Month = current.getMonth();
  var Day = current.getDate().toString().padStart(2, '0');

timeContainer.innerHTML = `
<div id="currentTime">${Hour}:${Minute}:${Second}</div>
<div id="currentDate">${weekList[WeekDay]}, ${monthList[Month]} ${Day}</div>
`
}

function startClock() {
  updateClock();
  clearInterval(clockInterval);
  clockInterval = setInterval(updateClock, 1000);
};

function rollDice() {
  const diceSpan = document.getElementById("diceSpan");
  const maxRolls = 30;
  let rolls = 0;

  function displayRandomNumber() {
      const randomResult = Math.floor(Math.random() * 6) + 1;
      diceSpan.innerText = randomResult;

      rolls++;
      if (rolls < maxRolls) {
          setTimeout(displayRandomNumber, 100);
          clearTimeout(setTimeout(displayRandomNumber, 100));
      } else {
          diceSpan.innerText = Math.floor(Math.random() * 6) + 1;
      }
  }
  displayRandomNumber();
}

function diceModal() {
  const diceModal = document.getElementById("diceModal");
  const mainUIicon = document.querySelectorAll(".mainUI-buttons");

  if(diceModal.style.display == "none") {
      diceModal.style.display = "grid";
      mainUIicon[4].style.backgroundColor = "var(--color3)"
  } else {
      diceModal.style.display = "none"
      mainUIicon[4].style.backgroundColor = "var(--shadow-color)";
  }
}

function showCurrentEvent() {
  fetch("/getusers")
  .then((response) => response.json())
  .then((userData) => {
    userData.forEach((user) => {
      if(user.username == sessionStorage.getItem("Username") && user.event == "halloween") {
        const body = document.querySelectorAll("body")[0];

        const eventBg = document.createElement("div");
        eventBg.classList.add("eventBackground");
        
        const eventContainer  = document.createElement("div");
        eventContainer.classList.add("eventContainer");

        const closeButton = document.createElement("button");
        closeButton.classList.add("closeButton");
        closeButton.innerHTML = "&times;";
        eventContainer.appendChild(closeButton);

        const halloweenImgContainer = document.createElement("div");
        halloweenImgContainer.classList.add("halloweenImgContainer");
        halloweenImgContainer.innerHTML = `
        <img src="img/pumpkin.png" draggable="false" />
        <h3>БУУ... ВАС ПОСЕТИЛА ТЫКВА!!!</h3>
        <span>Вы можете пройти игру из пресета 'СЧАСТЛИВЫЙ БИЛЕТ'</span>
        <span>Если вы пройдете игру:</span>
        <span>Первым - получите предмет 'Пылесос'</span>
        <span>Не первым - получите 4 чубрика</span>
        `;
        eventContainer.appendChild(halloweenImgContainer);

        body.appendChild(eventBg);
        body.appendChild(eventContainer);

        closeButton.addEventListener("click", () => {
          const event = "none";
          fetch(`/updateevents/${sessionStorage.getItem("Username")}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ event }),
        })
        .then((response) => response.json())
        .then((data) => {
            console.log("Events updated successfully for user:", sessionStorage.getItem("Username"), data);
            window.location.reload();
        })
        .catch((error) => {
            console.error("Error updating events for user:", sessionStorage.getItem("Username"), error);
        });
        });
      }
    });
  })
}