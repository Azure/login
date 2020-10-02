import Utils from '../../../src/PowerShell/Utilities/Utils';

const version: string = '9.0.0';
const moduleName: string = 'az';

afterEach(() => {
    jest.restoreAllMocks();
});

describe('Testing isValidVersion', () => {
    const validVersion: string = '1.2.4';
    const invalidVersion: string = 'a.bcd';

    test('isValidVersion should be true', () => {
        expect(Utils.isValidVersion(validVersion)).toBeTruthy();
    });
    test('isValidVersion should be false', () => {
        expect(Utils.isValidVersion(invalidVersion)).toBeFalsy();
    });
});

describe('Testing setPSModulePath', () => {
    test('PSModulePath with azPSVersion non-empty', async () => {
        await Utils.setPSModulePath(version);
        expect(process.env.PSModulePath).toContain(version);
    });
    test('PSModulePath with azPSVersion empty', async () => {
        const prevPSModulePath = process.env.PSModulePath;
        await Utils.setPSModulePath();
        expect(process.env.PSModulePath).not.toEqual(prevPSModulePath);
    });
});

describe('Testing getLatestAzModule', () => {
    let getLatestAzModuleSpy;

    beforeEach(() => {
        getLatestAzModuleSpy = jest.spyOn(Utils, 'getLatestAzModule');
    });
    test('getLatestAzModule should pass', async () => {
        getLatestAzModuleSpy.mockImplementationOnce((_moduleName: string) => Promise.resolve(version));
        await Utils.getLatestAzModule(moduleName);
        expect(getLatestAzModuleSpy).toHaveBeenCalled();
    });
});
