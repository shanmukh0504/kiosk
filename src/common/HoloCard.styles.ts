import styled, { keyframes, css } from "styled-components";

const holoSparkle = keyframes`
  0%, 100% {
    opacity: .1;  filter: brightness(1.2) contrast(1.25);
  }
  5%, 8% {
    opacity: .2; filter: brightness(.8) contrast(1.2);
  }
  13%, 16% {
    opacity: .05; filter: brightness(1.2) contrast(.8);
  }
  35%, 38% {
    opacity: .2;  filter: brightness(1) contrast(1);
  }
  55% {
    opacity: .05; filter: brightness(1.2) contrast(1.25);
  }
`;

const holoGradient = keyframes`
  0%, 100% {
    opacity: 0.1;
    filter: brightness(.5) contrast(1);
  }
  5%, 9% {
    opacity: .15;
    filter: brightness(.75) contrast(1.25);
  }
  13%, 17% {
    opacity: .2;
  }
  35%, 39% {
    opacity: .25;
    filter: brightness(.5) contrast(1);
  }
  55% {
    opacity: .1;
    filter: brightness(.75) contrast(1.25);
  }
`;

export const StyledHoloCard = styled.div<{
  active: boolean;
  activeBackgroundPosition: {
    tp: number;
    lp: number;
  };
  activeRotation: {
    x: number;
    y: number;
  };
  url: string;
  animated: boolean;
  height: number;
  width: number;
  showSparkles: boolean;
}>`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  background-color: #620C62FF;
  background-image: url(${({ url }) => url});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 16.7px;
  box-shadow:
    -3px -3px 3px 0 rgba(#26e6f7, 0.3),
    3px 3px 3px 0 rgba(#f759e4, 0.3),
    0 0 6px 2px rgba(#ffe759, 03),
    // 0 35px 25px -15px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  display: inline-block;
  vertical-align: middle;
  margin: 20px 10px;
  transform: rotateX(${({ activeRotation }) => activeRotation.y}deg)
    rotateY(${({ activeRotation }) => activeRotation.x}deg);

  &:before,
  &:after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-position: 50% 50%;
    background-repeat: no-repeat;
    background-size: 300% 300%;
    mix-blend-mode: color-dodge;
    opacity: 0;
    z-index: 1;
    transition: opacity .4s ease-out, background-position 0.08s linear;
    will-change: opacity, background-position;
    background-image: linear-gradient(
      0deg,
      transparent 25%,
      #54A29E70 46%,
      #A79D6670 54%,
      transparent 75%
    );
  }

  ${({ showSparkles }) =>
    showSparkles &&
    `&:after {
      background-image: url('https://assets.codepen.io/13471/sparkles.gif'),
        linear-gradient(
          -20deg,
          #ff008450 15%,
          #fca40040 30%,
          #ffff0030 40%,
          #00ff8a20 60%,
          #00cfff40 70%,
          #cc4cfa50 85%
        );
      position: center;
      background-size: 180%;
      mix-blend-mode: color-dodge;
      opacity: 1;
      z-index: 1;
    }`}

  ${({ active, activeBackgroundPosition }) => {
    const normalizedX = (activeBackgroundPosition.lp - 50) / 50;
    const normalizedY = (activeBackgroundPosition.tp - 50) / 50;

    const horizontalComponent = normalizedX * 35;
    const verticalComponent = normalizedY * 35;
    const gradientAngle = horizontalComponent - verticalComponent;

    return (
      active &&
      `&:before {
      opacity: .8;
      animation: none;
      background-image: linear-gradient(
        ${gradientAngle}deg,
        transparent 25%,
        #54A29E70 46%,
        #A79D6670 54%,
        transparent 75%
      );
      background-position: ${activeBackgroundPosition.lp}% ${activeBackgroundPosition.tp}%;
      transition: background-position 0.08s linear, opacity 0.4s ease-in-out;
      will-change: background-position, opacity;
    }`
    );
  }}

  ${({ animated }) =>
    animated &&
    css`
      transition: 1s;
      transform: rotateX(0deg) rotateY(0deg);
      &:before {
        transition: 1s;
        animation: ${holoGradient} 12s ease infinite;
      }
      &:after {
        transition: 1s;
        animation: ${holoSparkle} 12s ease infinite;
      }
    `}
`;

export const Overlay = styled.div<{ overlay: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${({ overlay }) => overlay});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 100;
  pointer-events: none;
`;

export const HoloOverlay = styled.div<{
  holoOverlay: string;
  active: boolean;
  activeBackgroundPosition: {
    tp: number;
    lp: number;
  };
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${({ holoOverlay }) => holoOverlay});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 101;
  pointer-events: none;
  border-radius: 16px;
  opacity: 0;

  ${({ active, activeBackgroundPosition }) => {
    const normalizedX = (activeBackgroundPosition.lp - 50) / 50;
    const normalizedY = (activeBackgroundPosition.tp - 50) / 50;

    const horizontalComponent = normalizedX * 35;
    const verticalComponent = normalizedY * 35;
    const gradientAngle = horizontalComponent - verticalComponent;

    return (
      active &&
      `
    opacity: 1;
    mask-image: linear-gradient(
      ${gradientAngle}deg,
      transparent 44%,
      rgba(0, 0, 0, 1) 47%,
      rgba(0, 0, 0, 1) 53%,
      transparent 56%
    );
    -webkit-mask-image: linear-gradient(
      ${gradientAngle}deg,
      transparent 44%,
      rgba(0, 0, 0, 1) 47%,
      rgba(0, 0, 0, 1) 53%,
      transparent 56%
    );
    mask-size: 300% 300%;
    border-radius: 16px;
    -webkit-mask-size: 300% 300%;
    mask-position: ${activeBackgroundPosition.lp}% ${activeBackgroundPosition.tp}%;
    -webkit-mask-position: ${activeBackgroundPosition.lp}% ${activeBackgroundPosition.tp}%;
    transition: mask-position 0.08s linear, opacity 0.4s ease-in-out;
    will-change: mask-position, opacity;
  `
    );
  }}
`;
