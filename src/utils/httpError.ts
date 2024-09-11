import createHttpError from "http-errors";
import { Response } from "node-fetch";

const extractTooManyRequestsInfo = (html: string) => {
  const ip = html.match(/IP address: (.+?)<br>/)?.[1] || "";
  const time = html.match(/Time: (.+?)<br>/)?.[1] || "";
  const url = (html.match(/URL: (.+?)<br>/)?.[1] || "").replace(/&amp;/g, "&");
  return { ip, time, url };
};

export const buildError = async (res: Response) => {
  if (res.status === 429) {
    const text = await res.text();
    const { ip, time, url } = extractTooManyRequestsInfo(text);
    const message = `${res.statusText} IP: ${ip}, Time: ${time}, Url: ${url}`;
    return createHttpError(res.status, message);
  } else {
    return createHttpError(res.status, res.statusText);
  }
};
