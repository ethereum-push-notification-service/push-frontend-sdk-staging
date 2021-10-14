/**
 * @description Contains a set of utilities to abstract several code
 * @version 1.0
*/
import FormatBody from "./parseMessage";
import { ApiNotificationType, ParsedResponseType } from "../types/notification";
const IPFS_BASE_URL = "https://ipfs.io/ipfs/"
/**
 * @description extract the ipfs HASH from the name of an image i.e www.xyz.com/abc/ipfshash.jpg => ipfshash
 * @param notificationBody 
 * @returns the ipfs hash extracted from the image name
 */
export function extractIPFSHashFromImageURL(imageURL:string | undefined){
    if(!imageURL) return "";
    const match = imageURL.match(/(\w+).jpg/);
    return match ? `${IPFS_BASE_URL}${match[1]}` : ""
};

/**
 * @description parse and extract the timestamp from the body of the notification and remove the text from the body
 * @param notificationBody the text which would represent the body of the notification
 * @returns 
 */
export function extractTimeStamp(notificationBody:string):{ notificationBody: string, timeStamp: string} {
    let parsedBody = {
        notificationBody: FormatBody(notificationBody),
        timeStamp: "",
    };
    const matches = notificationBody.match(/\[timestamp:(.*?)\]/);
    if (matches) {
        parsedBody.timeStamp = matches[1];
        const textWithoutTimeStamp = notificationBody.replace(/ *\[timestamp:[^)]*\] */g, "");
        parsedBody.notificationBody = FormatBody(textWithoutTimeStamp);
    }
    return parsedBody;
};

/**
 * @description parse the response gotten from the API
 * @param {ApiNotificationType[]} response 
 * @returns {ParsedResponseType[]}
 */
export function parseApiResponse(response: ApiNotificationType[]):ParsedResponseType[]{
    return response.map((apiNotification: ApiNotificationType) => {
        const {
            payload: {
                data : {
                    acta: cta = "",
                    amsg: bigMessage = "",
                    asub = "",
                    icon = "",
                    url = "",
                    sid = "",
                    app = "",
                    aimg = ""
                },
                notification: {
                    body = "",
                    title = ""
                }
            }
        } = apiNotification;

        return {
            cta,
            title: asub || title,
            message: bigMessage || body,
            icon,
            url,
            sid,
            app,
            image: aimg
        };
    });
}


export default {
    extractTimeStamp,
    parseApiResponse
}