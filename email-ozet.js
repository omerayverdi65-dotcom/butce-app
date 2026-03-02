// Haftalık Özet Mail Modülü
var EmailOzet = {
    
    // Email gönder (Formspree kullanarak - ücretsiz)
    sendWeeklyReport: function() {
        var email = localStorage.getItem('userEmail');
        if (!email) {
            console.log('Email adresi kaydedilmemiş');
            return;
        }
        
        var rapor = this.generateReport();
        
        // Formspree endpoint (kendi hesabınızı oluşturun)
        fetch('https://formspree.io/f/YOUR_FORM_ID', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                subject: 'Haftalık Finans Özeti - ' + new Date().toLocaleDateString('tr-TR'),
                message: rapor
            })
        }).then(function(response) {
            if (response.ok) {
                console.log('Email gönderildi');
                localStorage.setItem('lastEmailSent', Date.now());
            }
        });
    },
    
    generateReport: function() {
        var butce = JSON.parse(localStorage.getItem('butce')) || [];
        var isler = JSON.parse(localStorage.getItem('isler')) || [];
        
        var buHafta = new Date();
        buHafta.setDate(buHafta.getDate() - 7);
        
        var haftalikButce = butce.filter(function(b) {
            return new Date(b.tarih) >= buHafta;
        });
        
        var gelir = haftalikButce.filter(function(b) { return b.tip === 'gelir'; })
            .reduce(function(t, b) { return t + b.miktar; }, 0);
        var gider = haftalikButce.filter(function(b) { return b.tip === 'gider'; })
            .reduce(function(t, b) { return t + b.miktar; }, 0);
        
        var tamamlananIs = isler.filter(function(i) {
            return i.tamamlandi && new Date(i.tarih) >= buHafta;
        }).length;
        
        return `
Haftalık Özeti (${new Date().toLocaleDateString('tr-TR')})

💰 FİNANS DURUMU:
• Gelir: ${gelir.toLocaleString()} TL
• Gider: ${gider.toLocaleString()} TL
• Net: ${(gelir - gider).toLocaleString()} TL

📋 İŞLER:
• Tamamlanan: ${tamamlananIs} iş

Kişisel Asistan
        `;
    },
    
    // Email adresi kaydet
    saveEmail: function(email) {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('emailEnabled', 'true');
    },
    
    // Otomatik gönderimi kontrol et
    checkAndSend: function() {
        var lastSent = parseInt(localStorage.getItem('lastEmailSent')) || 0;
        var now = Date.now();
        var oneWeek = 7 * 24 * 60 * 60 * 1000;
        
        // Her pazar gönder
        var bugun = new Date();
        if (bugun.getDay() === 0 && (now - lastSent > oneWeek)) {
            this.sendWeeklyReport();
        }
    }
};

// Her gün kontrol et
setInterval(function() {
    EmailOzet.checkAndSend();
}, 24 * 60 * 60 * 1000);
