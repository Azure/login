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

describe.each([
    {
        runnerOS: 'Linux',
        pathApi: path.posix,
        root: '/usr/share',
        aliases: [
            ['/usr/share/', false],
            ['/usr/share///', false],
            ['/usr//share', false],
            ['/usr/share/az_15.6.1/', true],
            ['/usr//share/az_15.6.1/', true],
            ['/usr/share/az_15.6.1\\nested', true]
        ] as [string, boolean][],
        outside: [
            '/usr/share-other/az_15.6.1',
            '/usr/share/nested/az_15.6.1',
            '/usr/SHARE',
            '/usr/SHARE/az_15.6.1',
            'usr/share',
            '/usr/share/.',
            '/usr/share/..',
            '/usr/share/nested/../az_15.6.1',
            '/usr/share/az_15.6.1/..'
        ]
    },
    {
        runnerOS: 'Windows',
        pathApi: path.win32,
        root: 'C:\\Modules',
        aliases: [
            ['c:\\modules\\', false],
            ['C:/MODULES/', false],
            ['C:\\\\Modules', false],
            ['c:\\modules\\AZ_15.6.1', true],
            ['C:/modules/az_15.6.1/', true],
            ['C:\\Modules\\\\az_15.6.1\\\\', true]
        ] as [string, boolean][],
        outside: [
            'C:\\Modules-other\\az_15.6.1',
            'C:\\Modules\\nested\\az_15.6.1',
            'D:\\Modules\\az_15.6.1',
            '\\\\server\\share\\Modules\\az_15.6.1',
            '\\\\?\\C:\\Modules\\az_15.6.1',
            '\\\\?\\UNC\\server\\share\\Modules\\az_15.6.1',
            'Modules',
            'C:Modules\\az_15.6.1',
            '\\Modules',
            '/Modules',
            '\\Modules\\az_15.6.1',
            'C:\\Modules\\.',
            'C:\\Modules\\..',
            'C:\\Modules\\nested\\..\\az_15.6.1',
            'C:\\Modules\\az_15.6.1\\..'
        ]
    }
])('Hosted module path comparisons with $runnerOS path semantics', ({ runnerOS, pathApi, root, aliases, outside }) => {
    const originalEnv = process.env;
    let utils: typeof AzPSUtils;
    let existsSync: jest.MockedFunction<typeof fs.existsSync>;

    beforeAll(() => {
        jest.resetModules();
        jest.doMock('path', () => ({ ...pathApi }));
        utils = require('../../src/PowerShell/AzPSUtils').AzPSUtils;
        existsSync = require('fs').existsSync;
    });

    beforeEach(() => {
        process.env = { ...originalEnv, RUNNER_OS: runnerOS, RUNNER_ENVIRONMENT: 'github-hosted' };
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    afterAll(() => {
        jest.dontMock('path');
        jest.resetModules();
        process.env = originalEnv;
    });

    test.each(aliases)('preserves the existing path for equivalent entry %s', async (entry, isChild) => {
        const existing = ['unrelated', entry].join(pathApi.delimiter);
        process.env.PSModulePath = existing;
        existsSync.mockReturnValue(true);

        await utils.setPSModulePathForGitHubRunner();

        expect(process.env.PSModulePath).toBe(existing);
        if (isChild) {
            expect(existsSync).toHaveBeenCalledWith(pathApi.join(entry, AzPSConstants.AzAccounts));
        } else {
            expect(existsSync).not.toHaveBeenCalled();
        }
    });

    test.each([...outside, '', '.', '..'])('prepends the root for ineligible entry %s', async entry => {
        process.env.PSModulePath = entry;
        existsSync.mockReturnValue(true);

        await utils.setPSModulePathForGitHubRunner();

        expect(process.env.PSModulePath).toBe(`${root}${pathApi.delimiter}${entry}`);
        expect(existsSync).not.toHaveBeenCalled();
    });

    test.each(['self-hosted', 'unknown', undefined])('preserves root precedence for normalized aliases with RUNNER_ENVIRONMENT=%s', async runnerEnvironment => {
        if (runnerEnvironment === undefined) {
            delete process.env.RUNNER_ENVIRONMENT;
        } else {
            process.env.RUNNER_ENVIRONMENT = runnerEnvironment;
        }
        const existing = aliases.map(([entry]) => entry).join(pathApi.delimiter);
        process.env.PSModulePath = existing;
        existsSync.mockReturnValue(true);

        await utils.setPSModulePathForGitHubRunner();

        expect(process.env.PSModulePath).toBe(`${root}${pathApi.delimiter}${existing}`);
        expect(existsSync).not.toHaveBeenCalled();
    });
});
