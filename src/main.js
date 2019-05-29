/**
 * @program 绘制气泡飘动
 * @parameter
 *     $box (HTMLElement)    画布的外框元素，默认值window
 *     $canvas (HTMLElement) 画布元素
 *     options (Object) 参数
 *         - bubbleAlphaMin (Number)     随机气泡初始最小半透明值，取值0-1，默认值0.1
 *         - bubbleAlphaMax (Number)     随机气泡初始最大半透明值，取值0-1，默认值0.3
 *         - bubbleScaleMin (Number)     随机气泡初始最小半径，取值0-1，默认值10
 *         - bubbleScaleMax (Number)     随机气泡初始最大半径，取值0-1，默认值30
 *         - bubbleCount (Number)        气泡数量（气泡密集程度），取值0-1，例如0.5，就是如果气泡起始点边长100px，那么将生成50个气泡，默认值0.1
 *         - bubbleSpeedMin(Number)      气泡最小移动速度，建议取值0.1-5，默认值0.5
 *         - bubbleSpeedMax(Number)      气泡最大移动速度，建议取值0.1-5，默认值2
 *         - bubbleSwing(Boolean)        是否开启气泡随机散开飘动效果，默认值true
 *         - bubbleSwingMin(Number)      气泡散开扰动的负距离范围，取值需要为负数，默认值-40
 *         - bubbleSwingMax(Number)      气泡散开扰动的正距离范围，取值需要为正数，默认值40
 *         - bubbleColor (String)        气泡颜色，默认值"#fff"
 *         - bubbleDirection (String)    气泡的起始方向，left-左、right-右、top-上、bottom-下，默认值"left"
 *         - bubbleStartRandom(Boolean)  初始时气泡是否随机出现（如果关闭则气泡从bubbleDirection的方向飘出），默认值false
 *         - bubbleColorRandom(Boolean)  气泡颜色随机（开启后bubbleColor将不会生效），默认值false
 *         - waveStartX(Number)          波浪水平起始绘制点，无特殊需求建议为0，默认值0
 *         - waveAxisLength(Number)      波浪轴长，无特殊需求建议为0，默认值0
 *         - waveWidth(Number)           波浪宽度，数值越大波峰越窄，建议取值0-0.1，默认值0.008
 *         - waveHeight(Number)          波浪高度，数值越大波峰越高，取值需要是正数，默认值18
 *         - waveSpeed(Number)           波浪摆动速度，数值越大速度越快，建议取值0-0.2，默认值0.09
 *         - waveOffsetX(Number)         波浪水平偏移量，无特殊需求建议为0（一般用户绘制多个波浪时的时差效果），默认值0
 *         - wavePercent(Number)         波浪当前所占百分比，取值0-1，默认值0.5
 *         - wavePercentSpeed(Number)    波浪百分比变化时的速度，数值越大速度越快，建议取值0-0.1，默认值0.01
 *         - waveColor(String)           波浪颜色（默认会绘制两个波浪），默认值：#5ae1e6
 * @methods
 *      animate()    开始播放动画
 *      pause()      暂停播放动画
 * @attributes
 *      playing (Boolean)      当前是否正在播放动画
 * @example new BubbleFlutter(window, document.querySelector("canvas") {
 *              bubbleAlphaMin : .2,
 *              bubbleAlphaMax : .6,
 *              bubbleColor : "120,222,0",
 *              bubbleDirection : "bottom"
 *          });
 */

import Color from "color";

export default function ($box = window, $canvas, options) {
    const pixelRatio = window.devicePixelRatio || 1;

    let _options = Object.assign({
        bubbleAlphaMin: .1,
        bubbleAlphaMax: .3,
        bubbleScaleMin: 10,
        bubbleScaleMax: 30,
        bubbleCount: .1,
        bubbleSpeedMin: .5,
        bubbleSpeedMax: 2,
        bubbleSwing: true,
        bubbleSwingMin: -40,
        bubbleSwingMax: 40,
        bubbleColor: "#fff",
        bubbleDirection: "left",
        bubbleStartRandom: false,
        bubbleColorRandom: false,
        waveStartX: 0,
        waveAxisLength: 0,
        waveWidth: .008,
        waveHeight: 18,
        waveSpeed: .09,
        waveOffsetX: 0,
        wavePercent: .5,
        wavePercentSpeed: .01,
        waveColor: "#5ae1e6"
    }, options);

    const wrap = {
        width: $box.offsetWidth || $box.innerWidth,
        height: $box.offsetHeight || $box.innerHeight
    };

    const directionType = ["left", "bottom", "right", "top"].indexOf(_options.bubbleDirection);

    const width = $canvas.width = wrap.width;
    const height = $canvas.height = wrap.height;
    // const width = $canvas.width = wrap.width * pixelRatio;
    // const height = $canvas.height = wrap.height * pixelRatio;

    _options.waveAxisLength = width;

    const ctx = $canvas.getContext("2d");
    // ctx.globalCompositeOperation = "lighter";

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const wavePercentChange = {
        from: 0,
        to: 0,
        run: false
    };

    const Wave = function Wave(offsetX, color) {
        ctx.save();

        const points = []; // 用于存放绘制Sin曲线的点

        ctx.beginPath();
        // 在整个轴长上取点
        for (let x = _options.waveStartX; x < _options.waveStartX + _options.waveAxisLength; x += 20 / _options.waveAxisLength) {
            // 此处坐标(x,y)的取点，依靠公式“振幅高*sin(x*振幅宽 + 振幅偏移量)”
            const y = Math.sin((-_options.waveStartX - x) * _options.waveWidth + offsetX) * .8 + .1;

            const dY = height * (1 - _options.wavePercent);

            points.push([x, dY + y * _options.waveHeight]);
            ctx.lineTo(x, dY + y * _options.waveHeight);
        }

        // 封闭路径
        ctx.lineTo(_options.waveAxisLength, height);
        ctx.lineTo(_options.waveStartX, height);
        ctx.lineTo(points[0][0], points[0][1]);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.restore();
    };

    const Bubble = function Bubble(color) {
        const randomReset = (type, startRandom) => {
            this.speed = randomInRange(_options.bubbleSpeedMin, _options.bubbleSpeedMax) * pixelRatio;
            this.scale = randomInRange(_options.bubbleScaleMin, _options.bubbleScaleMax) * pixelRatio;
            this.swing = randomInRange(_options.bubbleSwingMin, _options.bubbleSpeedMax) * pixelRatio;
            this.alpha = randomInRange(_options.bubbleAlphaMin, _options.bubbleAlphaMax);
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

        if(_options.bubbleStartRandom) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
        }
        randomReset(directionType, _options.bubbleStartRandom);

        this.update = () => {
            if(_options.bubbleSwing) {
                if(_options.bubbleDirection === "left" || _options.bubbleDirection === "right") this.y = this.startY + Math.cos(this.x / (80 * pixelRatio)) * this.swing;
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

    const circles = [];

    const Box = function Box() {
        const _waveColor = Color(_options.waveColor);
        const waveColor = {
            fore: _waveColor.alpha(.3).string(),
            back: _waveColor.alpha(.6).string()
        };

        this.update = () => {
            for(let i of circles) i.update();
        };
        this.render = () => {
            ctx.clearRect(0, 0, width, height);

            Wave(_options.waveOffsetX+Math.PI*.7, waveColor.fore);
            Wave(_options.waveOffsetX, waveColor.back);
            _options.waveOffsetX += _options.waveSpeed;
            if(wavePercentChange.run) {
                if(wavePercentChange.to > wavePercentChange.from) {
                    _options.wavePercent += _options.wavePercentSpeed;
                } else {
                    _options.wavePercent -= _options.wavePercentSpeed;
                }
            }

            for(let i of circles) i.render();
        };
    };

    const area = _options.bubbleDirection === "left" || _options.bubbleDirection === "right" ? wrap.height : wrap.width;
    for(let i = 0; i < area * _options.bubbleCount; i++) {
        const color = _options.bubbleColorRandom ? "#"+("000000"+(~~(Math.random()*0x10000000)).toString(16)).slice(-6) : _options.bubbleColor;
        circles.push(new Bubble(color));
    }

    const box = new Box();

    this.playing = false;

    let animationId = 0;

    this.animate = status => {
        if(this.playing && !status) return;
        if(wavePercentChange.run) {
            if(wavePercentChange.to > wavePercentChange.from && _options.wavePercent >= wavePercentChange.to ||
                wavePercentChange.to < wavePercentChange.from && _options.wavePercent <= wavePercentChange.to
            ) {
                wavePercentChange.run = false;
            }
        }
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
    this.config = (config = {}) => {
        if(config.wavePercent) {
            wavePercentChange.from = _options.wavePercent;
            wavePercentChange.to = config.wavePercent;
            wavePercentChange.run = true;
            delete config.wavePercent;
        }
        _options = Object.assign(_options, config);
    }
}
