import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import '../style/rotation.css';

export default function Square (props){

    let dashHelper = (
      <div>
        <span className="dashing"><i></i></span>
        <span className="dashing"><i></i></span>
        <span className="dashing"><i></i></span>
        <span className="dashing"><i></i></span>
      </div>
    );

    if (props.cMark != null){

      return (
        <div className={'square classical'} onClick={props.onClick}>
          {dashHelper}
          <div className="marks adjustCenter">
            { props.cMark[0] }<sub>{ props.cMark[1] }</sub>
          </div>
        </div>
      );
    } else{

      let cls = classNames('square',
                          {'rotating-dashed': props.isHighlighted},
                          {'selected': props.isBeingCollapsed})

      return (
        <div className={cls} onClick={props.onClick}>
          {dashHelper}
          <div className="marks">
            <QuantumMarks
              isHighlighted={props.isHighlighted}
              isBeingCollapsed={props.isBeingCollapsed}
              qMarks={props.qMarks}
              cycleMarks={props.cycleMarks}
            />
          </div>
        </div>
      );
    }
}

Square.propTypes = {
  cMark: PropTypes.string,
  /**
    Classical mark to be displayed in Square, or `null` if there is none.
  */
  onClick: PropTypes.func.isRequired,
  /**
    Passes index of Square clicked up to Game.handleClick.
  */
  isHighlighted: PropTypes.bool.isRequired,
  /**
    True if square is involved in a cycle or not. If so, a rotating border
    will be added to the square for emphasis.
  */
  isBeingCollapsed: PropTypes.bool.isRequired,
  /**
    True if there is a cycle and square is selected as collapse node.
  */
  qMarks: PropTypes.array,
  /**
    Contains quantum marks to display inside of Square. Ignored if `cMark` is non-null.
  */
  cycleMarks: PropTypes.array,
  /**
    Contains marks involved in cycle, `null` if no cycle currently exists. Used to
    colorize only marks involved in cycle, as they are the only valid targets for
    collapse.
  */
}

export function QuantumMarks (props){

  let spans;
  if (props.qMarks != null){
    let marks = Array.from(props.qMarks.filter((x) => x != null));

    if (marks.length >= 1){
      spans = Array.from(marks.slice(0, -1).map((m) => {

      let markCls = classNames("white",
                               {"blue": props.isHighlighted && props.cycleMarks.includes(m)},
                               {"red": props.isBeingCollapsed && props.cycleMarks.includes(m)})

        return <span className={markCls} key={m}>{ m[0] }<sub>{ m[1] }</sub>, </span>;
      }));

      let lastMark = marks[marks.length - 1];
      let markCls = classNames("white",
                              {"blue": props.isHighlighted && props.cycleMarks.includes(lastMark)},
                              {"red": props.isBeingCollapsed && props.cycleMarks.includes(lastMark)})

      spans.push(<span className={markCls} key={lastMark}>{ lastMark[0] }<sub>{ lastMark[1] }</sub></span>);
    }
  }
  return <div> {spans} </div>;
}
