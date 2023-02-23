type GraphNode<T> = {
  id: T;
};

type GraphEdge<T, V = any> = {
  from: T;
  to: T;
  rule: (action: V) => boolean;
};

type Graph<T, V, C = any> = {
  nodes: GraphNode<V>[];
  edges: GraphEdge<T, C>[];
};

// rules for changing state machine of a turnstile using graphs
type TurnstileState = "locked" | "unlocked" | "alarm";
type TurnstileAction = "coin" | "pass" | "cheat";
type TurnstileTransition = {
  from: TurnstileState;
  to: TurnstileState;
  action: TurnstileAction;
};

const turnstileTransitions: TurnstileTransition[] = [
  { from: "locked", to: "unlocked", action: "coin" },
  { from: "unlocked", to: "locked", action: "pass" },
  { from: "unlocked", to: "unlocked", action: "coin" },
  { from: "locked", to: "locked", action: "pass" },
];

const turnstileActions: TurnstileAction[] = ["coin", "pass"];

// using turnstile transitions create a list of actions that need to be taken to get from one state to another
function getActions(
  graph: Graph<TurnstileState, TurnstileState, TurnstileAction>,
  from: TurnstileState,
  to: TurnstileState
): TurnstileAction[] {
  const actions: TurnstileAction[] = [];
  let currentState = from;
  while (currentState !== to) {
    for (const action of turnstileActions) {
      const nextState = getNextState(graph, currentState, action);
      if (isReachable(graph, currentState, nextState)) {
        actions.push(action);
        currentState = nextState;
        break;
      }
    }
  }
  return actions;
}

// create a turnstile graph with all possible states and actions
function createTurnstileGraph(): Graph<
  TurnstileState,
  TurnstileState,
  TurnstileAction
> {
  const nodes: GraphNode<TurnstileState>[] = [];
  const edges: GraphEdge<TurnstileState>[] = [];
  for (const transition of turnstileTransitions) {
    nodes.push({ id: transition.from });
    nodes.push({ id: transition.to });
    edges.push({
      from: transition.from,
      to: transition.to,
      rule: (action: TurnstileAction) => action === transition.action,
    });
  }
  return { nodes, edges };
}

// get all states that can be reached from a given state
function getReachableStates(
  graph: Graph<TurnstileState, TurnstileState, TurnstileAction>,
  from: TurnstileState
): TurnstileState[] {
  const reachableStates: TurnstileState[] = [];
  const visitedStates: TurnstileState[] = [];

  function visit(state: TurnstileState) {
    if (visitedStates.includes(state)) {
      return;
    }
    visitedStates.push(state);
    reachableStates.push(state);
    for (const edge of graph.edges) {
      if (edge.from === state) {
        visit(edge.to);
      }
    }
  }

  visit(from);
  return reachableStates;
}

// determine if a state is reachable from another state
function isReachable(
  graph: Graph<TurnstileState, TurnstileState, TurnstileAction>,
  from: TurnstileState,
  to: TurnstileState
): boolean {
  return getReachableStates(graph, from).includes(to);
}

// next state given a current state and an action
function getNextState(
  graph: Graph<TurnstileState, TurnstileState, TurnstileAction>,
  state: TurnstileState,
  action: TurnstileAction
): TurnstileState {
  for (const edge of graph.edges) {
    if (edge.from === state && edge.rule(action)) {
      return edge.to;
    }
  }
  throw new Error(`No transition found from ${state} with action ${action}`);
}

// create a turnstile graph
const turnstileGraph = createTurnstileGraph();

// change state machine of a turnstile using graphs
type Turnstile = {
  state: TurnstileState;
  act: (action: TurnstileAction) => void;
};

function createTurnstile(): Turnstile {
  let state: TurnstileState = "locked";
  return {
    get state() {
      return state;
    },
    act(action: TurnstileAction) {
      state = getNextState(turnstileGraph, state, action);
    },
  };
}

const turnstile = createTurnstile();
console.log(turnstile.state); // 'locked'
turnstile.act("coin");
console.log(turnstile.state); // 'unlocked'
turnstile.act("pass");
console.log(turnstile.state); // 'locked'
turnstile.act("pass");
console.log(turnstile.state); // 'locked'
turnstile.act("coin");
console.log(turnstile.state); // 'unlocked'
turnstile.act("coin");
console.log(turnstile.state); // 'unlocked'

// get all actions that need to be taken to get from locked to unlocked
const actionsToUnlock = getActions(turnstileGraph, "locked", "unlocked");

// get all actions that need to be taken to get from unlocked to locked
const actionsToLock = getActions(turnstileGraph, "unlocked", "locked");

// get all actions that need to be taken to get from locked to locked
const actionsToStayLocked = getActions(turnstileGraph, "locked", "locked");

// get all actions that need to be taken to get from unlocked to unlocked
const actionsToStayUnlocked = getActions(
  turnstileGraph,
  "unlocked",
  "unlocked"
);

// add a new state machine to the turnstile graph
const turnstileGraphWithAlarm = {
  ...turnstileGraph,
  nodes: [...turnstileGraph.nodes, { id: "alarm" }],
  edges: [
    ...turnstileGraph.edges,
    {
      from: "locked",
      to: "alarm",
      rule: (action: TurnstileAction) => action === "cheat",
    },
    {
      from: "unlocked",
      to: "alarm",
      rule: (action: TurnstileAction) => action === "cheat",
    },
  ],
};

// create a turnstile with an alarm
const turnstileWithAlarm = createTurnstile();
console.log(turnstileWithAlarm.state); // 'locked'
turnstileWithAlarm.act("coin");
console.log(turnstileWithAlarm.state); // 'unlocked'
turnstileWithAlarm.act("pass");
console.log(turnstileWithAlarm.state); // 'locked'
turnstileWithAlarm.act("pass");
console.log(turnstileWithAlarm.state); // 'locked'
turnstileWithAlarm.act("coin");
console.log(turnstileWithAlarm.state); // 'unlocked'
turnstileWithAlarm.act("coin");
console.log(turnstileWithAlarm.state); // 'unlocked'
turnstileWithAlarm.act("cheat");
console.log(turnstileWithAlarm.state); // 'alarm'
