import React, { useCallback, useEffect, useRef, useState } from "react"

import "./App.css"
import { Col, Row, Select } from "antd"
import { DownCircleTwoTone } from "@ant-design/icons"
import { bodyParts } from "./bodyParts"
import { data as bodyData } from "./data"
const generatedData = (): Data[] => {
	// generate an array of 32 objects
	const data: Data[] = []
	let x = 10
	let y = 10

	for (let i = 0; i < 33; i++) {
		data.push({
			x: x,
			y: y,
			bodyPart: i,
		})

		x += 90

		if (x > 800) {
			x = 10
			y += 140
		}
	}
	return data
}

const demoData: Data[] = [
	// Nose
	{ x: 200, y: 30, bodyPart: 0 },
	// Left eye
	{ x: 240, y: 10, bodyPart: 1 },
	{ x: 280, y: 10, bodyPart: 2 },
	{ x: 320, y: 10, bodyPart: 3 },
	// Right Eye
	{ x: 160, y: 10, bodyPart: 4 },
	{ x: 130, y: 10, bodyPart: 5 },
	{ x: 90, y: 10, bodyPart: 6 },
	// Left Ear
	{ x: 360, y: 30, bodyPart: 7 },
	// Right Ear
	{ x: 50, y: 30, bodyPart: 8 },
	// Mouth
	{ x: 170, y: 50, bodyPart: 9 },
	{ x: 230, y: 50, bodyPart: 10 },
	// Body
	{ x: 300, y: 150, bodyPart: 11 },
	{ x: 100, y: 150, bodyPart: 12 },
	{ x: 350, y: 250, bodyPart: 13 },
	{ x: 50, y: 250, bodyPart: 14 },
	{ x: 400, y: 200, bodyPart: 15 },
	{ x: 30, y: 200, bodyPart: 16 },
	{ x: 480, y: 200, bodyPart: 17 },
	{ x: 2, y: 200, bodyPart: 18 },

	{ x: 450, y: 100, bodyPart: 19 },
	{ x: 10, y: 150, bodyPart: 20 },
	{ x: 400, y: 100, bodyPart: 21 },
	{ x: 50, y: 150, bodyPart: 22 },
	{ x: 300, y: 400, bodyPart: 23 },
	{ x: 100, y: 400, bodyPart: 24 },
	{ x: 350, y: 550, bodyPart: 25 },
	{ x: 50, y: 550, bodyPart: 26 },
	{ x: 350, y: 750, bodyPart: 27 },
	{ x: 50, y: 750, bodyPart: 28 },
	{ x: 330, y: 790, bodyPart: 29 },
	{ x: 70, y: 790, bodyPart: 30 },
	{ x: 378, y: 790, bodyPart: 31 },
	{ x: 2, y: 790, bodyPart: 32 },
]

type Data = {
	x: number
	y: number
	bodyPart: number
}
const image = {
	width: 3268 / 4,
	height: 3989 / 4,
}
const formattedData = bodyData.map((d, i) => {
	return {
		x: d.x * image.width,
		y: d.y * image.height,
		bodyPart: i,
	}
})

type Point = {
  x: number;
  y: number;
};

function App() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<Data[]>(formattedData);
  const mouseDown = useRef<boolean>(false);
  const mouseClickPosition = useRef<Point>({ x: 0, y: 0 });
  const mouseMovePosition = useRef<Point>({ x: 0, y: 0 });
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });

  const reOffset = () => {
    if (ref.current === null) return;
    const canvas = ref.current;

    const BB = canvas.getBoundingClientRect();

    console.log("BB", BB.left, BB.right);

    setOffset({
      x: BB.left,
      y: BB.top,
    });
  };

  const draw = (cxt: CanvasRenderingContext2D, frameCount: number) => {
    // Clear the canvas
    cxt.clearRect(0, 0, cxt.canvas.width, cxt.canvas.height);
    cxt.strokeStyle = "palevioletred";
    cxt.fillStyle = "palevioletred";
    cxt.lineWidth = 1;

    data.forEach((item) => {
      drawCircle(item, cxt);
      drawLineBetweenPoints(item, data, cxt);
    });
  };

  /**
   * Handle drawing the circle before filling it in
   * @param item Data
   * @param cxt CanvasRenderingContext2D
   */
  const drawCircle = (item: Data, cxt: CanvasRenderingContext2D) => {
    const circle = new Path2D();
    circle.arc(item.x, item.y, 5, 0, 2 * Math.PI);

    const mouseOver = cxt.isPointInPath(
      circle,
      mouseClickPosition.current.x,
      mouseClickPosition.current.y
    );

    if (mouseOver) {
      cxt.fillStyle = "green";
    } else {
      cxt.fillStyle = "palevioletred";
    }
    cxt.fill(circle);
  };

  const drawLineBetweenPoints = (
    item: Data,
    dataList: Data[],
    cxt: CanvasRenderingContext2D
  ) => {
    const bodyPartId = item.bodyPart;

    // draw a circle

    // Add body part number to the circle
    // cxt.font = "20px system-ui"
    // cxt.fillStyle = "black"
    // cxt.fillText(bodyPartId.toString(), data.x - 5, data.y + 5)

    // find the connections for this body part
    const connections = bodyParts.find(
      (part) => part.id === bodyPartId
    )?.connects;
    // console.log("connections", connections);

    // draw a line to each connection
    if (connections) {
      connections.forEach((connection) => {
        const connectionData = dataList.find((d) => d.bodyPart === connection);

        if (connectionData) {
          // console.log("connectionData", connectionData);

          cxt.beginPath();
          cxt.moveTo(item.x, item.y);
          cxt.lineTo(connectionData.x, connectionData.y);
          cxt.strokeStyle = "lightblue";
          cxt.stroke();
          cxt.closePath();
        }
      });
    }
  };

  const onFilter = (id: number | string) => {
    if (typeof id === "string") {
      id = parseInt(id);
    }

    const connections = bodyParts.find((part) => part.id === id)?.connects;

    if (connections && (connections?.length ?? 0) > 0) {
      const newData = formattedData.filter((d) =>
        connections.includes(d.bodyPart)
      );
      console.log("newData", newData);
      setData(newData);
    } else {
      const newData = formattedData.filter((d) => d.bodyPart === id);
      setData(newData);
    }
  };

  const movePoint = (id: number | string, x: number, y: number) => {
    if (typeof id === "string") {
      id = parseInt(id);
    }

    const newData = data.map((d) => {
      if (d.bodyPart === id) {
        return {
          ...d,
          x: x,
          y: y,
        };
      }
      return d;
    });
    setData(newData);
  };

  function handleMouseMove(e: any) {
    e.preventDefault();
    e.stopPropagation();

    // @ts-ignore
    const mouseX = parseInt(e.clientX - offset?.x);
    // @ts-ignore
    const mouseY = parseInt(e.clientY - offset?.y);

    if (mouseDown.current) {
      mouseClickPosition.current = {
        x: mouseX,
        y: mouseY,
      };
    } else {
      mouseMovePosition.current = {
        x: mouseX,
        y: mouseY,
      };
    }
  }

  const handleMouseDown = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    mouseDown.current = true;
    mouseClickPosition.current = { x: e.clientX, y: e.clientY };

    // if (ref.current) {
    //   const ctx = ref.current.getContext("2d");
    //   if (ctx) {
    //     const x = e.clientX - ref.current.offsetLeft;
    //     const y = e.clientY - ref.current.offsetTop;

    //     const data = formattedData.find((d) => {
    //       const dx = Math.abs(d.x - x);
    //       const dy = Math.abs(d.y - y);
    //       return dx < 10 && dy < 10;
    //     });

    //     if (data) {
    //       console.log("data", data);
    //       movePoint(data.bodyPart, x, y);
    //     }
    //   }
    // }

    // const x = e.clientX;
    // const y = e.clientY;
  };

  useEffect(() => {
    if (!ref.current) return;
    reOffset();
  }, [ref]);

  useEffect(() => {
    if (!ref.current) return;
    if (!data) return;

    document.addEventListener("onscroll", reOffset);
    ref.current.addEventListener("mousemove", handleMouseMove);
    // canvas.addEventListener('click', handleMouseClick)
    ref.current.addEventListener("mousedown", handleMouseDown);
    // canvas.addEventListener('mouseup', handleMouseUp)

    const cxt = ref.current.getContext("2d");
    let frameCount = 0;
    let animationFrameId: any;
    let lastFrameTime = 0;
    const fps = 20;
    const frameTime = (1000 / 60) * (60 / fps) - (1000 / 60) * 0.5;

    const render = (time: number) => {
      if (time - lastFrameTime < frameTime) {
        animationFrameId = window.requestAnimationFrame(render);
        return;
      }
      frameCount++;
      lastFrameTime = time;
      // @ts-expect-error
      draw(cxt, frameCount);
      animationFrameId = window.requestAnimationFrame(render);
    };
    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      document.removeEventListener("onscroll", reOffset);
      if (!ref.current) return;
      ref.current.removeEventListener("mousemove", handleMouseMove);
      ref.current.addEventListener("mousedown", handleMouseDown);
    };
  }, [ref, data, offset]);

  return (
    <Row
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div>
        <Select onChange={(v) => onFilter(v)}>
          {/* Generate an array from 0 - 32 */}
          {Array.from(Array(32).keys()).map((i) => (
            <Select.Option key={i} value={i}>
              {i}
            </Select.Option>
          ))}
        </Select>
      </div>
      <div style={{ width: "100vw" }}>
        <h2 style={{ marginBottom: "2rem" }}>Image positing test</h2>

        <div>
          <div
            style={{
              position: "relative",
              display: "inline-block",
              width: image.width,
              height: image.height,
            }}
          >
            <img
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              src={"input_image.jpeg"}
              className=""
              alt="test points"
            />
            <canvas
              style={{
                position: "absolute",
                zIndex: 10,
                top: 0,
                left: 0,
              }}
              ref={ref}
              width={image.width}
              height={image.height}
            ></canvas>
          </div>
        </div>
      </div>
    </Row>
  );
}

export default App
