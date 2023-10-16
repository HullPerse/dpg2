function loadUser() {
    var path = location.pathname;
    var inventoryUser = path.slice(1);
    fetch("/getusers")
    .then ((response) => response.json())
    .then((userData) => {
        const user = userData.find((user) => user.username == inventoryUser);
        if (user) {
            const userItemText = document.getElementById("userItems-text");
            userItemText.innerHTML = `ДПГ &#10151; Инвентарь &#10151; ${user.username} &#10151; Предметы`;

            const addGameText = document.getElementById("addGame-text");
            addGameText.innerHTML = `ДПГ &#10151; Инвентарь &#10151; ${user.username} &#10151; Игры`;

            const moneyContainer = document.getElementById("moneyContainer");
            const moneyInput =  document.getElementById("moneyModalContainer");
            moneyContainer.innerHTML = `${user.money}`;
            moneyInput.value = user.money;
            getInventoryPicture(user.id);
            const userItemsImg = document.querySelectorAll(".user-items-img");
            const userItemsText = document.querySelectorAll(".user-items-text");

            for(i = 0; i < userItemsImg.length; i++) {
            userItemsImg[i].src = `img/items/${user["Item" + (i + 1)]}.png`;
            }

            fetch("/getjson2")
            .then((response) => response.json())
            .then((data) => {
                for(i = 0; i < userItemsText.length; i++) {
                    if(!data.Items[user["Item" + (i + 1)]].amount) {
                        data.Items[user["Item" + (i + 1)]].amount = "1";
                    }
                    
                    if(data.Items[user["Item" + (i + 1)]].name) {
                        userItemsText[i].innerHTML = `
                        <h4 class="currentUserItem"><span class="currentUserItemText" title="${data.Items[user["Item" + (i + 1)]].name}">${data.Items[user["Item" + (i + 1)]].name}</span></h4>
                        <h4 class="currentUserItemType">Тип: <span class="currentUserItemTypeText">${data.Items[user["Item" + (i + 1)]].type}</span></h4>
                        <h4 class="currentItemAmount">Заряды: <span class="currenItemAmountText">${data.Items[user["Item" + (i + 1)]].amount}</span></h4>
                        `;
                    } else if(!data.Items[user["Item" + (i + 1)]].name) {
                    userItemsText[i].innerHTML = ``;
                    }
                } 

                for(i = 0; i < userItemsText.length; i++) {
                const noType = document.querySelectorAll(".currentUserItemTypeText");
                if(noType[i]){
                    if(noType[i].textContent == "Бафф") {
                        noType[i].style.color = "var(--item-buff)"
                    } else if(noType[i].textContent == "Дебафф") {
                        noType[i].style.color = "var(--item-debuff)"
                    } else if(noType[i].textContent == "Нейтралка") {
                        noType[i].style.color = "var(--item-neutral)"
                    } else if(noType[i].textContent == "Ловушка" || noType[i].textContent == "Ловушка-Дебафф" || noType[i].textContent == "Ловушка-Нейтралка" ) {
                        noType[i].style.color = "var(--item-trap)"
                    }
                }
            }
        })
    }
});
userTableLoad();
}

function updateMoneyAmount() {
    var path = location.pathname;
    var inventoryUser = path.slice(1);
    username = inventoryUser;

    money = document.getElementById("moneyModalContainer").value;

    fetch(`/updatemoney/${username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ money }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('mapCell updated successfully:', data);
        })
        .catch((error) => {
          console.error('Error updating mapCell:', error);
        });
}

function changeItems(number) {
    const itemListSelection = document.querySelectorAll(".itemListSelection");
    const itemValue = itemListSelection[number].value;
    const itemDescriptionField = document.querySelectorAll(".itemListDescription");
    const itemImg = document.querySelectorAll(".itemImg");
    const itemType = document.querySelectorAll(".itemType");
    const itemAmount = document.querySelectorAll(".itemAmount");

    fetch("/getjson2")
        .then((response) => response.json())
        .then((data) => {
            itemDescriptionField[number].innerHTML = `<h4 class="descHeader">ОПИСАНИЕ:</h4><span class="descText">${data.Items[itemValue].description}</span>`;
            itemImg[number].src = `img/items/${data.Items[itemValue].id}.png`;

        if(data.Items[itemValue].type == "Бафф") {
            itemType[number].innerHTML = `${data.Items[itemValue].type}`;
            itemType[number].style.color = "var(--item-buff)"
        } else if(data.Items[itemValue].type == "Дебафф") {
            itemType[number].innerHTML = `${data.Items[itemValue].type}`;
            itemType[number].style.color = "var(--item-debuff)"
        } else if(data.Items[itemValue].type == "Нейтралка") {
            itemType[number].innerHTML = `${data.Items[itemValue].type}`;
            itemType[number].style.color = "var(--item-neutral)"
        } else if(data.Items[itemValue].type == "Ловушка" || data.Items[itemValue].type == "Ловушка-Дебафф" || data.Items[itemValue].type == "Ловушка-Нейтралка" ) {
            itemType[number].innerHTML = `${data.Items[itemValue].type}`;
            itemType[number].style.color = "var(--item-trap)"
        }

        if(data.Items[itemValue].amount) {
                itemAmount[number].innerHTML = `${data.Items[itemValue].amount}`;
            } else {
                itemAmount[number].innerHTML = "1";
            }
            
            if(data.Items[itemValue].id == 0) {
                itemDescriptionField[number].innerHTML = "";
                itemAmount[number].innerHTML = "";
                itemImg[number].src = "img/unnamed.png";
                itemType[number].innerHTML = "";
            }
            updateUserItems();
            
        });
}

function updateUserItems() {
    const itemListSelection = document.querySelectorAll(".itemListSelection");
    const path = location.pathname;
    const inventoryUser = path.slice(1);
    const updatedItems = {};

    for (let i = 0; i < itemListSelection.length; i++) {
        updatedItems[`Item${i + 1}`] = itemListSelection[i].value;
    }

    fetch(`/updateitems/${inventoryUser}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItems),
    })
    .then((response) => response.json())
    .then((data) => {
        console.log('Items updated successfully:', data);
    })
    .catch((error) => {
        console.error('Error updating items:', error);
    });
}

function getInventoryPicture(userId) {
    const profileAvatar = document.getElementById("profile-picture");

    fetch(`/getavatar/${userId}`)
        .then((response) => response.blob())
        .then((avatarBlob) => {
            const imageUrl = URL.createObjectURL(avatarBlob); 
            profileAvatar.src = imageUrl;
        })
        .catch((error) => {
            console.error("Error displaying user avatar:", error);
            const errorAvatar = "img/user-pfp.svg";
            profileAvatar.src = errorAvatar;
        });
}

function changeItemWindow() {
    const itemModalWindow = document.getElementById("itemModal");
    const updateButton = document.getElementById("saveButtonGame");

    if(itemModalWindow.style.display == "none") {
        itemModalWindow.style.display = "grid";
        updateButton.style.display = "block";

    } else {
        itemModalWindow.style.display = "none";
    }
}

let fullItemList = [];

function items() {
    fetch("/getjson2")
      .then((response) => response.json())
      .then((data) => {
        fullItemList = data.Items;
        itemSelection();
      })
}
items();

function itemSelection() {
    const itemListSelection = document.querySelectorAll(".itemListSelection");
    var path = location.pathname;
    var inventoryUser = path.slice(1);
    fetch("/getusers")
    .then ((response) => response.json())
    .then((userData) => {
        const user = userData.find((user) => user.username == inventoryUser);
        if (user) {
            for (let i = 0; i < itemListSelection.length; i++) {
            itemListSelection[i].innerHTML = '';

            fullItemList.forEach((item) => {
                const itemOption = document.createElement("option");
                itemOption.value = item.id;
                itemOption.text = item.name;
                itemListSelection[i].appendChild(itemOption);
          });
      
        fetch("/getjson2")
              .then((response) => response.json())
              .then((data) => {
         const itemListSelection = document.querySelectorAll(".itemListSelection");
         const itemDescriptionField = document.querySelectorAll(".itemListDescription");
         const itemImg = document.querySelectorAll(".itemImg");
         const itemType = document.querySelectorAll(".itemType");
         const itemAmount = document.querySelectorAll(".itemAmount");

         const userItems = [user["Item1"], user["Item2"], user["Item3"], user["Item4"], user["Item5"], user["Item6"]];
         const userItemValue = userItems[i];
 
         if (userItemValue) {
             itemListSelection[i].value = userItemValue;


          itemDescriptionField[i].innerHTML = `<h4 class="descHeader">ОПИСАНИЕ:</h4><span class="descText">${data.Items[itemListSelection[i].value].description}</span>`;
          itemImg[i].src = `img/items/${data.Items[itemListSelection[i].value].id}.png`;


          if(data.Items[itemListSelection[i].value].type == "Бафф") {
              itemType[i].innerHTML = `${data.Items[itemListSelection[i].value].type}`;
              itemType[i].style.color = "var(--item-buff)"
          } else if(data.Items[itemListSelection[i].value].type == "Дебафф") {
              itemType[i].innerHTML = `${data.Items[itemListSelection[i].value].type}`;
              itemType[i].style.color = "var(--item-debuff)"
          } else if(data.Items[itemListSelection[i].value].type == "Нейтралка") {
              itemType[i].innerHTML = `${data.Items[itemListSelection[i].value].type}`;
              itemType[i].style.color = "var(--item-neutral)"
          } else if(data.Items[itemListSelection[i].value].type == "Ловушка" || data.Items[itemListSelection[i].value].type == "Ловушка-Дебафф" || data.Items[itemListSelection[i].value].type == "Ловушка-Нейтралка" ) {
              itemType[i].innerHTML = `${data.Items[itemListSelection[i].value].type}`;
              itemType[i].style.color = "var(--item-trap)"
          }

          if(data.Items[itemListSelection[i].value].amount) {
                  itemAmount[i].innerHTML = `${data.Items[itemListSelection[i].value].amount}`;
              } else {
                  itemAmount[i].innerHTML = "1";
              }
              
              if(data.Items[itemListSelection[i].value].id == 0) {
                  itemDescriptionField[i].innerHTML = "";
                  itemAmount[i].innerHTML = "";
                  itemImg[i].src = "img/unnamed.png";
                  itemType[i].innerHTML = "";
                    }
                }
            })
        }}
    })
}

function userTableLoad() {
    const mainGameTable = document.getElementById("mainGameTable");
    fetch("/getgames")
        .then((response) => response.json())
        .then((gameData) => {
            var path = location.pathname;
            var inventoryUser = path.slice(1);

            gameData.forEach((game) => {
                if (game.gameUsername == inventoryUser) {
                    const gameTable = document.createElement("tr");

                    const gameCell = document.createElement("td");
                    gameCell.textContent = game.gameCell;
                    gameCell.classList.add("tdCell");
                    gameTable.appendChild(gameCell);

                    const gameTitle = document.createElement("td");
                    gameTitle.textContent = game.gameTitle;
                    gameTitle.classList.add("tdTitle");
                    gameTable.appendChild(gameTitle);

                    const gameStatus = document.createElement("td");
                    gameStatus.textContent = game.gameStatus;
                    gameStatus.classList.add("tdStatus");
                    gameTable.appendChild(gameStatus);
                    if (gameStatus.textContent == "ПРОЙДЕНО") {
                        gameStatus.style.color = "var(--game-finished)";
                    } else if (gameStatus.textContent == "В ПРОЦЕССЕ") {
                        gameStatus.style.color = "var(--game-process)";
                    } else if (gameStatus.textContent == "ДРОПНУТО") {
                        gameStatus.style.color = "var(--game-drop)";
                    }

                    const gameCommentary = document.createElement("td");
                    gameCommentary.textContent = game.gameCommentary;
                    gameCommentary.title = game.gameCommentary;
                    gameCommentary.classList.add("tdCommentary");
                    gameTable.appendChild(gameCommentary);

                    const gameId = game.gameId;

                    const settingButton = document.createElement("button");
                    settingButton.innerHTML = `<text>*</text>`;
                    settingButton.classList.add("gameSettings");
                    settingButton.style.display = "none";

                    if(inventoryUser == sessionStorage.getItem("Username")) {

                    gameTable.addEventListener("mouseenter", () => {
                        settingButton.style.display = "block";
                    });

                    gameTable.addEventListener("mouseleave", () => {
                        settingButton.style.display = "none";
                    });

                    settingButton.addEventListener("click", () => {
                        if(game.gameId) {
                            changeGameModal(gameId, gameCell.textContent, gameTitle.textContent, gameStatus.textContent, gameCommentary.textContent);
                        }
                        
                    });
                }

                    gameTable.appendChild(settingButton);

                    mainGameTable.appendChild(gameTable);
                }
            });
        });
}

function preventNonUser() {
    if(!inventoryUser == sessionStorage.getItem("Username")) {
        const userOptionButton = document.querySelectorAll(".user-options-button");



        userOptionButton[0].addEventListener("click", (e) => {
            e.preventDefault();
        });

        userOptionButton[3].addEventListener("click", (e) => {
            e.preventDefault();
        });

    }
}

function addGameModal() {
    const gameModal = document.getElementById("gameModal");
    var path = location.pathname;
    var inventoryUser = path.slice(1);

    if(inventoryUser == sessionStorage.getItem("Username")) {

    if(gameModal.style.display == "none") {
        gameModal.style.display = "grid";

        const gameTitleModal = document.getElementById("addGameTitle");
        const gameCellModal = document.getElementById("addGameCell");
        const gameStatusModal = document.getElementById("addGameStatus");
        const gameCommentaryModal = document.getElementById("addGameCommentary");
    
        
        gameTitleModal.value = "";
        gameCellModal.value = "";
        gameStatusModal.value = "";
        gameCommentaryModal.value = "";

        const addGameStatus = document.getElementById("addGameStatus");
        addGameStatus.innerHTML = "";
    
        let statusArray = ["", "В ПРОЦЕССЕ", "ПРОЙДЕНО", "ДРОПНУТО"];   
        
        for (let i = 0; i < statusArray.length; i++) {
    
                const statusOption = document.createElement("option");
    
                statusOption.value = statusArray[i];
                statusOption.text = statusArray[i];
                addGameStatus.appendChild(statusOption);
        } 
    } else {
        gameModal.style.display = "none";
    }}
}

function changeGameModal(gameId, gameCell, gameTitle, gameStatus, gameCommentary) {
    const gameModal = document.getElementById("gameModal"); 
    const gameTitleModal = document.getElementById("addGameTitle");
    const gameCellModal = document.getElementById("addGameCell");
    const gameStatusModal = document.getElementById("addGameStatus");
    const gameCommentaryModal = document.getElementById("addGameCommentary");
    const updateButton = document.getElementById("saveButtonGame");

    let statusArray = ["", "В ПРОЦЕССЕ", "ПРОЙДЕНО", "ДРОПНУТО"];   
    
    for (let i = 0; i < statusArray.length; i++) {

            const statusOption = document.createElement("option");

            statusOption.value = statusArray[i];
            statusOption.text = statusArray[i];
            gameStatusModal.appendChild(statusOption);
    } 

    gameModal.style.display = "grid";
    updateButton.style.display = "none";

    const updateButtonGame = document.createElement("button");
    updateButtonGame.classList.add("saveButton");
    updateButtonGame.setAttribute("id", "updateGameButton");
    updateButtonGame.innerText = "СОХРАНИТЬ";
    gameModal.appendChild(updateButtonGame);

    const deleteButtonGame = document.createElement("button");
    const imgElement = document.createElement("img");

    deleteButtonGame.classList.add("deleteButton");
    imgElement.src = "img/trashcan.svg";
    imgElement.draggable = false;
    
    deleteButtonGame.appendChild(imgElement);
    gameModal.appendChild(deleteButtonGame);

    gameTitleModal.value = gameTitle;
    gameCellModal.value = gameCell;
    gameStatusModal.value = gameStatus;
    gameCommentaryModal.value = gameCommentary;


    updateButtonGame.addEventListener("click", () => {
        updateGame(gameId, gameTitleModal.value, gameCellModal.value, gameStatusModal.value, gameCommentaryModal.value)
    });

    deleteButtonGame.addEventListener("click", () => {
        deleteGame(gameId);
    });
}

function updateGame(gameId, gameTitle, gameCell, gameStatus, gameCommentary) {
    fetch(`/updategame/${gameId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameTitle, gameCell, gameStatus, gameCommentary }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('game updated successfully:', data);
          window.location.reload();
        })
        .catch((error) => {
          console.error('Error updating game:', error);
        });
}

function deleteGame(gameId) {
    fetch(`/deletegame/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('game deleted successfully:', data);
          window.location.reload();
        })
        .catch((error) => {
          console.error('Error deleting game:', error);
        });
}

function addGame() {
    const addGameTitle = document.getElementById("addGameTitle").value;
    const addGameCell = document.getElementById("addGameCell").value;
    const addGameStatusValue = document.getElementById("addGameStatus").value;
    const addGameCommentary = document.getElementById("addGameCommentary").value;

        if (addGameTitle && addGameCell && addGameStatusValue) {
            adduserGame(addGameCell, addGameTitle, addGameStatusValue, addGameCommentary);
        } else {
            console.log("Not every value has been selected")
    }
}

function adduserGame(addGameCell, addGameTitle, addGameStatusValue, addGameCommentary) {
    var path = location.pathname;
    var inventoryUser = path.slice(1);
    
    const gameData = {
        gameUsername: inventoryUser,
        gameCell: addGameCell,
        gameTitle: addGameTitle,
        gameStatus: addGameStatusValue,
        gameCommentary: addGameCommentary
    };

    fetch('/addgame', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(gameData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Game added:', data);
        window.location.reload();
    })
    .catch(error => console.error('Error adding game:', error));
}

function openUserModal() {
    const userModalContainer = document.getElementById("userModalContainer");

    if(userModalContainer.style.display == "none") {
        userModalContainer.style.display = "grid"

        fetch("/getusers")
        .then((response) => response.json())
        .then((userData) => {
            userData.forEach((user) => {
                const userModalAvatar = document.createElement("div");
                const userModalInfo = document.createElement("div");
                const userAvatar = document.createElement("img"); 

                userModalAvatar.classList.add("userModalAvatar");
                userModalInfo.classList.add("userModalInfo");
                userAvatar.classList.add("userAvatar");
                userAvatar.draggable = false;

                fetch(`/getavatar/${user.id}`)
                .then((response) => response.blob())
                .then((avatarBlob) => {
                    const imageUrl = URL.createObjectURL(avatarBlob); 
                    userAvatar.src = imageUrl;
                })
                .catch((error) => {
                    console.error("Error displaying user avatar:", error);
                    const errorAvatar = "img/user-pfp.svg";
                    userAvatar.src = errorAvatar;
                });

                userModalInfo.innerHTML = `
                <h1 class="modalUsername"><span class="currentUserItemText">${user.username}</span></h1>
                <h4 class="modalMoney">Чубрики: <span class="currentUserItemTypeText">${user.money}</span></h4>
                `;

                userAvatar.addEventListener('click', () => {
                    window.location.href = `${user.username}`;
                });

                userModalContainer.appendChild(userModalAvatar);
                userModalContainer.appendChild(userModalInfo);
                userModalAvatar.appendChild(userAvatar);
            });
        })
    } else {
        userModalContainer.style.display = "none";
        userModalContainer.innerHTML = "";
    }
}


function goToDashboard() {
    var path = location.pathname;
    var inventoryUser = path.slice(1);

    if(inventoryUser == "hullperse" && sessionStorage.getItem("Username") == "hullperse") {
        window.location.href = "dashboard";
    }
}

function loadUserTable() {
    fetch("/getusers")
    .then((response) => response.json())
    .then((userData) => {
        userData.forEach((user) => {
            const mainUserTable = document.getElementById("mainUserTable");

            const dashboardTable = document.createElement("tr");

            const userId = document.createElement("td");
            userId.textContent = user.id;
            userId.classList.add("tdId");
            dashboardTable.appendChild(userId);

            const username = document.createElement("td");
            username.textContent = user.username;
            username.classList.add("tdUsername");
            dashboardTable.appendChild(username);

            const userEvent = document.createElement("td");
            userEvent.textContent = user.event;
            userEvent.classList.add("tdEvent");
            dashboardTable.appendChild(userEvent);

            const userColor = document.createElement("td");
            userColor.textContent = user.color;
            userColor.classList.add("tdMisc");
            dashboardTable.appendChild(userColor);

            const userIsPlaced = document.createElement("td");
            userIsPlaced.textContent = user.isPlaced;
            userIsPlaced.classList.add("tdMisc");
            dashboardTable.appendChild(userIsPlaced);

            const userxPos = document.createElement("td");
            userxPos.textContent = user.xPos;
            userxPos.classList.add("tdMisc");
            dashboardTable.appendChild(userxPos);

            const useryPos = document.createElement("td");
            useryPos.textContent = user.yPos;
            useryPos.classList.add("tdMisc");
            dashboardTable.appendChild(useryPos);

            const userItem1 = document.createElement("td");
            userItem1.textContent = user.Item1;
            userItem1.classList.add("tdMisc");
            dashboardTable.appendChild(userItem1);
            
            const userItem2 = document.createElement("td");
            userItem2.textContent = user.Item2;
            userItem2.classList.add("tdMisc");
            dashboardTable.appendChild(userItem2);

            const userItem3 = document.createElement("td");
            userItem3.textContent = user.Item3;
            userItem3.classList.add("tdMisc");
            dashboardTable.appendChild(userItem3);

            const userItem4 = document.createElement("td");
            userItem4.textContent = user.Item4;
            userItem4.classList.add("tdMisc");
            dashboardTable.appendChild(userItem4);

            const userItem5 = document.createElement("td");
            userItem5.textContent = user.Item5;
            userItem5.classList.add("tdMisc");
            dashboardTable.appendChild(userItem5);

            const userItem6 = document.createElement("td");
            userItem6.textContent = user.Item6;
            userItem6.classList.add("tdMisc");
            dashboardTable.appendChild(userItem6);

            const userMoney = document.createElement("td");
            userMoney.textContent = user.money;
            userMoney.classList.add("tdMisc");
            dashboardTable.appendChild(userMoney);

            const settingButton = document.createElement("button");
            settingButton.innerHTML = `<text>*</text>`;
            settingButton.classList.add("gameSettings");
            settingButton.style.display = "none";
            dashboardTable.appendChild(settingButton);

            mainUserTable.addEventListener("mouseenter", () => {
                settingButton.style.display = "block";
            });

            mainUserTable.addEventListener("mouseleave", () => {
                settingButton.style.display = "none";
            });

            settingButton.addEventListener("click", () => {
                changeUserInfo(user.id, user.username, user.color, user.isPlaced, user.xPos, user.yPos, user.Item1, user.Item2, user.Item3, user.Item4, user.Item5, user.Item6, user.money, user.event);
            });

            mainUserTable.appendChild(dashboardTable);


        });
        const turnEventOn = document.getElementById("turnEventsOn");
        const turnEventOff = document.getElementById("turnEventsOff");

        turnEventOn.addEventListener("click", () => {
            userData.forEach((user) => {
                if(user.event == "none") {
                const event = "halloween";
                fetch(`/updateevents/${user.username}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ event }),
                })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Events updated successfully for user:", user.username, data);
                    window.location.reload();
                })
                .catch((error) => {
                    console.error("Error updating events for user:", user.username, error);
                });
            } else {
                console.log("event is already on");
            }
            });
        });
        turnEventOff.addEventListener("click", () => {
            userData.forEach((user) => {
                if(user.event == "halloween") {
                const event = "none";
                fetch(`/updateevents/${user.username}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ event }),
                })
                .then((response) => response.json())
                .then((data) => {
                    console.log("Events updated successfully for user:", user.username, data);
                    window.location.reload();
                })
                .catch((error) => {
                    console.error("Error updating events for user:", user.username, error);
                });
            } else {
                console.log("event is already off");
            }
            });
        });
    });
}

function changeUserInfo(id, username, color, isPlaced, xPos, yPos, Item1, Item2, Item3, Item4, Item5, Item6, money, event) {
    const body = document.querySelectorAll("body")[0];
    const dashboardModal = document.getElementById("userInfoModalContainer");
    dashboardModal.style.display = "grid";

    const userItemsText = document.createElement("a");
    userItemsText.setAttribute("id", "userItems-text");
    userItemsText.innerText = `ДПГ ➧ Панель управления ➧ ${username}「 ${id} 」`;
    dashboardModal.appendChild(userItemsText);

    const closeButton = document.createElement("button");
    closeButton.classList.add("closeButton");
    closeButton.innerText = "x";
    dashboardModal.appendChild(closeButton);

    const userColor = document.createElement("input");
    userColor.setAttribute("id", "colorPickerDashboard");
    userColor.setAttribute("type", "color");
    userColor.value = color;

    const userMoney = document.getElementById("userMoney");
    const userIsPlaced = document.getElementById("userIsPlaced");
    const userX = document.getElementById("userX");
    const userY = document.getElementById("userY");
    const userItem1 = document.getElementById("userItem1");
    const userItem2 = document.getElementById("userItem2");
    const userItem3 = document.getElementById("userItem3");
    const userItem4 = document.getElementById("userItem4");
    const userItem5 = document.getElementById("userItem5");
    const userItem6 = document.getElementById("userItem6");

    userMoney.value = money;
    userIsPlaced.value = isPlaced;
    userX.value = xPos;
    userY.value = yPos;
    userItem1.value = Item1;
    userItem2.value = Item2;
    userItem3.value = Item3;
    userItem4.value = Item4;
    userItem5.value = Item5;
    userItem6.value = Item6;

    closeButton.addEventListener("click", () => {
        updateUserData(username, userColor.value, userMoney.value, userIsPlaced.value, userX.value, userY.value, userItem1.value, userItem2.value, userItem3.value, userItem4.value, userItem5.value, userItem6.value);
        dashboardModal.style.display = "none";
    });

    dashboardModal.appendChild(userColor);

    body.appendChild(dashboardModal);
}

function updateUserData(username, color, money, isPlaced, xPos, yPos, Item1, Item2, Item3, Item4, Item5, Item6) {

    fetch(`/updateuserdashboard/${username}`, {
            method: "POST",
            headers : {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ color, money, isPlaced, xPos, yPos, Item1, Item2, Item3, Item4, Item5, Item6 } )
    })
    .then(response => response.json())
        .then(data => {
          console.log("Response from server:", data);
          window.location.reload();
        })
        .catch(error => console.error("Error:", error));
}