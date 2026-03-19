
// معلومات الجهاز
function fetchDeviceInfo() {
    let info = `المتصفح: ${navigator.userAgent}\nنظام التشغيل: ${navigator.platform}`;
    updateStatus("deviceInfo", info, "safe");
}

// فحص عنوان IP وكشف VPN
async function fetchIPInfo() {
    let res = await fetch("https://ipinfo.io/json?token=b80dd7723dbc9b");
    let data = await res.json();
    updateStatus("ipInfo", `عنوان IP: ${data.ip}\nالموقع: ${data.city}, ${data.country}\nمزود الخدمة: ${data.org}`, "warning");
}
// إذن الموقع الجغرافي
async function checkLocationPermission() {
    let status = await navigator.permissions.query({ name: "geolocation" });
    let translatedState = status.state === "granted" ? "مسموح" : status.state === "denied" ? "مرفوض" : "غير محدد";
    let riskLevel = status.state === "granted" ? "تحذير" : "آمن";
    
    updateStatus("locationStatus", `الحالة: ${translatedState}`, riskLevel);
}

// تحديث حالة الاختبارات
function updateStatus(id, message, type) {
    let statusElement = document.getElementById(id);
    statusElement.innerText = message;
    statusElement.className = `status ${type}`;
}



// ✅ اختبار سرقة الحافظة (Clipboard Hijacking)
function testClipboard() {
    navigator.clipboard.readText().then(text => {
        if (text) {
            updateStatus("clipboardTest", "⚠️ موقعك يمكنه قراءة الحافظة! احذر.", "warning");
        } else {
            updateStatus("clipboardTest", "✅ موقعك لا يمكنه قراءة الحافظة.", "safe");
        }
    }).catch(() => updateStatus("clipboardTest", "❌ متصفحك يمنع قراءة الحافظة.", "danger"));
}

// ✅ اختبار كشف عنوان IP عبر WebRTC
async function testWebRTC() {
    if (!("RTCPeerConnection" in window)) {
        updateStatus("webrtcTest", "✅ متصفحك لا يدعم WebRTC، لا يوجد تسرب.", "safe");
        return;
    }

    let rtc = new RTCPeerConnection({ iceServers: [] });

    rtc.createDataChannel(""); // إنشاء قناة وهمية
    rtc.createOffer().then(offer => rtc.setLocalDescription(offer));

    rtc.onicecandidate = event => {
        if (event.candidate) {
            let ipRegex = /([0-9]{1,3}\.){3}[0-9]{1,3}/;
            let ipMatch = event.candidate.candidate.match(ipRegex);
            if (ipMatch) {
                updateStatus("webrtcTest", `⚠️ تسريب IP: ${ipMatch[0]}`, "warning");
            }
        }
    };

    setTimeout(() => {
        if (!document.getElementById("webrtcTest").innerText.includes("تسريب")) {
            updateStatus("webrtcTest", "✅ لا يوجد تسرب WebRTC", "safe");
        }
    }, 3000);
}
// ✅ اختبار تعقبك عبر Canvas Fingerprinting
function testCanvasFingerprinting() {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    ctx.fillText("Test", 10, 10);
    let data = canvas.toDataURL();
    if (data.length > 1000) {
        updateStatus("canvasTest", "⚠️ يمكن تتبعك عبر Canvas!", "warning");
    } else {
        updateStatus("canvasTest", "✅ لا يمكن تعقبك عبر Canvas.", "safe");
    }
}

// ✅ اختبار وصول المواقع للكاميرا والميكروفون
function testCameraAccess() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(() => updateStatus("cameraTest", "⚠️ لديك مواقع تملك إذن للوصول للكاميرا!", "warning"))
        .catch(() => updateStatus("cameraTest", "✅ لا يوجد مواقع تملك إذن للكاميرا.", "safe"));
}

// ✅ تحديث حالة الاختبارات
function updateStatus(id, message, type) {
    let statusElement = document.getElementById(id);
    statusElement.innerText = message;
    statusElement.className = `status ${type}`;
}

// ✅ اختبار قراءة الكوكيز (Cookies Access)
function testCookies() {
    let cookies = document.cookie;
    if (cookies) {
        updateStatus("cookiesTest", `⚠️ يمكن للمواقع قراءة الكوكيز لديك!`, "warning");
    } else {
        updateStatus("cookiesTest", "✅ لا توجد كوكيز متاحة للمواقع الحالي.", "safe");
    }
}


async function testWebRTC() {
    let rtc = new RTCPeerConnection({iceServers: [{urls: "stun:stun.l.google.com:19302"}]});
    rtc.createDataChannel("");
    rtc.createOffer().then(offer => rtc.setLocalDescription(offer));
    
    rtc.onicecandidate = event => {
        if (event.candidate) {
            let ipRegex = /([0-9]{1,3}\.){3}[0-9]{1,3}/;
            let match = ipRegex.exec(event.candidate.candidate);
            if (match) {
                updateStatus("webrtcTest", `❌ تم تسريب IP الحقيقي: ${match[0]}`, "danger");
            }
        }
    };
}

function testHistorySniffing() {
    let testLinks = ["https://facebook.com", "https://twitter.com", "https://youtube.com"];
    let visited = [];
    
    let iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    testLinks.forEach(link => {
        let start = performance.now();
        iframe.src = link;
        
        iframe.onload = () => {
            let duration = performance.now() - start;
            if (duration < 500) { // إذا كان التحميل أسرع من المتوقع، فربما يكون الرابط في الكاش (Visited)
                visited.push(link);
            }
        };
    });

    setTimeout(() => {
        document.body.removeChild(iframe);
        if (visited.length > 0) {
            updateStatus("historyTest", `⚠️ تم كشف المواقع التي زرتها: ${visited.join(", ")}`, "warning");
        } else {
            updateStatus("historyTest", "✅ لم يتم العثور على سجل تصفحك", "safe");
        }
    }, 3000);
}
// 📝 اختبار الملء التلقائي
function testAutofill() {
    let usernameField = document.querySelector('input[name="username"]');
    let passwordField = document.querySelector('input[name="password"]');

    setTimeout(() => {
        let username = usernameField.value;
        let password = passwordField.value;

        if (username || password) {
            updateStatus("autofillResult", `⚠️ تم اكتشاف بيانات ملء تلقائي: ${username} / ${"*".repeat(password.length)}`, "warning");
        } else {
            updateStatus("autofillResult", "✅ لم يتم إدخال بيانات تلقائيًا", "safe");
        }
    }, 1000);
}

// 🔊 اختبار بصمة الصوت (Audio Fingerprinting)
function testAudioFingerprint() {
    if (!window.AudioContext && !window.webkitAudioContext) {
        updateStatus("audioFingerprintResult", "❌ المتصفح لا يدعم بصمة الصوت", "error");
        return;
    }

    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let oscillator = audioCtx.createOscillator();
    let analyser = audioCtx.createAnalyser();
    let gain = audioCtx.createGain();
    
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    
    oscillator.connect(gain);
    gain.connect(analyser);
    analyser.connect(audioCtx.destination);
    
    oscillator.start();
    setTimeout(() => {
        let fingerprint = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatFrequencyData(fingerprint);
        
        let validData = fingerprint.filter(val => val !== -Infinity && val !== Infinity);
        let hash = validData.length > 0 ? validData.reduce((sum, val) => sum + val, 0).toFixed(3) : "غير متاح";
        
        updateStatus("audioFingerprintResult", `🔊 بصمة الصوت: ${hash}`, hash === "غير متاح" ? "error" : "warning");
        oscillator.stop();
    }, 500);
}
// 🖥️ اختبار اختراق التبويبات (Reverse Tabnabbing)
function testReverseTabnabbing() {
    let newTab = window.open("hhttps://0xdya.github.io/d1scan_beta/scan_page#test", "_blank");
    
    setTimeout(() => {
        if (newTab) {
            newTab.location = "https://dyaa-edin.github.io/d1scan_beta/scan_page#test";  // تغيير الصفحة إلى موقع خبيث
            updateStatus("tabnabbingResult", "⚠️ تم اختراق التبويب وإعادة توجيهه!", "danger");
        } else {
            updateStatus("tabnabbingResult", "❌ المتصفح منع فتح التبويب", "error");
        }
    }, 3000);
}

// تحديث حالة الاختبارات
function updateStatus(id, message, type) {
    let statusElement = document.getElementById(id);
    statusElement.innerText = message;
    statusElement.className = `status ${type}`;
}
