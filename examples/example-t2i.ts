import { CallWrapper } from "../src/call-wrapper";
import { ComfyApi } from "../src/client";
import { PromptBuilder } from "../src/prompt-builder";
import { seed } from "../src/tools";
import { TSamplerName, TSchedulerName } from "../src/types/sampler";
import ExampleTxt2ImgWorkflow from "./example-txt2img-workflow.json";

/**
 * Define a T2I (text to image) workflow task
 */
export const Txt2ImgPrompt = new PromptBuilder(
  ExampleTxt2ImgWorkflow,
  ["positive", "negative", "checkpoint", "seed", "batch", "step", "cfg", "sampler", "sheduler", "width", "height"],
  ["images"]
)
  .setInputNode("checkpoint", "4.inputs.ckpt_name")
  .setInputNode("seed", "3.inputs.seed")
  .setInputNode("batch", "5.inputs.batch_size")
  .setInputNode("negative", "7.inputs.text")
  .setInputNode("positive", "6.inputs.text")
  .setInputNode("cfg", "3.inputs.cfg")
  .setInputNode("sampler", "3.inputs.sampler_name")
  .setInputNode("sheduler", "3.inputs.scheduler")
  .setInputNode("step", "3.inputs.steps")
  .setInputNode("width", "5.inputs.width")
  .setInputNode("height", "5.inputs.height")
  .setOutputNode("images", "9");

/**
 * Initialize the client
 */
const api = new ComfyApi("http://localhost:8189").init();

/**
 * Set the workflow's input values
 */
const workflow = Txt2ImgPrompt.input(
  "checkpoint",
  "xl_base/sd_xl_base_1.0.safetensors",
  /**
   * Use the client's osType to encode the path
   */
  api.osType
)
  .input("seed", seed())
  .input("step", 6)
  .input("cfg", 1)
  .input<TSamplerName>("sampler", "dpmpp_2m_sde_gpu")
  .input<TSchedulerName>("sheduler", "sgm_uniform")
  .input("width", 1024)
  .input("height", 1024)
  .input("batch", 1)
  .input("positive", "A picture of cute dog on the street");

/**
 * Execute the workflow
 */
new CallWrapper(api, workflow)
  .onPending(() => console.log("Task is pending"))
  .onStart(() => console.log("Task is started"))
  .onPreview((blob) => console.log(blob))
  .onFinished((data) => {
    console.log(data.images?.images.map((img: any) => api.getPathImage(img)));
  })
  .onProgress((info) => console.log("Processing node", info.node, `${info.value}/${info.max}`))
  .onFailed((err) => console.log("Task is failed", err))
  .run();
