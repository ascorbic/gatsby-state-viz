import React, {
  Component,
  createContext,
  useState,
  useMemo,
  useEffect,
  useRef
} from "react"
import useWebSocket from "react-use-websocket"
import {
  Machine,
  MachineConfig,
  AnyEventObject,
  State,
  StateMachine
} from "xstate"

import "./App.css"

// import { MachineViz } from "./viz/"
import { StateChartVisualiser } from "./xviz/StateChartVisualiser"

const options = {
  reconnectAttempts: Number.MAX_SAFE_INTEGER,
  reconnectInterval: 1000
}

export const App: React.FC = () => {
  const [sendMessage, lastMessage, readyState] = useWebSocket(
    "ws://localhost:8080/",
    options
  )

  const [machine, setMachine] = useState<StateMachine<any, any, any>>()

  const [currentState, setCurrentState] = useState<State<any>>()

  useEffect(() => {
    console.log({ lastMessage })
    if (readyState === WebSocket.CLOSED) {
      setMachine(undefined)
      setCurrentState(undefined)
      return
    }
    if (!lastMessage) {
      if (readyState === WebSocket.OPEN) {
        sendMessage?.(JSON.stringify({ type: `GET_MACHINE` }))
      }
      return
    }

    const message = JSON.parse(lastMessage.data)
    console.log(message.type)
    switch (message.event) {
      case `SET_MACHINE`:
        setMachine(Machine(message.config, message.options))
      //fall through
      case `SET_STATE`:
        if (currentState?.matches(message.state)) {
          console.log("unchanged")
          return
        }
        setCurrentState(State.from(message.state))
    }
  }, [lastMessage, readyState, sendMessage])

  console.log({ readyState })

  return machine && currentState ? (
    <>
      {/* <MachineViz machine={machine} state={currentState} /> */}
      <StateChartVisualiser machine={machine} state={currentState} />
    </>
  ) : (
    <p>Waiting for Gatsby</p>
  )
}

export default App
