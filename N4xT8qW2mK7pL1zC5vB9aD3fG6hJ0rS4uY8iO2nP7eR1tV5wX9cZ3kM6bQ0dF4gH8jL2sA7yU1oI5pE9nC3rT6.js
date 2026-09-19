// Hàm để lấy ngày hôm nay từ Unix timestamp
var today_string;
/*function isToday(timestamp) {
    // Tạo đối tượng Date từ timestamp
    let date = new Date(timestamp * 1000);
    // Lấy ngày, tháng, năm
    let day = date.getDate();        // Ngày
    let month = date.getMonth() + 1; // Tháng (tháng bắt đầu từ 0 nên phải cộng thêm 1)
    let year = date.getFullYear();   // Năm

    const today = new Date();
    // Lấy ngày, tháng, năm hiện tại
    const day_init = today.getDate(); // Ngày
    const month_init = today.getMonth() + 1; // Tháng (getMonth() trả về từ 0-11, nên cần +1)
    const year_init = today.getFullYear(); // Năm

    if (day == day_init && month == month_init && year == year_init)
        return true;
    else
        return false;
}*/
function formatUptime(seconds) {
    if (!seconds || seconds < 0) return "0 sec";

    let days = Math.floor(seconds / 86400);
    seconds %= 86400;

    let hours = Math.floor(seconds / 3600);
    seconds %= 3600;

    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;

    let result = [];

    if (days > 0) result.push(`${days} day`);
    if (hours > 0) result.push(`${hours} hour`);
    if (minutes > 0) result.push(`${minutes} min`);
    if (secs > 0) result.push(`${secs} sec`);

    return result.length ? result.join(" ") : "0 sec";
}
function isTodayFromPart5(ddmmyy) {
    if (!ddmmyy || ddmmyy.length !== 6) return false;

    // Tách ngày tháng năm từ chuỗi
    let day = parseInt(ddmmyy.slice(0, 2));
    let month = parseInt(ddmmyy.slice(2, 4));
    let year = parseInt(ddmmyy.slice(4, 6)) + 2000; // 26 -> 2026

    const today = new Date();

    return (
        day === today.getDate() &&
        month === (today.getMonth() + 1) &&
        year === today.getFullYear()
    );
}
function unixToTime(unixTimestamp) {
    // Chuyển Unix Timestamp từ giây thành mili giây (nếu cần)
    const date = new Date(unixTimestamp);

    // Lấy giờ, phút, giây
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // Định dạng để đảm bảo 2 chữ số (nếu cần)
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

    // Ghép lại thành định dạng hh:mm:ss
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

function layNgayThangNamHienTai() {
    // Lấy ngày, tháng và năm hiện tại
    const today = new Date();
    const ngay = String(today.getDate()).padStart(2, '0'); // Đảm bảo ngày có 2 chữ số
    const thang = String(today.getMonth() + 1).padStart(2, '0'); // Đảm bảo tháng có 2 chữ số
    const nam = today.getFullYear(); // Lấy năm

    // Lưu kết quả vào biến
    const ngayThangNam = `${ngay}${thang}${nam}`; // Định dạng ngày/tháng/năm

    return ngayThangNam; // Trả về kết quả
}

// Hàm lưu giá trị vào cookie
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Tính toán thời gian hết hạn
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/"; // Lưu cookie
    
}

// Hàm lấy giá trị từ cookie
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null; // Trả về null nếu không tìm thấy cookie
}
