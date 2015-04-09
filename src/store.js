Store = function() {
    this.feeds = this.getStore('feeds');
    if (!this.feeds) this.feeds = {};
    this.read = this.getStore('read');
    if (!this.read) this.read = {};
    this.entries = {};
};

Store.prototype.setStore = function(key, store) {
    localStorage.setItem(key, JSON.stringify(store));
};

Store.prototype.getStore = function(key) {
    var store = localStorage.getItem(key);
    return store && JSON.parse(store);
};

Store.prototype.queryFeeds = function(urls, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function (argument) {
        callback(JSON.parse(xhr.responseText));
    };
    xhr.open("post", "http://localhost:8666/", true);
    xhr.send(JSON.stringify(urls));
};

Store.prototype.addFeeds = function(urls) {
    this.count = urls.length;
    for (var i = 0; i < urls.length; i++) {
        if (urls[i].indexOf('http') !== 0) urls[i] = 'http://' + urls[i];
    };
    this.queryFeeds(urls, function(feeds) {
        for (var i = 0; i < feeds.length; i++) {
            var entries = feeds[i].items;
            if (!entries) {
                --this.count;
                continue;
            }
            var feed = this.feeds[feeds[i].url] = {
                title: feeds[i].title,
                url: feeds[i].url
            };
            var now = new Date().getTime();
            for (var j = this.initEntries; j < entries.length; j++) {
                var entry = entries[j];
                this.read[this.entryHash(feed.url, entry.title, entry.pubDate)] = now;
            }
            this.loadFeed(feeds[i]);
        }
        this.setStore('feeds', this.feeds);
        this.setStore('read', this.read);
    }.bind(this))
};

Store.prototype.removeFeed = function(url) {
    delete this.feeds[url];
    this.setStore('feeds', this.feeds);
};

Store.prototype.clearFeeds = function() {
    this.feeds = {};
    this.setStore('feeds', this.feeds);
};

Store.prototype.loadFeeds = function() {
    var urls = Object.keys(this.feeds)
    if (urls.length === 0) return;
    this.count = urls.length;
    if (this.count <= 0) this.renderer.welcome();
    this.queryFeeds(urls, function(feeds) {
        for (var i = 0; i < feeds.length; i++) {
            this.loadFeed(feeds[i]);
        }
    }.bind(this))
};

Store.prototype.loadFeed = function(feed) {
    console.log(feed);
    var entries = feed.items;
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var hasDate = entry.pubDate.length !== 0;
        entry.unix = hasDate ? new Date(entry.pubDate).getTime() : 0;
        entry.hash = this.entryHash(feed.url, entry.title, entry.pubDate);
        entry.feedTitle = feed.title;
        entry.feedUrl = feed.url;
        if (typeof this.read[entry.hash] !== "undefined") continue;
        this.entries[entry.hash] = entry;
    }
    if (--this.count === 0) {
        this.updated = new Date();
        this.renderer.render();
    }
};

Store.prototype.readEntry = function(entry) {
    if (typeof this.read[entry.hash] === "undefined") {
        this.read[entry.hash] = new Date().getTime();
    }
    this.setStore('read', this.read);
};

Store.prototype.readAll = function() {
    var now = new Date().getTime();
    for (var key in this.entries) {
        this.read[key] = now;
    }
    this.setStore('read', this.read);
};

Store.prototype.entryHash = function(url, title, date) {
    // http://jsperf.com/hashcodelordvlad
    var s = url + title + date;
    var hash = 0, i, char;
    if (s.length === 0) return hash;
    for (i = 0, l = s.length; i < l; i++) {
        char = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};