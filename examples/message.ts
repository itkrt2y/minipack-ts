import { name } from "./name";
import * as dayjs from "dayjs";

// @ts-ignore
export default `Hello ${name}! [${dayjs().format("YYYY/MM/DD HH:mm")}]`;
