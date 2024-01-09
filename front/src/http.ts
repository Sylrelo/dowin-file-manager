import ky, { HTTPError, type KyResponse } from "ky"
import { currentUser } from "./stores/global";

export class Http {
    // static HOST = window.location.protocol + "//" + window.location.host + "/api/"
    // static HOST = "http://localhost:8080/api"

    static HOST = (() => {
        const loc = window.location;


        if (loc.port === "8000")
            return "http://" + loc.hostname + ":3000/api/"

        return window.location.protocol + "//" + window.location.host + "/api/"
    })();

    static get HEADERS() {
        const bearer = localStorage.getItem("ab");
        let headers: { [key: string]: string } = {}

        if (null != bearer) {
            headers['Authorization'] = `Bearer ${bearer}`;
        }

        return headers;
    };

    static parseResponse = async (response: KyResponse): Promise<any> => {
        const contentType = response.headers.get('Content-Type');

        if (contentType?.includes("json")) {
            return await response.json();
        }

        return await response.text();
    }

    private static make = async (method: "get" | "post" | "delete" | "put", endpoint: string, data?: any) => {
        try {
            let body, json = undefined;

            if (data instanceof FormData) {
                let frm = new FormData();
                body = frm;
            } else {
                json = data;
            }

            const response = await ky(this.HOST + endpoint, { method, json, body, headers: this.HEADERS, timeout: 30000 });

            return this.parseResponse(response);

        } catch (err: any) {
            if (err.response.status === 401) {
                localStorage.removeItem("ab");
                currentUser.set(null)
            }
            throw new Error(err)
        }

    }

    static get = async (endpoint: string): Promise<any> => {
        return this.make("get", endpoint);
    }

    static delete = async (endpoint: string): Promise<any> => {
        return this.make("delete", endpoint);
    }

    static postAnonymous = async (endpoint: string, data: any): Promise<any> => {
        const response = await ky.post(this.HOST + endpoint, {
            json: data,
        })

        return await response.text();
    }


    static put = async (endpoint: string, id: string, data: any): Promise<any> => {
        return this.make("put", endpoint + "/" + id, data);
    }

    static post = async (endpoint: string, data: any): Promise<any> => {
        return this.make("post", endpoint, data);
    }

    static upload_file_xhr = async (
        path: string,
        filename: string,
        offset: number,
        chunk: Blob,
        onUploadProgress: undefined | ((loaded: number) => void) = undefined

    ): Promise<any> => {
        const xhr = new XMLHttpRequest();

        let frm = new FormData();
        frm.append("dst", path);
        frm.append("filename", filename);
        frm.append("offset", offset.toString());
        frm.append("file", chunk);

        xhr.open("POST", this.HOST + "upload")

        const headers = this.HEADERS;

        xhr.setRequestHeader('Authorization', headers['Authorization']);

        if (onUploadProgress != null) {
            xhr.upload.onprogress = (event) => {
                onUploadProgress(event.loaded)
            }
        }

        return new Promise((resolve, reject) => {
            xhr.onloadend = () => {
                resolve(xhr.responseText);
            }
            xhr.onerror = (evt) => {
                reject(evt);
            }

            xhr.send(frm);

        })
    }

    static upload_file = async (path: string, filename: string, offset: number, chunk: Blob): Promise<any> => {

        let frm = new FormData();
        frm.append("path", path);
        frm.append("filename", filename);
        frm.append("offset", offset.toString());
        frm.append("file", chunk);

        const response = await ky.post(this.HOST + "upload", {
            body: frm,
            timeout: 30000,
        })

        return await response.text();
    }
}