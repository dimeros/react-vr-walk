import React, { Component } from 'react';
import {
  Scene,
  Animated,
  Pano,
  VrHeadModel
} from 'react-vr';
import PropTypes from 'prop-types';

const AnimatedScene = Animated.createAnimatedComponent(Scene);
const AnimatedPano = Animated.createAnimatedComponent(Pano);

const DIRECTION = {
  FORWARD: 'FORWARD',
  BACKWARD: 'BACKWARD',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
};

export default class Walk extends Component {
  static get propTypes() {
    return {
      starting: PropTypes.number,
      startingPano: PropTypes.number,
      speed: PropTypes.number,
      children: PropTypes.node.isRequired,
      panoSource: PropTypes.any.isRequired,
    };
  }

  static get defaultProps() {
    return {
      starting: 0,
      startingPano: 0,
      speed: 0.1,
    };
  }

  constructor(props) {
    super(props);
    const { starting = 0, startingPano = 0 } = props;

    this.state = {
      x: new Animated.Value(0),
      z: new Animated.Value(starting),
      pz: new Animated.Value(startingPano),
    };

    this.moveZ = Animated.event([
      null, { dz: this.state.z },
    ]);

    this.movePZ = Animated.event([
      null, { dz: this.state.pz },
    ]);

    this.moveX = Animated.event([
      null, { dx: this.state.x },
    ]);

    this.positionZ = starting;
    this.positionPZ = startingPano;
    this.positionX = 0;
  }

 onInput = (e) => {
    const event = e.nativeEvent.inputEvent;

    if (event.eventType === 'keydown') {
      console.log(event);
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.walk(DIRECTION.FORWARD);
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.walk(DIRECTION.LEFT);
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.walk(DIRECTION.BACKWARD);
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.walk(DIRECTION.RIGHT);
          break;
        default:
          break;
      }
    }
  }

  toRadians = (angle) => angle * (Math.PI / 180);
  moveForward = (speed, angle) => {
	  this.positionZ = this.positionZ - angle*speed;
      this.positionPZ = this.positionPZ + angle*(speed * 10);
      this.moveZ(null, { dz: this.positionZ });
      this.movePZ(null, { dz: this.positionPZ });
  }
  
  moveBackWard = (speed, angle) => {
	  this.positionZ = this.positionZ + angle*speed;
      this.positionPZ = this.positionPZ - angle*(speed * 10);
      this.moveZ(null, { dz: this.positionZ });
      this.movePZ(null, { dz: this.positionPZ });
  }
  
   moveLeft = (speed, angle) => {
	  this.positionX = this.positionX - angle*speed;
      this.moveX(null, { dx: this.positionX });
  }
  
   moveRight = (speed, angle) => {
	  this.positionX = this.positionX + angle*speed;
      this.moveX(null, { dx: this.positionX });
  }
  
  walk = (position) => {
    const { speed = 0.1 } = this.props;

	let headModel = VrHeadModel.rotation()[1];
	
	let angleCos = Math.cos(this.toRadians(headModel)); // get complimentary angle
	let angleSin = Math.sin(this.toRadians(headModel)); // get complimentary angle
	
	console.log(headModel, angleCos, angleSin);
    switch (position) {
      case DIRECTION.FORWARD:
		this.moveForward(speed, angleCos);
		this.moveLeft(speed, angleSin);
        break;
      case DIRECTION.RIGHT:
		this.moveForward(speed, angleSin);
		this.moveRight(speed, angleCos);
        break;
      case DIRECTION.BACKWARD:
		this.moveBackWard(speed, angleCos);
        this.moveRight(speed, angleSin);
        break;
      case DIRECTION.LEFT:
		this.moveBackWard(speed, angleSin);
		this.moveLeft(speed, angleCos);
        break;
      default:
        break;
    }
  }

  render() {
    const { panoSource, children } = this.props;
    return (
      <AnimatedScene
        onInput={this.onInput}
        style={{
          transform: [
            { translateX: this.state.x },
            { translateZ: this.state.z }
          ]
        }}
      >
        <AnimatedPano
          source={panoSource}
          style={{
            transform: [
              { translateZ: this.state.pz }
            ]
          }}
        />
        {children}
      </AnimatedScene>
    );
  }
}
