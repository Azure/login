import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as core from '@actions/core';
import { AzureCliLogin } from '../src/Cli/AzureCliLogin';
import { LoginConfig } from '../src/common/LoginConfig';

jest.mock('@actions/exec');
jest.mock('@actions/io');
jest.mock('@actions/core');

function argsForceJsonOutput(args: string[]): boolean {
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-o' && args[i + 1] === 'json') {
            return true;
        }
        if (args[i] === '--output' && args[i + 1] === 'json') {
            return true;
        }
        if (args[i] === '-o=json' || args[i] === '--output=json') {
            return true;
        }
    }
    return false;
}

describe('AzureCliLogin az version output', () => {
    const originalCoreOutput = process.env.AZURE_CORE_OUTPUT;

    beforeEach(() => {
        process.env.AZURE_CORE_OUTPUT = 'none';
        jest.resetAllMocks();
        (io.which as jest.Mock).mockResolvedValue('/usr/bin/az');
        (core.info as jest.Mock).mockImplementation(() => undefined);
        (core.debug as jest.Mock).mockImplementation(() => undefined);
        (core.warning as jest.Mock).mockImplementation(() => undefined);
        (core.error as jest.Mock).mockImplementation(() => undefined);
    });

    afterEach(() => {
        if (originalCoreOutput === undefined) {
            delete process.env.AZURE_CORE_OUTPUT;
        } else {
            process.env.AZURE_CORE_OUTPUT = originalCoreOutput;
        }
    });

    test('az version is invoked with JSON output so AZURE_CORE_OUTPUT=none still parses', async () => {
        (exec.exec as jest.Mock).mockImplementation(async (_cmd: string, args: string[] = [], options?: any) => {
            if (args[0] === 'version') {
                // Simulate AZURE_CORE_OUTPUT=none: az emits nothing unless JSON is forced.
                const payload = argsForceJsonOutput(args)
                    ? JSON.stringify({ 'azure-cli': '2.70.0' })
                    : '';
                options?.listeners?.stdout?.(Buffer.from(payload));
            }
            return 0;
        });

        const loginConfig = new LoginConfig();
        loginConfig.environment = 'azurecloud';
        loginConfig.authType = LoginConfig.AUTH_TYPE_IDENTITY;
        loginConfig.allowNoSubscriptionsLogin = true;
        loginConfig.servicePrincipalId = '';
        loginConfig.subscriptionId = '';

        const cliLogin = new AzureCliLogin(loginConfig);
        await cliLogin.login();

        const versionCall = (exec.exec as jest.Mock).mock.calls.find(
            (call: any[]) => Array.isArray(call[1]) && call[1][0] === 'version'
        );
        expect(versionCall).toBeDefined();
        expect(argsForceJsonOutput(versionCall[1])).toBe(true);
        expect(cliLogin.azVersion).toBe('2.70.0');
        expect(core.warning).not.toHaveBeenCalledWith('Failed to parse Azure CLI version.');
    });
});
