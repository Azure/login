import Utils from '../../../src/PowerShell/Utilities/Utils';

afterEach(() => {
    jest.restoreAllMocks();
})

jest.mock('../../../src/PowerShell/Utilities/PowerShellToolRunner');

const validVersion: string = '1.2.4';
const invalidVersion: string = 'a.bcd';

test('isValidVersion should be true', () => {
    expect(Utils.isValidVersion(validVersion)).toBeTruthy();
})

test('isValidVersion should be false', () => {
    expect(Utils.isValidVersion(invalidVersion)).toBeFalsy();
})

test('getLatestModule should pass', async () => {
    expect(await Utils.getLatestModule("Az.Accounts")).toBeCalled();
})
