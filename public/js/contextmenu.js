function contextMenuLoad() {

  
  document.getElementById("context-menu-container").innerHTML = `
    <div class="context-menu" id="context-menu">
      <ul>
        <li id="userProfile">Мой Профиль</li>
        <li id="addPlayer"></li>
        </li>
        <li id="exit">Выйти</li>
      </ul>
    </div>
  `;
}

function addPlayerCondition() {
  if (sessionStorage.getItem("isPlaced") == "false") {
    document.getElementById("addPlayer").innerText = "Добавить себя";
  } else {
    document.getElementById("addPlayer").innerText = "Добавить себя";
    document.getElementById("addPlayer").style.color = "gray";
    document.getElementById("addPlayer").addEventListener("click", () => {
      console.log("User already added");
    });
  }
}


function showContextMenu(x, y) {
  const contextMenu = document.getElementById("context-menu");
  contextMenu.style.display = "block";
  contextMenu.style.left = x + "px";
  contextMenu.style.top = y + scrollY + "px";
  addPlayerCondition();
}

function hideContextMenu() {
  const contextMenu = document.getElementById("context-menu");
  contextMenu.style.display = "none";
}
contextMenuLoad();

document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
  showContextMenu(e.clientX, e.clientY);
});

document.addEventListener("click", function () {
  hideContextMenu();
});

document.getElementById("userProfile").addEventListener("click", function () {
  window.location.href = `${sessionStorage.getItem("Username")}`;
  hideContextMenu();
});

document.getElementById("addPlayer").addEventListener("click", function () {
  placePlayers();
  hideContextMenu();
});

document.getElementById("exit").addEventListener("click", function () {
  sessionStorage.removeItem("Username");
  sessionStorage.removeItem("CurrentId");
  sessionStorage.removeItem("UserColor");
  sessionStorage.removeItem("isPlaced");
  sessionStorage.removeItem("xPos");
  sessionStorage.removeItem("yPos");
  location.reload();
  hideContextMenu();
});
