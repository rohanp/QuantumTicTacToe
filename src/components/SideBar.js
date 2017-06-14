import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class SideBar extends Component{

	static propTypes = {
	  choices: PropTypes.array,
	  /**
	    Contains marks in selected square if collapse ongoing, else is `null`
	  */
	  onChoiceClick: PropTypes.func.isRequired,
	  /**
	    Passes selected choice of mark up to Game.handleCollapse
	  */
	  status: PropTypes.string.isRequired,
	  /**
	    Conveys player information about the state of the game
	  */
	}

	render(){
    let choices;

    if (this.props.choices != null)
      choices = this.props.choices.map((choice) => {
          return (
            <div className="collapseChoice"
               onClick={() => this.props.onChoiceClick(choice)}
               key={choice}>
               {choice}
            </div>
          );
        });

    return (<div className="game-info">
              <div className="status"> {this.props.status} </div>
              {choices}
            </div>);
	}
}
