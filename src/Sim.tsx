import React, { useEffect } from 'react';
import Matter, { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint } from 'matter-js';

const Sim: React.FC = () => {
    useEffect(() => {
        const simulationElement = document.getElementById('simulation');
        const existingCanvas = simulationElement?.querySelector('canvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }

        const engine = Engine.create();
        const world = engine.world;

        const renderer = Render.create({
            element: document.getElementById('simulation')!,
            engine: engine,
            options: {
                width: window.innerWidth,
                height:  window.innerHeight,
                wireframes: false
            }
        });

        // const ball = Bodies.circle(400, 100, 30, { restitution: 0.8});
        const floor = Bodies.rectangle(innerWidth / 2, innerHeight, innerWidth, 40, { isStatic: true });
        const leftWall = Bodies.rectangle(0, innerHeight / 2, 40, innerHeight, { isStatic: true });
        const rightWall = Bodies.rectangle(innerWidth, innerHeight / 2, 40, innerHeight, { isStatic: true });
        
        World.add(world, [floor, leftWall, rightWall]);

        const runner = Runner.create();
        Runner.run(runner, engine);
        Render.run(renderer);

        const mouse = Mouse.create(renderer.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                render: { visible: false },  // Disable rendering of the constraint
                stiffness: 0.1,  // Lower stiffness for minimal influence on drag
                damping: 0.1,  // Allow for small "snapping" behavior if needed
            }
        });



        World.add(world, mouseConstraint);

        const handleClick = (event: any) => {
            const pos = event.mouse.position;
            const clickedBall = world.bodies.find((body) => {
                return Matter.Bounds.contains(body.bounds, pos);
            });

            if (clickedBall) {
                if (!clickedBall.circleRadius) return;
                console.log('ball clicked');
                World.remove(world, clickedBall);

            } else {
                console.log('background clicked', pos.x, pos.y);
                const newBall = Bodies.circle(pos.x, pos.y, 30, { restitution: 0.8 });
                World.add(world, newBall);
            }
        }

        Matter.Events.on(mouseConstraint, 'mousedown', handleClick);

        const addBalls = async () => {
            for (let j = 0; j < (innerHeight / (innerWidth / 30)) + 3; j++) {
                for (let i = 1; i < 30; i++) {
                    const ball = Bodies.circle(i * innerWidth / 30, -200, innerWidth / 60, { restitution: 0.5, friction: 0.1, density: 0.8 - 0.01 * j, render: { fillStyle: 'red'}});
                    World.add(world, ball);
                }
                await new Promise(resolve => setTimeout(resolve, 400)); // 1 second delay
            }
        };

        addBalls();

        return () => {
            Render.stop(renderer);
            Runner.stop(runner);
            Engine.clear(engine);
            World.clear(world, false);
            mouseConstraint.mouse.element.removeEventListener('mousedown', handleClick);
        };
    }, []);



    return (
        <div id="simulation"></div>
    )
}

export default Sim;