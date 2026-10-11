import * as fs from 'fs';
import * as path from 'path';
import { AzPSConstants, AzPSUtils } from '../../src/PowerShell/AzPSUtils';

jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    existsSync: jest.fn()
}));

describe('Setting PSModulePath for the GitHub runner', () => {
    const originalEnv = process.env;
    const isWindows = process.platform === 'win32';
    const runnerOS = isWindows ? 'Windows' : 'Linux';
    const azPath = isWindows ? AzPSConstants.DEFAULT_AZ_PATH_ON_WINDOWS : AzPSConstants.DEFAULT_AZ_PATH_ON_LINUX;
    const standardModulePath = isWindows ? 'C:\\Program Files\\PowerShell\\Modules' : '/opt/microsoft/powershell/7/Modules';
    const versionedAzPath = path.join(azPath, 'az_15.6.1');

    beforeEach(() => {
        process.env = { ...originalEnv, RUNNER_OS: runnerOS, RUNNER_ENVIRONMENT: 'github-hosted' };
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    test('prepends the default path when Az.Accounts is not already reachable', async () => {
        process.env.PSModulePath = standardModulePath;

        await AzPSUtils.setPSModulePathForGitHubRunner();

        expect(process.env.PSModulePath.split(path.delimiter)[0]).toBe(azPath);
    });

    test('does not prepend the default path when it is already present', async () => {
        const existing = [standardModulePath, azPath].join(path.delimiter);
        process.env.PSModulePath = existing;

        await AzPSUtils.setPSModulePathForGitHubRunner();

        expect(process.env.PSModulePath).toBe(existing);
    });

    test('does not prepend the default path for a hosted image Az module path', async () => {
        const existing = [standardModulePath, versionedAzPath].join(path.delimiter);
        process.env.PSModulePath = existing;
        jest.mocked(fs.existsSync).mockReturnValue(true);

        await AzPSUtils.setPSModulePathForGitHubRunner();

        expect(process.env.PSModulePath).toBe(existing);
        expect(fs.existsSync).toHaveBeenCalledWith(path.join(versionedAzPath, AzPSConstants.AzAccounts));
    });

    test('prepends the default path when only an unrelated child is present', async () => {
        process.env.PSModulePath = path.join(azPath, 'company-modules');
        jest.mocked(fs.existsSync).mockReturnValue(false);

        await AzPSUtils.setPSModulePathForGitHubRunner();

        expect(process.env.PSModulePath.split(path.delimiter)[0]).toBe(azPath);
    });

    test('preserves the existing behavior on self-hosted runners', async () => {
        process.env.RUNNER_ENVIRONMENT = 'self-hosted';
        process.env.PSModulePath = versionedAzPath;
        jest.mocked(fs.existsSync).mockReturnValue(true);

        await AzPSUtils.setPSModulePathForGitHubRunner();

        expect(process.env.PSModulePath.split(path.delimiter)[0]).toBe(azPath);
        expect(fs.existsSync).not.toHaveBeenCalled();
    });

    test.each(['self-hosted', 'unknown', undefined])('preserves root precedence with RUNNER_ENVIRONMENT=%s', async runnerEnvironment => {
        if (runnerEnvironment === undefined) {
            delete process.env.RUNNER_ENVIRONMENT;
        } else {
            process.env.RUNNER_ENVIRONMENT = runnerEnvironment;
        }
        const existing = [standardModulePath, azPath, versionedAzPath].join(path.delimiter);
        process.env.PSModulePath = existing;
        jest.mocked(fs.existsSync).mockReturnValue(true);

        await AzPSUtils.setPSModulePathForGitHubRunner();

        expect(process.env.PSModulePath).toBe(`${azPath}${path.delimiter}${existing}`);
        expect(fs.existsSync).not.toHaveBeenCalled();
    });

    test.each([
        path.join(`${azPath}-other`, 'az_15.6.1'),
        path.join(azPath, 'nested', 'az_15.6.1')
    ])('prepends the root when %s is outside the direct-child boundary', async existing => {
        process.env.PSModulePath = existing;
        jest.mocked(fs.existsSync).mockReturnValue(true);

        await AzPSUtils.setPSModulePathForGitHubRunner();

        expect(process.env.PSModulePath).toBe(`${azPath}${path.delimiter}${existing}`);
        expect(fs.existsSync).not.toHaveBeenCalled();
    });
});
