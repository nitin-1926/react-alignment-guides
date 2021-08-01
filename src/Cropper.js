import React, { Component } from 'react';
import Draggable from 'react-draggable'; // The default
import cornerNotch from './assets/cornerNotch.svg';
import middleNotch from './assets/middleNotch.svg';
import styles from './styles.scss';
import { Rnd } from "react-rnd";


export default class Cropper extends Component {
    constructor(props) {
        super(props);
        this.handleImageLoaded = this.handleImageLoaded.bind(this);
        this.calculateNewScale = this.calculateNewScale.bind(this);
        this.state = {
            translateX : 0,
            translateY : 0,
            scale: null
        }
        this.escFunction = this.escFunction.bind(this);
        this.calculateNewObjectPosition = this.calculateNewObjectPosition.bind(this);
    }
    escFunction(event) {
        if (event.keyCode === 27) {
            const scale = this.state.scale || this.props.zoomScale
            this.props.endCropMode({
                scale,
                clientXPercentage: this.state.clientXPercentage ? this.state.clientXPercentage : this.props.objectPosition.horizontal,
                clientYPercentage: this.state.clientYPercentage ? this.state.clientYPercentage : this.props.objectPosition.vertical
            });
        }
    }
    componentDidMount() {
        document.addEventListener("keydown", this.escFunction, false);
    }
    componentWillUnmount() {
        document.removeEventListener("keydown", this.escFunction, false);
    }

    calculateNewObjectPosition() {
        const {initialTranslateX, translateX, initialTranslateY, translateY} = this.state;
        const differenceInX =  translateX - initialTranslateX;
        const differenceInY =  translateY - initialTranslateY;

        if (differenceInX !== 0) {
            const clientXPercentage = (differenceInX /  this.props.renderedResolution.width) * 100;
            this.setState({
                clientXPercentage
            })
        }

        if (differenceInY !== 0) {
            const clientYPercentage = (differenceInY / this.props.renderedResolution.height ) * 100;   
            this.setState({
                clientYPercentage
            })
        }
    }

    calculateNewScale(e, direction, ref, delta, position) {
        const originalWidth = this.state.onLoadBoundingRect.width / this.props.zoomScale ;
        const newScale =  Math.abs(ref.offsetWidth / originalWidth);

        this.setState({
            scale: newScale,
            width: ref.offsetWidth,
            height: ref.offsetHeight, 
            translateX: position.x, 
            translateY: position.y,
        });
        this.calculateNewObjectPosition();
        console.log('New scale', newScale);
    }

    handleImageLoaded(e) {
        const boundingRect = e?.target?.getBoundingClientRect();

        const newScale = this.state.scale || this.props.zoomScale || 1;

        let initX = this.props.position.width/2 - boundingRect.width/2;
        let initY = this.props.position.height/2 - boundingRect.height/2;

        if (this.props.objectPosition) {
            initX = initX + Math.round((this.props.objectPosition.horizontal * newScale * this.props.renderedResolution.width) / 100);
            initY = initY + Math.round((this.props.objectPosition.vertical * newScale * this.props.renderedResolution.height) / 100);
        }
        

        this.setState({
            onLoadBoundingRect: boundingRect,
            width: boundingRect.width,
            height: boundingRect.height, 
            translateX: initX, 
            translateY: initY,
            initialTranslateX: initX,
            initialTranslateY: initY
        })
    }


    render() {
        const draggableStyle = {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "solid 1px #f00",
            background: "transparent"
        };

        const innerDraggableStyle = {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "solid 1px #0f0",
            background: "transparent"
        }

        const newScale = this.state.scale || this.props.zoomScale || 1;

        const outerImageWidth = this.state.width || this?.rnd?.props?.default?.width;
        const outerImageHeight = this.state.height || this?.rnd?.props?.default?.height;


        const outerImageStyles = this.state.onLoadBoundingRect ? {position: 'absolute', filter: 'brightness(0.6)', opacity: '0.75', 'max-width': 'none', width: outerImageWidth, height: outerImageHeight, transform: `translate(${this.state.translateX}px, ${this.state.translateY}px)`} : {position: 'absolute', filter: 'brightness(0.6)', opacity: '0', transform: `scale(${newScale}) translate(${this.state.translateX}px, ${this.state.translateY}px)`};
        const innerImageStyles = this.state.onLoadBoundingRect ? {'max-width': 'none', width: outerImageWidth, height: outerImageHeight, transform: `translate(${this.state.translateX}px, ${this.state.translateY}px)`} : {transform: `scale(${newScale}) translate(${this.state.translateX}px, ${this.state.translateY}px)`, opacity: '0'};

        return (
            <>
                <img onLoad={this.handleImageLoaded} draggable="false" style={outerImageStyles} src={this.props.url} />

                <div style={{ width: '100%', height: '100%', 'pointer-events': 'none', overflow: 'hidden'}}>
                    <img onLoad={this.handleImageLoaded} draggable="false" style={innerImageStyles} src={this.props.url} />
                </div>
                <div className={styles.cropper_border} />

                {this.state.onLoadBoundingRect && <Rnd
                    ref={c => { this.rnd = c; }}
                    lockAspectRatio={true}
                    onDragStop={(e, d) => {
                        this.setState({
                            translateX: d.x, 
                            translateY: d.y, 
                        }, () => {
                            this.calculateNewObjectPosition();
                        })
                        
                    }}
                    onResizeStop={(e, direction, ref, delta, position) => this.calculateNewScale(e, direction, ref, delta, position)}
                    style={draggableStyle}
                    default={{
                        x: this.state.translateX,
                        y: this.state.translateY,
                        width: this.state.onLoadBoundingRect.width,
                        height: this.state.onLoadBoundingRect.height
                    }}
                />}

                {this.state.onLoadBoundingRect && <Rnd
                    lockAspectRatio={false}
                    style={innerDraggableStyle}
                    onDragStop={(e, d) => {
                    }}
                    default={{
                        x: 0,
                        y: 0,
                        width: '100%',
                        height: '100%'
                    }}
                />}

                <img src={cornerNotch} className={styles.cropper_notch_lt} />
                <img src={cornerNotch} className={styles.cropper_notch_rt} />
                <img src={cornerNotch} className={styles.cropper_notch_rb} />
                <img src={cornerNotch} className={styles.cropper_notch_lb} />
                <img src={middleNotch} className={styles.cropper_notch_tc} />
                <img src={middleNotch} className={styles.cropper_notch_rc} />
                <img src={middleNotch} className={styles.cropper_notch_bc} />
                <img src={middleNotch} className={styles.cropper_notch_lc} />
            </>
        )
    }
}
