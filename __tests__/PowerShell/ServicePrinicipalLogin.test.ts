import { ServicePrincipalLogin } from '../../src/PowerShell/ServicePrincipalLogin';
import { LoginConfig } from '../../src/common/LoginConfig';

jest.mock('../../src/PowerShell/Utilities/Utils');
jest.mock('../../src/PowerShell/Utilities/PowerShellToolRunner');
let spnlogin: ServicePrincipalLogin;

beforeAll(() => {
    var loginConfig = new LoginConfig();
    loginConfig.servicePrincipalId = "servicePrincipalID";
    loginConfig.servicePrincipalKey = "servicePrinicipalkey";
    loginConfig.tenantId = "tenantId";
    loginConfig.subscriptionId = "subscriptionId";
    spnlogin = new ServicePrincipalLogin(loginConfig);
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
