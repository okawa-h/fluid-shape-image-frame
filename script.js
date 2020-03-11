const POINT_LENGTH = 5;
const RADIAN = 360;
const IS_SHOW_HELPER = false;
let frameList = [];

class FluidShapeImageFrame {
	constructor(container) {
		this.isLoaded = false;
		this.fluidShape = null;
		this.container = container;
		this.canvas = document.createElement('canvas');
		this.context = this.canvas.getContext("2d");
		this.container.appendChild(this.canvas);

		this.image = this.container.getElementsByTagName('img')[0];
		this.loadImage();

		this.setCanvasSize();

		this.setup();
	}

	setup() {
		const canvasWidth = this.canvas.width;
		const canvasHeight = this.canvas.height;
		const center = {
			x: canvasWidth * 0.5,
			y: canvasHeight * 0.5
		};
		const radius = (canvasWidth > canvasHeight ? canvasHeight : canvasWidth) * 0.5
		this.fluidShape = new FluidShape(center, radius, POINT_LENGTH, RADIAN);
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

	onResize() {
		this.setCanvasSize();
		this.setup();
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
	constructor(center, radius, pointLength, radian) {
			this.points = [];
			this.pointLength = pointLength;

			const rota = Math.floor(radian / pointLength);

			for (let i = 0; i < pointLength; i++) {
					this.points[i] = new Point(center, radius, rota * i);
			}
	}

	update() {
			for (let i = 0; i < this.pointLength; i++) {
					this.points[i].update();
			}
	}

	draw(context) {
		context.beginPath();

		const xc1 = (this.points[0].x + this.points[POINT_LENGTH - 1].x) * 0.5;
		const yc1 = (this.points[0].y + this.points[POINT_LENGTH - 1].y) * 0.5;
		context.moveTo(xc1, yc1);

		for (let i = 0; i < POINT_LENGTH - 1; i++) {

			const xc = (this.points[i].x + this.points[i + 1].x) * 0.5;
			const yc = (this.points[i].y + this.points[i + 1].y) * 0.5;
			context.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
		}

		context.quadraticCurveTo(this.points[POINT_LENGTH - 1].x, this.points[POINT_LENGTH - 1].y, xc1, yc1);
		context.closePath();
		context.fill();

		if (IS_SHOW_HELPER) {
			context.globalCompositeOperation = 'source-over';
			for (let i = 0; i < this.pointLength; i++) {
				this.points[i].draw(context);
			}
		}
	}
}

class Point {
	constructor(center, radius, rota) {
		this.x = null;
		this.y = null;
		this.centerX = center.x;
		this.centerY = center.y;
		this.radian = rota * (Math.PI / 180);
		this.radius = radius;

		this.speed = Math.random() * 5 + 1;
		this.r = Math.random() * 1 + 1;
		this.rota = 0;
	}

	update() {
		const plus = Math.cos(this.rota * (Math.PI / 180)) * this.r;

		this.radius += plus;

		const cos = Math.cos(this.radian) * this.radius;
		const sin = Math.sin(this.radian) * this.radius;

		this.x = cos + this.centerX;
		this.y = sin + this.centerY;

		this.rota += this.speed;

		if (this.rota > 360) this.rota -= 360;
	}

	draw(context) {
		context.beginPath();
		context.fillStyle = 'red';
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
}

const onResize = event => {
	for (let i = 0; i < frameList.length; i++) {
			frameList[i].onResize();
	}
}

const renderer = () => {
	for (let i = 0; i < frameList.length; i++) {
			frameList[i].renderer();
	}
	window.requestAnimationFrame(renderer);
}

document.addEventListener('DOMContentLoaded', onInit);
