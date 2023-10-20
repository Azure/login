import * as os from 'os';

import { AzPSLogin } from '../../src/PowerShell/AzPSLogin';
import { LoginConfig } from '../../src/common/LoginConfig';
import AzPSConstants from '../../src/PowerShell/AzPSConstants';

let azpsLogin: AzPSLogin;
jest.setTimeout(30000);

beforeAll(() => {
    var loginConfig = new LoginConfig();
    loginConfig.servicePrincipalId = "servicePrincipalID";
    loginConfig.servicePrincipalSecret = "servicePrincipalSecret";
    loginConfig.tenantId = "tenantId";
    loginConfig.subscriptionId = "subscriptionId";
    azpsLogin = new AzPSLogin(loginConfig);
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('Testing login', () => {
    let loginSpy;
    
    beforeEach(() => {
        loginSpy = jest.spyOn(azpsLogin, 'login');
    });

    test('ServicePrincipal login should pass', async () => {
        loginSpy.mockImplementationOnce(() => Promise.resolve());
        await azpsLogin.login();
        expect(loginSpy).toHaveBeenCalled();
    });
});

describe('Testing set module path', () => {
    test('setDefaultPSModulePath should work', () => {
        azpsLogin.setPSModulePathForGitHubRunner();
        const runner: string = process.env.RUNNER_OS || os.type();
        if(runner.toLowerCase() === "linux"){
            expect(process.env.PSModulePath).toContain(AzPSConstants.DEFAULT_AZ_PATH_ON_LINUX);
        }
        if(runner.toLowerCase().startsWith("windows")){
            expect(process.env.PSModulePath).toContain(AzPSConstants.DEFAULT_AZ_PATH_ON_WINDOWS);
        }
    });

});

describe('Testing runPSScript', () => {
    test('Get PowerShell Version', async () => {
        let script = `try {
            $ErrorActionPreference = "Stop"
            $WarningPreference = "SilentlyContinue"
            $output = @{}
            $output['Success'] = $true
            $output['Result'] = $PSVersionTable.PSVersion.ToString()
        }
        catch {
            $output['Success'] = $false
            $output['Error'] = $_.exception.Message
        }
        return ConvertTo-Json $output`;

        let psVersion: string = await AzPSLogin.runPSScript(script);
        expect(psVersion === null).toBeFalsy();
    });

    test('Get PowerShell Version with Wrong Name', async () => {
        let script = `try {
            $ErrorActionPreference = "Stop"
            $WarningPreference = "SilentlyContinue"
            $output = @{}
            $output['Success'] = $true
            $output['Result'] = $PSVersionTableWrongName.PSVersion.ToString()
        }
        catch {
            $output['Success'] = $false
            $output['Error'] = $_.exception.Message
        }
        return ConvertTo-Json $output`;

        try{
            await AzPSLogin.runPSScript(script);
            throw new Error("The last step should fail.");
        }catch(error){
            expect(error.message.includes("Azure PowerShell login failed with error: You cannot call a method on a null-valued expression.")).toBeTruthy();
        }
    });

});