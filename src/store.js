Store = function() {
    this.feeds = this.getStore('feeds');
    if (!this.feeds) this.feeds = {};
    this.read = this.getStore('read');
    if (!this.read) this.read = {};
    this.initEntries = 5;
    this.numEntries = 20;
    this.entries = {};
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
    feed.load(callback);
};

Store.prototype.addFeeds = function(urls) {
    this.count = urls.length;
    for (var i = 0; i < urls.length; i++) {
        this.addFeed(urls[i]);
    }
};

Store.prototype.addFeed = function(url) {
    if (url.indexOf('http') !== 0) url = 'http://' + url;
    this.queryFeed(url, function(result) {
        if (result.error) {
            this.count--;
            return this.renderer.err(result.error.message + ": " + url);
        }
        var feed = this.feeds[result.feed.feedUrl] = {
            title: result.feed.title,
            url: result.feed.feedUrl
        };
        var entries = result.feed.entries;
        var now = new Date().getTime();
        for (var i = this.initEntries; i < entries.length; i++) {
            var entry = entries[i];
            this.read[this.entryHash(feed.url, entry.title, entry.publishedDate)] = now;
        }
        this.loadFeed(result);
    }.bind(this));
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
    this.count = Object.keys(this.feeds).length;
    if (this.count <= 0) this.renderer.welcome();
    for (var url in this.feeds) {
        this.queryFeed(url, this.loadFeed.bind(this));
    }
};

Store.prototype.loadFeed = function(result) {
    var feed = this.feeds[result.feed.feedUrl];
    var entries = result.feed.entries;
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var hasDate = entry.publishedDate.length !== 0;
        entry.unix = hasDate ? new Date(entry.publishedDate).getTime() : 0;
        entry.hash = this.entryHash(feed.url, entry.title, entry.publishedDate);
        entry.feedTitle = feed.title;
        entry.feedUrl = feed.url;
        if (typeof this.read[entry.hash] !== "undefined") continue;
        this.entries[entry.hash] = entry;
    }
    if (--this.count === 0) {
        this.setStore('feeds', this.feeds);
        this.setStore('read', this.read);
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