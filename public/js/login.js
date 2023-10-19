let registerInput = document.getElementById("registerinput");
let userExists = document.getElementById("user-exists");
let userCharacters = document.getElementById("user-characters");
let loginInput = document.getElementById("logininput");
let userNotExist = document.getElementById("user-not-exist");
let loginPage = document.getElementById("login-page");
let mainMap = document.getElementById("map-container");
let mainUI = document.getElementById("mainUI-container");
let preview = document.querySelector("img");
let loginContainer = document.getElementById("login-page");
let registerContainer = document.getElementById("register-page");
let colorInput = document.getElementById("colorPicker");
let pfpContainer = document.getElementById("pfp-preview-container");
let playerIconContainer = document.getElementById("playerIcons-container");



window.addEventListener("load", function() {
  const loadingOverlay = document.querySelector(".loading-overlay");
    loadingOverlay.style.display = "none";
});

function loginhreftomap() {
  if (document.readyState === "complete") {
    if(sessionStorage.getItem("Username")) {
      window.location.href = "Map";
    }
  };
}

let userList = [];

function populateUserList() {
  fetch("/getusers")
  .then((response) => response.json())
  .then((user) => {
    user.forEach((user) => {
      userList.push(user.username);
    });
  });
}

let fullUserList = [];

function populateCurrentUserList() {
  fetch("/getusers")
    .then((response) => response.json())
    .then((fullUsersData) => {
      const usernameToFind = sessionStorage.getItem("Username");
      const user = fullUsersData.find((user) => user.username == usernameToFind);

      if (user) {
        sessionStorage.setItem("CurrentId", user.id);
        sessionStorage.setItem("UserColor", user.color);
        sessionStorage.setItem("isPlaced", user.isPlaced);
        sessionStorage.setItem("xPos", parseInt(user.xPos));
        sessionStorage.setItem("yPos", parseInt(user.yPos));
        sessionStorage.setItem("mapCell", user.mapCell);
        sessionStorage.setItem("item1", user.Item1);
        sessionStorage.setItem("item2", user.Item2);
        sessionStorage.setItem("item3", user.Item3);
        sessionStorage.setItem("item4", user.Item4);
        sessionStorage.setItem("item5", user.Item5);
        sessionStorage.setItem("item6", user.Item6);

        document.cookie = `page=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;

        document.cookie = `username=${sessionStorage.getItem("Username")}; path=/`;
        document.cookie = `mapCell=${sessionStorage.getItem("mapCell")}; path=/`;
        document.cookie = `page=${encodeURIComponent(document.title)}; path=/`;

        fullUserList = fullUsersData;
        getUserAvatar(user.id);
        if(window.location.href == "http://" + window.location.host + "/map") {
        placeAllPlayers();
        }
      }
    });
}

function placeAllPlayers() {
  const currentUser = sessionStorage.getItem("Username");
  fullUserList.forEach((user) => {
    if (user.isPlaced === "true") {
      const placedUserImg = document.createElement("img");
      const placeduserImgContainer = document.createElement("div");
      placeduserImgContainer.classList.add("playerImage");
      placeduserImgContainer.id = user.username + "-PlayerIcon";
      placedUserImg.id = `${user.username}-playerIconImg`;
      playerIconContainer.appendChild(placeduserImgContainer);
      placeduserImgContainer.style.border = `2px solid ${user.color}`;
      placeduserImgContainer.appendChild(placedUserImg);
      placeduserImgContainer.style.top = user.yPos + "px";
      placeduserImgContainer.style.left = user.xPos + "px";

      fetch(`/getavatar/${user.id}`)
        .then((response) => response.blob())
        .then((blob) => {
          const objectURL = URL.createObjectURL(blob);
          placedUserImg.src = objectURL;
        })
        .catch((error) => console.error("Error fetching avatar:", error));

      makeElementDraggable(currentUser);

    } else {
      console.log("Player hasnt been placed yet");
    }
  });
}

function placePlayers() {
  const currentUser = sessionStorage.getItem("Username");
  const currentColor = sessionStorage.getItem("UserColor");
  const currentIsPlaced = sessionStorage.getItem("isPlaced");

  if (currentIsPlaced == "false") {
    let placedUserImg = document.createElement("img");
    let placeduserImgContainer = document.createElement("div");
    placeduserImgContainer.classList.add("playerImage");
    placeduserImgContainer.id = currentUser + "-PlayerIcon";
    placedUserImg.id = `${currentUser}-playerIconImg`;
    playerIconContainer.appendChild(placeduserImgContainer);
    placeduserImgContainer.appendChild(placedUserImg);
    placeduserImgContainer.style.bottom = Math.random() * 55 + "px";
    placeduserImgContainer.style.left = Math.random() * 55 + "px";
    placeduserImgContainer.style.border = `2px solid ${currentColor}`;

    fetch(`/getavatar/${sessionStorage.getItem("CurrentId")}`)
    .then((response) => response.blob())
    .then((blob) => {
      const objectURL = URL.createObjectURL(blob);
      placedUserImg.src = objectURL;
    })
    .catch((error) => console.error("Error fetching avatar:", error));

    sessionStorage.setItem("isPlaced", "true");
    makeElementDraggable();

    const currentX = parseInt(placeduserImgContainer.offsetLeft);
    const currentY = parseInt(placeduserImgContainer.offsetTop);
    const isPlaced = sessionStorage.getItem("isPlaced");
    const id = sessionStorage.getItem("CurrentId");

    updatePosition(id, currentX, currentY, isPlaced);
  }
}

function updateCell(userId, mapCell) {
  fetch(`/updatecell/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mapCell }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("mapCell updated successfully:", data);
    })
    .catch((error) => {
      console.error("Error updating mapCell:", error);
    });
}

function updatePosition(userId, xPos, yPos, isPlaced) {
  fetch(`/updateposition/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ xPos, yPos, isPlaced }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Position and isPlaced updated successfully:", data);
    })
    .catch((error) => {
      console.error("Error updating position and isPlaced:", error);
    });
}

function makeElementDraggable() {
  const socket = io();

  fullUserList.forEach((user) => {
    if (currentUser == user.username) {
      $(`#${user.username}-PlayerIcon`).draggable({
        containment: "parent",
        drag: (event, ui) => {
          const position = ui.position;
          const data = { left: position.left, top: position.top, username: user.username };
          socket.emit("move", data);
        },
        stop: (event, ui) => {
          const position = ui.position;
          const data = { left: position.left, top: position.top, username: user.username };

          const currentX = parseInt(data.left);
          const currentY = parseInt(data.top);
          const isPlaced = sessionStorage.getItem("isPlaced");
          const id = sessionStorage.getItem("CurrentId");
      
          updatePosition(id, currentX, currentY, isPlaced);
        }
      });
    }
  });
  
  socket.on("move", (data) => {
      $(`#${data.username}-PlayerIcon`).css({ left: data.left + "px", top: data.top + "px" });
  });
}

function getUserAvatar(userId) {
  const avatarImage = document.getElementById("avatarImage");
  fetch(`/getavatar/${userId}`)
      .then((response) => response.blob())
      .then((avatarBlob) => {
          const imageUrl = URL.createObjectURL(avatarBlob); 
          avatarImage.src = imageUrl;
      })
      .catch((error) => {
          console.error("Error displaying user avatar:", error);
          const errorAvatar = "../img/user-pfp.svg";
          avatarImage.src = errorAvatar;
      });
}



function verifyUser() {
  const loginValue = loginInput.value.toLowerCase();
  const matchingUser = userList.find(user => user.toLowerCase() == loginValue);
  
  if (matchingUser) {
    loginInput.value = "";
    sessionStorage.setItem("Username", matchingUser);
    window.location.href = "map";

  } else {
    loginInput.value = "";
    loginInput.style.borderColor = "red";
    userNotExist.style.display = "block";
  }

  loginInput.addEventListener("input", function () {
    if (loginInput.style.borderColor === "red") {
      loginInput.style.borderColor = "";
      userNotExist.style.display = "none";
    }
  });
}

function searchUser() {
  const registerValue = registerInput.value.toLowerCase();
  const matchingUser = userList.find(user => user.toLowerCase() == registerValue);
  
    if (matchingUser) {
      registerInput.style.borderColor = "red";
      userExists.style.display = "block";
    } else if (registerInput.value.length < 1){
      registerInput.style.borderColor = "red";
      userCharacters.style.display = "block";
    } else {
      console.log("User doesnt exist yet");
    }
    registerInput.addEventListener("input", function () {
      if (registerInput.style.borderColor === "red") {
        registerInput.style.borderColor = "";
        userExists.style.display = "none"; 
        userCharacters.style.display = "none";
      }
    });
  }

function loginhref() {
  if (!sessionStorage.getItem("Username")) {
    window.location.href = "index";
  }
}

function loginVerify(event) {
  if (event.which == 13) {
    if (registerContainer.style.display === "none") {
      verifyUser();
    };
  };
}

function loginchange() {
  if (document.getElementById("login-page").style.display == "block") {
  document.getElementById("login-page").style.display = "none";
  document.getElementById("register-page").style.display = "block";
  } else {
    document.getElementById("login-page").style.display = "block";
    document.getElementById("register-page").style.display = "none";
  }
}

function registerUser() {
  const username = registerInput.value.toLowerCase();
  const color = colorInput.value;
  const avatarInput = document.getElementById("avatar-upload");
  const avatarFile = avatarInput.files[0];

  if (!username) {
      registerInput.style.borderColor = "red";
      userCharacters.style.display = "block";
      return;
  }
  const user = {
      username: username,
      color: color,
      isPlaced: "false",
      Item1: 0,
      Item2: 0,
      Item3: 0,
      Item4: 0,
      Item5: 0,
      Item6: 0,
      money: 0,
      event: "none"
  };

  const formData = new FormData();
  formData.append("user", JSON.stringify(user));
  formData.append("avatar", avatarFile);
  fetch("/adduser", {
      method: "POST",
      body: formData,
  })
  .then((response) => response.json())
  .then((data) => {
      console.log(data);
      if (data.success) {
          window.location.href = "index";
      } else {
          registerInput.style.borderColor = "red";
          userExists.style.display = "block";
      }
  })
  .catch((error) => {
      console.error("Error adding user:", error);
  });
    const inventoryFileName = `${username}.html`;
    
    const userData = {
      username: username,
      color: color,
      inventoryFileName: inventoryFileName
    };

    fetch("/createUserInventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      if (data.success) {
        window.location.reload;
      } else {
        registerInput.style.borderColor = "red";
        userExists.style.display = "block";
      }
    })
    .catch(error => {
      console.error("Error creating user-specific inventory file:", error);
    });
}


function colorPicker() {
  colorInput.addEventListener("input", function () {
    pfpContainer.style.borderColor = colorInput.value;
  });
}


let selectedFile = null;

function previewpfp() {
  const fileInput = document.getElementById("avatar-upload");
  selectedFile = fileInput.files[0];

  if (selectedFile) {
    const reader = new FileReader();
    reader.onload = function () {
      const preview = document.getElementById("pfp-preview-container");
      preview.innerHTML = "";
      const image = document.createElement("img");
      image.src = reader.result;
      preview.appendChild(image);
    };
    reader.readAsDataURL(selectedFile);
    console.log(selectedFile);
  }
}

function checkForLazyLoading() {
  const image = document.querySelectorAll("img");

  for(i = 0; i < image.length; i++) {
    if(!image[i].getAttribute("loading")) {
      image[i].setAttribute("loading", "lazy");
    }
    if(!image[i].getAttribute("draggable")) {
      image[i].setAttribute("draggable", "false");
    }
  }
}
checkForLazyLoading();