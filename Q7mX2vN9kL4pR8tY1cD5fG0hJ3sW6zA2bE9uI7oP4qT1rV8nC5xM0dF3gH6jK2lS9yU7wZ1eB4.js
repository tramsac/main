// mqtt.js
// Đảm bảo rằng thư viện MQTT.js được tải từ CDN
//const brokerUrl = 'wss://ua1a441a.ala.us-east-1.emqxsl.com:8084/mqtt'; // Broker URL (Ví dụ: HiveMQ)
// Hàm chuyển đổi thời gian Unix (giây) thành định dạng ngày giờ

// Ví dụ sử dụng hàm

var brokerUrl = mqttBaseUrl;
function getTodayCode() {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);

    return day + month + year;
}

const today = getTodayCode();
loadConfigFromCookie();
const client = mqtt.connect(mqttBaseUrl, {
    clientId: 'mqtt_client_' + Math.random().toString(16).substr(2, 8), // Tạo client ID duy nhất
    clean: true,
    ssl: true,
    connectTimeout: 4000,
    username: 'admin',  // Thay bằng tên đăng nhập (nếu có)
    password: '12341234',  // Thay bằng mật khẩu (nếu có)
    will: {
        topic: 'status/connection',
        payload: 'Offline',
        qos: 1,
        retain: true
    }
});

// Kết nối thành công

client.on('connect', () => {

    clearTable();
    if (!deviceId) {
        alert("chưa cài đặt địa chỉ loa");
        return;
    } else {
        client.subscribe('' + appId + '/stat/+/' + homeId + '/' + userId + '/' + deviceId + '/#', { qos: 1 }, (err) => {
            if (err) {

            } else {

            }
        });
        client.subscribe('' + appId + '/tele/+/' + homeId + '/' + userId + '/' + deviceId + '/#', { qos: 1 }, (err) => {
            if (err) {

            } else {

            }
        });
        client.subscribe('' + appId + '/log/+/' + homeId + '/' + userId + '/' + deviceId + '/'+currentDate+'/#', { qos: 1 }, (err) => {
            if (err) {

            } else {

            }
        });
    }
  //  console.log("success");
    client.publish('' + appId + '/cmnd/ws/' + homeId + '/' + userId + '/' + deviceId + '/state', "{}", { qos: 1, retain: false }, (err) => {
        if (err) {

        } else {

        }
    });
});

// Nhận tin nhắn từ topic đã subscribe
client.on('message', (topic, message) => {
    controller(topic, message.toString());
});

// Xử lý sự kiện khi kết nối bị mất
client.on('offline', () => {
  //  console.log('MQTT client bị mất kết nối!');
});

// Xử lý sự kiện khi gặp lỗi
client.on('error', (error) => {
  //  console.log('Lỗi kết nối MQTT:', error);
});


const btnOn = document.getElementById("btn-on");
const btnOff = document.getElementById("btn-off");
document.addEventListener("DOMContentLoaded", () => {
    // toàn bộ code của bạn ở đây

    // Nút ON
    btnOn.addEventListener("click", () => {
        if (!client.connected) {
            alert("chưa kết nối!");
            return;
        }

        if (!deviceId) {
            alert("Thiếu device_id");
            return;
        }

        if (confirm("Bạn có chắc muốn BẬT thiết bị không?")) {
           // console.log("Bật thiết bị");

            client.publish(
                `${appId}/cmnd/ws/${homeId}/${userId}/${deviceId}/power`,
                JSON.stringify({ state: 1 ,  timestamp: Date.now()}),
                { qos: 1, retain: false },
                (err) => {
                    if (err) {
                       // console.error("Publish lỗi:", err);
                    } else {
                       // console.log("Đã gửi ON");
                    }
                }
            );
        }
    });

    setInterval(() => {
        document.querySelectorAll("iframe, .whatsup-msg__title").forEach(el => el.remove());
    }, 1000);
    // Nút OFF
    btnOff.addEventListener("click", () => {
        if (!client.connected) {
            alert(" chưa kết nối!");
            return;
        }

        if (!deviceId) {
            alert("Thiếu device_id");
            return;
        }

        if (confirm("Bạn có chắc muốn TẮT thiết bị không?")) {
            //console.log("Tắt thiết bị");

            client.publish(
               `${appId}/cmnd/ws/${homeId}/${userId}/${deviceId}/power`,
                JSON.stringify({ state: 0 ,  timestamp: Date.now()}),
                { qos: 1, retain: false },
                (err) => {
                    if (err) {
                      //  console.error("Publish lỗi:", err);
                    } else {
                       // console.log("Đã gửi OFF");
                    }
                }
            );
        }
    });
});
