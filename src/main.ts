import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as io from '@actions/io';

import { FormatType, SecretParser } from 'actions-secret-parser';

var azPath: string;

async function main() {
    try{
        azPath = await io.which("az", true);
        await executeAzCliCommand("--version");

        let creds = core.getInput('creds', { required: true });
        let secrets = new SecretParser(creds, FormatType.JSON);
        let servicePrincipalId = secrets.getSecret("$.clientId", false);
        let servicePrincipalKey = secrets.getSecret("$.clientSecret", true);
        let tenantId = secrets.getSecret("$.tenantId", false);
        let subscriptionId = secrets.getSecret("$.subscriptionId", false);
        if (!servicePrincipalId || !servicePrincipalKey || !tenantId || !subscriptionId) {
            throw new Error("Not all values are present in the creds object. Ensure clientId, clientSecret, tenantId and subscriptionId are supplied");
        }

        await executeAzCliCommand(`login --service-principal -u "${servicePrincipalId}" -p "${servicePrincipalKey}" --tenant "${tenantId}"`);
        await executeAzCliCommand(`account set --subscription "${subscriptionId}"`);
        console.log("Login successful.");    
    } catch (error) {
        console.log("Login failed. Please check the credentials.");
        core.setFailed(error);
    }
}

async function executeAzCliCommand(command: string) {
    let stderr = '';
  
    let code = await exec.exec(`"${azPath}" ${command}`, [],  {
        failOnStdErr: true,
        listeners: {
            stderr: (data: Buffer) => {
              stderr += data.toString();
            }
        }
    }); 

    if(code != 0) {
        throw new Error(stderr);
    }
}


main();