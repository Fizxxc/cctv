const video = document.getElementById('video');
        const alertSound = document.getElementById('alertSound');
        const statusText = document.getElementById('status');

        let botToken = '7250228481:AAG-C6TQMlIH8g0MZgEocnyNuaKRUaWzpYE';
        let adminId = localStorage.getItem('adminId') || '';

        document.getElementById('adminId').value = adminId;

        function saveAdminId() {
            adminId = document.getElementById('adminId').value;
            localStorage.setItem('adminId', adminId);
            statusText.textContent = '✅ Admin ID berhasil disimpan!';
        }
        
        async function setupCamera() {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            return new Promise(resolve => video.onloadedmetadata = resolve);
        }
        
        async function detectMotion() {
            const model = await cocoSsd.load();
            setInterval(async () => {
                const predictions = await model.detect(video);
                let motionDetected = false;
                
                predictions.forEach(prediction => {
                    if (prediction.score > 0.5) {
                        motionDetected = true;
                    }
                });
                
                if (motionDetected) {
                    alertSound.play();
                    sendTelegramAlert();
                }
            }, 3000);
        }
        
        async function sendTelegramAlert() {
            if (!adminId) {
                statusText.textContent = '⚠️ Admin ID belum diset!';
                return;
            }
            
            const message = '⚠️ Deteksi gerakan mencurigakan di area kasir!';
            
            fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chat_id: adminId, text: message })
            });
        }
        
        setupCamera().then(detectMotion);