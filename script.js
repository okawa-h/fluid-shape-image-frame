const POINT_LENGTH = 5;
const SHAPE_RADIAN = 300; // 0 ~ 360
const SHAPE_ROTATE = 0; // 0 ~ 360
const SHAPE_RADIUS_RATIO = 1; // 0 ~ 1
const IS_SHOW_HELPER = false;

let frameList = [];

class Utils {
	static getRangeNumber(max, min) {
		return Math.random() * (max - min) + min;
	}
}

class FluidShapeImageFrame {
	constructor(container) {
		this.isLoaded = false;
		this.fluidShape = null;
		this.container = container;
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext('2d');
		this.container.appendChild(this.canvas);

		this.image = this.container.getElementsByTagName('img')[0];
		this.loadImage();

		this.setCanvasSize();

		this.setup();
	}

	setup() {
		const width = this.canvas.width;
		const height = this.canvas.height;
		const center = { x: width * 0.5, y: height * 0.5 };
		const radius = ((width > height ? height : width) * 0.5) * SHAPE_RADIUS_RATIO;
		this.fluidShape = new FluidShape(center, radius, POINT_LENGTH, SHAPE_RADIAN, SHAPE_ROTATE);
	}

	renderer() {
		if (!this.isLoaded) return;
		this.fluidShape.update();

		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.context.globalCompositeOperation = 'source-over';
		this.context.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);

		this.context.globalCompositeOperation = 'destination-in';
		this.fluidShape.draw(this.context);
	}

	showHelper() {
		this.context.globalCompositeOperation = 'source-over';
		this.fluidShape.drawHelper(this.context);
	}

	onResize() {
		this.setCanvasSize();
		this.setup();
	}

	onScroll() {
		this.fluidShape.paramUpdate();
	}

	setCanvasSize() {
		this.canvas.width = this.container.clientWidth;
		this.canvas.height = this.container.clientHeight;
	}

	loadImage() {
		const image = new Image();
		image.onload = event => (this.isLoaded = true);
		image.src = this.image.src;
	}
}

class FluidShape {
	constructor(center, radius, pointLength, radian, rotateWhole) {
		this.points = [];
		this.pointLength = pointLength;

		const rotate = Math.floor(radian / pointLength);
		for (let i = 0; i < pointLength; i++) {
			this.points[i] = new Point(center, radius, rotate * i + rotateWhole);
		}
	}

	update() {
		for (let i = 0; i < this.pointLength; i++) {
			this.points[i].update();
		}
	}

	paramUpdate() {
		for (let i = 0; i < this.pointLength; i++) {
			this.points[i].paramUpdate();
		}
	}

	draw(context) {
		const lastPoint = this.points[this.pointLength - 1];
		const xc1 = (this.points[0].x + lastPoint.x) * 0.5;
		const yc1 = (this.points[0].y + lastPoint.y) * 0.5;

		context.beginPath();
		context.moveTo(xc1, yc1);

		for (let i = 0; i < this.pointLength - 1; i++) {
			const xc = (this.points[i].x + this.points[i + 1].x) * 0.5;
			const yc = (this.points[i].y + this.points[i + 1].y) * 0.5;
			context.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
		}

		context.quadraticCurveTo(lastPoint.x, lastPoint.y, xc1, yc1);
		context.closePath();
		context.fill();
	}

	drawHelper(context) {
		context.globalCompositeOperation = 'source-over';
		for (let i = 0; i < this.pointLength; i++) {
			this.points[i].draw(context);
		}
	}
}

class Point {
	constructor(center, radius, radian) {
		this.x = null;
		this.y = null;
		this.center = center;
		this.radius = radius;
		this.radian = radian * (Math.PI / 180);

		this.speed = this.getSpeed();
		this.expansionRatio = this.getExpansionRatio();
		this.rotate = 0;
		this.scrollState = { speed: 0, expansionRatio: 0 };
	}

	update() {
		const speed = this.speed + this.scrollState.speed;
		const expansionRatio = this.expansionRatio + this.scrollState.expansionRatio;

		const moveRadius = Math.cos(this.rotate * (Math.PI / 180)) * expansionRatio;
		this.radius += moveRadius;

		const cos = Math.cos(this.radian) * this.radius;
		const sin = Math.sin(this.radian) * this.radius;
		this.x = cos + this.center.x;
		this.y = sin + this.center.y;

		this.rotate += speed;
		if (this.rotate > 360) this.rotate -= 360;

		this.scrollState.speed -= 0.001
		this.scrollState.expansionRatio -= 0.001
		if (this.scrollState.speed < 0) this.scrollState.speed = 0;
		if (this.scrollState.expansionRatio < 0) this.scrollState.expansionRatio = 0;
	}

	paramUpdate() {
		this.scrollState.speed = this.getSpeed() * 5;
		this.scrollState.expansionRatio = this.getExpansionRatio() * 5;
	}

	getSpeed() {
		return Utils.getRangeNumber(2, -2);
	}

	getExpansionRatio() {
		return Utils.getRangeNumber(0.1, 0.05);
	}

	draw(context) {
		context.beginPath();
		context.fillStyle = '#f00';
		context.arc(this.x, this.y, 3, 0, 2 * Math.PI);
		context.closePath();
		context.fill();
	}
}

const onInit = event => {
	const frames = document.querySelectorAll('[data-js="fluidShapeImageFrame"]');
	for (let i = 0; i < frames.length; i++) {
			frameList[i] = new FluidShapeImageFrame(frames[i])
	}
	renderer();
	window.addEventListener('resize', onResize);
	window.addEventListener('scroll', onScroll);
}

const onResize = event => {
	for (let i = 0; i < frameList.length; i++) {
		frameList[i].onResize();
	}
}

const onScroll = event => {
	for (let i = 0; i < frameList.length; i++) {
		frameList[i].onScroll();
	}
}

const renderer = () => {
	for (let i = 0; i < frameList.length; i++) {
		frameList[i].renderer();
	}

	if (IS_SHOW_HELPER) {
		for (let i = 0; i < frameList.length; i++) {
			frameList[i].showHelper();
		}
	}

	window.requestAnimationFrame(renderer);
}

document.addEventListener('DOMContentLoaded', onInit);
