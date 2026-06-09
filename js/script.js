function getGalleryElements() {
    return {
        modal: document.getElementById("gallery-modal"),
        image: document.getElementById("gallery-modal-image"),
        counter: document.getElementById("gallery-modal-counter"),
        message: document.getElementById("gallery-modal-message"),
        controls: document.getElementById("gallery-modal-controls")
    };
}

// Handle page reloads to reset to home page
const navEntries =
performance.getEntriesByType("navigation");

if (
    navEntries.length > 0 &&
    navEntries[0].type === "reload"
) {

    window.location.replace("../index.html");

}

const texts = [
	"Software Engineer",
	"Virtual Assistant",
	"Tech Support",
];

let count = 0;
let index = 0;

let currentText = "";
let letter = "";

function typeWriter() {
	if (!document.getElementById("typing")) return;

	if (count === texts.length) {
		count = 0;
	}

	currentText = texts[count];

	letter = currentText.slice(0, ++index);

	document.getElementById("typing").textContent = letter;

	if (letter.length === currentText.length) {
		count++;
		index = 0;
		setTimeout(typeWriter, 1500);
	} else {
		setTimeout(typeWriter, 100);
	}
}

window.initTyping = function () {
	// reset counters and start if element exists
	count = 0;
	index = 0;
	typeWriter();
};

// start on initial load
window.addEventListener('DOMContentLoaded', () => {
	window.initTyping();
});

// SPA-like navigation: intercept internal nav links and load pages via fetch
window.initNavigation = function () {
	const prefetchCache = new Map();
	function isInternalLink(a) {
		try {
			const url = new URL(a.href, location.href);
			return url.origin === location.origin && url.pathname.endsWith('.html');
		} catch (e) {
			return false;
		}
	}

	async function loadPage(href, push = true, options = {}) {
		try {
			const url = new URL(href, location.href).toString();
			// normalize path+search for comparisons
			const normalize = (u) => {
				try { const n = new URL(u, location.href); return n.pathname + n.search; } catch(e){ return u; }
			};

			// try cached prefetched content first
			let text;
			if (prefetchCache.has(url)) {
				text = prefetchCache.get(url);
			} else {
				const res = await fetch(url, {cache: 'no-store'});
				if (!res.ok) return;
				text = await res.text();
			}
			const parser = new DOMParser();
			const doc = parser.parseFromString(text, 'text/html');

			// replace first <section> of the current document with the new one
			const newSection = doc.querySelector('section');
			const curSection = document.querySelector('section');
			if (newSection && curSection) {
				// animate current section out
				curSection.classList.add('is-exiting');
				await new Promise((resolve) => {
					const timeout = setTimeout(resolve, 600);
					curSection.addEventListener('transitionend', () => {
						clearTimeout(timeout);
						resolve();
					}, { once: true });
				});

				// perform replacement
				curSection.replaceWith(newSection);

				// prepare new section for enter animation
				newSection.classList.add('is-entering');
				// force reflow then remove class to trigger transition
				// eslint-disable-next-line @typescript-eslint/no-unused-expressions
				newSection.getBoundingClientRect();
				requestAnimationFrame(() => newSection.classList.remove('is-entering'));

				// re-run any init functions present on the page
				if (typeof window.initTyping === 'function') {
					if (options && options.delayTyping) {
						setTimeout(window.initTyping, 5000);
					} else {
						window.initTyping();
					}
				}
			}

			// update title
			const newTitle = doc.querySelector('title');
			if (newTitle) document.title = newTitle.textContent;

			// update active nav links (compare pathname+search)
			document.querySelectorAll('nav a').forEach(a => {
				try{
					const aNorm = normalize(a.href);
					const uNorm = normalize(url);
					a.classList.toggle('active', aNorm === uNorm);
				}catch(e){ }
			});

			// push history
			if (push) history.pushState({url}, '', url);
			window.scrollTo({top:0, left:0});
		} catch (err) {
			console.error('Navigation error', err);
		}
	}

	document.addEventListener('click', (e) => {
		const a = e.target.closest && e.target.closest('a');
		if (!a) return;
		if (!isInternalLink(a)) return;
		// ignore if link has target or download
		if (a.target && a.target !== '' || a.hasAttribute('download')) return;
		e.preventDefault();
		const delayTyping = a.classList && a.classList.contains('start-btn');
		loadPage(a.getAttribute('href'), true, { delayTyping });
	});

	// prefetch on hover/focus to make transitions snappier
	document.addEventListener('mouseover', (e) => {
		const a = e.target.closest && e.target.closest('a');
		if (!a || !isInternalLink(a)) return;
		const href = new URL(a.getAttribute('href'), location.href).toString();
		if (prefetchCache.has(href)) return;
		fetch(href, {cache: 'no-store'}).then(r => r.ok ? r.text() : null).then(t => { if(t) prefetchCache.set(href, t); }).catch(()=>{});
	});

	document.addEventListener('focusin', (e) => {
		const a = e.target.closest && e.target.closest('a');
		if (!a || !isInternalLink(a)) return;
		const href = new URL(a.getAttribute('href'), location.href).toString();
		if (prefetchCache.has(href)) return;
		fetch(href, {cache: 'no-store'}).then(r => r.ok ? r.text() : null).then(t => { if(t) prefetchCache.set(href, t); }).catch(()=>{});
	});

	// handle back/forward
	window.addEventListener('popstate', (e) => {
		const url = (e.state && e.state.url) || location.href;
		loadPage(url, false, {});
	});
};



//FOR GALLERY MODAL
// ======================
// GALLERY SYSTEM
// ======================

const galleries = {

    gallery1: [
        "../assets/project1/cover.png",
        "../assets/project1/1.png",
        "../assets/project1/2.png",
        "../assets/project1/3.png"
    ],

    gallery2: [
        "../assets/project2/cover.png",
        "../assets/project2/1.png",
        "../assets/project2/2.png",
        "../assets/project2/3.png",
        "../assets/project2/4.png"
    ]

};

let currentGallery = "";
let currentIndex = 0;

function openGallery(galleryId){

    const modal = document.getElementById("gallery-modal");
    const image = document.getElementById("gallery-modal-image");
    const counter = document.getElementById("gallery-modal-counter");

    if(!modal){
        alert("Gallery Modal Not Found");
        return;
    }

    currentGallery = galleryId;
    currentIndex = 0;

    modal.style.display = "flex";

    document.body.classList.add("gallery-open");

    image.src = galleries[currentGallery][currentIndex];

    counter.innerHTML =
    `${currentIndex + 1} / ${galleries[currentGallery].length}`;

}

function closeGallery(){

    const {
        modal
    } = getGalleryElements();

    if(!modal) return;

    modal.style.display = "none";

    document.body.classList.remove("gallery-open");

}

function nextImage(){

    if(!galleries[currentGallery]) return;

    currentIndex++;

    if(currentIndex >= galleries[currentGallery].length){
        currentIndex = 0;
    }

    updateGallery();
}

function prevImage(){

    if(!galleries[currentGallery]) return;

    currentIndex--;

    if(currentIndex < 0){
        currentIndex = galleries[currentGallery].length - 1;
    }

    updateGallery();
}

function updateGallery(){

    const {
        image,
        counter
    } = getGalleryElements();

    if(!image || !counter) return;

    image.src =
    galleries[currentGallery][currentIndex];

    counter.innerHTML =
    `${currentIndex + 1} / ${galleries[currentGallery].length}`;

}


document.addEventListener("DOMContentLoaded", () => {

    const modal = document.getElementById("gallery-modal");

    if(modal){

        console.log("Gallery Modal Loaded Successfully");

    }else{

        console.error("Gallery Modal Missing");

    }

});

// MAKE FUNCTIONS GLOBAL
window.openGallery = openGallery;
window.closeGallery = closeGallery;
window.nextImage = nextImage;
window.prevImage = prevImage;
