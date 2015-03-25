run = function() {
    var renderer = new Renderer();
    var store = new Store();
    renderer.store = store;
    store.renderer = renderer;
    store.loadFeeds();

    var feedUrl = document.getElementById('feedUrl');
    var addFeed = document.getElementById('addFeed');
    var submit = function() {
        store.addFeeds([feedUrl.value]);
        feedUrl.value = '';
    };
    addFeed.addEventListener('click', submit);
    feedUrl.addEventListener('keydown', function(e) {
        if (e.keyCode == 13) submit();
    });

    var feeds = document.getElementById('feeds');
    var manageFeeds = document.getElementById('manageFeeds');
    manageFeeds.addEventListener('click', function() {
        feeds.classList.toggle('hidden');
    });

    window.addEventListener('focus', function() {
        var seconds = (new Date() - this.updated) / 1000;
        if (seconds < 60) return;
        this.loadFeeds();
    }.bind(store));
};

google.setOnLoadCallback(run);
google.load("feeds", "1", {nocss: true});