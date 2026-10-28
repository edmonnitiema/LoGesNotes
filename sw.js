/* GESTION DES NOTES : fonctionnement hors ligne */
var CACHE='gestion-notes-v5';
var FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./cle-publique.js'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return Promise.all(FILES.map(function(f){return c.add(f).catch(function(){})}))}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var r=e.request;
  if(r.method!=='GET') return;
  var u=new URL(r.url);
  if(u.origin!==location.origin) return; /* polices Google : le navigateur gère, la police de secours prend le relais hors ligne */
  e.respondWith(
    caches.match(r,{ignoreSearch:true}).then(function(hit){
      var net=fetch(r).then(function(res){
        if(res&&res.ok){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(r,cp)})}
        return res;
      }).catch(function(){return hit});
      return hit||net;
    }).then(function(res){return res||caches.match('./index.html')})
  );
});
