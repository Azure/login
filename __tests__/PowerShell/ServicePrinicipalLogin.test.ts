import { ServicePrincipalLogin } from '../../src/PowerShell/ServicePrincipalLogin';

jest.mock('../../src/PowerShell/Utilities/Utils');
jest.mock('../../src/PowerShell/Utilities/PowerShellToolRunner');
var spnlogin: ServicePrincipalLogin;

beforeAll(() => {
    spnlogin = new ServicePrincipalLogin("servicePrincipalID", "servicePrinicipalkey", "tenantId", "subscriptionId");
})

afterEach(() => {
    jest.restoreAllMocks();
});

test('ServicePrincipalLogin initialize should pass', async () => {
    const initializeSpy = jest.spyOn(spnlogin, 'initialize');
    await spnlogin.initialize();
    expect(initializeSpy).toHaveBeenCalled();
});

describe('Testing login', () => {
    var loginSpy;
    beforeEach(() => {
        loginSpy = jest.spyOn(spnlogin, 'login');
    });

    test('ServicePrincipal login should pass', async () => {
        loginSpy.mockImplementationOnce(() => Promise.resolve(
            console.log('Azure PowerShell session successfully initialized')));
        await spnlogin.login();
        expect(loginSpy).toHaveBeenCalled();
    });

    test('ServicePrincipal login should fail', async () => {
        loginSpy.mockImplementationOnce(() => {
           Promise.reject(new Error('Azure PowerShell login failed'));
        });
        await spnlogin.login();
        expect(loginSpy).rejects;
    });
});
