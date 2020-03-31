import { ServicePrincipalLogin } from '../../src/PowerShell/ServicePrincipalLogin';

afterEach(() => {
    jest.restoreAllMocks();
})

jest.mock('@actions/exec');
jest.mock('../../src/PowerShell/Utilities/Utils');
const spnlogin:ServicePrincipalLogin = new ServicePrincipalLogin("foo", "bar", "baz", "zzz");

test('initialize should pass', async () => {
    expect(await spnlogin.initialize()).toBeUndefined();
})

test('login should pass', async () => {
    jest.mock('../../src/PowerShell/Utilities/PowerShellToolRunner');
    jest.mock('../../src/PowerShell/Utilities/ScriptBuilder');
    expect(await spnlogin.login()).toBeUndefined();
})
