const helper = () => {

    const type = {
        POST: 0,
        ROOM: 1,
        WALL: 2
    };

    const dir = {
        HORZ: 0,
        VERT: 1
    };

    function setCSSVar(name, value) {
        document.documentElement.style.setProperty(name, value);
    }

    function getCSSVar(name, asInt) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name);

        if (asInt === true) {
            return parseInt(value.toString().split("px")[0]);
        } else {
            return value;
        }
    }

    function resize(lst, trueValue, condition, falseValue) {
        return lst.map((_, i) => condition(i) ? trueValue : falseValue);
    }

    function prefix(lst) {
        const rtn = [0];
        lst.forEach((v, i) => {
            rtn.push(rtn[i] + v);
        });
        rtn.pop();
        return rtn;
    }

    function sizes() {
        const COLS = 79;
        const ROWS = 45;
        const BASE_SIZE = 16;
        const WIDTH = COLS * BASE_SIZE  + BASE_SIZE / 2;
        const HEIGHT = ROWS * BASE_SIZE  + BASE_SIZE / 2;

        setCSSVar("--canvas-width", `${WIDTH}px`);
        setCSSVar("--canvas-height", `${HEIGHT}px`);

        return {
            COLS: resize(Array(COLS).fill(BASE_SIZE), 8, r => r % 2 === 1, 24),
            ROWS: resize(Array(ROWS).fill(BASE_SIZE), 8, r => r % 2 === 1, 24),
            WIDTH,
            HEIGHT
        };
    }

    function getType(x, y) {
        if (x % 2 === 1 && y % 2 === 1) {
            return type.POST;
        } else if (x % 2 === 1 || y % 2 === 1) {
            return type.WALL;
        } else {
            return type.ROOM;
        }
    }

    function inBounds(num_rows, num_cols, x, y) {
        return x >= 0 && x < num_cols && y >= 0 && y < num_rows;
    }

    function getAreas(ROWS, COLS) {
        const hash = (x, y) => `${x}:${y}`;
        const adj = [{x: 0, y: -1},{x: 1, y: 0},{x: 0, y: 1},{x: -1, y: 0}];
        const rooms = {};
        const walls = {};
        const posts = {};
        ROWS.forEach((h, y) => {
            COLS.forEach((w, x) => {
                const area_type = getType(x, y);
                if (area_type === type.POST) {
                    posts[hash(x, y)] = {
                        type: type.POST
                    };
                } else if (area_type === type.WALL) {
                    const direction = (y % 2 === 1) ? dir.HORZ : dir.VERT;
                    const adj_index = (direction === dir.HORZ) ? [0, 2] : [1, 3];
                    walls[hash(x, y)] = {
                        type: type.WALL,
                        dir: direction,
                        rooms: adj_index.map(i => {
                            const {x: dx, y: dy} = adj[i];
                            return {x: dx + x, y: dy + y}; 
                        }).map(({x, y}) => {
                            const b = inBounds(ROWS.length, COLS.length, x, y);
                            return b ? hash(x, y) : null; 
                        })
                    };
                } else { // area_type === type.ROOM
                    rooms[hash(x, y)] = {
                        type: type.ROOM,
                        walls: adj.map(({x: dx, y: dy}) => {return {x: dx + x, y: dy + y}})
                            .map(({x, y}) => inBounds(ROWS.length, COLS.length, x, y) ? hash(x, y) : null)
                    };
                }
            });
        });
        return {
            rooms,
            walls,
            posts
        }
    }

    return {
        resize,
        prefix,
        sizes,
        getAreas,
        getType,
        type,
        dir
    }
};