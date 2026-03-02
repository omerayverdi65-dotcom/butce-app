// Bulut Senkronizasyon Modülü
var CloudSync = {
    config: {
        apiKey: "AIzaSyByyHF3X2mU4nB3tYJm9H3wnGbuXSqcfbk",
        authDomain: "kisiselasistan-d8d06.firebaseapp.com",
        databaseURL: "https://kisiselasistan-d8d06-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "kisiselasistan-d8d06",
        storageBucket: "kisiselasistan-d8d06.firebasestorage.app",
        messagingSenderId: "730314677424",
        appId: "1:730314677424:web:4edb402170cd601f11af75"
    },
    
    db: null,
    userId: null,
    
    init: function() {
        if (typeof firebase === 'undefined') {
            console.error('Firebase yok!');
            return;
        }
        
        firebase.initializeApp(this.config);
        this.db = firebase.database();
        this.userId = localStorage.getItem('userId') || this.generateUserId();
        
        console.log('Başlatılıyor...');
        
        // ÖNCE veriyi çek
        this.pullData();
    },
    
    generateUserId: function() {
        var id = 'user_' + Date.now();
        localStorage.setItem('userId', id);
        return id;
    },
    
    pullData: function() {
        var self = this;
        console.log('Veri çekiliyor...');
        
        this.db.ref('users/' + this.userId).once('value').then(function(snapshot) {
            var data = snapshot.val();
            console.log('Gelen veri:', data);
            
            if (data && data.butce) {
                localStorage.setItem('butce', JSON.stringify(data.butce));
                console.log('Bütçe kaydedildi:', data.butce.length);
                
                // SAYFAYI YENİLE (en güvenli yöntem)
                setTimeout(function() {
                    location.reload();
                }, 500);
            }
        });
    },
    
    pushData: function() {
        var data = {
            butce: JSON.parse(localStorage.getItem('butce')) || [],
            isler: JSON.parse(localStorage.getItem('isler')) || [],
            hatirlatmalar: JSON.parse(localStorage.getItem('hatirlatmalar')) || [],
            hedefler: JSON.parse(localStorage.getItem('hedefler')) || []
        };
        
        this.db.ref('users/' + this.userId).set(data);
        console.log('Veri gönderildi');
    }
};

// Başlat
document.addEventListener('DOMContentLoaded', function() {
    CloudSync.init();
});