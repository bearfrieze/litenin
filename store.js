Store = function() {
    this.feeds = this.getStore('feeds');
    if (!this.feeds) this.feeds = {};
    this.read = this.getStore('read');
    if (!this.read) this.read = {};
    this.items = {};
    this.static = "http://static.liten.in/";
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
    xhr.open("POST", this.static, true);
    xhr.send(JSON.stringify(urls));
};

Store.prototype.addFeeds = function(urls) {
    for (var i = 0; i < urls.length; i++) {
        if (urls[i].indexOf('http') !== 0) urls[i] = 'http://' + urls[i];
        this.feeds[urls[i]] = {
            title: urls[i],
            url: urls[i],
            loaded: false
        };
    }
    this.setStore('feeds', this.feeds);
    this.loadFeeds();
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
    var urls = Object.keys(this.feeds);
    if (urls.length <= 0) return this.renderer.welcome();
    this.queryFeeds(urls, function(feeds) {
        for (var url in feeds) {
            this.loadFeed(url, feeds[url]);
        }
        this.updated = new Date();
        this.renderer.render();
    }.bind(this));
};

Store.prototype.loadFeed = function(url, feed) {
    if (feed === false) {
        delete this.feeds[url];
        return;
    } else if (feed === true) {
        this.renderer.err("I have never seen this feed before! Please wait a while and then refresh.");
        return;
    }
    if (url !== feed.url) {
        this.feeds[feed.url] = this.feeds[url];
        delete this.feeds[url];
    }
    var items = feed.items;
    var now = Math.ceil(new Date().getTime() / 1000);
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!item.unix) {
            item.unix = Math.ceil(new Date(item.published_at).getTime() / 1000);
        }
        item.feedTitle = feed.title;
        item.feedUrl = feed.url;
        this.items[item.guid] = item;
    }
    var localFeed = this.feeds[feed.url];
    if (!localFeed.loaded) {
        localFeed.title = feed.title;
        var yesterday = now - 24 * 60 * 60;
        items = items.forEach(function(item) {
            if (!item.unix || item.unix < yesterday) {
                this.read[item.guid] = now;
            }
        }.bind(this));
        localFeed.loaded = true;
        this.setStore('feeds', this.feeds);
        this.setStore('read', this.read);
    }
};

Store.prototype.readItem = function(item) {
    if (typeof this.read[item.guid] === "undefined") {
        this.read[item.guid] = Math.ceil(new Date().getTime() / 1000);
    }
    this.setStore('read', this.read);
};

Store.prototype.readAll = function() {
    var now = Math.ceil(new Date().getTime() / 1000);
    for (var key in this.items) {
        this.read[key] = now;
    }
    this.setStore('read', this.read);
};