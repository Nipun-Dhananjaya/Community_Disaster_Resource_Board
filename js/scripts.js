(function () {
    // map pins (positions as % of map box)
    var pins = [
        {
            x: 58,
            y: 36,
            c: 'g',
            i: 'i-home',
            t: 'Church Hall Shelter',
            s: 'Available',
            d: '12 beds free',
            k: '0.8 km',
            m: 5
        },
        {
            x: 84,
            y: 34,
            c: 'o',
            i: 'i-box',
            t: 'Water Point, Katunayake',
            s: 'Limited',
            d: '500 bottles',
            k: '4.1 km',
            m: 20
        },
        {x: 88, y: 38, c: 'g', i: 'i-home', t: 'Community Hall', s: 'Available', d: '30 beds free', k: '3.0 km', m: 11},
        {
            x: 79,
            y: 46,
            c: 'r',
            i: 'i-alert',
            t: 'Family of 5 needs evacuation',
            s: 'Critical',
            d: 'Boat or truck',
            k: '1.9 km',
            m: 9
        },
        {x: 84, y: 48, c: 'n', n: 8, t: '8 listings nearby', s: 'Cluster', d: 'Zoom to see all', k: '', m: 2, big: 1},
        {x: 65, y: 57, c: 'g', i: 'i-home', t: 'Temple Shelter', s: 'Available', d: '18 beds free', k: '1.5 km', m: 15},
        {x: 60, y: 63, c: 'n', n: 5, t: '5 listings nearby', s: 'Cluster', d: 'Zoom to see all', k: '', m: 3, big: 1},
        {x: 77, y: 63, c: 'p', i: 'i-heart', t: 'Volunteer team', s: 'Ready', d: '6 people, 1 van', k: '2.2 km', m: 7},
        {x: 91, y: 58, c: 't', i: 'i-arrow', t: 'Ride offered', s: 'Available', d: '4 seats, 4x4', k: '3.4 km', m: 13}
    ];
    var map = document.getElementById('map');
    var pop = document.createElement('div');
    pop.className = 'pop';
    pop.setAttribute('role', 'status');

    function show(p, btn) {
        var col = {g: '--green', o: '--orange', r: '--red', p: '--purple', t: '--teal', n: '--navy'}[p.c];
        pop.style.borderLeftColor = 'var(' + col + ')';
        var ok = p.s === 'Available' || p.s === 'Ready';
        pop.innerHTML = '<span class="ic ' + p.c + '"><svg><use href="#' + (p.i || 'i-home') + '"/></svg></span><div><h3></h3><div class="row"><span class="st ' + (ok ? 'ok' : p.s === 'Critical' ? 'crit' : 'lim') + '"></span><span></span></div><p></p></div>';
        pop.querySelector('h3').textContent = p.t;
        pop.querySelectorAll('.row span')[0].textContent = (ok ? '● ' : '▲ ') + p.s;
        pop.querySelectorAll('.row span')[1].textContent = p.d;
        pop.querySelector('p').textContent = (p.k ? p.k + ' · ' : '') + 'Updated ' + p.m + ' min ago';
        map.querySelectorAll('.pin').forEach(function (b) {
            b.classList.remove('sel')
        });
        if (btn) btn.classList.add('sel');
    }

    pins.forEach(function (p) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'pin ' + p.c + (p.big ? ' big' : '');
        b.style.left = p.x + '%';
        b.style.top = p.y + '%';
        b.setAttribute('aria-label', p.t);
        b.style.background = 'var(' + ({
            g: '--green',
            o: '--orange',
            r: '--red',
            p: '--purple',
            t: '--teal',
            n: '--navy'
        }[p.c]) + ')';
        if (p.n) b.textContent = p.n; else b.innerHTML = '<svg><use href="#' + p.i + '"/></svg>';
        b.addEventListener('click', function () {
            show(p, b)
        });
        map.appendChild(b);
    });
    map.appendChild(pop);
    show({
        c: 'g',
        i: 'i-home',
        t: 'Central College Relief Centre',
        s: 'Available',
        d: '38 beds free',
        k: '1.2 km',
        m: 12
    });

    // mobile menu
    var menu = document.getElementById('menu'), nav = document.getElementById('nav');
    menu.addEventListener('click', function () {
        var o = nav.classList.toggle('open');
        menu.setAttribute('aria-expanded', o);
    });
    nav.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') nav.classList.remove('open')
    });

    // language toggle
    var langs = ['EN', 'සිං', 'தமி'], li = 0, lb = document.getElementById('lang');
    lb.addEventListener('click', function () {
        li = (li + 1) % 3;
        lb.textContent = langs[li] + ' ▾';
        document.documentElement.lang = ['en', 'si', 'ta'][li]
    });

    // location
    var msg = document.getElementById('geo-msg');
    document.getElementById('geo').addEventListener('click', function () {
        if (!navigator.geolocation) {
            msg.style.color = '#c62b21';
            msg.textContent = 'Location is not available. Enter your town or postcode.';
            return
        }
        msg.style.color = '';
        msg.textContent = 'Finding your location…';
        navigator.geolocation.getCurrentPosition(function () {
            msg.style.color = 'var(--green)';
            msg.textContent = 'Location found. Showing listings within 10 km.';
        }, function () {
            msg.style.color = '#c62b21';
            msg.textContent = 'Could not get your location. Enter your town or postcode.';
        }, {timeout: 8000});
    });
    document.getElementById('search').addEventListener('submit', function (e) {
        e.preventDefault();
        go()
    });
    document.getElementById('place').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            go()
        }
    });

    function go() {
        var v = document.getElementById('place').value.trim();
        msg.style.color = v ? 'var(--green)' : '#c62b21';
        msg.textContent = v ? 'Showing listings near ' + v + '.' : 'Enter a town or postcode first.';
    }

    // low-bandwidth mode
    var lbBtn = document.getElementById('lb'), lbs = document.getElementById('lbs');
    lbBtn.addEventListener('click', function () {
        var on = document.body.classList.toggle('lowbw');
        lbBtn.setAttribute('aria-pressed', on);
        lbs.textContent = on ? 'On' : 'Off';
    });

    // "updated x min ago" ticks up every minute
    var t0 = Date.now();
    setInterval(function () {
        var add = Math.floor((Date.now() - t0) / 60000);
        document.querySelectorAll('[data-ago]').forEach(function (el) {
            el.textContent = (+el.dataset.ago) + add
        });
    }, 30000);
})();