/**
 * @program 绘制气泡飘动
 * @parameter
 *     $box (HTMLElement)    画布的外框元素，默认值window
 *     $canvas (HTMLElement) 画布元素
 *     options (Object) 参数
 *         - alphaMin (Number)     随机气泡初始最小半透明值，取值0-1，默认值0.1
 *         - alphaMax (Number)     随机气泡初始最大半透明值，取值0-1，默认值0.3
 *         - scaleMin (Number)     随机气泡初始最小半径，取值0-1，默认值10
 *         - scaleMax (Number)     随机气泡初始最大半径，取值0-1，默认值30
 *         - count (Number)        气泡数量（气泡密集程度），取值0-1，例如0.5，就是如果气泡起始点边长100px，那么将生成50个气泡，默认值0.1
 *         - speedMin(Number)      气泡最小移动速度，建议取值0.1-5，默认值0.5
 *         - speedMax(Number)      气泡最大移动速度，建议取值0.1-5，默认值2
 *         - swing(Boolean)        是否开启气泡随机散开飘动效果，默认值true
 *         - swingMin(Number)      气泡散开扰动的负距离范围，取值需要为负数，默认值-40
 *         - swingMax(Number)      气泡散开扰动的正距离范围，取值需要为正数，默认值40
 *         - color (String)        气泡颜色，默认值"#fff"
 *         - direction (String)    气泡的起始方向，left-左、right-右、top-上、bottom-下，默认值"left"
 *         - startRandom(Boolean)  初始时气泡是否随机出现（如果关闭则气泡从direction的方向飘出），默认值false
 *         - colorRandom(Boolean)  气泡颜色随机（开启后color将不会生效），默认值false
 * @methods
 *      animate()    开始播放动画
 *      pause()      暂停播放动画
 * @attributes
 *      playing (Boolean)      当前是否正在播放动画
 * @example new BubbleFlutter(window, document.querySelector("canvas") {
 *              alphaMin : .2,
 *              alphaMax : .6,
 *              color : "120,222,0",
 *              direction : "bottom"
 *          });
 */

import Color from "color";

export default function ($box = window, $canvas, options) {
    const pixelRatio = (function pixelRatio() {
        const ctx = document.createElement("canvas").getContext("2d");
        const backingStorePixelRatio = ctx.backingStorePixelRatio ||
            ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio || 1;
        return (window.devicePixelRatio || 1) / backingStorePixelRatio;
    }());

    const _options = Object.assign({}, {
        alphaMin: .1,
        alphaMax: .3,
        scaleMin: 10,
        scaleMax: 30,
        count: .1,
        speedMin: .5,
        speedMax: 2,
        swing: true,
        swingMin: -40,
        swingMax: 40,
        color: "#fff",
        direction: "left",
        startRandom: false,
        colorRandom: false
    }, options);

    const wrap = {
        width: $box.offsetWidth || $box.innerWidth,
        height: $box.offsetHeight || $box.innerHeight
    };

    const directionType = ["left", "bottom", "right", "top"].indexOf(_options.direction);

    let width = $canvas.width = wrap.width * pixelRatio,
        height = $canvas.height = wrap.height * pixelRatio,
        animationId = 0,
        circles = [];

    const ctx = $canvas.getContext("2d");
    // ctx.globalCompositeOperation = "lighter";

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const Bubble = function Bubble(color) {
        const randomReset = (type, startRandom) => {
            this.speed = randomInRange(_options.speedMin, _options.speedMax) * pixelRatio;
            this.scale = randomInRange(_options.scaleMin, _options.scaleMax) * pixelRatio;
            this.swing = randomInRange(_options.swingMin, _options.speedMax) * pixelRatio;
            this.alpha = randomInRange(_options.alphaMin, _options.alphaMax);
            if(!startRandom) {
                [
                    () => {
                        this.x = -this.scale;
                        this.y = Math.random() * height;
                        this.startY = this.y;
                    },
                    () => {
                        this.x = Math.random() * width;
                        this.y = height + this.scale;
                        this.startX = this.x;
                    },
                    () => {
                        this.x = width + this.scale;
                        this.y = Math.random() * height;
                        this.startY = this.y;
                    },
                    () => {
                        this.x = Math.random() * width;
                        this.y = -this.scale;
                        this.startX = this.x;
                    }
                ][type]();
            }
        };

        if(_options.startRandom) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
        }
        randomReset(directionType, _options.startRandom);

        this.update = () => {
            if(_options.swing) {
                if(_options.direction === "left" || _options.direction === "right") this.y = this.startY + Math.cos(this.x / (80 * pixelRatio)) * this.swing;
                else this.x = this.startX + Math.cos(this.y / (80 * pixelRatio)) * this.swing;
            }
            [
                () => {
                    this.x += this.speed;
                    if(this.x > width) randomReset(0);
                },
                () => {
                    this.y -= this.speed;
                    if(this.y + this.scale < 0) randomReset(1);
                },
                () => {
                    this.x -= this.speed;
                    if(this.x + this.scale < 0) randomReset(2);
                },
                () => {
                    this.y += this.speed;
                    if(this.y > height) randomReset(3);
                }
            ][directionType]();
        };
        this.render = () => {
            ctx.beginPath();
            ctx.fillStyle = Color(color).alpha(this.alpha).string();
            ctx.arc(this.x, this.y, this.scale, 0, 2 * Math.PI);
            ctx.fill();
        };
    };

    const Box = function Box() {
        this.update = () => {
            for(let i of circles) i.update();
        };
        this.render = () => {
            ctx.clearRect(0, 0, width, height);
            for(let i of circles) i.render();
        };
    };

    const area = _options.direction === "left" || _options.direction === "right" ? wrap.height : wrap.width;
    for(let i = 0; i < area * _options.count; i++) {
        const color = _options.colorRandom ? "#"+("000000"+parseInt(Math.random()*0x10000000).toString(16)).slice(-6) : _options.color;
        circles.push(new Bubble(color));
    }

    const box = new Box();

    this.playing = false;
    this.animate = status => {
        if(this.playing && !status) return;
        box.update();
        box.render();
        animationId = requestAnimationFrame(() => {
            if(!status) this.playing = true;
            this.animate(true);
        });
    };
    this.pause = () => {
        cancelAnimationFrame(animationId);
        this.playing = false;
    };
}