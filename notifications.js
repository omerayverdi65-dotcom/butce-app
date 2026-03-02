// Push Bildirim Yönetimi
var NotificationManager = {
    
    // Bildirim izni iste
    requestPermission: function() {
        if (!('Notification' in window)) {
            console.log('Bu tarayıcı bildirim desteklemiyor');
            return;
        }
        
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                console.log('Bildirim izni verildi');
                NotificationManager.scheduleAllNotifications();
            }
        });
    },
    
    // Tüm hatırlatmaları planla
    scheduleAllNotifications: function() {
        var hatirlatmalar = JSON.parse(localStorage.getItem('hatirlatmalar')) || [];
        var simdi = new Date();
        
        hatirlatmalar.forEach(function(h) {
            if (!h.tamamlandi) {
                var hatirlatmaZamani = new Date(h.tarih + 'T' + h.saat);
                var fark = hatirlatmaZamani - simdi;
                
                // Gelecekteki hatırlatmaları planla (max 50 gün sonra)
                if (fark > 0 && fark < 50 * 24 * 60 * 60 * 1000) {
                    setTimeout(function() {
                        NotificationManager.showNotification(h.baslik, h.aciklama);
                    }, fark);
                }
            }
        });
    },
    
    // Anında bildirim göster
    showNotification: function(baslik, aciklama) {
        if (Notification.permission === 'granted') {
            var options = {
                body: aciklama || 'Hatırlatma zamanı geldi!',
                icon: 'icon-192x192.png',
                badge: 'icon-72x72.png',
                vibrate: [200, 100, 200],
                tag: 'hatirlatma-' + Date.now(),
                requireInteraction: true,
                actions: [
                    {
                        action: 'tamamlandi',
                        title: 'Tamamlandı'
                    },
                    {
                        action: 'ertele',
                        title: '15 dk Ertele'
                    }
                ]
            };
            
            navigator.serviceWorker.ready.then(function(registration) {
                registration.showNotification(baslik, options);
            });
        }
    },
    
    // Test bildirimi
    testNotification: function() {
        this.showNotification('Test Bildirimi', 'Bildirim sistemi çalışıyor! 🎉');
    }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    // Bildirim izni kontrolü
    if (Notification.permission === 'default') {
        // Kullanıcıya izin iste (anasayfada gösterilebilir)
        setTimeout(function() {
            if (confirm('Hatırlatmalar için bildirim izni vermek ister misiniz?')) {
                NotificationManager.requestPermission();
            }
        }, 2000);
    } else if (Notification.permission === 'granted') {
        NotificationManager.scheduleAllNotifications();
    }
});
