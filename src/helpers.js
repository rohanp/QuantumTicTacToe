// pure helper functions

export function getWinnerMsg(scores){
  let msg;
  let winner = scores['X'] > scores['Y'] ? 'X' : 'Y';
  let loser = winner === 'X' ? 'Y' : 'X';

  if (scores['X'] + scores['Y'] === 1)
    msg = `${winner} wins!!! \n ${winner} gets 1 point \n ${loser} gets 0 points`;

  else if (scores['X'] === 1.5 || scores['Y'] === 1.5)
    msg = `${winner} wins with a double three-in-a-row!!! \n ${winner} gets 1.5 points \n ${loser} gets 0 points`;

  else if (scores['X'] + scores['Y'] === 1.5)
    msg = `Both players got three in a row, but ${winner} got it first! (The mark placed in${winner}'s three-in-a-row has a smaller subscript than ${loser} \n ${winner} gets 1 point \n ${loser} gets 0.5 points`;

  return msg;
}

export function calculateWinners(squares){
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  let winners = [];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[b] && squares[c] &&
        squares[a][0] === squares[b][0] &&
        squares[a][0] === squares[c][0]) {

      let subscripts = [squares[a][1], squares[b][1], squares[c][1]].map(Number);

      winners.push( [
                      Math.max(...subscripts),
                      squares[a][0],
                      lines[i],
                    ]
                  ) ;
    }
  }

  return winners;
}

export function calculateScores(squares) {
  let winners = calculateWinners(squares);

  if (winners.length === 0)
    return null

  winners.sort();
  let scores = {'X': 0, 'Y': 0}

  if (winners.length >= 1)
    scores[ winners[0][1] ] += 1;
  else if (winners.length >= 2)
    scores[ winners[1][1] ] += 0.5;
  else if (winners.length === 3)
    scores[ winners[2][1] ] += 0.5;

  return scores;
}
