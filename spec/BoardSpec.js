import {Board, FACE, MOVE_RESULT} from '../src/model/Board';

describe('Board', () => {
  let board;

  beforeEach(() => {

    const conf = {
      width: 8,
      height: 8,
      start: {
        x: 0,
        y: 0
      },
      target: {
        x: 0,
        y: 7,
        faces: [0]
      }
    };

    board = new Board(conf);
  });

  it('should initially have cube at start position', () => {
    expect(board.state).toEqual({x: 0, y: 0, face: 0});
  });

  it('should remap faces correctly during movement', () => {
    board.move(FACE.DOWN);
    board.move(FACE.RIGHT);
    expect(board.state).toEqual({x: 1, y: 1, face: FACE.DOWN});

    board.move(FACE.UP, true);
    board.move(FACE.LEFT, true);
    expect(board.state).toEqual({x: 0, y: 0, face: FACE.LEFT});
  });

  it('should constrain movement with hard constraints', () => {
    expect(board.move(FACE.UP, true)).toEqual(MOVE_RESULT.OUTSIDE);
    expect(board.move(FACE.DOWN, true)).toEqual(MOVE_RESULT.SUCCESS);
    expect(board.move(FACE.LEFT, true)).toEqual(MOVE_RESULT.OUTSIDE);
    expect(board.move(FACE.LEFT, true)).toEqual(MOVE_RESULT.OUTSIDE);
    expect(board.move(FACE.RIGHT, true)).toEqual(MOVE_RESULT.SUCCESS);
    for (let i = 0; i < 6; i++) {
      expect(board.move(FACE.RIGHT, true))
        .not
        .toEqual(MOVE_RESULT.OUTSIDE);
      expect(board.move(FACE.DOWN, true))
        .not
        .toEqual(MOVE_RESULT.OUTSIDE);
    }
    expect(board.move(FACE.RIGHT, true)).toEqual(MOVE_RESULT.OUTSIDE);
    expect(board.move(FACE.DOWN, true)).toEqual(MOVE_RESULT.OUTSIDE);
    expect([board.state.x, board.state.y]).toEqual([7, 7]);
  });

  it('should constrain movement with soft constraints', () => {
    expect(board.move(FACE.DOWN)).toEqual(MOVE_RESULT.SUCCESS);
    expect(board.move(FACE.UP)).toEqual(MOVE_RESULT.CONSTRAINED);
    expect(board.move(FACE.DOWN)).toEqual(MOVE_RESULT.SUCCESS);
    expect(board.move(FACE.UP)).toEqual(MOVE_RESULT.CONSTRAINED);
    expect(board.move(FACE.DOWN)).toEqual(MOVE_RESULT.SUCCESS);
    expect(board.move(FACE.DOWN)).toEqual(MOVE_RESULT.CONSTRAINED);
    expect(board.move(FACE.RIGHT)).toEqual(MOVE_RESULT.SUCCESS);
    expect(board.move(FACE.LEFT)).toEqual(MOVE_RESULT.CONSTRAINED);
    expect(board.move(FACE.UP)).toEqual(MOVE_RESULT.SUCCESS);
    expect(board.move(FACE.LEFT)).toEqual(MOVE_RESULT.CONSTRAINED);
  });

  it('should enumerate all available moves from a state', () => {
    expect(board.moves()).toEqual([FACE.RIGHT, FACE.DOWN]);
    board.move(FACE.DOWN);
    expect(board.moves()).toEqual([FACE.RIGHT, FACE.DOWN]);
    board.move(FACE.DOWN);
    board.move(FACE.DOWN);
    expect(board.moves()).toEqual([FACE.RIGHT]);
    board.move(FACE.RIGHT);
    expect(board.moves()).toEqual([FACE.RIGHT, FACE.UP]);
  });

  it('should correctly detect if reached target', () => {
    expect(board.isAtTarget({x:0, y:0, face:0})).toEqual(false);
    expect(board.isAtTarget({x:7, y:0, face:3})).toEqual(false);
    expect(board.isAtTarget({x:0, y:7, face:0})).toEqual(true);
  });

  it('should solve a 2x2 board', () => {
    const conf0 = {
      width: 2,
      height: 2,
      start: {
        x: 0,
        y: 0
      },
      target: {
        x: 0,
        y: 1,
        faces: [0]
      }
    };

    let board0 = new Board(conf0);
    let sol = board0.solve();
    expect(sol.type).toEqual('solution');
    expect(sol.result).toEqual([1, 2, 3]);
  });

  it('should solve a 3x2 board, returning to the start cell', () => {
    const conf0 = {
      width: 3,
      height: 2,
      start: {
        x: 0,
        y: 0,
        faces: [1]
      },
      target: {
        x: 0,
        y: 0
      }
    };

    let board0 = new Board(conf0);
    let sol = board0.solve();
    expect(sol.type).toEqual('solution');
    expect(sol.result).toEqual([
      1,
      1,
      2,
      3,
      3,
      4
    ]);
  });

  it('should solve a 4x2 board', () => {
    const conf0 = {
      width: 4,
      height: 2,
      start: {
        x: 0,
        y: 0
      },
      target: {
        x: 0,
        y: 1,
        faces: [0]
      }
    };

    let board0 = new Board(conf0);
    let sol = board0.solve();
    expect(sol.type).toEqual('solution');
    expect(sol.result).toEqual([
      1,
      1,
      1,
      2,
      3,
      3,
      3
    ]);
  });

  it('should solve a 4x4 board, returning to the start cell', () => {
    const conf0 = {
      width: 4,
      height: 4,
      start: {
        x: 0,
        y: 0,
        faces: [1]
      },
      target: {
        x: 0,
        y: 0
      }
    };

    let board0 = new Board(conf0);
    expect(Board.pathToText(board0.solve().result)).toEqual('ESENESSSWNWSWNNN');
  });

  it('should solve a 8x8 board', () => {
    const conf0 = {
      width: 8,
      height: 8,
      start: {
        x: 0,
        y: 0
      },
      target: {
        x: 7,
        y: 0,
        faces: [0]
      }
    };

    let board0 = new Board(conf0);
    let sol = board0
      .solve()
      .result;
    expect(Board.pathToText(sol)).toEqual('EEESWSWNWSSSSSSENESENNWWNNESENNESSENESSWWSSENESENNNNNNWSWNWNEEE');
  });

});
