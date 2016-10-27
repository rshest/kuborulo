const HEARTBEAT_PERIOD = 10000000;

/**
 * Enumeration for both cube faces and movement direction
 */
const FACE = {
  FRONT : 0,  //  front cube face (facing the viewer)
  RIGHT : 1,  
  DOWN  : 2,
  LEFT  : 3,
  UP    : 4,
  BACK  : 5,  //  back cube face (facing away from viewer)
  ANY   : 6   //  wildcard, "any side"
};
const NUM_FACES = 6;
const NUM_DIRS = 4; 

const MOVE_MAPPING = [
  [3, 0, 2, 5, 4, 1], // RIGHT
  [4, 1, 0, 3, 5, 2], // DOWN
  [1, 5, 2, 0, 4, 3], // LEFT
  [2, 1, 5, 3, 0, 4]  // UP
];

const FACE_MOVEMENT = [
  [FACE.RIGHT, FACE.BACK, FACE.DOWN, FACE.FRONT, FACE.UP, FACE.LEFT], // roll right
  [FACE.DOWN, FACE.RIGHT, FACE.BACK, FACE.LEFT, FACE.FRONT, FACE.UP], // roll down
  [FACE.LEFT, FACE.FRONT, FACE.DOWN, FACE.BACK, FACE.UP, FACE.RIGHT], // roll left
  [FACE.UP, FACE.RIGHT, FACE.FRONT, FACE.LEFT, FACE.BACK, FACE.DOWN]  // roll up
];

const MOVE_OFFSETS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

const MOVE_DIRS    = [FACE.RIGHT, FACE.DOWN, FACE.LEFT, FACE.UP];
const MOVE_LABELS  = {0:'', 1:'E', 2:'S', 3: 'W', 4: 'N'};

const MOVE_RESULT = {
  TARGET      : 0,  //  the move lands at target
  SUCCESS     : 1,  //  can move successfully
  OUTSIDE     : 2,  //  move is outside of the board
  CONSTRAINED : 3,  //  move is constrained by the rules
};

function makeState({start: {x, y, faces}}) {
  if (faces === undefined) {
    faces = [0, 1, 2, 3, 4, 5]; 
  }
  return {x: x, y: y, faces: faces.slice(0)};
}

/**
 * Puzzle board
 */
class Board {
  
  static pathToText(path) {
    return path.map(d => MOVE_LABELS[d]).join('');
  }

  static orientPath(face) {
    const FACE_PATH = [
      [], [FACE.RIGHT], [FACE.DOWN], 
      [FACE.LEFT], [FACE.UP], [FACE.UP, FACE.UP]];
    return FACE_PATH[face];
  }

  constructor(config) {
    this.config = config;
    this.state = makeState(config);
    this.visited = new Array(config.width*config.height).fill(0);
  }

  isInside(x, y) {
    return x >= 0 && x < this.config.width &&
      y >= 0 && y < this.config.height;
  }

  isVisited(x, y) {
    return this.visited[x + y*this.config.width] == 1;
  }

  isAtTarget(x, y, faces) {
    const target = this.config.target;
    if (x !== target.x || y !== target.y) {
      return false;
    }
    if (target.faces !== undefined) {
      for (let i = 0; i < NUM_FACES; i++) {
        if (target.faces[i] !== undefined && faces[i] != target.faces[i]) {
          return false;
        }
      }
    }
    return true;
  }

  setVisited(x, y, val = 1) {
    this.visited[x + y*this.config.width] = val;
  }

  move(dir, ignoreConstraints = false) {
    let toState = makeState(this.config);
    let res = this.evalMove(this.state, toState, dir, ignoreConstraints);
    if ((res == MOVE_RESULT.CONSTRAINED && !ignoreConstraints) ||
        res == MOVE_RESULT.OUTSIDE) {
      return res;
    }
    this.state = toState;
    this.setVisited(toState.x, toState.y, 1);
    return res;
  }

  evalMove(fromState, toState, dir) {
    const offset = MOVE_OFFSETS[dir - 1];
    const x = fromState.x + offset[0];
    const y = fromState.y + offset[1];

    if (!this.isInside(x, y)) {
      return MOVE_RESULT.OUTSIDE;
    }

    let res = MOVE_RESULT.SUCCESS;
    if (this.isVisited(x, y)) {
      res = MOVE_RESULT.CONSTRAINED;
    }
    
    const mapping = MOVE_MAPPING[dir - 1];
    for (let i = 0; i < NUM_FACES; i++) {
      toState.faces[i] = fromState.faces[mapping[i]];
    }

    if (this.isAtTarget(x, y, toState.faces)) {
      res = MOVE_RESULT.TARGET;
    } else if (toState.faces[0] === 0) {
      res = MOVE_RESULT.CONSTRAINED;      
    }
    
    toState.x = x;
    toState.y = y;
    
    return res;
  }

  *moves() {
    let toState = makeState(this.config);
    for (let dir of MOVE_DIRS) {
      if (this.evalMove(this.state, toState, dir) == MOVE_RESULT.SUCCESS) {
        yield dir;
      }
    }
  }

  solve() {
    const FREE      = 0;
    const BLOCKED   = 1;
    const TARGET    = 2;

    const w         = this.config.width;
    const h         = this.config.height;
    const w2        = w + 2;
    const h2        = h + 2;
    const start     = this.config.start;
    const target    = this.config.target;
    const begPos    = (start.y + 1)*w2 + start.x + 1;
    const endPos    = (target.y + 1)*w2 + target.x + 1;
    const moveOffs  = [1, w2, -1, -w2];
    const stackSize = w*h + 1;
    const begFace   = start.faces ? start.faces[0] : 0;    
    const endFace   = target.faces ? target.faces[0] : FACE.ANY;


    let cells = new Array(w2*h2).fill(BLOCKED);
    for (let i = 1; i <= h; i++) {
      for (let j = 1; j <= w; j++) {
        cells[j + w2*i] = FREE;
      }
    }
    cells[begPos] = BLOCKED;
    cells[endPos] = TARGET;

    let stack = [];
    for (let i = 0; i < stackSize; i++) {
      stack.push({dir: 0, pos: begPos, face: begFace});
    }

    let depth = 0; 
    let bestDepth = 0;
    let nodesVisited = 0;

    while (depth >= 0) {
      let state = stack[depth];
      const dir = state.dir;
      state.dir++;

      if (dir >= NUM_DIRS) {
        // go level up
        cells[state.pos] = FREE;
        depth--;
      } else {
        let next = stack[depth + 1];
        next.pos = state.pos + moveOffs[dir];
        const cell = cells[next.pos];
        if (cell == BLOCKED) {
          continue;
        }

        next.face = FACE_MOVEMENT[dir][state.face];
        if (cell == TARGET) {
          if (depth > bestDepth && (endFace == FACE.ANY || next.face == endFace)) {
            // reached the target, build the solution
            let res = [];
            for (let i = 0; i <= depth; i++) {
              res.push(stack[i].dir);
            }
            bestDepth = depth;
            if (depth >= w*h - 2) {
              // found the best solution possible
              return {type: 'solution', result: res};
            }
          }
          continue;
        }

        if (next.face == FACE.FRONT) {
          continue;
        }

        nodesVisited++;
        if (nodesVisited % HEARTBEAT_PERIOD == 0) {
          //yield {type: "heartbeat", result: nodesVisited };
        }

        // we need to go deeper
        cells[next.pos] = BLOCKED;
        depth++;
        next.dir = 0;
      }
    }    
  }
  
}


export { FACE, MOVE_OFFSETS, FACE_MOVEMENT, Board };