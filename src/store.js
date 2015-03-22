Store = function() {
    this.feeds = this.getStore('feeds');
    if (!this.feeds) this.feeds = {};
    this.initEntries = 5;
    this.numEntries = 20;
    this.maxEntries = 100;
};

Store.prototype.setStore = function(key, store) {
    localStorage.setItem(key, JSON.stringify(store));
};

Store.prototype.getStore = function(key) {
    var store = localStorage.getItem(key);
    return store && JSON.parse(store);
};

Store.prototype.queryFeed = function(url, callback) {
    var feed = new google.feeds.Feed(url);
    feed.includeHistoricalEntries();
    feed.setNumEntries(this.numEntries);
    feed.load(function(result) {
        callback(result);
        if (--this.count === 0) {
            this.setStore('feeds', this.feeds);
            this.updated = new Date();
            this.renderer.render();
        }
    }.bind(this));
};

Store.prototype.addFeed = function(url) {
    if (url.indexOf('http') !== 0) url = 'http://' + url;
    this.queryFeed(url, function(result) {
        if (result.error) return this.renderer.err(result.error.message);
        this.feeds[result.feed.feedUrl] = {
            entries: {},
            title: result.feed.title,
            url: result.feed.feedUrl
        };
        var entries = result.feed.entries;
        var now = new Date().getTime();
        for (var i = this.initEntries; i < entries.length; i++) {
            entries[i].read = now;
        }
        this.loadFeed(result);
        this.setStore('feeds', this.feeds);
        this.renderer.render();
    }.bind(this));
};

Store.prototype.removeFeed = function(url) {
    delete this.feeds[url];
    this.setStore('feeds', this.feeds);
};

Store.prototype.cleanFeed = function(url) {
    console.log('clearerere');
    var sorted = [];
    var entries = this.feeds[url].entries;
    for (var key in entries) sorted.push(entries[key]);
    sorted.sort(function(a, b) { return b.unix - a.unix; });
    for (var i = this.maxEntries / 2; i < sorted.length; i++) {
        delete entries[sorted[i].hash];
    }
};

Store.prototype.clearFeeds = function() {
    this.feeds = {};
    this.setStore('feeds', this.feeds);
};

Store.prototype.loadFeeds = function() {
    this.count = Object.keys(this.feeds).length;
    if (this.count <= 0) this.renderer.welcome();
    for (var url in this.feeds) {
        this.queryFeed(url, this.loadFeed.bind(this));
    }
};

Store.prototype.loadFeed = function(result) {
    if (result.error) return;
    var feed = this.feeds[result.feed.feedUrl];
    var entries = result.feed.entries;
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        entry.unix = new Date(entry.publishedDate).getTime();
        entry.hash = this.entryHash(entry);
        entry.feedTitle = feed.title;
        entry.feedUrl = feed.url;
        if (entry.hash in feed.entries && feed.entries[entry.hash].read) continue;
        feed.entries[entry.hash] = entry;
    }
    var numEntries = Object.keys(feed.entries).length;
    if (numEntries > this.maxEntries) this.cleanFeed(feed.url);
};

Store.prototype.readEntry = function(entry) {
    if (!entry.read) entry.read = new Date().getTime();
    this.setStore('feeds', this.feeds);
};

Store.prototype.readAll = function() {
    var now = new Date().getTime();
    for (var url in this.feeds) {
        for (var key in this.feeds[url].entries) {
            var entry = this.feeds[url].entries[key];
            if (!entry.read) entry.read = now;
        }
    }
    this.setStore('feeds', this.feeds);
};

Store.prototype.entryHash = function(entry) {
    // http://jsperf.com/hashcodelordvlad
    var s = entry.title + entry.publishedDate;
    var hash = 0, i, char;
    if (s.length === 0) return hash;
    for (i = 0, l = s.length; i < l; i++) {
        char = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};