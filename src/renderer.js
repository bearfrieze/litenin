Renderer = function() {
    this.units = [
        {name: 'year', seconds: 60 * 60 * 24 * 365},
        {name: 'month', seconds: 60 * 60 * 24 * 30.42},
        {name: 'day', seconds: 60 * 60 * 24},
        {name: 'hour', seconds: 60 * 60},
        {name: 'minute', seconds: 60},
        {name: 'second', seconds: 1}
    ];
};

Renderer.prototype.render = function() {
    this.renderFeeds();
    this.renderItems();
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
    var remove = li.appendChild(this.el('button', '✕', 'remove'));
    remove.addEventListener('click', function() {
        this.store.removeFeed(feed.url);
        this.render();
    }.bind(this));
    return li;
};

Renderer.prototype.renderItems = function() {
    var item;
    var items = document.getElementById('items');
    items.innerHTML = '';
    var unread = [];
    for (var key in this.store.items) {
        item = this.store.items[key];
        if (typeof this.store.read[item.guid] === "undefined") {
            unread.push(item);
        }
    }
    if (unread.length <= 0) {
        var lastUpdate = this.el('p', '', 'lastUpdate');
        items.appendChild(lastUpdate);
        var base = 'No unread items available, last update ';
        if (this.interval) clearInterval(this.interval);
        var update = function() {
            var seconds = Math.ceil((new Date() - this.store.updated) / 1000);
            lastUpdate.innerHTML = base + this.timePretty(seconds);
        }.bind(this);
        update();
        this.interval = setInterval(update, 1000);
        return;
    }

    unread.sort(function(a, b) { return b.unix - a.unix; });
    var ul = this.el('ul');
    for (var i = 0; i < unread.length; i++) {
        item = unread[i];
        ul.appendChild(this.renderItem(item));
    }
    items.appendChild(ul);
    var readAll = this.el('button', 'Mark all as read', 'huge');
    readAll.addEventListener('click', function() {
        this.store.readAll();
        this.renderItems();
    }.bind(this));
    items.appendChild(readAll);
};

Renderer.prototype.renderItem = function(item) {
    var li = this.el('li');
    var a = li.appendChild(this.el('a'));
    a.href = item.link;
    a.appendChild(this.el('span', item.feedTitle, 'feedTitle'));
    a.appendChild(this.el('span', item.title, 'title'));
    a.appendChild(this.el('span', this.timeSince(item), 'publishedDate right'));
    a.addEventListener('click', function(e) {
        this.store.readItem(item);
        a.classList.add('read');
    }.bind(this));
    return li;
};

Renderer.prototype.el = function(type, text, cls) {
    var el = document.createElement(type);
    if (text) el.innerHTML = text;
    if (cls) el.className = cls;
    return el;
};

Renderer.prototype.timeSince = function(item) {
    if (!item.unix) return "";
    var seconds = Math.ceil(new Date().getTime() / 1000) - item.unix;
    return this.timePretty(seconds);
};

Renderer.prototype.timePretty = function(seconds) {
    var unit, divided;
    for (var i = 0; i < this.units.length; i++) {
        unit = this.units[i];
        divided = Math.floor(seconds / unit.seconds);
        if (divided >= 1) {
            break;
        }
    }
    var result = divided + " " + unit.name;
    if (divided != 1) result += 's';
    return result + " ago";
}

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
    var items = document.getElementById('items');
    items.innerHTML = '<p>Welcome to Litenin, a very light and shockingly fast feed reader.</p>';
    items.innerHTML += '<p>Please add your favourite feed to get started, or import your feeds from OPML below.</p>';
    items.innerHTML += '<p>If you are using <a href="http://feedly.com" title="Feedly">Feedly</a> you can get your OPML <a href="http://feedly.com/i/opml" title="Export Feedly OPML">here</a>.';
    var drop = items.appendChild(this.el('div', 'Drop your OPML here to import', 'drop'));
    var stop = function(e) { e.preventDefault(); e.stopPropagation(); };
    var toggle = function(e) { stop(e); drop.classList.toggle('hover'); };
    drop.addEventListener("dragenter", toggle, false);
    drop.addEventListener("dragover", stop);
    drop.addEventListener("dragleave", toggle, false);
    drop.addEventListener("drop", function(e) {
        toggle(e);
        var file = e.dataTransfer.files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
            var opml = new OPML(e.target.result);
            this.store.addFeeds(opml.parseUrls());
        }.bind(this);
        reader.readAsText(file);
    }.bind(this), false);
};