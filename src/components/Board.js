import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Square from './Square.js';

export default class Board extends Component {

  static propTypes = {
    cSquares: PropTypes.array.isRequired,
    qSquares: PropTypes.array,
    cycleSquares: PropTypes.array,
    cycleMarks: PropTypes.array,
    onSquareClick: PropTypes.func.isRequired,
    /**
      Passes index of square that was clicked up to Game.handleSquareClick.
    */

  }

  renderSquare(i) {
    return <Square
              cMark={this.props.cSquares[i]}
              qMarks={this.props.qSquares[i]}
              onClick={() => this.props.onSquareClick(i)}
              isHighlighted={Boolean(this.props.cycleSquares && this.props.cycleSquares.includes(i))}
              isBeingCollapsed={this.props.collapseSquare === i}
              cycleMarks={this.props.cycleMarks}
           />;
  }

  render() {

    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}
