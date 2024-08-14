"use strict";

/*3. Дисковый телефон.
Необходимо реализовать ввод чисел в input при помощи дискового телефона (сверстанного).
Для этого необходимо тянуть круг от цифры до точки ввода, затем диск возвращается назад самостоятельно.
Ввод с клавиатуры должен быть запрещен.*/

const input = document.getElementById('inp');
const outer = document.getElementById('outer');
const stp = document.getElementById('stop');
outer.addEventListener('mousedown', onMouseDown);

//запрещает перетаскивать outer
outer.ondragstart = function () {
    return false;
}

//радианы в градусы
function radToDeg(angle){
    angle = 180 / Math.PI * angle
    if (angle < 0){
        angle += 360;
    }
    return angle;
}

//возвращает угол между центром outer и указателем мыши в градусах
function findAngle(e) {
    const rect = outer.getBoundingClientRect();
    //px и py – координаты середины outer относительно окна
    const px = rect.left + rect.width / 2;
    const py = rect.top + rect.height / 2;
    const angle = Math.atan2(e.y - py, e.x - px);
    return radToDeg(angle);
}

//возвращает текущий угол поворота elem в градусах
function findCurAngle(elem) {
    const compSt = window.getComputedStyle(elem, null);
    const transf = compSt.getPropertyValue("transform");
    if (transf == 'none') {
        return 0;
    }
    const val = transf.split(', ', 2);
    const cos = val[0].slice(7);
    const sin = val[1];
    const angle = Math.atan2(sin, cos);
    return radToDeg(angle);
}

function onMouseDown(event) {
    //нажатия по outer-circle игнорируются.
    //должен быть нажат именно inner-circle
    if (event.target == outer) {
        return;
    }

    //circle – тот inner-circle, по которому нажали
    const circle = event.target;

    //startAngle – "начальный" угол до цифры, на которую нажали
    const startAngle = findAngle(event);

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    function onMouseMove(event) {
        //newAngle – угол, куда переместилась мышь
        const newAngle = findAngle(event);
        let finalAngle = newAngle - startAngle;
        if (finalAngle < 0){
            finalAngle += 360;
        }
        const outerAngle =  findCurAngle(outer);
        if (finalAngle < outerAngle || finalAngle - outerAngle > 20) {
            return;
        }
        outer.style.transform = `rotate(${finalAngle}deg)`;

        const rectStp = stp.getBoundingClientRect()
        //sx и sy – координаты середины stop относительно окна
        const sx = rectStp.left + rectStp.width / 2;
        const sy = rectStp.top + rectStp.height / 2;
        stp.hidden = true;
        const elemBelow = document.elementFromPoint(sx, sy);
        stp.hidden = false;
        if (!elemBelow) {
            return;
        }
        const curCircle = elemBelow.closest('.inner-circle');
        if (curCircle && curCircle == circle) {
            outer.removeEventListener('mousedown', onMouseDown);
            input.value += curCircle.innerText;
            onMouseUp();
        }
    }

    function onMouseUp() {
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
        let curAngle = findCurAngle(outer);

        const time = Math.round(curAngle*5);
        const start = Date.now();
        const timer = setInterval(reDraw, 20);

        function reDraw() {
            const timePassed = Date.now() - start;
            if (timePassed >= time) {
                clearInterval(timer);
                outer.style.transform = "rotate(0deg)";
                outer.addEventListener('mousedown', onMouseDown);
                return;
            }
            curAngle -= 4;
            outer.style.transform = `rotate(${curAngle}deg)`;
        }  
    }
}