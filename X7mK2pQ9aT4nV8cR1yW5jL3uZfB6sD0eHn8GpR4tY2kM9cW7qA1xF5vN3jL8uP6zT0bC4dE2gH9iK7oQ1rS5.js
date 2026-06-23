/***********************
 * CONFIG GLOBAL
 ***********************/
let deviceId = 'ws_1777041042219';
let actionUrl = null;
let mqttBaseUrl = null;

let userId = null;
let homeId = null;
let appId = null;

/***********************
 * COOKIE UTIL
 ***********************/

/***********************
 * LOAD CONFIG FROM COOKIE
 ***********************/
function loadConfigFromCookie() {
  deviceId = getCookie('device_id') || deviceId;
  actionUrl = getCookie('action_url');
  mqttBaseUrl = getCookie('murl');

  userId = getCookie('user_id');
  homeId = getCookie('home_id');
  appId = getCookie('app_id');
}

/***********************
 * LOAD CONFIG FROM URL
 ***********************/
function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

function loadConfigFromUrl() {
  const urlDeviceId = getQueryParam('device_id');
  const urlAction = getQueryParam('action_url');
  const urlMurl = getQueryParam('murl');

  const urlUserId = getQueryParam('user_id');
  const urlHomeId = getQueryParam('home_id');
  const urlAppId = getQueryParam('app_id');

  if (urlDeviceId) {
    deviceId = urlDeviceId;
    setCookie('device_id', deviceId,1200);
  }

  if (urlAction) {
    actionUrl = urlAction;
    setCookie('action_url', actionUrl,1200);
  }

  if (urlMurl) {
    mqttBaseUrl = urlMurl;
    setCookie('murl', mqttBaseUrl,1200);
  }

  if (urlUserId) {
    userId = urlUserId;
    setCookie('user_id', userId,1200);
  }

  if (urlHomeId) {
    homeId = urlHomeId;
    setCookie('home_id', homeId,1200);
  }

  if (urlAppId) {
    appId = urlAppId;
    setCookie('app_id', appId,1200);
  }

  console.log("📌 CONFIG:");
  console.log("deviceId:", deviceId);
  console.log("actionUrl:", actionUrl);
  console.log("mqttBaseUrl:", mqttBaseUrl);

  console.log("userId:", userId);
  console.log("homeId:", homeId);
  console.log("appId:", appId);
}

/***********************
 * INIT
 ***********************/
window.onload = function () {

  loadConfigFromUrl();
};

/***********************
 * DATE UTIL
 ***********************/
function getCurrentDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  return `${day}${month}${year}`;
}

let currentDate = getCurrentDate();

/***********************
 * TABLE RENDER
 ***********************/
function addTransactionRow(status, id, timestamp, amount, info) {
  const tableBody = document.getElementById('data-table-body');
  const row = document.createElement('tr');

  row.setAttribute("data-ts", timestamp);

  const colorClass = status === 0 ? "content-green" : "content-red";

  row.innerHTML = `
    <td class="${colorClass}">${id}</td>
    <td class="${colorClass}">${unixToTime(timestamp)}</td>
    <td class="${colorClass}">${amount}</td>
    <td class="${colorClass}">${info}</td>
  `;

  const rows = tableBody.querySelectorAll("tr");
  let inserted = false;

  for (let oldRow of rows) {
    const oldTs = parseInt(oldRow.getAttribute("data-ts"));

    if (timestamp > oldTs) {
      tableBody.insertBefore(row, oldRow);
      inserted = true;
      break;
    }
  }

  if (!inserted) {
    tableBody.appendChild(row);
  }
}

function clearTable() {
  document.getElementById('data-table-body').innerHTML = '';
}

/***********************
 * TOTAL CALCULATION
 ***********************/
function calculateTotal() {
  let total = 0;

  const rows = document.querySelectorAll("#data-table-body tr");

  rows.forEach(row => {
    const cell = row.querySelector("td:nth-child(3)");
    if (!cell) return;

    let value = cell.textContent
      .trim()
      .replace(/,/g, '')
      .replace('+', '');

    total += parseInt(value || 0, 10);
  });

  document.getElementById("total-display").textContent =
    `: ${total.toLocaleString()} VNĐ`;
}

/***********************
 * MQTT / MESSAGE CONTROLLER
 ***********************/
function controller(topic, message) {
  console.log("TOPIC:", topic);
  console.log("MSG:", message);

  // LOG TRANSACTION
  if (topic.includes("/transaction")) {
    const data = JSON.parse(message);
    addTransactionRow(
      0,
      data.tranid,
      data.time_stamp,
      data.money,
      data.msg
    );

    calculateTotal();
  }

  // LWT STATUS
  else if (topic.includes("/lwt")) {

    const statusText = document.getElementById("device-status-text");
    const statusIcon = document.getElementById("device-status-icon");

    if (message === "online") {
      statusText.innerHTML = "ONLINE";
      statusText.className = "text-success";
      statusIcon.src = "https://cdn-icons-png.flaticon.com/512/190/190411.png";
    } else {
      statusText.innerHTML = "OFFLINE";
      statusText.className = "text-danger";
      statusIcon.src = "https://cdn-icons-png.flaticon.com/512/565/565547.png";
    }
  }

  // DEVICE STATE
  else if (topic.includes("/state")) {
    const datas = JSON.parse(message);

    document.getElementById("uptime").innerHTML = formatUptime(datas.uptime);
    document.getElementById("device-wifi").innerHTML = datas.network.data.ssid;
    document.getElementById("rssi").innerHTML = datas.network.data.rssi;
   
 
    const statusServerText = document.getElementById("server-status-text");
    const statusServerIcon = document.getElementById("server-status-icon");

    if ( datas.server.status === "ONLINE") {
      statusServerText.innerHTML = "ONLINE";
      statusServerText.className = "text-success";
      statusServerIcon.src = "https://cdn-icons-png.flaticon.com/512/190/190411.png";
    } else {
      statusServerText.innerHTML = "OFFLINE";
      statusServerText.className = "text-danger";
      statusServerIcon.src = "https://cdn-icons-png.flaticon.com/512/565/565547.png";
    }
    
    const dv_time = document.getElementById("device-status-time");
    dv_time.innerHTML = " [(Xịt nước : " + formatUptime(datas.status.remain_sec) + ") - (Bọt tuyết : " + formatUptime(datas.status.remain_sec_foam_spray)+") ] ";
    if (datas.status.mode == 0) {
      if (datas.status.running == 0) mode.innerHTML = "Đang chờ";
      if (datas.status.running == 1) mode.innerHTML = "Đang chạy";
    } else mode.innerHTML = "Đang bảo trì";
  }
}

/***********************
 * BATTERY UI
 ***********************/
function updateBatteryLevel(level) {
  document.getElementById("battery-level").textContent = `${level}%`;

  const icon = document.getElementById("battery-icon");

  if (level >= 80) {
    icon.src = "https://cdn-icons-png.flaticon.com/512/3103/3103446.png";
  } else if (level >= 50) {
    icon.src = "https://cdn-icons-png.flaticon.com/512/3103/3103453.png";
  } else if (level >= 20) {
    icon.src = "https://cdn-icons-png.flaticon.com/512/3103/3103450.png";
  } else {
    icon.src = "https://cdn-icons-png.flaticon.com/512/3103/3103478.png";
  }
}

function updateChargingStatus(isCharging) {
  const text = document.getElementById("charging-status");
  const icon = document.getElementById("charging-icon");

  if (isCharging) {
    text.innerHTML = "Đang sạc";
    icon.src = "https://cdn-icons-png.flaticon.com/512/724/724664.png";
  } else {
    text.innerHTML = "Không sạc";
    icon.src = "https://cdn-icons-png.flaticon.com/512/1828/1828778.png";
  }
}