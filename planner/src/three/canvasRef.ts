/** @author Erbol king */
/** The live WebGL canvas, shared with the "Снимок" button without pulling three.js into the shell bundle. */
export const canvasRef: { current: HTMLCanvasElement | null } = { current: null };
