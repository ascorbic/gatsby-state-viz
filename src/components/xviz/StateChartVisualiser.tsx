import React, { useState, useEffect } from 'react';
// import styled from 'styled-components';
import { getEdges } from './utils';
import { serializeEdge, initialStateNodes } from './utils';
import { Edge } from './Edge';
import { InitialEdge } from './InitialEdge';
import { StateChartNode } from './StateChartNode';
import { State, Interpreter, StateMachine } from 'xstate';

// const StyledVisualization = styled.div`
//   // position: relative;
//   // max-height: inherit;
//   // overflow-y: auto;
// `;

export const StateChartVisualiser: React.SFC<{
  machine: StateMachine<any, any, any>;
  state: State<any>
}> = ({ machine, state: current }) => {
  const [transitionCount, setTransitionCount] = useState(0);
  
  const [state, setState] = React.useState<{
    [key: string]: any;
    preview?: State<any, any>;
  }>({
    toggledStates: {},
    previewEvent: undefined,
    preview: undefined
  });
  const svgRef = React.useRef<SVGSVGElement>(null);
  let edges: ReturnType<typeof getEdges> | null;

  try {
    edges = getEdges(machine);
  } catch (err) {
    edges = null;
    console.error(err);
  }


  if ( !edges) {
    return null;
  }

  return (
    <div>
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          // @ts-ignore
          '--color': 'gray',
          overflow: 'visible',
          pointerEvents: 'none'
        }}
        ref={svgRef}
        key={JSON.stringify(state.toggledStates)}
      >
        <defs>
          <marker
            id="marker"
            markerWidth="4"
            markerHeight="4"
            refX="2"
            refY="2"
            markerUnits="strokeWidth"
            orient="auto"
          >
            <path d="M0,0 L0,4 L4,2 z" fill="var(--color-edge)" />
          </marker>
          <marker
            id="marker-preview"
            markerWidth="4"
            markerHeight="4"
            refX="2"
            refY="2"
            markerUnits="strokeWidth"
            orient="auto"
          >
            <path d="M0,0 L0,4 L4,2 z" fill="var(--color-edge-active)" />
          </marker>
        </defs>
        {edges.map(edge => {
          if (!svgRef.current) {
            return;
          }

          // const svgRect = this.svgRef.current.getBoundingClientRect();

          return (
            <Edge
              key={serializeEdge(edge)}
              svg={svgRef.current}
              edge={edge}
              preview={
                edge.event === state.previewEvent &&
                current.matches(edge.source.path.join('.')) &&
                !!state.preview &&
                state.preview.matches(edge.target.path.join('.'))
              }
            />
          );
        })}
        {initialStateNodes(machine).map((initialStateNode, i) => {
          if (!svgRef.current) {
            return;
          }

          return (
            <InitialEdge
              key={`${initialStateNode.id}_${i}`}
              source={initialStateNode}
              svgRef={svgRef.current}
              preview={
                current.matches(initialStateNode.path.join('.')) ||
                (!!state.preview &&
                  state.preview.matches(initialStateNode.path.join('.')))
              }
            />
          );
        })}
      </svg>
      <StateChartNode
        stateNode={machine}
        current={current}
        transitionCount={transitionCount}
        level={0}
        preview={state.preview}
        onEvent={event => {
          // send(event);
        }}
        onPreEvent={event => {
          // if (!state.preview) {
          //   setState({
          //     ...state,
          //     preview: service.nextState(event),
          //     previewEvent: event
          //   });
          // }
        }}
        onExitPreEvent={() => {
          setState({
            ...state,
            preview: undefined,
            previewEvent: undefined
          });
        }}
        onSelectServiceId={serviceId => {
          // const s = (service as any).children.get(serviceId);

          // if (s) {
          //   onSelectService(s); // TODO: pass service via context
          // }
        }}
        toggledStates={state.toggledStates}
      />
    </div>
  );
};
