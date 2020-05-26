import { ServicePrincipalLogin } from '../../src/PowerShell/ServicePrincipalLogin';

jest.mock('../../src/PowerShell/Utilities/Utils');
jest.mock('../../src/PowerShell/Utilities/PowerShellToolRunner');
let spnlogin: ServicePrincipalLogin;

beforeAll(() => {
    spnlogin = new ServicePrincipalLogin("servicePrincipalID", "servicePrinicipalkey", "tenantId", "subscriptionId", "cloud");
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('Testing initialize', () => {
    let initializeSpy;
    
    beforeEach(() => {
        initializeSpy = jest.spyOn(spnlogin, 'initialize');
    });
    test('ServicePrincipalLogin initialize should pass', async () => {
        await spnlogin.initialize();
        expect(initializeSpy).toHaveBeenCalled();
    });
});

describe('Testing login', () => {
    let loginSpy;
    
    beforeEach(() => {
        loginSpy = jest.spyOn(spnlogin, 'login');
    });
    test('ServicePrincipal login should pass', async () => {
        loginSpy.mockImplementationOnce(() => Promise.resolve());
        await spnlogin.login();
        expect(loginSpy).toHaveBeenCalled();
    });
});
