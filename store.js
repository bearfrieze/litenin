Store = function() {
    this.feeds = this.getStore('feeds');
    if (!this.feeds) this.feeds = {};
    this.read = this.getStore('read');
    if (!this.read) this.read = {};
    this.teasers = this.getStore('teasers');
    if (this.teasers === undefined) this.teasers = false;
    this.items = {};
    this.static = 'http://static.liten.in/';
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
    xhr.open('POST', this.static, true);
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
    this.read = {};
    this.setStore('read', this.read);
    this.items = {};
    this.loadFeeds();
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
        this.renderer.err(url + ' is not a valid feed.');
        this.removeFeed(url);
        return;
    } else if (feed === true) {
        this.renderer.err('We are fetching your feeds. Please refresh in a few seconds.');
        return;
    }
    if (url !== feed.url) {
        this.feeds[feed.url] = this.feeds[url];
        this.removeFeed(url);
    }
    if (feed.items === null) {
        return;
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
        for (var i = 5; i < items.length; i++) {
            var item = items[i];
            if (!item.unix || item.unix < yesterday) {
                this.read[item.guid] = now;
            }
        }
        localFeed.loaded = true;
        this.setStore('read', this.read);
        this.setStore('feeds', this.feeds);
    }
};

Store.prototype.readItem = function(item) {
    if (typeof this.read[item.guid] === 'undefined') {
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

Store.prototype.getOPML = function() {
    var opml = [];
    opml.push('<?xml version="1.0" encoding="UTF-8"?>\n');
    opml.push('<opml version="1.0">\n');
    opml.push('\t<head>\n');
    opml.push('\t\t<title>Litenin feed subscriptions</title>\n');
    opml.push('\t</head>\n');
    opml.push('\t<body>\n');
    for (var key in this.feeds) {
        var feed = this.feeds[key];
        opml.push('\t\t<outline type="rss" text="' + feed.title + '" title="' + feed.title + '" xmlUrl="' + feed.url + '" htmlUrl="' + feed.url + '" />\n');
    }
    opml.push('\t</body>\n');
    opml.push('</opml>\n');
    return new Blob(opml, {type: 'application/xml;charset=utf-8'});
};

Store.prototype.toggleTeasers = function() {
    this.teasers = !this.teasers;
    this.setStore('teasers', this.teasers);
};