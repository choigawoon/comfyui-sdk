import { CallWrapper } from "../src/call-wrapper";
import { ComfyApi } from "../src/client";
import { PromptBuilder } from "../src/prompt-builder";
import RmbgWorkflow from "./rmbg-workflow.json";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Define a RMBG (Remove Background) workflow task
 */
export const RmbgPrompt = new PromptBuilder(
  RmbgWorkflow,
  ["image", "model", "sensitivity", "process_res", "mask_blur", "mask_offset", "invert_output", "refine_foreground", "background", "background_color"],
  ["images"]
)
  .setInputNode("image", "1.inputs.image")
  .setInputNode("model", "2.inputs.model")
  .setInputNode("sensitivity", "2.inputs.sensitivity")
  .setInputNode("process_res", "2.inputs.process_res")
  .setInputNode("mask_blur", "2.inputs.mask_blur")
  .setInputNode("mask_offset", "2.inputs.mask_offset")
  .setInputNode("invert_output", "2.inputs.invert_output")
  .setInputNode("refine_foreground", "2.inputs.refine_foreground")
  .setInputNode("background", "2.inputs.background")
  .setInputNode("background_color", "2.inputs.background_color")
  .setOutputNode("images", "3");

/**
 * Initialize the client
 */
const api = new ComfyApi("http://localhost:8189").init();

/**
 * Load and encode image to base64
 */
const imagePath = join(__dirname, "casual2.jpg");
const imageBuffer = readFileSync(imagePath);
// const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
const base64Image = `${imageBuffer.toString('base64')}`;

/**
 * Set the workflow's input values
 */
const workflow = RmbgPrompt.input(
  "image",
  base64Image
)
  .input("model", "BEN2")
  .input("sensitivity", 1)
  .input("process_res", 1024)
  .input("mask_blur", 0)
  .input("mask_offset", 0)
  .input("invert_output", false)
  .input("refine_foreground", false)
  .input("background", "Alpha")
  .input("background_color", "#222222");

/**
 * Execute the workflow
 */
new CallWrapper(api, workflow)
  .onPending(() => console.log("RMBG task is pending"))
  .onStart(() => console.log("RMBG task is started"))
  .onPreview((blob) => console.log("Preview:", blob))
  .onFinished((data) => {
    console.log("RMBG completed!");
    console.log("Result images:", data.images?.images.map((img: any) => api.getPathImage(img)));
  })
  .onProgress((info) => console.log("Processing node", info.node, `${info.value}/${info.max}`))
  .onFailed((err) => console.log("RMBG task failed:", err))
  .run();
