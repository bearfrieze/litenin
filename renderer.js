Renderer = function() {
    this.units = [
        {name: 'year', seconds: 60 * 60 * 24 * 365},
        {name: 'month', seconds: 60 * 60 * 24 * 30.42},
        {name: 'day', seconds: 60 * 60 * 24},
        {name: 'hour', seconds: 60 * 60},
        {name: 'minute', seconds: 60}
    ];
};

Renderer.prototype.render = function() {
    this.renderFeeds();
    this.renderEntries();
};

Renderer.prototype.renderFeeds = function() {
    var feeds = document.getElementById('feeds');
    feeds.innerHTML = '';
    var ul = feeds.appendChild(this.el('ul'));
    for (var url in this.store.feeds) {
        var feed = this.store.feeds[url];
        ul.appendChild(this.renderFeed(feed));
    }
};

Renderer.prototype.renderFeed = function(feed) {
    var li = this.el('li');
    li.appendChild(this.el('span', feed.title, 'title'));
    var remove = this.el('button', 'Remove feed', 'remove');
    remove.addEventListener('click', function() {
        this.store.removeFeed(feed.url);
        this.render();
    }.bind(this));
    li.appendChild(remove);
    return li;
};

Renderer.prototype.renderEntries = function() {
    var entry;
    var entries = document.getElementById('entries');
    entries.innerHTML = '';
    var unread = [];
    for (var url in this.store.feeds) {
        var feed = this.store.feeds[url];
        for (var key in feed.entries) {
            entry = feed.entries[key];
            if (!entry.read) unread.push(entry);
        }
    }

    if (unread.length <= 0) {
        var lastUpdate = this.el('p', '', 'lastUpdate');
        entries.appendChild(lastUpdate);
        var base = 'No unread entries available, last update ';
        if (this.interval) clearInterval(this.interval);
        var update = function() {
            var seconds = Math.round((new Date() - this.store.updated) / 1000);
            lastUpdate.innerHTML = base + seconds + " seconds ago.";
        }.bind(this);
        update();
        this.interval = setInterval(update, 1000);
        return;
    }

    unread.sort(function(a, b) { return b.unix - a.unix; });
    var ul = this.el('ul');
    for (var i = 0; i < unread.length; i++) {
        entry = unread[i];
        ul.appendChild(this.renderEntry(entry));
    }
    entries.appendChild(ul);
    var readAll = this.el('button', 'Mark all as read', 'huge');
    readAll.addEventListener('click', function() {
        this.store.readAll();
        this.renderEntries();
    }.bind(this));
    entries.appendChild(readAll);
};

Renderer.prototype.renderEntry = function(entry) {
    var li = this.el('li');
    var a = li.appendChild(this.el('a'));
    a.href = entry.link;
    a.appendChild(this.el('span', entry.title, 'title'));
    a.appendChild(this.el('span', entry.feedTitle, 'feedTitle'));
    a.appendChild(this.el('span', this.timeSince(entry), 'publishedDate right'));
    a.addEventListener('click', function() {
        this.store.readEntry(entry);
        this.renderEntries();
    }.bind(this));
    return li;
};

Renderer.prototype.el = function(type, text, cls) {
    var el = document.createElement(type);
    if (text) el.innerHTML = text;
    if (cls) el.className = cls;
    return el;
};

Renderer.prototype.timeSince = function(entry) {
    var seconds = Math.floor((new Date().getTime() - entry.unix) / 1000);
    for (var i = 0; this.units.length; i++) {
        var unit = this.units[i];
        var divided = Math.floor(seconds / unit.seconds);
        if (divided >= 1) {
            var result = divided + " " + unit.name;
            if (divided > 1) result += 's';
            return result + " ago";
        }
    }
};

Renderer.prototype.err = function(message) {
    console.log(message);
    var error = document.getElementById('error');
    error.innerHTML = message;
    error.classList.remove('hidden');
    setTimeout(function() {
        error.classList.add('hidden');
    }, 3000);
};

Renderer.prototype.welcome = function() {
    var feeds = document.getElementById('feeds');
    feeds.innerHTML = '<p>You have no feeds to manage.</p>';
    var entries = document.getElementById('entries');
    entries.innerHTML = '<p>Welcome to Lightning, a very light and shockingly fast feed reader.</p>';
    entries.innerHTML += '<p>Please add your favourite feed to get started.</p>';
};