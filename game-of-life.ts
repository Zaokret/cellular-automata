const GRID_SIZE = 13;
const UNDERPOPULATION_LIMIT = 2;
const OVERPOPULATION_LIMIT = 3;
const REPRODUCTION_COUNT = 3;
const ALIVE = true;
const DEAD = false;

class Cell {
  constructor(public state: boolean = DEAD) {}

  static createRandom() {
    return new Cell(Math.random() > 0.5);
  }
}

type TwoDArr<T> = T[][];

class Grid {
  private cells: TwoDArr<Cell> = [];
  constructor(private size: number = GRID_SIZE) {
    this.cells = this.createCellSquare(size, Cell.createRandom);
  }

  private createCellSquare(size: number, fn: () => Cell) {
    const cells: TwoDArr<Cell> = [];
    for (let i = 0; i < size; i++) {
      cells[i] = [];
      for (let j = 0; j < size; j++) {
        cells[i][j] = fn();
      }
    }
    return cells;
  }

  private getCopy() {
    const cells: TwoDArr<Cell> = [];
    for (let i = 0; i < this.size; i++) {
      cells[i] = [];
      for (let j = 0; j < this.size; j++) {
        cells[i][j] = new Cell(this.cells[i][j].state);
      }
    }
    return cells;
  }

  private getNeigborsWithWrapping(x: number, y: number) {
    const neighbors: Cell[] = [];
    for (let i = x - 1; i <= x + 1; i++) {
      for (let j = y - 1; j <= y + 1; j++) {
        if (!(i === x && j === y)) {
          neighbors.push(
            this.cells[(i + this.size) % this.size][(j + this.size) % this.size]
          );
        }
      }
    }
    return neighbors;
  }

  // returns true if there are more generations
  public next(): boolean {
    const nextGeneration = this.getNextGeneration();
    if (this.generationsEq(this.cells, nextGeneration)) {
      return false;
    }

    this.cells = nextGeneration;
    return true;
  }

  // returns true if the two generations are equal
  private generationsEq(current: TwoDArr<Cell>, next: TwoDArr<Cell>) {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (current[i][j].state !== next[i][j].state) {
          return false;
        }
      }
    }
    return true;
  }

  private getNextGeneration(): TwoDArr<Cell> {
    const nextGeneration = this.getCopy();

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const aliveNeighbors = this.getNeigborsWithWrapping(i, j).filter(
          (cell) => cell.state === ALIVE
        ).length;
        if (
          this.cells[i][j].state === ALIVE &&
          (aliveNeighbors < UNDERPOPULATION_LIMIT ||
            aliveNeighbors > OVERPOPULATION_LIMIT)
        ) {
          nextGeneration[i][j].state = DEAD;
        } else if (
          this.cells[i][j].state === DEAD &&
          aliveNeighbors === REPRODUCTION_COUNT
        ) {
          nextGeneration[i][j].state = ALIVE;
        }
      }
    }
    return nextGeneration;
  }

  public print() {
    for (let i = 0; i < this.size; i++) {
      let row = "";
      for (let j = 0; j < this.size; j++) {
        row += this.cells[i][j].state ? "██" : "░░";
      }
      console.log(row);
    }
  }
}

const grid = new Grid();

let count = 0;
function loop() {
  if (grid.next()) {
    count++;
    grid.print();
    console.log("====================================");
    setTimeout(loop, 100);
  } else {
    console.log(`Total generations: ${count}`);
  }
}

loop();
