// The backgrounds are 960w x 540h
// The posters are 500w x 751h
// If the backgrounds are different widths there'll be a noticeable resize on movie change
// Could be fixed by upgrading the webgl texture implementation
window.movies = [
	{
		title: "Shrek",
		description: "A mean lord exiles fairytale creatures to the swamp of a grumpy ogre, who must go on a quest and rescue a princess for the lord in order to get his land back.",
		command: "ssh shrek@telnetflix.com -p 20",
		actors: ["Mike Myers", "Eddie Murphy", "Cameron Diaz"],
		categories: ["Animation", "Adventure", "Comedy"],
		assets: {
			poster: "assets/movies/shrek/poster.jpg",
			background: "assets/movies/shrek/background.jpg"
		},
		colors: {
			primary: "#B0C400"
		}
	},
	{
		title: "My Neighbor Totoro",
		description: "When two girls move to the country to be near their ailing mother, they have adventures with the wondrous forest spirits who live nearby.",
		command: "ssh totoro@telnetflix.com -p 20",
		actors: ["Hitoshi Takagi", "Noriko Hidaka", "Chika Sakamoto"],
		categories: ["Animation", "Family", "Fantasy"],
		assets: {
			poster: "assets/movies/my_neighbour_totoro/poster.jpg",
			background: "assets/movies/my_neighbour_totoro/background.jpg"
		},
		colors: {
			primary: "#4E92E6"
		}
	},
	{
		title: "WALL·E",
		description: "In the distant future, a small waste-collecting robot inadvertently embarks on a space journey that will ultimately decide the fate of mankind.",
		command: "ssh wall-e@telnetflix.com -p 20",
		actors: ["Ben Burtt", "Elissa Knight", "Jeff Garlin"],
		categories: ["Animation", "Adventure", "Family"],
		assets: {
			poster: "assets/movies/wall-e/poster.jpg",
			background: "assets/movies/wall-e/background.jpg"
		},
		colors: {
			primary: "#F8C756"
		}
	}
];
const windowMovieLen = window.movies.length;

const enterButton = document.querySelector('#splash-video-button');
const splashVideoContainer = document.querySelector('#splash-video');
const contentContainer = document.querySelector('#illegal-content');
const contentWrapper = document.querySelector('#illegal-content-wrapper');

const mobileToggle = document.querySelector('#telnetflixMobileToggles');
const desktopToggle = document.querySelector('#telnetflixDesktopToggles');
const leftToggles = document.querySelectorAll('.left-toggle');
const rightToggles = document.querySelectorAll('.right-toggle');

const posterBlur = document.querySelector('#posterBlur');
const posterTransitionBlur = document.querySelector('#posterTransitionBlur');



/*
	Switch init 
*/
let movieTitle = {
	parent: document.querySelector('#movieTitle')
}
let movieDesc = {
	parent: document.querySelector('#movieDesc')
}
let movieCode = {
	parent: document.querySelector('#movieCode')
}
let movieStarHeader = {
	parent: document.querySelector('#movieStarHeader')
}
let movieStars = {
	parent: document.querySelector('#movieStars')
}
let movieCategories = {
	parent: document.querySelector('#movieCategories')
}

const contentColumns = document.querySelector('#illegalContentColumns');
const content = document.querySelector('#movieContent');

movieTitle.current = movieTitle.parent.querySelector('.current');
movieTitle.next = movieTitle.parent.querySelector('.next');
movieDesc.current = movieDesc.parent.querySelector('.current');
movieDesc.next = movieDesc.parent.querySelector('.next');
movieCode.current = movieCode.parent.querySelector('.current');
movieCode.next = movieCode.parent.querySelector('.next');

movieStarHeader.current = movieStarHeader.parent.querySelector('.current');
movieStarHeader.next = movieStarHeader.parent.querySelector('.next');
movieStars.current = movieStars.parent.querySelectorAll('.current');
movieStars.next = movieStars.parent.querySelectorAll('.next');

movieCategories.current = movieCategories.parent.querySelectorAll('.current');
movieCategories.next = movieCategories.parent.querySelectorAll('.next');
/* == Switch init == */





/*
	Element Generation
*/
const backgroundAssetContainer = document.querySelector('#backgroundAssets');
function generateBackgroundAssets() {
	for (let a = 0; a < windowMovieLen; a++) {
		const newAsset = document.createElement('img');
		newAsset.src = window.movies[a].assets.background;
		newAsset.crossOrigin = 'anonymous';
		newAsset.className = 'backgroundImage asset';

		backgroundAssetContainer.appendChild(newAsset);
	}
}

const posterAssetContainer = document.querySelector('#posterAssets');
function generatePosterAssets() {
	for (let a = 0; a < windowMovieLen; a++) {
		const newAsset = document.createElement('img');
		newAsset.src = window.movies[a].assets.poster;
		newAsset.crossOrigin = 'anonymous';
		newAsset.className = 'posterImage asset';

		posterAssetContainer.appendChild(newAsset);
	}
}

const toggleIconContainer = document.querySelector('#telnetflixDesktopIcons');
// Generate dekstop icon toggles
function generateDesktopIcons() {
	for (let a = 0; a < windowMovieLen; a++) {
		// Can't remember if appendChild holds reference so redeclare const
		const newIcon = document.createElement('img');
		newIcon.src = window.movies[a].assets.poster;

		const newIconContainer = document.createElement('div');
		newIconContainer.className = 'icon' + (a != 0 ? ' disabled' : '');
		newIconContainer.dataset.index = a;
		newIconContainer.appendChild(newIcon);

		toggleIconContainer.appendChild(newIconContainer);
	}
}

generateBackgroundAssets();
generatePosterAssets();
generateDesktopIcons();
/* == Element Generation == */



/*
	Copy to clipboard
*/

const copyItems = document.querySelectorAll('.copyable');
if (copyItems) {
	copyItems.forEach((copyItem) => {
		copyItem.addEventListener('click', function () {
			let copyme = this.querySelector('.copyme');
			if (copyme) {
				copyme.value = this.innerText;
			} else {
				const copyInput = document.createElement('input');
				copyInput.style.position = 'fixed';
				copyInput.style.opacity = '0';
				copyInput.style.zIndex = '-100000';

				copyInput.className = 'copyme';

				copyInput.value = this.innerText;

				this.appendChild(copyInput);
				copyme = copyInput;
			}

			copyme.select();
			copyme.setSelectionRange(0, 99999);

			document.execCommand("copy");
		});
	});
}
const copyContainer = document.querySelector('#copyableContainer');
copyContainer.addEventListener('click', function () {
	const copyItem = copyContainer.querySelector('.copyable');
	let copyme = copyItem.querySelector('.copyme');
	if (copyme) {
		copyme.value = copyItem.innerText;
	} else {
		const copyInput = document.createElement('input');
		copyInput.style.position = 'fixed';
		copyInput.style.opacity = '0';
		copyInput.style.zIndex = '-100000';

		copyInput.className = 'copyme';

		copyInput.value = copyItem.innerText;

		copyItem.appendChild(copyInput);
		copyme = copyInput;
	}

	copyme.select();
	copyme.setSelectionRange(0, 99999);

	document.execCommand("copy");
});
/* == Copy to clipboard == */



/*
	Toggle Desktop Icons
*/

const toggleIcons = document.querySelectorAll('#telnetflixDesktopIcons .icon');
const toggleIconLen = toggleIcons.length;
function toggleDesktopIcons(index) {
	for (let a = 0; a < toggleIconLen; a++) {
		if (a != index) {
			toggleIcons[a].classList.toggle('disabled', true);
		} else {
			toggleIcons[a].classList.toggle('disabled', false);
		}
	}
}

function addDesktopToggleClick() {
	for (let a = 0; a < toggleIconLen; a++) {
		toggleIcons[a].addEventListener('click', function () {
			if (this.dataset.index != movieIndex) {
				if (this.dataset.index < movieIndex) {
					toggleLeftClick(parseInt(this.dataset.index));
				} else {
					toggleRightClick(parseInt(this.dataset.index));
				}
			}
		});
	}
}
addDesktopToggleClick();

/* == Toggle Desktop Icons == */



/*
	Animation Management
*/
let dryRun = true;
function animateEle(ele, transform, opacity, duration, timeout, callback) {
	if (timeout != undefined) {
		setTimeout(function (duration) {
			if (transform) {
				ele.style.transform = transform;
			}
			if (opacity) {
				ele.style.opacity = opacity;
			}
			setTimeout(function () {
				ele.dataset.switching = false;
				callback();
			}, duration);
		}.bind(this, duration), timeout);
	} else {
		if (transform) {
			ele.style.transform = transform;
		}
		if (opacity) {
			ele.style.opacity = opacity;
		}
		setTimeout(function () {
			ele.dataset.switching = false;
			callback();
		}, duration);
	}
}

function toggleAnimation(ele, skipNextAnimation, callback) {
	const data = ele.dataset;
	if (data.switching != 'true') {
		ele.dataset.switching = true;

		const duration = data.duration ? parseInt(data.duration) : 500;
		const timeout = data.delay ? parseInt(data.delay) : undefined;

		const preTransform = data.preTransform ? data.preTransform : '';
		let preOpacity = data.preOpacity ? data.preOpacity : undefined;

		const postTransform = data.postTransform ? data.postTransform : '';
		const postOpacity = data.postOpacity ? data.postOpacity : undefined;

		if (dryRun === true) {
			preOpacity = undefined;
		}

		ele.style.transition = 'none';
		ele.style.transform = preTransform;
		ele.style.opacity = preOpacity;

		let transitionString = '';
		if (preOpacity || postOpacity) {
			transitionString += `opacity ${duration / 1000}s ease`;
		}
		if (preTransform || postTransform) {
			if (transitionString.length > 0) {
				transitionString += ', ';
			}
			transitionString += `transform ${duration / 1000}s ease`;
		}

		if (skipNextAnimation != true) {
			setTimeout(function (transitionString, ele, transform, opacity, duration, timeout) {
				ele.style.transition = transitionString;
				animateEle(ele, transform, opacity, duration, timeout, callback);
			}.bind(this, transitionString, ele, postTransform, postOpacity, duration, timeout), 25);
		} else {
			ele.style.transition = transitionString;
			animateEle(ele, postTransform, postOpacity, duration, timeout, callback);
		}


	}
}

function toggleAnimations(container, skipCurrentAnimation, callback) {
	container.finished = 0;
	const animationCallback = function () {
		dryRun = false;
		container.finished++;
		container.current.innerHTML = container.next.innerHTML;

		if (callback) {
			callback();
		}

		if (container.finished === 2) {
			finishedEles++;

			if (finishedEles === waitingOnEles) {
				finishedEles = 0;
				waitingOnEles = 0;
				isAnimating = false;
			}
			resetAnimation(container.current);
			resetAnimation(container.next);
		}
	};
	if (dryRun === true && container.parent) {
		container.parent.style.opacity = '';
	}
	toggleAnimation(container.current, false, animationCallback);
	toggleAnimation(container.next, skipCurrentAnimation === true ? skipCurrentAnimation : false, animationCallback);
}

function resetAnimation(ele) {
	ele.style.transition = 'none';
	ele.style.transform = '';
	ele.style.opacity = '';
}
/* == Animation Management == */





/*
	HTML Asset Switching
*/

let isAnimating = false;
let waitingOnEles = 0;
let finishedEles = 0;
function switchMovieHtml(selector, currMovie, animate, hidden, skipCurrentAnimation) {
	movieTitle[selector].innerHTML = currMovie.title;
	movieDesc[selector].innerHTML = currMovie.description;
	movieCode[selector].innerHTML = currMovie.command;
	movieStarHeader[selector].innerHTML = 'Starring';

	for (let a = 0; a < currMovie.actors.length; a++) {
		movieStars[selector][a].innerHTML = currMovie.actors[a];
	}
	for (let a = 0; a < currMovie.categories.length; a++) {
		movieCategories[selector][a].innerHTML = currMovie.categories[a];
	}
	if (animate === true && isAnimating === false) {
		isAnimating = true;
		waitingOnEles = 4;
		toggleAnimations(movieTitle, skipCurrentAnimation);
		toggleAnimations(movieDesc, skipCurrentAnimation);
		toggleAnimations(movieCode, skipCurrentAnimation);
		toggleAnimations(movieStarHeader, skipCurrentAnimation);

		for (let a = 0; a < currMovie.actors.length; a++) {
			waitingOnEles++;
			toggleAnimations({
				current: movieStars.current[a],
				next: movieStars.next[a]
			}, skipCurrentAnimation);
		}
		for (let a = 0; a < currMovie.categories.length; a++) {
			movieCategories.next[a].style.color = currMovie.colors.primary;
			waitingOnEles++;
			toggleAnimations({
				current: movieCategories.current[a],
				next: movieCategories.next[a]
			}, skipCurrentAnimation, function (targetEle) {
				targetEle.style.color = currMovie.colors.primary;
			}.bind(this, movieCategories.current[a]));
		}
	} else if (isAnimating === true) {
		if (movieTitle.finished === 2) {
			movieTitle.current.innerHTML = currMovie.title;
		}
		if (movieDesc.finished === 2) {
			movieDesc.current.innerHTML = currMovie.description;
		}
		if (movieCode.finished === 2) {
			movieCode.current.innerHTML = currMovie.command;
		}
	} else if (hidden === true) {
		movieTitle[selector].style.opacity = 0;
		movieDesc[selector].style.opacity = 0;
		movieCode[selector].style.opacity = 0;
		movieStarHeader[selector].style.opacity = 0;

		for (let a = 0; a < currMovie.actors.length; a++) {
			movieStars[selector][a].style.opacity = 0;
		}
		for (let a = 0; a < currMovie.categories.length; a++) {
			movieCategories[selector][a].style.opacity = 0;
		}
	}
}

function switchMovieContent(index, initializing, isHidden, skipCurrentAnimation) {
	const targetMovie = window.movies[index];

	if (initializing === true) {
		contentColumns.classList.toggle('initializing', true);
		switchMovieHtml('current', targetMovie, false, isHidden, skipCurrentAnimation);
	} else {
		switchMovieHtml('next', targetMovie, true, isHidden, skipCurrentAnimation);
	}
}

let isReadyToAnimate = false;
let movieIndex = 0;
function switchMovie(index, initializing, isHidden, disableWebgl, skipCurrentAnimation) {
	if ((isReadyToAnimate === true && isAnimating === false) || (isAnimating === false && disableWebgl === true)) {
		const oldIndex = movieIndex;
		movieIndex = index;

		if (disableWebgl != true) {
			window.webglBackground.resetPhase();

			window.webglBackground.initTextures(
				window.movieBackgroundImgs[movieIndex],
				window.movieDisplacementImgs[0], //Replace with displacement map
				window.movieBackgroundImgs[oldIndex]
			);
			window.webglBackground.startRender();

			window.webglPosterImage.initTextures(
				window.moviePosterImgs[oldIndex],
				window.movieDisplacementImgs[0],
				window.moviePosterImgs[movieIndex]
			);
			window.webglPosterImage.startRender(function () {
				posterBlur.src = window.movies[movieIndex].assets.poster;
				posterBlur.style.transition = '';
				posterTransitionBlur.style.transition = '';

				setTimeout(function (firstIndex) {
					if (firstIndex === movieIndex) {
						posterBlur.style.opacity = 1;
						posterTransitionBlur.style.opacity = 0;

						setTimeout(function (secondIndex) {
							if (secondIndex === movieIndex) {
								posterBlur.style.transition = 'opacity 1.2s ease';
								posterTransitionBlur.style.transition = 'opacity 1.2s ease';
							}
						}.bind(null, movieIndex), 50);
					}
				}.bind(null, movieIndex), 100);
			});
			posterBlur.style.opacity = 0;
			posterTransitionBlur.src = window.movies[movieIndex].assets.poster;
			posterTransitionBlur.style.opacity = 1;
		}

		switchMovieContent(index, initializing, isHidden, skipCurrentAnimation);
		return true;
	}
	return false;
}
/* == HTML Asset Switching == */



/*
	Left/Right toggle switching
*/

function toggleValues(toggles, value) {
	toggles.forEach(function (boolVal, toggle) {
		toggle.classList.toggle('disabled', boolVal);
	}.bind(this, value));
}
function toggleLeftClick(index) {
	const toggleIndex = index != undefined ? index : movieIndex - 1;
	if (toggleIndex >= 0) {
		if (switchMovie(toggleIndex)) {
			toggleValues(leftToggles, toggleIndex === 0);
			toggleValues(rightToggles, false);

			toggleDesktopIcons(toggleIndex);
		};
	}
}
function toggleRightClick(index) {
	const toggleIndex = index != undefined ? index : movieIndex + 1;
	if (toggleIndex < window.movies.length) {
		if (switchMovie(toggleIndex)) {
			toggleValues(leftToggles, false);
			toggleValues(rightToggles, toggleIndex === window.movies.length - 1);

			toggleDesktopIcons(toggleIndex);
		};
	}
}
/* == Left/Right toggle switching == */



switchMovie(0, true, true, true);

// Start Code
enterButton.addEventListener('click', function () {
	const videoAppear = document.querySelector('#telnetflix-video');
	videoAppear.classList.toggle('fade', true);

	const videoDisappear = document.querySelector('#telnetflix-video-disappear');
	videoDisappear.play();

	enterButton.classList.toggle('fade', true);

	window.webglBackground.initTextures(
		window.movieBackgroundImgs[0]
	);

	setTimeout(function () {
		document.querySelector('#webgl-test').classList.toggle('enabled', true);
		contentContainer.classList.toggle('hidden', false);
		window.webglBackground.startRender(function () {
			splashVideoContainer.classList.toggle('hidden', true);

			window.webglPosterImage.initTextures(
				window.moviePosterImgs[0],
				window.movieDisplacementImgs[0],
				window.moviePosterImgs[1]
			);
			window.webglPosterImage.setShader(2);
			window.webglPosterImage.startRender(function () { //Fade in the poster image
				window.webglPosterImage.setShader(3);
				isReadyToAnimate = true;
				window.webglPosterImage.setPhaseMultiplier(0.055, 0.003, 3);
			});
			setTimeout(function () {
				posterBlur.src = window.movies[movieIndex].assets.poster;
				posterBlur.style.opacity = 1;
			}, 600);

			window.webglBackground.setPhaseMultiplier(0.04, 0.005);
			window.webglBackground.setShader(1);
		});
		setTimeout(function () { //600ms
			document.querySelector('#telnetflix-fixed-logo').classList.toggle('enabled', true);
			switchMovie(0, false, false, true, true);

			setTimeout(function () { //800ms
				document.querySelector('#telnetflixDesktopIcons').classList.toggle('enabled', true);

				if (leftToggles) {
					for (let a = 0; a < leftToggles.length; a++) {
						leftToggles[a].addEventListener('click', function () {
							toggleLeftClick();
						});
					}
				}
				if (rightToggles) {
					for (let a = 0; a < rightToggles.length; a++) {
						rightToggles[a].addEventListener('click', function () {
							toggleRightClick();
						});
					}
				}
			}, 200);

			setTimeout(function () { //1200ms
				mobileToggle.style.opacity = 1;
				desktopToggle.style.opacity = 1;
			}, 600);
		}, 600);
	}, 100);
});