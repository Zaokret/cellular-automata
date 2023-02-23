type Branch = "A" | "B";
type Axiom = "A";
type LBranch = Branch | LSystem;
type LSystem = [LBranch] | [LBranch, LBranch];

class Algae {
  static axiom: Axiom = "A";
  static rules: Map<Branch, LSystem> = new Map([
    ["A", ["A", "B"]],
    ["B", ["A"]],
  ]);

  constructor() {}

  static getLSystem(): LSystem {
    return this.rules.get(this.axiom) as LSystem;
  }

  // get next n gnerations of l-system
  static getGenerations(n: number): LSystem {
    let lSystem = this.getLSystem();
    for (let i = 0; i < n; i++) {
      lSystem = this.getNextGeneration(lSystem);
    }
    return lSystem;
  }

  static getNextGeneration(lSystem: LSystem): LSystem {
    let nextGeneration: LSystem = [] as unknown as LSystem;
    for (let i = 0; i < lSystem.length; i++) {
      const branch = lSystem[i];
      if (typeof branch === "string") {
        nextGeneration.push(this.rules.get(branch) as LSystem);
      } else {
        nextGeneration.push(this.getNextGeneration(branch));
      }
    }
    return nextGeneration;
  }
}

const g = Algae.getGenerations(2);

console.log(JSON.stringify(g, null, 4));
