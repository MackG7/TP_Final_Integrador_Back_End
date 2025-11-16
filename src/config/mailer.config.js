import { Resend } from "resend";
import ENVIRONMENT from "./environment.config.js";

export const resend = new Resend(ENVIRONMENT.RESEND_API_KEY);
