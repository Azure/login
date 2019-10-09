var core = require('@actions/core');
var jp = require('jsonpath');
var xpath = require('xpath');
var domParser = require('xmldom').DOMParser;

export enum FormatType {
    "JSON",
    "XML"
}

/**
 * Takes content as string and format type (xml, json).
 * Exposes getSecret method to get value of specific secret in object and set it as secret.
 */
export class SecretParser {
    private dom: string;
    private contentType: FormatType;

    constructor(content: string, contentType: FormatType) {
        switch(contentType) {
            case FormatType.JSON:
                try {
                    this.dom = JSON.parse(content);
                } 
                catch (ex) {
                    throw new Error('Content is not a valid JSON object');
                }
                break;
            case FormatType.XML:
                try {
                    this.dom = new domParser().parseFromString(content);
                }
                catch (ex) {
                    throw new Error('Content is not a valid XML object');
                }
                break;
            default: 
                throw new Error(`Given format: ${contentType} is not supported. Valid options are JSON, XML.`)
        }
        this.contentType = contentType;
    }

    /**
     * 
     * @param key jsonpath or xpath depending on content type
     * @param isSecret should the value parsed be a secret. Deafult: true
     * @param variableName optional. If provided value will be exported with this variable name
     * @returns a string value or empty string if key not found
     */
    public getSecret(key: string, isSecret: boolean = true, variableName?: string): string {
        let value: string = "";
        switch(this.contentType) {
            case FormatType.JSON:
                value = this.extractJsonPath(key, isSecret, variableName);
                break;
            case FormatType.XML:
                value = this.extractXmlPath(key, isSecret, variableName);
                break;
        }

        return value;
    }
    
    private extractJsonPath(key: string, isSecret: boolean = false, variableName?: string): string {
        let value = jp.query(this.dom, key);
        if(value.length == 0) {
            core.debug("Cannot find key: " + key)
            return "";
        }
        else if(value.length > 1) {
            core.debug("Multiple values found for key: " + key + ". Please give jsonPath which points to a single value.");
            return "";
        }
        return this.handleSecret(key, value[0], isSecret, variableName);
    }
    
    private extractXmlPath(key: string, isSecret: boolean = false, variableName?: string): string {
        let value = xpath.select("string(" + key + ")", this.dom);
        return this.handleSecret(key, value, isSecret, variableName);
    }

    private handleSecret(key: string, value: string, isSecret: boolean, variableName: string): string {
        if(!!value) {
            if(isSecret) {
                core.setSecret(value);
            }
            if(!!variableName) {
                core.exportVariable(variableName, value);
            }
            return value;
        }
        else {
            core.debug("Cannot find key: " + key);
            return "";
        }
    }
}
