let isRolling = false;

let stdSettings = {
  gameAmountSlider: 12,
  gamePreset: 0,
  gameCostMin: 0,
  gameCostMax: 5000,
  gameTimeMin: 0,
  gameTimeMax: 300,
  gameScoreMin: 0,
  gameScoreMax: 100,
  gameBeforeDate: "1900-01-01",
  gameAfterDate: "2023-12-31",
  tagsValue: false

}

function loadSettings() {
  const gameAmountSlide = document.getElementById("gameAmountSlider");
  const gamePresetSelection = document.getElementById("gamePresetSelection");
  const gameCostMaxRange = document.getElementById("gameCostMaxRange");
  const gameCostMinRange = document.getElementById("gameCostMinRange");
  const gameTimeMinRange = document.getElementById("gameTimeMinRange");
  const gameTimeMaxRange = document.getElementById("gameTimeMaxRange");
  const gameScoreMinRange = document.getElementById("gameScoreMinRange");
  const gameScoreMaxRange = document.getElementById("gameScoreMaxRange");
  const afterDate = document.getElementById("afterDate");
  const beforeDate = document.getElementById("beforeDate");
  const checkboxes = document.querySelectorAll(".checkbox");
  const selectedItemPreset = document.querySelectorAll('input[name="itemList"]:checked');

  gameAmountSlide.value = stdSettings.gameAmountSlider;
  gamePresetSelection.value = stdSettings.gamePreset;

  gameCostMinRange.value = stdSettings.gameCostMax;
  gameCostMaxRange.value = stdSettings.gameCostMin;

  gameTimeMinRange.value = stdSettings.gameTimeMax;
  gameTimeMaxRange.value = stdSettings.gameTimeMin;

  gameScoreMinRange.value = stdSettings.gameScoreMax;
  gameScoreMaxRange.value = stdSettings.gameScoreMin;

  afterDate.value =  stdSettings.gameAfterDate;
  beforeDate.value = stdSettings.gameBeforeDate;

  checkboxes.forEach(value => {
    value.checked = stdSettings.tagsValue;
  });

  selectedItemPreset.forEach(preset => {
    preset.checked = stdSettings.tagsValue;
  });

}

function openCase() {
  const gamePresetSelection = document.getElementById("gamePresetSelection");
  const randomArray = [];
  const presetArray = [];

  if (!isRolling) {
    isRolling = true;
    if (gamePresetSelection.value == 0) {
      getRandomGame(randomArray);
    } else {
      const finalValue = gamePresetSelection.value - 1;
      getPresetArray(finalValue, presetArray);
    }
  }
}


function getRandomGame(randomArray) {
  const gameAmountSlide = document.getElementById("gameAmountSlider").value;
  const gameCostMaxRange = document.getElementById("gameCostMaxRange").value;
  const gameCostMinRange = document.getElementById("gameCostMinRange").value;
  const gameTimeMinRange = document.getElementById("gameTimeMinRange").value;
  const gameTimeMaxRange = document.getElementById("gameTimeMaxRange").value;
  const gameScoreMinRange = document.getElementById("gameScoreMinRange").value;
  const gameScoreMaxRange = document.getElementById("gameScoreMaxRange").value;
  const afterDate = document.getElementById("afterDate").value;
  const beforeDate = document.getElementById("beforeDate").value;

  const checkboxes = document.querySelectorAll(".checkbox");
  const selectedTags = Array.from(checkboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);

  fetch("json/steamdb.json")
    .then((response) => response.json())
    .then((gameData) => {
      let i = 0;
      let foundItem = false;

      while (randomArray.length < gameAmountSlide && i < gameData.length) {
        const randomNumber = Math.floor(Math.random() * gameData.length);
        const game = gameData[randomNumber];

        let noTagsFilter = true;

        if (game.tags) {
          if (selectedTags.length > 0) {
            noTagsFilter = selectedTags.some(tag => game.tags.includes(tag));
          }
        } else {
          noTagsFilter = selectedTags.length === 0;
        }

        const costFilter = (
          (game.full_price / 100) >= (gameCostMaxRange / 30) &&
          (game.full_price / 100) <= (gameCostMinRange / 30)
        );
        const timeFilter = (
          game.hltb_single >= gameTimeMaxRange &&
          game.hltb_single <= gameTimeMinRange
        );
        const scoreFilter = (
          game.igdb_score >= gameScoreMaxRange &&
          game.igdb_score <= gameScoreMinRange
        );
        const dateFilter = (
          game.published_store >= beforeDate &&
          game.published_store <= afterDate
        );

        if (noTagsFilter && costFilter && timeFilter && scoreFilter && dateFilter) {
          randomArray.push(randomNumber);
          foundItem = true;
        }

        i += 1;
      }

      if (!foundItem) {
        noGamesModal();
        return;
      }

      const randomIndex = Math.floor(Math.random() * randomArray.length);
      insertGame(randomArray[randomIndex], randomArray);
      isRolling = false;
    });
}


function noGamesModal() {
  const noGamesModal = document.getElementById("noGamesModal");
  if(noGamesModal.style.display == "none") {
    noGamesModal.style.display = "grid";
  } else {
    noGamesModal.style.display = "none";
    window.location.reload();
  }
}


function containerSwitch() {
    const ItemContainer = document.getElementById("itemPage");
    const gameButton = document.getElementById("gameButton");
    const itemButton = document.getElementById("itemButton");

    if (ItemContainer.style.display == "grid") {
        gameButton.style.backgroundColor = "var(--color1)";
        itemButton.style.backgroundColor = "var(--color3)";
    } else {
        itemButton.style.backgroundColor = "var(--color1)";
        gameButton.style.backgroundColor = "var(--color3)"
    }
}

function insertGame(i, randomArray) {
  const gameImgSrc = document.getElementById("gameImgSrc");
  const gameName = document.getElementById("gameName");
  const gameDescription = document.getElementById("gameDescription");
  const gameMisc = document.getElementById("gameMisc");
  const gameHref = document.getElementById("gameHref");
  const mainGameName = document.getElementById("gameRollTitleContainer");
  const resultGameListEntity = document.getElementById("resultGameListEntity");

  resultGameListEntity.innerHTML = "";
  gameHref.innerHTML = "";

  fetch("json/steamdb.json")
    .then((response) => response.json())
    .then((gameData) => {

      randomArray.forEach((allData) => {
        const resultGameListImg = document.createElement("div");
        const resultGameListName = document.createElement("div");
        const resultGameListImgSrc = document.createElement("img");
  
        resultGameListImg.classList.add("resultGameListImg");
        resultGameListName.classList.add("resultGameListName");

        resultGameListImg.setAttribute("id", `${gameData[allData].name}`);
        resultGameListName.setAttribute("id", `${gameData[allData].name}`);
  
        resultGameListName.style.paddingLeft = "5px";
  
        resultGameListImgSrc.src = gameData[allData].image;
        resultGameListImgSrc.setAttribute("loading", "lazy");
        resultGameListImg.appendChild(resultGameListImgSrc);
  
        resultGameListName.innerText = gameData[allData].name;
        mainGameName.innerText = gameData[i].name;
  
        resultGameListImgSrc.addEventListener("mouseover", () => {
          resultGameListImg.style.borderColor = "var(--primary-accent)";
        });
  
        resultGameListImgSrc.addEventListener("mouseout", () => {
          if(resultGameListName.innerText == mainGameName.innerText) {
            resultGameListImg.style.borderColor = "#F0E27B";
          } else {
          resultGameListImg.style.borderColor = "var(--color1)";
          }
        });
  
        resultGameListImgSrc.addEventListener("click",() => {
  
        gameImgSrc.src = gameData[allData].image;
        gameName.innerText = gameData[allData].name;
  
  
      gameDescription.innerHTML = `
      <p>${gameData[allData].description}</p>
      <hr style="color: var(--color1)">
      `;
  
      gameMisc.innerHTML = `
      <p>Оценка:<span id="meta_uscore"> ${gameData[allData].igdb_score}</span></p>
      <p>Стоимость:<span id="full_price"> ${parseInt(gameData[allData].full_price / 100) * 40}</span>₽</p>
      <p>Жанр:<span id="genres"> ${gameData[allData].genres}</span></p>
      <p>Теги:<span id="tags"> ${gameData[allData].tags}</span></p>
      <p>Платформа:<span id="platforms"> ${gameData[allData].platforms}</span></p>
      <p>Время прохождения:<span id="hltb_single"> ${gameData[allData].hltb_single}</span> часов</p>
      `;
  
      if(gameData[allData].igdb_score == null) {
        document.getElementById("meta_uscore").innerText  = " ???";
      }
      if(gameData[allData].full_price == null) {
        document.getElementById("full_price").innerText  = " ???";
      }
      if(gameData[allData].genres == null) {
        document.getElementById("genres").innerText  = " ???";
      }
      if(gameData[allData].tags == null) {
        document.getElementById("tags").innerText  = " ???";
      }
      if(gameData[allData].platforms == null) {
        document.getElementById("platforms").innerText  = " ???";
      }
      if(gameData[allData].hltb_single == null) {
        document.getElementById("hltb_single").innerText  = " ???";
      }
    });
  
        resultGameListEntity.appendChild(resultGameListImg);
        resultGameListEntity.appendChild(resultGameListName);
      });

      const maxRolls = 30;
      let rolls = 0;

      function displayRandomGame() {
        const randomResult = Math.floor(Math.random() * randomArray.length);
  

        mainGameName.innerText = gameData[randomArray[randomResult]].name;
        gameName.innerText = mainGameName.innerText;
        gameImgSrc.src == gameData[randomArray[randomResult]].image;
        gameImgSrc.style.visibility = "hidden";

        rolls++;

        if (rolls < maxRolls) {
          setTimeout(displayRandomGame, 300);
        } else {
          const game = gameData.find((game) => game.name == mainGameName.innerText)


          if(game) {
            const resultGameListImg = document.querySelectorAll(".resultGameListImg");
            const resultGameListName = document.querySelectorAll(".resultGameListName");

            for(i = 0; i < resultGameListImg.length; i++) {
              if(resultGameListImg[i].getAttribute("id") == gameName.innerText) {
                resultGameListImg[i].style.borderColor = '#F0E27B';
                resultGameListName[i].style.color = '#F0E27B';
                resultGameListName[i].innerHTML = resultGameListName[i].innerText + "     &starf;";
              }
            }

            gameImgSrc.style.visibility = "visible";
            gameImgSrc.src = game.image;

            gameDescription.innerHTML = `
            <p>${game.description}</p>
            <hr style="color: var(--color1)">
            `;

          gameMisc.innerHTML = `
          <p>Оценка:<span id="meta_uscore"> ${game.igdb_score}</span></p>
          <p>Стоимость:<span id="full_price"> ${parseInt((game.full_price / 100) * 40)} ₽</span></p>
          <p>Жанр:<span id="genres"> ${game.genres}</span></p>
          <p>Теги:<span id="tags"> ${game.tags}</span></p>
          <p>Платформа:<span id="platforms"> ${game.platforms}</span></p>
          <p>Время прохождения:<span id="hltb_single"> ${game.hltb_single}</span> часов</p>
          `;

          if(game.igdb_score == null) {
            document.getElementById("meta_uscore").innerText  = " ???";
          }
          if(game.full_price == null) {
            document.getElementById("full_price").innerText  = " ???";
          }
          if(game.genres == null) {
            document.getElementById("genres").innerText  = " ???";
          }
          if(game.tags == null) {
            document.getElementById("tags").innerText  = " ???";
          }
          if(game.platforms == null) {
            document.getElementById("platforms").innerText  = " ???";
          }
          if(game.hltb_single == null) {
            document.getElementById("hltb_single").innerText  = " ???";
          }
      
          const steamHref = document.createElement("div");
          const hltbHref = document.createElement("div");
      
          steamHref.classList.add("steamHref");
          hltbHref.classList.add("hltbHref");
      
          steamHref.innerHTML = "<span>STEAM</span>";
          hltbHref.innerHTML = "<span>HLTB</span>";
      
          gameHref.appendChild(steamHref);
          gameHref.appendChild(hltbHref);
      
            steamHref.addEventListener("click", () => {
              if (game.store_url) {
              window.open(game.store_url, "_blank");
            } else {
              window.open("https://store.steampowered.com", "_blank");
            }
          });
        
            hltbHref.addEventListener("click", () => {
              if (game.hltb_url) {
              window.open(game.hltb_url, "_blank");
            } else {
              window.open("https://howlongtobeat.com/", "_blank");
            }
          });
          }     
        }
      }
      displayRandomGame();
    });
  }


function dropdownGenres(){
  const dropdownContent = document.querySelector(".dropdown-content");
  if (dropdownContent.style.display == "grid") {
    dropdownContent.style.display = "none";
  } else {
    dropdownContent.style.display ="grid";
  }
}

function gameAmountSlider() {
  const gameAmountNumber = document.getElementById("gameAmount");
  const gameAmountSlider = document.getElementById("gameAmountSlider");

  gameAmountNumber.innerText = ` ${gameAmountSlider.value}`;
}

function gameCostSlider() {
  const gameCostRangeMin = document.getElementById("gameCostRangeMin");
  const gameCostRangeMax = document.getElementById("gameCostRangeMax");
  const gameCostMinRange = document.getElementById("gameCostMinRange");
  const gameCostMaxRange = document.getElementById("gameCostMaxRange");

  gameCostRangeMin.innerText = ` ${gameCostMaxRange.value}`;
  gameCostRangeMax.innerText = ` ${gameCostMinRange.value}`;
}

function gameTimeSlider() {
  const gameTimeRangeMin = document.getElementById("gameTimeRangeMin");
  const gameTimeRangeMax = document.getElementById("gameTimeRangeMax");
  const gameTimeMinRange = document.getElementById("gameTimeMinRange");
  const gameTimeMaxRange = document.getElementById("gameTimeMaxRange");

  gameTimeRangeMin.innerText = ` ${gameTimeMaxRange.value}`;
  gameTimeRangeMax.innerText = ` ${gameTimeMinRange.value}`;
}

function gameScoreSlider() {
  const gameScoreMinRange = document.getElementById("gameScoreMinRange");
  const gameScoreMaxRange = document.getElementById("gameScoreMaxRange");
  const gameScoreRangeMin = document.getElementById("gameScoreRangeMin");
  const gameScoreRangeMax = document.getElementById("gameScoreRangeMax");

  gameScoreRangeMin.innerText = ` ${gameScoreMaxRange.value}`;
  gameScoreRangeMax.innerText = ` ${gameScoreMinRange.value}`;
}

function getPresetArray(presetValue, presetArray) {
  fetch(`json/presetGame${presetValue}.json`)
  .then((response) => response.json())
  .then((gameData) => {
    gameData.forEach((game) => {
      presetArray.push(game);
    });

    const randomIndex = Math.floor(Math.random() * presetArray.length);
    getPresetGame(randomIndex, presetArray);
    isRolling = false;
    });
}

function getPresetGame(i, presetArray) {
  const gameImgSrc = document.getElementById("gameImgSrc");
  const gameName = document.getElementById("gameName");
  const gameMisc = document.getElementById("gameMisc");
  const gameHref = document.getElementById("gameHref");

  const mainGameName = document.getElementById("gameRollTitleContainer");
  const resultGameListEntity = document.getElementById("resultGameListEntity");

  resultGameListEntity.innerHTML = "";
  gameHref.innerHTML = "";

    presetArray.forEach((allData) => {

      const resultGameListImg = document.createElement("div");
      const resultGameListName = document.createElement("div");
      const resultGameListImgSrc = document.createElement("img");

      resultGameListImg.classList.add("resultGameListImg");
      resultGameListName.classList.add(".resultGameListName");

      resultGameListName.style.paddingLeft = "5px";

      resultGameListImgSrc.src = allData.image;
      resultGameListImgSrc.setAttribute("loading", "lazy");
      resultGameListImg.appendChild(resultGameListImgSrc);

      

      resultGameListName.innerText = allData.name;
      mainGameName.innerText = presetArray[i].name;


      if(resultGameListName.innerText == mainGameName.innerText) {
        resultGameListImg.style.borderColor = "#F0E27B";
        resultGameListName.style.color = "#F0E27B";

      }

      resultGameListImgSrc.addEventListener("mouseover", () => {
        resultGameListImg.style.borderColor = "var(--primary-accent)";
      });

      resultGameListImgSrc.addEventListener("mouseout", () => {
        if(resultGameListName.innerText == mainGameName.innerText) {
          resultGameListImg.style.borderColor = "#F0E27B";
        } else {
        resultGameListImg.style.borderColor = "var(--color1)";
        }
      });


      resultGameListImgSrc.addEventListener("click",() => {

      gameImgSrc.src = allData.image;
      gameName.innerText = allData.name;


    gameDescription.innerHTML = `
    <p>${allData.description}</p>
    <hr style="color: var(--color1)">
    `;

    gameMisc.innerHTML = `
    <p>Оценка:<span id="meta_uscore"> ${allData.igdb_score}</span></p>
    <p>Стоимость:<span id="full_price"> ${parseInt(allData.full_price / 100) * 40}</span>₽</p>
    <p>Жанр:<span id="genres"> ${allData.genres}</span></p>
    <p>Теги:<span id="tags"> ${allData.tags}</span></p>
    <p>Платформа:<span id="platforms"> ${allData.platforms}</span></p>
    <p>Время прохождения:<span id="hltb_single"> ${allData.hltb_single}</span> часов</p>
    `;

    if(allData.store_uscore == null) {
      document.getElementById("meta_uscore").innerText  = " ???";
    }
    if(allData.full_price == null) {
      document.getElementById("full_price").innerText  = " ???";
    }
    if(allData.genres == null) {
      document.getElementById("genres").innerText  = " ???";
    }
    if(allData.tags == null) {
      document.getElementById("tags").innerText  = " ???";
    }
    if(allData.platforms == null) {
      document.getElementById("platforms").innerText  = " ???";
    }
    if(allData.hltb_single == null) {
      document.getElementById("hltb_single").innerText  = " ???";
    }
  });

      resultGameListEntity.appendChild(resultGameListImg);
      resultGameListEntity.appendChild(resultGameListName);
});

    mainGameName.innerText = presetArray[i].name;

    gameImgSrc.src = presetArray[i].image;
    gameName.innerText = `${presetArray[i].name}`;


    gameDescription.innerHTML = `
    <p>${presetArray[i].description}</p>
    <hr style="color: var(--color1)">
    `;

    gameMisc.innerHTML = `
    <p>Оценка:<span id="meta_uscore"> ${presetArray[i].igdb_score}</span></p>
    <p>Стоимость:<span id="full_price"> ${parseInt(presetArray[i].full_price / 100) * 40}  ₽</span></p>
    <p>Жанр:<span id="genres"> ${presetArray[i].genres}</span></p>
    <p>Теги:<span id="tags"> ${presetArray[i].tags}</span></p>
    <p>Платформа:<span id="platforms"> ${presetArray[i].platforms}</span></p>
    <p>Время прохождения:<span id="hltb_single"> ${presetArray[i].hltb_single}</span> часов</p>
    `;

    if(presetArray[i].igdb_score == null) {
      document.getElementById("meta_uscore").innerText  = " ???";
    }
    if(presetArray[i].full_price == null) {
      document.getElementById("full_price").innerText  = " ???";
    }
    if(presetArray[i].genres == null) {
      document.getElementById("genres").innerText  = " ???";
    }
    if(presetArray[i].platforms == null) {
      document.getElementById("platforms").innerText  = " ???";
    }
    if(presetArray[i].hltb_single == null) {
      document.getElementById("hltb_single").innerText  = " ???";
    }

    const steamHref = document.createElement("div");
    const hltbHref = document.createElement("div");

    steamHref.classList.add("steamHref");
    hltbHref.classList.add("hltbHref");

    steamHref.innerHTML = "<span>STEAM</span>";
    hltbHref.innerHTML = "<span>HLTB</span>";

    gameHref.appendChild(steamHref);
    gameHref.appendChild(hltbHref);

      steamHref.addEventListener("click", () => {
        const currentGame = presetArray.find((game) => game.name == gameName.innerText);
        if (currentGame.store_url) {
        window.open(currentGame.store_url, "_blank");
      } else {
        window.open("https://store.steampowered.com", "_blank");
      }
    });
  
      hltbHref.addEventListener("click", () => {
        const currentGame = presetArray.find((game) => game.name == gameName.innerText);
        if (currentGame.hltb_url) {
        window.open(currentGame.hltb_url, "_blank");
      } else {
        window.open("https://howlongtobeat.com/", "_blank");
      }
    });
}

function changeWindows() {
  const gamePage = document.getElementById("gamePage");
  const itemPage = document.getElementById("itemPage");

  const gameButton = document.getElementById("gameButton");
  const itemButton = document.getElementById("itemButton");

  gameButton.addEventListener("click", () => {
    itemPage.style.display = "none";
    gamePage.style.display = "grid";
    containerSwitch();
  });

  itemButton.addEventListener("click", () => {
    gamePage.style.display = "none";
    itemPage.style.display = "grid";
    containerSwitch();
  });
}

let itemArray = [];

function possibleItems() {
  const possibleItems = document.getElementById("possibleItems");
  const selectedItemPreset = document.querySelector('input[name="itemList"]:checked');
  const excludeItems = ["Пшено", "Древнерусский выстрел с раскачки", "Пылесос"];

  possibleItems.innerHTML = "";
  itemArray  = [];

  fetch("/getjson2")
  .then((response) => response.json())
  .then((itemData) => {
    if(selectedItemPreset.value == "allItems") {
      itemData.Items.filter(item => !excludeItems.includes(item.name)).slice(1).forEach((item) => {
      const possibleItemListImg = document.createElement("div");
      const possibleItemListP = document.createElement("p");
      const possibleItemListName = document.createElement("div");
      const possibleItemListImgSrc = document.createElement("img");

      possibleItemListImg.classList.add("possibleItemListImg");
      possibleItemListName.classList.add("possibleItemListName");

      possibleItemListImgSrc.src = `img/items/${item.id}.png`;
      possibleItemListP.innerText = item.name;

      itemArray.push(possibleItemListP.innerText);

      possibleItemListName.appendChild(possibleItemListP);
      possibleItemListImg.appendChild(possibleItemListImgSrc);
      possibleItems.appendChild(possibleItemListImg);
      possibleItems.appendChild(possibleItemListName);
      });
    }
    if(selectedItemPreset.value == "Buffs") {
        itemData.Items.slice(1).forEach((item) => {
        if(item.type == "Бафф") {
        const possibleItemListImg = document.createElement("div");
        const possibleItemListP = document.createElement("p");
        const possibleItemListName = document.createElement("div");
        const possibleItemListImgSrc = document.createElement("img");
  
        possibleItemListImg.classList.add("possibleItemListImg");
        possibleItemListName.classList.add("possibleItemListName");
  
        possibleItemListImgSrc.src = `img/items/${item.id}.png`;
        possibleItemListP.innerText = item.name;

        itemArray.push(possibleItemListP.innerText);
  
        possibleItemListName.appendChild(possibleItemListP);
        possibleItemListImg.appendChild(possibleItemListImgSrc);
        possibleItems.appendChild(possibleItemListImg);
        possibleItems.appendChild(possibleItemListName);
          }
      });
    }
    if(selectedItemPreset.value == "Debuffs") {
      itemData.Items.slice(1).forEach((item) => {
      if(item.type == "Дебафф") {
      const possibleItemListImg = document.createElement("div");
      const possibleItemListP = document.createElement("p");
      const possibleItemListName = document.createElement("div");
      const possibleItemListImgSrc = document.createElement("img");

      possibleItemListImg.classList.add("possibleItemListImg");
      possibleItemListName.classList.add("possibleItemListName");

      possibleItemListImgSrc.src = `img/items/${item.id}.png`;
      possibleItemListP.innerText = item.name;

      itemArray.push(possibleItemListP.innerText);

      possibleItemListName.appendChild(possibleItemListP);
      possibleItemListImg.appendChild(possibleItemListImgSrc);
      possibleItems.appendChild(possibleItemListImg);
      possibleItems.appendChild(possibleItemListName);
        }
    });
    }
    if(selectedItemPreset.value == "Coin") {
      const coinArray = ["Решка", "Орёл", "Ребро"];

      coinArray.forEach((coin) => {
        const possibleItemListImg = document.createElement("div");
        const possibleItemListP = document.createElement("p");
        const possibleItemListName = document.createElement("div");
        const possibleItemListImgSrc = document.createElement("img");
  
        possibleItemListImg.classList.add("possibleItemListImg");
        possibleItemListName.classList.add("possibleItemListName");
  
        possibleItemListImgSrc.src = `img/items/${coin}.png`;
        possibleItemListP.innerText = coin;

        itemArray.push(possibleItemListP.innerText);
  
        possibleItemListName.appendChild(possibleItemListP);
        possibleItemListImg.appendChild(possibleItemListImgSrc);
        possibleItems.appendChild(possibleItemListImg);
        possibleItems.appendChild(possibleItemListName);
      });
    }
    if(selectedItemPreset.value == "Players") {
      fetch("/getusers")
      .then((response) => response.json())
      .then((users) => {
        users.forEach((user) => {
      const possibleItemListImg = document.createElement("div");
      const possibleItemListP = document.createElement("p");
      const possibleItemListName = document.createElement("div");
      const possibleItemListImgSrc = document.createElement("img");

      possibleItemListImg.classList.add("possibleItemListImg");
      possibleItemListName.classList.add("possibleItemListName");

      fetch(`/getavatar/${user.id}`)
      .then((response) => response.blob())
      .then((avatarBlob) => {
          const imageUrl = URL.createObjectURL(avatarBlob); 
          possibleItemListImgSrc.src = imageUrl;
      })
      .catch((error) => {
          console.error("Error displaying user avatar:", error);
          const errorAvatar = "img/user-pfp.svg";
          possibleItemListImgSrc.src = errorAvatar;
      });
      possibleItemListP.innerText = user.username;

      itemArray.push(possibleItemListP.innerText);

      possibleItemListName.appendChild(possibleItemListP);
      possibleItemListImg.appendChild(possibleItemListImgSrc);
      possibleItems.appendChild(possibleItemListImg);
      possibleItems.appendChild(possibleItemListName);
        });
      });
    }
    if(selectedItemPreset.value == "customList") {
      const possibleItemListCustom = document.createElement("textarea");
      possibleItemListCustom.classList.add("possibleTextArea");

      textarea(possibleItemListCustom);
      
      possibleItems.appendChild(possibleItemListCustom);
    }
  });
}

function rollItemAnimation() {
  const itemRollTitleContainer = document.getElementById("itemRollTitleContainer");
  const itemImgSrc = document.getElementById("itemImgSrc");
  const itemName = document.getElementById("itemName");
  const itemDescription = document.getElementById("itemDescription");
  const possibleItemListName = document.querySelectorAll(".possibleItemListName");

  const maxRolls = 30;
  let rolls = 0;
  let animationArray = [];

  fetch("json/items.json")
    .then((response) => response.json())
    .then((itemData) => {
      for(i = 0; i < possibleItemListName.length; i++) {
          animationArray.push(possibleItemListName[i].innerText);
      }

      function displayRandomItem() {
        const randomResult = Math.floor(Math.random() * animationArray.length);

        const item = itemData.Items.find((item) => item.name == animationArray[randomResult]);

        if(item) {
          itemRollTitleContainer.innerText = item.name;
          itemName.innerText = itemRollTitleContainer.innerText;
          itemDescription.innerText = item.description;
          itemImgSrc.src = `./img/items/${item.id}.png`;

          rolls++;
  
          if (rolls < maxRolls) {
            setTimeout(displayRandomItem, 160);
          } else {
            rollItem();
          }
        } else {
          rollItem()
        }
        }
      displayRandomItem();
    });
}

function rollItem() {
  const itemRollTitleContainer = document.getElementById("itemRollTitleContainer");
  const itemImgSrc = document.getElementById("itemImgSrc");
  const itemName = document.getElementById("itemName");
  const itemDescription = document.getElementById("itemDescription");
  const itemMisc = document.getElementById("itemMisc");
  const selectedItemPreset = document.querySelector('input[name="itemList"]:checked');

  let rolledArray = [];

  itemImgSrc.src = "";


  if(itemArray.length > 0) {

  while (rolledArray.length < 7) {
  const randomItem = Math.floor(Math.random() * itemArray.length);
  rolledArray.push(itemArray[randomItem]);
  }
  fetch("json/items.json")
  .then((response) => response.json())
  .then((itemData) => {
    itemRollTitleContainer.innerText = rolledArray[3];

    const item = itemData.Items.find((item) => item.name == itemRollTitleContainer.innerText);
    const resultItemListEntity = document.getElementById("resultItemListEntity");
    resultItemListEntity.innerHTML = "";
    itemName.innerText = "";
    itemDescription.innerText = "";
    itemMisc.innerText = "";
    
    if(item) {
      rolledArray.forEach((arrayItem, index) => {
        const eachItem = itemData.Items.find((item) => item.name == arrayItem);
        if(eachItem) {

  
        const resultItemListImg = document.createElement("div");
        const resultItemListName = document.createElement("div");
        const resultItemListImgSrc = document.createElement("img");
  
        resultItemListImg.classList.add("resultItemListImg");
        resultItemListName.classList.add("resultItemListName");
  
        resultItemListName.style.paddingLeft = "5px";
  
        resultItemListImgSrc.src = `img/items/${eachItem.id}.png`;
        resultItemListImgSrc.setAttribute("loading", "lazy");
        resultItemListImg.appendChild(resultItemListImgSrc);

        resultItemListImg
  
        resultItemListName.innerText = eachItem.name;

        resultItemListImgSrc.addEventListener("click", () => {
          itemName.innerText = eachItem.name;
          itemImgSrc.src = `img/items/${eachItem.id}.png`;
          itemDescription.innerText = eachItem.description;
          itemMisc.innerHTML = `
          <hr style="color: var(--color1)">
          <p>Тип:<span id="itemType"> ${eachItem.type}</span></p>
          <p>Заряды:<span id="itemAmount"> ${eachItem.amount}</span></p>
          `;

          if(!eachItem.amount) {
            document.getElementById("itemAmount").innerText = " 1";
          }

          if(eachItem.type === "Бафф") {
            document.getElementById("itemType").style.color = "var(--item-buff)";
          } else if (eachItem.type === "Дебафф") {
            document.getElementById("itemType").style.color = "var(--item-debuff)";
          } else if (eachItem.type === "Нейтралка") {
            document.getElementById("itemType").style.color = "var(--item-neutral)";
          } else if (eachItem.type === "Ловушка" || eachItem.type === "Ловушка-Дебафф" || eachItem.type === "Ловушка-Нейтралка") {
            document.getElementById("itemType").style.color = "var(--item-trap)";
          }
        });

      resultItemListEntity.appendChild(resultItemListImg);
      resultItemListEntity.appendChild(resultItemListName);

      if (index == 3) {
        resultItemListImg.style.borderColor = "#F0E27B";
        resultItemListName.style.color = "#F0E27B";
        resultItemListName.innerHTML = resultItemListName.innerText + "     &starf;"
    }
    resultItemListImgSrc.addEventListener("mouseover", () => {
      resultItemListImg.style.borderColor = "var(--primary-accent)";
    });

    resultItemListImgSrc.addEventListener("mouseout", () => {
      if(index == 3) {
        resultItemListImg.style.borderColor = "#F0E27B";
      } else {
      resultItemListImg.style.borderColor = "var(--color1)";
      }
    });
  }
});
      itemName.innerText = item.name;

      itemImgSrc.src = `img/items/${item.id}.png`;

      itemDescription.innerHTML = `
      <p>${item.description}</p>
      <hr style="color: var(--color1)">
      `;

      itemMisc.innerHTML = `
      <p>Тип:<span id="itemType"> ${item.type}</span></p>
      <p>Заряды:<span id="itemAmount"> ${item.amount}</span></p>
      `;

      if(!item.amount) {
        document.getElementById("itemAmount").innerText = " 1";
      }

      if(item.type == "Бафф") {
        document.getElementById("itemType").style.color = "var(--item-buff)";
      } else if (item.type == "Дебафф") {
        document.getElementById("itemType").style.color = "var(--item-debuff)";
      } else if (item.type == "Нейтралка") {
        document.getElementById("itemType").style.color = "var(--item-neutral)";
      } else if (item.type == "Ловушка" || item.type == "Ловушка-Дебафф" || item.type == "Ловушка-Нейтралка") {
        document.getElementById("itemType").style.color = "var(--item-trap)";
      }

      } else if (selectedItemPreset.value == "Players"){
        itemName.innerText = rolledArray[3];

        fetch(`/getuserpicture/${itemName.innerText}`)
        .then((response) => response.blob())
        .then((avatarBlob) => {
            const imageUrl = URL.createObjectURL(avatarBlob); 
            itemImgSrc.src = imageUrl;
        })
        .catch((error) => {
            console.error("Error displaying user avatar:", error);
            const errorAvatar = "img/user-pfp.svg";
            itemImgSrc.src = errorAvatar;
        });
      } else if (selectedItemPreset.value == "customList"){
      }
    });
  }
}

function textarea(textarea) {
  const itemButtonRoll = document.getElementById("itemButtonRoll");

  const itemRollTitleContainer = document.getElementById("itemRollTitleContainer");
  const itemName = document.getElementById("itemName");

  itemButtonRoll.addEventListener("click", () => {
  
    if (textarea) {
      const lines = textarea.value.split('\n');

      const nonEmptyLines = [];
    
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine.length > 0) {
          nonEmptyLines.push(trimmedLine);
        }
      });
    const randomCustomNumber = Math.floor(Math.random() * nonEmptyLines.length);

    itemRollTitleContainer.innerText = nonEmptyLines[randomCustomNumber];
    itemName.innerText = nonEmptyLines[randomCustomNumber];
    }
  });
}
